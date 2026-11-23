#!/usr/bin/env python3
"""Read-only local final-package verification. Run after all three builds finish.
Prints JSON; does not write reports or modify package files. No browser checks.
"""
from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re, subprocess
ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'projects/site'
BASE='d8eef97818bc0451c77d24c97ab19e7e415666b5'
ROUTE='stories/sola-and-odissi-tahia/index.html'
PHOTO='images/stories/sola-tahia.webp'
TITLE='Sola: The Craft Behind an Odissi Tahia'
def need(condition,message):
    if not condition: raise AssertionError(message)
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)
class Tags(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.tags=[];self.anchor_depth=0;self.nested=False;self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs);self.tags.append((tag,attrs))
        if tag=='a':
            self.nested|=self.anchor_depth>0;self.anchor_depth+=1
    def handle_endtag(self,tag):
        if tag=='a':self.anchor_depth-=1
    def select(self,tag,key=None,value=None):
        return [a for t,a in self.tags if t==tag and (key is None or key in a and (value is None or a[key]==value))]
def article(text):
    found=re.findall(r'<article\b[\s\S]*?</article>',text);need(len(found)==1,'Expected single article');return found[0]
def meta(doc,key):
    found=doc.select('meta','property',key);need(len(found)==1,'Unique '+key);return found[0]['content']
def footnotes(text,refs,notes):
    doc=Tags(text);ids=[a['id'] for _,a in doc.tags if 'id' in a];need(len(ids)==len(set(ids)),'Duplicate article IDs');need(not doc.nested,'Nested anchors')
    references=doc.select('a','data-footnote-ref');backs=doc.select('a','data-footnote-backref');items=[a for a in doc.select('li','id') if a['id'].startswith('user-content-fn-')]
    need((len(references),len(items),len(backs))==(refs,notes,refs),'Footnote counts')
    reference_ids={a['id'] for a in references};need({a['href'][1:] for a in backs}==reference_ids,'Return targets match every reference')
    for a in references+backs:need(a['href'].startswith('#') and a['href'][1:] in ids,'Footnote target exists')
    return {'refs':refs,'notes':notes,'returns':len(backs)}
# Inspect actual image dimensions with the repository-installed Sharp, no encoding.
image_paths={}
def image(path,width,height):
    need(path.is_file(),'Missing image '+str(path));image_paths[str(path)]=(int(width),int(height))
def responsive(img,folder):
    image(folder/img['src'].lstrip('/'),img['width'],img['height'])
    parts=[x.strip().split() for x in img.get('srcset','').split(',') if x.strip()];need(len(parts)==3,'Three responsive variants')
    need([int(size[:-1]) for _,size in parts]==[480,960,1200],'Responsive widths')
    for url,size in parts:
        width=int(size[:-1]);height=round(width*801/1200);image(folder/url.lstrip('/'),width,height)
    need(img.get('sizes'),'Responsive sizes')
reports={};articles=[]
for foldername in ['dist','dist-coast','dist-publish']:
    folder=SITE/foldername;text=(folder/ROUTE).read_text();body=article(text);articles.append(body);doc=Tags(text);bd=Tags(body)
    counts=footnotes(body,6,4);need(len(bd.select('h1'))==1,'One title');need(body.count('By Ahimanikya Satapathy')==1,'One byline')
    for phrase in [TITLE,'Prakriti Panda','https://commons.wikimedia.org/wiki/File:A_fully-made_Tahia.jpg','https://creativecommons.org/licenses/by-sa/4.0/','Resized and compressed for web display.','Suggest an update']:
        need(phrase in body,'Missing article credit/content '+phrase)
    need(len(bd.select('h2','id','footnote-label'))==1,'One source heading')
    heroes=bd.select('img','src','/'+PHOTO);need(len(heroes)==1,'One hero');hero=heroes[0]
    need(hero.get('alt')=='A hand holds a curved white floral headpiece above a worktable.','Exact alt')
    need(hero.get('loading')=='eager' and hero.get('fetchpriority')=='high','Opening image priority')
    responsive(hero,folder)
    need(meta(doc,'og:image')=='https://projectodisha.org/'+PHOTO,'OG photo');need((meta(doc,'og:image:width'),meta(doc,'og:image:height'))==('1200','801'),'OG dimensions')
    need(sha(folder/PHOTO)=='1b90fc8fca3cafaa0176bcea08ab72bcd81c1b0cdf93c0379351ffbbbed2ee0b','Exact reviewed Sola base')
    incoming=[]
    for route,ref,target in [('stories/odissi-abhinaya/index.html','user-content-fnref-sola-photo','user-content-fn-sola-photo'),('books/odisha-culture-memory-and-living-traditions/silver-metal-clay-stone-and-applique/index.html','sola-reading-reference','source-12')]:
        page=(folder/route).read_text();fragment=article(page);d=Tags(fragment)
        links=d.select('a','href','/stories/sola-and-odissi-tahia/');need(len(links)==1,'Exactly one incoming card '+route)
        previews=d.select('img','src','/'+PHOTO);need(len(previews)==1,'One incoming photo');need(previews[0].get('alt') in ('',None),'Decorative preview');responsive(previews[0],folder)
        need(len(d.select('a','id',ref))==1 and d.select('a','id',ref)[0]['href']=='#'+target,'Incoming credit reference')
        note=re.search(r'<li\b[^>]*id="'+re.escape(target)+r'"[\s\S]*?</li>',fragment);need(note,'Incoming credit note')
        for phrase in ['Prakriti Panda','https://commons.wikimedia.org/wiki/File:A_fully-made_Tahia.jpg','https://creativecommons.org/licenses/by-sa/4.0/','Resized and compressed.','#'+ref]:need(phrase in note[0],'Complete incoming credit '+phrase)
        need(not d.nested,'No nested incoming anchors');incoming.append(route)
    reports[foldername]={'article':counts,'incoming_cards':incoming,'article_sha256':hashlib.sha256(body.encode()).hexdigest()}
