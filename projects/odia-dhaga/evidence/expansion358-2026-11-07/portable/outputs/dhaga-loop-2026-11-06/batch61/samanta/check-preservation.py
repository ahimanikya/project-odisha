from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';b=json.loads((P/'baseline.json').read_text());groups={}
for group,base in [('canonical_book_files',R),('local301_files',Path(b['local301_stage'])),('shared_tracked_files',R),('prior_coverage_bindings',ROOT)]:
 failures=[]
 for rel,row in b[group].items():
  f=base/rel;v={'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size}
  if v!=row:failures.append({'path':rel,'before':row,'after':v})
 groups[group]={'checked':len(b[group]),'failures':failures}
status='PASS_EXACT' if not any(x['failures'] for x in groups.values()) else 'MISMATCH_REQUIRES_QUALIFICATION'
(P/'preservation.json').write_text(json.dumps({'status':status,'input_head':b['input_head'],'groups':groups},indent=2)+'\n');print(status)
