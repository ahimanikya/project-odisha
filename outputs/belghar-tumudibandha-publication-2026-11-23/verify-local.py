"""Verify actual Belghar delivery and protected predecessor evidence."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent;SITE=ROOT/'projects/site'
BASE='a87b78462487a38b08c1294d58dad238654249f6';ROUTE='/destinations/belghar-tumudibandha/'
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
builds=json.loads((OUT/'build-results.json').read_text());check(len(builds)==13 and all(x['exit_code']==0 for x in builds),'All thirteen build/test/disclosure/audit stages passed')
im=json.loads((ROOT/'kb/research/destinations/belghar-tumudibandha-image.json').read_text())
report['manuscript_sha256']=sha((ROOT/'kb/research/places/belghar-tumudibandha-article.md').read_bytes());check(report['manuscript_sha256']=='1cd00aff53698ffbd44e58c8a319bd4e246a9481a5c9d86bb29a7eba752ccb24','Reviewed manuscript exact')
provenance=json.loads((OUT/'media/illustration-provenance.json').read_text())
for f in provenance['files']:check(sha((ROOT/f['path']).read_bytes())==f['sha256'],'Preserved reviewed media '+f['path'])
variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==im['src']);check([x['width'] for x in variants]==[480,960,1200],'Responsive sizes do not enlarge source');fragments=[]
for edition in ['dist','dist-coast','dist-publish']:
 base=SITE/edition;html=(base/ROUTE.strip('/')/'index.html').read_text();p=parse(html)
 check(len(p.ids)==len(set(p.ids)),edition+': unique IDs')
 notes=[x for x in p.links if x.startswith('#user-content-fn')];check(len(notes)==12 and all(x[1:] in p.ids for x in notes),edition+': six native citations and returns resolve')
 check('Footnotes &amp; Sources' in html and 'By Ahimanikya Satapathy' in html,edition+': visible sources and byline')
 for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+im['src'],edition+': '+key)
 hero=next(x for x in p.imgs if x.get('src')==im['src'])
 check(hero.get('width')=='1200' and hero.get('height')=='800' and hero.get('loading')=='eager' and hero.get('fetchpriority')=='high',edition+': geometry and prioritized hero')
 check(hero.get('alt')==im['alt'],edition+': illustrative alternative')
 check(sha((base/im['src'].lstrip('/')).read_bytes())==provenance['files'][1]['sha256'],edition+': reviewed image exact')
 emitted=re.findall(r'(/images/responsive/[^ ,]+)',hero.get('srcset',''));check(emitted==[x['src'] for x in variants],edition+': all three variants attached')
 for x in variants:
  b=(base/x['src'].lstrip('/')).read_bytes();check(len(b)==x['bytes'] and sha(b)==x['sha256'],edition+': variant '+str(x['width'])+' exact')
 for credit in [im['caption'],'Illustration: Project Odisha.',im['changes']]:check(credit in html,edition+': caption '+credit)
 for incoming in ['destinations/hills','destinations','explore']:
  s=(base/incoming/'index.html').read_text();cards=[x for x in re.findall(r'<article\b.*?</article>',s,re.S) if 'href="'+ROUTE+'"' in x]
  check(len(cards)==1,edition+': one incoming card '+incoming);check(any(x.get('src')==im['src'] for x in parse(cards[0]).imgs),edition+': illustrated preview '+incoming);check(bool(re.search(r'>Illustration</(?:p|figcaption)>',cards[0])),edition+': explicit illustration label '+incoming)
 fragment=re.search(r'<article class="article-reading.*?</article>',html,re.S).group();fragments.append(fragment)
 for href in parse(fragment).links:
  if href.startswith('/') and not href.startswith('//') and '?' not in href and '#' not in href:check((base/href.strip('/')/'index.html').is_file(),edition+': related target '+href)
 report['editions'][edition]={'article_sha256':sha(html.encode()),'article_fragment_sha256':sha(fragment.encode()),'native_reference_return_links':len(notes),'variants':emitted}
check(fragments[0]==fragments[1]==fragments[2],'Article identical across three editions')
for path in ['kb/records/sola-publication-20261123.json','kb/research/culture/sola-and-tahia.md','kb/records/gandhamardan-publication-20261123.json','projects/site/src/pages/stories/sola-and-odissi-tahia.astro','projects/site/public/images/stories/sola-tahia.webp']:
 check((ROOT/path).read_bytes()==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),'Preserved preceding evidence '+path)
path='kb/team/operations.json';now=json.loads((ROOT/path).read_text());old=json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
for key in ['current_task','handoff_home']:check(now[key]==old[key],'Preserved foreign '+key)
files=[f for f in (SITE/'dist-publish').rglob('*') if f.is_file()];check(not any(f.name=='landscape-original.png' for f in files),'Internal original excluded from public export')
check((SITE/'dist-publish/stories/sola-and-odissi-tahia/index.html').is_file(),'Published Sola remains included')
size=sum(f.stat().st_size for f in files);check(size<1_000_000_000,'Package below strict decimal 1GB');report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size};report['media']={'public_base_bytes':provenance['files'][1]['bytes'],'variants':variants,'total_bytes':provenance['files'][1]['bytes']+sum(x['bytes'] for x in variants)}
report['status']='pass';(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'pass','checks':len(report['checks']),'payload':report['payload']}))
