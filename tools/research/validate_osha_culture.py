"""Check observance provenance, profile linkage and publication boundaries."""
import json
from pathlib import Path
from kb_io import ROOT
D=ROOT/'references/data';r=json.loads((D/'osha-culture.json').read_text());cat=json.loads((D/'source-catalog.json').read_text());calendar=json.loads((D/'seasonal-food-calendar.json').read_text());errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(len({p['id'] for p in r['pages']})==len(r['pages']),'Duplicate profile identity')
check(len({p['slug'] for p in r['pages']})==len(r['pages']),'Duplicate route')
for p in r['pages']:
 path=ROOT/p['canonical_path'];check(path.is_file(),'Missing profile '+p['slug'])
 check(p['coverage_status'] in {'narrative_checkpoint','research_note'},'Unestablished completion '+p['slug'])
 check(p['origin_date'] is None and p['annual_date'] is None and p['local_review'] is None and not p['serving_places'],'Unsupported origin, date, review or venue '+p['slug'])
 check(any(e.get('profile_id')==p['id'] for e in calendar['entries']),'Missing calendar link '+p['slug'])
 for s in p['sections']:
  check(s['evidence_class'] in {'ritual_narrative','documented_description','editorial_interpretation','research_limit','visitor_context'},'Unknown evidence class')
  if s['evidence_class'] in {'ritual_narrative','documented_description'}:check(s['source_ids'] and s['locator'],'Missing claim provenance '+p['slug'])
  check(all(x in cat for x in s['source_ids']),'Missing source '+p['slug'])
  check(all(x in p['source_ids'] and x in r['sources'] for x in s['source_ids']),'Section source missing from renderable profile register '+p['slug'])
  if path.exists():check(s['text'] in path.read_text(),'Structured/prose mismatch '+p['slug'])
 for f in p['related_food_paths']:check((ROOT/(f+'.md')).is_file(),'Missing related food')
w=json.loads((D/'osha-text-witnesses.json').read_text())
check(len({x['id'] for x in w['records']})==len(w['records']),'Duplicate manuscript reference')
for x in w['records']:
 check(x['source_id'] in cat and bool(x['accession']) and bool(x['locator']),'Missing manuscript provenance')
 check(x['profile_slug'] in {p['slug'] for p in r['pages']},'Unlinked manuscript reference')
 check(x['date_of_copy'] is None and x['composition_date'] is None and not x['contents_inspected'],'Catalogue promoted to dated/read manuscript')
 check(not x['independent_variant_established'],'Uncollated variant treated as established')
for x in w['digital_texts']:
 check(x['edition_date'] is None and x['composition_date'] is None,'Unestablished digital-text date')
 check(x['status'] in {'selected_pages_inspected','recovered_not_read','narrative_pages_inspected'},'Unsupported text completion')
 check(len(x['sha256'])==64 and x['pdf_pages']>0,'Missing digital-text capture identity')
# Revision-addressed web transcriptions are not PDF captures.
web=w.get('web_text_witnesses',[])
check(len({x['id'] for x in web})==len(web),'Duplicate web-text identity')
for x in web:
 check(x['source_id'] in cat and x['profile_slug'] in {p['slug'] for p in r['pages']},'Unlinked web-text witness')
 check(x['revision_id']>0 and ('oldid='+str(x['revision_id'])) in x['url'] and bool(x['inspection_scope']),'Missing stable web-text locator')
 check(x['status']=='selected_passages_inspected','Unsupported web-text completion')
 check(x['edition_date'] is None and x['composition_date'] is None,'Unestablished web-text date')
 check(x['local_capture'] is None and x['sha256'] is None,'Unestablished downloaded web capture')
comparison=json.loads((D/'sudasa-text-comparison.json').read_text())
check(len({x['id'] for x in comparison['rows']})==len(comparison['rows']),'Duplicate comparison identity')
for x in comparison['rows']:
 check(x['evidence_class']=='ritual_narrative' and not x['historical_event_verified'],'Narrative promoted to history')
 for version in ['verse','prose']:
  check(x[version]['source_id'] in cat and bool(x[version]['locator']),'Missing comparison provenance')
  check(x[version]['text'] in (ROOT/'culture/osha/sudasa-text-comparison.md').read_text(),'Comparison prose/data mismatch')
for x in comparison.get('supplemental_passages',[]):
 check(x['source_id'] in cat and bool(x['locator']),'Missing supplementary passage provenance')
 check(x['evidence_class']=='ritual_narrative' and not x['historical_event_verified'],'Supplementary passage promoted to history')
 check(x['text'] in (ROOT/'culture/osha/sudasa-text-comparison.md').read_text(),'Supplementary comparison prose/data mismatch')
 check(x['text'] in (ROOT/'culture/osha'/ (x['profile_slug']+'.md')).read_text(),'Supplementary profile prose/data mismatch')
check(all(v is None for v in comparison['edition_dates'].values()) and comparison['earliest_observance_date'] is None,'Unestablished chronology')
check(not comparison['human_review_claimed'] and not comparison['full_diplomatic_transcription'],'Unperformed review or full collation')
check(not r['human_review_claimed'] and not r['fieldwork_conducted'],'Unestablished human review or fieldwork')
print(json.dumps(dict(result='FAIL' if errors else 'PASS',profiles=len(r['pages']),catalogue_records=len(w['records']),digital_texts=len(w['digital_texts']),web_text_witnesses=len(web),comparison_dimensions=len(comparison['rows']),narrative_checkpoints=sum(p['coverage_status']=='narrative_checkpoint' for p in r['pages']),errors=errors,scope='Identity, provenance, prose/data consistency and unverified-field boundaries; not independent cultural review.'),indent=2))
raise SystemExit(bool(errors))
