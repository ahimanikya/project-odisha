#!/usr/bin/env python3
"""Check navigation references and prevent calendar evidence being silently promoted."""
from pathlib import Path
import hashlib,json
from kb_io import ROOT
K=ROOT
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
def validate(data,k=K):
 errors=[]
 def check(ok,msg):
  if not ok:errors.append(msg)
 d=k/'references/data';profiles={p['id']:p for p in json.loads((d/'osha-culture.json').read_text())['pages']};seasonal={e['id']:e for e in json.loads((d/'seasonal-food-calendar.json').read_text())['entries']};catalog=json.loads((d/'source-catalog.json').read_text());rows=data['rows'];months={m['id'] for m in data['months']}
 check(len(rows)==len(profiles) and {r['profile_id'] for r in rows}==set(profiles),'Navigation must cover each profile exactly once')
 check(len({r['seasonal_id'] for r in rows})==len(rows),'Seasonal identity duplicated')
 check(data['human_review_claimed'] is False,'Unestablished human review')
 allowed={'source_month','month_span','recurring','recurring_with_conflict','month_conflict','identity_conflict','solar_transition','unknown'}
 for r in rows:
  label=r['profile_id'];p=profiles.get(label);e=seasonal.get(r['seasonal_id']);check(bool(p) and bool(e),label+': missing identity')
  if not p or not e:continue
  check(e['profile_id']==label,label+': identity join changed')
  check(r['calendar_status'] in allowed,label+': invalid calendar status')
  check(set(r['month_ids']+r['unresolved_month_ids'])<=months,label+': unknown month')
  check(len(r['month_ids'])==len(set(r['month_ids'])),label+': duplicate month')
  if r['calendar_status'] not in {'source_month','month_span'}:check(not r['month_ids'],label+': held/recurring/solar evidence promoted into ordinary month facet')
  if r['calendar_status']=='source_month':check(len(r['month_ids'])==1,label+': month label missing')
  if r['calendar_status']=='month_span':check(len(r['month_ids'])>1,label+': span collapsed')
  check(r['traditional_month_verbatim']==p['traditional_month'] and r['calendar_rule_verbatim']==e['calendar_rule'],label+': raw timing changed')
  check(r['food_terms_verbatim']==e['foods'],label+': food comparison scope changed')
  check(r['source_checked_on']==p['checked_on'],label+': source date refreshed by navigation')
  check(r['profile_digest']==digest(p) and r['seasonal_entry_digest']==digest(e),label+': saved evidence changed; review derivative')
  check(r['profile_path']==p['canonical_path'] and r['route']==p['route'] and (k/r['profile_path']).is_file(),label+': unresolved canonical page')
  expected=[{'section_title':s['title'],'evidence_class':s['evidence_class'],'source_ids':s['source_ids'],'locator':s['locator']} for s in p['sections'] if s['source_ids']]
  check(r['evidence_sections']==expected,label+': source section locators drifted')
  check(r['source_ids'] and all(s in catalog for s in r['source_ids']),label+': missing source')
  check(bool(r['calendar_note']) and bool(r['food_role_note']),label+': scope note missing')
  check(r['annual_date'] is None and r['current_serving_availability'] is None,label+': navigation acquired date or availability claim')
 return errors
if __name__=='__main__':
 data=json.loads((K/'references/data/osha-seasonal-navigation.json').read_text());errors=validate(data)
 print(json.dumps({'result':'FAIL' if errors else 'PASS','errors':errors,'profiles':len(data['rows']),'scope':'Reference, drift and evidence-boundary checks; not human factual or calendar review.'},indent=2))
 raise SystemExit(bool(errors))
