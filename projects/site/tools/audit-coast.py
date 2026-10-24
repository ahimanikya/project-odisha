"""Read-only route acceptance checks for the current coastal candidate."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote
import json, hashlib, sys, argparse
SITE=Path(__file__).resolve().parents[1]
OUT=SITE/'dist-coast'
ROOT=SITE.parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',type=Path,default=SITE/'.astro/page-acceptance.json')
args=parser.parse_args()
args.output.parent.mkdir(parents=True,exist_ok=True)
config=json.loads((SITE/'editions/coast.json').read_text())
class Page(HTMLParser):
 def __init__(self):super().__init__();self.nodes=[];self.stack=[];self.text='';self.labelled=[];self.document_titles=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.nodes.append((tag,a));
  if tag=='title' and self.stack and self.stack[-1]=='head':self.document_titles.append(a)
  if tag in ['input','select','textarea'] and (a.get('aria-label') or a.get('aria-labelledby') or 'label' in self.stack or a.get('type')=='hidden'):self.labelled.append(a.get('id'))
  if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(tag)
 def handle_endtag(self,tag):
  if tag in self.stack:self.stack=self.stack[:len(self.stack)-1-self.stack[::-1].index(tag)]
 def handle_data(self,data):
  if 'script' not in self.stack:self.text+=data+' '
 def nodes_of(self,tag):return [a for t,a in self.nodes if t==tag]
 def meta(self,name):return next((a.get('content','') for a in self.nodes_of('meta') if a.get('name',a.get('property'))==name),'')
pages={}
for route in config['routes']:
 p=OUT/(route.lstrip('/')+'index.html' if route.endswith('/') else route.lstrip('/'));page=Page();page.feed(p.read_text());page.raw=p.read_text();page.file=p;pages[route]=page
standalone=set(config.get('standalone_routes',[]))
checks=[]
def add(route,kind,errors,details):checks.append(dict(route=route,check=kind,status='pass' if not errors else 'fail',errors=errors,details=details))
for route,page in pages.items():
 errors=[];canonical=[a.get('href') for a in page.nodes_of('link') if a.get('rel')=='canonical'];expected='https://projectodisha.org'+route
 if canonical!=[expected]:errors.append('Canonical mismatch '+str(canonical))
 if not (1 if route in standalone else 50)<=len(page.meta('description'))<=250:errors.append('Description missing or poorly bounded')
 if len(page.document_titles)!=1 or not page.meta('og:title'):errors.append('Page/social title missing')
 if page.meta('og:description')!=page.meta('description'):errors.append('Social description differs')
 if page.meta('og:url')!=expected:errors.append('Social URL mismatch')
 if page.nodes_of('html')[0].get('lang') not in (['en','or'] if route in standalone else ['en']):errors.append('Document language missing')
 for key in ['og:image','og:image:alt','og:image:width','og:image:height','twitter:card','referrer']:
  if not page.meta(key):errors.append(key+' missing')
 add(route,'metadata_and_language',errors,{'canonical':canonical,'description':page.meta('description'),'social_image':page.meta('og:image')})
 errors=[];ids=[a['id'] for _,a in page.nodes if a.get('id')];fors=[a.get('for') for a in page.nodes_of('label')]
 if len(ids)!=len(set(ids)):errors.append('Duplicate IDs')
 if len(page.nodes_of('main'))!=1 or 'main' not in ids:errors.append('Main landmark missing')
 if (len(page.nodes_of('h1'))<1 if route in standalone else len(page.nodes_of('h1'))!=1):errors.append('Expected one article h1')
 if not any(a.get('href')=='#main' for a in page.nodes_of('a')):errors.append('Skip link missing')
 for tag,a in page.nodes:
  if tag in ['input','select','textarea'] and a.get('id') not in page.labelled and a.get('id') not in fors:errors.append('Unlabelled '+tag+' '+str(a.get('id')))
  if a.get('aria-describedby'):
   for target in a['aria-describedby'].split():
    if target not in ids:errors.append('Missing described-by '+target)
 add(route,'landmarks_and_form_labels',errors,{'main_count':len(page.nodes_of('main')),'h1_count':len(page.nodes_of('h1')),'controls':sum(t in ['input','select','textarea'] for t,a in page.nodes)})
 errors=[];local_links=0;assets=0
 for a in page.nodes_of('a'):
  ref=a.get('href','');u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=urlsplit(urljoin('https://edition.invalid'+route,ref));path=unquote(target.path);local_links+=1
  if path in config.get('downloads',[]):
   if target.fragment or not (OUT/path.lstrip('/')).is_file():errors.append('Missing or invalid download '+ref)
   continue
  if path in config.get('documents',[]):
   if not (OUT/path.lstrip('/')).is_file():errors.append('Missing archive document '+ref)
   continue
  if path not in pages:errors.append('Excluded or missing local link '+ref)
  elif target.fragment and not any(a.get('id')==unquote(target.fragment) for _,a in pages[path].nodes):errors.append('Missing fragment '+ref)
 for tag,a in page.nodes:
  for key in ['src','poster']:
   ref=a.get(key);u=urlsplit(ref or '')
   if not ref or u.scheme or u.netloc:continue
   target=(OUT/u.path.lstrip('/') if u.path.startswith('/') else page.file.parent/u.path).resolve();assets+=1
   if not target.is_file():errors.append('Missing asset '+ref)
 add(route,'local_links_and_assets',errors,{'local_links':local_links,'resources':assets})
 errors=[]
 if 'noindex' not in page.meta('robots'):errors.append('Preview indexing boundary lost')
 for held in ['gopinath-mohanty.jpg','href="/store/']:
  if held in page.raw:errors.append('Excluded content '+held)
 images=page.nodes_of('img')
 for a in images:
  if 'alt' not in a or not a.get('width') or not a.get('height'):errors.append('Image missing alt/dimensions '+str(a.get('src')))
 if route in standalone:
  add(route,'edition_boundary_and_credits',errors,{'images':len(images),'catalogue_choices':None,'scope':'Transferred standalone character archive; original contributor credits preserved; no journey catalogue'})
  continue
 payload=page.raw.split('id="journey-data"',1)[1].split('>',1)[1].split('</script>',1)[0];data=json.loads(payload)
 if set(i['id'] for i in data['catalog'])!=set(config['journey_ids']):errors.append('Catalogue boundary differs')
 for item in data['catalog']:
  photo=item.get('photo')
  if photo and not all(photo.get(f) for f in ['src','alt','creator','source','license','license_url']):errors.append('Missing portable-photo credit '+item['id'])
 add(route,'edition_boundary_and_credits',errors,{'images':len(images),'catalogue_choices':len(data['catalog']),'scope':'Credit metadata and scope; not independent rights clearance'})
report={'status':'pass' if all(c['status']=='pass' for c in checks) else 'fail','checks':checks,'total':len(checks),'page_hashes':{route:hashlib.sha256(page.file.read_bytes()).hexdigest() for route,page in pages.items()}}
args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
for c in checks:
 if c['errors']:print(c['route'],c['check'],c['errors'])
print(f"{sum(c['status']=='pass' for c in checks)} / {len(checks)} page acceptance checks passed")
sys.exit(0 if report['status']=='pass' else 1)
