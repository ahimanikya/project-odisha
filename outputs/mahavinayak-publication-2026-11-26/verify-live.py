"""Capture actual Mahavinayak HTTP delivery after a specified successful deployment.

No build, publish, browser action, source mutation or unchanged-file copy.
Each invocation retains raw pages/images and its report in a new timestamped folder.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.request import Request, urlopen
from urllib.parse import urlsplit
from datetime import datetime, timezone
import argparse, hashlib, json, re, subprocess

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
SITE=ROOT/'projects/site'
LOCAL=SITE/'dist-publish'
ORIGIN='https://projectodisha.org'
NODE='/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
ROUTE='/destinations/mahavinayak/'
ROUTES=[ROUTE,'/destinations/hills/','/destinations/','/explore/','/stories/sahi-jatra/']
sha=lambda b:hashlib.sha256(b).hexdigest()
report={'status':'RUNNING','routes':[],'images':[],'differences':[],'checks':[],
        'limitations':['Read-only HTTP evidence; browser interaction and separate visual delivery review remain required.',
                       'All raw differences retained. Observed image URL changes are reported separately; no HTML substitution or normalization is performed.',
                       'Image bytes and geometry are measured here; pixel differences and encoding causes are not inferred.']}
RUN=None

def read(path): return json.loads(path.read_text())
def check(ok,label):
    if not ok: raise AssertionError(label)
    report['checks'].append(label)
def plain(text): return ' '.join(unescape(re.sub('<[^>]+>',' ',text)).split())

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.links=[];self.images=[];self.meta={};self.feed(text)
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d:self.ids.append(d['id'])
        if tag=='a':self.links.append(d.get('href',''))
        if tag=='img':self.images.append(d)
        if tag=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')

def fragment(text):
    result=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S)
    check(len(result)==1,'Exactly one primary article fragment');return result[0]

def safe_path(url):
    parsed=urlsplit(url)
    check(not parsed.scheme and not parsed.netloc and parsed.path.startswith('/') and not parsed.query and not parsed.fragment and '..' not in parsed.path.split('/'),'Same-origin bounded asset path '+url)
    return parsed.path

def fetch(path,destination,limit):
    path=safe_path(path);url=ORIGIN+path
    with urlopen(Request(url,headers={'User-Agent':'Project-Odisha-delivery-verification/1.0','Accept-Encoding':'identity'}),timeout=45) as response:
        status=response.status; final=response.url; headers={k:v for k,v in response.headers.items() if k.lower() in ['content-type','content-length','etag','last-modified','cache-control','content-encoding']}
        body=response.read(limit+1)
    check(status==200,'HTTP 200 '+path);check(final==url,'No unexpected final URL '+path)
    check(len(body)<=limit,'Bounded response size '+path)
    destination.parent.mkdir(parents=True,exist_ok=True)
    with destination.open('xb') as handle:handle.write(body)
    return body,{'status':status,'final_url':final,'headers':headers}

def variants(image):
    matches=re.findall(r'([^ ,]+)\s+(\d+)w',image.get('srcset',''))
    result={int(w):safe_path(url) for url,w in matches}
    check(len(result)==len(matches),'Unique responsive widths')
    return result

def diff(kind,label,live,local,extra=None):
    if live==local:return
    row={'kind':kind,'label':label,'live_sha256':sha(live),'local_sha256':sha(local),'live_bytes':len(live),'local_bytes':len(local)}
    if extra:row.update(extra)
    report['differences'].append(row)

def compare_fragment(label,actual,expected,substitutions):
    # Report observed URL changes separately; never substitute or silently accept them.
    row={'label':label,'live_sha256':sha(actual.encode()),'local_sha256':sha(expected.encode()),'raw_exact':actual==expected,'observed_image_url_changes':substitutions}
    report.setdefault('fragments',[]).append(row)
    diff('article_or_card_fragment',label,actual.encode(),expected.encode(),{'observed_image_url_changes':substitutions})

def main(args):
    global RUN
    check(bool(re.fullmatch(r'[0-9a-f]{40}',args.expected_merge)),'Explicit full expected merge hash')
    check(args.deployment_run>0,'Explicit positive deployment run')
    deployment_path=Path(args.deployment_evidence).resolve();deployment=read(deployment_path)
    run=deployment.get('id',deployment.get('databaseId',deployment.get('run')))
    head=deployment.get('head_sha',deployment.get('headSha',deployment.get('head')))
    check(deployment.get('status')=='completed' and deployment.get('conclusion')=='success','Actual deployment completed successfully')
    check(str(run)==str(args.deployment_run) and head==args.expected_merge,'Deployment run and merge match explicit expected release')
    c=read(OUT/'reviewed-article-contract.json');local_report=read(OUT/'local-verification.json')
    check(local_report.get('status')=='PASS','Completed local artifact verification required')
    check(bool(c['source_hashes']) and all(sha((ROOT/p).read_bytes())==h for p,h in c['source_hashes'].items()),'Every current frozen source hash preserved')
    check(sha((ROOT/c['manuscript']).read_bytes())==c['manuscript_sha256'],'Exact reviewed manuscript')
    im=c['image'];cap=c['capacity']
    check(sha((LOCAL/im['src'].lstrip('/')).read_bytes())==im['public']['sha256'],'Local reviewed Mahavinayak photograph')
    check(sha((LOCAL/cap['path']).read_bytes())==cap['candidate']['sha256'],'Local reviewed Sahi q88 derivative')
    RUN=OUT/'live'/datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    RUN.mkdir(parents=True,exist_ok=False)
    report.update(source_hashes=c['source_hashes'],expected_merge=args.expected_merge,deployment_run=args.deployment_run,deployment_evidence=str(deployment_path),deployment_evidence_sha256=sha(deployment_path.read_bytes()),contract_sha256=sha((OUT/'reviewed-article-contract.json').read_bytes()),local_verification_sha256=sha((OUT/'local-verification.json').read_bytes()),raw_directory=str(RUN.relative_to(ROOT)))
    images={}
    def pair(live_image,local_image,label):
        check(live_image.get('src')==local_image.get('src') and live_image.get('alt')==local_image.get('alt'),label+': image identity and alt')
        src=safe_path(live_image['src']);images[src]=src
        av,lv=variants(live_image),variants(local_image)
        check(set(av)==set(lv),label+': same observed responsive widths')
        replacements={}
        for width,url in av.items():
            pattern=r'/images/responsive/[0-9a-f]{16}-'+str(width)+r'\.webp'
            check(bool(re.fullmatch(pattern,url)) and bool(re.fullmatch(pattern,lv[width])),label+': bounded observed responsive filename')
            if url in images:check(images[url]==lv[width],label+': consistent live/local variant pairing')
            images[url]=lv[width]
            if url!=lv[width]:replacements[lv[width]]=url
        return replacements
    for route in ROUTES:
        destination=RUN/'pages'/route.strip('/')/'index.html'
        raw,http=fetch(route,destination,20_000_000);html=raw.decode('utf-8');page=Page(html)
        local_path=LOCAL/route.strip('/')/'index.html';local_raw=local_path.read_bytes();local_html=local_raw.decode('utf-8');local_page=Page(local_html)
        report['routes'].append({'route':route,'file':str(destination.relative_to(ROOT)),'sha256':sha(raw),'local_sha256':sha(local_raw),**http})
        diff('full_page',route,raw,local_raw)
        check(len(page.ids)==len(set(page.ids)),route+': unique IDs')
        check(page.meta.get('robots')==local_page.meta.get('robots'),route+': reviewed crawler policy')
        if route in [ROUTE,'/stories/sahi-jatra/']:
            actual,expected=fragment(html),fragment(local_html);ap,ep=Page(actual),Page(expected);subs={}
            if route==ROUTE:
                check(sha(expected.encode())==local_report['editions']['dist-publish']['article_sha256'],'Local Mahavinayak fragment unchanged since verification')
                paragraphs=[plain(re.sub(r'<sup\b[^>]*>.*?</sup>','',x,flags=re.S)) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',actual,re.S)]
                for para in c['paragraphs']:check(plain(para) in paragraphs,'Actual exact reviewed paragraph '+para[:35])
                check('/contribute/?page=%2Fdestinations%2Fmahavinayak%2F' in ap.links,'Actual article-specific update link')
                refs=[x for x in ap.links if x.startswith('#user-content-fn-')];backs=[x for x in ap.links if x.startswith('#user-content-fnref-')]
                check(len(refs)==c['references'] and len(set(refs))==c['unique_notes'] and len(backs)==len(set(backs))==c['references'] and all(x[1:] in page.ids for x in refs+backs),'Actual reviewed references, notes and resolved returns')
                for value in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update',im['caption'],im['creator'],im['license'],im['changes']]:check(value in plain(actual),'Actual article '+value)
                for url in c['source_urls']+[im['source'],im['license_url']]:check(url in ap.links,'Actual source/credit link '+url)
                for route_link in c['reading_routes']:check(route_link in ap.links,'Actual reading route '+route_link)
                hero=next(x for x in ap.images if x.get('src')==im['src'])
                check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==[str(im['width']),str(im['height']),'eager','high'],'Actual full-frame eager hero geometry')
                check(set(variants(hero))=={x[0] for x in c['variant_dimensions']},'Actual selected photograph has three responsive widths')
                check(len(ap.images)==len(ep.images),'Article image count matches local')
                local_hero=next(x for x in ep.images if x.get('src')==im['src'])
                subs.update(pair(hero,local_hero,'Mahavinayak selected photograph'))
                for key in ['og:image','twitter:image']:check(page.meta.get(key)==ORIGIN+im['src'],'Actual Mahavinayak '+key)
                for dim in ['width','height']:check(page.meta.get('og:image:'+dim)==str(im[dim]),'Actual Mahavinayak sharing '+dim)
                check(page.meta.get('robots','').replace(' ','')=='noindex,follow','New article remains on search hold')
            else:
                check(plain(actual)==plain(expected),'Sahi article text, captions and credits match reviewed local artifact')
                asset='/'+cap['path']
                ai=[x for x in ap.images if x.get('src')==asset];li=[x for x in ep.images if x.get('src')==asset]
                check(len(ai)==len(li)==1,'One actual reviewed Sahi photograph')
                check(ai[0].get('width')==li[0].get('width') and ai[0].get('height')==li[0].get('height'),'Sahi HTML displayed image dimensions unchanged')
                check(ap.links==ep.links,'Sahi source, licence and reading links match local')
                # Capture only the affected Sahi base image; no unrelated page images.
                check(ai[0].get('src')==li[0].get('src') and ai[0].get('alt')==li[0].get('alt'),'Sahi image identity and alt unchanged')
                images[asset]=asset
                check(cap['source_url'] in ap.links and 'https://creativecommons.org/licenses/by-sa/4.0/' in ap.links,'Actual Sahi source and licence links')
                check('resized and compressed for web delivery without cropping.' in plain(actual),'Actual existing Sahi compression disclosure')
                for key in ['og:image','twitter:image']:check(page.meta.get(key)==ORIGIN+asset,'Actual Sahi '+key)
                check(page.meta.get('og:image:width')=='1590' and page.meta.get('og:image:height')=='2400','Actual orientation-aware Sahi sharing geometry')
            compare_fragment(route,actual,expected,subs)
        else:
            cards=lambda text:[x for x in re.findall(r'<article\b[^>]*>.*?</article>',text,re.S) if 'href="'+ROUTE+'"' in x]
            actual,expected=cards(html),cards(local_html);check(len(actual)==len(expected)==1,route+': one Mahavinayak card')
            check(plain(actual[0])==plain(expected[0]),route+': exact reviewed preview text')
            ap,ep=Page(actual[0]),Page(expected[0]);check(len(ap.images)==len(ep.images)==1,route+': one preview image')
            check(ap.images[0].get('src')==im['src'],route+': selected preview photograph')
            compare_fragment(route+' Mahavinayak card',actual[0],expected[0],pair(ap.images[0],ep.images[0],route+' preview'))
            credits=[x for x in re.findall(r'<li\b[^>]*>.*?</li>',html,re.S) if im['source'] in unescape(x)]
            check(bool(credits),route+': preview credit present')
            for value in [im['creator'],im['license_url'],im['changes']]:check(any(value in unescape(x) for x in credits),route+': preview credit '+value)
    required={im['src'],'/'+cap['path']}
    check(required.issubset(images),'Selected Mahavinayak and affected Sahi base photographs scheduled')
    check(len(images)==2+len(c['variant_dimensions']),'Only two base photographs and three selected variants scheduled')
    for index,(url,local_url) in enumerate(images.items()):
        local_url=safe_path(local_url);destination=RUN/'images'/(str(index)+Path(url).suffix)
        raw,http=fetch(url,destination,25_000_000);local_path=LOCAL/local_url.lstrip('/');local=local_path.read_bytes()
        if url.startswith('/images/responsive/'):check(Path(url).name.startswith(sha(raw)[:16]+'-'),'Actual live responsive content-address '+url)
        if local_url.startswith('/images/responsive/'):check(Path(local_url).name.startswith(sha(local)[:16]+'-'),'Local responsive content-address '+local_url)
        row={'url':url,'local_url':local_url,'file':str(destination.relative_to(ROOT)),'local_file':str(local_path.relative_to(ROOT)),'bytes':len(raw),'local_bytes':len(local),'sha256':sha(raw),'local_sha256':sha(local),'byte_match':raw==local,**http}
        report['images'].append(row);diff('image',url,raw,local,{'file':row['file'],'local_url':local_url})
    required={im['src'],'/'+cap['path']}
    check(required.issubset(images),'Selected Mahavinayak and affected Sahi base photographs fetched')
    check(len(images)==2+len(c['variant_dimensions']),'Exactly two base photographs and three selected responsive variants fetched')
    image_paths=[[str(ROOT/x['file']),str(ROOT/x['local_file'])] for x in report['images']]
    js="import sharp from 'sharp';const pairs=JSON.parse(process.argv[1]);console.log(JSON.stringify(await Promise.all(pairs.map(async pair=>Promise.all(pair.map(async p=>{const m=await sharp(p).metadata();return {width:m.width,height:m.height,orientation:m.orientation??1};}))))));"
    dimensions=json.loads(subprocess.check_output([NODE,'--input-type=module','-e',js,json.dumps(image_paths)],cwd=SITE))
    for row,(actual,expected) in zip(report['images'],dimensions):
        row['geometry']=actual;row['local_geometry']=expected;check(actual==expected,'Actual/local image geometry '+row['url'])
        if row['url']==im['src']:
            check(actual=={'width':im['width'],'height':im['height'],'orientation':1},'Actual reviewed hero dimensions')
        elif row['url']=='/'+cap['path']:
            check(actual=={key:cap['candidate'][key] for key in ['width','height','orientation']},'Actual reviewed Sahi stored dimensions and orientation')
        else:
            width=int(re.search(r'-(\d+)\.webp$',row['url']).group(1))
            expected_dimension=next(x for x in c['variant_dimensions'] if x[0]==width)
            check([actual['width'],actual['height']]==expected_dimension and actual['orientation']==1,'Actual reviewed responsive dimensions')
        check(sha((ROOT/row['file']).read_bytes())==row['sha256'] and sha((ROOT/row['local_file']).read_bytes())==row['local_sha256'],'Image evidence remains unchanged '+row['url'])
    check(len(report['routes'])==5 and {x['route'] for x in report['routes']}==set(ROUTES),'Five exact successful route captures')
    check(all(sha((ROOT/p).read_bytes())==h for p,h in c['source_hashes'].items()),'Frozen sources unchanged through live capture')
    check(sha((OUT/'reviewed-article-contract.json').read_bytes())==report['contract_sha256'],'Frozen contract unchanged through live capture')
    check(sha((OUT/'local-verification.json').read_bytes())==report['local_verification_sha256'],'Local verification unchanged through live capture')
    report['status']='REVIEW_DIFFERENCES' if report['differences'] else 'PASS'

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--expected-merge',required=True)
    parser.add_argument('--deployment-run',required=True,type=int)
    parser.add_argument('--deployment-evidence',required=True)
    args=parser.parse_args()
    try:main(args)
    except Exception as exc:report['status']='FAIL';report['error']=repr(exc);raise
    finally:
        text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
        if RUN is not None:
            with (RUN/'report.json').open('x') as handle:handle.write(text)
        (OUT/'live-verification.json').write_text(text)
        print(json.dumps({'status':report['status'],'routes':len(report['routes']),'images':len(report['images']),'differences':len(report['differences']),'raw_directory':report.get('raw_directory'),'error':report.get('error')}))
