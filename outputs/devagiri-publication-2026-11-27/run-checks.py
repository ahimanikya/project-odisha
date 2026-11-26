"""Run existing release gates against frozen inputs. Never publish."""
import hashlib,json,os,subprocess,time
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];SITE=ROOT/'projects/site'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
env=dict(os.environ);env['PATH']='/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin:'+env['PATH'];env['ASTRO_TELEMETRY_DISABLED']='1'
contract=json.loads((OUT/'reviewed-article-contract.json').read_text());inputs=contract['source_hashes'];descriptor=contract['dhaga_descriptor'];pdf=ROOT/'projects/odia-dhaga/odia-dhaga-book.pdf'
def unchanged():
 assert all(digest(ROOT/p)==h for p,h in inputs.items()),'Frozen inputs changed'
 assert pdf.stat().st_size==descriptor['bytes'] and digest(pdf)==descriptor['sha256'],'Pinned PDF changed'
unchanged()
stages=[('full-build',['npm','run','build']),('full-disclosures',['node','tools/check-public-disclosures.mjs','dist']),('full-tests',['npm','test']),('coast-build',['npm','run','build:coast']),('coast-disclosures',['node','tools/check-public-disclosures.mjs','dist-coast']),('coast-tests',['npm','run','test:coast']),('coast-acceptance',['python3','tools/audit-coast.py']),('coast-discovery',['python3','tools/audit-discovery.py']),('search-review',['node','tools/prepare-search-review.mjs']),('launch-readiness',['python3','tools/audit-launch-readiness.py']),('publication-build',['npm','run','build:publication']),('publication-disclosures',['node','tools/check-public-disclosures.mjs','dist-publish']),('search-shortlist',['python3','tools/audit-search-shortlist.py'])]
start=int(env.get('DEVAGIRI_START_STAGE','0'));end=int(env.get('DEVAGIRI_END_STAGE',str(len(stages))));results=json.loads((OUT/'build-results.json').read_text()) if start else []
assert len(results)==start and all(x['exit_code']==0 and x['source_hashes']==inputs for x in results),'Resume evidence does not match'
logs=OUT/'checks';logs.mkdir(exist_ok=True)
for name,command in stages[start:end]:
 unchanged();print('START',name,flush=True);t=time.time()
 with (logs/(name+'.log')).open('w') as out:code=subprocess.run(command,cwd=SITE,env=env,stdout=out,stderr=subprocess.STDOUT).returncode
 unchanged();results.append({'stage':name,'command':command,'exit_code':code,'elapsed_seconds':round(time.time()-t,2),'source_hashes':inputs,'dhaga_pdf_sha256':descriptor['sha256'],'log':str((logs/(name+'.log')).relative_to(ROOT))});(OUT/'build-results.json').write_text(json.dumps(results,indent=2)+'\n');print('END',name,code,flush=True)
 if code:raise SystemExit(code)
