from pathlib import Path
import json,hashlib,subprocess
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';OLD=ROOT/'outputs/dhaga-loop-2026-11-06/batch61';old=json.loads((OLD/'samanta/baseline.json').read_text())
def sig(p):return {'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();status=subprocess.check_output(['git','status','--porcelain'],cwd=R,text=True);assert not status
b={'input_head':head,'git_status_at_capture':status,'local301_stage':old['local301_stage']};delta={}
for group,base in [('canonical_book_files',R),('local301_files',Path(old['local301_stage'])),('prior_coverage_bindings',ROOT)]:
 b[group]={};changes=[]
 for rel,expected in old[group].items():
  actual=sig(base/rel);b[group][rel]=actual
  if actual!=expected:changes.append({'path':rel,'before':expected,'after':actual})
 delta[group]=changes
 if group!='prior_coverage_bindings':assert not changes,group
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=R).decode().split('\0');b['shared_tracked_files']={rel:sig(R/rel) for rel in tracked if rel and not rel.startswith('projects/odia-dhaga/') and (R/rel).is_file()}
delta['shared_changed']=[{'path':x,'before':v,'after':b['shared_tracked_files'].get(x)} for x,v in old['shared_tracked_files'].items() if b['shared_tracked_files'].get(x)!=v];delta['shared_added']=[x for x in b['shared_tracked_files'] if x not in old['shared_tracked_files']]
for base in [OLD]:
 for f in base.rglob('*'):
  if f.is_file() and f.name!='HANDOFF.json':b['prior_coverage_bindings'][str(f.relative_to(ROOT))]=sig(f)
b['historical_handoff_resolution']={'B61':{'path':str((OLD/'reviewed-handoff.json').relative_to(ROOT)),**sig(OLD/'reviewed-handoff.json')},'114_actual_release':{'path':'outputs/tala-pitha-editorial-2026-11-06/receipt-integration/integration-delivery.json',**sig(ROOT/'outputs/tala-pitha-editorial-2026-11-06/receipt-integration/integration-delivery.json')}}
(P/'baseline.json').write_text(json.dumps(b,indent=2)+'\n');(P/'baseline-transition.json').write_text(json.dumps({'status':'FRESH_BASELINE_AFTER_AUTHORIZED_114_AND_115_RELEASE','old_input_head':old['input_head'],'new_input_head':head,'qualification':'114 implementation/receipt686 and115 classification/receipt687 authorized current committed baseline; no blanket old shared preservation claim. No worker sync/Git/canonical edits.','delta':delta,'counts':{k:len(b[k]) for k in ['canonical_book_files','local301_files','shared_tracked_files','prior_coverage_bindings']}},indent=2)+'\n');print(head,{k:len(b[k]) for k in ['canonical_book_files','local301_files','shared_tracked_files','prior_coverage_bindings']});print('prior changes',delta['prior_coverage_bindings'])
