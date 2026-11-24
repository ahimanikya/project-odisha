#!/usr/bin/env python3
"""Run only after deployment. Fetch five public pages and their observed relevant images.
Preserves raw responses in a new live/delivery-TIMESTAMP directory. Any mismatch
requires review; this tool never accepts encoding or pixel differences automatically.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from datetime import datetime, timezone
import hashlib, json, re, sys
ROOT=Path(__file__).resolve().parents[2]
PACKAGE=ROOT/'projects/site/dist-publish'
BASE='https://projectodisha.org'
ARTICLE='/literature/birakishore-das/'
INCOMING=['/literature/','/stories/odia-literature-preservation/','/stories/odia-bibhaba-visit/']
CHAMPU='/literature/champu-and-sakhi/'
ROUTES=[ARTICLE,*INCOMING,CHAMPU]
PHOTO='/images/literature/birakishore-das/reading-table.webp'
PREVIEW='/images/literature/birakishore-das/reading-table-480.webp'
PAINTING='/assets/champu-and-sakhi/radha-confidante-met.jpg'
def digest(data):return hashlib.sha256(data).hexdigest()
class Tags(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.tags=[];self.depth=0;self.nested=False;self.feed(text)
    def handle_starttag(self,tag,attrs):
        self.tags.append((tag,dict(attrs)))
        if tag=='a':self.nested|=self.depth>0;self.depth+=1
    def handle_endtag(self,tag):
        if tag=='a':self.depth-=1
    def select(self,tag,key=None,value=None):return [a for t,a in self.tags if t==tag and (key is None or key in a and (value is None or a[key]==value))]
def fragment(text,route):
    # The literature hub contains many sibling card articles, so compare its complete main.
    tag='main' if route=='/literature/' else 'article'
    values=re.findall(r'<'+tag+r'\b[\s\S]*?</'+tag+'>',text)
    if len(values)!=1:raise ValueError('Expected one '+tag+' for '+route)
    return values[0]
def metadata(doc):
    keys=['og:title','og:description','og:image','og:image:width','og:image:height']
    return {k:[a.get('content') for a in doc.select('meta','property',k)] for k in keys}
def checks(text,route):
    body=fragment(text,route);d=Tags(body);result={'no_nested_anchors':not d.nested}
    if route==ARTICLE:
        refs=d.select('a','data-footnote-ref');backs=d.select('a','data-footnote-backref')
        notes=[a for a in d.select('li','id') if a['id'].startswith('user-content-fn-')]
        ids=[a['id'] for _,a in d.tags if 'id' in a]
        result.update({'one_h1':len(d.select('h1'))==1,'one_byline':body.count('By Ahimanikya Satapathy')==1,'native_6_4_6':(len(refs),len(notes),len(backs))==(6,4,6),'unique_ids':len(ids)==len(set(ids)),'all_returns':{a.get('href','')[1:] for a in backs}=={a.get('id') for a in refs},'all_note_targets':all(a.get('href','').startswith('#') and a['href'][1:] in ids for a in refs+backs),'one_sources_heading':len(d.select('h2','id','footnote-label'))==1,'illustration_credit':'symbolic reading-table illustration. Illustration: Project Odisha.' in body,'update_and_privacy':'Suggest an update' in body and 'GitHub submissions are public' in body})
        hero=d.select('img','src',PHOTO)
        result['hero_dimensions']=len(hero)==1 and (hero[0].get('width'),hero[0].get('height'))==('1200','800')
    elif route in INCOMING:
        links=d.select('a','href',ARTICLE);result['one_actionable_card']=len([a for a in links if a.get('aria-hidden')!='true'])==1
        result['expected_anchor_count']=len(links)==(2 if route=='/literature/' else 1)
        result['one_preview']=len(d.select('img','src',PREVIEW))==1
        result['illustration_credit']='Illustration: Project Odisha.' in body
    else:
        result['museum_source']='https://www.metmuseum.org/art/collection/search/662782' in body
        result['alteration_credit']='public domain. Full frame, resized and compressed for web delivery.' in body
    return result

def relevant_images(text,route):
    """Map observed semantic slots to observed URLs; never invent responsive filenames."""
    d=Tags(fragment(text,route));result={}
    for index,img in enumerate(d.select('img')):
        src=img.get('src','');path=urlsplit(urljoin(BASE,src)).path
        if path not in [PHOTO,PREVIEW,PAINTING]:continue
        role='painting' if path==PAINTING else ('illustration-preview' if path==PREVIEW else 'illustration')
        result[role+':src']=urljoin(BASE,src)
        for item in img.get('srcset','').split(','):
            bits=item.strip().split()
            if not bits:continue
            if len(bits)!=2:raise ValueError('Unexpected srcset '+item)
            result[role+':srcset:'+bits[1]]=urljoin(BASE,bits[0])
    for m in Tags(text).select('meta','property','og:image'):
        url=urljoin(BASE,m.get('content',''))
        if urlsplit(url).path in [PHOTO,PREVIEW,PAINTING]:result['og:image']=url
    return result

def main():
    # Refuse to start unless all local comparison artifacts exist.
    local={route:(PACKAGE/route.lstrip('/')/'index.html').read_text() for route in ROUTES}
    for route,text in local.items():
        if not all(checks(text,route).values()):raise RuntimeError('Local prerequisite failed: '+route)
    run=Path(__file__).parent/'live'/('delivery-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
    run.mkdir(parents=True,exist_ok=False);(run/'html').mkdir();(run/'media').mkdir()
    report={'status':'RUNNING','base_url':BASE,'local_package':str(PACKAGE),'run_directory':str(run),'routes':[],'images':[],'review_required':[],'limits':['HTTP/local artifact verification, not browser layout verification.','No responsive URL normalization or pixel-equivalence assumptions. Any different URL, bytes or fragment requires separate review.','Only images referenced by the observed new illustration or Champu painting img/srcset/OG slots are fetched.']}
    def fetch(url,destination):
        if urlsplit(url).netloc!=urlsplit(BASE).netloc:return {'url':url,'error':'Unexpected image origin; not fetched'}
        result={'url':url,'saved_path':str(destination)}
        try:
            with urlopen(Request(url,headers={'User-Agent':'ProjectOdisha-PublicationVerification/1.0','Cache-Control':'no-cache'}),timeout=45) as response:
                data=response.read();result.update({'http_status':response.status,'final_url':response.url,'content_type':response.headers.get('Content-Type'),'bytes':len(data),'sha256':digest(data)})
                destination.write_bytes(data);return result
        except HTTPError as e:
            data=e.read();destination.write_bytes(data);result.update({'http_status':e.code,'bytes':len(data),'sha256':digest(data),'error':str(e)})
        except (URLError,TimeoutError,OSError) as e:result['error']=str(e)
        return result
    slots={}
    for route in ROUTES:
        filename=route.strip('/').replace('/','--')+'.html';entry=fetch(BASE+route,run/'html'/filename);entry['route']=route
        if entry.get('http_status')==200:
            try:
                live=(run/'html'/filename).read_text();a=fragment(local[route],route);b=fragment(live,route)
                entry.update({'local_fragment_sha256':digest(a.encode()),'live_fragment_sha256':digest(b.encode()),'fragment_equal':a==b,'metadata_equal':metadata(Tags(local[route]))==metadata(Tags(live)),'live_metadata':metadata(Tags(live)),'checks':checks(live,route)})
                if a!=b:
                    (run/'html'/(filename+'.local-fragment.html')).write_text(a);(run/'html'/(filename+'.live-fragment.html')).write_text(b)
                local_slots=relevant_images(local[route],route);live_slots=relevant_images(live,route)
                entry['observed_image_slots']=live_slots;entry['image_slots_equal']=local_slots==live_slots
                for slot,url in live_slots.items():slots.setdefault(url,[]).append({'route':route,'slot':slot,'local_url':local_slots.get(slot)})
                if not (entry['fragment_equal'] and entry['metadata_equal'] and entry['image_slots_equal'] and all(entry['checks'].values())):report['review_required'].append({'kind':'page_difference','route':route})
            except Exception as e:entry['validation_error']=str(e);report['review_required'].append({'kind':'page_validation_error','route':route,'error':str(e)})
        else:report['review_required'].append({'kind':'page_http_error','route':route})
        report['routes'].append(entry)
    for number,(url,references) in enumerate(slots.items(),1):
        filename=f'{number:02d}-'+Path(urlsplit(url).path).name;entry=fetch(url,run/'media'/filename);entry['references']=references;entry['comparisons']=[]
        for ref in references:
            comparison={'route':ref['route'],'slot':ref['slot'],'local_url':ref['local_url'],'url_equal':ref['local_url']==url}
            if ref['local_url']:
                path=PACKAGE/urlsplit(ref['local_url']).path.lstrip('/')
                if path.is_file():comparison.update({'local_path':str(path),'local_bytes':path.stat().st_size,'local_sha256':digest(path.read_bytes()),'bytes_equal':entry.get('http_status')==200 and digest(path.read_bytes())==entry.get('sha256')})
                else:comparison['error']='Observed local comparison file missing'
            else:comparison['error']='No matching observed local slot'
            entry['comparisons'].append(comparison)
        if entry.get('http_status')!=200 or any(not c.get('bytes_equal') or not c['url_equal'] for c in entry['comparisons']):
            report['review_required'].append({'kind':'image_difference','url':url,'saved_path':entry.get('saved_path'),'comparisons':entry['comparisons']})
        report['images'].append(entry)
    report['status']='REVIEW_DIFFERENCES' if report['review_required'] else 'PASS'
    report['network_requests']=len(ROUTES)+len(slots)
    output=run/'http.json';output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':report['status'],'report':str(output),'routes':len(report['routes']),'images':len(report['images']),'review_required':len(report['review_required'])},indent=2))
    return 2 if report['review_required'] else 0
if __name__=='__main__':sys.exit(main())
