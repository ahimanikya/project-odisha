#!/usr/bin/env python3
"""Check interval alignment, source vintage and preserved adverse movements."""
from pathlib import Path
import json, math
here=Path(__file__).resolve()
root=here.parents[1] if (here.parents[1]/'references/data').exists() else here.parents[2]/'kb/research'
data=root/'references/data'
x=json.loads((data/'economic-time-series.json').read_text());a=json.loads((data/'statistics-atlas.json').read_text());obs={o['id']:o for o in a['observations']};errors=[]
def check(v,msg):
 if not v: errors.append(msg)
def close(a,b):return math.isclose(a,b,rel_tol=1e-9,abs_tol=1e-8)
periods=[f'{y}-{str(y+1)[2:]}' for y in range(2011,2026)]
check(x['survey_vintage']=='Odisha Economic Survey 2025–26','mixed/unknown vintage')
check(x['publication_readiness']=='needs_source_table_review','visual review gate lost')
for s in x['series']:
 rows=[obs[v] for v in s['observation_ids']]
 check([r['period'] for r in rows]==periods,s['id']+': missing annual period')
 for r in rows:
  check(r['unit']==s['unit'] and r['metric']==s['metric'] and r['geography']==s['geography'],r['id']+': incomparable scope')
  check(r['source_id']==s['source_id'],r['id']+': inconsistent publication')
  check(close(r['value'],r['source_value']/100),r['id']+': lakh/crore conversion')
 check(rows[-1]['evidence_status']=='advance_estimate',s['id']+': endpoint estimate lost')
 for years in [5,10]:
  c=next(c for c in x['comparisons'] if c['series_id']==s['id'] and c['elapsed_years']==years)
  start,end=[obs[i] for i in c['inputs']]
  check(c['inputs']==[s['observation_ids'][-1-years],s['observation_ids'][-1]],c['id']+': mismatched endpoints')
  check(int(end['period'][:4])-int(start['period'][:4])==years,c['id']+': interval count')
  check(close(c['total_change_pct'],(end['value']/start['value']-1)*100),c['id']+': total change')
  check(close(c['cagr_pct'],((end['value']/start['value'])**(1/years)-1)*100),c['id']+': CAGR')
 for i,r in enumerate(rows[1:],1):
  c=next(c for c in x['annual_changes'] if c['series_id']==s['id'] and c['period']==r['period'])
  check(close(c['change_pct'],(r['value']/rows[i-1]['value']-1)*100),s['id']+r['period']+': annual change')
for slug,period in [('real-gsdp','2020-21'),('real-gsdp','2022-23'),('manufacturing','2022-23'),('services','2020-21')]:
 check(next(c for c in x['annual_changes'] if c['series_id']==slug and c['period']==period)['change_pct']<0,'adverse movement lost')
# Two reused sector series must agree; this is lineage reconciliation, not corroboration.
old=json.loads((data/'industry-growth-data.json').read_text())
for slug,name in [('manufacturing','Manufacturing'),('construction','Construction')]:
 s=next(s for s in x['series'] if s['id']==slug);r=next(r for r in old['real_sector_series'] if r['sector']==name)
 for p,v in zip(r['periods'],r['values']):check(close(obs[s['observation_ids'][periods.index(p)]]['value'],v),slug+': prior capture changed')
print(json.dumps({'result':'FAIL' if errors else 'PASS','series':len(x['series']),'annual_observations':sum(len(s['observation_ids']) for s in x['series']),'comparisons':len(x['comparisons']),'annual_changes':len(x['annual_changes']),'errors':errors},indent=2))
raise SystemExit(bool(errors))
