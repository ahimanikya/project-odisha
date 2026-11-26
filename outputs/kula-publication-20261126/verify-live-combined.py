#!/usr/bin/env python3
"""Read-only HTTP delivery check. Run only after deployment and local verification PASS.
Raw captures are immutable per timestamped run. No build, publish, copy or image rewrite.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from datetime import datetime, timezone
import argparse, hashlib, json, re, subprocess, sys, time
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
SITE=ROOT/'projects/site'; LOCAL=SITE/'dist-publish'
ORIGIN='https://projectodisha.org'
ARTICLE='/stories/kula-and-the-work-of-winnowing/'
INCOMING=['/stories/dhinki-and-the-work-behind-rice/','/stories/binchana-and-the-handmade-breeze/','/stories/craft-listening/']
ROUTES=[ARTICLE,*INCOMING]
IMAGE='/images/stories/kula-trays.webp'
COMMONS='https://commons.wikimedia.org/wiki/File:Winnowing_Fan1.jpg'
LICENCE='https://creativecommons.org/licenses/by-sa/3.0/'
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
 def links(self):return [a.get('href','') for a in self.anchors]
class Capture(HTMLParser):
 def __init__(self,s,tag,cls=None,attr=None):
  super().__init__();self.s=s;self.tag=tag;self.cls=cls;self.attr=attr;self.start=None;self.end=None;self.depth=0;self.offsets=[0]
  self.offsets.extend(m.end()for m in re.finditer('\n',s));self.feed(s)
 def pos(self):line,col=self.getpos();return self.offsets[line-1]+col
 def handle_starttag(self,t,a):
  if t!=self.tag or self.end is not None:return
  if self.start is None:
   d=dict(a)
   if self.cls and self.cls not in d.get('class','').split():return
   if self.attr and d.get(self.attr[0])!=self.attr[1]:return
   self.start=self.pos();self.depth=1
  else:self.depth+=1
 def handle_endtag(self,t):
  if t==self.tag and self.start is not None and self.end is None:
   self.depth-=1
   if self.depth==0:self.end=self.s.find('>',self.pos())+1
 def result(self):
  if self.start is None or self.end is None:raise ValueError('Missing balanced '+self.tag+' '+str(self.cls or self.attr))
  return self.s[self.start:self.end]
def fragment(s,route):
 return Capture(s,'article','craft-listening-story'if route==INCOMING[2]else'article-reading').result()
def variants(img):
 values={}
 for item in img.get('srcset','').split(','):
  bits=item.strip().split()
  if not bits:continue
  if len(bits)!=2 or not re.fullmatch(r'\d+w',bits[1]):raise ValueError('Unsupported responsive descriptor '+item)
  width=int(bits[1][:-1])
  if width in values:raise ValueError('Duplicate responsive width')
  values[width]=bits[0]
 return values
def responsive_path(url):return bool(re.fullmatch(r'/images/responsive/[a-f0-9]{16}-\d+\.webp',urlsplit(url).path))
def replace_observed_attributes(s,mapping):
 # Substitution is confined to src/srcset attributes. Text, scripts, classes, metadata,
 # paths, all other attributes and raw captures are never normalized.
 def change(m):
  value=m.group(2)
  for old,new in mapping.items():value=re.sub(r'(?<![^\s,])'+re.escape(old)+r'(?=\s|,|$)',lambda _:new,value)
  return m.group(1)+value+m.group(3)
 return re.sub(r'(\b(?:src|srcset)=")([^"]*)(")',change,s)
class SameOriginRedirect(HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  if urlsplit(newurl).netloc!=urlsplit(ORIGIN).netloc:raise ValueError('Cross-origin redirect refused: '+newurl)
  return super().redirect_request(req,fp,code,msg,headers,newurl)

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--deployment-ready',action='store_true',help='Coordinator confirms deployment has completed');args=parser.parse_args()
 if not args.deployment_ready:parser.error('No network performed: --deployment-ready is required after deployment')
 if json.loads((OUT/'local-verification-combined.json').read_text()).get('status')!='PASS':raise RuntimeError('Local final-package verification must PASS before HTTP')
 local={r:(LOCAL/r.strip('/')/'index.html').read_bytes()for r in ROUTES}
 for r,b in local.items():fragment(b.decode(),r)
 run=OUT/'live'/('delivery-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ'));run.mkdir(parents=True,exist_ok=False)
 report={'status':'RUNNING','routes':[],'images':[],'differences':[],'checks':[],'local_report_sha256':sha((OUT/'local-verification-combined.json').read_bytes()),'limitations':['HTTP, markup and image geometry checks only. Browser and decoded-pixel/visual review are separate.','Raw bytes and failures retained. All byte differences remain review-required, including responsive substitutions.','Only observed same-base, same-width responsive src/srcset URLs may be substituted in memory; no platform cause inferred.']}
 def save(): (run/'http.json').write_text(json.dumps(report,indent=2)+'\n')
 def check(ok,label):
  report['checks'].append({'check':label,'pass':bool(ok)})
  if not ok:report['differences'].append({'kind':'failed_check','check':label})
 def fetch(url,dest):
  row={'url':url,'file':str(dest.relative_to(ROOT)),'attempts':[]};dest.parent.mkdir(parents=True,exist_ok=True)
  if urlsplit(url).scheme!='https'or urlsplit(url).netloc!=urlsplit(ORIGIN).netloc:raise ValueError('Unexpected origin '+url)
  for attempt in [1,2]:
   data=None;record={'attempt':attempt}
   try:
    with build_opener(SameOriginRedirect()).open(Request(url,headers={'User-Agent':'ProjectOdisha-PublicationVerification/1.0','Cache-Control':'no-cache'}),timeout=30)as response:
     data=response.read();record.update(status=response.status,final_url=response.url,content_type=response.headers.get('Content-Type'),headers=dict(response.headers))
   except HTTPError as e:data=e.read();record.update(status=e.code,error=str(e),headers=dict(e.headers))
   except Exception as e:record['error']=repr(e)
   if data is not None:
    capture=dest.with_name(dest.name+'.attempt'+str(attempt));capture.write_bytes(data);record.update(bytes=len(data),sha256=sha(data),capture=str(capture.relative_to(ROOT)))
   row['attempts'].append(record)
   if record.get('status')==200:
    row.update(record);row['file']=record['capture'];return row,data
   # Retry only bounded transient HTTP/network failures; keep each failed response.
   if attempt==1 and record.get('status')in [None,408,429,500,502,503,504]:time.sleep(1);continue
   break
  row.update(row['attempts'][-1]);return row,data
 images={}
 def register(live_url,local_url,role,family=None):
  absolute=urljoin(ORIGIN,live_url);la=urlsplit(absolute);lo=urlsplit(urljoin(ORIGIN,local_url))
  if la.netloc!=urlsplit(ORIGIN).netloc or lo.netloc!=la.netloc:raise ValueError('Nonlocal image mapping')
  entry=images.setdefault(la.path,{'local_url':lo.path,'roles':[],'families':[]})
  check(entry['local_url']==lo.path,'Unambiguous observed image mapping '+la.path);entry['roles'].append(role)
  if family and family not in entry['families']:entry['families'].append(family)
 try:
  for route in ROUTES:
   row,data=fetch(ORIGIN+route,run/'html'/route.strip('/')/'index.html');row['route']=route;row['local_page_sha256']=sha(local[route]);check(row.get('status')==200,'HTTP200 '+route)
   if row.get('status')!=200 or data is None:report['routes'].append(row);save();continue
   row['page_bytes_equal']=data==local[route]
   if data!=local[route]:report['differences'].append({'kind':'raw_page_byte_difference','route':route,'local_sha256':sha(local[route]),'live_sha256':sha(data)})
   try:
    html=data.decode();expected=fragment(local[route].decode(),route);actual=fragment(html,route);p=Page(html);ep=Page(local[route].decode());ap=Page(actual);xp=Page(expected)
    check(len(p.ids)==len(set(p.ids)),route+' unique IDs');check(not ap.nested,route+' no nested anchors')
    for key in ['robots','description','og:title','og:description','og:image','og:image:alt','og:image:width','og:image:height','twitter:image']:check(p.meta.get(key)==ep.meta.get(key),route+' reviewed '+key)
    if route==ARTICLE:
     refs=[a for a in ap.anchors if 'data-footnote-ref'in a];backs=[a for a in ap.anchors if 'data-footnote-backref'in a];notes=[i for i in ap.ids if re.fullmatch(r'user-content-fn-\d+',i)]
     check((len(refs),len(notes),len(backs))==(7,4,7),'Kula7refs4notes7returns');check(all(a.get('href','')[1:]in ap.ids for a in refs+backs),'Kula note/return targets');check({a['href'][1:]for a in backs}=={a['id']for a in refs},'Kula every reference has return')
     for phrase in ['By Ahimanikya Satapathy','Debiprasad Sahoo','CC BY-SA 3.0','Footnotes & Sources','Further reading','Suggest an update','GitHub submissions are public; omit private contact details and consent documents.']:check(phrase in plain(actual),'Kula visible '+phrase)
     check(len(re.findall(r'<h1\b',actual))==1,'Kula one h1');check(len(re.findall(r'<h2\b[^>]*>Further reading</h2>',actual))==1,'Kula one reading section')
     hero=[i for i in ap.images if i.get('src')==IMAGE];check(len(hero)==1,'Kula one hero')
     if hero:check([hero[0].get(k)for k in ['width','height','loading','fetchpriority']]==['1200','1201','eager','high']and bool(hero[0].get('alt')),'Kula hero dimensions/priority/alt')
     check(p.meta.get('og:image')==ORIGIN+IMAGE and p.meta.get('twitter:image')==ORIGIN+IMAGE,'Kula same photograph for sharing')
     check((p.meta.get('og:image:width'),p.meta.get('og:image:height'))==('1200','1201'),'Kula sharing dimensions')
    for href in [COMMONS,LICENCE]:check(href in ap.links,route+' photograph source/licence '+href)
    if route in INCOMING:
     check(ap.links.count(ARTICLE)==1,route+' exactly one incoming link');card=Capture(actual,'a',attr=('href',ARTICLE)).result();cp=Page(card)
     check('Kula'in plain(card),route+' neutral label');check(len([i for i in cp.images if i.get('src')==IMAGE])==1,route+' same full-frame photograph')
     credit=Capture(actual,'p','kula-reading-credit').result();ec=Capture(expected,'p','kula-reading-credit').result()
     for text in ['Debiprasad Sahoo','Winnowing Fan1','CC BY-SA 3.0','resized and compressed, same licence.']:check(text in plain(credit),route+' reading credit '+text)
     row['incoming_credit_exact']=credit==ec;check(credit==ec,route+' exact reading photograph credit')
     row['incoming_card']={'local_sha256':sha(Capture(expected,'a',attr=('href',ARTICLE)).result().encode()),'live_sha256':sha(card.encode())}
    substitutions={};check(len(ap.images)==len(xp.images),route+' fragment image count')
    for ai,ei in zip(ap.images,xp.images):
     same=ai.get('src')==ei.get('src');check(same,route+' base image identity '+str(ai.get('src')))
     av=variants(ai);ev=variants(ei);check(set(av)==set(ev),route+' responsive widths '+str(ai.get('src')))
     for width,url in av.items():
      if not same or width not in ev:continue
      if url!=ev[width]:
       allowed=responsive_path(url)and responsive_path(ev[width]);check(allowed,route+' allowed responsive substitution')
       if allowed:
        check(ev[width]not in substitutions or substitutions[ev[width]]==url,route+' unambiguous substitution');substitutions[ev[width]]=url
        register(url,ev[width],route+':observed-changed-responsive:'+str(width))
     if same and ai.get('src')==IMAGE:
      family='kula'
      register(ai['src'],ei['src'],route+':base',family)
      expected_widths={480,960,1200};check(set(av)==expected_widths,route+' exact reviewed responsive sizes')
      for width,url in av.items():
       if width in ev:register(url,ev[width],route+':'+str(width),family)
    normalized=replace_observed_attributes(expected,substitutions);check(normalized==actual,route+' fragment exact except observed responsive URL attributes')
    row['fragment']={'local_sha256':sha(expected.encode()),'live_sha256':sha(actual.encode()),'raw_equal':expected==actual,'observed_substitutions':substitutions,'match_after_only_observed_substitutions':normalized==actual}
    dest=run/'fragments'/route.strip('/');dest.mkdir(parents=True,exist_ok=True);(dest/'local.html').write_text(expected);(dest/'live.html').write_text(actual)
    if expected!=actual:report['differences'].append({'kind':'raw_fragment_difference','route':route,**row['fragment']})
    # Outer shell is compared separately without removing analytics or other markup.
    local_shell=local[route].decode().replace(expected,'<!-- compared article -->',1);live_shell=html.replace(actual,'<!-- compared article -->',1)
    row['outer_shell']={'equal':local_shell==live_shell,'local_sha256':sha(local_shell.encode()),'live_sha256':sha(live_shell.encode()),'local_analytics_ids':[i for i in ep.ids if i.startswith('analytics-')],'live_analytics_ids':[i for i in p.ids if i.startswith('analytics-')]}
    (dest/'local-shell.html').write_text(local_shell);(dest/'live-shell.html').write_text(live_shell)
    if local_shell!=live_shell:report['differences'].append({'kind':'outer_shell_difference','route':route,**row['outer_shell']})
    if route in INCOMING:
     (dest/'local-card.html').write_text(Capture(expected,'a',attr=('href',ARTICLE)).result());(dest/'live-card.html').write_text(card)
     (dest/'local-credit.html').write_text(ec);(dest/'live-credit.html').write_text(credit)
     check(replace_observed_attributes(Capture(expected,'a',attr=('href',ARTICLE)).result(),substitutions)==card,route+' incoming card exact except observed responsive URLs')

   except Exception as e:row['validation_error']=repr(e);report['differences'].append({'kind':'route_validation_error','route':route,'error':repr(e)})
   report['routes'].append(row);save()
  for n,(url,info)in enumerate(images.items()):
   row,data=fetch(ORIGIN+url,run/'media'/(str(n).zfill(2)+'-'+Path(url).name));row.update(info);check(row.get('status')==200,'Image HTTP200 '+url)
   local_file=LOCAL/info['local_url'].lstrip('/');row['local_file']=str(local_file.relative_to(ROOT));check(local_file.is_file(),'Local compared image exists '+info['local_url'])
   if local_file.is_file():
    lb=local_file.read_bytes();row.update(local_bytes=len(lb),local_sha256=sha(lb),byte_match=data==lb)
    if data!=lb:report['differences'].append({'kind':'image_byte_difference','url':url,'live_file':row['file'],'local_file':row['local_file'],'live_sha256':row.get('sha256'),'local_sha256':sha(lb)})
   if data and row.get('status')==200:
    if responsive_path(url):check(Path(url).name.split('-')[0]==sha(data)[:16],'Live responsive filename matches bytes '+url)
    try:
     js="const sharp=require('sharp');Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return {width:m.width,height:m.height,format:m.format,orientation:m.orientation??null}})).then(v=>console.log(JSON.stringify(v)))"
     lm,am=json.loads(subprocess.check_output([NODE,'-e',js,json.dumps([str(local_file),str(ROOT/row['file'])])],cwd=SITE));row.update(local_metadata=lm,live_metadata=am);check((lm['width'],lm['height'])==(am['width'],am['height']),'Exact live/local dimensions '+url)
     if url==IMAGE:check([am['width'],am['height']]==[1200,1201],'Kula base geometry')
    except Exception as e:row['metadata_error']=repr(e);check(False,'Readable live image '+url)
   report['images'].append(row);save()
  check(len([r for r in report['images']if 'kula'in r['families']])>=4,'At least four distinct Kula files: base plus three observed variants')
  report['status']='REVIEW_REQUIRED'if report['differences']else'PASS'
 except Exception as e:report['status']='FAIL';report['fatal_error']=repr(e);raise
 finally:save()
 print(json.dumps({'status':report['status'],'report':str(run/'http.json'),'routes':len(report['routes']),'images':len(report['images']),'differences':len(report['differences'])},indent=2))
 return 0 if report['status']=='PASS'else 2
if __name__=='__main__':sys.exit(main())
