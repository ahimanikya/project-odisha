"""Verify actual built article, notes, images, incoming links and protected scope."""
import hashlib,json,re,subprocess
from pathlib import Path
from html import unescape
from html.parser import HTMLParser
O=Path(__file__).resolve().parent;R=O.parents[1];S=R/'projects/site'
H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
J=lambda p:json.loads(p.read_text())
plain=lambda s:' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
report={'status':'RUNNING','checks':[],'limits':['Local artifacts only; browser, hosted capacity and live delivery require separate evidence.','Byte equality locally does not imply identical hosted encodings.']}
def check(ok,label):
 if not ok:raise AssertionError(label)
 report['checks'].append(label)
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.links=[];self.images=[];self.meta={};self.feed(text)
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='img':self.images.append(a)
  if t=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content')
def inline_styles(image):
 return {key.strip().lower():' '.join(value.strip().lower().split()) for declaration in image.get('style','').split(';') if ':' in declaration for key,value in [declaration.split(':',1)]}
def fragment(text):
 rows=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S);check(len(rows)==1,'one primary article');return rows[0]
def main():
 c=J(O/'reviewed-article-contract.json');im=c['image'];stages=J(O/'build-results.json')
 check(c['route']=='/destinations/gupteswar/','reviewed Gupteswar route')
 check([im['width'],im['height']]==[1200,798] and im['creator']=='Indopaedia' and im['license']=='CC BY-SA 4.0','reviewed Gupteswar photograph identity and geometry')
 check(bool(c['variant_dimensions']) and all(0<w<=im['width'] and abs(h-w*im['height']/im['width'])<=1 for w,h in c['variant_dimensions']),'reviewed full-frame responsive dimensions')
 check(c['references']==7 and c['unique_notes']==4,'reviewed seven markers and four source notes')
 check(set(c['reading_routes'])=={'/destinations/deomali/','/destinations/devagiri/','/destinations/hills/'} and len(c['reading_routes'])==3,'reviewed Gupteswar reading routes')
 expected=['full-build','full-disclosures','full-tests','coast-build','coast-disclosures','coast-tests','coast-acceptance','coast-discovery','search-review','launch-readiness','publication-build','publication-disclosures','search-shortlist']
 check([s['stage'] for s in stages]==expected and all(s['exit_code']==0 for s in stages),'all thirteen existing release stages pass')
 for p,h in c['source_hashes'].items():check(H(R/p)==h,'frozen input '+p)
 check(all(s['source_hashes']==c['source_hashes'] for s in stages),'same frozen inputs throughout builds')
 check(H(R/im['original']['path'])==im['original']['sha256'],'retained exact photograph original')
 check(H(R/im['public']['path'])==im['public']['sha256'],'exact selected public photograph')
 variants=[x for x in J(S/'.astro/responsive-image-report.json')['images'] if x['src']==im['src']];check(len(variants)==1,'one responsive source');v=variants[0]['variants']
 check([[x['width'],x['height']] for x in v]==c['variant_dimensions'],'expected responsive dimensions')
 image_paths=[str(S/'public'/im['src'].lstrip('/'))]+[str(S/'public'/x['src'].lstrip('/')) for x in v]
 js="import sharp from 'sharp';console.log(JSON.stringify(await Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return [m.width,m.height]}))));"
 actual_dims=json.loads(subprocess.check_output(['/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','--input-type=module','-e',js,json.dumps(image_paths)],cwd=S))
 check(actual_dims==[[im['width'],im['height']]]+c['variant_dimensions'],'actual image files independently decoded')
 selection=J(S/'editions/search-candidate.json');check(next(x for x in selection['pages'] if x['route']==c['route'])['decision']=='hold','search decision remains hold')
 bodies=[];report['editions']={}
 for edition in ['dist','dist-coast','dist-publish']:
  base=S/edition;html=(base/c['route'].strip('/')/'index.html').read_text();body=fragment(html);bodies.append(body);p=Page(html)
  check(len(p.ids)==len(set(p.ids)),edition+' unique IDs')
  refs=[x for x in p.links if x.startswith('#user-content-fn-')];returns=[x for x in p.links if x.startswith('#user-content-fnref-')]
  check(len(refs)==c['references'] and len(set(refs))==c['unique_notes'] and len(returns)==c['references'] and len(set(returns))==c['references'] and all(x[1:] in p.ids for x in refs+returns),edition+' notes and returns resolve')
  paras=[plain(re.sub(r'<sup\b[^>]*>.*?</sup>','',x,flags=re.S)) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',body,re.S)]
  for para in c['paragraphs']:check(plain(para) in paras,edition+' exact paragraph '+para[:30])
  for url in c['source_urls']:check(url in p.links,edition+' source '+url)
  for label in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update']:check(label in plain(body),edition+' visible '+label)
  check('/contribute/?page=%2Fdestinations%2Fgupteswar%2F' in p.links,edition+' scoped contribution link')
  for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+im['src'],edition+' '+key)
  for dim in ['width','height']:check(p.meta.get('og:image:'+dim)==str(im[dim]),edition+' sharing '+dim)
  check('noindex' in p.meta.get('robots',''),edition+' search hold rendered')
  figs=[x for x in re.findall(r'<figure\b[^>]*>.*?</figure>',body,re.S) if im['src'] in x];check(len(figs)==1,edition+' one hero figure');fp=Page(figs[0]);hero=next(x for x in fp.images if x.get('src')==im['src'])
  check([hero.get(k) for k in ['alt','width','height','loading','fetchpriority']]==[im['alt'],str(im['width']),str(im['height']),'eager','high'],edition+' hero identity and geometry')
  check(not {'object-position','object-fit','clip','clip-path'}.intersection(inline_styles(hero)),edition+' full-frame hero has no imposed inline crop or position')
  check({int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}=={x['width']:x['src'] for x in v},edition+' hero responsive mapping')
  for value in [im['caption'],im['creator'],im['license'],im['changes']]:check(value in plain(figs[0]),edition+' photo attribution '+value)
  for value in [im['source'],im['license_url']]:check(value in fp.links,edition+' photo credit link')
  check(H(base/im['src'].lstrip('/'))==im['public']['sha256'],edition+' exact hero bytes')
  for x in v:check(H(base/x['src'].lstrip('/'))==x['sha256'],edition+' exact variant '+str(x['width']))
  for incoming in ['destinations/hills','destinations','explore']:
   text=(base/incoming/'index.html').read_text();cards=[x for x in re.findall(r'<article\b[^>]*>.*?</article>',text,re.S) if 'href="'+c['route']+'"' in x];check(len(cards)==1,edition+' unique incoming '+incoming)
   check(any(x.get('src')==im['src'] and x.get('alt')==im['alt'] for x in Page(cards[0]).images),edition+' photo preview '+incoming)
   card_paragraphs=[plain(x) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',cards[0],re.S)]
   check(c['preview_title'] in plain(cards[0]) and card_paragraphs.count(c['preview_summary'])==1,edition+' exact incoming title and summary '+incoming)
   preview=next(x for x in Page(cards[0]).images if x.get('src')==im['src'])
   check([preview.get(k) for k in ['width','height','loading']]==[str(im['width']),str(im['height']),'lazy'],edition+' incoming geometry and lazy loading '+incoming)
   check(inline_styles(preview).get('object-position')==im.get('previewPosition'),edition+' reviewed optional preview position '+incoming)
   expected_srcset={x['width']:x['src'] for x in v} if incoming=='explore' else {}
   check({int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',preview.get('srcset',''))}==expected_srcset,edition+' existing template image mapping '+incoming)
   credits=[x for x in re.findall(r'<li\b[^>]*>.*?</li>',text,re.S) if im['source'] in unescape(x)]
   for val in [im['creator'],im['source'],im['license_url'],im['changes']]:check(any(val in unescape(x) for x in credits),edition+' preview attribution '+incoming)
  for route in c['reading_routes']:check(route in Page(body).links and (base/route.strip('/')/'index.html').is_file(),edition+' reading link '+route)
  desc=c['dhaga_descriptor'];pdf=base/'archive'/desc['asset_name'];check(pdf.stat().st_size==desc['bytes'] and H(pdf)==desc['sha256'],edition+' unchanged reviewed PDF')
  report['editions'][edition]={'article_sha256':hashlib.sha256(body.encode()).hexdigest(),'references':len(refs),'notes':len(set(refs))}
 check(bodies[0]==bodies[1]==bodies[2],'article body exact across editions')
 protected=J(R/c['protected_manifest']);check(H(R/c['protected_manifest'])==c['protected_manifest_sha256'],'protected manifest exact')
 check(len(protected)==141,'all 141 reserved preparation files accounted for')
 for x in protected:check(H(R/x['path'])==x['sha256'],'protected '+x['path'])
 foreign=J(O/'protected-ownership.json');op=J(R/'kb/team/operations.json');check(all(op[k]==val for k,val in foreign.items()),'foreign ownership preserved')
 # Published earlier articles remain allowed. Kaincha and Chakulia Panda remain unpublished.
 forbidden=['Chakulia Panda songs bring poetry into an encounter between a travelling singer and a household.', 'chakulia-panda','Chakulia Panda: Verse at the Doorstep','antaranga-after-devagiri-20261127','kaincha-and-golden-grass','golden-grass-square-box.jpg','Kaincha: Making with Golden Grass','Golden grass takes its name from the lustre of the dried material.']
 internal=[x for x in protected if any(k in x['path'].lower() for k in ['kaincha','chakulia-panda','outputs/antaranga-after-devagiri-20261127/'])];check(any('kaincha' in x['path'] for x in internal) and any('chakulia-panda' in x['path'] for x in internal),'Both unpublished preparations present in protection manifest')
 hs={x['sha256'] for x in internal};sizes={(R/x['path']).stat().st_size for x in internal}
 for edition in ['dist-coast','dist-publish']:
  failures=[]
  for p in (S/edition).rglob('*'):
   if p.is_symlink():failures.append(str(p))
   if not p.is_file():continue
   rel=str(p.relative_to(S/edition))
   if rel.startswith(('kb/','outputs/')) or any(s in rel for s in forbidden):failures.append(rel)
   if p.stat().st_size in sizes and H(p) in hs:failures.append(rel)
   if p.suffix in ['.html','.json','.md','.txt','.js','.mjs']:
    t=p.read_text(errors='replace')
    if any(s in t or s in plain(t) for s in forbidden):failures.append(rel)
  check(not failures,edition+' unpublished drafts/media excluded')
 cap=c['capacity'];asset=cap['path']
 check(asset=='assets/jhulana-in-odisha/hindola-raga.jpg' and cap['page']=='stories/jhulana-in-odisha/index.html','reviewed Hindola delivery target')
 check(cap['source']['sha256']=='68f51f38c4a37a169f832d367e4230c6b0031cb2d35099cc1fa69f059700ecbc' and cap['candidate']['sha256']=='21974baef73a7c908fb165e222fd51a99c9fa41b6d53f9eede9a16c3460f5052','reviewed Hindola original and q90 candidate identities')
 check(H(O/'capacity/hindola-2048-q90.jpg')==cap['candidate']['sha256'],'retained reviewed Hindola q90 candidate exact')
 check(H(R/'kb/research/media/jhulana/hindola-raga.jpg')==cap['source']['sha256'],'KB Hindola source original exact')
 for path in ['kb/research/culture/jhulana-in-odisha.md','projects/site/src/pages/stories/jhulana-in-odisha.astro']:
  old=subprocess.check_output(['git','show',c['base']+':'+path],cwd=R)
  check((R/path).read_bytes()==old,'unchanged Jhulana article source '+path)
 for edition in ['public','dist','dist-coast']:check(H(S/edition/asset)==cap['source']['sha256'],edition+' original Hindola painting unchanged')
 check(H(S/'dist-publish'/asset)==cap['candidate']['sha256'],'exact reviewed Hindola q90 delivery')
 cap_paths=[str(R/'kb/research/media/jhulana/hindola-raga.jpg'),str(S/'dist-publish'/asset)]
 cap_dims=json.loads(subprocess.check_output(['/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','--input-type=module','-e',js,json.dumps(cap_paths)],cwd=S))
 check(cap_dims==[[2519,3400],[1517,2048]],'actual Hindola original and delivered geometry decoded')
 text=(S/'dist-publish'/cap['page']).read_text();page=Page(text)
 before=fragment((S/'dist-coast'/cap['page']).read_text());after=fragment(text)
 check(fragment((S/'dist'/cap['page']).read_text())==before,'Jhulana article unchanged across original editions')
 check(before.count('Image released under CC0.')==1,'unique pre-existing Hindola credit phrase')
 expected_body=before.replace('Image released under CC0.','Image released under CC0. Full frame, resized and compressed for web delivery.')
 check(after==expected_body,'Jhulana complete article and image references unchanged except existing exact disclosure transform')
 check(page.meta.get('og:image:width')=='1517' and page.meta.get('og:image:height')=='2048','Hindola delivered sharing dimensions')
 check(cap['source_url']=='https://www.clevelandart.org/art/1975.9' and cap['source_url'] in page.links and 'Image released under CC0. Full frame, resized and compressed for web delivery.' in text,'Hindola credit and compression disclosure retained')
 files=[p for p in (S/'dist-publish').rglob('*') if p.is_file()];size=sum(p.stat().st_size for p in files);check(size<1000000000,'actual local publication under strict limit')
 report.update(status='PASS',protected_files=len(protected),publication_bytes=size,publication_files=len(files),remaining_bytes=1000000000-size,checks_passed=len(report['checks']))
try:main()
except Exception as e:report.update(status='FAIL',error=str(e));raise
finally:(O/'local-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['status','checks_passed','publication_bytes','publication_files','remaining_bytes']}))
