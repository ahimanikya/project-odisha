"""Check selected port series and quarantine the conflicting total."""
import json,math
from kb_io import ROOT
D=ROOT/'references/data';x=json.loads((D/'trade-logistics-series.json').read_text());a=json.loads((D/'statistics-atlas.json').read_text());obs={o['id']:o for o in a['observations']};calc={o['id']:o for o in a['calculations']};errors=[]
def check(v,m):
 if not v:errors.append(m)
for s in x['series']:
 rows=[obs[i] for i in s['observation_ids']];count=5 if s['id']=='paradip-turnround' else 10
 check(len(rows)==count,s['id']+': incomplete series')
 check([r['period'] for r in rows]==s['periods'],s['id']+': periods differ')
 check(all(int(b[:4])-int(a[:4])==1 for a,b in zip(s['periods'],s['periods'][1:])),s['id']+': nonannual interval')
 for r in rows:
  check(all(r[f]==s[f] for f in ['source_id','metric','unit','geography']),r['id']+': mixed scope')
  check(r['publication_readiness']=='source_checked_editorial_review_pending',r['id']+': review state')
for c in x['conflicts']:
 check(all(obs[i]['publication_readiness']=='hold_conflict' for i in c['observation_ids']),'Conflict not held')
 check(not any(set(v['inputs'])&set(c['observation_ids']) for v in a['calculations']),'Disputed total used in calculation')
 check([obs[i]['value'] for i in c['observation_ids']]==[54.75,54.24],'Conflicting source totals overwritten')
for cid in x['calculation_ids']:
 c=calc[cid];start,end=[obs[i] for i in c['inputs']];check(math.isclose(c['value'],(end['value']/start['value']-1)*100,abs_tol=1e-8),cid+': wrong arithmetic')
 if 'five-year' in cid:check(int(end['period'][:4])-int(start['period'][:4])==5,'Wrong five-year interval')
check(obs['trade-gopalpur-cargo-2024-25']['value']<obs['trade-gopalpur-cargo-2023-24']['value'],'Gopalpur decline lost')
check(obs['trade-dhamra-cargo-2022-23']['value']<obs['trade-dhamra-cargo-2021-22']['value'],'Dhamra adverse year lost')
check(obs['trade-paradip-turnround-2024-25']['value']>obs['trade-paradip-turnround-2023-24']['value'],'Vessel-time increase lost')
print(json.dumps({'result':'FAIL' if errors else 'PASS','series':len(x['series']),'annual_observations':sum(len(s['observation_ids']) for s in x['series']),'held_conflicts':len(x['conflicts']),'errors':errors,'scope':'Structure, interval alignment and arithmetic; not source accuracy, causality or human review.'},indent=2));raise SystemExit(bool(errors))
