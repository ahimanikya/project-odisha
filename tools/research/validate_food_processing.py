"""Validate evidence-stage separation and reuse in the processing checkpoint."""
from kb_io import ROOT
import json,math
D=ROOT/'references/data';x=json.loads((D/'food-processing-series.json').read_text());a=json.loads((D/'statistics-atlas.json').read_text());obs={o['id']:o for o in a['observations']};cal={c['id']:c for c in a['calculations']};errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(not set(x['new_observation_ids'])&set(x['reused_observation_ids']),'New/reused observations overlap')
for key in x['new_observation_ids']+x['reused_observation_ids']:check(key in obs,'Missing observation '+key)
for s in x['series']:
 rows=[obs[i] for i in s['observation_ids']]
 check(all(all(o[f]==rows[0][f] for f in ['unit','metric','geography','source_id']) for o in rows),'Incompatible series '+s['id'])
 check(s['kind'] in ['procurement','turnover','cane_crushed','physical_production'],'Unknown processing measure')
 for o in rows:
  check(o.get('price_basis') and o.get('period_coverage'),'Missing scope metadata')
  if s['kind']=='procurement':check(o['publication_readiness']=='needs_source_table_review','Indexed extract promoted without facsimile review')
for cid in x['calculation_ids']:
 c=cal[cid];u,v=[obs[i] for i in c['inputs']];check(math.isclose(c['value'],(v['value']/u['value']-1)*100,abs_tol=1e-8),'Arithmetic mismatch '+cid)
for metric in ['area','production','yield']:
 rows=[obs[i] for i in x['reused_observation_ids'] if i.startswith('rice-series-'+metric+'-') or (metric=='yield' and i=='rice-yield2024')]
 check(len(rows)==12 and sorted(int(o['period'][:4]) for o in rows)==list(range(2012,2024)),'Rice historical years lost '+metric)
check(all(v is False for v in x['controls'].values()),'Evidence-stage separation lost')
check(all(v is None for v in x['unknowns'].values()),'Unknown output or margin invented')
check(x['documented_mechanism']['award_verified'] is False and x['documented_mechanism']['actual_quantity'] is None,'Tender promoted to completed output')
# Preserve provisional year-labelled sugar rows and company sale-period quantities separately.
if 'sugar_factory_capture' in x:
 t=x['sugar_factory_capture'];years=t['years'];cols=t['columns']
 check(len(years)==11 and years==[f'{y}-{str(y+1)[-2:]}' for y in range(2013,2024)],'Sugar years incomplete')
 check(not t['facsimile_checked'] and t['no_operation_symbol']=='*','Unverified sugar image or missing symbol semantics')
 for metric,field in [('cane_crushed','cane_crushed_thousand_tonnes'),('sugar_produced','sugar_produced_thousand_tonnes')]:
  for yi,y in enumerate(years):
   row=t[field][yi]
   check(len(row)==len(cols),'Sugar column count drift')
   for g,ci in [('aska',0),('dhenkanal',6),('grand_total',8)]:
    o=obs[f'food-sugar-{g}-{metric}-{y}'];check(o['value']==row[ci],'Sugar transcribed value mismatch')
    check(o['publication_readiness'] in ['needs_source_table_review','hold_conflict'],'Provisional sugar series promoted')
   check(math.isclose(row[3]+row[7],row[8],abs_tol=.0011),'Sugar group total mismatch')
 h=next(h for h in x['sugar_holds'] if h['id']=='sugar-recovery-arithmetic')
 for c in h['checks']:
  yi=years.index(c['period']);ci=cols.index(c['column']);expected=t['sugar_produced_thousand_tonnes'][yi][ci]/t['cane_crushed_thousand_tonnes'][yi][ci]*100
  check(math.isclose(c['recomputed_from_listed_quantities'],expected,abs_tol=1e-9),'Recovery diagnostic drift')
 check(x['sugar_ownership_event']['current_owner'] is None and not x['sugar_ownership_event']['closure_inferred'],'Sale promoted to current ownership or closure')
 if x['sugar_ownership_event'].get('buyer_verified'):
  e=x['sugar_ownership_event'];catalog=json.loads((D/'source-catalog.json').read_text())
  check(bool(e.get('buyer_at_transaction')) and all(i in catalog for i in e.get('buyer_source_ids',[])) and bool(e.get('buyer_source_ids')),'Historical buyer lacks source references')
  check(e['event_date'] < e['completion_notice_date'],'Sale event and later notice dates collapsed')
  check(e.get('current_operating_status') is None and e.get('deed_independently_reviewed') is False,'Seller disclosure promoted to current operation or independent deed review')
  check(bool(x.get('sugar_ownership_history')),'Prior unknown-buyer checkpoint lost')
 company=set(x['sugar_company_observation_ids'])
 check(not any(company & set(c['inputs']) for c in cal.values()),'Company sale-period data spliced into annual comparison')
 check(obs['food-sugar-aska-sugar_produced-2016-17']['publication_readiness']=='hold_conflict','Aska discrepancy hidden')
print(json.dumps(dict(result='FAIL' if errors else 'PASS',new_observations=len(x['new_observation_ids']),reused_observations=len(x['reused_observation_ids']),errors=errors,scope='Reuse, arithmetic and evidence-stage controls; not human review.'),indent=2));raise SystemExit(bool(errors))
