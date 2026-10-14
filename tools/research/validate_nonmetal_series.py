"""Check plant boundaries, actual/budget separation and derived comparisons."""
from pathlib import Path
from kb_io import ROOT
import json,math
D=ROOT/'references/data';x=json.loads((D/'nonmetal-production-series.json').read_text());a=json.loads((D/'statistics-atlas.json').read_text());o={v['id']:v for v in a['observations']};c={v['id']:v for v in a['calculations']};errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(len(set(x['new_observation_ids']))==30,'Expected 30 distinct observations')
for s in x['series']:
 rows=[o[i] for i in s['observation_ids']]
 check(all(all(r[f]==rows[0][f] for f in ['unit','metric','geography','source_id']) for r in rows),'Incompatible scope '+s['id'])
 check(all(r['period']!='2026-27' and r['publication_readiness']=='source_checked_editorial_review_pending' for r in rows),'Budget or held record in actual series')
 if s['plant_id']=='dalmia-rajgangpur-lines1-2-cpp':check(all('Lines 1, 2 and CPP' in r['geography'] for r in rows),'Line boundary missing')
for p in ['2024-25','2025-26']:
 check(math.isclose(o['nonmetal-iffco-npdap-'+p]['value'],sum(o['nonmetal-iffco-production-'+g+'-'+p]['value'] for g in ['npk','dap']),abs_tol=1e-9),'Total/components mismatch '+p)
for cid in x['calculation_ids']:
 v=c[cid];u,w=[o[i] for i in v['inputs']]
 check(u['metric']==w['metric'] and u['unit']==w['unit'] and u['geography']==w['geography'],'Calculation boundary mismatch')
 check(math.isclose(v['value'],(w['value']/u['value']-1)*100,abs_tol=1e-8),'Calculation mismatch '+cid)
check(c['nonmetal-change-iffco-production-npk-2025-26']['value']<0,'Product decline lost')
check(c['nonmetal-change-rajgangpur-cpp-2024-25']['value']<0,'Power decline lost')
check(any(o['nonmetal-iffco-sales-npk-'+p]['value']!=o['nonmetal-iffco-production-npk-'+p]['value'] for p in ['2024-25','2025-26']),'Sales overwritten by production')
check(x['excluded_sources_or_fields'][0]['status']=='hold_conflict','PPL discrepancy silently promoted')
check(all(v is False for v in x['controls'].values()) and all(v is None for v in x['unknowns'].values()),'Scope control or unknown changed')
print(json.dumps(dict(result='FAIL' if errors else 'PASS',observations=30,calculations=13,errors=errors,scope='Arithmetic and scope checks; not independent publisher verification or human review.'),indent=2));raise SystemExit(bool(errors))
