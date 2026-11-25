"""Independent, metadata-preserving macOS/APFS copies; strict sharing by default."""
from pathlib import Path
import argparse, ctypes, errno, hashlib, json, os, shutil, stat, sys, tempfile, uuid

NOFOLLOW = (1 << 18) | (1 << 19)
IMMUTABLE = 0x2 | 0x4 | 0x20000 | 0x40000
DATALESS = 0x40000000
UNAVAILABLE = {errno.EXDEV, errno.ENOTSUP, errno.EINVAL, errno.ENOSYS}
lib = ctypes.CDLL(None, use_errno=True) if sys.platform == 'darwin' else None
if lib:
    for name, args in {
        'clonefile': [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int],
        'copyfile': [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_void_p, ctypes.c_uint32],
        'renamex_np': [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_uint32],
        'getattrlist': [ctypes.c_char_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_ulong],
        'setattrlist': [ctypes.c_char_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_ulong],
        'listxattr': [ctypes.c_char_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_int],
        'getxattr': [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_uint32, ctypes.c_int],
        'setxattr': [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_uint32, ctypes.c_int],
        'removexattr': [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int],
        'lchmod': [ctypes.c_char_p, ctypes.c_uint32],
        'chflags': [ctypes.c_char_p, ctypes.c_uint32],
    }.items():
        getattr(lib, name).argtypes = args
    lib.listxattr.restype = lib.getxattr.restype = ctypes.c_ssize_t

class SharingUnavailable(OSError):
    pass

class SourceChanged(OSError):
    pass

class AttrList(ctypes.Structure):
    _fields_ = [('count', ctypes.c_uint16), ('reserved', ctypes.c_uint16),
                ('common', ctypes.c_uint32), ('volume', ctypes.c_uint32),
                ('directory', ctypes.c_uint32), ('file', ctypes.c_uint32), ('fork', ctypes.c_uint32)]

def checked(result, path):
    if result < 0:
        code = ctypes.get_errno()
        raise OSError(code, os.strerror(code), str(path))
    return result

def identity(p):
    s = p.lstat()
    return (s.st_dev, s.st_ino, s.st_size, s.st_mode, s.st_mtime_ns, s.st_ctime_ns,
            s.st_nlink, s.st_uid, s.st_gid, s.st_flags)

