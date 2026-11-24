#!/usr/bin/env python3
"""After-deployment HTTP checks only. Preserves raw differences for separate review.
Run after verify-local.py has passed. No builds, image rewriting or automatic acceptance.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from datetime import datetime, timezone
import hashlib, json, re, subprocess, sys
OUT=Path(__file__).resolve().parent.parent
ROOT=OUT.parents[1]
SITE=ROOT/'projects/site';LOCAL=SITE/'dist-publish'
ORIGIN='https://projectodisha.org'
ROUTE='/stories/jhoti-chita/'
INCOMING=['/culture/osha/manabasa-gurubara/','/culture/osha/','/stories/craft-listening/']
TAPT='/destinations/taptapani/'
IMAGE='/assets/jhoti/gurubara-jhoti-1200.webp'
TAPT_IMAGE='/images/destinations/taptapani-worship.jpg'
PNGS=['/assets/nimuhi/user-supplied-memorial.png','/assets/cultural-book/author.png']
NODE='/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
sha=lambda b:hashlib.sha256(b).hexdigest()
def plain(s):return ' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=[];self.anchors=[];self.images=[];self.meta={};self.depth=0;self.nested=False;self.feed(s)
 def handle_starttag(self,t,a):
  d=dict(a)
  if 'id'in d:self.ids.append(d['id'])
  if t=='a':self.anchors.append(d);self.nested|=self.depth>0;self.depth+=1
  if t=='img':self.images.append(d)
  if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
 def handle_endtag(self,t):
  if t=='a':self.depth-=1
 @property
 def links(self):return [x.get('href','') for x in self.anchors]
class Capture(HTMLParser):
 """Capture a complete outer element, including nested article cards."""
 def __init__(self,s,tag,cls=None):
  super().__init__();self.s=s;self.tag=tag;self.cls=cls;self.start=None;self.end=None;self.depth=0
  self.offsets=[0]
  for m in re.finditer('\n',s):self.offsets.append(m.end())
  self.feed(s)
 def position(self):line,col=self.getpos();return self.offsets[line-1]+col
 def handle_starttag(self,t,a):
  if t!=self.tag or self.end is not None:return
  if self.start is None:
   if self.cls and self.cls not in dict(a).get('class','').split():return
   self.start=self.position();self.depth=1
  else:self.depth+=1
 def handle_endtag(self,t):
  if t==self.tag and self.start is not None and self.end is None:
   self.depth-=1
   if self.depth==0:self.end=self.s.find('>',self.position())+1
 def result(self):
  if self.start is None or self.end is None:raise ValueError('Missing complete '+self.tag+' '+str(self.cls))
  return self.s[self.start:self.end]
def fragment(s,route):
 if route=='/culture/osha/':return Capture(s,'main').result()
 cls={ROUTE:'article-reading',TAPT:'article-reading',INCOMING[0]:'osha-article',INCOMING[2]:'craft-listening-story'}[route]
 return Capture(s,'article',cls).result()
def variants(img):
 result={}
 for part in img.get('srcset','').split(','):
  parts=part.strip().split()
  if not parts:continue
  if len(parts)!=2 or not re.fullmatch(r'\d+w',parts[1]):raise ValueError('Unexpected responsive descriptor '+part)
  result[int(parts[1][:-1])]=parts[0]
 return result

def main():
 # No HTTP until local prerequisites are complete and explicitly reviewed.
 local_report=json.loads((OUT/'local-verification.json').read_text())
 if local_report.get('status')!='PASS':raise RuntimeError('Local verification must PASS before live verification')
 routes=[ROUTE,*INCOMING,TAPT]
 local={r:(LOCAL/r.strip('/')/'index.html').read_text() for r in routes}
 for r in routes:fragment(local[r],r)
 if Page(local[TAPT]).meta.get('og:image:width')!='1600':raise RuntimeError('Final local Taptapani delivery transform not ready')
 run=OUT/'live'/('verification-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'));run.mkdir(parents=True,exist_ok=False)
 report={'status':'RUNNING','routes':[],'images':[],'differences':[],'checks':[],'run_directory':str(run),'limitations':['HTTP delivery and image metadata checks only; browser checks are separate.','Raw page/image bytes and fragments are preserved. Only exact responsive URLs paired by observed base image and width may be substituted in memory.','Every byte difference remains review-required. No decoded-pixel or visual-equivalence claim.']}
 def check(ok,label):
  report['checks'].append({'check':label,'pass':bool(ok)})
  if not ok:report['differences'].append({'kind':'failed_check','check':label})
 def fetch(url,dest):
  dest.parent.mkdir(parents=True,exist_ok=True);row={'url':url,'file':str(dest.relative_to(ROOT))}
  if urlsplit(url).netloc!=urlsplit(ORIGIN).netloc:row['error']='Unexpected origin';return row,None
  try:
   with urlopen(Request(url,headers={'User-Agent':'ProjectOdisha-PublicationVerification/1.0','Cache-Control':'no-cache'}),timeout=45) as response:
    data=response.read();row.update(status=response.status,final_url=response.url,content_type=response.headers.get('Content-Type'))
  except HTTPError as e:data=e.read();row.update(status=e.code,error=str(e))
  except Exception as e:row['error']=repr(e);return row,None
  dest.write_bytes(data);row.update(bytes=len(data),sha256=sha(data));return row,data
 images={}
 def register(url,local_url,role,width=None,height=None):
  live_path=urlsplit(urljoin(ORIGIN,url)).path;local_path=urlsplit(urljoin(ORIGIN,local_url)).path
  entry=images.setdefault(live_path,{'local_url':local_path,'roles':[],'expected_dimensions':[]})
  check(entry['local_url']==local_path,'Unambiguous image mapping '+live_path)
  entry['roles'].append(role)
  if width and height:entry['expected_dimensions'].append([width,height])
 for route in routes:
  dest=run/'html'/route.strip('/')/'index.html';row,data=fetch(ORIGIN+route,dest);row['route']=route
  check(row.get('status')==200,'HTTP200 '+route)
  if row.get('status')!=200 or data is None:report['routes'].append(row);continue
  try:
   html=data.decode();p=Page(html);ep=Page(local[route]);actual=fragment(html,route);expected=fragment(local[route],route);ap=Page(actual);xp=Page(expected)
   check(len(p.ids)==len(set(p.ids)),route+' unique IDs');check(not ap.nested,route+' no nested anchors')
   check(p.meta.get('robots')==ep.meta.get('robots'),route+' exact reviewed robots policy')
   row['robots']=p.meta.get('robots')
   for key in ['og:title','og:description','og:image','og:image:width','og:image:height','twitter:image']:
    check(p.meta.get(key)==ep.meta.get(key),route+' reviewed '+key)
   if route==ROUTE:
    check(p.meta.get('robots','').replace(' ','')=='noindex,follow','Jhoti search hold')
    refs=[a for a in ap.anchors if 'data-footnote-ref'in a];backs=[a for a in ap.anchors if 'data-footnote-backref'in a];notes=[i for i in ap.ids if i.startswith('user-content-fn-')]
    check((len(refs),len(notes),len(backs))==(6,4,6),'Jhoti6references4notes6returns')
    check(all(a.get('href','').startswith('#') and a['href'][1:]in ap.ids for a in refs+backs),'Jhoti source/return targets resolve')
    check({a['href'][1:]for a in backs}=={a.get('id')for a in refs},'Jhoti every reference has return')
    for phrase in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update','Prateek Pattanaik','CC BY-SA 4.0','Full frame, resized and compressed from the official Commons preview.']:
     check(phrase in plain(actual),'Jhoti visible '+phrase)
    for value in ['https://commons.wikimedia.org/wiki/File:Gurubara_Jhoti.jpg','https://creativecommons.org/licenses/by-sa/4.0/']:check(value in ap.links,'Jhoti credited '+value)
    hero=[i for i in ap.images if i.get('src')==IMAGE];check(len(hero)==1,'Jhoti one hero')
    if hero:check([hero[0].get(k)for k in ['width','height','loading','fetchpriority']]==['1200','900','eager','high'] and bool(hero[0].get('alt')),'Jhoti hero dimensions/priority/alt')
    check(p.meta.get('og:image')==ORIGIN+IMAGE and p.meta.get('twitter:image')==ORIGIN+IMAGE,'Jhoti same article/sharing photo')
   elif route in INCOMING:
    card=Capture(actual,'article','jhoti-reading-card').result();cp=Page(card)
    check(cp.links.count(ROUTE)==1 and plain(card).startswith('Jhoti Chita'),route+' neutral incoming card')
    check(len([i for i in cp.images if i.get('src')==IMAGE])==1,route+' same incoming photo')
    check('jhoti-photo-reference'in ap.ids and 'jhoti-photo-source'in ap.ids and '#jhoti-photo-source'in ap.links and '#jhoti-photo-reference'in ap.links,route+' credit reference/return')
    credit=Capture(actual,'li','jhoti-source-note').result();credit_links=Page(credit).links
    for value in ['Prateek Pattanaik','CC BY-SA 4.0','Full frame, resized and compressed from the official Commons preview.']:check(value in plain(credit),route+' credit '+value)
    for value in ['https://commons.wikimedia.org/wiki/File:Gurubara_Jhoti.jpg','https://creativecommons.org/licenses/by-sa/4.0/']:check(value in credit_links,route+' licence/source '+value)
   else:
    for phrase in ['Ilya Mauter','CC BY 3.0','Full-frame photograph, resized and compressed for web delivery.']:check(phrase in plain(actual),'Taptapani credit '+phrase)
    for href in ['https://commons.wikimedia.org/wiki/File:Brahmana_performing_puja_Taptapani_Orissa.JPG','https://creativecommons.org/licenses/by/3.0/']:check(href in ap.links,'Taptapani source/licence '+href)
    check((p.meta.get('og:image:width'),p.meta.get('og:image:height'))==('1600','1200'),'Taptapani truthful1600x1200OG')
   # Pair actual images by source and position, then only their actual width-described variants.
   check(len(ap.images)==len(xp.images),route+' fragment image count')
   substitutions={}
   for ai,ei in zip(ap.images,xp.images):
    check(ai.get('src')==ei.get('src'),route+' image source identity '+str(ai.get('src')))
    av=variants(ai);ev=variants(ei);check(set(av)==set(ev),route+' responsive width parity '+str(ai.get('src')))
    for width,url in av.items():
     if width not in ev:continue
     if ev[width]!=url:
      check(ev[width]not in substitutions or substitutions[ev[width]]==url,route+' unambiguous responsive substitution')
      substitutions[ev[width]]=url
    src=ai.get('src')
    if src in [IMAGE,TAPT_IMAGE]:
     dims=(1200,900)if src==IMAGE else(1600,1200);register(src,ei['src'],route+':base',*dims)
     if src==IMAGE:check(set(av)=={480,960,1200},route+' three Jhoti responsive widths')
     for width,url in av.items():
      if width in ev:register(url,ev[width],route+':'+str(width),width,round(width*3/4))
   normalized=expected
   for old,new in substitutions.items():normalized=normalized.replace(old,new)
   check(normalized==actual,route+' exact fragment except observed responsive URLs')
   row.update(fragment={'local_sha256':sha(expected.encode()),'live_sha256':sha(actual.encode()),'raw_equal':expected==actual,'observed_responsive_substitutions':substitutions,'match_after_only_observed_substitutions':normalized==actual})
   (dest.parent/'local-fragment.html').write_text(expected);(dest.parent/'live-fragment.html').write_text(actual)
   if expected!=actual:report['differences'].append({'kind':'raw_fragment_difference','route':route,'substitutions':substitutions,'normalized_match':normalized==actual})
  except Exception as e:row['validation_error']=repr(e);report['differences'].append({'kind':'route_validation_error','route':route,'error':repr(e)})
  report['routes'].append(row)
 for url in PNGS:register(url,url,'bounded-lossless-delivery')
 for n,(url,info) in enumerate(images.items()):
  dest=run/'images'/(str(n).zfill(2)+'-'+Path(url).name);row,data=fetch(ORIGIN+url,dest);row.update(local_url=info['local_url'],roles=info['roles'],expected_dimensions=info['expected_dimensions'])
  check(row.get('status')==200,'Image HTTP200 '+url)
  local_file=LOCAL/info['local_url'].lstrip('/');row['local_file']=str(local_file.relative_to(ROOT))
  if local_file.is_file():
   lb=local_file.read_bytes();row.update(local_bytes=len(lb),local_sha256=sha(lb),byte_match=data==lb)
   if data!=lb:report['differences'].append({'kind':'image_byte_difference','url':url,'live_file':row['file'],'local_file':row['local_file'],'live_sha256':row.get('sha256'),'local_sha256':row['local_sha256']})
  else:check(False,'Local comparison file exists '+str(local_file))
  if data and '/images/responsive/'in url:check(Path(url).name.split('-')[0]==sha(data)[:16],'Actual responsive filename hash '+url)
  if data and row.get('status')==200 and local_file.is_file():
   try:
    js="const sharp=require('sharp');Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return {width:m.width,height:m.height,format:m.format,orientation:m.orientation??null}})).then(x=>console.log(JSON.stringify(x)))"
    lm,am=json.loads(subprocess.check_output([NODE,'-e',js,json.dumps([str(local_file),str(dest)])],cwd=SITE));row.update(local_metadata=lm,live_metadata=am)
    check((lm['width'],lm['height'])==(am['width'],am['height']),'Actual live/local image dimensions '+url)
    for dims in info['expected_dimensions']:check([am['width'],am['height']]==dims,'Observed width/full-frame geometry '+url)
   except Exception as e:row['metadata_error']=repr(e);check(False,'Readable image metadata '+url)
  report['images'].append(row)
 jhoti_images=[x for x in report['images']if any(role.startswith(ROUTE)for role in x['roles'])]
 check(len(jhoti_images)==4,'Four distinct actual Jhoti image files (base+three variants)')
 report['status']='REVIEW_DIFFERENCES'if report['differences']else'PASS'
 target=run/'http.json';target.write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps({'status':report['status'],'report':str(target),'routes':len(report['routes']),'images':len(report['images']),'differences':len(report['differences'])},indent=2))
 return 2 if report['differences']else 0
if __name__=='__main__':sys.exit(main())
