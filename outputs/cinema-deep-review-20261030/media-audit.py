from pathlib import Path
import json,hashlib,re,collections
from PIL import Image,ImageOps
from lxml import html as lh
R=Path(__file__).resolve().parents[2]
x=json.loads((R/'projects/site/src/data/cinema.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
placements=[];articles=[];issues=[]
def dhash(im):
 im=im.convert('L').resize((9,8));a=list(im.getdata());return sum((a[y*9+i]>a[y*9+i+1])<<(y*8+i) for y in range(8) for i in range(8))
for a in x['articles']:
 source=R/a['source'];dist=R/'projects/site/dist'/a['route'].strip('/')/'index.html'
 soup=lh.fromstring(dist.read_text()) if dist.exists() else None
 matches=soup.xpath('//article[contains(@class,"reviewed-culture")]') if soup is not None else [];article=matches[0] if matches else None
 figures=article.xpath('.//figure') if article is not None else []
 ids=collections.Counter(t.get('id') for t in soup.xpath('//*[@id]')) if soup is not None else {}
 dupe=[k for k,v in ids.items() if v>1]
 if dupe:issues.append({'slug':a['slug'],'kind':'duplicate-dom-ids','ids':dupe})
 refs=[]
 for f in figures:
  im=f.xpath('.//img')[0];refs.append({'src':im.get('src'),'width':im.get('width'),'height':im.get('height'),'style':f.get('style'),'caption':' '.join(f.xpath('.//figcaption//text()')), 'note_links':[{'label':''.join(r.itertext()).strip(),'href':r.get('href'),'resolved':bool(soup.xpath('//*[@id=$id]',id=r.get('href','')[1:]))} for r in f.xpath('.//figcaption//a[starts-with(@href,"#")]')]})
 for im in a['images']:
  p=R/im['source'];pic=ImageOps.exif_transpose(Image.open(p));h=sha(p)
  prov=[]
  for rel in im.get('provenance',[]):
   pp=R/rel if rel.startswith('kb/') else R/'projects/site/public'/rel.lstrip('/');prov.append({'path':rel,'exists':pp.exists(),'text':pp.read_text() if pp.exists() and pp.suffix=='.json' else None})
  placements.append({'slug':a['slug'],'role':im['role'],'source':im['source'],'sha256':h,'metadata_sha256':im.get('original_sha256'),'hash_matches':h==im.get('original_sha256'),'original_dimensions':list(pic.size),'delivery_file':im['file'],'delivery_dimensions':[im['width'],im['height']],'delivery_sha256':sha(R/'projects/site/public'/im['file'].lstrip('/')),'dhash':dhash(pic),'hero':a['hero'] if im['role']=='title' else None,'provenance':prov})
  if h!=im.get('original_sha256'):issues.append({'slug':a['slug'],'kind':'original-hash-mismatch','source':im['source']})
 articles.append({'slug':a['slug'],'route':a['route'],'source':a['source'],'source_sha256':sha(source),'source_binding_current':sha(source)==a['source_sha256'],'rendered_html':str(dist.relative_to(R)),'rendered_figure_count':len(figures),'metadata_figure_count':len(a['images']),'figures':refs,'hero_credit':a['hero'].get('credit'),'hero_caption':a['hero'].get('caption'),'hero_kind':a['hero'].get('kind','illustration')})
groups=collections.defaultdict(list)
for p in placements:groups[p['sha256']].append({'slug':p['slug'],'source':p['source'],'role':p['role']})
exact=[v for v in groups.values() if len(v)>1]
pairs=[]
for i,p in enumerate(placements):
 for q in placements[i+1:]:
  distance=(p['dhash']^q['dhash']).bit_count()
  if distance<=15:pairs.append({'a':p['source'],'a_slug':p['slug'],'b':q['source'],'b_slug':q['slug'],'distance':distance,'exact':p['sha256']==q['sha256']})
books={}
for edition in ['digital','print']:
 base=R/'tmp/pdfs/2026-10-30-intro-revised'/edition
 rec=json.loads((base/'book-build-2026-10-30-intro-revised.json').read_text());pdf=R/rec['pdf'];ims=rec['image_placements'];g=collections.defaultdict(list)
 for im in ims:g[im['sha256']].append(im['chapter'])
 books[edition]={'pdf':rec['pdf'],'pages':rec['pages'],'sha256':sha(pdf),'receipt_hash_matches':sha(pdf)==rec['pdf_sha256'],'image_count':len(ims),'duplicate_original_hashes':{k:v for k,v in g.items() if len(v)>1},'below_150ppi':[{'chapter':im['chapter'],'source':im['source'],'dpi':im['effective_dpi']} for im in ims if im['effective_dpi']<150],'current_source_bindings':all(sha(R[c['source']])==c['source_sha256'] for c in rec['chapters']) if False else all(sha(R/c['source'])==c['source_sha256'] for c in rec['chapters']),'render_dir':rec['render_dir'],'contact_sheets':rec['contact_sheets']}
report={'article_count':len(articles),'placement_count':len(placements),'articles':articles,'placements':placements,'exact_reuse':exact,'perceptual_candidates':pairs,'issues':issues,'books':books,'limits':['dHash is candidate discovery, not identity proof; selected pairs require visual inspection.','Preview cards intentionally reuse article title images; they are not separate article content placements.','Rights provenance records are audited locally; no fresh licence web verification in this pass.']}
(R/'outputs/cinema-deep-review-20261030/media-inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'articles':len(articles),'placements':len(placements),'exact_reuse':exact,'perceptual_candidates':pairs,'issues':issues,'books':books},indent=2))
from pypdf import PdfReader
pdf_risks={}
for edition,b in books.items():
 reader=PdfReader(R/b['pdf']);low=[];image_pages=[]
 for i,p in enumerate(reader.pages):
  t=p.extract_text() or '';words=re.findall(r'\S+',t);nimages=len(p.images)
  if nimages:image_pages.append({'page':i+1,'images':nimages,'text_words':len(words)})
  if len(words)<55 and not nimages:low.append({'page':i+1,'words':len(words),'text':t})
 pdf_risks[edition]={'low_text_no_image_pages':low,'image_pages':image_pages}
(R/'outputs/cinema-deep-review-20261030/media-pdf-risks.json').write_text(json.dumps(pdf_risks,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({e:x['low_text_no_image_pages'] for e,x in pdf_risks.items()},ensure_ascii=False,indent=2))
