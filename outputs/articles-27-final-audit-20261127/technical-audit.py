#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urljoin,urlsplit,urldefrag,urlunsplit,parse_qsl,urlencode,unquote
from concurrent.futures import ThreadPoolExecutor,as_completed
from datetime import datetime,timezone
import json,hashlib,re,time,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];SITE='https://projectodisha.org';KB=ROOT/'kb/research/stories/independent-features'
collection=json.loads((KB/'collection.json').read_text());images=json.loads((KB/'images.json').read_text())
now=lambda:datetime.now(timezone.utc).isoformat()
def save(name,obj): (HERE/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def clean(url):
 p=urlsplit(url);q=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not re.search('token|session|cf_chl|__cf|gclid|fbclid|^utm_|client.?id',k,re.I)];return urlunsplit((p.scheme,p.netloc,p.path,urlencode(q),p.fragment))
class N:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def all(self,p):
  return ([self] if p(self) else [])+[x for c in self.children if isinstance(c,N) for x in c.all(p)]
 def text(self):return ''.join(c.text() if isinstance(c,N) else c for c in self.children)
 def cls(self,c):return c in self.attrs.get('class','').split()
class DOM(HTMLParser):
 def __init__(self,s):super().__init__(convert_charrefs=True);self.root=N();self.stack=[self.root];self.feed(s)
 def handle_starttag(self,t,a):
  n=N(t,a);self.stack[-1].children.append(n)
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(n)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].children.append(s)
def fetch(url,full=True):
 record={'url':clean(url),'checked_at':now()};body=b''
 try:
  try:r=urlopen(Request(url,headers={'User-Agent':'ProjectOdisha-LinkReview/1.0 (editorial availability check)','Accept-Encoding':'identity'}),timeout=25)
  except HTTPError as e:r=e
  with r:
   body=r.read(16*1024*1024 if full else 262144);record.update(http_status=r.status,final_url=clean(r.url),content_type=r.headers.get('Content-Type',''),bytes=len(body));record['classification']='reachable' if r.status==200 else 'rate_limited' if r.status==429 else 'access_restricted' if r.status in (401,403) else 'http_error'
 except Exception as e:record.update(classification='transport_error',error_type=type(e).__name__,error=str(e)[:250])
 return record,body
norm=lambda x:' '.join(x.split())
def pages():
 notes=[];results=[];assets={};local={};footurls={};crediturls={}
 def task(entry):
  status,b=fetch(SITE+entry['href']);return entry,status,DOM(b.decode('utf8','replace')).root
 with ThreadPoolExecutor(max_workers=4) as pool:
  for entry,status,dom in pool.map(task,collection['articles']):
   slug=entry['slug'];im=images[slug];defects=[];arts=dom.all(lambda n:n.tag=='article' and n.cls('independent-feature'));art=arts[0] if arts else N();ids=[n.attrs['id'] for n in dom.all(lambda n:'id' in n.attrs)];idset=set(ids)
   if len(arts)!=1:defects.append('article_count_'+str(len(arts)))
   if len(ids)!=len(idset):defects.append('duplicate_html_ids')
   figs=art.all(lambda n:n.tag=='figure' and n.cls('feature-image'));fig=figs[0] if figs else N();caps=fig.all(lambda n:n.tag=='figcaption');cap=caps[0] if caps else N();ct=norm(cap.text());links=[n.attrs.get('href','') for n in cap.all(lambda n:n.tag=='a')]
   matches={k:norm(im[k]) in ct for k in ['caption','title','creator','license','changes']}
   for k,ok in matches.items():
    if not ok:defects.append('credit_missing_'+k)
   for key in ['source','license_url']:
    if im.get(key):
     if im[key] not in links:defects.append('credit_link_missing_'+key)
     crediturls.setdefault(urldefrag(urljoin(SITE,im[key]))[0],[]).append({'slug':slug,'role':key,'original':im[key]})
   hero=fig.all(lambda n:n.tag=='img');h=hero[0].attrs if hero else {}
   if h.get('src')!=im['src']:defects.append('hero_src_mismatch')
   for key in ['width','height']:
    if h.get(key)!=str(im[key]):defects.append('hero_'+key+'_mismatch')
   if h.get('alt')!=im['alt']:defects.append('hero_alt_mismatch')
   for n in art.all(lambda n:n.tag=='img'):
    paths=[n.attrs.get('src','')]+[x.strip().split()[0] for x in n.attrs.get('srcset','').split(',') if x.strip()]
    for path in paths:
     if path.startswith('/'):assets.setdefault(path,[]).append(slug)
   secs=art.all(lambda n:n.tag=='section' and 'data-footnotes' in n.attrs);sec=secs[0] if secs else N();an=[]
   for li in sec.all(lambda n:n.tag=='li'):
    ls=[n.attrs.get('href','') for n in li.all(lambda n:n.tag=='a')];external=[x for x in ls if x.startswith('http')];an.append({'id':li.attrs.get('id'),'text':norm(li.text()),'external_links':external})
    for u in external:footurls.setdefault(u,[]).append({'slug':slug,'note_id':li.attrs.get('id')})
   source=(ROOT/entry['source_path']).read_text();expected=json.loads(re.search(r'^sources: (.+)$',source,re.M)[1]);actual={u for n in an for u in n['external_links']}
   for source in expected:
    if source['resource'] not in actual:defects.append('missing_canonical_source_'+source['id'])
   if len(an)!=len(expected):defects.append('footnote_count_mismatch')
   for a in art.all(lambda n:n.tag=='a'):
    href=a.attrs.get('href','')
    if href.startswith('#') and unquote(href[1:]) not in idset:defects.append('broken_local_fragment_'+href)
    elif href.startswith('/'):
     dest=urljoin(SITE,href);local.setdefault(dest,[]).append(slug)
   notes.append({'slug':slug,'url':SITE+entry['href'],'notes':an});results.append({'slug':slug,**status,'footnote_count':len(an),'expected_footnotes':len(expected),'credit_fields_match':matches,'hero':h,'defects':defects})
 notes.sort(key=lambda x:x['slug']);results.sort(key=lambda x:x['slug'])
 save('technical-live-footnotes.json',{'checked_at':now(),'articles':notes,'external_targets':[{'url':u,'references':v} for u,v in sorted(footurls.items())]})
 save('technical-live-pages.json',{'checked_at':now(),'articles':results,'totals':{'articles':len(results),'footnotes':sum(x['footnote_count'] for x in results),'defects':sum(len(x['defects']) for x in results)}})
 save('technical-targets.json',{'image_assets':assets,'local_links':local,'image_credit_links':crediturls});print('PAGES COMPLETE',len(results),'notes',sum(x['footnote_count'] for x in results),flush=True)
