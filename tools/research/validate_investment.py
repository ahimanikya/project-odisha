#!/usr/bin/env python3
"""Validate project identity, dated stage and non-additive money boundaries."""
from pathlib import Path
import json
h=Path(__file__).resolve();root=h.parents[1] if (h.parents[1]/'references/data').exists() else h.parents[2]/'kb/research'
d=root/'references/data';x=json.loads((d/'investment-tracker.json').read_text());catalog=json.loads((d/'source-catalog.json').read_text());errors=[]
def check(v,m):
 if not v:errors.append(m)
obs={o['id']:o for o in x['observations']};projects={p['id']:p for p in x['project_records']}
check(len(obs)==len(x['observations']),'duplicate observation ID')
check(len(projects)==len(x['project_records']),'duplicate project ID')
check(x['statewide_realised_total'] is None,'unsupported statewide total')
for o in x['observations']:
 check(o['source_id'] in catalog,o['id']+': source missing')
 check(o['additive'] is False,o['id']+': mixed-stage observations cannot be added')
 if 'project_id' in o:check(o['project_id'] in projects,o['id']+': project missing')
events=[]
for p in projects.values():
 check(p['actual_new_construction_expenditure'] is None,p['id']+': unverified construction expenditure')
 check(p['domestic_foreign_funding_split'] is None,p['id']+': unsupported financing split')
 check(p['additive'] is False,p['id']+': overlapping acquisition/expansion summed')
 for oid in p['financial_observation_ids']:check(oid in obs and obs[oid]['project_id']==p['id'],p['id']+': finance scope mismatch')
 for e in p['stage_events']:
  events.append(e['id']);check(e['source_id'] in catalog,e['id']+': source missing');check(bool(e['source_locator']) and bool(e['date_precision']),e['id']+': incomplete date/source')
 for r in p['related_project_ids']:check(r in projects,p['id']+': related identity missing')
check(len(events)==len(set(events)),'duplicate event ID')
acq=projects['IMFA-KNR2-ACQUISITION'];green=projects['IMFA-KNR1-GREENFIELD'];exp=projects['IMFA-KNR2-FIFTH-FURNACE']
check(acq['investment_type']=='existing_asset_acquisition' and green['investment_type']=='greenfield_construction','asset transfer conflated with construction')
check(exp['parent_project_id']==acq['id'],'expansion attached to wrong plant')
check(exp['stage_events'][-1]['stage']=='not_implemented','unimplemented expansion promoted to operation')
check(green['stage_events'][-1]['stage']=='construction_reported','target dates promoted to commissioning')
check(obs['IN05']['value']==610 and obs['IN06']['value']==707.27 and obs['IN07']['value']==25.03,'transaction amounts changed: revisit source and validator')
check(all(obs[i]['unit']=='INR crore' for i in ['IN05','IN06','IN07']),'transaction unit mismatch')
check(obs['IN07']['evidence_status']=='asset_acquisition_accounting','assumed working capital mislabeled cash payment')
# NALCO project estimates and CWIP components must not become cash expenditure.
nalco_ids=['NALCO-DAMANJODI-FIFTH-STREAM','NALCO-SOUTH-BLOCK-CONVEYOR','NALCO-POTTANGI-MINE']
for pid in nalco_ids:check(pid in projects,pid+': identity missing')
check(projects[nalco_ids[0]]['stage_events'][-1]['stage']=='trial_testing_reported','refinery trials promoted to commercial operation')
check(projects[nalco_ids[1]]['stage_events'][-1]['stage']=='construction_reported','conveyor target promoted to operation')
check(projects[nalco_ids[2]]['stage_events'][-1]['stage']=='development_operator_appointed','mine development appointment promoted to production')
check(obs['IN09']['project_id']==obs['IN10']['project_id'],'conveyor estimate vintages split into duplicate projects')
check(all(obs[i]['evidence_status']=='accounting_balance_component' and obs[i]['period_type']=='point_in_time' for i in ['IN11','IN12']),'CWIP component promoted to cash flow')
check(obs['IN08']['evidence_status']=='projected_cost','refinery estimate promoted to expenditure')
print(json.dumps({'result':'FAIL' if errors else 'PASS','project_identities':len(projects),'financial_and_seed_observations':len(obs),'stage_events':len(events),'errors':errors},indent=2));raise SystemExit(bool(errors))
