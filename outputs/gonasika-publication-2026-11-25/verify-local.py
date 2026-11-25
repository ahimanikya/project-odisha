"""Inspect completed release artifacts without building, changing them or publishing."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib, json, re, subprocess, shutil

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
SITE = ROOT / 'projects/site'
BASE = 'cd027f4327423f84b5278fc7509fcab57ae45b2a'
ROUTE = '/destinations/gonasika/'
sha = lambda b: hashlib.sha256(b).hexdigest()
report = {'status': 'RUNNING', 'checks': [], 'editions': {}, 'limitations': 'Local emitted artifacts only; separate source, visual, hosted and live reviews required.'}

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.imgs=[]; self.meta={}
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if 'id' in d: self.ids.append(d['id'])
        if tag=='a': self.links.append(d.get('href',''))
        if tag=='img': self.imgs.append(d)
        if tag=='meta': self.meta[d.get('property',d.get('name',''))]=d.get('content')

def parse(s):
    p=Page(); p.feed(s); return p
def plain(s): return ' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
def fragment(s): return re.search(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',s,re.S).group()
def check(ok, label):
    if not ok: raise AssertionError(label)
    report['checks'].append(label)
def old(path): return subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT)

def main():
    stages=json.loads((OUT/'build-results.json').read_text())
    required={'full-build','full-disclosures','full-tests','coast-build','coast-disclosures','coast-tests','coast-acceptance','coast-discovery','search-review','launch-readiness','publication-build','publication-disclosures','search-shortlist'}
    check({s['stage'] for s in stages}==required and all(s['exit_code']==0 for s in stages),'Complete successful build/test/audit stages')
    expected=json.loads((OUT/'reviewed-article-contract.json').read_text())
    actual_manuscript=sha((ROOT/'kb/research/places/gonasika-article.md').read_bytes())
    check(actual_manuscript==expected['manuscript_sha256'],'Exact reviewed manuscript')
    check(all(x.get('manuscript_sha256')==actual_manuscript for x in stages),'Every build/check stage used reviewed manuscript')
    im=json.loads((ROOT/'kb/research/destinations/gonasika-image.json').read_text())
    check(im['original']['sha256']=='34652c7fb58d25dfd471a9870032424284d8715499a4739aaef4e09a6db072e1','Fixed reviewed original SHA256')
    variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==im['src'])
    check([v['width'] for v in variants]==[480,960,1280],'Three expected responsive widths')
    check(sha((ROOT/im['original']['file']).read_bytes())==im['original']['sha256'],'Original photograph preserved')
    fragments=[]
    for edition in ['dist','dist-coast','dist-publish']:
        base=SITE/edition; html=(base/ROUTE.strip('/')/'index.html').read_text(); p=parse(html); body=fragment(html); fragments.append(body)
        check(len(p.ids)==len(set(p.ids)),edition+': unique IDs')
        refs=[x for x in p.links if x.startswith('#user-content-fn-')]
        returns=[x for x in p.links if x.startswith('#user-content-fnref-')]
        check(len(refs)==expected['references'] and len(set(refs))==expected['unique_notes'] and len(returns)==expected['returns'] and len(set(returns))==expected['returns'] and all(x[1:] in p.ids for x in refs+returns),edition+': nonempty native citations and every return resolve')
        for label in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update']:
            check(label in plain(body),edition+': visible '+label)
        for key in ['og:image','twitter:image']: check(p.meta.get(key)=='https://projectodisha.org'+im['src'],edition+': '+key)
        figure=next(f for f in re.findall(r'<figure\b[^>]*>.*?</figure>',body,re.S) if im['src'] in f)
        hero=next(i for i in parse(figure).imgs if i.get('src')==im['src'])
        check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['1280','960','eager','high'],edition+': full-frame source dimensions and loading')
        check(hero.get('alt')==im['alt'],edition+': exact image description')
        widths={int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}
        check(widths=={v['width']:v['src'] for v in variants},edition+': responsive URLs match emitted variants')
        caption=re.search(r'<figcaption\b[^>]*>(.*?)</figcaption>',figure,re.S).group(1)
        for value in [im['caption'],im['creator'],im['license'],im['changes']]:check(value in plain(caption),edition+': image credit '+value)
        for value in [im['source'],im['license_url']]:check(value in parse(caption).links,edition+': linked credit '+value)
        check(sha((base/im['src'].lstrip('/')).read_bytes())==im['public_base']['sha256'],edition+': reviewed base image')
        for v in variants:
            b=(base/v['src'].lstrip('/')).read_bytes();check(len(b)==v['bytes'] and sha(b)==v['sha256'],edition+': exact variant '+str(v['width']))
        for incoming in ['destinations/hills','destinations','explore']:
            h=(base/incoming/'index.html').read_text(); cards=[c for c in re.findall(r'<article\b[^>]*>.*?</article>',h,re.S) if 'href="'+ROUTE+'"' in c]
            check(len(cards)==1,edition+': one incoming card '+incoming)
            check(any(i.get('src')==im['src'] for i in parse(cards[0]).imgs),edition+': photographed preview '+incoming)
            credits=[c for c in re.findall(r'<li\b[^>]*>.*?</li>',h,re.S) if im['source'] in unescape(c)]
            check(bool(credits),edition+': preview source credit '+incoming)
            for value in [im['creator'],im['source'],im['license_url'],im['changes']]:check(any(value in unescape(c) for c in credits),edition+': card credit '+incoming+' '+value)
        for href in parse(body).links:
            if href.startswith('/') and not href.startswith('//') and '?' not in href and '#' not in href:
                check((base/href.strip('/')/'index.html').is_file(),edition+': reading target '+href)
        report['editions'][edition]={'fragment_sha256':sha(body.encode()),'references':len(refs),'returns':len(returns),'variants':variants}
    check(fragments[0]==fragments[1]==fragments[2],'Exact new article fragment across three editions')
    paths=[str(SITE/('dist-publish'+im['src']))]+[str(SITE/('dist-publish'+v['src'])) for v in variants]
    js="import sharp from 'sharp';console.log(JSON.stringify(await Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return [m.width,m.height]}))));"
    dims=json.loads(subprocess.check_output([shutil.which('node') or '/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node','--input-type=module','-e',js,json.dumps(paths)],cwd=SITE))
    check(dims==[[1280,960],[480,360],[960,720],[1280,960]],'Independently decoded source and variant dimensions')
    op='kb/team/operations.json'; previous=json.loads(old(op)); current=json.loads((ROOT/op).read_text())
    for k in ['current_task','handoff_home']:check(previous[k]==current[k],'Foreign ownership preserved '+k)
    memoir='kb/records/odia-homepage-publication-20261123.json'
    check((ROOT/memoir).read_bytes()==subprocess.check_output(['git','show','a377c8f5beb9811ca35697b535ab7f40ae0abe56:'+memoir],cwd=ROOT),'Merged memoir receipt859 preserved')
    protected=json.loads((OUT/'preserved-preparation.json').read_text())['files']
    for f in protected:check(sha((ROOT/f['path']).read_bytes())==f['sha256'],'Preparation preservation '+f['path'])
    for name in ['antaranga-after-belghar-preparation-20261123','antaranga-after-tensa-preparation-20261124','jhoti-publication-20261125','saptasajya-publication-20261124','tensa-publication-20261124','malayagiri-publication-20261125','antaranga-after-malayagiri-preparation-20261125']:
        path='kb/records/'+name+'.json';check((ROOT/path).read_bytes()==old(path),'Prior receipt preserved '+name)
    internal=[f for f in protected if 'kaincha' in f['path'] or 'golden-grass' in f['path'] or 'nilagiri' in f['path'] or 'antaranga-after-malayagiri' in f['path']]; hashes={f['sha256'] for f in internal}; sizes={(ROOT/f['path']).stat().st_size for f in internal}
    forbidden=['A plate, a bowl, a drinking vessel: Odisha’s stonework has a domestic scale.','nilagiri-stone-utensils','nilagiri-utensils','A Craft for the Table','jhoti-chita.md','gurubara-jhoti-commons-1920.jpg','kaincha-and-golden-grass','golden-grass-square-box.jpg','Golden grass takes its name from the lustre of the dried material.']
    for edition in ['dist-coast','dist-publish']:
        for f in (SITE/edition).rglob('*'):
            if not f.is_file():continue
            check(not any(x in str(f.relative_to(SITE/edition)) for x in forbidden),edition+': no protected path '+str(f.relative_to(SITE/edition)))
            if f.stat().st_size in sizes:check(sha(f.read_bytes()) not in hashes,edition+': no exact protected preparation file')
            if f.suffix in ['.html','.json','.md','.txt','.js','.mjs']:
                text=f.read_text(errors='replace');check(not any(x in text or x in plain(text) for x in forbidden),edition+': no protected draft text '+str(f.relative_to(SITE/edition)))
    capacity=json.loads((OUT/'review/capacity-proposal.json').read_text())['selected']
    image_path=capacity['path']
    for edition in ['public','dist','dist-coast']:
        check(sha((SITE/edition/image_path).read_bytes())==capacity['source_sha256'],'Capacity original preserved '+edition)
    check(sha((SITE/'dist-publish'/image_path).read_bytes())==capacity['candidate_sha256'],'Exact reviewed delivery derivative')
    check(sha((ROOT/'kb/research/media/sakhi-nata/mardala.jpg').read_bytes())==capacity['source_sha256'],'Original KB Mardala preserved')
    affected=(SITE/'dist-publish'/capacity['page']).read_text()
    previous=(SITE/'dist-coast'/capacity['page']).read_text()
    expected_affected=previous.replace('reproduced without alteration.','resized and compressed for web delivery without cropping.').replace('<meta property="og:image:width" content="2716">','<meta property="og:image:width" content="1552">').replace('<meta property="og:image:height" content="3024">','<meta property="og:image:height" content="1728">')
    check(previous.count('reproduced without alteration.')==1,'Unique Mardala modification phrase')
    # Existing publication delivery also changes crawler controls and externalizes
    # the exact inline journey JSON. Verify these bounded transforms explicitly.
    crawler_before='<meta name="robots" content="noindex, nofollow">'
    crawler_after='<meta name="robots" content="noindex, follow">'
    check(expected_affected.count(crawler_before)==1,'One existing non-indexable crawler control')
    expected_affected=expected_affected.replace(crawler_before,crawler_after)
    journey=re.search(r'<script type="application/json" id="journey-data">(.*?)</script>',previous,re.S)
    external=re.search(r'<script type="application/json" id="journey-data"></script><script src="(/assets/journey-data-[a-f0-9]+\.js)"></script>',affected)
    check(bool(journey and external),'Existing publication journey delivery envelope present')
    asset=(SITE/'dist-publish'/external.group(1).lstrip('/')).read_text()
    prefix="document.getElementById('journey-data').textContent="
    check(asset.startswith(prefix) and asset.endswith(';\n'),'Expected journey assignment envelope')
    check(json.loads(asset[len(prefix):-2])==journey.group(1),'External journey JSON preserves exact inline data')
    check(sha(asset.encode()) in external.group(1),'Journey asset name matches actual digest')
    expected_affected=expected_affected.replace(journey.group(0),external.group(0))
    check(expected_affected==affected,'Mardala full HTML has only reviewed image changes and verified existing publication transforms')
    ap=parse(affected)
    check(ap.meta.get('og:image:width')=='1552' and ap.meta.get('og:image:height')=='1728','Mardala sharing geometry matches delivered1552x1728')
    check(capacity['source_url'] in affected,'Affected image source credit retained')
    files=[p for p in (SITE/'dist-publish').rglob('*') if p.is_file()]; size=sum(p.stat().st_size for p in files)
    check(size<1_000_000_000,'Strict public payload limit')
    report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size};report['status']='PASS'

if __name__=='__main__':
    try:main()
    except Exception as exc:report['status']='FAIL';report['error']=repr(exc);raise
    finally:
        (OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'status':report['status'],'checks':len(report['checks']),'payload':report.get('payload'),'error':report.get('error')}))
