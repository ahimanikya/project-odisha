"""Verify Kula's built artifacts, without a browser or publication claim."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib,json,re
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
SITE=ROOT/'projects/site'
ROUTE='/stories/kula-and-the-work-of-winnowing/'
IMAGE='/images/stories/kula-trays.webp'
PARENTS=['/stories/dhinki-and-the-work-behind-rice/','/stories/binchana-and-the-handmade-breeze/','/stories/craft-listening/']
report={'status':'RUNNING','checks':[],'routes':[ROUTE]+PARENTS,'limits':['Local files only; hosted capacity, browser behavior and live delivery require separate checks.']}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(x,msg):
 if not x:raise AssertionError(msg)
 report['checks'].append(msg)
def plain(s):return ' '.join(unescape(re.sub('<[^>]*>',' ',s)).split())
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=[];self.links=[];self.images=[];self.meta={};self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='img':self.images.append(a)
  if t=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content')
def main():
 stages=json.loads((OUT/'build-results.json').read_text());check(len(stages)==13 and all(s['exit_code']==0 for s in stages),'All13build/disclosure/test/audit stages passed')
 hashes=stages[0]['source_hashes'];check(all(s['source_hashes']==hashes for s in stages),'Same frozen source inputs in13stages')
 for p,h in hashes.items():check(sha(ROOT/p)==h,'Frozen '+p)
 for row in json.loads((OUT/'protected-preparation.json').read_text()):check(sha(ROOT/row['path'])==row['sha256'],'Protected '+row['path'])
 manuscript=(ROOT/'kb/research/culture/kula-and-the-work-of-winnowing-publication.md').read_text();body=manuscript.split('---\n',2)[2]
 paragraphs=[p for p in map(str.strip,body.split('\n\n')) if p and not p.startswith(('#','By ','![','*','[^','[The Dhinki'))]
 paragraphs=[re.sub(r'\[\^\d+\]','',p).strip() for p in paragraphs]
 frames=[];image_urls=set([IMAGE]);bodies=[]
 for edition in ['dist','dist-coast','dist-publish']:
  base=SITE/edition;text=(base/ROUTE.strip('/')/'index.html').read_text();page=Page(text)
  match=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S);check(len(match)==1,edition+' one article');article=match[0];bodies.append(article)
  check(len(page.ids)==len(set(page.ids)),edition+' unique IDs')
  refs=[u for u in page.links if u.startswith('#user-content-fn-')];returns=[u for u in page.links if u.startswith('#user-content-fnref-')]
  check(len(refs)==7 and len(set(refs))==4 and len(returns)==7,edition+' seven references four notes seven returns')
  check(all(u[1:] in page.ids for u in refs+returns),edition+' all note targets resolve')
  ps=[plain(re.sub(r'<sup\b.*?</sup>','',p,flags=re.S)) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',article,re.S)]
  for p in paragraphs:check(p in ps,edition+' exact paragraph '+p[:35])
  for label in ['By Ahimanikya Satapathy','Footnotes & Sources','Further reading','Suggest an update','Debiprasad Sahoo','CC BY-SA 3.0']:check(label in plain(article),edition+' '+label)
  for key in ['og:image','twitter:image']:check(page.meta.get(key)=='https://projectodisha.org'+IMAGE,edition+' '+key)
  check(page.meta.get('og:image:width')=='1200' and page.meta.get('og:image:height')=='1201',edition+' sharing geometry')
  hero=[im for im in page.images if im.get('src')==IMAGE];check(len(hero)==1,edition+' one hero');hero=hero[0]
  check(hero.get('width')=='1200' and hero.get('height')=='1201' and hero.get('loading')=='eager' and hero.get('fetchpriority')=='high',edition+' hero geometry priority')
  for u in hero.get('srcset','').split(','):
   if u.strip():image_urls.add(u.strip().split()[0])
  for route in PARENTS:
   parent=(base/route.strip('/')/'index.html').read_text();p=Page(parent)
   check(ROUTE in p.links,edition+' incoming '+route)
   check(any(im.get('src')==IMAGE for im in p.images),edition+' incoming photograph '+route)
   check('https://commons.wikimedia.org/wiki/File:Winnowing_Fan1.jpg' in p.links and 'https://creativecommons.org/licenses/by-sa/3.0/' in p.links,edition+' incoming credit '+route)
  for u in image_urls:check((base/u.lstrip('/')).is_file(),edition+' image '+u)
  if edition!='dist':
   check(not any('winnowing-fan1-original' in str(p) or 'kaincha-and-golden-grass.md' in str(p) for p in base.rglob('*')),edition+' internal original/preparation excluded')
 check(bodies[0]==bodies[1]==bodies[2],'Exact article fragment across all three editions')
 check(sha(SITE/'dist-publish'/IMAGE.lstrip('/'))==sha(ROOT/'kb/media/kula/kula-trays-1200.webp'),'Public photo byte-exact to prepared derivative')
 total=sum(p.stat().st_size for p in (SITE/'dist-publish').rglob('*') if p.is_file());files=sum(p.is_file() for p in (SITE/'dist-publish').rglob('*'));check(total<1_000_000_000,'Actual local package below strict1GB')
 report.update(status='PASS',payload_bytes=total,file_count=files,remaining_bytes=1_000_000_000-total,source_hashes=hashes,images=[{'url':u,'sha256':sha(SITE/'dist-publish'/u.lstrip('/')),'bytes':(SITE/'dist-publish'/u.lstrip('/')).stat().st_size} for u in sorted(image_urls)],article_sha256=hashlib.sha256(bodies[2].encode()).hexdigest())
try:main()
except Exception as e:report.update(status='FAIL',error=str(e));raise
finally:(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(report['status'],len(report['checks']))
