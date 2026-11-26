"""Verify Godabarish's built artifacts, without a browser or publication claim."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib,json,re,subprocess
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
SITE=ROOT/'projects/site'
ROUTE='/stories/godabarish-mahapatra-and-niankhunta/'
IMAGE='/images/stories/godabarish-niankhunta.webp'
PARENTS=['/literature/','/literature/birakishore-das/','/stories/odia-literature-preservation/']
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
class ParagraphText(HTMLParser):
 def __init__(self,s):
  super().__init__();self.parts=[];self.feed(s)
 def handle_data(self,data):self.parts.append(data)
 def handle_starttag(self,tag,attrs):
  if tag=='br':self.parts.append(' ')
def paragraph_text(s):
 # Inline emphasis/link boundaries do not insert spaces before punctuation.
 return ' '.join(''.join(ParagraphText(s).parts).split())
def main():
 stages=json.loads((OUT/'build-results.json').read_text());check(len(stages)==13 and all(s['exit_code']==0 for s in stages),'All13build/disclosure/test/audit stages passed')
 hashes=stages[0]['source_hashes'];check(all(s['source_hashes']==hashes for s in stages),'Same frozen source inputs in13stages')
 for p,h in hashes.items():check(sha(ROOT/p)==h,'Frozen '+p)
 for row in json.loads((OUT/'protected-preparation.json').read_text()):check(sha(ROOT/row['path'])==row['sha256'],'Protected '+row['path'])
 manuscript=(ROOT/'kb/research/people/godabarish-mahapatra-and-niankhunta.md').read_text();body=manuscript.split('---\n',2)[2]
 paragraphs=[p for p in map(str.strip,body.split('\n\n')) if p and not p.startswith(('#','By ','![','*','[^','[The Dhinki'))]
 paragraphs=[re.sub(r'\[\^\d+\]','',p).replace('*','').strip() for p in paragraphs]
 frames=[];image_urls=set([IMAGE]);bodies=[]
 for edition in ['dist','dist-coast','dist-publish']:
  base=SITE/edition;text=(base/ROUTE.strip('/')/'index.html').read_text();page=Page(text)
  match=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S);check(len(match)==1,edition+' one article');article=match[0];bodies.append(article)
  check(len(page.ids)==len(set(page.ids)),edition+' unique IDs')
  refs=[u for u in page.links if u.startswith('#user-content-fn-')];returns=[u for u in page.links if u.startswith('#user-content-fnref-')]
  check(len(refs)==9 and len(set(refs))==5 and len(returns)==9,edition+' nine references five notes nine returns')
  check(all(u[1:] in page.ids for u in refs+returns),edition+' all note targets resolve')
  ps=[paragraph_text(re.sub(r'<sup\b.*?</sup>','',p,flags=re.S)) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',article,re.S)]
  for p in paragraphs:check(p in ps,edition+' exact paragraph '+p[:35])
  for label in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Suggest an update','Illustration: Project Odisha','not a reproduction of a Niankhunta issue']:check(label in plain(article),edition+' '+label)
  for key in ['og:image','twitter:image']:check(page.meta.get(key)=='https://projectodisha.org'+IMAGE,edition+' '+key)
  check(page.meta.get('og:image:width')=='1200' and page.meta.get('og:image:height')=='800',edition+' sharing geometry')
  hero=[im for im in page.images if im.get('src')==IMAGE];check(len(hero)==1,edition+' one hero');hero=hero[0]
  check(hero.get('width')=='1200' and hero.get('height')=='800' and hero.get('loading')=='eager' and hero.get('fetchpriority')=='high',edition+' hero geometry priority')
  for u in hero.get('srcset','').split(','):
   if u.strip():image_urls.add(u.strip().split()[0])
  for route in PARENTS:
   parent=(base/route.strip('/')/'index.html').read_text();p=Page(parent)
   check(ROUTE in p.links,edition+' incoming '+route)
   check(any(im.get('src') in [IMAGE,'/images/stories/godabarish-niankhunta-480.webp'] for im in p.images),edition+' incoming illustration '+route)
   check('Illustration: Project Odisha' in plain(parent),edition+' incoming credit '+route)
  for u in image_urls:check((base/u.lstrip('/')).is_file(),edition+' image '+u)
  if edition!='dist':
   check(not any('satirical-periodical-illustration-original' in str(p) or 'kaincha-and-golden-grass.md' in str(p) or '/research/issue-pdf' in str(p) for p in base.rglob('*')),edition+' internal original/preparation excluded')
 check(bodies[0]==bodies[1]==bodies[2],'Exact article fragment across all three editions')
 check(sha(SITE/'dist-publish'/IMAGE.lstrip('/'))==sha(ROOT/'kb/media/godabarish-niankhunta/satirical-periodical-illustration-1200.webp'),'Public illustration byte-exact to prepared derivative')
 # The approved JPEG change is delivery-only; compare its article, not global edition controls.
 measurement=json.loads((OUT/'capacity/jpeg-q90-measurement.json').read_text())
 photo='/images/destinations/panchalingeswar-shrine.jpg';photo_route='/destinations/panchalingeswar/'
 original_phrase='Original photograph; resized copies and preview crops share the same licence.'
 delivery_phrase='Full-frame photograph compressed for web delivery; resized copies and preview crops share the same licence.'
 for edition in ['public','dist','dist-coast']:
  check(sha(SITE/edition/photo.lstrip('/'))==measurement['source_sha256'],edition+' exact Panchalingeswar original')
 delivered=SITE/'dist-publish'/photo.lstrip('/')
 check(sha(delivered)==measurement['candidate_sha256'],'Exact approved Panchalingeswar JPEG derivative hash')
 check(delivered.stat().st_size==measurement['candidate_bytes'],'Exact approved Panchalingeswar derivative bytes')
 check(sha(ROOT/measurement['candidate'])==measurement['candidate_sha256'],'Approved candidate itself preserved')
 js="const sharp=require('sharp');Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return {width:m.width,height:m.height,orientation:m.orientation??1,format:m.format}})).then(x=>console.log(JSON.stringify(x)))"
 geometry=json.loads(subprocess.check_output(['/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','-e',js,json.dumps([str(delivered)])],cwd=SITE))[0]
 check(geometry=={'width':838,'height':1117,'orientation':1,'format':'jpeg'},'Panchalingeswar full-frame geometry/orientation')
 photo_articles={}
 for edition in ['dist','dist-coast','dist-publish']:
  text=(SITE/edition/photo_route.strip('/')/'index.html').read_text();page=Page(text)
  article=re.findall(r'<article\b[^>]*class="[^\"]*article-reading[^\"]*"[^>]*>.*?</article>',text,re.S)
  check(len(article)==1,edition+' one Panchalingeswar article');photo_articles[edition]=article[0]
  check(page.meta.get('og:image')=='https://projectodisha.org'+photo,edition+' Panchalingeswar same sharing image')
  check((page.meta.get('og:image:width'),page.meta.get('og:image:height'))==('838','1117'),edition+' Panchalingeswar unchanged sharing geometry')
  for url in ['https://commons.wikimedia.org/wiki/File:Panchalingeswara_Temple_Nilagiri_Baleswar.jpg','https://creativecommons.org/licenses/by-sa/3.0/']:
   check(url in Page(article[0]).links,edition+' Panchalingeswar credit link '+url)
  check('Subhashish Panigrahi' in plain(article[0]) and 'CC BY-SA 3.0' in plain(article[0]),edition+' Panchalingeswar photographer/licence retained')
 check(photo_articles['dist']==photo_articles['dist-coast'],'Panchalingeswar full/coast article exact')
 check(photo_articles['dist-coast'].count(original_phrase)==1,'Unique original Panchalingeswar alteration note')
 check(photo_articles['dist-publish']==photo_articles['dist-coast'].replace(original_phrase,delivery_phrase),'Panchalingeswar article changes only approved alteration note')
 report['panchalingeswar']={'source_sha256':measurement['source_sha256'],'delivered_sha256':sha(delivered),'bytes':delivered.stat().st_size,'geometry':geometry,'article_only_transformation':True,'limit':'Global edition shell/control markup is deliberately checked separately from article parity. EXIF rewriting is documented; no all-metadata equality claim.'}
 total=sum(p.stat().st_size for p in (SITE/'dist-publish').rglob('*') if p.is_file());files=sum(p.is_file() for p in (SITE/'dist-publish').rglob('*'));check(total<1_000_000_000,'Actual local package below strict1GB')
 report.update(status='PASS',payload_bytes=total,file_count=files,remaining_bytes=1_000_000_000-total,source_hashes=hashes,images=[{'url':u,'sha256':sha(SITE/'dist-publish'/u.lstrip('/')),'bytes':(SITE/'dist-publish'/u.lstrip('/')).stat().st_size} for u in sorted(image_urls)],article_sha256=hashlib.sha256(bodies[2].encode()).hexdigest())
try:main()
except Exception as e:report.update(status='FAIL',error=str(e));raise
finally:(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(report['status'],len(report['checks']))
