if not __debug__:raise RuntimeError('Optimized Python refused')
"""Portable receipt proposal only; no canonical writes, network, Git or sync."""
from pathlib import Path
import os,json,hashlib,argparse,shutil,re
P=Path(__file__).absolute().parent
for q in [P,*P.parents]:
 if q.is_symlink():raise RuntimeError('Symlinked output ancestor refused')
def need(v,m):
 if not v:raise ValueError(m)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text())
def main():
 need(os.environ.get('RUN_AUTHORIZED_299_RECEIPT')=='1','Explicit output receipt authorization required')
 a=argparse.ArgumentParser();a.add_argument('--facts',required=True,type=Path);a.add_argument('--output-name',required=True);args=a.parse_args();need(re.fullmatch('[a-z0-9-]+',args.output_name),'Simple output name required');out=P/args.output_name;need(not out.exists() and not out.is_symlink(),'No overwrite')
 facts=rd(args.facts);need(facts.get('status')=='ALL_ACTUAL_GATES_FROZEN','Actual facts remain pending')
 need(facts['merge']=='b052dc9ace89f8764fe66b3a442b588ee6608d63' and facts['deployment_run']==41757002482 and facts['release_pr']==672,'Release mismatch')
 need(facts['counts']=={'entries':299,'illustrations':299,'distinct_additions_since_public251':48,'programme_credit':0,'programme_completed':134,'original_pending':75},'Counts mismatch')
 need(facts['pdf']=={'pages':193,'bytes':109520119,'sha256':'cb34aaab4a137a68d962e3d5a382490025144a3e66a7186d9123ad00d220c93a','release_immutable':False},'Exact PDF/mutable limit mismatch')
 required=['required_ci','deployment','remote_files','production_review','source_preservation','site_gates','exact_head_review','release_asset_verification','live_http_qualified_summary','live_browser','separate_live_review','local_reader_sync','separate_post_sync_review']
 copies=[];docs={}
 for key in required:
  g=facts['gates'].get(key);need(g and g.get('result')=='PASS' and g.get('path') and g.get('sha256'),key+' pending')
  path=Path(g['path']);need(path.is_file() and sha(path)==g['sha256'],key+' changed/missing');need(g.get('actual_checks') and isinstance(g.get('limits'),list),key+' checks/limits missing');docs[key]=rd(path);copies.append((path,'evidence/'+key+'.json'))
 for key,head,run in [('required_ci',facts['reviewed_head'],facts['required_ci_run']),('deployment',facts['merge'],facts['deployment_run'])]:
  d=docs[key];need(d.get('conclusion')=='success' and d.get('status')=='completed' and d.get('headSha')==head and d.get('databaseId')==run,key+' raw success mismatch')
 remote=docs['remote_files'];need(remote.get('status')=='PASS' and remote.get('commit')==facts['merge'] and remote.get('candidate_head')==facts['reviewed_head'] and remote.get('matched')==remote.get('total') and remote.get('total',0)>0,'Remote report mismatch')
 browser=docs['live_browser'];need(browser.get('status')=='PASS_ACTUAL_LIVE_CHROME_CHECKS' and browser.get('deployed_merge')==facts['merge'] and browser.get('deployment_run_id')==facts['deployment_run'],'Browser mismatch')
 # Final separate review must explicitly bind this complete gate inventory, including actual sync.
 final=docs['separate_post_sync_review'];need(final.get('decision')=='PASS' and final.get('deployed_merge')==facts['merge'],'Final separate review pending')
 need(final.get('local_sync_sha256')==facts['gates']['local_reader_sync']['sha256'] and final.get('live_review_sha256')==facts['gates']['separate_live_review']['sha256'],'Final review sync/live binding mismatch')
 for key in required[:-1]:need(final.get('receipt_gate_hashes',{}).get(key)==facts['gates'][key]['sha256'],'Final review must bind gate '+key)
 # Exact portable supporting evidence (logs, pair manifests, screenshots, raw captures) supplied by root.
 for row in facts['portable_evidence']:
  source=Path(row['source']);dest=row['destination'];need(dest.startswith('evidence/') and not Path(dest).is_absolute() and '..' not in Path(dest).parts,'Unsafe evidence path');need(source.is_file() and sha(source)==row['sha256'] and source.stat().st_size==row['bytes'],'Portable evidence drift');copies.append((source,dest))
 need(len({x[1] for x in copies})==len(copies),'Duplicate evidence target');need(facts['portable_evidence'],'Portable supporting evidence inventory required')
 out.mkdir()
 for source,name in copies:
  target=out/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
 receipt={**facts,'status':'RECEIPT_CANDIDATE_PENDING_ROOT_INTEGRATION','scope_release':'Only after actual receipt CI/merge/remote checks; helper does not release ownership','limits':facts['limits']+['Evidence assembly only; no sync/publication/canonical operation performed.']}
 for key in required:receipt['gates'][key]['path']='evidence/'+key+'.json'
 (out/'receipt-candidate.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');shutil.copy2(args.facts,out/'input-facts.json')
 manifest={str(x.relative_to(out)):{'sha256':sha(x),'bytes':x.stat().st_size} for x in out.rglob('*') if x.is_file()};(out/'receipt-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(out)
if __name__=='__main__':main()
