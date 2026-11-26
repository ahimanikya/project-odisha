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
def fragment(text):
 rows=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S);check(len(rows)==1,'one primary article');return rows[0]
def main():
 c=J(O/'reviewed-article-contract.json');im=c['image'];stages=J(O/'build-results.json')
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
 check(actual_dims==[[1200,900]]+c['variant_dimensions'],'actual image files independently decoded')
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
  check('/contribute/?page=%2Fdestinations%2Fmahavinayak%2F' in p.links,edition+' scoped contribution link')
  for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+im['src'],edition+' '+key)
  for dim in ['width','height']:check(p.meta.get('og:image:'+dim)==str(im[dim]),edition+' sharing '+dim)
  check('noindex' in p.meta.get('robots',''),edition+' search hold rendered')
  figs=[x for x in re.findall(r'<figure\b[^>]*>.*?</figure>',body,re.S) if im['src'] in x];check(len(figs)==1,edition+' one hero figure');fp=Page(figs[0]);hero=next(x for x in fp.images if x.get('src')==im['src'])
  check([hero.get(k) for k in ['alt','width','height','loading','fetchpriority']]==[im['alt'],str(im['width']),str(im['height']),'eager','high'],edition+' hero identity and geometry')
  check({int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}=={x['width']:x['src'] for x in v},edition+' hero responsive mapping')
  for value in [im['caption'],im['creator'],im['license'],im['changes']]:check(value in plain(figs[0]),edition+' photo attribution '+value)
  for value in [im['source'],im['license_url']]:check(value in fp.links,edition+' photo credit link')
  check(H(base/im['src'].lstrip('/'))==im['public']['sha256'],edition+' exact hero bytes')
  for x in v:check(H(base/x['src'].lstrip('/'))==x['sha256'],edition+' exact variant '+str(x['width']))
  for incoming in ['destinations/hills','destinations','explore']:
   text=(base/incoming/'index.html').read_text();cards=[x for x in re.findall(r'<article\b[^>]*>.*?</article>',text,re.S) if 'href="'+c['route']+'"' in x];check(len(cards)==1,edition+' unique incoming '+incoming)
   check(any(x.get('src')==im['src'] and x.get('alt')==im['alt'] for x in Page(cards[0]).images),edition+' photo preview '+incoming)
   check('Mahavinayak' in plain(cards[0]) and 'A pilgrimage hill and a stone associated with five deities.' in plain(cards[0]),edition+' exact incoming title and summary '+incoming)
   preview=next(x for x in Page(cards[0]).images if x.get('src')==im['src'])
   check([preview.get(k) for k in ['width','height','loading']]==['1200','900','lazy'],edition+' incoming geometry and lazy loading '+incoming)
   expected_srcset={x['width']:x['src'] for x in v} if incoming=='explore' else {}
   check({int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',preview.get('srcset',''))}==expected_srcset,edition+' existing template image mapping '+incoming)
   credits=[x for x in re.findall(r'<li\b[^>]*>.*?</li>',text,re.S) if im['source'] in unescape(x)]
   for val in [im['creator'],im['source'],im['license_url'],im['changes']]:check(any(val in unescape(x) for x in credits),edition+' preview attribution '+incoming)
  for route in c['reading_routes']:check(route in Page(body).links and (base/route.strip('/')/'index.html').is_file(),edition+' reading link '+route)
  desc=c['dhaga_descriptor'];pdf=base/'archive'/desc['asset_name'];check(pdf.stat().st_size==desc['bytes'] and H(pdf)==desc['sha256'],edition+' unchanged reviewed PDF')
  report['editions'][edition]={'article_sha256':hashlib.sha256(body.encode()).hexdigest(),'references':len(refs),'notes':len(set(refs))}
 check(bodies[0]==bodies[1]==bodies[2],'article body exact across editions')
 protected=J(R/c['protected_manifest']);check(H(R/c['protected_manifest'])==c['protected_manifest_sha256'],'protected manifest exact')
 for x in protected:check(H(R/x['path'])==x['sha256'],'protected '+x['path'])
 foreign=J(O/'protected-ownership.json');op=J(R/'kb/team/operations.json');check(all(op[k]==val for k,val in foreign.items()),'foreign ownership preserved')
 forbidden=['godabarish-mahapatra-and-niankhunta','satirical-periodical-illustration','Godabarish Mahapatra and the Pages of Niankhunta','Godabarish Mahapatra brought poetry and public criticism into the work of editing a periodical.','kaincha-and-golden-grass','golden-grass-square-box.jpg','Kaincha: Making with Golden Grass','Golden grass takes its name from the lustre of the dried material.']
 internal=[x for x in protected if 'godabarish' in x['path'] or 'kaincha' in x['path']];hs={x['sha256'] for x in internal};sizes={(R/x['path']).stat().st_size for x in internal}
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
 check(H(R/'kb/research/media/sahi-jatra/performer.jpg')==cap['source']['sha256'],'KB Sahi source original exact')
 for path in ['kb/research/culture/sahi-jatra.md','projects/site/src/pages/stories/sahi-jatra.astro']:
  old=subprocess.check_output(['git','show',c['base']+':'+path],cwd=R)
  check((R/path).read_bytes()==old,'unchanged Sahi article source '+path)
 for edition in ['public','dist','dist-coast']:check(H(S/edition/asset)==cap['source']['sha256'],edition+' original Sahi photograph unchanged')
 check(H(S/'dist-publish'/asset)==cap['candidate']['sha256'],'exact reviewed Sahi q88 delivery')
 text=(S/'dist-publish'/cap['page']).read_text();page=Page(text)
 before=fragment((S/'dist-coast'/cap['page']).read_text());after=fragment(text)
 check(before.count('reproduced without alteration.')==1,'unique pre-existing Sahi credit phrase')
 expected_body=before.replace('reproduced without alteration.','resized and compressed for web delivery without cropping.')
 check(after==expected_body,'Sahi complete article and image references unchanged except existing exact disclosure transform')
 check(page.meta.get('og:image:width')=='1590' and page.meta.get('og:image:height')=='2400','orientation-aware Sahi sharing dimensions')
 check(cap['source_url'] in page.links and 'for web delivery without cropping' in text,'Sahi credit and compression disclosure retained')
 files=[p for p in (S/'dist-publish').rglob('*') if p.is_file()];size=sum(p.stat().st_size for p in files);check(size<1000000000,'actual local publication under strict limit')
 report.update(status='PASS',protected_files=len(protected),publication_bytes=size,publication_files=len(files),remaining_bytes=1000000000-size,checks_passed=len(report['checks']))
try:main()
except Exception as e:report.update(status='FAIL',error=str(e));raise
finally:(O/'local-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['status','checks_passed','publication_bytes','publication_files','remaining_bytes']}))
