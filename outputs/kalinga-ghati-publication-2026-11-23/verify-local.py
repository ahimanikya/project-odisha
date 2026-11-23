"""Read completed artifacts only; never build, optimize, publish or contact a service."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib, json, re, subprocess, shutil

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SITE = ROOT / 'projects/site'
BASE = '0d91aa8a9d18128bcbfc93ea787b621350fe0b6e'
ROUTE = '/destinations/kalinga-ghati/'
ASHTA = '/stories/ashta-nayika/'
JPEG = '/assets/ashta-nayika/abhisarika-met.jpg'
ORIGINAL = 'eaff339bea55c126bce518e954ae531d2daec78764b5db13a62cb1581c83dcf9'
CANDIDATE = 'cbf7a0cbc5887e219af9ed9e8bae332e1939b23b74d93bb892e6d29cc83c7040'
DISCLOSURE = 'public domain. Full frame, resized and compressed for web delivery.'
MANUSCRIPT = '14ca467b285fc68fde76afc16a01678a7c87a791189d7fbffb0bb5f3e58bb83a'
AUTHORS = ['Pratyush P. Mohapatra', 'Sumidh Ray', 'Ashis K. Das', 'Bharath Bhupathi', 'Vivek Sarkar', 'Rakesh K. Mohalik', 'Manoj V. Nair', 'Sushil K. Dutta']
sha = lambda b: hashlib.sha256(b).hexdigest()

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.imgs=[]; self.meta={}
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if 'id' in d: self.ids.append(d['id'])
        if tag=='a': self.links.append(d.get('href',''))
        if tag=='img': self.imgs.append(d)
        if tag=='meta': self.meta[d.get('property',d.get('name',''))]=d.get('content')

def parse(text):
    p=Page(); p.feed(text); return p
def article(text):
    return re.search(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S).group()
def plain(text):
    return ' '.join(unescape(re.sub('<[^>]+>',' ',text)).split())
def widths(img):
    return {int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',img.get('srcset',''))}
def original(path):
    return subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT)
report={'status':'RUNNING','base':BASE,'checks':[],'editions':{},'differences':[],
        'limitations':['Local emitted-artifact checks only; no source, browser, Linux or live approval. Image encoding differences require separate review.']}
def check(ok,label):
    if not ok: raise AssertionError(label)
    report['checks'].append(label)

def main():
    stages=json.loads((OUT/'build-results.json').read_text())
    required={'full-build','full-disclosures','full-tests','coast-build','coast-disclosures','coast-tests','coast-acceptance','coast-discovery','search-review','launch-readiness','publication-build','publication-disclosures','search-shortlist'}
    check(required <= {x['stage'] for x in stages} and all(x['exit_code']==0 for x in stages),'All required build/test/audit stages completed successfully')
    im=json.loads((ROOT/'kb/research/destinations/kalinga-ghati-image.json').read_text())
    check(sha((ROOT/'kb/research/places/kalinga-ghati-article.md').read_bytes())==MANUSCRIPT,'Reviewed manuscript exact')
    check(sha((ROOT/im['original']['file']).read_bytes())==im['original']['sha256'],'Complete original two-panel figure preserved')
    check(sha((SITE/('public'+im['src'])).read_bytes())==im['web_derivative']['sha256'],'Reviewed panel A source exact')
    variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==im['src'])
    check([x['width'] for x in variants]==[480,960,1200],'Three responsive widths 480/960/1200')
    fragments=[]
    for edition in ['dist','dist-coast','dist-publish']:
        base=SITE/edition; text=(base/ROUTE.strip('/')/'index.html').read_text(); p=parse(text); fragment=article(text); fragments.append(fragment)
        check(len(p.ids)==len(set(p.ids)),edition+': unique IDs')
        notes=[x for x in p.links if x.startswith('#user-content-fn')]
        check(len(notes)==10 and all(x[1:] in p.ids for x in notes),edition+': five citations/five returns resolve')
        check('Footnotes & Sources' in plain(fragment) and 'By Ahimanikya Satapathy' in plain(fragment),edition+': visible byline and sources')
        for key in ['og:image','twitter:image']: check(p.meta.get(key)=='https://projectodisha.org'+im['src'],edition+': '+key)
        figure=next(f for f in re.findall(r'<figure\b[^>]*>.*?</figure>',fragment,re.S) if im['src'] in f)
        hero=next(x for x in parse(figure).imgs if x.get('src')==im['src'])
        check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['1200','777','eager','high'],edition+': native figure and prioritized geometry')
        check(hero.get('alt')==im['alt'],edition+': exact photo alt')
        check(widths(hero)=={x['width']:x['src'] for x in variants},edition+': actual responsive URLs')
        caption=re.search(r'<figcaption\b[^>]*>(.*?)</figcaption>',figure,re.S).group(1)
        for value in [im['caption'],im['changes'],im['license'],*AUTHORS]: check(value in plain(caption),edition+': visible credit '+value)
        for value in [im['source'],im['license_url']]: check(value in parse(caption).links,edition+': linked source/licence '+value)
        check('Photograph by' not in caption,edition+': no photographer inference')
        check(sha((base/im['src'].lstrip('/')).read_bytes())==im['web_derivative']['sha256'],edition+': selected photo exact')
        for v in variants:
            b=(base/v['src'].lstrip('/')).read_bytes(); check(len(b)==v['bytes'] and sha(b)==v['sha256'],edition+': exact variant '+str(v['width']))
        for incoming in ['destinations/hills','destinations','explore']:
            h=(base/incoming/'index.html').read_text(); cards=[c for c in re.findall(r'<article\b[^>]*>.*?</article>',h,re.S) if 'href="'+ROUTE+'"' in c]
            check(len(cards)==1,edition+': one incoming '+incoming)
            check(any(i.get('src')==im['src'] for i in parse(cards[0]).imgs),edition+': photo preview '+incoming)
            check(not re.search(r'>Illustration</(?:p|figcaption)>',cards[0]),edition+': documentary preview '+incoming)
            for value in [im['creator'],im['source'],im['license_url'],im['changes']]: check(value in unescape(h),edition+': incoming credit retained '+incoming)
        for href in parse(fragment).links:
            if href.startswith('/') and not href.startswith('//') and '?' not in href and '#' not in href:
                check((base/href.strip('/')/'index.html').is_file(),edition+': reading target '+href)
        report['editions'][edition]={'article_sha256':sha(text.encode()),'fragment_sha256':sha(fragment.encode()),'note_links':len(notes),'variants':variants}
    check(fragments[0]==fragments[1]==fragments[2],'Exact article fragment across all three editions')
    # Source/coastal copies stay archival; only the assembled delivery JPEG changes.
    for path in ['kb/research/media/nayika/abhisarika-met.jpg','projects/site/public'+JPEG,'projects/site/dist'+JPEG,'projects/site/dist-coast'+JPEG]:
        check(sha((ROOT/path).read_bytes())==ORIGINAL,'Ashta original preserved '+path)
    for path in ['kb/research/culture/ashta-nayika.md','projects/site/src/pages/stories/ashta-nayika.astro']:
        check((ROOT/path).read_bytes()==original(path),'Ashta source unchanged '+path)
    delivered=SITE/('dist-publish'+JPEG); output_hash=sha(delivered.read_bytes())
    entry=next(x for x in json.loads((SITE/'.astro/publication-jpeg-optimization.json').read_text())['files'] if x['path']==JPEG.lstrip('/'))
    check(entry['source_sha256']==ORIGINAL and entry['output_sha256']==output_hash,'Ashta actual output matches optimizer evidence')
    check(entry['source_dimensions']==[2907,4000] and entry['output_dimensions']==[1488,2048],'Ashta full-frame delivery dimensions')
    check(entry['output_bytes']==delivered.stat().st_size<entry['source_bytes'],'Ashta measured size saving')
    if output_hash!=CANDIDATE: report['differences'].append({'kind':'ashta_jpeg_encoding','expected_local_sha256':CANDIDATE,'actual_sha256':output_hash})
    for edition,dimensions in [('dist',[2907,4000]),('dist-coast',[2907,4000]),('dist-publish',[1488,2048])]:
        h=(SITE/edition/ASHTA.strip('/')/'index.html').read_text(); p=parse(h)
        check(p.meta.get('og:image')=='https://projectodisha.org'+JPEG and p.meta.get('twitter:image')=='https://projectodisha.org'+JPEG,edition+': Ashta share URL retained')
        check([int(p.meta['og:image:width']),int(p.meta['og:image:height'])]==dimensions,edition+': Ashta share size')
        check(plain(h).count(DISCLOSURE)==(1 if edition=='dist-publish' else 0),edition+': delivery-only caption disclosure')
        check('https://www.metmuseum.org/art/collection/search/37992' in p.links,edition+': museum credit retained')
    coast_article=article((SITE/'dist-coast'/ASHTA.strip('/')/'index.html').read_text())
    publish_article=article((SITE/'dist-publish'/ASHTA.strip('/')/'index.html').read_text())
    check(coast_article.replace('public domain.',DISCLOSURE,1)==publish_article,'Ashta article changes only disclosed caption')
    report['ashta']={'source_sha256':ORIGINAL,'expected_local_sha256':CANDIDATE,'actual_sha256':output_hash,'optimizer':entry}
    # Validate actual decoded image dimensions with installed Sharp, without writes.
    image_paths=[str(SITE/('dist-publish'+im['src'])),str(delivered)]+[str(SITE/('dist-publish'+v['src'])) for v in variants]
    js="import sharp from 'sharp'; const p=JSON.parse(process.argv[1]); console.log(JSON.stringify(await Promise.all(p.map(async x=>{const m=await sharp(x).metadata();return [m.width,m.height]}))));"
    dims=json.loads(subprocess.check_output([shutil.which('node') or '/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','--input-type=module','-e',js,json.dumps(image_paths)],cwd=SITE))
    check(dims==[[1200,777],[1488,2048]]+[[v['width'],v['height']] for v in variants],'Decoded base/JPEG/variant dimensions match')
    receipt_path='kb/records/antaranga-after-belghar-preparation-20261123.json'
    receipt=json.loads(original(receipt_path)); check((ROOT/receipt_path).read_bytes()==original(receipt_path),'Kaincha preparation receipt unchanged')
    check(len(receipt['delivery_files'])==15,'Fifteen Kaincha preparation files declared')
    for f in receipt['delivery_files']: check(sha((ROOT/f['path']).read_bytes())==f['sha256'],'Kaincha preserved '+f['path'])
    completion=receipt['completion_record_review']; check(sha((ROOT/completion['record']).read_bytes())==completion['sha256'],'Kaincha completion review preserved')
    path='kb/records/belghar-tumudibandha-publication-20261123.json'; check((ROOT/path).read_bytes()==original(path),'Prior Belghar receipt preserved')
    path='kb/team/operations.json'; now=json.loads((ROOT/path).read_text()); old=json.loads(original(path))
    for key in ['current_task','handoff_home']: check(now[key]==old[key],'Foreign ownership preserved '+key)
    body_marker='Golden grass takes its name from the lustre of the dried material.'
    forbidden=['kaincha-and-golden-grass','golden-grass-square-box.jpg',body_marker,'habitat-figure7-original.jpg']
    protected=[f for f in receipt['delivery_files'] if f['path'].endswith(('.md','.jpg'))]
    internal_hashes={f['sha256'] for f in protected}|{im['original']['sha256']}
    protected_sizes={(ROOT/f['path']).stat().st_size for f in protected}|{im['original']['bytes']}
    report['internal_exclusion']={}
    for edition in ['dist-coast','dist-publish']:
        files=[f for f in (SITE/edition).rglob('*') if f.is_file()]
        leaks={'paths':[],'exact_file_hashes':[],'text':[]}
        for f in files:
            relative=f.relative_to(SITE/edition).as_posix()
            if any(x in relative for x in forbidden): leaks['paths'].append(relative)
            if f.stat().st_size in protected_sizes and sha(f.read_bytes()) in internal_hashes: leaks['exact_file_hashes'].append(relative)
            if f.suffix.lower() in {'.html','.json','.md','.txt','.js','.mjs'}:
                text=f.read_text(errors='replace')
                if any(x in text or x in plain(text) for x in forbidden): leaks['text'].append(relative)
        report['internal_exclusion'][edition]=leaks
        check(not any(leaks.values()),edition+': no internal Kaincha manuscript/body/route/photo or complete two-panel figure by path/text/exact hash')
    files=[f for f in (SITE/'dist-publish').rglob('*') if f.is_file()]
    size=sum(f.stat().st_size for f in files); check(size<1_000_000_000,'Actual publication below strict decimal GB')
    report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size}
    report['status']='REVIEW_DIFFERENCES' if report['differences'] else 'PASS'

if __name__=='__main__':
    try: main()
    except Exception as exc:
        report['status']='FAIL'; report['error']=repr(exc); raise
    finally:
        (OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'status':report['status'],'checks':len(report['checks']),'payload':report.get('payload'),'error':report.get('error')}))
