"""Capture actual Gupteswar HTTP delivery after a specified successful deployment.

No build, publish, browser action, source mutation or unchanged-file copy.
Each invocation retains raw pages/images and its report in a new timestamped folder.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit
from datetime import datetime, timezone
import argparse, hashlib, json, re, subprocess

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
SITE=ROOT/'projects/site'
LOCAL=SITE/'dist-publish'
ORIGIN='https://projectodisha.org'
NODE='/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
ROUTE='/destinations/gupteswar/'
ROUTES=[ROUTE,'/destinations/hills/','/destinations/','/explore/','/stories/jhulana-in-odisha/']
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
    request=Request(url,headers={'User-Agent':'Project-Odisha-delivery-verification/1.0','Accept-Encoding':'identity'})
    try: response=urlopen(request,timeout=45)
    except HTTPError as exc: response=exc
    with response:
        status=response.status; final=response.url; headers={k:v for k,v in response.headers.items() if k.lower() in ['content-type','content-length','etag','last-modified','cache-control','content-encoding']}
        body=response.read(limit+1)
    destination.parent.mkdir(parents=True,exist_ok=True)
    with destination.open('xb') as handle:handle.write(body)
    evidence={'requested_url':url,'status':status,'final_url':final,'headers':headers,'bytes':len(body),'sha256':sha(body),'response_limit':limit,'truncated':len(body)>limit}
    destination.with_suffix(destination.suffix+'.http.json').write_text(json.dumps(evidence,indent=2)+'\n')
    check(status==200,'HTTP 200 '+path);check(final==url,'No unexpected final URL '+path)
    check(len(body)<=limit,'Bounded response size '+path)
    return body,evidence

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

def classify_page_differences(route,actual,expected):
    # Compare every image attribute by position, retaining both values; do not rewrite HTML.
    ap,ep=Page(actual),Page(expected)
    for index in range(max(len(ap.images),len(ep.images))):
        a=ap.images[index] if index<len(ap.images) else None
        e=ep.images[index] if index<len(ep.images) else None
        if a==e:continue
        fields={key:{'live':(a or {}).get(key),'local':(e or {}).get(key)} for key in set(a or {})|set(e or {}) if (a or {}).get(key)!=(e or {}).get(key)}
        report.setdefault('image_attribute_differences',[]).append({'route':route,'position':index,'fields':fields,'classification':'observed image URL change' if fields and set(fields)<= {'src','srcset'} else 'image structure or non-URL attribute change; review required'})
    analytics=lambda text:[x for x in re.findall(r'<script\b[^>]*>.*?</script>',text,re.S) if re.search(r'analytics|googletagmanager|gtag|google-analytics',x,re.I)]
    a,e=analytics(actual),analytics(expected)
    report.setdefault('analytics',[]).append({'route':route,'raw_equal':a==e,'live_scripts':a,'local_scripts':e,'classification':'separate analytics observation; not removed from page comparison'})

def main(args):
    global RUN
    check(bool(re.fullmatch(r'[0-9a-f]{40}',args.expected_merge)),'Explicit full expected merge hash')
    check(args.deployment_run>0,'Explicit positive deployment run')
    deployment_path=Path(args.deployment_evidence).resolve();deployment=read(deployment_path)
    run=deployment.get('id',deployment.get('databaseId',deployment.get('run')))
    head=deployment.get('head_sha',deployment.get('headSha',deployment.get('head')))
    check(deployment.get('status')=='completed' and deployment.get('conclusion')=='success','Actual deployment completed successfully')
    check(str(run)==str(args.deployment_run) and head==args.expected_merge,'Deployment run and merge match explicit expected release')
    contract_path=Path(args.contract).resolve() if args.contract else OUT/'reviewed-article-contract.json'
    c=read(contract_path);local_report=read(OUT/'local-verification.json')
    if 'historical_local_contract' in c:
        historical=c['historical_local_contract'];check(sha((ROOT/historical['path']).read_bytes())==historical['sha256'],'Historical local contract preserved')
        report['local_artifact_scope']=historical['scope']
    check(local_report.get('status')=='PASS','Completed local artifact verification required')
    check(bool(c['source_hashes']) and all(sha((ROOT/p).read_bytes())==h for p,h in c['source_hashes'].items()),'Every current frozen source hash preserved')
    check(sha((ROOT/c['manuscript']).read_bytes())==c['manuscript_sha256'],'Exact reviewed manuscript')
    im=c['image'];cap=c['capacity']
    check(c['route']==ROUTE and [im['width'],im['height']]==[1200,798] and im['creator']=='Indopaedia' and im['license']=='CC BY-SA 4.0','Reviewed Gupteswar route and image package')
    check(c['references']==7 and c['unique_notes']==4,'Reviewed note and marker contract')
    check(cap['path']=='assets/jhulana-in-odisha/hindola-raga.jpg' and cap['candidate']['sha256']=='21974baef73a7c908fb165e222fd51a99c9fa41b6d53f9eede9a16c3460f5052','Reviewed Hindola q90 delivery candidate')
    check(sha((LOCAL/im['src'].lstrip('/')).read_bytes())==im['public']['sha256'],'Local reviewed Gupteswar photograph')
    check(sha((LOCAL/cap['path']).read_bytes())==cap['candidate']['sha256'],'Local reviewed Hindola q90 derivative')
    RUN=OUT/'live'/datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    RUN.mkdir(parents=True,exist_ok=False)
    report.update(source_hashes=c['source_hashes'],expected_merge=args.expected_merge,deployment_run=args.deployment_run,deployment_evidence=str(deployment_path),deployment_evidence_sha256=sha(deployment_path.read_bytes()),contract_sha256=sha(contract_path.read_bytes()),local_verification_sha256=sha((OUT/'local-verification.json').read_bytes()),raw_directory=str(RUN.relative_to(ROOT)))
    images={};local_image_scope={im['src'],'/'+cap['path']};capacity_variants={}
    def pair(live_image,local_image,label):
        check(live_image.get('src')==local_image.get('src') and live_image.get('alt')==local_image.get('alt'),label+': image identity and alt')
        src=safe_path(live_image['src']);images[src]=src
        av,lv=variants(live_image),variants(local_image)
        local_image_scope.update(lv.values())
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
        classify_page_differences(route,html,local_html)
        forbidden=['chakulia-panda','Chakulia Panda: Verse at the Doorstep','antaranga-after-devagiri-20261127','kaincha-and-golden-grass','golden-grass-square-box.jpg','Kaincha: Making with Golden Grass']
        check(not any(x in html for x in forbidden) and not any(x.startswith(('/kb/','/outputs/')) for x in page.links+[i.get('src','') for i in page.images]),route+': internal Kaincha/Chakulia preparation and repository asset paths absent')
        check(len(page.ids)==len(set(page.ids)),route+': unique IDs')
        check(page.meta.get('robots')==local_page.meta.get('robots'),route+': reviewed crawler policy')
        if route in [ROUTE,'/stories/jhulana-in-odisha/']:
            actual,expected=fragment(html),fragment(local_html);ap,ep=Page(actual),Page(expected);subs={}
            check(plain(actual)==plain(expected),route+': exact reviewed article text, headings, captions and credits')
            check(ap.links==ep.links,route+': exact reviewed source, note, credit and reading links')
            if route==ROUTE:
                check(sha(expected.encode())==local_report['editions']['dist-publish']['article_sha256'],'Local Gupteswar fragment unchanged since verification')
                paragraphs=[plain(re.sub(r'<sup\b[^>]*>.*?</sup>','',x,flags=re.S)) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',actual,re.S)]
                for para in c['paragraphs']:check(plain(para) in paragraphs,'Actual exact reviewed paragraph '+para[:35])
                check('/contribute/?page=%2Fdestinations%2Fgupteswar%2F' in ap.links,'Actual article-specific update link')
                refs=[x for x in ap.links if x.startswith('#user-content-fn-')];backs=[x for x in ap.links if x.startswith('#user-content-fnref-')]
                check(len(refs)==c['references'] and len(set(refs))==c['unique_notes'] and len(backs)==len(set(backs))==c['references'] and all(x[1:] in page.ids for x in refs+backs),'Actual reviewed references, notes and resolved returns')
                for value in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update',im['caption'],im['creator'],im['license'],im['changes']]:check(value in plain(actual),'Actual article '+value)
                for url in c['source_urls']+[im['source'],im['license_url']]:check(url in ap.links,'Actual source/credit link '+url)
                for route_link in c['reading_routes']:check(route_link in ap.links,'Actual reading route '+route_link)
                hero=next(x for x in ap.images if x.get('src')==im['src'])
                check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==[str(im['width']),str(im['height']),'eager','high'],'Actual full-frame eager hero geometry')
                check(set(variants(hero))=={x[0] for x in c['variant_dimensions']},'Actual selected photograph has reviewed responsive widths')
                check(len(ap.images)==len(ep.images),'Article image count matches local')
                local_hero=next(x for x in ep.images if x.get('src')==im['src'])
                subs.update(pair(hero,local_hero,'Gupteswar selected photograph'))
                for key in ['og:image','twitter:image']:check(page.meta.get(key)==ORIGIN+im['src'],'Actual Gupteswar '+key)
                for dim in ['width','height']:check(page.meta.get('og:image:'+dim)==str(im[dim]),'Actual Gupteswar sharing '+dim)
                check(page.meta.get('robots','').replace(' ','')=='noindex,follow','New article remains on search hold')
            else:
                check(plain(actual)==plain(expected),'Hindola article text, captions and credits match reviewed local artifact')
                asset='/'+cap['path']
                ai=[x for x in ap.images if x.get('src')==asset];li=[x for x in ep.images if x.get('src')==asset]
                check(len(ai)==len(li)==1,'One actual reviewed Hindola painting')
                check(ai[0].get('width')==li[0].get('width') and ai[0].get('height')==li[0].get('height'),'Hindola HTML displayed image dimensions unchanged')
                check(ap.links==ep.links,'Hindola source, licence and reading links match local')
                # Capture only this affected base image and its actual local responsive variants, if present.
                capacity_variants=variants(li[0])
                subs.update(pair(ai[0],li[0],'Hindola reviewed painting'))
                check(cap['source_url'] in ap.links and 'https://www.clevelandart.org/open-access' in ap.links and 'CC0' in plain(actual),'Actual Hindola source and licence links')
                check('Image released under CC0. Full frame, resized and compressed for web delivery.' in plain(actual),'Actual existing Hindola compression disclosure')
                for key in ['og:image','twitter:image']:check(page.meta.get(key)==ORIGIN+asset,'Actual Hindola '+key)
                check(page.meta.get('og:image:width')=='1517' and page.meta.get('og:image:height')=='2048','Actual Hindola sharing geometry')
            compare_fragment(route,actual,expected,subs)
        else:
            cards=lambda text:[x for x in re.findall(r'<article\b[^>]*>.*?</article>',text,re.S) if 'href="'+ROUTE+'"' in x]
            actual,expected=cards(html),cards(local_html);check(len(actual)==len(expected)==1,route+': one Gupteswar card')
            check(plain(actual[0])==plain(expected[0]),route+': exact reviewed preview text')
            card_paragraphs=[plain(x) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',actual[0],re.S)]
            check(card_paragraphs.count(c['preview_summary'])==1 and c['preview_title'] in plain(actual[0]),route+': exact Gupteswar summary paragraph')
            ap,ep=Page(actual[0]),Page(expected[0]);check(len(ap.images)==len(ep.images)==1,route+': one preview image')
            check(ap.images[0].get('src')==im['src'],route+': selected preview photograph')
            compare_fragment(route+' Gupteswar card',actual[0],expected[0],pair(ap.images[0],ep.images[0],route+' preview'))
            credits=[x for x in re.findall(r'<li\b[^>]*>.*?</li>',html,re.S) if im['source'] in unescape(x)]
            check(bool(credits),route+': preview credit present')
            for value in [im['caption'],im['creator'],im['license'],im['license_url'],im['changes']]:check(any(value in unescape(x) for x in credits),route+': preview credit '+value)
            local_credits=[x for x in re.findall(r'<li\b[^>]*>.*?</li>',local_html,re.S) if im['source'] in unescape(x)]
            check([plain(x) for x in credits]==[plain(x) for x in local_credits],route+': exact reviewed preview credit text')
    required={im['src'],'/'+cap['path']}
    check(required.issubset(images),'Selected Gupteswar and affected Hindola base images scheduled')
    check(len(images)==2+len(c['variant_dimensions'])+len(capacity_variants) and set(images.values())==local_image_scope,'Only reviewed Gupteswar package and affected Hindola files scheduled')
    for index,(url,local_url) in enumerate(images.items()):
        local_url=safe_path(local_url);destination=RUN/'images'/(str(index)+Path(url).suffix)
        raw,http=fetch(url,destination,25_000_000);local_path=LOCAL/local_url.lstrip('/');local=local_path.read_bytes()
        if url.startswith('/images/responsive/'):check(Path(url).name.startswith(sha(raw)[:16]+'-'),'Actual live responsive content-address '+url)
        if local_url.startswith('/images/responsive/'):check(Path(local_url).name.startswith(sha(local)[:16]+'-'),'Local responsive content-address '+local_url)
        row={'url':url,'local_url':local_url,'file':str(destination.relative_to(ROOT)),'local_file':str(local_path.relative_to(ROOT)),'bytes':len(raw),'local_bytes':len(local),'sha256':sha(raw),'local_sha256':sha(local),'byte_match':raw==local,**http}
        row['classification']='exact reviewed local bytes' if raw==local else 'different bytes; geometry comparison and separate visual review required; encoding cause unproven'
        report['images'].append(row);diff('image',url,raw,local,{'file':row['file'],'local_url':local_url})
    required={im['src'],'/'+cap['path']}
    check(required.issubset(images),'Selected Gupteswar and affected Hindola base images fetched')
    check(len(images)==len(local_image_scope),'Exactly the reviewed image scope fetched')
    image_paths=[[str(ROOT/x['file']),str(ROOT/x['local_file'])] for x in report['images']]
    js="import sharp from 'sharp';const pairs=JSON.parse(process.argv[1]);console.log(JSON.stringify(await Promise.all(pairs.map(async pair=>Promise.all(pair.map(async p=>{const m=await sharp(p).metadata();return {width:m.width,height:m.height,orientation:m.orientation??1};}))))));"
    dimensions=json.loads(subprocess.check_output([NODE,'--input-type=module','-e',js,json.dumps(image_paths)],cwd=SITE))
    for row,(actual,expected) in zip(report['images'],dimensions):
        row['geometry']=actual;row['local_geometry']=expected;check(actual==expected,'Actual/local image geometry '+row['url'])
        if row['url']==im['src']:
            check(actual=={'width':im['width'],'height':im['height'],'orientation':1},'Actual reviewed hero dimensions')
        elif row['url']=='/'+cap['path']:
            check(actual=={key:cap['candidate'][key] for key in ['width','height','orientation']},'Actual reviewed Hindola stored dimensions and orientation')
        else:
            width=int(re.search(r'-(\d+)\.webp$',row['url']).group(1))
            if row['local_url'] in capacity_variants.values():
                check(actual['width']==width and actual==expected,'Actual reviewed Hindola responsive geometry')
            else:
                expected_dimension=next(x for x in c['variant_dimensions'] if x[0]==width)
                check([actual['width'],actual['height']]==expected_dimension and actual['orientation']==1,'Actual reviewed Gupteswar responsive dimensions')
        check(sha((ROOT/row['file']).read_bytes())==row['sha256'] and sha((ROOT/row['local_file']).read_bytes())==row['local_sha256'],'Image evidence remains unchanged '+row['url'])
    check(len(report['routes'])==5 and {x['route'] for x in report['routes']}==set(ROUTES),'Five exact successful route captures')
    check(all(sha((ROOT/p).read_bytes())==h for p,h in c['source_hashes'].items()),'Frozen sources unchanged through live capture')
    check(sha(contract_path.read_bytes())==report['contract_sha256'],'Frozen contract unchanged through live capture')
    check(sha((OUT/'local-verification.json').read_bytes())==report['local_verification_sha256'],'Local verification unchanged through live capture')
    report['status']='REVIEW_DIFFERENCES' if report['differences'] else 'PASS'

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--contract',help='Explicit reviewed combined source contract; historical local artifact remains separately identified')
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
