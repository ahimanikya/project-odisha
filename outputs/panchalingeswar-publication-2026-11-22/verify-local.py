from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re, subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SITE = ROOT / 'projects/site'
BASE = '54bcd323606f80c9fef47ae3bf65d313a31068ed'
ROUTE = '/destinations/panchalingeswar/'
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

def parse(s):
    p=Page(); p.feed(s); return p

report={'status':'running','base':BASE,'checks':[],'editions':{},'limitations':['Local emitted-file verification only. Source, browser, Linux and live checks are separate.']}
def check(ok, text):
    assert ok,text
    report['checks'].append(text)

builds=json.loads((OUT/'build-results.json').read_text())
check(len(builds)==8 and all(x['exit_code']==0 for x in builds),'All eight build/test/disclosure stages passed')
image=json.loads((ROOT/'kb/research/destinations/panchalingeswar-image.json').read_text())
manuscript=ROOT/'kb/research/places/panchalingeswar-article.md'
report['manuscript_sha256']=sha(manuscript.read_bytes())
check(report['manuscript_sha256']=='27b98e2a29a1b1cbaed9a6302c0c3e884fa37468a4cb112dd6228d9f8d88478d','Frozen separately reviewed manuscript hash matches')
variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==image['src'])
check([x['width'] for x in variants]==[480,838],'Responsive widths preserve source resolution without enlargement')
fragments=[]
for edition in ['dist','dist-coast','dist-publish']:
    base=SITE/edition; html=(base/ROUTE.strip('/')/'index.html').read_text(); p=parse(html)
    check(len(p.ids)==len(set(p.ids)),edition+': unique IDs')
    notes=[x for x in p.links if x.startswith('#user-content-fn')]
    check(len(notes)==8 and all(x[1:] in p.ids for x in notes),edition+': native citation and return targets resolve')
    check('Footnotes &amp; Sources' in html,edition+': visible footnotes')
    for key in ['og:image','twitter:image']:
        check(p.meta.get(key)=='https://projectodisha.org'+image['src'],edition+': '+key+' uses selected photograph')
    hero=next(x for x in p.imgs if x.get('src')==image['src'])
    check(hero.get('width')=='838' and hero.get('height')=='1117' and hero.get('loading')=='eager',edition+': full portrait dimensions and eager hero')
    check(hero.get('alt')==image['alt'],edition+': descriptive alternative text')
    check(sha((base/image['src'].lstrip('/')).read_bytes())==image['original']['sha256'],edition+': original photograph byte-exact')
    emitted=re.findall(r'(/images/responsive/[^ ,]+)',hero.get('srcset',''))
    check(emitted==[x['src'] for x in variants],edition+': both responsive variants attached')
    for x in variants:
        b=(base/x['src'].lstrip('/')).read_bytes()
        check(len(b)==x['bytes'] and sha(b)==x['sha256'],edition+': variant '+str(x['width'])+' matches measured output')
    for credit in [image['creator'],image['source'],image['license_url'],image['changes']]:
        check(credit in html,edition+': credit retained '+credit[:45])
    for incoming in ['destinations/hills','destinations','explore']:
        s=(base/incoming/'index.html').read_text()
        cards=[x for x in re.findall(r'<article\b.*?</article>',s,re.S) if 'href="'+ROUTE+'"' in x]
        check(len(cards)==1,edition+': one incoming card on '+incoming)
        check(any(x.get('src')==image['src'] for x in parse(cards[0]).imgs),edition+': preview photo on '+incoming)
    fragment=re.search(r'<article\b.*?</article>',html,re.S).group();fragments.append(fragment)
    hits=[];text_count=0
    for f in base.rglob('*'):
        if not f.is_file():continue
        if 'paralakhemundi-horn' in str(f.relative_to(base)).lower() or 'horn-fish-odisha-crafts-museum' in f.name:hits.append(str(f))
        if f.suffix.lower() in ['.html','.json','.md','.txt']:
            text_count+=1
            if any(s in f.read_text(errors='replace') for s in ['Paralakhemundi’s Horn Craft: From Comb to Crane','paralakhemundi-horn-craft','horn-fish-odisha-crafts-museum']):hits.append(str(f))
        if f.stat().st_size==2749696 and sha(f.read_bytes())=='1eb8818471fe5da74eabaa356bad5746c4e6337d1247e47e5273bcd963af9743':hits.append(str(f))
    check(not hits,edition+': unpublished horn draft and photograph excluded')
    report['editions'][edition]={'article_sha256':sha(html.encode()),'article_fragment_sha256':sha(fragment.encode()),'native_reference_return_links':len(notes),'variants':emitted,'unpublished_scan_text_files':text_count,'unpublished_hits':hits}
check(fragments[0]==fragments[1]==fragments[2],'Article identical across all three editions')
horn=json.loads((ROOT/'kb/records/antaranga-next-preparation-20261122.json').read_text())
for item in horn['delivery_files']:
    check(sha((ROOT/item['path']).read_bytes())==item['sha256'],'Preserved preparation '+item['path'])
path='kb/team/operations.json';now=json.loads((ROOT/path).read_text());old=json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
for key in ['current_task','handoff_home']:check(now[key]==old[key],'Preserved foreign '+key)
files=[f for f in (SITE/'dist-publish').rglob('*') if f.is_file()];size=sum(f.stat().st_size for f in files)
check(size<1_000_000_000,'Publication below strict decimal 1GB gate')
report['payload']={'bytes':size,'files':len(files),'remaining_bytes':1_000_000_000-size}
report['media']={'original_bytes':image['original']['bytes'],'variants':variants,'total_bytes':image['original']['bytes']+sum(x['bytes'] for x in variants)}
report['status']='pass'
(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'status':'pass','checks':len(report['checks']),'payload':report['payload']}))
