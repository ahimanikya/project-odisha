#!/usr/bin/env python3
"""Validate seasonal food references and evidence boundaries, not cultural accuracy."""
from pathlib import Path
import json
from kb_io import ROOT
K=ROOT;D=K/'references/data'
r=json.loads((D/'seasonal-food-calendar.json').read_text());cat=json.loads((D/'source-catalog.json').read_text());errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(len({e['id'] for e in r['entries']})==len(r['entries']),'Duplicate seasonal identity')
for e in r['entries']:
 check(e['evidence_status'] in {'documented_association','provisional_indexed_association'},'Unknown evidence class')
 check(e['source_ids'] and all(s in cat for s in e['source_ids']),'Missing source identity')
 check(bool(e['source_locator']) and bool(e['geography']),'Missing locator or geography scope')
 for p in e['food_paths']:check((K/(p+'.md')).is_file(),'Missing canonical food '+p)
 if e['gregorian_date'] is not None:check(e.get('calendar_source') and e['occurrence_year'],'Date requires year and evidence')
 if e['venue_ids'] or e['current_serving_availability'] is not None:check(e.get('serving_evidence'),'Serving claim lacks evidence')
 check(e['visitor_access'] is None and e['host_consent'] is None and e['local_review'] is None,'Unestablished access, consent or review')
for f in r['failed_fetches']:check(f['status']=='unavailable','Failure reclassified')
check(r['human_review_claimed'] is False and r['fieldwork_conducted'] is False,'Unestablished review/fieldwork')

# Historical and announced services must never become implicit current offers.
if r.get('public_food_evidence_register'):
 p=K/r['public_food_evidence_register'];check(p.is_file(),'Missing public-food evidence register')
 if p.is_file():
  evidence=json.loads(p.read_text());records=evidence['records'];ids={x['id'] for x in records}
  check(len(ids)==len(records),'Duplicate public-food evidence identity')
  for x in records:
   check(x['evidence_class'] in {'reported_historical_service','undated_operator_description','institutional_announcement'},'Unknown public-food evidence class')
   check(all(i in cat for i in x['source_ids']) and bool(x['locator']),'Public-food source or locator missing')
   check(x['current_serving_availability'] is None and x['current_year_offer_verified'] is False,'Historical or announced service promoted to current availability')
   check(x['host_consent'] is None,'Unestablished host consent')
   if x['date_start']:
    from datetime import date
    start=date.fromisoformat(x['date_start']);end=date.fromisoformat(x['date_end'])
    check(start<=end and start.year==x['event_year'],'Event date/year mismatch')
   if x['evidence_class']=='undated_operator_description':check(x['event_year'] is None and x['date_start'] is None,'Undated copy acquired inferred event year')
  for entry in r['entries']:
   check(all(i in ids for i in entry.get('historical_service_evidence_ids',[])),'Unresolved seasonal service evidence')
  for f in evidence['failed_fetches']:check(f['status']=='unavailable','Public-food failed fetch misclassified')

# Validate the optional derivative whenever seasonal data is checked.
if r.get('navigation_register'):
 from validate_osha_navigation import validate as validate_navigation
 navigation_path=K/r['navigation_register']
 check(navigation_path.is_file(),'Missing seasonal navigation register')
 if navigation_path.is_file():errors.extend(validate_navigation(json.loads(navigation_path.read_text()),K))

print(json.dumps({'result':'FAIL' if errors else 'PASS','errors':errors,'selected_observances':len(r['entries']),'provisional_associations':sum(e['evidence_status']=='provisional_indexed_association' for e in r['entries']),'scope':'Reference and evidence-boundary consistency only.'},indent=2))
raise SystemExit(bool(errors))
