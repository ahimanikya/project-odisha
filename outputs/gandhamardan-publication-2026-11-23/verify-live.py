"""Verify actual HTTP delivery; preserves concrete responsive URL substitutions for review."""
import json,re,hashlib,urllib.request,datetime
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent/'live';SITE=ROOT/'projects/site/dist-publish';OUT.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.images=[];self.meta={};self.h1=0
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='img':self.images.append(a)
  if t=='h1':self.h1+=1
  if t=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content')
def parse(s):p=Page();p.feed(s);return p
def get(path):
 with urllib.request.urlopen(urllib.request.Request('https://projectodisha.org'+path,headers={'User-Agent':'ProjectOdishaEditorial/1.0'}),timeout=45) as r:
  assert r.status==200
  return r.read(),{k:r.headers.get(k) for k in ['Content-Type','Last-Modified','ETag']}
def fragment(s):return re.search(r'<article class="article-reading.*?</article>',s,re.S).group()
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'routes':{},'images':{},'responsive_substitutions':[],'limits':['HTTP/content verification, not browser or visual acceptance. Any changed encoding needs separate measurement and review.']}
route='/destinations/gandhamardan/';photo='/images/destinations/gandhamardan-hills.webp';base_images={photo}
for path in [route,'/destinations/hills/','/destinations/','/explore/']:
 b,headers=get(path);s=b.decode();p=parse(s);assert p.h1==1
 filename='article.html' if path==route else path.strip('/').replace('/','-')+'.html';(OUT/filename).write_bytes(b)
 record={'status':200,'sha256':sha(b),'headers':headers}
 if path==route:
  local=(SITE/path.strip('/')/'index.html').read_text();a=fragment(s);la=fragment(local)
  lp=parse(la);ap=parse(a);assert len(lp.images)==len(ap.images)
  replacements={}
  for li,ai in zip(lp.images,ap.images):
   assert li.get('src')==ai.get('src');base_images.add(ai['src'])
   lv=[x.strip().split() for x in li.get('srcset','').split(',') if x.strip()];av=[x.strip().split() for x in ai.get('srcset','').split(',') if x.strip()];assert len(lv)==len(av)
   for (lurl,lw),(url,w) in zip(lv,av):
    assert lw==w
    if lurl!=url:replacements[lurl]=url
    if url not in report['images']:
     data,_=get(url);assert sha(data).startswith(Path(url).name.split('-')[0]);(OUT/Path(url).name).write_bytes(data)
     report['images'][url]={'status':200,'bytes':len(data),'sha256':sha(data),'local_path':lurl,'same_as_local_bytes':data==(SITE/lurl.lstrip('/')).read_bytes()}
  adjusted=la
  for old,new in replacements.items():adjusted=adjusted.replace(old,new)
  assert a==adjusted,'Article mismatch beyond explicitly recorded responsive substitutions'
  record.update(article_sha256=sha(a.encode()),local_article_sha256=sha(la.encode()),byte_exact_article=a==la,exact_after_recorded_substitutions=True)
  report['responsive_substitutions'] += [{'route':path,'local':old,'live':new} for old,new in replacements.items()]
 if path==route:
  refs=[x for x in p.links if x.startswith('#user-content-fn')];assert len(refs)==10 and all(x[1:] in p.ids for x in refs)
  assert 'Footnotes &amp; Sources' in s and 'By Ahimanikya Satapathy' in s
  assert p.meta['og:image']=='https://projectodisha.org'+photo and p.meta['twitter:image']==p.meta['og:image']
  for text in ['Amitabh Patra','https://creativecommons.org/licenses/by-sa/3.0/','Resized and converted to WebP; full frame retained. Preview crops and resized copies share the same licence.']:assert text in a
  record.update(native_reference_and_return_links=10,credited_hero_and_sharing=True)
 else:assert route in p.links and photo in s;record['incoming_article_and_photo']=True
 if path=='/destinations/hills/':
  source=(ROOT/'projects/site/src/pages/destinations/hills.astro').read_text()
  expected=re.search(r'<Shell[^>]+description="([^"]+)"',source).group(1)
  assert p.meta.get('description')==expected and 50<=len(expected)<=250
  record['corrected_description_characters']=len(expected)
  record['corrected_description_matches_reviewed_source']=True
 report['routes'][path]=record
for path,asset in [('/people/lipika-singh-darai/','/assets/cinema/lipika-film-letter.png'),('/people/pramod-pati/','/assets/cinema/pramod-paper-movement.png')]:
 b,headers=get(path);s=b.decode();assert asset in s
 (OUT/(path.strip('/').replace('/','-')+'.html')).write_bytes(b)
 report['routes'][path]={'status':200,'sha256':sha(b),'headers':headers,'reviewed_lossless_asset_attached':asset}
 base_images.add(asset)
for url in sorted(base_images):
 name=Path(url).name
 data,headers=get(url);(OUT/name).write_bytes(data);same=data==(SITE/url.lstrip('/')).read_bytes()
 assert same, 'Reviewed base image changed: '+url
 report['images'][url]={'status':200,'bytes':len(data),'sha256':sha(data),'same_as_local_bytes':same,'headers':headers}
(OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'routes':len(report['routes']),'images':len(report['images']),'responsive_substitutions':report['responsive_substitutions']},ensure_ascii=False))
