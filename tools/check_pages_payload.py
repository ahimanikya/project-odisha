#!/usr/bin/env python3
"""Read-only acceptance check for the directory uploaded to GitHub Pages."""
import argparse
import json
import os
from pathlib import Path
import stat
import sys

# Deliberately conservative decimal interpretation of Pages' published 1 GB limit.
MAX_BYTES = 1_000_000_000


class PayloadError(ValueError):
    pass


def inspect_payload(root):
    root = Path(root)
    try:
        mode = root.lstat().st_mode
    except FileNotFoundError as error:
        raise PayloadError('Payload directory is missing') from error
    if not stat.S_ISDIR(mode):
        raise PayloadError('Payload root must be a real directory, not a link')
    files = []
    directories = 0
    total = 0
    pending = [root]
    while pending:
        directory = pending.pop()
        for entry in sorted(os.scandir(directory), key=lambda item: item.name):
            info = entry.stat(follow_symlinks=False)
            relative = Path(entry.path).relative_to(root).as_posix()
            if stat.S_ISLNK(info.st_mode):
                raise PayloadError('Symbolic link is not allowed: ' + relative)
            if stat.S_ISDIR(info.st_mode):
                directories += 1
                pending.append(Path(entry.path))
            elif stat.S_ISREG(info.st_mode):
                if info.st_nlink != 1:
                    raise PayloadError('Hard-linked file is not allowed: ' + relative)
                total += info.st_size
                files.append({'path': relative, 'bytes': info.st_size})
                if total >= MAX_BYTES:
                    raise PayloadError('Payload reaches or exceeds the conservative 1 GB limit')
            else:
                raise PayloadError('Only regular files and directories are allowed: ' + relative)
    index = next((item for item in files if item['path'] == 'index.html'), None)
    if index is None or index['bytes'] == 0:
        raise PayloadError('A nonempty root index.html is required')
    return {
        'status': 'PASS',
        'regular_file_bytes': total,
        'regular_files': len(files),
        'directories': directories,
        'exclusive_byte_limit': MAX_BYTES,
        'symbolic_links': 0,
        'hard_linked_files': 0,
        'special_files': 0,
        'index_html_bytes': index['bytes'],
        'largest_files': sorted(files, key=lambda item: (-item['bytes'], item['path']))[:10],
        'scope': 'Stat-only directory acceptance, not archive digest or deployment success',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    args = parser.parse_args()
    try:
        result = inspect_payload(args.directory)
    except (PayloadError, OSError) as error:
        print(json.dumps({'status': 'FAIL', 'error': str(error)}, ensure_ascii=True))
        return 1
    print(json.dumps(result, ensure_ascii=True, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
