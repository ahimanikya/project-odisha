"""Read-only verification of actual Nilagiri publication artifacts."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import json,hashlib,re,subprocess
O=Path(__file__).resolve().parent; R=O.parents[1]; S=R/'projects/site'
ROUTE='/stories/nilagiri-stone-utensils/'; IMAGE='/assets/nilagiri-utensils/nilagiri-stone-utensils-1200.webp'
BASE='013a3950f5e30aace88e2fdf5179819cdc8041a5'
H=lambda b:hashlib.sha256(b).hexdigest()
report={'status':'RUNNING','checks':[],'editions':{},'limits':'Local artifacts only; hosted capacity and live browser delivery require separate verification. Uniqueness of the one new JPEG allowlist entry is separately bound by Drishti capacity-implementation-review.json, not inferred from the Osakothi artifact check.'}
def check(ok,label):
 if not ok: raise AssertionError(label)
 report['checks'].append(label)
def plain(s):return ' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.ids=[];self.links=[];self.images=[];self.meta={};self.feed(s)
 def handle_starttag(self,t,a):
  d=dict(a)
  if 'id' in d:self.ids.append(d['id'])
  if t=='a':self.links.append(d.get('href',''))
  if t=='img':self.images.append(d)
  if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
def fragment(s):return re.search(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',s,re.S).group()
def main():
 stages=json.loads((O/'build-results.json').read_text());expected_stages=['full-build','full-disclosures','full-tests','coast-build','coast-disclosures','coast-tests','coast-acceptance','coast-discovery','search-review','launch-readiness','publication-build','publication-disclosures','search-shortlist'];check([x['stage'] for x in stages]==expected_stages and all(x['exit_code']==0 for x in stages),'All thirteen distinct ordered build/test/audit stages passed')
 for stage in stages:
  check(stage.get('source_hashes') and all(H((R/p).read_bytes())==v for p,v in stage['source_hashes'].items()),'Current public source matches stage '+stage['stage'])
 protected=json.loads((O/'preserved-preparation.json').read_text());check(len(protected)==67,'67 protected preparation records')
 for item in protected:check(H((R/item['path']).read_bytes())==item['sha256'],'Preserved '+item['path'])
 check(all(x['manuscript_sha256']=='7c300d0ae2316e4ef33f621be197ed5fd1615157eddb454c1e7469790edddbed' for x in stages),'Every stage bound frozen canonical manuscript')
 op='kb/team/operations.json';before=json.loads(subprocess.check_output(['git','show',BASE+':'+op],cwd=R));now=json.loads((R/op).read_text())
 for key in ['current_task','handoff_home']:check(before[key]==now[key],'Foreign ownership '+key)
 variants=next(x['variants'] for x in json.loads((S/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==IMAGE)
 check([x['width'] for x in variants]==[480,960,1200],'Three source-limited responsive widths')
 node="import{readFileSync}from'node:fs';import{renderReviewedCultureArticle}from'./src/lib/reviewed-culture-article.mjs';let source=readFileSync('../../kb/research/culture/nilagiri-stone-utensils.md','utf8');process.stdout.write(renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/nilagiri-stone-utensils.md',route:'/stories/nilagiri-stone-utensils/',images:{'../../media/nilagiri-utensils/nilagiri-stone-utensils-1200.webp':'/assets/nilagiri-utensils/nilagiri-stone-utensils-1200.webp'}}).html);"
 expected=subprocess.check_output(['/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','--input-type=module','-e',node],cwd=S,text=True)
 expected=re.sub(r'<h2 id="further-reading">Further reading</h2>\s*<p>.*?</p>','',expected,flags=re.S)
 paras=[plain(x) for x in re.findall(r'<p>(.*?)</p>',expected,re.S)]
 incoming=['stories/craft-listening/index.html','destinations/balasore/index.html','stories/jau-kandhei-clay-lac-and-the-makers-of-balasore/index.html']
 bodies=[]
 for edition in ['dist','dist-coast','dist-publish']:
  base=S/edition;html=(base/ROUTE.strip('/')/'index.html').read_text();body=fragment(html);p=Page(html);bodies.append(body)
  check(len(p.ids)==len(set(p.ids)),edition+': unique IDs')
  refs=[x for x in p.links if x.startswith('#user-content-fn-')];backs=[x for x in p.links if x.startswith('#user-content-fnref-')]
  check(sorted(refs)==['#user-content-fn-'+str(n) for n in range(1,5)] and sorted(backs)==['#user-content-fnref-'+str(n) for n in range(1,5)] and all(x[1:] in p.ids for x in refs+backs),edition+': four native references and returns')
  for text in paras:check(text in plain(body),edition+': exact canonical paragraph '+text[:45])
  for text in ['By Ahimanikya Satapathy','Footnotes & Sources','Illustration: Project Odisha.','Further reading','Suggest an update']:check(text in plain(body),edition+': visible '+text)
  check(p.meta.get('description')=='Nilagiri’s stone utensils and the turning and polishing of stoneware in Odisha.',edition+': exact description')
  check('An interpretation of stone vessel forms, not a photograph of a particular maker’s work.' in plain(body),edition+': precise illustrative caption')
  for key in ['og:image','twitter:image']:check(p.meta[key]=='https://projectodisha.org'+IMAGE,edition+': sharing image '+key)
  hero=next(x for x in p.images if x.get('src')==IMAGE)
  check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['1200','800','eager','high'],edition+': full-frame eager hero')
  check(hero.get('alt')=='Illustration of a stone bowl and shallow plate.',edition+': precise image description')
  check({int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero['srcset'])}=={v['width']:v['src'] for v in variants},edition+': actual responsive references')
  media={}
  for url in [IMAGE]+[v['src'] for v in variants]:
   data=(base/url.lstrip('/')).read_bytes();media[url]={'bytes':len(data),'sha256':H(data)}
  for v in variants:
   check(media[v['src']]['sha256']==v['sha256'] and media[v['src']]['bytes']==v['bytes'],edition+': responsive bytes match report '+v['src'])
  check(media[IMAGE]['sha256']=='8ac780530a8262e6716b60bc00b63bac4e1a25fc8b12ed0e63b0e2194191bfae',edition+': selected illustration exact')
  for page in incoming:
   content=(base/page).read_text();cards=re.findall(r'<a\b[^>]*href="'+re.escape(ROUTE)+r'"[^>]*>.*?</a>',content,re.S)
   check(len(cards)==1 and IMAGE in cards[0] and 'Illustration: Project Odisha.' in plain(cards[0]) and 'Nilagiri’s Stone Utensils' in plain(cards[0]) and 'alt' in Page(cards[0]).images[0] and Page(cards[0]).images[0]['alt'] in ['',None],edition+': credited incoming card '+page)
  if edition!='dist':
   paths=[str(f.relative_to(base)) for f in base.rglob('*') if f.is_file()]
   check(not any('kaincha' in f or 'nilagiri-stone-utensils-illustration.png' in f or f.startswith(('kb/','outputs/')) for f in paths),edition+': internal preparation/source original excluded')
  report['editions'][edition]={'article_sha256':H(body.encode()),'media':media}
 check(len(set(bodies))==1,'Article fragments exact across three editions')
 source=S/'public/assets/osakothi/simanchala-nahaka-2019.jpg';published=S/'dist-publish/assets/osakothi/simanchala-nahaka-2019.jpg';proposal=json.loads((O/'capacity/osakothi-q88-proposal.json').read_text())
 check(H(source.read_bytes())==proposal['source_sha256'],'Osakothi original preserved')
 check(H(published.read_bytes())==proposal['candidate_sha256'],'Exact reviewed q88 delivery JPEG')
 check((S/'dist-coast/assets/osakothi/simanchala-nahaka-2019.jpg').read_bytes()==source.read_bytes(),'Coastal Osakothi original preserved')
 credit=(S/'dist-publish/stories/when-the-goddess-comes-to-the-wall/index.html').read_text();check(proposal['proposed_phrase'] in plain(credit),'Public compression disclosure')
 files=[p for p in (S/'dist-publish').rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in files);check(total<1000000000,'Actual local payload below strict billion-byte gate')
 report['payload']={'bytes':total,'files':len(files),'remaining_bytes':1000000000-total};report['status']='PASS';report['check_count']=len(report['checks'])
try:main()
except Exception as e:report['status']='FAIL';report['error']=str(e);raise
finally:(O/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['status','check_count','payload']}))
