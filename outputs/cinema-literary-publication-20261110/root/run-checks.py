from pathlib import Path
import json, os, subprocess, sys
R = Path(__file__).resolve().parents[3]
O = Path(__file__).parent
PY = '/Users/ahimanikya/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3'
env = dict(os.environ)
env['PATH'] = '/Users/ahimanikya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/ahimanikya/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin:/opt/homebrew/bin:/usr/bin:/bin'
site = R / 'projects/site'
commands = [
 ('bundle', R, [PY, 'tools/check_bundle.py']),
 ('team', R, [PY, 'tools/check_team_assignments.py']),
 ('program', R, [PY, 'tools/check_autonomous_program.py']),
 ('site-build', site, ['npm','run','build']),
 ('disclosure-full', site, ['node','tools/check-public-disclosures.mjs','dist']),
 ('site-tests', site, ['npm','test']),
 ('coast-build', site, ['npm','run','build:coast']),
 ('disclosure-coast', site, ['node','tools/check-public-disclosures.mjs','dist-coast']),
 ('coast-tests', site, ['npm','run','test:coast']),
 ('audit-coast', site, [PY,'tools/audit-coast.py']),
 ('audit-discovery', site, [PY,'tools/audit-discovery.py']),
 ('search-review', site, ['node','tools/prepare-search-review.mjs']),
 ('audit-launch', site, [PY,'tools/audit-launch-readiness.py']),
 ('publication-build', site, ['npm','run','build:publication']),
 ('disclosure-publication', site, ['node','tools/check-public-disclosures.mjs','dist-publish']),
 ('audit-search', site, [PY,'tools/audit-search-shortlist.py']),
 ('download-publication', site, ['node','--test','tests/book-downloads.test.mjs']),
 ('workbench', R, [PY,'tools/editorial/build_workbench.py']),
 ('workbench-check', R, [PY,'tools/editorial/build_workbench.py','--check']),
 ('rollout', R, [PY,'tools/editorial/article_rollout.py','--check']),
]
if len(sys.argv) > 1:
    commands = commands[next(i for i, (name, _, _) in enumerate(commands) if name == sys.argv[1]):]
results = json.loads((O/'checks.json').read_text()) if len(sys.argv) > 1 else []
for name, cwd, cmd in commands:
    current_env = dict(env)
    if name == 'download-publication': current_env['BOOK_DOWNLOAD_STAGE'] = 'dist-publish'
    log = O / (name + '.log')
    with log.open('w') as f: result = subprocess.run(cmd, cwd=cwd, env=current_env, stdout=f, stderr=subprocess.STDOUT)
    results.append(dict(name=name, command=cmd, exit_code=result.returncode, log=str(log.relative_to(R))))
    (O/'checks.json').write_text(json.dumps(results,indent=2)+'\n')
    print(name, result.returncode, flush=True)
    if result.returncode:
        print(log.read_text()[-5000:]);sys.exit(result.returncode)
