"""Build a local review package without changing published book metadata."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SITE = ROOT / 'projects/site'
DATA = SITE / 'src/data/cinema.json'
RENDER = ROOT / 'tmp/cinema-release-20261101/astro-review'
PREVIEW = OUT / 'review-site'
env = dict(os.environ, PATH='/Users/ahimanikya/.nvm/versions/node/v24.15.0/bin:/usr/bin:/bin:/usr/sbin:/sbin', ASTRO_TELEMETRY_DISABLED='1')
env['PUBLIC_UTKAL_EDITION'] = 'coast'

def sha(data):
    return hashlib.sha256(data).hexdigest()

before = DATA.read_bytes()
data = json.loads(before)
overlay = json.loads((OUT / 'preview-metadata.json').read_text())
data.update(overlay)
candidate = (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()
manifest = json.loads((OUT / 'book-release-manifest.json').read_text())
for asset in manifest['assets']:
    content = (ROOT / asset['path']).read_bytes()
    assert sha(content) == asset['sha256'] and len(content) == asset['bytes']

if '--assemble-only' not in sys.argv:
    try:
        DATA.write_bytes(candidate)
        with (OUT / 'candidate-render.log').open('w') as log:
            subprocess.run(['npm', 'exec', '--', 'astro', 'build', '--outDir', str(RENDER)], cwd=SITE, env=env, stdout=log, stderr=subprocess.STDOUT, check=True)
    finally:
        if DATA.read_bytes() != candidate:
            raise RuntimeError('Concurrent metadata change: preserve it and reconcile before restoring')
        DATA.write_bytes(before)
    (OUT / 'candidate-render-binding.json').write_text(json.dumps({'candidate_metadata_sha256': sha(candidate), 'book_page_sha256': sha((RENDER / 'cinema/book/index.html').read_bytes())}, indent=2) + '\n')
if '--render-only' in sys.argv:
    print('Candidate rendered; production metadata restored. Assembly remains pending.')
    sys.exit(0)

binding = json.loads((OUT / 'candidate-render-binding.json').read_text())
assert binding['candidate_metadata_sha256'] == sha(candidate)
assert binding['book_page_sha256'] == sha((RENDER / 'cinema/book/index.html').read_bytes())

if PREVIEW.exists():
    raise RuntimeError('Review package already exists; inspect it before replacing')
shutil.copytree(SITE / 'dist-publish', PREVIEW)
shutil.copy2(RENDER / 'cinema/book/index.html', PREVIEW / 'cinema/book/index.html')
for asset in manifest['assets']:
    destination = PREVIEW / 'archive' / asset['filename']
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / asset['path'], destination)
    assert sha(destination.read_bytes()) == asset['sha256']

# This folder is for local review; it is not the deployable publication output.
(PREVIEW / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
(PREVIEW / 'sitemap.xml').unlink(missing_ok=True)
receipt = {
    'status': 'local_preview_built',
    'publication_performed': False,
    'production_metadata_restored': DATA.read_bytes() == before,
    'production_metadata_sha256': sha(before),
    'candidate_metadata_sha256': sha(candidate),
    'review_site': str(PREVIEW.relative_to(ROOT)),
    'book_page_sha256': sha((PREVIEW / 'cinema/book/index.html').read_bytes()),
    'assets': manifest['assets'],
    'limits': ['The preview is local only. Planned GitHub release URLs have not been activated.']
}
(OUT / 'preview-build.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'status': receipt['status'], 'metadata_restored': receipt['production_metadata_restored'], 'review_site': receipt['review_site']}))
