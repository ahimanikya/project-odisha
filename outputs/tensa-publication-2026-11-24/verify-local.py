"""Inspect completed release artifacts without building, changing them or publishing."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib, json, re, subprocess, shutil

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
SITE = ROOT / 'projects/site'
BASE = '38b6216d331d04235c90977553ded55bcdde8d74'
ROUTE = '/destinations/tensa/'
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
    actual_manuscript=sha((ROOT/'kb/research/places/tensa-article.md').read_bytes())
    check(actual_manuscript==expected['manuscript_sha256'],'Exact reviewed manuscript')
    check(all(x.get('manuscript_sha256')==actual_manuscript for x in stages),'Every build/check stage used reviewed manuscript')
    im=json.loads((ROOT/'kb/research/destinations/tensa-image.json').read_text())
    check(im['original']['sha256']=='64b6b782a99bf5252d41dcf4a187ac0725c77004c2d708c8c1fcfc655404c56d','Fixed reviewed original SHA256')
    variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==im['src'])
    check([v['width'] for v in variants]==[480,960,1440],'Three expected responsive widths')
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
        check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==['2048','1365','eager','high'],edition+': full-frame source dimensions and loading')
        check(hero.get('alt')==im['alt'],edition+': exact image description')
        widths={int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}
        check(widths=={v['width']:v['src'] for v in variants},edition+': responsive URLs match emitted variants')
        caption=re.search(r'<figcaption\b[^>]*>(.*?)</figcaption>',figure,re.S).group(1)
        for value in [im['caption'],im['creator'],im['license'],im['changes']]:check(value in plain(caption),edition+': image credit '+value)
        for value in [im['source'],im['license_url']]:check(value in parse(caption).links,edition+': linked credit '+value)
        check(sha((base/im['src'].lstrip('/')).read_bytes())==im['original']['sha256'],edition+': unchanged base image')
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
    check(dims==[[2048,1365],[480,320],[960,640],[1440,960]],'Independently decoded source and variant dimensions')
    op='kb/team/operations.json'; previous=json.loads(old(op)); current=json.loads((ROOT/op).read_text())
    for k in ['current_task','handoff_home']:check(previous[k]==current[k],'Foreign ownership preserved '+k)
    receipt_path='kb/records/antaranga-after-belghar-preparation-20261123.json'; receipt=json.loads(old(receipt_path))
    check((ROOT/receipt_path).read_bytes()==old(receipt_path),'Kaincha preparation receipt unchanged')
    protected=receipt['delivery_files']+[{'path':receipt['completion_record_review']['record'],'sha256':receipt['completion_record_review']['sha256']}]
    for f in protected:check(sha((ROOT/f['path']).read_bytes())==f['sha256'],'Kaincha preservation '+f['path'])
    check((ROOT/'kb/records/birakishore-publication-20261123.json').read_bytes()==old('kb/records/birakishore-publication-20261123.json'),'Preceding Birakishore receipt unchanged')
    hashes={f['sha256'] for f in protected}; sizes={(ROOT/f['path']).stat().st_size for f in protected}
    forbidden=['kaincha-and-golden-grass','golden-grass-square-box.jpg','Golden grass takes its name from the lustre of the dried material.']
    for edition in ['dist-coast','dist-publish']:
        for f in (SITE/edition).rglob('*'):
            if not f.is_file():continue
            check(not any(x in str(f.relative_to(SITE/edition)) for x in forbidden),edition+': no protected path '+str(f.relative_to(SITE/edition)))
            if f.stat().st_size in sizes:check(sha(f.read_bytes()) not in hashes,edition+': no exact protected preparation file')
            if f.suffix in ['.html','.json','.md','.txt','.js','.mjs']:
                text=f.read_text(errors='replace');check(not any(x in text or x in plain(text) for x in forbidden),edition+': no protected draft text '+str(f.relative_to(SITE/edition)))
    files=[p for p in (SITE/'dist-publish').rglob('*') if p.is_file()]; size=sum(p.stat().st_size for p in files)
    check(size<1_000_000_000,'Strict public payload limit')
    report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size};report['status']='PASS'

if __name__=='__main__':
    try:main()
    except Exception as exc:report['status']='FAIL';report['error']=repr(exc);raise
    finally:
        (OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'status':report['status'],'checks':len(report['checks']),'payload':report.get('payload'),'error':report.get('error')}))
