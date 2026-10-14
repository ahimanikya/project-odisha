"""Inspect search-launch metadata and internal links; no rendering or crawler claim."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote,urljoin
import json,hashlib,xml.etree.ElementTree as ET
site=Path(__file__).resolve().parents[1];origin='https://projectodisha.org'
selection=json.loads((site/'editions/search-candidate.json').read_text());selected=[p['route'] for p in selection['pages'] if p['decision']=='proposed']
class Page(HTMLParser):
 def __init__(self):super().__init__();self.title='';self.in_head=False;self.intitle=False;self.meta={};self.canonical=[];self.links=[];self.ids=set();self.h1=0
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='head':self.in_head=True
  if t=='title':self.intitle=self.in_head
  if t=='h1':self.h1+=1
  if a.get('id'):self.ids.add(a['id'])
  if t=='meta':self.meta.setdefault(a.get('name',a.get('property')),[]).append(a.get('content',''))
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if t=='a' and a.get('href'):self.links.append(a['href'])
 def handle_endtag(self,t):
  if t=='head':self.in_head=False
  if t=='title':self.intitle=False
 def handle_data(self,d):
  if self.intitle:self.title+=d
 def value(self,key):return self.meta.get(key,[''])[0]
def path(route):return route.lstrip('/')+('index.html' if route.endswith('/') else '')
parsed={}
for p in selection['pages']:
 doc=Page();doc.feed((site/'.search-review'/path(p['route'])).read_text());parsed[p['route']]=doc
rows=[];errors=[]
for route in selected:
 d=parsed[route];local=[]
 def require(ok,label):
  if not ok:local.append(label)
 require(d.h1==1,'one main heading');require(d.canonical==[origin+route],'canonical URL');require(d.value('og:url')==origin+route,'social URL');require(d.meta.get('robots')==['index, follow'],'indexable tag')
 require(len(d.meta.get('description',[]))==1 and 50<=len(d.value('description'))<=250,'unique descriptive summary');require(d.value('og:description')==d.value('description'),'matching social description');require(d.value('og:title') in [d.title,d.title.split(' | ')[0]],'matching social title')
 image=urlsplit(d.value('og:image'));image_path=site/'dist-coast'/unquote(image.path).lstrip('/')
 require(image.netloc=='projectodisha.org' and image_path.is_file(),'local sharing image');require(bool(d.value('og:image:alt')),'image description');require(all(d.value(k).isdigit() and int(d.value(k))>0 for k in ['og:image:width','og:image:height']),'image dimensions')
 linked=[]
 for href in d.links:
  u=urlsplit(urljoin(origin+route,href))
  if u.netloc!='projectodisha.org':continue
  target=unquote(u.path);f=site/'dist-coast'/path(target)
  require(f.is_file(),'missing local link '+href)
  if target in selected:linked.append(target)
  if u.fragment and target in parsed and not u.fragment.startswith('photo='):require(unquote(u.fragment) in parsed[target].ids,'missing fragment '+href)
 rows.append({'route':route,'title':d.title,'description':d.value('description'),'sharing_image':d.value('og:image'),'sharing_alt':d.value('og:image:alt'),'sharing_sha256':hashlib.sha256(image_path.read_bytes()).hexdigest() if image_path.is_file() else None,'links_to_shortlist':sorted(set(linked)),'errors':local});errors += [route+': '+v for v in local]
for field in ['title','description']:
 if len({r[field] for r in rows})!=len(rows):errors.append('Duplicate shortlist '+field)
reached={'/'}
while True:
 new=reached|{v for r in rows if r['route'] in reached for v in r['links_to_shortlist']}
 if new==reached:break
 reached=new
if reached!=set(selected):errors.append('Shortlist not reachable from home: '+str(set(selected)-reached))
urls=[x.text for x in ET.parse(site/'.search-review/sitemap.xml').findall('{*}url/{*}loc')]
if urls!=[origin+r for r in selected]:errors.append('Sitemap differs from shortlist')
policy=json.loads((site/'editions/search-publication.json').read_text())
report={'status':'fail' if errors else 'pass','scope':'Generated candidate metadata, source assets and link graph; not browser rendering, current access, independent editorial review or search-engine indexing verification.','publication_mode':policy['mode'],'pages':rows,'reachable_from_home':sorted(reached),'sitemap_urls':urls,'errors':errors}
(site/'.astro/search-shortlist-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'reviewed_pages':len(rows),'errors':errors}));raise SystemExit(bool(errors))