def sha(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for block in iter(lambda: f.read(4 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def xattrs(p):
    n = checked(lib.listxattr(os.fsencode(p), None, 0, 1), p)
    names = ctypes.create_string_buffer(n or 1)
    if checked(lib.listxattr(os.fsencode(p), names, n, 1), p) != n:
        raise SourceChanged('Extended attributes changed: ' + str(p))
    values = {}
    for name in names.raw[:n].split(b'\0'):
        if not name:
            continue
        size = checked(lib.getxattr(os.fsencode(p), name, None, 0, 0, 1), p)
        value = ctypes.create_string_buffer(size or 1)
        if checked(lib.getxattr(os.fsencode(p), name, value, size, 0, 1), p) != size:
            raise SourceChanged('Extended attribute changed: ' + str(p))
        values[name] = value.raw[:size]
    return values

def birth(p):
    attrs, data = AttrList(5, 0, 0x200, 0, 0, 0, 0), ctypes.create_string_buffer(20)
    checked(lib.getattrlist(os.fsencode(p), ctypes.byref(attrs), data, 20, 1), p)
    if int.from_bytes(data.raw[:4], 'little') != 20:
        raise OSError('Unexpected creation-date structure')
    return data.raw[4:20]

def metadata(p):
    s = p.lstat()
    acl = __import__('subprocess').check_output(['/bin/ls', '-lde', str(p)], text=True).splitlines()[1:]
    return (s.st_mode, s.st_uid, s.st_gid, s.st_mtime_ns, s.st_flags, birth(p), xattrs(p), acl)

def apply_metadata(source, target, expected):
    # Avoid rewriting inherited resource forks: that would defeat sharing for compressed files.
    current_meta = metadata(target)
    if current_meta[1:3] != expected[1:3]:
        os.chown(target, expected[1], expected[2], follow_symlinks=False)
    if current_meta[7] != expected[7]:
        checked(lib.copyfile(os.fsencode(source), os.fsencode(target), None, 1 | NOFOLLOW), target)
    if target.lstat().st_mode != expected[0]:
        if stat.S_ISLNK(expected[0]):
            checked(lib.lchmod(os.fsencode(target), stat.S_IMODE(expected[0])), target)
        else:
            os.chmod(target, stat.S_IMODE(expected[0]), follow_symlinks=False)
    wanted = expected[6]
    current = xattrs(target)
    for name in current.keys() - wanted.keys():
        checked(lib.removexattr(os.fsencode(target), name, 1), target)
    for name, value in wanted.items():
        if current.get(name) != value:
            data = ctypes.create_string_buffer(value)
            checked(lib.setxattr(os.fsencode(target), name, data, len(value), 0, 1), target)
    if target.lstat().st_mtime_ns != expected[3]:
        os.utime(target, ns=(source.lstat().st_atime_ns, expected[3]), follow_symlinks=False)
    if birth(target) != expected[5]:
        attrs = AttrList(5, 0, 0x200, 0, 0, 0, 0)
        data = ctypes.create_string_buffer(expected[5], 16)
        checked(lib.setattrlist(os.fsencode(target), ctypes.byref(attrs), data, 16, 1), target)
    if target.lstat().st_flags != expected[4]:
        checked(lib.chflags(os.fsencode(target), expected[4]), target)
    if metadata(target) != expected:
        raise OSError('Metadata could not be preserved exactly: ' + str(source))

def clone(source, destination):
    if not lib:
        raise SharingUnavailable('This helper requires macOS; no full-copy fallback was made.')
    result = lib.clonefile(os.fsencode(source), os.fsencode(destination), 4)  # CLONE_ACL
    if result:
        code = ctypes.get_errno()
        if code in UNAVAILABLE:
            raise SharingUnavailable(code, 'Storage sharing unavailable; no silent full-copy fallback', str(source))
        raise OSError(code, os.strerror(code), str(source))

def publish(temp, target):
    # RENAME_EXCL publishes atomically without replacing even a dangling destination link.
    checked(lib.renamex_np(os.fsencode(temp), os.fsencode(target), 4), target)

def remove_unpublished_tree(stage, expected_inode):
    if stage.is_symlink() or stage.lstat().st_ino != expected_inode:
        raise OSError('Unpublished staging path changed; left untouched: ' + str(stage))
    # Read-only metadata is restored bottom-up during copying. Only our unpublished
    # directories receive temporary write permission for cleanup after a failed copy.
    for base, dirs, _ in os.walk(stage, followlinks=False):
        p = Path(base)
        os.chmod(p, stat.S_IMODE(p.stat().st_mode) | stat.S_IWUSR | stat.S_IXUSR)
        dirs[:] = [name for name in dirs if not (p / name).is_symlink()]
    shutil.rmtree(stage)

class Copier:
    def __init__(self, *, verify=True, allow_full_copy=False):
        if not lib:
            raise SharingUnavailable('A macOS metadata-preserving backend is required.')
        self.verify = verify
        self.allow_full_copy = allow_full_copy
        self.report = {'cloned_files': 0, 'full_copies': 0, 'symlinks': 0,
                       'internal_hardlinks_preserved': 0, 'links_rebased': 0, 'directories': 0}
        self.sources = {}
        self.hardlinks = {}

    def remember(self, source):
        before = identity(source)
        if before[-1] & (DATALESS | IMMUTABLE):
            raise OSError('Cloud-only or immutable/append-only source needs a reviewed copy path: ' + str(source))
        self.sources[source] = before
        return before

    def stable(self):
        for source, before in self.sources.items():
            if identity(source) != before:
                raise SourceChanged('Source changed during copy: ' + str(source))

    def link_value(self, source, final, tree=None):
        raw = os.readlink(source)
        try:
            resolved = (source.parent / raw).resolve(strict=False)
        except (OSError, RuntimeError):
            return raw  # Preserve an existing cycle rather than traversing or repairing it.
        if tree:
            old_root, new_root = tree
            if resolved.is_relative_to(old_root):
                if os.path.isabs(raw):
                    return os.path.relpath(new_root / resolved.relative_to(old_root), final.parent)
                return raw
        if not os.path.isabs(raw):
            return os.path.relpath(resolved, final.parent)
        return raw

    def file(self, source, target, *, final=None, tree=None):
        source, target = Path(os.path.abspath(source)), Path(os.path.abspath(target))
        target = target.parent.resolve(strict=True) / target.name
        final = final or target
        if os.path.lexists(target):
            raise FileExistsError('Destination already exists; choose a new version: ' + str(target))
        if not target.parent.is_dir():
            raise FileNotFoundError('Destination parent must exist: ' + str(target.parent))
        before = self.remember(source)
        expected = metadata(source)
        mode = before[3]
        if not (stat.S_ISREG(mode) or stat.S_ISLNK(mode)):
            raise OSError('Only regular files and symbolic links can be copied here: ' + str(source))
        key = before[:2]
        if tree and stat.S_ISREG(mode) and before[6] > 1 and key in self.hardlinks:
            os.link(self.hardlinks[key], target)
            self.report['internal_hardlinks_preserved'] += 1
            return str(target)
        temp = target.parent / ('.cow-copy-' + uuid.uuid4().hex)
        try:
            if stat.S_ISLNK(mode):
                raw = os.readlink(source)
                new = self.link_value(source, final, tree)
                os.symlink(new, temp)
                self.report['symlinks'] += 1
                self.report['links_rebased'] += new != raw
            else:
                try:
                    clone(source, temp)
                    self.report['cloned_files'] += 1
                except SharingUnavailable:
                    if not self.allow_full_copy:
                        raise
                    if shutil.disk_usage(target.parent).free < before[2] + 1024**3:
                        raise OSError(errno.ENOSPC, 'Full-copy fallback would consume the safety reserve')
                    shutil.copyfile(source, temp, follow_symlinks=False)
                    self.report['full_copies'] += 1
                if self.verify and sha(source) != sha(temp):
                    raise OSError('Content verification failed: ' + str(source))
            apply_metadata(source, temp, expected)
            if identity(source) != before:
                raise SourceChanged('Source changed before publication: ' + str(source))
            if stat.S_ISREG(mode) and temp.stat().st_ino == source.stat().st_ino:
                raise OSError('Copy must have an inode independent of the source')
            publish(temp, target)
            if tree and before[6] > 1 and stat.S_ISREG(mode):
                self.hardlinks[key] = target
            return str(target)
        finally:
            if os.path.lexists(temp):
                temp.unlink()

    def tree(self, source, target):
        source, target = Path(source).resolve(strict=True), Path(os.path.abspath(target))
        target = target.parent.resolve(strict=True) / target.name
        if not source.is_dir():
            raise NotADirectoryError(source)
        if target.resolve(strict=False).is_relative_to(source):
            raise ValueError('Destination cannot be inside the source tree')
        if os.path.lexists(target):
            raise FileExistsError('Snapshot destination exists; choose a new version: ' + str(target))
        if not target.parent.is_dir():
            raise FileNotFoundError('Destination parent must exist')
        stage = Path(tempfile.mkdtemp(prefix='.cow-tree-', dir=target.parent))
        stage_inode = stage.stat().st_ino

        def visit(old, new, final):
            self.remember(old)
            expected = metadata(old)
            for item in sorted(old.iterdir()):
                dest, visible = new / item.name, final / item.name
                if item.is_symlink():
                    self.file(item, dest, final=visible, tree=(source, target))
                elif item.is_dir():
                    dest.mkdir()
                    visit(item, dest, visible)
                else:
                    self.file(item, dest, final=visible, tree=(source, target))
            apply_metadata(old, new, expected)
            self.report['directories'] += 1

        try:
            visit(source, stage, target)
            self.stable()
            publish(stage, target)
            return str(target)
        finally:
            if stage.exists():
                remove_unpublished_tree(stage, stage_inode)

def copy2(source, target, *, follow_symlinks=False, verify=True, allow_full_copy=False):
    source = Path(source)
    if follow_symlinks:
        source = source.resolve(strict=True)
    target = Path(target)
    if target.is_dir() and not target.is_symlink():
        target = target / source.name
    return Copier(verify=verify, allow_full_copy=allow_full_copy).file(source, target)

def copytree(source, target, *, verify=True, allow_full_copy=False):
    return Copier(verify=verify, allow_full_copy=allow_full_copy).tree(source, target)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--allow-full-copy', action='store_true', help='Explicitly permit a reported full copy if cloning is unsupported')
    parser.add_argument('--no-hash', action='store_true', help='Skip full byte hashing; source stability and metadata checks still run')
    args = parser.parse_args()
    copier = Copier(verify=not args.no_hash, allow_full_copy=args.allow_full_copy)
    try:
        if args.source.is_dir() and not args.source.is_symlink():
            copier.tree(args.source, args.destination)
        else:
            copier.file(args.source, args.destination)
    except (OSError, ValueError) as ex:
        parser.exit(1, str(ex) + '\n')
    print(json.dumps({'source': str(args.source), 'destination': str(args.destination), **copier.report}, indent=2))

if __name__ == '__main__':
    main()
