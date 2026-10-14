"""Check attribution boundaries and references, not the historical truth of claims."""
import json,sys
from kb_io import ROOT
D=ROOT/'references/data'
d=json.loads((D/'sadhaba-maritime-science.json').read_text())
sources=json.loads((D/'source-catalog.json').read_text());errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(len({c['id'] for c in d['claims']})==len(d['claims']),'Duplicate claim ID')
allowed={'historical_reconstruction','iconographic_interpretation','later_practice','modern_physics','bibliographic_lead','archaeometric_inference'}
for c in d['claims']:
 check(c['source_id'] in sources,c['id']+': missing source')
 check(c['evidence_class'] in allowed,c['id']+': unknown evidence class')
 for key in ['period','geography','locator','limitation','access','checked_on']:check(bool(c.get(key)),c['id']+': missing '+key)
 check((ROOT/c['concept_path']).is_file(),c['id']+': missing concept')
 if c['evidence_class'] in ['later_practice','modern_physics','bibliographic_lead']:check(c['ancient_sadhaba_attribution']=='unestablished',c['id']+': unsupported ancient attribution')
 check(c['human_reviewed'] is False,c['id']+': human review not established')
check(len({x['id'] for x in d['unknowns']})==len(d['unknowns']),'Duplicate unknown ID')
for x in d['unknowns']:check(x['value'] is None and bool(x['next_action']),x['id']+': unresolved field promoted or missing next action')
for group in d['source_lineages']:check(set(group['source_ids'])<=sources.keys(),'Unresolved lineage source')
check(d['human_review_claimed'] is False and d['website_publication'] is False,'Unsupported review/publication state')
print(json.dumps({'result':'FAIL' if errors else 'PASS','claims':len(d['claims']),'unknowns':len(d['unknowns']),'errors':errors,'scope':'Reference integrity and evidence-class boundaries; not human historical review.'},indent=2));sys.exit(bool(errors))
