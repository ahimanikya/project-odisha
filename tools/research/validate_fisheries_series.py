"""Validate annual scope, overlaps, held totals and comparison intervals."""
import json,math
from kb_io import ROOT
D=ROOT/'references/data';x=json.loads((D/'fisheries-production-series.json').read_text());a=json.loads((D/'statistics-atlas.json').read_text());obs={o['id']:o for o in a['observations']};calcs={c['id']:c for c in a['calculations']};errors=[]
def check(v,m):
 if not v:errors.append(m)
held={i for c in x['conflicts'] for i in c['observation_ids']}
for s in x['series']:
 rows=[obs[i] for i in s['observation_ids']];check(len(rows)==11,s['id']+': length');check([r['period'] for r in rows]==s['periods'],s['id']+': periods')
 check(all(int(b[:4])-int(a[:4])==1 for a,b in zip(s['periods'],s['periods'][1:])),s['id']+': annual sequence')
 for r in rows:
  check(all(r[f]==s[f] for f in ['metric','unit','source_id','geography']),r['id']+': scope')
  check(r['publication_readiness']==('hold_conflict' if r['id'] in held else 'needs_source_table_review'),r['id']+': review boundary')
 check(rows[-1]['estimate_status']=='provisional (P)',s['id']+': provisional lost')
for c in x['conflicts']:
 check(all(obs[i]['publication_readiness']=='hold_conflict' for i in c['observation_ids']),'Alternate totals not held')
 check(abs(obs[c['observation_ids'][0]]['value']-obs[c['observation_ids'][1]]['value'])==1,'Alternate discrepancy changed')
for cid in x['calculation_ids']:
 c=calcs[cid];start,end=[obs[i] for i in c['inputs']];n=10 if '10year' in cid else 5
 check(not set(c['inputs'])&held,cid+': conflict used');check(int(end['period'][:4])-int(start['period'][:4])==n,cid+': wrong interval');check(math.isclose(c['value'],(end['value']/start['value']-1)*100,abs_tol=1e-8),cid+': arithmetic')
for year in ['2017-18','2019-20']:
 prev=str(int(year[:4])-1)+'-'+year[2:4];check(obs['fish-history-marine-'+year]['value']<obs['fish-history-marine-'+prev]['value'],'Marine decline lost')
check(len(x['rounding_checks'])==2,'Rounding checks lost')
check(all(v is None for v in x['unknowns'].values()),'Unknown field promoted without research')
check(all(i in obs for i in x['latest_observations_reused']),'Latest historical context reference missing')
print(json.dumps({'result':'FAIL' if errors else 'PASS','series':5,'annual_observations':55,'held_alternate_pairs':2,'comparisons':10,'errors':errors,'scope':'Structure and arithmetic only; not source-image verification or human review.'},indent=2));raise SystemExit(bool(errors))
