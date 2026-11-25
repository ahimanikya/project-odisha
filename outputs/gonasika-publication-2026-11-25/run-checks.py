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
results = []
(OUT / 'checks').mkdir(exist_ok=True)
for stage, command in stages:
    started = time.time()
    manuscript_sha256 = hashlib.sha256((ROOT / 'kb/research/places/gonasika-article.md').read_bytes()).hexdigest()
    print('START', stage, flush=True)
    with (OUT / 'checks' / (stage + '.log')).open('w') as log:
        code = subprocess.run(command, cwd=SITE, env=env, stdout=log, stderr=subprocess.STDOUT).returncode
    results.append({'stage': stage, 'command': command, 'exit_code': code, 'elapsed_seconds': round(time.time() - started, 2), 'manuscript_sha256': manuscript_sha256})
    (OUT / 'build-results.json').write_text(json.dumps(results, indent=2) + '\n')
    print('END', stage, code, flush=True)
    if code:
        raise SystemExit(code)
