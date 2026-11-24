#!/usr/bin/env python3
"""Read-only final local package checks. Run only after full/coast/publication builds.
Prints JSON; does not write package files or run a build. Browser checks are separate.
"""
from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re, subprocess
ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'projects/site'
NODE='/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
ROUTE='literature/birakishore-das/index.html'
TITLE='Birakishore Das: Poems, Schoolbooks and the Young Reader'
PHOTO='images/literature/birakishore-das/reading-table.webp'
PREVIEW='images/literature/birakishore-das/reading-table-480.webp'
INCOMING=['literature/index.html','stories/odia-literature-preservation/index.html','stories/odia-bibhaba-visit/index.html']
def need(value,message):
    if not value: raise AssertionError(message)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
class Tags(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.tags=[];self.depth=0;self.nested=False;self.feed(text)
    def handle_starttag(self,tag,attrs):
        self.tags.append((tag,dict(attrs)))
        if tag=='a':self.nested|=self.depth>0;self.depth+=1
    def handle_endtag(self,tag):
        if tag=='a':self.depth-=1
    def select(self,tag,key=None,value=None):return [a for t,a in self.tags if t==tag and (key is None or key in a and (value is None or a[key]==value))]
def article(text):
    found=re.findall(r'<article\b[\s\S]*?</article>',text);need(len(found)==1,'Expected one article');return found[0]
def meta(doc,key):
    tags=doc.select('meta','property',key);need(len(tags)==1,'Unique '+key);return tags[0]['content']
def footnotes(body):
    doc=Tags(body);ids=[a['id'] for _,a in doc.tags if 'id' in a]
    need(len(ids)==len(set(ids)),'Unique article IDs');need(not doc.nested,'No nested anchors')
    refs=doc.select('a','data-footnote-ref');backs=doc.select('a','data-footnote-backref');notes=[a for a in doc.select('li','id') if a['id'].startswith('user-content-fn-')]
    need((len(refs),len(notes),len(backs))==(6,4,6),'Six refs/four notes/six returns')
    need({a['href'][1:] for a in backs}=={a['id'] for a in refs},'All return targets')
    for a in refs+backs:need(a['href'].startswith('#') and a['href'][1:] in ids,'Resolved footnote target')
    need(len(doc.select('h2','id','footnote-label'))==1,'One visible source heading')
    return {'refs':6,'notes':4,'returns':6}
# Render the same canonical manuscript with the real wrapper frontmatter, without a build.
script=r"""
const fs=require('fs'),{transformSync}=require('esbuild');
(async()=>{const {renderReviewedCultureArticle}=await import('./src/lib/reviewed-culture-article.mjs');
const source=fs.readFileSync('../../kb/research/people/birakishore-das-article.md','utf8');
const page=fs.readFileSync('src/pages/literature/birakishore-das.astro','utf8');
const front=page.match(/^---\n([\s\S]*?)\n---\n/)[1].replace(/^import .*;\n/gm,'');
const js=transformSync(front,{loader:'ts',format:'esm'}).code;
const x=new Function('source','renderReviewedCultureArticle',js+'\nreturn {article,beforeFigure,afterFigure,caption,image,description};')(source,renderReviewedCultureArticle);
console.log(JSON.stringify(x));})();
"""
expected=json.loads(subprocess.check_output([NODE,'-e',script],cwd=SITE))
canonical=(ROOT/'kb/research/people/birakishore-das-article.md').read_text()
prepared=(ROOT/'outputs/birakishore-das-2026-11-23/article.md').read_text()
need(re.sub(r'^---\n[\s\S]*?\n---\n\s*','',canonical)==prepared.replace('media/reading-table-original.png','https://projectodisha.org/'+PHOTO),'Reviewed body exact except canonical public image URL')
need(expected['article']['title']==TITLE and expected['description']=='Birakishore Das: literature, textbooks, publication.','Canonical title/dek')
media=json.loads((ROOT/'outputs/birakishore-publication-20261123/implementation/result.json').read_text())['media']
need(sha(ROOT/media['original']['path'])==media['original']['sha256'],'Preparation illustration original preserved')
image_dimensions={};reports={};articles=[];incoming_fragments={r:[] for r in INCOMING}
for name in ['dist','dist-coast','dist-publish']:
    folder=SITE/name;text=(folder/ROUTE).read_text();body=article(text);doc=Tags(text);bd=Tags(body);articles.append(body)
    counts=footnotes(body)
    need(len(bd.select('h1'))==1 and body.count('By Ahimanikya Satapathy')==1,'One heading/byline')
    need(expected['beforeFigure'] in body and expected['afterFigure'] in body,'Canonical narrative/notes/further-reading exact rendered fragments')
    need(expected['caption'] in body,'Exact symbolic illustration caption and credit')
    need('Suggest an update' in body and 'GitHub submissions are public' in body,'Update/privacy notice')
    need(meta(doc,'og:title').startswith(TITLE),'Sharing title')
    need(meta(doc,'og:description')==expected['description'],'Sharing description')
    need(meta(doc,'og:image')=='https://projectodisha.org/'+PHOTO,'Same sharing illustration')
    need((meta(doc,'og:image:width'),meta(doc,'og:image:height'))==('1200','800'),'Sharing dimensions')
    heroes=bd.select('img','src','/'+PHOTO);need(len(heroes)==1,'One hero');hero=heroes[0]
    need(hero['alt']==expected['image']['alt'],'Exact illustration alt')
    need((hero['width'],hero['height'])==('1200','800'),'Hero intrinsic dimensions')
    need(hero.get('loading')=='eager' and hero.get('fetchpriority')=='high','Opening image priority')
    need(hero.get('sizes'),'Responsive sizes')
    need([p.strip().split() for p in hero['srcset'].split(',')]==[['/'+PREVIEW,'480w'],['/'+PHOTO,'1200w']],'Exact two-image responsive source set')
    for record in media['files']:
        rel=record['path'].removeprefix('projects/site/public/');p=folder/rel
        need(sha(p)==record['sha256'] and p.stat().st_size==record['bytes'],'Reviewed image bytes '+name+'/'+rel)
        image_dimensions[str(p)]=(record['width'],record['height'])
    for route in INCOMING:
        page=(folder/route).read_text();pd=Tags(page)
        links=pd.select('a','href','/literature/birakishore-das/')
        action=[a for a in links if a.get('aria-hidden')!='true']
        need(len(action)==1,'Exactly one actionable incoming card '+route)
        need(len(links)==(2 if route=='literature/index.html' else 1),'Expected thumbnail/title anchor structure '+route)
        previews=pd.select('img','src','/'+PREVIEW);need(len(previews)==1,'One incoming illustration '+route)
        preview=previews[0];need(preview.get('alt') in ('',None) and preview.get('loading')=='lazy','Decorative lazy preview')
        need(int(preview['width'])*2==int(preview['height'])*3,'Preview reserves native aspect ratio')
        # Restrict comparison to the actual new hub card or complete existing story article.
        if route=='literature/index.html':
            cards=[x for x in re.findall(r'<article\b[\s\S]*?</article>',page) if 'href="/literature/birakishore-das/"' in x]
            need(len(cards)==1,'One hub card');fragment=cards[0]
        else:fragment=article(page)
        need('Birakishore Das' in fragment and 'Illustration: Project Odisha.' in fragment,'Neutral label and credit '+route)
        need(not Tags(fragment).nested,'No nested card anchors');incoming_fragments[route].append(fragment)
    reports[name]={'article_sha256':hashlib.sha256(body.encode()).hexdigest(),'footnotes':counts,'incoming':INCOMING}
need(articles[0]==articles[1]==articles[2],'New article exact across all builds')
for route,fragments in incoming_fragments.items():need(fragments[0]==fragments[1]==fragments[2],'Incoming fragment unchanged between editions '+route)
# Bounded painting delivery transform; global publication controls are deliberately not byte-compared.
capacity=json.loads((ROOT/'outputs/birakishore-publication-20261123/implementation/capacity-implementation.json').read_text())['measurement']
painting=capacity['path'];champu='literature/champu-and-sakhi/index.html';source=SITE/'public'/painting
need(sha(source)==capacity['source_sha256'],'Repository painting original unchanged')
for name in ['dist','dist-coast']:need(sha(SITE/name/painting)==capacity['source_sha256'],'Original painting '+name)
need(sha(SITE/'dist-publish'/painting)==capacity['output_sha256'],'Reviewed painting delivery hash')
need((SITE/'dist-publish'/painting).stat().st_size==capacity['output_bytes'],'Painting delivery bytes')
image_dimensions[str(SITE/'dist-publish'/painting)]=(2048,1341)
coast=(SITE/'dist-coast'/champu).read_text();published=(SITE/'dist-publish'/champu).read_text()
phrase='public domain.';replacement=phrase+' Full frame, resized and compressed for web delivery.'
need(article(coast).count(phrase)==1,'Unique painting caption')
need(article(published)==article(coast).replace(phrase,replacement),'Only intended painting article alteration')
need(article((SITE/'dist'/champu).read_text())==article(coast),'Full/coast painting article unchanged')
for name,dimensions in [('dist',('3923','2569')),('dist-coast',('3923','2569')),('dist-publish',('2048','1341'))]:
    doc=Tags((SITE/name/champu).read_text());need(meta(doc,'og:image')=='https://projectodisha.org/'+painting,'Painting OG source '+name)
    need((meta(doc,'og:image:width'),meta(doc,'og:image:height'))==dimensions,'Painting OG geometry '+name)
need('https://www.metmuseum.org/art/collection/search/662782' in article(published),'Museum source credit')
# Actual image dimensions, read-only Sharp metadata inspection.
js="const sharp=require('sharp');Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return[p,m.width,m.height]})).then(x=>console.log(JSON.stringify(x)))"
for p,w,h in json.loads(subprocess.check_output([NODE,'-e',js,json.dumps(list(image_dimensions))],cwd=SITE)):
    need((w,h)==image_dimensions[p],'Decoded dimensions '+p)
# No preparation files, scans, original illustration or unpublished Kaincha assets in the delivery package.
package=SITE/'dist-publish';files=[p for p in package.rglob('*') if p.is_file()]
for p in files:
    rel=p.relative_to(package).as_posix().lower()
    need(not rel.startswith(('outputs/','kb/')) and 'kaincha' not in rel and 'reading-table-original' not in rel,'No preparation/unpublished asset '+rel)
excluded=[ROOT/media['original']['path']]
excluded+=list((ROOT/'outputs/birakishore-das-2026-11-23/research').rglob('*.png'))
excluded+=list((ROOT/'outputs/birakishore-das-2026-11-23/research').rglob('*.pdf'))
excluded+=[p for p in (ROOT/'kb/media/kaincha').rglob('*') if p.is_file()]
excluded+=[p for p in (ROOT/'outputs/kaincha-article-2026-11-23/media').rglob('*') if p.is_file()]
by_size={}
for p in excluded:by_size.setdefault(p.stat().st_size,set()).add(sha(p))
for p in files:
    hashes=by_size.get(p.stat().st_size)
    if hashes:need(sha(p) not in hashes,'No preparation media bytes delivered '+str(p))
payload=sum(p.stat().st_size for p in files);need(payload<1_000_000_000,'Strict publication payload limit')
print(json.dumps({'status':'PASS','builds':reports,'painting_delivery':capacity,'image_dimension_checks':len(image_dimensions),'excluded_preparation_media_checked':len(excluded),'payload_bytes':payload,'headroom_bytes':1_000_000_000-payload,'limits':['Local package verification only; no browser or deployed-byte claims.','Article and incoming content fragments are held exact across editions; global edition controls are not asserted byte-identical.','Kaincha/preparation exclusion checks cover paths plus original illustration, research raster/PDF scans and known Kaincha media bytes.']},indent=2))
