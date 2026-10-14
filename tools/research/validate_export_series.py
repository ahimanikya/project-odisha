"""Check fiscal-year alignment, attribution guards and held aggregates."""
import json,math
from kb_io import ROOT
D=ROOT/'references/data';x=json.loads((D/'export-series.json').read_text());a=json.loads((D/'statistics-atlas.json').read_text());obs={o['id']:o for o in a['observations']};calcs={c['id']:c for c in a['calculations']};marine={o['id']:o for o in json.loads((D/'maritime-metrics.json').read_text())['observations']};errors=[]
def check(v,m):
 if not v:errors.append(m)
held={i for c in x['conflicts'] for i in c.get('observation_ids',[])}
for s in x['series']:
 rr=[obs[i] for i in s['observation_ids']];check(len(rr)==5,s['id']+': incomplete years');check([r['period'] for r in rr]==s['periods'],s['id']+': periods')
 for r in rr:check(all(r[f]==s[f] for f in ['metric','unit','source_id','geography']),r['id']+': scope')
for oid in held:check(obs[oid]['publication_readiness']=='hold_conflict','Held aggregate promoted')
for cid in x['calculation_ids']:
 c=calcs[cid];start,end=[obs[i] for i in c['inputs']];check(not held&set(c['inputs']),'Held aggregate used');n=4 if 'four-year' in cid else 1;check(int(end['period'][:4])-int(start['period'][:4])==n,'Bad interval');check(math.isclose(c['value'],(end['value']/start['value']-1)*100,abs_tol=1e-8),'Bad calculation')
check(len(x['principal_product_observation_ids'])==20,'Product table incomplete');check(round(sum(obs[i]['value'] for i in x['principal_product_observation_ids']),2)==11859.05,'Product sum changed')
for r in x['component_reconciliation']:
 check(math.isclose(r['reported_total']-r['component_sum'],r['difference'],abs_tol=1e-7),'Component difference error')
check(next(r for r in x['component_reconciliation'] if r['period']=='2021-22')['difference']==34.81,'DEPM discrepancy lost')
shares=[]
for r in x['country_observations']:
 check(r['conversion_to_country_value_allowed'] is False,'Country conversion allowed');b=marine if r['record_path'].endswith('maritime-metrics.json') else obs;check(r['observation_id'] in b,'Missing country reference');shares.append(b[r['observation_id']]['value'])
check(math.isclose(sum(shares),64.4,abs_tol=1e-8),'Country sum');check(len(x['country_observations'])==10,'Country list incomplete');check(sum(r['record_path'].endswith('maritime-metrics.json') for r in x['country_observations'])==3,'Existing countries not reused')
check(all(v is None for v in x['unknowns'].values()),'Unknown scope silently promoted')
for slug in ['metallurgical','marine','agriculture-forest','handloom','handicraft']:check(obs['export-depm-'+slug+'-2023-24']['value']<obs['export-depm-'+slug+'-2022-23']['value'],'Decline lost: '+slug)
print(json.dumps({'result':'FAIL' if errors else 'PASS','annual_observations':65,'principal_products':20,'country_shares':10,'existing_country_ids_reused':3,'comparisons':26,'errors':errors,'scope':'Structure, arithmetic and attribution guards; not source accuracy, source-image review or human approval.'},indent=2));raise SystemExit(bool(errors))
