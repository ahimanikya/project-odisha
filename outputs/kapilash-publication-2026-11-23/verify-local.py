from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent;SITE=ROOT/'projects/site';BASE='6be88b16a06bb32e85e9b13adaa5b201aaa8da5a';ROUTE='/destinations/kapilash/'
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
image=json.loads((ROOT/'kb/research/destinations/kapilash-image.json').read_text());manuscript=ROOT/'kb/research/places/kapilash-article.md';report['manuscript_sha256']=sha(manuscript.read_bytes());check(report['manuscript_sha256']=='f3c0abeeb054c399b22cec5df853dfdaa2bdaf4cdfbff69b3b0e4e1325c11ace','Frozen separately reviewed manuscript matches')
check(sha((ROOT/image['original']['file']).read_bytes())==image['original']['sha256'],'Original documentary photograph preserved')
variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==image['src']);check([x['width'] for x in variants]==[480,960],'Responsive sizes do not enlarge source');fragments=[]
for edition in ['dist','dist-coast','dist-publish']:
 base=SITE/edition;html=(base/ROUTE.strip('/')/'index.html').read_text();p=parse(html);check(len(p.ids)==len(set(p.ids)),edition+': unique IDs');notes=[x for x in p.links if x.startswith('#user-content-fn')];check(len(notes)==12 and all(x[1:] in p.ids for x in notes),edition+':12native citation and return links resolve');check('Footnotes &amp; Sources' in html,edition+':visible source heading')
 for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+image['src'],edition+':'+key+' selected photograph')
 hero=next(x for x in p.imgs if x.get('src')==image['src']);check(hero.get('width')=='960' and hero.get('height')=='1280' and hero.get('loading')=='eager' and hero.get('fetchpriority')=='high',edition+':intrinsic portrait dimensions and prioritized hero');check(hero.get('alt')==image['alt'],edition+':descriptive alternative');check(sha((base/image['src'].lstrip('/')).read_bytes())==image['web_derivative']['sha256'],edition+':reviewed web derivative exact')
 emitted=re.findall(r'(/images/responsive/[^ ,]+)',hero.get('srcset',''));check(emitted==[x['src'] for x in variants],edition+':both variants attached')
 for x in variants:
  b=(base/x['src'].lstrip('/')).read_bytes();check(len(b)==x['bytes'] and sha(b)==x['sha256'],edition+':variant'+str(x['width'])+' matches output')
 for credit in [image['creator'],image['source'],image['license_url'],image['changes']]:check(credit in html,edition+':credit '+credit[:45])
 for incoming in ['destinations/hills','destinations','explore']:
  s=(base/incoming/'index.html').read_text();cards=[x for x in re.findall(r'<article\b.*?</article>',s,re.S) if 'href="'+ROUTE+'"' in x];check(len(cards)==1,edition+':one incoming card on '+incoming);check(any(x.get('src')==image['src'] for x in parse(cards[0]).imgs),edition+':preview photograph '+incoming)
 for href in ['/destinations/panchalingeswar/','/books/odisha-culture-memory-and-living-traditions/mahima-dharma-and-the-poetry-of-bhima-bhoi/']:
  check(href in p.links and (base/href.strip('/')/'index.html').is_file(),edition+':related reading '+href)
 fragment=re.search(r'<article\b.*?</article>',html,re.S).group();fragments.append(fragment);report['editions'][edition]={'article_sha256':sha(html.encode()),'article_fragment_sha256':sha(fragment.encode()),'native_reference_return_links':len(notes),'variants':emitted}
check(fragments[0]==fragments[1]==fragments[2],'Article identical across all three editions')
horn=json.loads((ROOT/'kb/records/antaranga-next-preparation-20261122.json').read_text())
for item in horn['delivery_files']:
 path=item['path'];check((ROOT/path).read_bytes()==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),'Preserved inherited horn file '+path)
for path in ['kb/research/culture/paralakhemundi-horn-image.json','projects/site/src/pages/stories/paralakhemundi-horn-craft.astro','projects/site/public/images/stories/paralakhemundi-horn-fish.webp']:
 check((ROOT/path).read_bytes()==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),'Preserved horn publication '+path)
path='kb/team/operations.json';now=json.loads((ROOT/path).read_text());old=json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
for key in ['current_task','handoff_home']:check(now[key]==old[key],'Preserved foreign '+key)
files=[f for f in (SITE/'dist-publish').rglob('*') if f.is_file()];size=sum(f.stat().st_size for f in files);check(size<1_000_000_000,'Package below strict decimal1GB');report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size};report['media']={'public_base_bytes':image['web_derivative']['bytes'],'variants':variants,'total_bytes':image['web_derivative']['bytes']+sum(x['bytes'] for x in variants)};report['status']='pass';(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'pass','checks':len(report['checks']),'payload':report['payload']}))
