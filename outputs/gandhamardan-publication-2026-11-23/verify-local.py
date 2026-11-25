"""Inspect actual emitted delivery, media, navigation and protected prior evidence."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent;SITE=ROOT/'projects/site'
BASE='af57ee13b805874a8afa32e55936fefbcd4091c3';ROUTE='/destinations/gandhamardan/'
sha=lambda b:hashlib.sha256(b).hexdigest()
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.imgs=[];self.meta={}
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  if t=='a':self.links.append(d.get('href',''))
  if t=='img':self.imgs.append(d)
  if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
def parse(s):p=Page();p.feed(s);return p
report={'status':'running','base':BASE,'checks':[],'editions':{},'limitations':['Local emitted-file verification; separate source, browser, Linux and live review required.']}
def check(ok,label):assert ok,label;report['checks'].append(label)
builds=json.loads((OUT/'build-results.json').read_text());check(len(builds)==8 and all(x['exit_code']==0 for x in builds),'All eight build/test/disclosure stages passed')
im=json.loads((ROOT/'kb/research/destinations/gandhamardan-image.json').read_text())
manuscript=(ROOT/'kb/research/places/gandhamardan-article.md').read_bytes();report['manuscript_sha256']=sha(manuscript)
check(report['manuscript_sha256']=='a428c192482dd725d83f2d310d06290f1ffe3054e9ff0a288d104c55c1361e58','Separately reviewed manuscript remains exact')
check(sha((ROOT/im['original']['file']).read_bytes())==im['original']['sha256'],'Original documentary photograph preserved')
variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==im['src'])
check([x['width'] for x in variants]==[480,960],'Responsive sizes do not enlarge source');fragments=[]
for edition in ['dist','dist-coast','dist-publish']:
 base=SITE/edition;html=(base/ROUTE.strip('/')/'index.html').read_text();p=parse(html)
 check(len(p.ids)==len(set(p.ids)),edition+': unique IDs')
 notes=[x for x in p.links if x.startswith('#user-content-fn')]
 check(len(notes)==10 and all(x[1:] in p.ids for x in notes),edition+': native citation and return targets resolve')
 check('Footnotes &amp; Sources' in html and 'By Ahimanikya Satapathy' in html,edition+': visible sources and byline')
 for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+im['src'],edition+': '+key)
 hero=next(x for x in p.imgs if x.get('src')==im['src'])
 check(hero.get('width')=='960' and hero.get('height')=='720' and hero.get('loading')=='eager' and hero.get('fetchpriority')=='high',edition+': intrinsic landscape geometry and prioritized hero')
 check(hero.get('alt')==im['alt'],edition+': descriptive alternative')
 check(sha((base/im['src'].lstrip('/')).read_bytes())==im['web_derivative']['sha256'],edition+': reviewed image exact')
 emitted=re.findall(r'(/images/responsive/[^ ,]+)',hero.get('srcset',''))
 check(emitted==[x['src'] for x in variants],edition+': both variants attached')
 for x in variants:
  b=(base/x['src'].lstrip('/')).read_bytes();check(len(b)==x['bytes'] and sha(b)==x['sha256'],edition+': variant '+str(x['width'])+' matches output')
 for credit in [im['creator'],im['source'],im['license_url'],im['changes']]:check(credit in html,edition+': credit '+credit[:45])
 for incoming in ['destinations/hills','destinations','explore']:
  s=(base/incoming/'index.html').read_text();cards=[x for x in re.findall(r'<article\b.*?</article>',s,re.S) if 'href="'+ROUTE+'"' in x]
  check(len(cards)==1,edition+': one incoming card on '+incoming)
  check(any(x.get('src')==im['src'] for x in parse(cards[0]).imgs),edition+': preview photograph '+incoming)
 fragment=re.search(r'<article class="article-reading.*?</article>',html,re.S).group();fragments.append(fragment)
 for href in parse(fragment).links:
  if href.startswith('/') and not href.startswith('//') and '?' not in href and '#' not in href:check((base/href.strip('/')/'index.html').is_file(),edition+': related target '+href)
 report['editions'][edition]={'article_sha256':sha(html.encode()),'article_fragment_sha256':sha(fragment.encode()),'native_reference_return_links':len(notes),'variants':emitted}
check(fragments[0]==fragments[1]==fragments[2],'Article identical across all three editions')
prep=json.loads((ROOT/'kb/records/antaranga-next-preparation-20261123.json').read_text())
for item in prep['delivery_files']:
 check(sha((ROOT/item['path']).read_bytes())==item['sha256'],'Preserved Sola preparation '+item['path'])
for path in ['kb/research/places/kapilash-article.md','kb/research/destinations/kapilash-image.json','projects/site/src/pages/destinations/kapilash.astro','projects/site/public/images/destinations/kapilash-temple.webp','kb/records/kapilash-publication-20261123.json']:
 check((ROOT/path).read_bytes()==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),'Preserved Kapilash evidence '+path)
path='kb/team/operations.json';now=json.loads((ROOT/path).read_text());old=json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
for key in ['current_task','handoff_home']:check(now[key]==old[key],'Preserved foreign '+key)
capacity=json.loads((OUT/'review/capacity-findings.json').read_text())
for item in capacity['candidates'][:2]:
 source=ROOT/'projects/site/public'/item['path'];delivered=SITE/'dist-publish'/item['path']
 check(sha(source.read_bytes())==item['current_sha256'],'Original PNG preserved '+item['path'])
 check(sha(delivered.read_bytes())==item['candidate_sha256'],'Reviewed lossless output '+item['path'])
 check(source.read_bytes()==(SITE/'dist-coast'/item['path']).read_bytes(),'Coastal original preserved '+item['path'])
files=[f for f in (SITE/'dist-publish').rglob('*') if f.is_file()]
check(not any('sola-and-tahia' in str(f) or 'finished-tahia' in str(f) for f in files),'Unpublished Sola route and photograph excluded')
size=sum(f.stat().st_size for f in files);check(size<1_000_000_000,'Package below strict decimal 1GB')
report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size}
report['media']={'public_base_bytes':im['web_derivative']['bytes'],'variants':variants,'total_bytes':im['web_derivative']['bytes']+sum(x['bytes'] for x in variants)}
report['status']='pass';(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'pass','checks':len(report['checks']),'payload':report['payload']}))
