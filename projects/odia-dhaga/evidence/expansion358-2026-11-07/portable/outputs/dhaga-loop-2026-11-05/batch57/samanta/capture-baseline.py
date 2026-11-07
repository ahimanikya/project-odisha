from pathlib import Path
import json,hashlib,subprocess
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';OLD=P.parent.parent/'batch56';old=json.loads((OLD/'samanta/baseline.json').read_text())
def sig(p):return {'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();status=subprocess.check_output(['git','status','--porcelain'],cwd=R,text=True);assert not status
b={'input_head':head,'git_status_at_capture':status,'local301_stage':old['local301_stage']};delta={}
for group,base in [('canonical_book_files',R),('local301_files',Path(old['local301_stage'])),('prior_coverage_bindings',ROOT)]:
 b[group]={};changes=[]
 for rel,expected in old[group].items():
  actual=sig(base/rel);b[group][rel]=actual
  if actual!=expected:changes.append({'path':rel,'before':expected,'after':actual})
 delta[group]=changes
 assert not changes,group
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=R).decode().split('\0');b['shared_tracked_files']={rel:sig(R/rel) for rel in tracked if rel and not rel.startswith('projects/odia-dhaga/') and (R/rel).is_file()}
delta['shared_changed']=[{'path':x,'before':v,'after':b['shared_tracked_files'].get(x)} for x,v in old['shared_tracked_files'].items() if b['shared_tracked_files'].get(x)!=v];delta['shared_added']=[x for x in b['shared_tracked_files'] if x not in old['shared_tracked_files']]
for f in OLD.rglob('*'):
 if f.is_file() and f.name!='HANDOFF.json':b['prior_coverage_bindings'][str(f.relative_to(ROOT))]=sig(f)
# Complete112 receipt evidence retained by exact current tracked records plus output delivery bindings.
E=ROOT/'outputs/ou-khatta-editorial-2026-11-04'
for f in E.glob('*delivery*.json'):b['prior_coverage_bindings'][str(f.relative_to(ROOT))]=sig(f)
(P/'baseline.json').write_text(json.dumps(b,indent=2)+'\n');(P/'baseline-transition.json').write_text(json.dumps({'status':'FRESH_BASELINE_AFTER_AUTHORIZED_RELEASES','old_input_head':old['input_head'],'new_input_head':head,'qualification':'112 receipt and Dongria released changes are current committed baseline, not falsely claimed unchanged against B56. No worker sync or canonical edits.','delta':delta,'counts':{k:len(b[k]) for k in ['canonical_book_files','local301_files','shared_tracked_files','prior_coverage_bindings']}},indent=2)+'\n')
checks=[]
for path,expected in json.loads((OLD/'delivery.json').read_text())['bindings'].items():
 assert sig(Path(path))['sha256']==expected;checks.append({'path':path,'sha256':expected})
(P/'prior-delivery-check.json').write_text(json.dumps({'status':'PASS','bindings':checks,'historical_handoff':'Exact reviewed-handoff.json supplied by delivery.'},indent=2)+'\n');print({k:len(b[k]) for k in ['canonical_book_files','local301_files','shared_tracked_files','prior_coverage_bindings']})
