from pathlib import Path
import json,hashlib,subprocess
if not __debug__:raise RuntimeError('Optimized Python refused')
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack'
b=json.loads((P/'baseline.json').read_text());results={}
for key,base in [('canonical_book_files',R),('local301_files',Path(b['local301_stage'])),('shared_tracked_files',R),('prior_coverage_bindings',ROOT)]:
 changed=[]
 for rel,expected in b[key].items():
  p=base/rel
  actual={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} if p.is_file() else None
  if actual!=expected:changed.append({'path':rel,'expected':expected,'actual':actual})
 results[key]={'checked':len(b[key]),'unchanged':len(b[key])-len(changed),'changed':changed}
r={'status':'PASS_EXACT' if not any(v['changed'] for v in results.values()) else 'DELTA_REQUIRES_QUALIFICATION','baseline_sha256':hashlib.sha256((P/'baseline.json').read_bytes()).hexdigest(),'input_head':b['input_head'],'current_head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'git_status':subprocess.check_output(['git','status','--porcelain'],cwd=R,text=True),'groups':results}
(P/'preservation.json').write_text(json.dumps(r,indent=2)+'\n');print(r['status'],{k:(v['checked'],len(v['changed'])) for k,v in results.items()})