def assets_local():
 targets=json.loads((HERE/'technical-targets.json').read_text());out=[]
 def asset(p):
  r,b=fetch(SITE+p);path=ROOT/'projects/site/public'/p.lstrip('/');r['sha256']=hashlib.sha256(b).hexdigest();r['local_exists']=path.exists();r['matches_local_bytes']=path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==r['sha256'];return r
 with ThreadPoolExecutor(max_workers=4) as pool:
  out=list(pool.map(asset,targets['image_assets']))
 save('technical-live-image-assets.json',{'checked_at':now(),'results':out,'all_match':all(x['matches_local_bytes'] and x.get('http_status')==200 for x in out)})
 groups={}
 for u,slugs in targets['local_links'].items():groups.setdefault(urldefrag(u)[0],[]).append({'fragment':urlsplit(u).fragment,'slugs':slugs})
 def local(item):
  u,refs=item;r,b=fetch(u);dom=DOM(b.decode('utf8','replace')).root;ids={x.attrs['id'] for x in dom.all(lambda n:'id' in n.attrs)};r['references']=refs;r['missing_fragments']=[x['fragment'] for x in refs if x['fragment'] and unquote(x['fragment']) not in ids];return r
 with ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(local,groups.items()))
 save('technical-live-local-links.json',{'checked_at':now(),'results':out});print('ASSET/LOCAL COMPLETE',flush=True)
def credits():
 targets=json.loads((HERE/'technical-targets.json').read_text())['image_credit_links'];out=[]
 def check(u):
  r,b=fetch(u,False);r['references']=targets[u];s=b.decode('utf8','replace');m=re.search(r'<title[^>]*>(.*?)</title>',s,re.S|re.I);r['page_title']=norm(m[1]) if m else None
  if r.get('http_status')==200 and m and re.search('Just a moment|Access denied|Attention Required',m[1],re.I):r['classification']='challenge_page'
  return r
 regular=[u for u in targets if urlsplit(u).hostname!='commons.wikimedia.org'];commons=[u for u in targets if urlsplit(u).hostname=='commons.wikimedia.org']
 with ThreadPoolExecutor(max_workers=3) as pool:out=list(pool.map(check,regular))
 save('technical-live-image-credit-links.json',{'checked_at':now(),'results':out,'status':'in_progress'})
 for i,u in enumerate(commons):
  if i:time.sleep(5)
  r=check(u);out.append(r);save('technical-live-image-credit-links.json',{'checked_at':now(),'results':out,'status':'in_progress'})
  if r['classification']=='rate_limited':
   out.extend({'url':x,'classification':'deferred_after_rate_limit','references':targets[x]} for x in commons[i+1:]);break
 save('technical-live-image-credit-links.json',{'checked_at':now(),'results':out,'status':'complete'});print('CREDITS COMPLETE',len(out),flush=True)
if __name__=='__main__':{'pages':pages,'assets':assets_local,'credits':credits}[sys.argv[1]]()
