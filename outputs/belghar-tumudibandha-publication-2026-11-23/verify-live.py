"""Fetch published article/preview routes and their actual relevant image URLs."""
from pathlib import Path
from html.parser import HTMLParser
import urllib.request,json,re,hashlib,time
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];SITE=ROOT/'projects/site';LIVE=OUT/'live';LIVE.mkdir(exist_ok=True)
ORIGIN='https://projectodisha.org';ROUTE='/destinations/belghar-tumudibandha/';routes=[ROUTE,'/destinations/hills/','/destinations/','/explore/'];sha=lambda b:hashlib.sha256(b).hexdigest()
class Page(HTMLParser):
 def __init__(self):super().__init__();self.images=[];self.links=[];self.ids=[];self.meta={}
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='img':self.images.append(d)
  if t=='a':self.links.append(d.get('href',''))
  if 'id' in d:self.ids.append(d['id'])
  if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
def parse(s):p=Page();p.feed(s);return p
def fetch(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'ProjectOdisha-Release-Verification/1.0'}),timeout=60) as r:assert r.status==200;return r.read(),dict(r.headers)
report={'status':'running','checked_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'routes':[],'images':[],'checks':[],'limits':['HTTP evidence; separate rendered browser and delivery review required.']};urls=set();im=json.loads((ROOT/'kb/research/destinations/belghar-tumudibandha-image.json').read_text())
def check(ok,msg):assert ok,msg;report['checks'].append(msg)
for route in routes:
 b,headers=fetch(ORIGIN+route);s=b.decode();name=route.strip('/').replace('/','-') or 'home';(LIVE/(name+'.html')).write_bytes(b);p=parse(s)
 if route==ROUTE:
  fragment=re.search(r'<article class="article-reading.*?</article>',s,re.S).group();imgs=parse(fragment).images
  check('By Ahimanikya Satapathy' in fragment and 'Footnotes &amp; Sources' in fragment,'Live byline and native sources')
  for txt in [im['caption'],'Illustration: Project Odisha.',im['changes']]:check(txt in fragment,'Live credit '+txt)
  n=[x for x in p.links if x.startswith('#user-content-fn')];check(len(n)==12 and all(x[1:] in p.ids for x in n),'Live twelve native note links resolve')
  for key in ['og:image','twitter:image']:check(p.meta.get(key)==ORIGIN+im['src'],'Live '+key)
  local=(SITE/'dist-publish'/route.strip('/')/'index.html').read_text();lf=re.search(r'<article class="article-reading.*?</article>',local,re.S).group();(LIVE/'article-fragment.html').write_text(fragment);(LIVE/'local-article-fragment.html').write_text(lf);report['fragment_exact']=fragment==lf
 else:
  cards=[x for x in re.findall(r'<article\b.*?</article>',s,re.S) if 'href="'+ROUTE+'"' in x];check(len(cards)==1,'One live incoming card '+route);check(bool(re.search(r'>Illustration</(?:p|figcaption)>',cards[0])),'Live preview illustration label '+route);imgs=parse(cards[0]).images;check(any(x.get('src')==im['src'] for x in imgs),'Live preview image '+route)
 for i in imgs:
  if i.get('src','').startswith('/'):urls.add(i['src'])
  for x in re.findall(r'(/[^ ,]+)\s+\d+w',i.get('srcset','')):urls.add(x)
 report['routes'].append({'route':route,'status':200,'sha256':sha(b),'saved':name+'.html','bytes':len(b)})
for url in sorted(urls):
 b,h=fetch(ORIGIN+url);name=Path(url).name;(LIVE/name).write_bytes(b);local=SITE/'dist-publish'/url.lstrip('/');equal=local.is_file() and sha(local.read_bytes())==sha(b)
 report['images'].append({'url':url,'status':200,'bytes':len(b),'sha256':sha(b),'local_exists':local.is_file(),'local_sha256':sha(local.read_bytes()) if local.is_file() else None,'byte_equal':equal,'saved':name})
check(next(x for x in report['images'] if x['url']==im['src'])['byte_equal'],'Original public illustration exact')
report['status']='pass' if report['fragment_exact'] and all(x['byte_equal'] for x in report['images']) else 'review_differences';(LIVE/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':report['status'],'routes':len(routes),'images':len(urls),'different_images':[x['url'] for x in report['images'] if not x['byte_equal']],'fragment_exact':report['fragment_exact']}))
