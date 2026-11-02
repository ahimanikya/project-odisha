"""Offline fail-closed guard; no network or writes."""
import json,os,re,hashlib
from pathlib import Path
def verify_deployment():
 assert os.environ.get('RUN_AUTHORIZED_LIVE')=='1','Coordinator authorization required'
 o=Path(__file__).resolve().parent;p=json.loads((o/'plan.json').read_text())
 h=lambda q:hashlib.sha256(q.read_bytes()).hexdigest()
 required=['expected_public_files','expected_html','expected_pdf_url','expected_pdf_sha256','expected_pdf_pages','expected_candidate_head','candidate_manifest_path','candidate_manifest_sha256','final_review_path','final_review_sha256','expected_merge','expected_deployment_id']
 assert all(p.get(k) for k in required),'Final reviewed candidate fields pending'
 assert p['entries']==249 and p['baseline_entries']==245
 for name,digest in p['known_file_sha256'].items():assert h(o/name)==digest,('Known evidence changed',name)
 assert h(Path(p['candidate_manifest_path']))==p['candidate_manifest_sha256']
 assert h(Path(p['final_review_path']))==p['final_review_sha256','expected_merge','expected_deployment_id']
 d=json.loads(Path(p['deployment_status_path']).read_text());run=os.environ.get('DEPLOYMENT_ID','');head=os.environ.get('DEPLOYED_HEAD','')
 assert run.isdigit() and re.fullmatch('[0-9a-f]{40}',head)
 assert head==p['expected_merge'] and run==str(p['expected_deployment_id']),'Actual approved deployment binding required'
 assert str(d['databaseId'])==run and d['headSha']==head and d['status']=='completed' and d['conclusion']=='success'
 c=json.loads((o/'candidate-plan.json').read_text())
 assert c['candidate_head']==p['expected_candidate_head'] and c['plan_sha256']==h(o/'plan.json')
 for key in ['pdf_sha256','pdf_url','pdf_pages']:assert c[key]==p['expected_'+key]
 assert len(c['reader_manifest'])==p['expected_public_files'] and sum(k.endswith('.html') for k in c['reader_manifest'])==p['expected_html']
 assert c['new_entry_ids']==p['new_entry_ids']==[246,247,248,249]
 assert c['companion_local_manifest'] and c['search_routes']
 for rel,digest in c['companion_local_manifest'].items():assert h(Path(p['repo'])/'projects/site/dist-publish'/rel)==digest,('Frozen companion changed',rel)
