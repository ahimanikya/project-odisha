"""Validate a staged edition before replacing the last good preview.

Canonical source files and the separate full-draft output are never modified.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote
import hashlib
import json
import re
import shutil
import tempfile

SITE = Path(__file__).resolve().parents[1]
OUT = SITE / '.coast-staging'
if OUT.is_symlink() or not OUT.is_dir():
    raise SystemExit('Expected a generated .coast-staging directory')
config = json.loads((SITE / 'editions/coast.json').read_text())

def unique_strings(key, pattern):
    values = config.get(key)
    if not isinstance(values, list) or any(not isinstance(v, str) or not re.fullmatch(pattern, v) for v in values):
        raise SystemExit('Invalid edition configuration: ' + key)
    if len(values) != len(set(values)):
        raise SystemExit('Duplicate edition configuration values: ' + key)
    return values

routes = unique_strings('routes', r'/(?:[a-z0-9-]+/)*(?:[a-z0-9-]+\.html)?')
if '/' not in routes:
    raise SystemExit('Edition must include its home route')
journey_ids = unique_strings('journey_ids', r'[a-z0-9][a-z0-9:/_-]{0,159}')
starter_ids = unique_strings('starter_ids', r'[a-z0-9][a-z0-9_-]{0,159}')
config.setdefault('downloads', [])
downloads = set(unique_strings('downloads', r'(?:/assets/[a-z0-9-]+\.txt|/downloads/heritage-walks/odisha-heritage-walks\.(?:html|md|json|csv|zip)|/characters/(?:[a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]+\.(?:txt|png|jpe?g|webp|zip|vtt|json|mp4|css|js|pdf|ttf|woff2|csv|svg|docx))'))
config.setdefault('documents', [])
documents = set(unique_strings('documents', r'/archive/[a-z0-9-]+\.pdf'))
allowed = set(routes)
config.setdefault('standalone_routes', [])
standalone = set(unique_strings('standalone_routes', r'/characters/(?:[a-z0-9-]+/)*(?:[a-z0-9-]+\.html)?'))
if not standalone <= allowed:
    raise SystemExit('Standalone pages must be explicitly selected edition routes')
# Do not follow symlinks even when a target would otherwise appear reachable.
if any(p.is_symlink() for p in OUT.rglob('*')):
    raise SystemExit('Symlinks are not permitted in staged output')

def route_file(route):
    return OUT / (route.lstrip('/') + 'index.html' if route.endswith('/') else route.lstrip('/'))

def local_file(ref, base):
    u = urlsplit(ref)
    if u.scheme or u.netloc or not u.path:
        return None
    path = unquote(u.path)
    p = (OUT / path.lstrip('/') if path.startswith('/') else base.parent / path).resolve()
    if not p.is_relative_to(OUT.resolve()):
        raise ValueError('Asset escapes output: ' + ref)
    return p

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.resources = [], [], []
        self.payload, self.in_payload, self.noindex = '', False, False
        self.gallery_assets, self.in_gallery_assets = '', False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if tag == 'script' and a.get('id') == 'journey-data':
            self.in_payload = True
        if tag == 'script' and a.get('id') == 'gallery-assets':
            self.in_gallery_assets = True
        if tag == 'meta' and a.get('name') == 'robots' and 'noindex' in a.get('content', ''):
            self.noindex = True
        if tag == 'meta' and (a.get('property') == 'og:image' or a.get('name') == 'twitter:image'):
            image = urlsplit(a.get('content', ''))
            if image.netloc == 'projectodisha.org':
                self.resources.append(image.path)
        for key in ['src', 'poster']:
            if a.get(key):
                self.resources.append(a[key])
        if tag == 'image' and (a.get('href') or a.get('xlink:href')):
            self.resources.append(a.get('href') or a['xlink:href'])
        if tag == 'link' and a.get('href'):
            self.resources.append(a['href'])
        if a.get('srcset'):
            for candidate in a['srcset'].split(','):
                if candidate.strip():
                    self.resources.append(candidate.strip().split()[0])
        for ref in re.findall(r'url\(\s*[\'\"]?([^\s\)\'\"]+)', a.get('style', '')):
            self.resources.append(ref)

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_payload = False
            self.in_gallery_assets = False

    def handle_data(self, data):
        if self.in_payload:
            self.payload += data
        if self.in_gallery_assets:
            self.gallery_assets += data

pages, errors, keep, queue = {}, [], set(), []

def retain(ref, base):
    p = local_file(ref, base)
    if p is None:
        return
    if not p.is_file():
        errors.append('Missing asset: ' + str(p.relative_to(OUT)))
        return
    if p not in keep:
        keep.add(p)
        queue.append(p)

def walk_values(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key == 'src' and isinstance(item, str):
                yield item
            else:
                yield from walk_values(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_values(item)

for route in routes:
    p = route_file(route)
    if not p.is_file():
        errors.append('Missing selected page: ' + route)
        continue
    doc = Document()
    doc.feed(p.read_text())
    pages[route] = doc
    keep.add(p.resolve())
    if len(doc.ids) != len(set(doc.ids)):
        errors.append('Duplicate IDs: ' + route)
    if not doc.noindex:
        errors.append('Preview noindex missing: ' + route)
    if route in standalone:
        if doc.payload:
            errors.append('Standalone page must not include journey data: ' + route)
        for ref in doc.resources:
            retain(ref, p)
        continue
    try:
        payload = json.loads(doc.payload)
        catalog, starters = payload['catalog'], payload['starters']
        ids = [e['id'] for e in catalog]
        selections = [s['id'] for s in starters]
        if len(ids) != len(set(ids)) or set(ids) != set(journey_ids):
            errors.append('Catalogue scope mismatch or duplicate IDs: ' + route)
        if len(selections) != len(set(selections)) or set(selections) != set(starter_ids):
            errors.append('Starter scope mismatch or duplicate IDs: ' + route)
        for entry in catalog:
            doc.links.append(entry['href'])
        for starter in starters:
            if not set(starter['items']) <= set(journey_ids) or len(starter['items']) != len(set(starter['items'])):
                errors.append('Starter contains unavailable or duplicate IDs')
        gallery_assets = json.loads(doc.gallery_assets) if doc.gallery_assets else []
        for ref in doc.resources + list(walk_values(payload)) + list(walk_values(gallery_assets)):
            retain(ref, p)
    except (ValueError, KeyError, TypeError) as error:
        errors.append('Invalid page data at ' + route + ': ' + str(error))

for route, doc in pages.items():
    for ref in doc.links:
        u = urlsplit(ref)
        if u.scheme or u.netloc:
            continue
        resolved = urlsplit(urljoin('https://edition.invalid' + route, ref))
        target = unquote(resolved.path)
        if target in downloads:
            if resolved.fragment:
                errors.append('Download must not contain a fragment: ' + ref)
            retain(target, route_file(route))
            continue
        if target in documents:
            # PDF page fragments belong to the reader, not HTML element IDs.
            retain(target, route_file(route))
            continue
        if target not in allowed:
            errors.append('Link outside scope: ' + route + ' → ' + ref)
        elif target not in pages:
            errors.append('Link to missing selected page: ' + route + ' → ' + ref)
        elif resolved.fragment and unquote(resolved.fragment) not in pages[target].ids:
            errors.append('Missing fragment: ' + route + ' → ' + ref)

# Explicit collection downloads also retain historical assets that have no current page link.
for ref in sorted(downloads):
    if ref.startswith('/characters/'):
        retain(ref, OUT / 'index.html')

# Follow emitted CSS and static module resources, without executing browser code.
while queue:
    p = queue.pop()
    if p.suffix not in {'.css', '.js', '.mjs'}:
        continue
    text = p.read_text()
    refs = re.findall(r'url\(\s*[\'\"]?([^\s\)\'\"]+)', text)
    refs += re.findall(r'[\'\"]((?:/|\./|\.\./)[^\'\"\s]+\.(?:js|mjs|css|woff2?|ttf|svg|png|jpe?g|webp|json)(?:\?[^\'\"\s]*)?)[\'\"]', text)
    for ref in refs:
        retain(ref, p)
for p in (OUT / 'fonts').rglob('*.txt'):
    if 'OFL' in p.name:
        keep.add(p.resolve())
for name in ['CNAME', 'robots.txt']:
    if (OUT / name).exists():
        keep.add((OUT / name).resolve())
if errors:
    raise SystemExit('\n'.join(errors))

all_files = {p.resolve() for p in OUT.rglob('*') if p.is_file()}
removed = sorted(str(p.relative_to(OUT)) for p in all_files - keep)
for p in all_files - keep:
    p.unlink()
for p in sorted(OUT.rglob('*'), key=lambda p: len(p.parts), reverse=True):
    if p.is_dir() and not any(p.iterdir()):
        p.rmdir()
files = [dict(path=str(p.relative_to(OUT)), bytes=p.stat().st_size, sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted(keep)]
report = dict(edition='coast', status='local_candidate_not_published', routes=routes, html_pages=len(pages), journey_choices=len(journey_ids), starter_count=len(starter_ids), bytes=sum(p['bytes'] for p in files), removed_file_count=len(removed), removed=removed, errors=[], files=files)
target = SITE / 'dist-coast'
if target.is_symlink():
    raise SystemExit('Refusing to replace a symlink output')
backup = None
if target.exists():
    backup = Path(tempfile.mkdtemp(prefix='.coast-backup-', dir=SITE))
    backup.rmdir()
    target.rename(backup)
try:
    OUT.rename(target)
except BaseException:
    if backup:
        backup.rename(target)
    raise
if backup:
    shutil.rmtree(backup)
(SITE / '.astro').mkdir(exist_ok=True)
(SITE / '.astro/coast-build-report.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'Coastal candidate: {len(pages)} pages, {len(files)} files, {report["bytes"]:,} bytes; {len(removed)} unused files excluded.')
