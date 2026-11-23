"""Fetch five delivery routes; retain raw differences for independent review."""
from pathlib import Path
import urllib.request, json, re, hashlib, time, importlib.util, subprocess, shutil
from html import unescape

OUT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('kalinga_local_definitions',OUT/'verify-local.py')
common=importlib.util.module_from_spec(spec); spec.loader.exec_module(common)
ROOT=common.ROOT; SITE=common.SITE; ROUTE=common.ROUTE; ASHTA=common.ASHTA; JPEG=common.JPEG
parse=common.parse; article=common.article; plain=common.plain; widths=common.widths; sha=common.sha
ORIGIN='https://projectodisha.org'
ROUTES=[ROUTE,'/destinations/hills/','/destinations/','/explore/',ASHTA]
LIVE=OUT/'live'
report={'status':'RUNNING','checked_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),
        'routes':[],'images':[],'checks':[],'fragments':{},'responsive_url_substitutions':[],
        'limitations':['HTTP and decoded-geometry evidence only. Different encodings are not proof of visual equivalence; review retained images separately. No current traffic or source-fact verification.']}

def check(ok,label):
    if not ok: raise AssertionError(label)
    report['checks'].append(label)
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'ProjectOdisha-Release-Verification/1.0'}),timeout=60) as response:
        check(response.status==200,'HTTP200 '+url)
        return response.read(),dict(response.headers)
def card(text):
    cards=[c for c in re.findall(r'<article\b[^>]*>.*?</article>',text,re.S) if 'href="'+ROUTE+'"' in c]
    check(len(cards)==1,'Exactly one Kalinga incoming card'); return cards[0]

