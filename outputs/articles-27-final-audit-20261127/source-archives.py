import importlib.util,json,re,time,hashlib,subprocess,datetime,email.utils
from pathlib import Path
sp=importlib.util.spec_from_file_location('audit',Path(__file__).with_name('source-audit.py'));m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
HERE=Path(__file__).resolve().parent
config=[('dhemsa','79-97.pdf',[14],['Gadabas','Dhemsa','Tamak','Mahuri']),('bali-jatra','864.pdf',[0,6],['northeast','southwest','monsoon']),('raja-essay','122-123.pdf',[0],['Basumata','Pahili','122']),('raja-event','raja-mahotsav',None,['Raja Parba','Podapitha','rope']),('balasore-survey','2019101567-1.pdf',[18,19],['Budhabalanga','Similipal','River System']),('unesco','unesco.org/en/mab/similipal',None,['perennial streams','waterfalls','sal tree']),('dana','uid=NEW2243',[0,1,5],['810896','6210','27']),('poem','Entire_ORA_2017.pdf',[27],['BANDE UTKALA JANANI','Kantakabi','Kanta Sahitya Mala']),('kantakabi','43-47.pdf',[2,3],['Khadar','spinning','nationalist']),('shell-paper','10701589',None,['2008 to 2011','Manikapatana','two stages']),('craft-directory','Baleswar.pdf',[57],['Bhogarai','Sea Shell Work','3263'])]
T=m.targets();urls=[u for u in T if u.startswith('https://web.archive.org/')];report={'started_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Sequential verified-TLS replay GETs with five-second spacing; exact capture metadata and actual content checked. No archive timestamp guessing or live-origin fallback. Large poem PDF uses a fresh1MiB prefix comparison against the previously fully verified exact52.4MB temporary PDF, followed by local page28 extraction; all other PDFs inspected from current payload.','expected_unique_archives':11,'results':[]}
if (HERE/'source-archives.json').exists(): report=json.loads((HERE/'source-archives.json').read_text())
def save(): (HERE/'source-archives.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
for index,(key,part,pages,terms) in enumerate(config):
 if any(r.get('key')==key for r in report['results']):continue
 u=next(u for u in urls if part in u)
 if index:time.sleep(5)
 row,body=m.fetch(u,3*1024*1024);row['key']=key;row['references']=T[u];row['expected_capture_timestamp']=re.search(r'/web/(\d{14})/',u)[1]
 if row['classification']=='rate_limited':
  row['content_verdict']='not_verified_due_to_rate_limit';report['results'].append(row);report['stopped_after_rate_limit']=True;save();print('RATE_LIMIT',key,flush=True);break
 if row['classification']=='reachable':
  s=body.decode('utf8','replace');row['capture_timestamp_in_final_url']='/'+row['expected_capture_timestamp']+'/' in row.get('final_url','');row['capture_timestamp_in_replay_metadata']=bool(re.search(r'__wm\.wombat\([^;]*'+row['expected_capture_timestamp'],s));row['memento_date_matches_capture']=False
  if row.get('memento_datetime'):
   try:row['memento_date_matches_capture']=email.utils.parsedate_to_datetime(row['memento_datetime']).strftime('%Y%m%d%H%M%S')==row['expected_capture_timestamp']
   except Exception:pass
  if pages is not None:
   embeds=re.findall(r'<(?:iframe|embed|object)\b[^>]*(?:src|data)=[\"\']([^\"\']+)',s,re.I);es=[x for x in embeds if x.startswith('https://web.archive.org/') and ('if_/' in x or 'id_/' in x)]
   row['observed_embedded_pdf_urls']=es
   if es:
    time.sleep(5);pr,pdf=m.fetch(es[0],1024*1024 if key=='poem' else 12*1024*1024);row['payload']=pr
    if pr['classification']=='rate_limited':
     row['content_verdict']='viewer_verified_payload_rate_limited';report['results'].append(row);report['stopped_after_rate_limit']=True;save();break
    if pr.get('pdf_signature'):
     if key=='poem':
      local=Path('/tmp/odisha-ora2017-archive-review.pdf');full=local.read_bytes();row['fresh_prefix_matches_reviewed_full_pdf']=full[:len(pdf)]==pdf;row['reviewed_full_pdf_sha256']=hashlib.sha256(full).hexdigest();row['reviewed_full_pdf_hash_matches_prior_evidence']=row['reviewed_full_pdf_sha256']=='8214f54d2d9625c1c7a7ecd3e1232d3853a7dc02b9337b6cfc607ee6378cf17f';pdf=full
     code='import Foundation; import PDFKit; let p=PDFDocument(data:FileHandle.standardInput.readDataToEndOfFile())!;var rows:[[String:Any]]=[];for i in '+str(pages)+' {rows.append(["pdf_page":i+1,"text":p.page(at:i)?.string ?? ""])};let d=try! JSONSerialization.data(withJSONObject:["pdf_pages":p.pageCount,"pages":rows]);print(String(data:d,encoding:.utf8)!)'
     try:
      a=subprocess.run(['swift','-module-cache-path','/tmp/odisha-pdfkit-module-cache','-e',code],input=pdf,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,timeout=40);ex=json.loads(a.stdout);text=' '.join(x['text'] for x in ex['pages']);row['pdf_page_count']=ex['pdf_pages'];row['inspected_pdf_pages']=[x+1 for x in pages];compact=re.sub(r'\s+',' ',text).lower();digits=re.sub(r'\D','',text);row['claim_marker_checks']={term:term.lower() in compact if not term.isdigit() else term in digits for term in terms};row['payload_sha256']=hashlib.sha256(pdf).hexdigest()
     except Exception as e:row['extraction_error_type']=type(e).__name__
  else:
   p=m.Text();p.feed(s);text=m.norm(' '.join(p.parts)).lower();row['claim_marker_checks']={term:term.lower() in text for term in terms}
  row['content_verdict']='pass' if row.get('memento_date_matches_capture') and all(row.get('claim_marker_checks',{'missing':False}).values()) else 'review_needed'
 report['results'].append(row);save();print(key,row.get('classification'),row.get('content_verdict'),row.get('claim_marker_checks'),flush=True)
report['completed_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();report['verified_count']=sum(r.get('content_verdict')=='pass' for r in report['results']);report['unrequested_archives']=[u for u in urls if u not in {r['url'] for r in report['results']}];save();print('VERIFIED',report['verified_count'],'OF',len(urls),flush=True)
