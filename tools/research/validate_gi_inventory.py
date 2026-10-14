"""Check GI identity/count/date safeguards; not legal validity certification."""
import json,sys
from collections import Counter
from kb_io import ROOT
x=json.loads((ROOT/'references/data/odisha-gi-products.json').read_text());errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
e=x['entries'];apps={a['application_number']:a for a in x['application_checks']};ids=[n for r in e for n in r['application_numbers']];c=x['counts']
check(len(e)==c['list_entries']==26,'Dated list coverage changed')
check([r['source_row'] for r in e]==list(range(396,422)),'Missing/duplicate state-list row')
check(len(set(ids))==len(ids)==c['distinct_application_ids']==28,'Application identity duplicated or lost')
check(sum(r['entry_kind']=='logo' for r in e)==c['separate_logo_entries']==1,'Logo count mismatch')
check(sum(r['entry_kind']=='named_product' for r in e)==c['named_non_logo_entries']==25,'Product count mismatch')
check(dict(Counter(r['goods_category'] for r in e))==c['goods_categories'],'Goods counts differ')
for r in e:
 check(r['list_as_of']=='2025-12-31','List cutoff changed')
 check(r['source_locator']==f"PDF p.{7 if r['source_row']<=406 else 8}, Odisha row {r['source_row']}",'Page locator mismatch')
 check(all(n in apps for n in r['application_numbers']),'Unchecked application')
 check(all((ROOT/p).is_file() for p in r['existing_research_paths']),'Missing reused page')
 check(all(r[k] is None for k in ['production_quantity','producer_income','export_quantity','export_value']),'Unsupported economic value')
 check(apps[r['application_numbers'][0]]['raw_fields']['Status']=='Registered','Nonregistered entry promoted')
for r in x['excluded_pending_applications']:
 check(r['application_number'] not in ids,'Pending application counted as registered')
 check(apps[r['application_number']]['raw_fields']['Status']==r['status'],'Pending status drift')
check(apps[108]['raw_fields']['Status']==apps[544]['raw_fields']['Status']=='Merged','Merged identities lost')
check(next(r for r in e if r['id']=='gi-odisha-386')['related_product_id']=='gi-odisha-88','Logo relationship lost')
check(x['controls']['current_legal_validity_certified'] is False,'Validity certification inferred')
check({10,22,773}==set(x['open_questions'][1]['application_numbers']),'Renewal holds lost')
print(json.dumps({'result':'FAIL' if errors else 'PASS','list_entries':len(e),'application_checks':len(apps),'errors':errors,'scope':'Dated inventory identities, locators and safeguards; not legal validity, economic impact or post-cutoff completeness.'},indent=2));sys.exit(bool(errors))
