"""Validate bounded district coverage references and scope; not source freshness."""
import argparse,collections,hashlib,json,sys
from pathlib import Path
from kb_io import ROOT
p=argparse.ArgumentParser();p.add_argument('--project-root',type=Path);args=p.parse_args()
d=json.loads((ROOT/'references/data/district-coverage.json').read_text());errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
expected='angul balangir balasore bargarh bhadrak boudh cuttack deogarh dhenkanal gajapati ganjam jagatsinghpur jajpur jharsuguda kalahandi kandhamal kendrapara keonjhar khordha koraput malkangiri mayurbhanj nabarangpur nayagarh nuapada puri rayagada sambalpur subarnapur sundargarh'.split()
check(sorted(r['id'] for r in d['districts'])==expected,'Expected exactly 30 distinct district identities')
check(d['domains']==['health','education','livelihoods','environment','visitor'],'Unexpected domains')
loaded={};external_skipped=[]
for key,i in d['inputs'].items():
 if i.get('role')=='source_only_mapping_context':
  check(len(i['sha256'])==64,'Missing source-context fingerprint');continue
 root=ROOT if i['layer']=='source' else args.project_root
 if root is None:
  check(bool(i.get('revision')) and bool(i.get('repository_url')),'Unpinned project input '+key);external_skipped.append(key);continue
 path=root/i['path'];check(path.is_file(),'Missing input '+str(path))
 if path.is_file():loaded[key]=json.loads(path.read_text())
 if i.get('audit_snapshot'):
  snap=i['audit_snapshot'];check(hashlib.sha256(json.dumps(snap,sort_keys=True).encode()).hexdigest()==i['audit_snapshot_sha256'],'Audit snapshot digest mismatch')
  for collection,records in snap.items():
   existing={x['id']:x for x in loaded[key][collection]}
   for record in records:
    check(record['source_id'] in d['source_catalog_capture'],'Missing snapshot source provenance')
    if record['id'] in existing:check(existing[record['id']]==record,'Audit snapshot and local record differ: '+record['id'])
    else:loaded[key][collection].append(record)
 # Hashes describe captured input versions. Reconciled KB files may contain later or additional records.
 check(len(i['sha256'])==64,'Missing captured input fingerprint '+key)
refs=0
for r in d['districts']:
 check((ROOT/r['district_page']).is_file(),'Missing district page '+r['id'])
 check(set(r['domains'])==set(d['domains']),'Missing domain '+r['id'])
 for domain,c in r['domains'].items():
  check(bool(c['missing_evidence']),'Missing residual gap '+r['id']+'/'+domain)
  scopes={e['scope'] for e in c['evidence']};derived=next((s for s in d['status_order'] if s in scopes),'not_mapped_in_audit')
  check(c['status']==derived,'Wrong displayed status '+r['id']+'/'+domain)
  check((c['status']=='not_mapped_in_audit')==(not c['evidence']),'Unknown encoded incorrectly')
  seen=set()
  for e in c['evidence']:
   refs+=1;identity=(e['input'],e['collection'],e['identity_field'],e['record_id']);check(identity not in seen,'Duplicate cell reference');seen.add(identity)
   check(e['input'] in d['inputs'],'Unregistered input');check(bool(e['interpretation_limit']),'Missing scope limit')
   if e['input'] not in loaded:continue
   matches=[x for x in loaded[e['input']][e['collection']] if x.get(e['identity_field'])==e['record_id']]
   check(bool(matches),'Unresolved reference '+str(identity))
   if e['scope']=='district_measure':
    check(all(bool(x.get('period')) and bool(x.get('unit')) and bool(x.get('source_id')) for x in matches),'District measure missing period/unit/source')
    check(all(x.get('geography','').lower() in [r['id']+' district',r['id']+' district, odisha'] for x in matches),'District geography mismatch '+r['id'])
for domain in d['domains']:check(d['summary'][domain]==dict(collections.Counter(r['domains'][domain]['status'] for r in d['districts'])),'Summary drift '+domain)
print(json.dumps({'result':'FAIL' if errors else 'PASS','districts':len(d['districts']),'domains':len(d['domains']),'reference_uses':refs,'external_inputs_not_resolved_locally':external_skipped,'errors':errors,'scope':'Reference integrity and geographic scope; not source freshness, semantic completeness or publication approval.'},indent=2));sys.exit(bool(errors))
