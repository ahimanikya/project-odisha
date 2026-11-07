from pathlib import Path
import json,hashlib,subprocess
if not __debug__:raise RuntimeError('Optimized Python refused')
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();b=json.loads((P/'baseline.json').read_text());errors=[]
for group,root in [('canonical_book_files',R),('shared_article_cinema_record_files',R),('prior_coverage_bindings',ROOT),('local301_files',Path(b['local301_stage']))]:
 for name,row in b[group].items():
  h=row['sha256'] if isinstance(row,dict) else row;f=root/name
  if not f.is_file() or sha(f)!=h or (isinstance(row,dict) and f.stat().st_size!=row['bytes']):errors.append({'group':group,'path':name})
assert not errors,errors
r={'status':'PASS','input_head':b['input_head'],'checked_head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'counts':{k:len(b[k]) for k in ['canonical_book_files','shared_article_cinema_record_files','prior_coverage_bindings','local301_files']},'baseline_sha256':sha(P/'baseline.json'),'all_hashes_exact':True,'scope':'Read-only rehash; local301 and public299 distinct, no byte changes or programmecredit.'}
(P/'preservation-check.json').write_text(json.dumps(r,indent=2)+'\n');print(sha(P/'preservation-check.json'))
