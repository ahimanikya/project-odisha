#!/usr/bin/env python3
"""Bounded source audit. Writes only source-* reports; no raw responses retained."""
import concurrent.futures,datetime,hashlib,html,json,re,time
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode,urldefrag
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
class Text(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t in ('script','style','noscript'):self.skip+=1
  if t in ('p','div','section','h1','h2','h3','h4','br'):self.parts.append('\n')
 def handle_endtag(self,t):
  if t in ('script','style','noscript') and self.skip:self.skip-=1
  if t in ('p','div','section','h1','h2','h3','h4'):self.parts.append('\n')
 def handle_data(self,d):
  if not self.skip:self.parts.append(d)
def norm(s):return re.sub(r'\s+',' ',s).strip()
def safeurl(u):
 p=urlsplit(u);q=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not re.search(r'token|session|client.?id|cf_chl|__cf|utm_|fbclid|gclid',k,re.I)];return urlunsplit((p.scheme,p.netloc,p.path,urlencode(q),p.fragment))
def targets():
 out={};arts=json.loads((ROOT/'kb/research/stories/independent-features/collection.json').read_text())['articles']
 for a in arts:
  s=(ROOT/a['source_path']).read_text();meta=json.loads(re.search(r'^sources: (\[.*\])$',s,re.M)[1]);titles={x['resource']:x['title'] for x in meta}
  for n,line in re.findall(r'^\[\^([^\]]+)\]: (.*)$',s,re.M):
   for m in re.finditer(r'\]\((https?://)',line):
    start=m.start()+2;end=start;depth=1
    while end<len(line):
     if line[end]=='(':depth+=1
     if line[end]==')':depth-=1
     if not depth:break
     end+=1
    u=urldefrag(line[start:end])[0];out.setdefault(u,[]).append({'slug':a['slug'],'note':n,'registered_title':titles.get(u,'Dated archive fallback'),'note_text':line})
 return out
def fetch(u,limit=524288):
 row={'url':u,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat()};t=time.monotonic();body=b''
 try:
  with urlopen(Request(u,headers={'Accept-Encoding':'identity'}),timeout=25) as f:
   body=f.read(limit+1);row.update(http_status=f.status,final_url=safeurl(f.url),content_type=f.headers.get('Content-Type',''),sample_bytes=min(len(body),limit),response_sample_complete=len(body)<=limit,pdf_signature=body.startswith(b'%PDF'))
   row['classification']='reachable';body=body[:limit]
   if f.headers.get('Memento-Datetime'):row['memento_datetime']=f.headers.get('Memento-Datetime')
   if body.startswith(b'%PDF'):row['destination_kind']='pdf_payload';row['sample_sha256']=hashlib.sha256(body).hexdigest()
   else:
    s=body.decode('utf8','replace');m=re.search(r'<title[^>]*>(.*?)</title>',s,re.S|re.I);row['title']=norm(html.unescape(re.sub('<[^>]+>','',m[1])))[:240] if m else ''
    row['heading_titles']=[norm(html.unescape(re.sub('<[^>]+>','',x)))[:160] for x in re.findall(r'<h1[^>]*>(.*?)</h1>',s,re.S|re.I)][:4]
    p=Text();p.feed(s);visible=norm(' '.join(p.parts)).lower();row['destination_kind']='html_page'
    if re.search(r'just a moment|attention required|access denied|verify you are human|making sure you.re not a bot|oh noes|page not found|404.*not found',row['title'],re.I):row['classification']='challenge_or_error_page_200'
    if 'checking your browser before accessing' in visible or 'enable javascript and cookies to continue' in visible:row['classification']='challenge_or_error_page_200'
    if len(visible)<150:row['classification']='insufficient_visible_content'
 except HTTPError as e:
  row.update(http_status=e.code,classification='confirmed_http_404' if e.code==404 else 'gone_http_410' if e.code==410 else 'rate_limited' if e.code==429 else 'access_restricted' if e.code in (401,403) else 'http_error')
  retry=e.headers.get('Retry-After')
  if retry and retry.isdigit():row['retry_after_seconds']=int(retry)
 except Exception as e:row.update(classification='transport_limitation',error_type=type(getattr(e,'reason',e)).__name__)
 row['elapsed_seconds']=round(time.monotonic()-t,2);return row,body

def main():
 alltargets=targets();regular=[u for u in alltargets if urlsplit(u).hostname!='web.archive.org'];report={'started_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Normal TLS GET, four workers maximum, no retry loop, 512KiB response sample. Source URLs extracted from canonical footnotes pending reconciliation with shared actual live-footnote extraction. No image-credit/Commons requests.','unique_total_including_archives':len(alltargets),'unique_regular_targets':len(regular),'archive_targets':len(alltargets)-len(regular),'results':[]}
 out=HERE/'source-regular.json'
 def check(u):
  row,b=fetch(u);row['references']=alltargets[u]
  if row.get('destination_kind')=='html_page' and row['classification']=='reachable':
   p=Text();p.feed(b.decode('utf8','replace'));visible=norm(' '.join(p.parts)).lower();terms=set()
   for ref in alltargets[u]:
    terms.update(x for x in re.findall(r'[a-zA-Z]{4,}',ref['slug']+' '+ref['registered_title']) if x.lower() not in {'odisha','orissa','government','report','annual','account','department','district','page','pages','printed','section','ministry','tourism','the','programme','records','description','overview'})
   row['matching_context_terms']=sorted(t for t in terms if t.lower() in visible)
   row['needs_destination_review']=not bool(row['matching_context_terms'])
  return row
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for row in pool.map(check,regular):
   report['results'].append(row);out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(row['classification'],row['url'],flush=True)
 report['status_counts']={k:sum(r['classification']==k for r in report['results']) for k in sorted({r['classification'] for r in report['results']})};report['completed_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report['status_counts']),flush=True)
if __name__=='__main__':main()