need(articles[0]==articles[1]==articles[2],'Sola article exact across builds')
# Source preservation against accepted preceding release.
book='projects/site/src/data/cultural-book.json';before=json.loads(git('show',BASE+':'+book));after=json.loads((ROOT/book).read_text());untouched=[]
for old,new in zip(before['chapters'],after['chapters']):
    if old['slug']!='silver-metal-clay-stone-and-applique':need(old==new,'Unchanged chapter '+old['slug']);untouched.append(old['slug'])
need(len(before['chapters'])==len(after['chapters'])==48 and len(untouched)==47,'All47 unaffected chapters')
original_hash='50c47707d4d50cd4855d16e554360145d486cc9536308919c2a17f70a69586be'
for path in ['kb/media/sola/finished-tahia-prakriti-panda.jpg','outputs/sola-article-2026-11-23/media/finished-tahia-prakriti-panda.jpg']:need(sha(ROOT/path)==original_hash,'Preparation original unchanged '+path)
# Hindola: source remains byte exact; only publication gets reviewed derivative and credit/OG transform.
candidate=json.loads((ROOT/'outputs/sola-publication-20261123/capacity/jpeg-candidate.json').read_text());hp=candidate['path'];page='stories/jhulana-in-odisha/index.html'
need(sha(SITE/'public'/hp)==candidate['source_sha256'],'Hindola repository source')
for name in ['dist','dist-coast']:need(sha(SITE/name/hp)==candidate['source_sha256'],'Hindola original '+name)
need(sha(SITE/'dist-publish'/hp)==candidate['output_sha256'],'Hindola reviewed publication candidate');need((SITE/'dist-publish'/hp).read_bytes()==(ROOT/'outputs/sola-publication-20261123/capacity/hindola-delivery.jpg').read_bytes(),'Candidate byte equality')
image(SITE/'dist-publish'/hp,1517,2048)
hindola=(SITE/'dist-coast'/page).read_text();expected=hindola.replace('Image released under CC0.','Image released under CC0. Full frame, resized and compressed for web delivery.').replace('<meta property="og:image:width" content="2519">','<meta property="og:image:width" content="1517">').replace('<meta property="og:image:height" content="3400">','<meta property="og:image:height" content="2048">')
published_hindola=(SITE/'dist-publish'/page).read_text()
need(hindola.count('Image released under CC0.')==1,'Unique Hindola credit')
need(article(published_hindola)==article(hindola).replace('Image released under CC0.','Image released under CC0. Full frame, resized and compressed for web delivery.'),'Only intended Hindola article transformation')
# Global publication controls intentionally differ: robots policy and extracted journey-data script.
# Keep article equality strict; validate the independent share-image fields on actual output.
for name,dimensions in [('dist',('2519','3400')),('dist-coast',('2519','3400')),('dist-publish',('1517','2048'))]:
    share=Tags((SITE/name/page).read_text())
    need(meta(share,'og:image')=='https://projectodisha.org/'+hp,'Hindola matching OG source '+name)
    need((meta(share,'og:image:width'),meta(share,'og:image:height'))==dimensions,'Hindola actual OG geometry '+name)
for phrase in ['https://www.clevelandart.org/art/1975.9','Image released under CC0. Full frame, resized and compressed for web delivery.']:need(phrase in expected,'Hindola credit retained')
hdoc=Tags(published_hindola);need((meta(hdoc,'og:image:width'),meta(hdoc,'og:image:height'))==('1517','2048'),'Hindola sharing geometry')
# Removing just new allowlist item and caption declaration must recover prior optimizer byte-for-byte.
optimizer='projects/site/tools/optimize-publication-jpeg.mjs';current=(ROOT/optimizer).read_text();normalized=current.replace(",'assets/jhulana-in-odisha/hindola-raga.jpg'",'');normalized=re.sub(r"^ 'assets/jhulana-in-odisha/hindola-raga.jpg':.*\n",'',normalized,flags=re.M)
need(normalized==git('show',BASE+':'+optimizer).decode(),'All earlier JPEG settings and implementation unchanged')
node=Path('/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node');script="const sharp=require('sharp');const paths=JSON.parse(process.argv[1]);Promise.all(paths.map(async p=>{const m=await sharp(p).metadata();return[p,m.width,m.height]})).then(x=>console.log(JSON.stringify(x)))"
measured=json.loads(subprocess.check_output([str(node),'-e',script,json.dumps(list(image_paths))],cwd=SITE))
for path,w,h in measured:need((w,h)==image_paths[path],'Actual image dimensions '+path)
print(json.dumps({'status':'PASS','builds':reports,'unaffected_book_chapters':len(untouched),'preparation_original_sha256':original_hash,'actual_images_checked':len(measured),'hindola':candidate,'previous_jpeg_optimizer_preserved':True,'limits':['Local package verification only; no browser or deployed-byte claims.','Global edition controls (robots and journey-data extraction) are not asserted byte-identical; article fragments and OG fields remain strictly checked.','Unchanged47 chapters checked as source data, not full rendered-page equivalence.']},indent=2))
