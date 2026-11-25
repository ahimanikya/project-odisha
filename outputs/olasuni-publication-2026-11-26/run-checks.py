"""Run existing local release checks sequentially; never publish."""
import hashlib, json, os, subprocess, time
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
SITE = ROOT / 'projects/site'
env = dict(os.environ)
env['PATH'] = '/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin:' + env['PATH']
env['ASTRO_TELEMETRY_DISABLED'] = '1'
stages = [
    ('full-build', ['npm', 'run', 'build']),
    ('full-disclosures', ['node', 'tools/check-public-disclosures.mjs', 'dist']),
    ('full-tests', ['npm', 'test']),
    ('coast-build', ['npm', 'run', 'build:coast']),
    ('coast-disclosures', ['node', 'tools/check-public-disclosures.mjs', 'dist-coast']),
    ('coast-tests', ['npm', 'run', 'test:coast']),
    ('coast-acceptance', ['python3', 'tools/audit-coast.py']),
    ('coast-discovery', ['python3', 'tools/audit-discovery.py']),
    ('search-review', ['node', 'tools/prepare-search-review.mjs']),
    ('launch-readiness', ['python3', 'tools/audit-launch-readiness.py']),
    ('publication-build', ['npm', 'run', 'build:publication']),
    ('publication-disclosures', ['node', 'tools/check-public-disclosures.mjs', 'dist-publish']),
    ('search-shortlist', ['python3', 'tools/audit-search-shortlist.py']),
]
descriptor=json.loads((ROOT/'projects/odia-dhaga/pdf-delivery.json').read_text())
pdf=ROOT/'projects/odia-dhaga/odia-dhaga-book.pdf'
assert pdf.stat().st_size==descriptor['bytes'] and hashlib.sha256(pdf.read_bytes()).hexdigest()==descriptor['sha256'], 'Hydrate exact reviewed Dhaga PDF before builds'
bound_paths=['kb/research/places/olasuni-article.md', 'kb/research/places/olasuni-image.json', 'projects/site/src/pages/destinations/olasuni.astro', 'projects/site/src/data/hill-destinations.ts', 'projects/site/src/pages/destinations/hills.astro', 'projects/site/src/pages/destinations/index.astro', 'projects/site/src/pages/explore.astro', 'projects/site/tools/nimuhi-footnote-heading.mjs', 'projects/site/tools/optimize-publication-jpeg.mjs', 'projects/site/tools/storage-copy.mjs', 'projects/site/tools/cow_copy.py', 'projects/site/tools/build-publication.mjs', 'projects/site/tools/prepare-search-review.mjs', 'projects/site/editions/coast.json', 'projects/site/editions/responsive-images.json', 'projects/site/editions/search-candidate.json', 'projects/site/tests/build.test.mjs', 'projects/site/tests-coast/discovery-flow.test.mjs', 'projects/site/tests-coast/edition.test.mjs', 'projects/site/tests/publication-jpeg.test.mjs', 'projects/site/public/images/destinations/olasuni-view-nathularog.webp']
source_hashes={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in bound_paths}
source_head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
start=int(env.get('OLASUNI_START_STAGE','0'))
end=int(env.get('OLASUNI_END_STAGE',str(len(stages))))
results=json.loads((OUT/'build-results.json').read_text()) if start else []
assert len(results)==start
assert all(row['source_hashes']==source_hashes and row['exit_code']==0 for row in results), 'Resumed input differs from prior successful stages'
if not start:(OUT/'build-results.json').write_text('[]\n')
logs=OUT / env.get('OLASUNI_CHECKS_DIR','checks')
logs.mkdir(parents=True,exist_ok=True)
for stage, command in stages[start:end]:
    started = time.time()
    manuscript_sha256 = hashlib.sha256((ROOT / 'kb/research/places/olasuni-article.md').read_bytes()).hexdigest()
    print('START', stage, flush=True)
    with (logs / (stage + '.log')).open('w') as log:
        code = subprocess.run(command, cwd=SITE, env=env, stdout=log, stderr=subprocess.STDOUT).returncode
    assert source_hashes=={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in bound_paths}, 'Publication source changed during stage'
    assert pdf.stat().st_size==descriptor['bytes'] and hashlib.sha256(pdf.read_bytes()).hexdigest()==descriptor['sha256'], 'Pinned Dhaga PDF changed during stage'
    results.append({'log':str((logs/(stage+'.log')).relative_to(ROOT)),'source_hashes':source_hashes,'stage': stage, 'command': command, 'exit_code': code, 'elapsed_seconds': round(time.time() - started, 2), 'manuscript_sha256': manuscript_sha256, 'source_head': source_head, 'dhaga_pdf_sha256': descriptor['sha256']})
    (OUT / 'build-results.json').write_text(json.dumps(results, indent=2) + '\n')
    print('END', stage, code, flush=True)
    if code:
        raise SystemExit(code)
