"""Read-only Chakulia delivery capture, after an explicitly successful deployment.

Usage: python3 verify-live.py --expected-merge FULL_SHA --deployment-run ID
       --deployment-evidence PATH_TO_RUN_JSON
No publishing, browser automation, source mutation or existing asset copies.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit
from datetime import datetime,timezone
import argparse,hashlib,json,re,subprocess
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];SITE=ROOT/'projects/site';LOCAL=SITE/'dist-publish'
ORIGIN='https://projectodisha.org';NODE='/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
ARTICLE='/sounds-of-odisha/chakulia-panda/';CHAMPU='/literature/champu-and-sakhi/'
ROUTES=[ARTICLE,'/sounds-of-odisha/pala/','/sounds-of-odisha/daskathia/','/literature/',CHAMPU]
RADHA='/assets/champu-and-sakhi/radha-confidante-met.jpg'
COMMONS='https://commons.wikimedia.org/wiki/File:Chakulia_panda_walking_at_a_village_area_in_Odisha.JPG'
LICENCE='https://creativecommons.org/licenses/by-sa/4.0/'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text())
report={'status':'RUNNING','checks':[],'failures':[],'routes':[],'fragments':[],'images':[],'differences':[],
'limits':['HTTP capture only; no visual or browser acceptance and no encoding-cause inference.','Every raw byte difference remains REVIEW_DIFFERENCES even when observed responsive URL substitutions explain a fragment.','Only actual paired image srcset URLs may be substituted in a comparison copy; originals and captures are never rewritten.','No automatic HTTP retries; each invocation creates a separate evidence directory.']}
RUN=None;images={}
def check(ok,label):
 report['checks'].append({'check':label,'pass':bool(ok)})
 if not ok:report['failures'].append(label)
 return bool(ok)
def require(ok,label):
 if not check(ok,label):raise AssertionError(label)
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=[];self.links=[];self.anchors=[];self.images=[];self.meta={};self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''));self.anchors.append(a)
  if t=='img':self.images.append(a)
  if t=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content')
class Text(HTMLParser):
 def __init__(self,s):super().__init__();self.parts=[];self.feed(s)
 def handle_data(self,s):self.parts.append(s)
def plain(s):return ' '.join(''.join(Text(s).parts).split())
def path(url):
 p=urlsplit(url)
 require(not p.scheme and not p.netloc and p.path.startswith('/') and not p.query and not p.fragment and '..' not in p.path.split('/'),'Bounded same-origin path '+url)
 return p.path

def fetch(url,dest,limit):
 url=path(url);request=Request(ORIGIN+url,headers={'User-Agent':'Project-Odisha-delivery-verification/1.0','Accept-Encoding':'identity'})
 try:response=urlopen(request,timeout=45)
 except HTTPError as e:response=e
 with response:
  body=response.read(limit+1);row={'url':url,'requested_url':ORIGIN+url,'final_url':response.url,'status':response.status,'headers':dict(response.headers),'bytes':len(body),'sha256':sha(body),'limit_bytes':limit,'truncated':len(body)>limit}
 dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('xb') as f:f.write(body)
 row['file']=str(dest.relative_to(ROOT));dest.with_suffix(dest.suffix+'.http.json').write_text(json.dumps(row,indent=2)+'\n')
 require(check(row['status']==200,'HTTP 200 '+url) and check(row['final_url']==ORIGIN+url,'Expected final URL '+url) and check(not row['truncated'],'Complete bounded body '+url),'Usable captured response '+url)
 return body,row

def variants(image):
 pairs=re.findall(r'([^ ,]+)\s+(\d+)w',image.get('srcset',''));v={int(w):path(u) for u,w in pairs}
 require(len(v)==len(pairs),'Unique responsive widths');return v

def schedule(live,local,role):
 live,local=path(live),path(local)
 require((LOCAL/local.lstrip('/')).is_file(),'Corresponding local asset exists '+local)
 if live in images:require(images[live]['local_url']==local,'Consistent observed asset pairing '+live)
 else:images[live]={'local_url':local,'roles':[]}
 if role not in images[live]['roles']:images[live]['roles'].append(role)

def pair(live,local,role,all_variants=True):
 require(live.get('src')==local.get('src'),'Image identity '+role)
 check({k:v for k,v in live.items() if k!='srcset'}=={k:v for k,v in local.items() if k!='srcset'},'Image non-srcset attributes '+role)
 if all_variants:schedule(live['src'],local['src'],role)
 av,lv=variants(live),variants(local);require(set(av)==set(lv),'Responsive width set '+role)
 changes={}
 for w,u in av.items():
  require(bool(re.fullmatch(r'/images/responsive/[0-9a-f]{16}-'+str(w)+r'\.webp',u)) and bool(re.fullmatch(r'/images/responsive/[0-9a-f]{16}-'+str(w)+r'\.webp',lv[w])),'Observed responsive filename pattern '+role)
  if all_variants or u!=lv[w]:schedule(u,lv[w],role)
  if u!=lv[w]:changes[lv[w]]=u
 return changes

def difference(kind,label,actual,expected,extra=None):
 if actual==expected:return
 report['differences'].append({'kind':kind,'label':label,'live_sha256':sha(actual),'local_sha256':sha(expected),'live_bytes':len(actual),'local_bytes':len(expected),**(extra or {})})

def fragment(s,kind):
 if kind=='article':found=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',s,re.S)
 elif kind=='card':found=re.findall(r'<section\b[^>]*class="[^"]*chakulia-reading[^"]*"[^>]*>.*?</section>',s,re.S)
 else:found=re.findall(r'<p\b[^>]*class="chakulia-credit"[^>]*>.*?</p>',s,re.S)
 require(len(found)==1,'Exactly one '+kind+' fragment');return found[0]

def compare_fragment(route,kind,actual,expected,subs):
 stem=route.strip('/').replace('/','--')+'--'+kind
 livefile=RUN/'fragments'/(stem+'-live.html');localfile=RUN/'fragments'/(stem+'-local.html');livefile.parent.mkdir(exist_ok=True)
 livefile.write_text(actual);localfile.write_text(expected)
 normalized=expected
 for local,live in subs.items():normalized=normalized.replace(local,live)
 row={'route':route,'kind':kind,'file':str(livefile.relative_to(ROOT)),'local_fragment_file':str(localfile.relative_to(ROOT)),'raw_exact':actual==expected,'exact_after_only_observed_responsive_urls':actual==normalized,'observed_responsive_urls':subs}
 report['fragments'].append(row)
 difference('fragment',route+' '+kind,actual.encode(),expected.encode(),row)
 check(actual==normalized,route+' '+kind+' agreement allowing only observed responsive URLs')
 check(plain(actual)==plain(expected),route+' '+kind+' exact visible text')
 check(Page(actual).links==Page(expected).links,route+' '+kind+' exact links')

def main(args):
 global RUN
 require(bool(re.fullmatch(r'[0-9a-f]{40}',args.expected_merge)),'Explicit full merge hash')
 deployment_path=Path(args.deployment_evidence).resolve();d=read(deployment_path)
 require(d.get('status')=='completed' and d.get('conclusion')=='success','Successful completed deployment evidence')
 require(str(d.get('id',d.get('databaseId',d.get('run'))))==str(args.deployment_run) and d.get('head_sha',d.get('headSha',d.get('head')))==args.expected_merge,'Deployment run and expected merge agree')
 c=read(OUT/'implementation/contract.json');local_report=read(OUT/'local-verification.json');cap=read(OUT/'capacity/proposal-q86.json')
 require(local_report.get('status')=='PASS','Local verifier already passed')
 require(sha((ROOT/c['manuscript']).read_bytes())==c['manuscript_sha256'],'Canonical manuscript exact')
 require(sha((LOCAL/c['base_image'].lstrip('/')).read_bytes())==c['base_sha256'],'Selected local photo exact')
 require(sha((LOCAL/RADHA.lstrip('/')).read_bytes())==cap['candidate']['sha256'],'Approved local Radha derivative exact')
 require(sha((ROOT/cap['source']['path']).read_bytes())==cap['source']['sha256'],'Radha source original preserved')
 RUN=OUT/'live'/('delivery-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ'));RUN.mkdir(parents=True,exist_ok=False)
 report.update(expected_merge=args.expected_merge,deployment_run=args.deployment_run,deployment_evidence=str(deployment_path),deployment_evidence_sha256=sha(deployment_path.read_bytes()),contract_sha256=sha((OUT/'implementation/contract.json').read_bytes()),local_verification_sha256=sha((OUT/'local-verification.json').read_bytes()),raw_directory=str(RUN.relative_to(ROOT)))
 for route in ROUTES:
  try:
   raw,http=fetch(route,RUN/'pages'/route.strip('/')/'index.html',20_000_000)
   html=raw.decode('utf-8');localfile=LOCAL/route.strip('/')/'index.html';expected_raw=localfile.read_bytes();expected=expected_raw.decode('utf-8');a,e=Page(html),Page(expected)
   report['routes'].append({**http,'route':route,'local_file':str(localfile.relative_to(ROOT)),'local_sha256':sha(expected_raw),'raw_exact':raw==expected_raw})
   difference('full_page',route,raw,expected_raw)
   check(a.meta==e.meta,route+' complete metadata agreement');check(len(a.ids)==len(set(a.ids)),route+' unique IDs')
   check(not any(u.startswith(('/kb/','/outputs/')) for u in a.links+[x.get('src','') for x in a.images]),route+' no internal asset links')
   substitutions={};require(len(a.images)==len(e.images),route+' image count')
   for i,(ai,ei) in enumerate(zip(a.images,e.images)):
    selected=ai.get('src') in [c['base_image'],RADHA]
    if selected or ai!=ei:substitutions.update(pair(ai,ei,route+' image '+str(i),selected))
   if route in [ARTICLE,CHAMPU]:
    af,ef=fragment(html,'article'),fragment(expected,'article');compare_fragment(route,'article',af,ef,substitutions)
    ap=Page(af)
    if route==ARTICLE:
     refs=[x for x in ap.anchors if 'data-footnote-ref' in x];backs=[x for x in ap.anchors if 'data-footnote-backref' in x]
     check(len(refs)==5 and len(backs)==5 and len(set(x['href'] for x in refs))==5,'Chakulia five references, notes and returns')
     check(all(x['href'][1:] in a.ids for x in refs+backs),'Chakulia reference targets resolve')
     check(re.findall(r'<a\b[^>]*data-footnote-ref\b[^>]*>(\d+)</a>',af)==['1','2','3','4','5'],'Chakulia sequential markers')
     check(COMMONS in ap.links and LICENCE in ap.links and 'under the same licence' in plain(af),'Chakulia full source and reuse credit')
     check(a.meta.get('description')==c['description'] and a.meta.get('og:image')==ORIGIN+c['base_image'] and a.meta.get('og:image:width')=='1200' and a.meta.get('og:image:height')=='943','Chakulia reviewed sharing metadata')
     check('noindex' in a.meta.get('robots',''),'Chakulia search hold')
     hero=next(x for x in ap.images if x.get('src')==c['base_image']);check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['1200','943','eager','high'],'Chakulia hero dimensions and priority')
     check(set(variants(hero))=={480,960,1200},'Chakulia actual three responsive widths')
    else:
     check('https://www.metmuseum.org/art/collection/search/662782' in ap.links and 'public domain.' in plain(af),'Radha museum source and public-domain statement')
     check('Full frame, resized and compressed for web delivery.' in plain(af),'Radha truthful delivery alteration')
     check(a.meta.get('og:image')==ORIGIN+RADHA and a.meta.get('og:image:width')=='2048' and a.meta.get('og:image:height')=='1341','Radha sharing source and geometry')
   else:
    check(a.links.count(ARTICLE)==1,route+' exactly one Chakulia invitation')
    for kind in ['card','credit']:compare_fragment(route,kind,fragment(html,kind),fragment(expected,kind),substitutions)
    credit=fragment(html,'credit');check(COMMONS in Page(credit).links and LICENCE in Page(credit).links and plain(credit)=='Aditya Mahar · CC BY-SA 4.0. Resized and compressed; same licence.',route+' complete preview credit')
   # Shell/analytics stay separate; no stripping affects the raw page difference.
   scripts=lambda s:[x for x in re.findall(r'<script\b[^>]*>.*?</script>',s,re.S) if re.search('analytics|gtag|googletagmanager|google-analytics',x,re.I)]
   report.setdefault('page_shell_observations',[]).append({'route':route,'full_page_exact':raw==expected_raw,'analytics_exact':scripts(html)==scripts(expected),'live_analytics':scripts(html),'local_analytics':scripts(expected),'observed_responsive_urls':substitutions})
  except Exception as exc:report['failures'].append(route+': '+repr(exc))
 require(c['base_image'] in images and RADHA in images,'Both directly affected base images scheduled')
 check(sum(any(role.startswith(ARTICLE) for role in row['roles']) for row in images.values())>=4,'At least four observed Chakulia assets retained')
 for i,(url,pairing) in enumerate(images.items()):
  try:
   body,http=fetch(url,RUN/'images'/(str(i)+Path(url).suffix),25_000_000);localfile=LOCAL/pairing['local_url'].lstrip('/');local=localfile.read_bytes()
   row={**http,**pairing,'local_file':str(localfile.relative_to(ROOT)),'local_bytes':len(local),'local_sha256':sha(local),'byte_match':body==local}
   report['images'].append(row);difference('image',url,body,local,{'file':row['file'],'local_file':row['local_file']})
   for u,b in [(url,body),(pairing['local_url'],local)]:
    if u.startswith('/images/responsive/'):check(Path(u).name.startswith(sha(b)[:16]+'-'),'Content-addressed image filename '+u)
  except Exception as exc:report['failures'].append(url+': '+repr(exc))
 pairs=[[str(ROOT/r['file']),str(ROOT/r['local_file'])] for r in report['images']]
 js="const sharp=require('sharp');Promise.all(JSON.parse(process.argv[1]).map(ps=>Promise.all(ps.map(async p=>{const m=await sharp(p).metadata();return {width:m.width,height:m.height,channels:m.channels,orientation:m.orientation??1,format:m.format}})))).then(x=>console.log(JSON.stringify(x)))"
 geometry=json.loads(subprocess.check_output([NODE,'-e',js,json.dumps(pairs)],cwd=SITE))
 for row,(live,local) in zip(report['images'],geometry):
  row.update(geometry=live,local_geometry=local);check(live==local,'Decoded geometry '+row['url'])
  if row['url']==c['base_image']:check([live['width'],live['height']]==[1200,943],'Actual Chakulia base geometry')
  if row['url']==RADHA:check([live['width'],live['height']]==[2048,1341],'Actual Radha base geometry')
 check(len(report['routes'])==5,'Five successful route captures')
 check(len(report['images'])==len(images),'All scheduled actual images captured')
 report['status']='FAIL' if report['failures'] else 'REVIEW_DIFFERENCES' if report['differences'] else 'PASS'
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--expected-merge',required=True);parser.add_argument('--deployment-run',required=True,type=int);parser.add_argument('--deployment-evidence',required=True);args=parser.parse_args()
 try:main(args)
 except Exception as exc:report['status']='FAIL';report['error']=repr(exc)
 finally:
  if RUN:
   with (RUN/'http.json').open('x') as f:json.dump(report,f,indent=2,ensure_ascii=False);f.write('\n')
  print(json.dumps({'status':report['status'],'routes':len(report['routes']),'images':len(report['images']),'differences':len(report['differences']),'failures':report['failures'],'error':report.get('error'),'raw_directory':str(RUN) if RUN else None}))
 raise SystemExit(1 if report['status']=='FAIL' else 0)
