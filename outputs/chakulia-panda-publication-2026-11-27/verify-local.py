"""Read-only local artifact verification. Run only after all three editions are built."""
import hashlib,json,re,subprocess
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];SITE=ROOT/'projects/site'
C=json.loads((OUT/'implementation/contract.json').read_text())
report={'status':'RUNNING','checks':[],'limits':['Local artifacts only; no browser or live-delivery claim.','Full-frame CSS and geometry checks do not replace visual inspection.','Projected encoding hashes are platform-specific; actual local responsive manifest is verified against actual files.']}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(ok,label):
 if not ok:raise AssertionError(label)
 report['checks'].append(label)
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=[];self.anchors=[];self.images=[];self.meta={};self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.anchors.append(a)
  if t=='img':self.images.append(a)
  if t=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content')
 @property
 def links(self):return [a.get('href','') for a in self.anchors]
class Text(HTMLParser):
 def __init__(self,s):super().__init__();self.parts=[];self.feed(s)
 def handle_data(self,s):self.parts.append(s)
 def handle_starttag(self,t,a):
  if t=='br':self.parts.append(' ')
def text(s):return ' '.join(''.join(Text(s).parts).split())
def paragraph(s):return text(re.sub(r'<a\b[^>]*data-footnote-backref[^>]*>.*?</a>|<sup\b[^>]*>.*?</sup>','',s,flags=re.S))
def main():
 check(sha(ROOT/C['manuscript'])==C['manuscript_sha256'],'Frozen canonical manuscript exact')
 check(sha(ROOT/C['original_path'])==C['original_sha256'],'Original photograph exact')
 for row in C['compiled']:check(sha(ROOT/row['path'])==row['sha256'],'Frozen page source '+row['path'])
 protected=json.loads((ROOT/'outputs/gupteswar-publication-2026-11-27/protected-preparation.json').read_text())
 check(len(protected)==141,'Protected preparation manifest contains 141 files')
 for row in protected:check(sha(ROOT/row['path'])==row['sha256'],'Protected preparation '+row['path'])
 entries=json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images']
 entries=[e for e in entries if e['src']==C['base_image']];check(len(entries)==1,'One responsive source')
 variants=entries[0]['variants'];check([(v['width'],v['height']) for v in variants]==[(480,377),(960,754),(1200,943)],'Full-frame responsive dimensions')
 urls=[C['base_image']]+[v['src'] for v in variants]
 expected={C['base_image']:C['base_sha256'],**{v['src']:v['sha256'] for v in variants}}
 paths=[str(SITE/'dist-publish'/u.lstrip('/')) for u in urls]
 js="const sharp=require('sharp');Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return [m.width,m.height]})).then(x=>console.log(JSON.stringify(x)))"
 dims=json.loads(subprocess.check_output(['/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','-e',js,json.dumps(paths)],cwd=SITE))
 check(dims==[[1200,943],[480,377],[960,754],[1200,943]],'Actual delivery files decode to expected dimensions')
 expected_html=C['expected_article_html'].split('<h2 id="further-reading">')[0]
 expected_paragraphs=[paragraph(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',expected_html,re.S)]
 expected_headings=[text(p) for p in re.findall(r'<h2\b[^>]*>(.*?)</h2>',expected_html,re.S)]
 expected_sources=[u for u in Page(expected_html).links if u.startswith('https://')]
 source_url='https://commons.wikimedia.org/wiki/File:Chakulia_panda_walking_at_a_village_area_in_Odisha.JPG'
 license_url='https://creativecommons.org/licenses/by-sa/4.0/'
 bodies=[]
 for edition in ['dist','dist-coast','dist-publish']:
  base=SITE/edition;html=(base/C['route'].strip('/')/'index.html').read_text();p=Page(html)
  found=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',html,re.S);check(len(found)==1,edition+' one primary article');body=found[0];bodies.append(body)
  check(len(re.findall(r'<h1\b',html))==1,edition+' one h1')
  check(text(re.search(r'<h1\b[^>]*>(.*?)</h1>',body,re.S)[1])==C['title'],edition+' reviewed title')
  check(p.meta.get('description')==C['description'],edition+' exact description')
  check(len(p.ids)==len(set(p.ids)),edition+' unique IDs')
  refs=[a for a in p.anchors if 'data-footnote-ref' in a];back=[a for a in p.anchors if 'data-footnote-backref' in a]
  check(len(refs)==5 and len(back)==5 and len(set(a['href'] for a in refs))==5,edition+' five references notes and returns')
  check(all(a['href'][1:] in p.ids for a in refs+back),edition+' note targets resolve')
  digits=re.findall(r'<a\b[^>]*data-footnote-ref\b[^>]*>(\d+)</a>',body);check(digits==['1','2','3','4','5'],edition+' sequential numeric markers')
  notes=re.findall(r'<li id="user-content-fn-[^"]+">.*?</li>',body,re.S);check(len(notes)==5 and source_url in notes[1],edition+' photograph attribution is second note')
  actual=[paragraph(x) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',body,re.S)]
  for value in expected_paragraphs:check(value in actual,edition+' exact canonical paragraph '+value[:40])
  headings=[text(x) for x in re.findall(r'<h2\b[^>]*>(.*?)</h2>',body,re.S)]
  for value in expected_headings:check(value in headings,edition+' heading '+value)
  check(headings.count('Footnotes & Sources')==1 and headings.count('Further reading')==1,edition+' single visible notes and reading sections')
  for u in expected_sources:check(u in p.links,edition+' exact source link '+u)
  for value in ['By Ahimanikya Satapathy','Suggest an update','GitHub submissions are public','under the same licence']:check(value in text(body),edition+' visible '+value)
  check('/contribute/?page=%2Fsounds-of-odisha%2Fchakulia-panda%2F' in p.links,edition+' scoped update link')
  for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+C['base_image'],edition+' '+key)
  check([p.meta.get('og:image:'+d) for d in ['width','height']]==['1200','943'],edition+' sharing dimensions')
  check('noindex' in p.meta.get('robots',''),edition+' search hold')
  images=[im for im in p.images if im.get('src')==C['base_image']];check(len(images)==1,edition+' one article photo');hero=images[0]
  check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['1200','943','eager','high'],edition+' hero size and priority')
  check(hero.get('alt')==Page(expected_html).images[0]['alt'],edition+' exact photo alt')
  check({u:int(w) for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}=={v['src']:v['width'] for v in variants},edition+' actual responsive mapping')
  for u in urls:check(sha(base/u.lstrip('/'))==expected[u],edition+' exact image '+u)
  for incoming in C['incoming']:
   parent=(base/incoming.strip('/')/'index.html').read_text();pp=Page(parent)
   check(pp.links.count(C['route'])==1,edition+' one incoming link '+incoming)
   cards=re.findall(r'<section\b[^>]*class="[^"]*chakulia-reading[^"]*"[^>]*>.*?</section>',parent,re.S)
   check(len(cards)==1 and C['route'] in Page(cards[0]).links,edition+' one local reading card '+incoming)
   preview=Page(cards[0]).images;check(len(preview)==1 and preview[0].get('src')==C['base_image'] and preview[0].get('loading')=='lazy',edition+' shared photo preview '+incoming)
   credits=re.findall(r'<p\b[^>]*class="chakulia-credit"[^>]*>.*?</p>',parent,re.S)
   check(len(credits)==1 and text(credits[0])=='Aditya Mahar · CC BY-SA 4.0. Resized and compressed; same licence.',edition+' compact complete credit '+incoming)
   check(source_url in Page(credits[0]).links and license_url in Page(credits[0]).links,edition+' credit links '+incoming)
   check('1200/943' in parent and 'object-fit:contain' in parent,edition+' scoped full-frame preview CSS '+incoming)
   check((base/incoming.strip('/')/'index.html').is_file(),edition+' outgoing destination exists '+incoming)
   check(incoming in p.links,edition+' reciprocal reading link '+incoming)
  excluded=[str(f.relative_to(base)) for f in base.rglob('*') if f.is_file() and any(term in f.as_posix().lower() for term in ['/kb/','/outputs/','kaincha','chakulia-panda-original','commons-api.json','download-headers.txt'])]
  check(not excluded,edition+' internal originals, Kaincha and research evidence excluded: '+str(excluded))
 check(bodies[0]==bodies[1]==bodies[2],'Exact article fragment across all three editions')
 files=[p for p in (SITE/'dist-publish').rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in files);check(total<1_000_000_000,'Actual final payload below one billion bytes')
 report.update(status='PASS',payload_bytes=total,files=len(files),remaining_bytes=1_000_000_000-total,article_sha256=hashlib.sha256(bodies[-1].encode()).hexdigest(),images=[{'url':u,'sha256':sha(SITE/'dist-publish'/u.lstrip('/'))} for u in urls])
try:main()
except Exception as e:report.update(status='FAIL',error=str(e));raise
finally:(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(report['status'],len(report['checks']))
