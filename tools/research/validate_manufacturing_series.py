"""Validate reused product boundaries, calculations and non-additive controls."""
from pathlib import Path
import json,math
from kb_io import ROOT
D=ROOT/'references/data';x=json.loads((D/'manufacturing-production-series.json').read_text());a=json.loads((D/'statistics-atlas.json').read_text());o={r['id']:r for r in a['observations']};c={r['id']:r for r in a['calculations']};errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
ids=x['reused_observation_ids'];check(len(ids)==len(set(ids))==15,'Reuse set changed')
for s in x['production_series']:
 rows=[o[i] for i in s['observation_ids']]
 check(all(all(r[f]==rows[0][f] for f in ['metric','unit','geography','source_id']) for r in rows),'Incompatible series '+s['id'])
 check(all(r['publication_readiness']!='hold_conflict' for r in rows),'Held input reused')
check(x['production_series'][-1]['comparable_within_saved_scope'] is False,'IMFA perimeter guard lost')
for cid in x['new_calculation_ids']+x['reused_calculation_ids']:
 r=c[cid];p,q=[o[i] for i in r['inputs']];check(math.isclose(r['value'],(q['value']/p['value']-1)*100,abs_tol=1e-8),'Arithmetic '+cid)
check(len(x['new_observation_ids'])==22,'Observation count')
check(len(x['source_report_observation_ids'])==6,'Annual report scope')
for s in x['technical_series']:
 rows=[o[i] for i in s['observation_ids']];check(len(rows)==7,'Technical period count');check([r['period'] for r in rows]==[f'{y}-{str(y+1)[2:]}' for y in range(2017,2024)],'Technical periods');check(s['original_table_image_reviewed'] is False,'Unreviewed CAG image promoted')
 check(all(r['publication_readiness']=='needs_source_table_review' for r in rows),'CAG scope promoted')
check(o['manufacturing-rsp-crude-2024-25']['value']==4.04 and o['rsp-crude-2024-25']['value']==4.045,'Source precision overwritten')
check(all(v is False for v in x['controls'].values()),'Scope guard lost');check(all(v is None for v in x['unknowns'].values()),'Unknowns silently filled')
check(o['nalco-chain-aluminium-2021-22']['value']==o['nalco-chain-aluminium-2022-23']['value'],'Flat year lost')
for slug in ['hydrate','aluminium']:check(o['nalco-chain-'+slug+'-2024-25']['value']<o['nalco-chain-'+slug+'-2023-24']['value'],'Decline lost')
print(json.dumps({'result':'FAIL' if errors else 'PASS','production_observations_reused':15,'new_observations':22,'new_calculations':8,'reused_calculations':5,'errors':errors,'scope':'Structure, arithmetic, reused IDs and attribution boundaries; not independent source verification or human review.'},indent=2));raise SystemExit(bool(errors))