def main():
    LIVE.mkdir(exist_ok=True)
    im=json.loads((ROOT/'kb/research/destinations/kalinga-ghati-image.json').read_text())
    urls=set(); url_map={}; exact_fragments=[]
    for route in ROUTES:
        b,headers=fetch(ORIGIN+route); text=b.decode('utf-8'); name=route.strip('/').replace('/','-')
        (LIVE/(name+'.html')).write_bytes(b)
        local=(SITE/'dist-publish'/route.strip('/')/'index.html').read_text()
        p=parse(text)
        if route in [ROUTE,ASHTA]: fragment=article(text); lf=article(local)
        else: fragment=card(text); lf=card(local)
        liveimgs=parse(fragment).imgs; localimgs=parse(lf).imgs
        check(len(liveimgs)==len(localimgs),'Image count preserved '+route)
        observed=[]
        for liveimg,localimg in zip(liveimgs,localimgs):
            check(liveimg.get('src')==localimg.get('src'),'Base image order/URL preserved '+route)
            lv=widths(liveimg); lo=widths(localimg)
            check(lv.keys()==lo.keys(),'Responsive width identities preserved '+route)
            for width,url in lv.items():
                if url in url_map: check(url_map[url]==lo[width],'Consistent live/local variant mapping')
                url_map[url]=lo[width]
                if url!=lo[width]:
                    sub={'route':route,'base_src':liveimg.get('src'),'width':width,'local':lo[width],'live':url}
                    observed.append(sub); report['responsive_url_substitutions'].append(sub)
            if liveimg.get('src','').startswith('/'): urls.add(liveimg['src'])
            urls.update(lv.values())
        # Only replace URLs observed on corresponding images at identical widths.
        normalized=lf
        for sub in observed: normalized=normalized.replace(sub['local'],sub['live'])
        check(normalized==fragment,'Fragment exact after only observed responsive URL substitutions '+route)
        exact_fragments.append(fragment==lf)
        (LIVE/(name+'-fragment.html')).write_text(fragment)
        (LIVE/(name+'-local-fragment.html')).write_text(lf)
        (LIVE/(name+'-local-normalized-fragment.html')).write_text(normalized)
        report['fragments'][route]={'raw_exact':fragment==lf,'raw_local_sha256':sha(lf.encode()),'raw_live_sha256':sha(fragment.encode()),'normalized_exact':normalized==fragment,'substitutions':observed}
        if route==ROUTE:
            check(len(p.ids)==len(set(p.ids)),'Live unique IDs')
            check('By Ahimanikya Satapathy' in plain(fragment) and 'Footnotes & Sources' in plain(fragment),'Live Founder byline and visible notes')
            notes=[x for x in p.links if x.startswith('#user-content-fn')]
            check(len(notes)==10 and all(x[1:] in p.ids for x in notes),'Live five native citations/five returns resolve')
            references=[x for x in notes if x.startswith('#user-content-fn-')]
            returns=[x for x in notes if x.startswith('#user-content-fnref-')]
            check(len(references)==5 and len(set(references))==4 and len(returns)==5 and len(set(returns))==5,'Live five references to four notes and five distinct returns')
            figure=next(f for f in re.findall(r'<figure\b[^>]*>.*?</figure>',fragment,re.S) if im['src'] in f)
            caption=re.search(r'<figcaption\b[^>]*>(.*?)</figcaption>',figure,re.S).group(1)
            for value in [im['caption'],im['changes'],im['license'],*common.AUTHORS]: check(value in plain(caption),'Live visible credit '+value)
            for value in [im['source'],im['license_url']]: check(value in parse(caption).links,'Live linked source/licence '+value)
            check('Photograph by' not in caption,'Live credit does not infer photographer')
            hero=next(i for i in parse(figure).imgs if i.get('src')==im['src'])
            check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['1200','777','eager','high'],'Live native full-panel geometry/priority')
            check(hero.get('alt')==im['alt'] and set(widths(hero))=={480,960,1200},'Live alt and three responsive widths')
            for key in ['og:image','twitter:image']: check(p.meta.get(key)==ORIGIN+im['src'],'Live '+key)
        elif route==ASHTA:
            check(plain(fragment).count(common.DISCLOSURE)==1,'Live Ashta disclosed delivery transformation once')
            check('https://www.metmuseum.org/art/collection/search/37992' in parse(fragment).links,'Live Ashta museum source retained')
            for key in ['og:image','twitter:image']: check(p.meta.get(key)==ORIGIN+JPEG,'Live Ashta '+key)
            check([p.meta.get('og:image:width'),p.meta.get('og:image:height')]==['1488','2048'],'Live Ashta share dimensions')
            check(any(i.get('src')==JPEG for i in liveimgs),'Live Ashta same public image URL')
            urls.add(JPEG)
        else:
            check(any(i.get('src')==im['src'] for i in liveimgs),'Live incoming photograph '+route)
            check(not re.search(r'>Illustration</(?:p|figcaption)>',fragment),'Live Kalinga preview is not labelled illustration '+route)
            for value in [im['creator'],im['source'],im['license_url'],im['changes']]: check(value in unescape(text),'Live complete incoming photo credit '+route)
        report['routes'].append({'route':route,'status':200,'sha256':sha(b),'bytes':len(b),'saved':name+'.html','content_type':headers.get('Content-Type')})
    dimensions_paths=[]
    for url in sorted(urls):
        b,headers=fetch(ORIGIN+url)
        name=sha(url.encode())[:12]+'-'+Path(url).name
        saved=LIVE/name; saved.write_bytes(b)
        local_url=url_map.get(url,url); local=SITE/'dist-publish'/local_url.lstrip('/')
        check(local.is_file(),'Comparable local image exists '+local_url)
        local_hash=sha(local.read_bytes()); live_hash=sha(b)
        report['images'].append({'url':url,'local_url':local_url,'status':200,'bytes':len(b),'sha256':live_hash,'local_sha256':local_hash,'byte_equal':live_hash==local_hash,'saved':name,'content_type':headers.get('Content-Type')})
        dimensions_paths.extend([str(saved),str(local)])
    js="import sharp from 'sharp';const p=JSON.parse(process.argv[1]);console.log(JSON.stringify(await Promise.all(p.map(async x=>{const m=await sharp(x).metadata();return [m.width,m.height]}))));"
    dimensions=json.loads(subprocess.check_output([shutil.which('node') or '/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','--input-type=module','-e',js,json.dumps(dimensions_paths)],cwd=SITE))
    for index,item in enumerate(report['images']):
        item['live_dimensions']=dimensions[index*2]; item['local_dimensions']=dimensions[index*2+1]
        check(item['live_dimensions']==item['local_dimensions'],'Decoded geometry preserved '+item['url'])
    photo=next(x for x in report['images'] if x['url']==im['src'])
    check(photo['sha256']==im['web_derivative']['sha256'] and photo['live_dimensions']==[1200,777],'Reviewed committed Kalinga photo exact')
    ashta=next(x for x in report['images'] if x['url']==JPEG)
    check(ashta['live_dimensions']==[1488,2048],'Decoded live Ashta delivery geometry')
    report['ashta']={'source_original_sha256':common.ORIGINAL,'reviewed_local_candidate_sha256':common.CANDIDATE,'actual_live_sha256':ashta['sha256'],'actual_local_sha256':ashta['local_sha256'],'byte_equal':ashta['byte_equal'],'visual_review_required':not ashta['byte_equal']}
    report['fragment_exact']=all(exact_fragments)
    report['different_images']=[x['url'] for x in report['images'] if not x['byte_equal']]
    # Never erase raw differences after the narrowly scoped HTML normalization.
    report['status']='PASS' if report['fragment_exact'] and not report['different_images'] else 'REVIEW_DIFFERENCES'

if __name__=='__main__':
    try: main()
    except Exception as exc:
        report['status']='FAIL'; report['error']=repr(exc); raise
    finally:
        LIVE.mkdir(exist_ok=True)
        (LIVE/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'status':report['status'],'routes':len(report['routes']),'images':len(report['images']),'different_images':report.get('different_images'),'error':report.get('error')}))
