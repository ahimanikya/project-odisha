from pathlib import Path
from urllib.parse import quote
import sys,json,re,html,hashlib,datetime,argparse
parser=argparse.ArgumentParser();parser.add_argument("--edition",choices=["digital","print"],default="digital");parser.add_argument("--layout-only",action="store_true");parser.add_argument("--page-map");parser.add_argument("--date",required=True);parser.add_argument("--revision",default="",help="Optional lowercase filename suffix, e.g. intro-revised; isolates PDFs, page maps and render receipts.");parser.add_argument("--artifact-marker-evidence",help="Path to actual coordinator marker receipt; records supplied evidence without independently asserting execution.");args=parser.parse_args();
if args.revision and not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",args.revision):parser.error("--revision must contain lowercase letters, digits and single hyphens")
EDITION_KEY=args.date+("-"+args.revision if args.revision else "");EDITION_DATE=datetime.date.fromisoformat(args.date);DATE_TEXT=EDITION_DATE.strftime("%d %B %Y").lstrip("0");PRINT=args.edition=="print";WIDTH=336 if PRINT else 348
R=Path(__file__).resolve().parents[2];sys.path.insert(0,str(R.parent/'prahallad-nataka-research/tmp/pdfs/deps'))
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor,white
from reportlab.platypus import Flowable,BaseDocTemplate,PageTemplate,Frame,Paragraph,Spacer,PageBreak,Image,KeepTogether,CondPageBreak,LongTable,TableStyle
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.enums import TA_LEFT
from PIL import Image as PILImage, ImageOps
from pypdf import PdfReader
import pypdfium2 as pdfium
# ReportLab shapes a mixed-font word with its first font, corrupting following
# punctuation. Shape only homogeneous Odia runs; Latin retains its literal glyphs.
import reportlab.platypus.paragraph as paragraph_module
from reportlab.pdfbase.ttfonts import shapeFragWord as original_shape_word, makeShapedFragWord, ShapedFragWord
def safe_shape_word(word):
 if isinstance(word,ShapedFragWord):return word
 width=word[0];runs=[];changed=False
 for frag,text in word[1:]:
  if getattr(frag,'fontName','')=='Odia' and text and not hasattr(frag,'cbDefn'):
   old=pdfmetrics.stringWidth(text,frag.fontName,frag.fontSize)
   shaped=original_shape_word([old,(frag,text)])
   width+=shaped[0]-old;runs.extend(shaped[1:]);changed=True
  else:runs.append((frag,text))
 return makeShapedFragWord(word)([width]+runs) if changed else word
paragraph_module.shapeFragWord=safe_shape_word
BaseParagraph=Paragraph
class Paragraph(BaseParagraph):
 def __init__(self,text,*a,**kw):
  if PRINT and text:text=text.replace('#8c3c2e','#303030')
  self.bookanchors=re.findall(r'<a name="([^"]+)"/>',text or '')
  text=re.sub(r'<a name="[^"]+"/>','',text) if text is not None else None
  super().__init__(text,*a,**kw)
 def wrap(self,*a,**kw):
  try:return super().wrap(*a,**kw)
  except Exception:
   print("FAILED_PARAGRAPH",repr(self.text),file=sys.stderr);raise
 def split(self,*a,**kw):
  parts=super().split(*a,**kw)
  if parts:parts[0].bookanchors=self.bookanchors
  return parts
 def drawOn(self,canv,x,y,*a,**kw):
  for anchor in self.bookanchors:canv.bookmarkHorizontalAbsolute(anchor,y+self.height)
  return super().drawOn(canv,x,y,*a,**kw)
OUT=R/('output/pdf/odia-cinema-a-living-screen'+('-print' if PRINT else '')+'-'+EDITION_KEY+'.pdf');BASE_TMP=R/'tmp/pdfs';TMP=BASE_TMP/EDITION_KEY/args.edition;TMP.mkdir(exist_ok=True,parents=True)
for name,file in [('Book','SourceSerif4-Regular.ttf'),('BookBold','SourceSerif4-Bold.ttf'),('BookItalic','SourceSerif4-It.ttf'),('BookBoldItalic','SourceSerif4-BoldIt.ttf')]:pdfmetrics.registerFont(TTFont(name,str(R/'tools/cinema-book/fonts'/file),shapable=True))
pdfmetrics.registerFontFamily('Book',normal='Book',bold='BookBold',italic='BookItalic',boldItalic='BookBoldItalic')
pdfmetrics.registerFont(TTFont('Odia',str(BASE_TMP/'fonts/NotoSerifOriya-Regular.ttf'),shapable=True))
pdfmetrics.registerFontFamily('Odia',normal='Odia',bold='Odia',italic='Odia',boldItalic='Odia')
ink=HexColor('#202020' if PRINT else '#252824');accent=HexColor('#303030' if PRINT else '#8c3c2e');muted=HexColor('#454545' if PRINT else '#62675e');LINK_COLOR='#303030' if PRINT else '#8c3c2e';url_directory={}
styles={}
for n,sz,lead in [('body',11,16.5),('chapter',22,28),('h2',14,19),('h3',11.5,17),('caption',9,12.5),('note',9.2,13),('small',9,13),('bridge',11,17),('part',9,13)]:
 styles[n]=ParagraphStyle(n,fontName='Book',fontSize=sz,leading=lead,textColor=ink,spaceAfter=9,shaping=True,allowWidows=0,allowOrphans=0)
styles['chapter'].fontName='BookBold';styles['chapter'].spaceAfter=18
styles['h2'].fontName='BookBold';styles['h2'].spaceBefore=14;styles['h2'].keepWithNext=True
styles['h3'].fontName='BookBold';styles['h3'].keepWithNext=True
styles['part'].textColor=accent;styles['part'].fontName='BookBold';styles['part'].spaceAfter=10
styles['caption'].textColor=muted;styles['caption'].spaceAfter=18
styles['bridge'].fontName='BookItalic';styles['bridge'].textColor=accent;styles['bridge'].spaceBefore=6
# Compact reference matter only; narrative typography is unchanged.
styles['note'].spaceAfter=3.5
styles['source-heading']=ParagraphStyle('source-heading',parent=styles['h2'],fontSize=11.5,leading=15,spaceBefore=10,spaceAfter=4,keepWithNext=True)
styles['source-address']=ParagraphStyle('source-address',parent=styles['small'],spaceAfter=0)
manifest=json.loads((R/'projects/site/src/data/cinema.json').read_text());entries={a['slug']:a for a in manifest['articles']}
additions={}
narrative_path=R/'kb/research/culture/cinema-series/book-narrative-2026-10-27.json'
narrative=json.loads(narrative_path.read_text()) if narrative_path.exists() else {}
def validate_overview_adaptation(plan,root):
 if not plan.get('overview'):return
 preservation=plan.get('preservation',{});source=root/preservation['overview_source'];raw=source.read_bytes()
 if hashlib.sha256(raw).hexdigest()!=preservation.get('overview_source_sha256'):raise ValueError('Stale overview adaptation: canonical source hash changed')
 text=raw.decode();headings=list(re.finditer(r'^#{1,2} .+$',text,re.M))
 chunks={m.group():text[m.start():headings[i+1].start() if i+1<len(headings) else len(text)] for i,m in enumerate(headings)}
 mapped=plan['overview'].get('section_map',[])
 if len(mapped)!=len(chunks) or {item['heading'] for item in mapped}!=set(chunks):raise ValueError('Overview section map is incomplete or duplicated')
 for item in mapped:
  chunk=chunks[item['heading']];target=plan['overview'][item['destination']+'_markdown']
  if hashlib.sha256(chunk.encode()).hexdigest()!=item['source_sha256'] or len(chunk)!=item['source_characters'] or target.count(chunk.strip())!=1:raise ValueError('Stale overview section: '+item['heading'])
validate_overview_adaptation(narrative,R)
artifact_marker={'status':'not_supplied','scope':'No marker execution is claimed by this builder.'}
if args.artifact_marker_evidence:
 marker_path=Path(args.artifact_marker_evidence).resolve()
 artifact_marker={'status':'operator_supplied_evidence','path':str(marker_path),'sha256':hashlib.sha256(marker_path.read_bytes()).hexdigest(),'scope':'Receipt supplied by build operator; execution is not independently verified by this builder.'}

section_guide=narrative.get('section_guide',[])
section_keys=[item['id'] for item in section_guide]
if len(section_keys)!=len(set(section_keys)):raise ValueError('Duplicate discovery section IDs')
section_matches={ident:0 for ident in section_keys}
page_map=json.loads(Path(args.page_map).read_text()) if args.page_map else {}
plan={'parts':manifest['parts'],'image_note':'Illustrations and credited documentary photographs accompany the readings.','preface':manifest.get('reading_intro','Read these chapters as connected journeys through language, performance and filmmaking.')}
order=[slug for part in plan['parts'] for slug in part['chapters']]
assert len(order)==len(entries)==len(set(order))
partmap={s:(i+1,p['title']) for i,p in enumerate(plan['parts']) for s in p['chapters']};selected_bridge_ids=list(dict.fromkeys(['odia-cinema']+[part['chapters'][-1] for part in plan['parts'][:-1]]));bridges={slug:narrative.get('bridges',{})[slug] for slug in selected_bridge_ids if slug in narrative.get('bridges',{})}
pathmap={str((R/a['source']).resolve()):a['slug'] for a in entries.values()};routemap={a['route']:a['slug'] for a in entries.values()};notes={};numbers={};counts={};pages={};images=[];image_credit_notes=[];chapters=[];refseq={};reading={}
def chapter_source(slug):return (R/entries[slug]['source']).read_text()
for slug in order:
 s=chapter_source(slug);notes[slug]=dict(re.findall(r'^\[\^([^]]+)\]:\s*(.*)$',s,re.M));first=list(dict.fromkeys(re.findall(r'\[\^([^]]+)\](?!:)',s)))
 notes[slug]={k:notes[slug][k] for k in first+list(notes[slug]) if k in notes[slug]}
 numbers[slug]={k:i+1 for i,k in enumerate(notes[slug])};refseq[slug]={}

def public_label(s):
 s=s.replace('AI-generated editorial illustration using Human Natural Editorial mode','Editorial illustration').replace('AI-generated Editorial Natural illustration','Editorial illustration').replace('AI-generated editorial illustration','Editorial illustration').replace('AI-generated editorial images','editorial images')
 return s

def norm(s):return public_label(s).replace('\u2011','-').replace('–','-').replace('—',' - ').replace('\u00a0',' ')
def odia(t):return re.sub(r'([\u0b00-\u0b7f]+)',r'<font name="Odia">\1</font>',t)
def inline(text,slug=None,refs=True,print_address=True):
 text=norm(text);tokens={}
 def token(v):k=f'ZZZLINK{len(tokens)}ZZZ';tokens[k]=v;return k
 def link(m):
  label,url=m.groups();label=label.replace("*", "");target=url
  if url=='#overview-companion':
   target=url
  elif url.startswith('/'):
   target='https://projectodisha.org'+url
  elif not re.match(r'https?://|mailto:',url):
   p=(R/entries[slug]['source']).parent/url.split('#')[0] if slug else R/url
   dest=pathmap.get(str(p.resolve()))
   target='#ch-'+dest if dest else 'https://projectodisha.org/stories/prahlada-nataka/' if p.name=='prahallad-nataka.md' else 'https://projectodisha.org/cinema/'
  
  for route,chapter in routemap.items():
   if target.split('#')[0] in [route,'https://projectodisha.org'+route]:target='#ch-'+chapter;break
  suffix=''
  if PRINT and target=='#overview-companion':suffix=f' (p. {page_map.get("overview-companion","000")})'
  if PRINT and target.startswith('#ch-'):
   dest=target[4:]
   if dest in order:suffix=f' (Chapter {order.index(dest)+1}, p. {page_map.get(target[1:],"000")})'
  if PRINT and print_address and target=='https://projectodisha.org/about/editorial-process/':label=target
  elif PRINT and print_address and target.startswith(('http://','https://')):
   if target not in url_directory:url_directory[target]=len(url_directory)+1
   suffix=' [S'+str(url_directory[target])+']'
  return token('<link href="'+html.escape(target,quote=True)+'" color="'+LINK_COLOR+'">'+odia(html.escape(label))+'</link>'+suffix)
 text=re.sub(r'\[([^]\n]+)\]\(((?:[^()]|\([^()]*\))*)\)',link,text)
 if slug and refs:
  text=re.sub(r'(\[\^[^]]+\])(?=\[\^)',lambda m:m[1]+token('<super>, </super>'),text)
  def note(m):
   key=m[1];n=numbers[slug][key];refseq[slug][key]=refseq[slug].get(key,0)+1;idx=refseq[slug][key]
   return token(f'<a name="ref-{slug}-{key}-{idx}"/><super><link href="#note-{slug}-{key}" color="#8c3c2e">{n}</link></super>')
  text=re.sub(r'\[\^([^]]+)\]',note,text)
 text=html.escape(text);text=re.sub(r'\*\*(.+?)\*\*(?!\*)',r'<b>\1</b>',text);text=re.sub(r'\*([^*]+)\*',r'<i>\1</i>',text)
 text=odia(text)
 for k,v in tokens.items():text=text.replace(k,v)
 return text

TAIL_SPACING_CHAPTERS={'tapu-mishra','uttam-mohanty','anupam-patnaik'}
COMPACT_SPACING_CHAPTERS={'odia-cinema','learning-cinema-together','cinema-economics','cinema-futures'}
TIGHT_CHAPTERS={'manglu-charan-biswal','bijay-mohanty','sabyasachi-mohapatra','the-question-that-brought-me-here','literature-and-screen','gour-prasad-ghose','nirad-mohapatra','aadim-vichar','lavanya-preeti','deependra-samal','vishal-mourya','ak-bir'}
CLOSING_FLOW_CHAPTERS={'prafulla-kar','commercial-successes','cinema-music','debi-prasad-lenka'}
styles['body-tight']=ParagraphStyle('body-tight',parent=styles['body'],spaceAfter=6)
styles['body-tail']=ParagraphStyle('body-tail',parent=styles['body'],spaceAfter=4)
styles['h2-tail']=ParagraphStyle('h2',parent=styles['h2'],spaceBefore=5,spaceAfter=3)
styles['body-economics']=ParagraphStyle('body-economics',parent=styles['body'],spaceAfter=4)
styles['h2-closing']=ParagraphStyle('h2',parent=styles['h2'],spaceBefore=6,spaceAfter=4)
styles['odiaquote']=ParagraphStyle('odiaquote',parent=styles['body'],fontName='Odia',fontSize=13,leading=21)
def para(t,style='body',slug=None,refs=True):
 if style=='h2' and slug in TAIL_SPACING_CHAPTERS:style='h2-tail'
 elif style=='body' and slug in TAIL_SPACING_CHAPTERS:style='body-tail'
 elif style=='h2' and slug in {'cinema-economics','cinema-futures','cinema-music'}:style='h2-closing'
 elif style=='body' and (slug in {'cinema-economics','cinema-music'} or PRINT and slug=='cinema-futures'):style='body-economics'
 elif style=='body' and slug in TIGHT_CHAPTERS|CLOSING_FLOW_CHAPTERS|COMPACT_SPACING_CHAPTERS|TAIL_SPACING_CHAPTERS:style='body-tight'
 if re.match(r'^[“"]?[\u0b00-\u0b7f]',t) and len(re.findall(r'[\u0b00-\u0b7f]',t))>len(re.findall(r'[A-Za-z]',t))*3:return Paragraph(html.escape(norm(t)),styles['odiaquote'])
 return Paragraph(inline(t,slug,refs),styles[style])
image_layout_path=R/'kb/research/culture/cinema-series/image-layout-2026-10-30.json'
image_layout=json.loads(image_layout_path.read_text())
image_frames={(item['slug'],item['source']):item for item in image_layout['frames']}
if len(image_frames)!=len(image_layout['frames']):raise ValueError('Duplicate image layout placement')
expected_image_frames={(slug,im['source']) for slug,entry in entries.items() for im in entry.get('images',[])}
if set(image_frames)!=expected_image_frames:raise ValueError('Image layout must match all current source placements')
class FramedImage(Flowable):
 """Clip only the PDF presentation; retain the complete embedded photograph."""
 def __init__(self,path,width,height,source_ratio,position):
  super().__init__();self.path=str(path);self.width=width;self.height=height;self.hAlign='CENTER'
  self.draw_width=max(width,height*source_ratio);self.draw_height=self.draw_width/source_ratio
  self.offset_x=(width-self.draw_width)*position[0]/100
  self.offset_y=(height-self.draw_height)*(1-position[1]/100)
 def draw(self):
  c=self.canv;c.saveState();clip=c.beginPath();clip.rect(0,0,self.width,self.height);c.clipPath(clip,stroke=0,fill=0)
  c.drawImage(self.path,self.offset_x,self.offset_y,width=self.draw_width,height=self.draw_height,mask='auto');c.restoreState()
def frame_geometry(path,slug,width,height):
 item=image_frames.get((slug,str(Path(path).relative_to(R))),{});cfg=item.get('book',{})
 if 'width_fraction' in cfg:
  fraction=cfg['width_fraction']
  if isinstance(fraction,bool) or not isinstance(fraction,(int,float)) or not 0<fraction<=1:raise ValueError('Image width_fraction must be greater than 0 and at most 1')
  fw=WIDTH*fraction
 else:fw=min(WIDTH,cfg.get('width_pt') or WIDTH)
 ratio=cfg.get('ratio');fh=fw*ratio[1]/ratio[0] if ratio else fw*height/width
 return item,fw,fh

delivery={}
for entry in entries.values():
 for im in entry.get('images',[]):delivery[im['source']]=R/'projects/site/public'/im['file'].lstrip('/')
def displayed_image_credit(full_credit,description,hero=False):
 # Remove only the exact description already printed beneath this figure.
 if hero and description and full_credit.startswith(description+' '):
  remainder=full_credit[len(description):].strip()
  if remainder:return remainder
 if not hero:
  for marker in [' Photo:',' Photograph:',' Digitisation:']:
   at=full_credit.find(marker)
   if at>=0 and full_credit[:at]==description:return full_credit[at:].strip()
 return full_credit

def figure(path,caption,slug,hero=False):
 layout=image_frames.get((slug,str(Path(path).relative_to(R))),{})
 full_caption=caption+(' '+layout['credit_note'] if layout.get('credit_note') else '')
 documentary=not hero or entries[slug].get('hero',{}).get('kind') in {'documentary','supplied-portrait'}
 credit_number=None
 if documentary:
  credit_key="cinema-image-"+str(1+sum(x["slug"]==slug for x in image_credit_notes))
  assert credit_key not in notes[slug]
  credit_number=len(notes[slug])+1
  numbers[slug][credit_key]=credit_number
  refseq[slug][credit_key]=1
  if hero:caption=entries[slug]['hero'].get('caption',caption)
  else:
   for marker in [' Photo:',' Photograph:',' Digitisation:',' India Post, Government of India, via']:
    if marker in caption:caption=caption.split(marker,1)[0];break
  displayed_credit=displayed_image_credit(full_caption,caption,hero)
  notes[slug][credit_key]=displayed_credit
  image_credit_notes.append({'number':credit_number,'note_key':credit_key,'slug':slug,'full_credit':full_caption,'displayed_credit':displayed_credit,'description':caption,'source':str(Path(path).relative_to(R))})
 p=Path(path);original=PILImage.open(p);oriented=ImageOps.exif_transpose(original);w,h=oriented.size
 layout,fw,fh=frame_geometry(p,slug,w,h);cfg=layout.get('book',{});cover=cfg.get('fit')=='cover'
 # Keep the whole portrait with the opening in the digital reading edition.
 # The print edition retains its full-width facing portrait page.
 if hero and slug=='the-question-that-brought-me-here' and not PRINT:
  fw=210;fh=fw*h/w;cover=False
 draw_w=max(fw,fh*w/h) if cover else fw;draw_h=draw_w*h/w;scale=draw_w/w
 embedded=p if PRINT else delivery.get(str(p.relative_to(R)),p)
 if embedded==p and original.getexif().get(274,1)!=1:
  oriented_dir=TMP/'oriented';oriented_dir.mkdir(exist_ok=True)
  embedded=oriented_dir/(hashlib.sha256(p.read_bytes()).hexdigest()+'.png')
  if not embedded.exists():oriented.save(embedded)
 if PRINT and w>round(draw_w/72*300):
  print_images=TMP/'print-images';print_images.mkdir(exist_ok=True)
  embedded=print_images/(hashlib.sha256(p.read_bytes()).hexdigest()+f'-{round(draw_w/72*300)}px-300dpi.jpg')
  if not embedded.exists():
   target_w=round(draw_w/72*300);target_h=round(h*target_w/w)
   oriented.convert('RGB').resize((target_w,target_h),PILImage.Resampling.LANCZOS).save(embedded,quality=94,subsampling=0,optimize=True)
 ew,eh=PILImage.open(embedded).size
 im=Spacer(fw,fh) if args.layout_only else FramedImage(embedded,fw,fh,w/h,cfg.get('position',[50,50])) if cover else Image(str(embedded),width=fw,height=fh);im.hAlign='CENTER'
 images.append({'embedded_file':str(embedded.relative_to(R)),'embedded_sha256':hashlib.sha256(embedded.read_bytes()).hexdigest(),'embedded_pixels':[ew,eh],'effective_dpi':min(ew/(w*scale/72),eh/(h*scale/72)),'chapter':slug,'source':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'width':w,'height':h,'placed_width_pt':fw,'placed_height_pt':fh,'image_draw_width_pt':draw_w,'image_draw_height_pt':draw_h,'layout_family':layout.get('family','existing'),'display_crop':cover,'crop_position':cfg.get('position') if cover else None,'role':entries[slug].get('hero',{}).get('kind','illustration') if hero else 'documentary','caption':caption,'full_credit':full_caption,'credit_number':credit_number})
 caption_flow=para(caption,'caption',slug)
 if credit_number:
  credit_space='&#160;' if layout and fw<WIDTH else ' '
  caption_flow=Paragraph(inline(caption,slug)+credit_space+f'<a name="ref-{slug}-{credit_key}-1"/><super><link href="#note-{slug}-{credit_key}" color="{LINK_COLOR}">{credit_number}</link></super>',styles['caption'])
 if fw<WIDTH:
  caption_table=LongTable([[caption_flow]],colWidths=[fw],hAlign='CENTER')
  caption_table.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]));caption_table.spaceAfter=18;caption_flow=caption_table
 block=KeepTogether([im,Spacer(1,7),caption_flow]);block.image_frame_height=fh;block.image_frame_width=fw
 return block
class Book(BaseDocTemplate):
 def __init__(self,*a,**kw):
  super().__init__(*a,**kw);self.current='Odia Cinema: A Living Screen';self.chapter_pages={}
  def template(name,x,nextid):return PageTemplate(id=name,frames=[Frame(x,43,WIDTH,559,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPageEnd=self.page,autoNextPageTemplate=nextid)
  self.addPageTemplates([template('recto',54,'verso'),template('verso',42,'recto')] if PRINT else [template('book',42,'book')])
 def beforeDocument(self):
  self.current='Odia Cinema: A Living Screen'
 def handle_pageBegin(self):
  if PRINT:self.pageTemplate=self.pageTemplates[self.page%2]
  super().handle_pageBegin()
 def page(self,c,d):
  if d.page==1:return
  left=54 if PRINT and d.page%2 else 42;right=left+WIDTH
  c.saveState();c.setStrokeColor(HexColor('#d7d2c7'));c.setLineWidth(.4);c.line(left,615,right,615);c.setFont('Book',8);c.setFillColor(muted);c.drawString(left,624,self.running_title());(c.drawRightString(right,25,str(d.page)) if not PRINT or d.page%2 else c.drawString(left,25,str(d.page)));c.restoreState()
 def running_title(self):
  title=self.current
  while pdfmetrics.stringWidth(title,'Book',8)>WIDTH and len(title)>8:title=title[:-2].rstrip()+'…'
  return title
 def afterFlowable(self,f):
  if hasattr(f,'runningtitle'):self.current=f.runningtitle
  if hasattr(f,'partkey'):
   self.canv.bookmarkPage(f.partkey);self.notify('TOCEntry',(0,f.parttitle,self.page,f.partkey));self.chapter_pages[f.partkey]=self.page
  if hasattr(f,'bookkey'):
   level=getattr(f,'booklevel',0)
   if level==0:self.current=f.booktitle
   self.canv.bookmarkPage(f.bookkey);self.canv.addOutlineEntry(f.booktitle,f.bookkey,level,False);self.notify('TOCEntry',(level+1,f.booktitle,self.page,f.bookkey));self.chapter_pages[f.bookkey]=self.page
story=[]
# First page reserved for the separately reviewed front cover.
story += [Spacer(1,1),PageBreak()]
story += [para('Odia Cinema: A Living Screen','chapter'),para('Stories, People and the Places Between','h2'),para('By Ahimanikya Satapathy','body'),para('Reading edition · '+DATE_TEXT,'small')]
story.append(para(narrative.get('preface',plan['preface']),'body'))
if narrative.get('viewing_note'):story.extend([para('Viewing and reading','h2'),para(narrative['viewing_note'],'small')])
contents_heading=para('Contents','chapter')
contents_heading.runningtitle='Contents'
toc=TableOfContents();toc.levelStyles=[ParagraphStyle('toc-part',fontName='BookBold',fontSize=10.8,leading=15,spaceBefore=12,spaceAfter=3,keepWithNext=True,leftIndent=0,firstLineIndent=0,rightIndent=16,shaping=False),ParagraphStyle('toc',fontName='Book',fontSize=10.4,leading=14,spaceBefore=3 if PRINT else 5,leftIndent=0,firstLineIndent=0,rightIndent=16,shaping=False),ParagraphStyle('toc-section',fontName='Book',fontSize=9.5,leading=13,spaceBefore=2,leftIndent=14,firstLineIndent=0,rightIndent=16,shaping=False)]
short={}
for a in entries.values():
 short.setdefault(a['slug'],re.sub(r'\s+',' ',re.sub(r'[\u0b00-\u0b7f]+','',a['title'])).strip(' |'))
 short[a['slug']]=re.sub(r'^\(([^)]+)\)',r'\1',short[a['slug']])
def primary_reading_path(paths,entries):
 primary=[path for path in paths if path.get('primary') is True]
 if len(primary)>1:raise ValueError('Only one primary reading path is allowed')
 if not primary:return None
 path=primary[0];destinations=path.get('chapters',[]);labels=path.get('labels',{})
 if not 1<=len(destinations)<=10 or len(destinations)!=len(set(destinations)) or any(slug not in entries for slug in destinations):raise ValueError('Primary reading path requires 1–10 unique existing chapters')
 if not isinstance(labels,dict) or set(labels)-set(destinations) or any(not isinstance(label,str) or not label.strip() for label in labels.values()):raise ValueError('Primary path labels must name its chapter destinations')
 if any(not isinstance(path.get(key),str) or not path[key].strip() for key in ['title','text']):raise ValueError('Primary reading path requires a title and introduction')
 return path
primary_path=primary_reading_path(narrative.get('reading_paths',[]),entries)
primary_path_height=None
if primary_path:
 h=para(primary_path['title'],'chapter');h.bookkey='primary-reading-path';h.booktitle=primary_path['title']
 primary_flows=[h,para(primary_path['text'],'body')]
 for destination in primary_path['chapters']:
  label=primary_path.get('labels',{}).get(destination,short[destination])
  primary_flows.append(para('['+label+']('+entries[destination]['route']+')','body'))
 primary_path_height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in primary_flows)
 if primary_path_height>559:raise ValueError('Primary reading path exceeds one page; shorten its labels or introduction')
 story.extend([PageBreak()]+primary_flows)
# Offer the short route before the full catalogue of readings.
story.extend([PageBreak(),contents_heading,toc])
suppressed_viewing=[]
# Exact book-only maintenance prose; dated evidence and source notes remain intact.
ROUTINE_VIEWING_NOTICES={
 'Links checked on 26 October 2026. Playback was not tested; territory, account and payment conditions can change.':'Availability may vary by region and subscription.',
 'These exploration pages were checked in the retained research on 25 October 2026. Audio playback was not tested.':'',
 'Archive and song links checked on 26 October 2026; clip playback untested.':'',
 'Restoration page checked on 26 October 2026; clip playback untested.':'',
 'Listings checked on 26 October 2026.':'',
 'Catalogue links checked on 26 October 2026.':'',
 'Programme links were checked on 25 October 2026; the producer catalogue on 26 October 2026. Playback and current account or regional conditions were not tested.':'Availability may vary by region and account conditions.',
}
styles['aside']=ParagraphStyle('aside',parent=styles['body'],fontSize=10.5,leading=15,spaceAfter=0)
def callout(item,slug):
 label='A connection' if item['kind']=='thread' else 'In focus'
 block=LongTable([[para(label,'part'),para(item['text'],'aside',slug)]],colWidths=[78,WIDTH-78])
 block.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBEFORE',(0,0),(0,-1),1,accent),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]))
 return KeepTogether([block,Spacer(1,8)])
def flatten_flows(items):
 result=[]
 for item in items:
  result.extend(flatten_flows(item._content) if isinstance(item,KeepTogether) else [item])
 return result
# Optional line drawings are recorded separately from the original image placements.
line_art_placements=[]
# Book-only optional chapter endings. A drawing must fit the current frame;
# its absence is preferable to moving prose or creating a decorative page.
book_tail_vignettes=narrative.get('book_tail_vignettes',[])
if len({x['id'] for x in book_tail_vignettes})!=len(book_tail_vignettes):raise ValueError('Duplicate tail vignette ID')
if len({x['slug'] for x in book_tail_vignettes})!=len(book_tail_vignettes):raise ValueError('Only one tail vignette per chapter')
if any(x['slug'] not in entries for x in book_tail_vignettes):raise ValueError('Unknown tail vignette chapter')
tail_vignette_placements=[]
class TailVignette(Flowable):
 def __init__(self,item):
  super().__init__();self.hAlign='CENTER'
  if item['slug'] not in entries:raise ValueError('Unknown tail vignette chapter')
  path=(R/item['image']).resolve();allowed=(R/'kb/media/cinema-series').resolve()
  if not path.is_relative_to(allowed) or path.suffix.lower()!='.png':raise ValueError('Invalid tail vignette image')
  if not item.get('alt','').strip():raise ValueError('Tail vignette requires descriptive alt metadata')
  width=float(item.get('width_pt',144));height=float(item.get('max_height_pt',80))
  if not 48<=width<=240 or not 24<=height<=120:raise ValueError('Invalid tail vignette dimensions')
  original=ImageOps.exif_transpose(PILImage.open(path));iw,ih=original.size
  scale=min(width/iw,height/ih,1);self.iw,self.ih=iw*scale,ih*scale
  # Book-only300ppi PNG delivery preserves alpha and the unchanged master.
  pixel_scale=min(1,self.iw*300/72/iw,self.ih*300/72/ih)
  pixels=(max(1,round(iw*pixel_scale)),max(1,round(ih*pixel_scale)))
  embedded=path
  if pixels!=original.size:
   directory=TMP/'tail-images';directory.mkdir(parents=True,exist_ok=True)
   embedded=directory/(hashlib.sha256(path.read_bytes()).hexdigest()+f'-{pixels[0]}x{pixels[1]}-300ppi.png')
   original.resize(pixels,PILImage.Resampling.LANCZOS).save(embedded,format='PNG',optimize=True)
  self.image=Image(str(embedded),width=self.iw,height=self.ih)
  self.caption=para(item['caption'],'caption',item['slug']) if item.get('caption') else None
  self.caption_height=self.caption.wrap(self.iw,559)[1] if self.caption else 0
  self.required=12+self.ih+(5+self.caption_height if self.caption else 0)+12
  self.width=self.iw;self.height=0;self.fits=False
  self.record={'id':item['id'],'slug':item['slug'],'source':item['image'],'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'width_pt':self.iw,'height_pt':self.ih,'alt':item['alt'],'caption':item.get('caption',''),'status':'not_laid_out'}
  self.record.update(embedded_file=str(embedded.relative_to(R)),embedded_sha256=hashlib.sha256(embedded.read_bytes()).hexdigest(),embedded_pixels=list(pixels),source_pixels=[iw,ih],alpha_preserved='A' in original.getbands(),effective_dpi=pixels[0]*72/self.iw)
  tail_vignette_placements.append(self.record)
 def frameAction(self,frame):
  # Frame calls this before its ordinary h>0 gate. A full frame must consume
  # an optional drawing as a skip, never postpone it onto a fresh page.
  available_width=frame._getAvailableWidth()
  self.wrap(available_width,max(0,frame._y-frame._y1p))
  if not self.fits:return
  y=frame._y-self.height
  self.drawOn(self.canv,frame._x+frame._leftExtraIndent,y,_sW=available_width-self.width)
  frame._y=y;frame._atTop=0;frame._prevASpace=0
 def wrap(self,availWidth,availHeight):
  self.fits=self.width<=availWidth and self.required<=availHeight
  self.height=self.required if self.fits else 0
  self.record.update(status='fits_pending_draw' if self.fits else 'skipped_insufficient_space',available_height_pt=availHeight)
  self.record.pop('page',None)
  return (self.width,self.height)
 def draw(self):
  if not self.fits:return
  y=12+self.caption_height+(5 if self.caption else 0)
  self.image.drawOn(self.canv,0,y)
  if self.caption:self.caption.drawOn(self.canv,0,12)
  self.record.update(status='placed',page=self.canv.getPageNumber())

def line_art_markers(body,slug):
 for item in narrative.get('line_art',[]):
  if item['slug']!=slug:continue
  if item['placement'] not in ['before_heading','after_section']:raise ValueError('Invalid line-art placement')
  target='## '+item['heading'];matches=list(re.finditer(r'^'+re.escape(target)+r'\s*$',body,re.M))
  if not matches:continue # Overview may place this section in its companion appendix.
  if len(matches)!=1:raise ValueError('Ambiguous line-art heading '+item['id'])
  m=matches[0];at=m.start()
  if item['placement']=='after_section':
   following=re.search(r'^## ',body[m.end():],re.M);at=m.end()+following.start() if following else len(body)
  body=body[:at]+'\nCINEMALINEART:'+item['id']+'\n\n'+body[at:]
 return body

def append_line_art(ident,slug):
 matches=[x for x in narrative.get('line_art',[]) if x['id']==ident and x['slug']==slug]
 if len(matches)!=1 or any(x['id']==ident for x in line_art_placements):raise ValueError('Duplicate line-art ID '+ident)
 item=matches[0]
 if not re.fullmatch(r'kb/media/cinema-series/literature-care-20261030/[a-z0-9-]+\.png',item['image']):raise ValueError('Invalid line-art source')
 p=R/item['image'];iw,ih=ImageOps.exif_transpose(PILImage.open(p)).size
 width=float(item.get('width_pt',144))
 if not 48<=width<=240:raise ValueError('Invalid line-art width')
 scale=min(width/iw,90/ih,1);w,h=iw*scale,ih*scale
 flow=[Spacer(1,12),Image(str(p),width=w,height=h,hAlign='CENTER')]
 if item.get('caption'):
  caption=LongTable([[para(item['caption'],'caption',slug)]],colWidths=[w],hAlign='CENTER')
  caption.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),0)]));flow.append(caption)
 flow.append(Spacer(1,12))
 keep_previous=item.get('keep_previous_paragraphs',0)
 if keep_previous:
  if item['placement']!='after_section' or type(keep_previous) is not int or not 1<=keep_previous<=2:raise ValueError('Invalid closing-art paragraph grouping')
  previous=story[-keep_previous:]
  if len(previous)!=keep_previous or not all(isinstance(f,Paragraph) and f.style.name in {'body','body-tight','body-economics'} for f in previous):raise ValueError('Closing-art paragraph boundary changed')
  grouped=previous+flow
  height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in grouped)
  if height>300:raise ValueError('Closing-art group is too large')
  del story[-keep_previous:]
  story.append(KeepTogether(grouped))
 else:story.extend([CondPageBreak(h+85),KeepTogether(flow)])
 line_art_placements.append({'id':ident,'slug':slug,'source':item['image'],'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'width_pt':w,'height_pt':h,'alt':item.get('alt',''),'caption':item.get('caption','')})

book_section_omissions=[]
def omit_book_sections(body,slug,omissions):
 records=[]
 selected=[item for item in omissions if item['slug']==slug]
 if len({item['heading'] for item in selected})!=len(selected):raise ValueError('Duplicate book section omission: '+slug)
 for item in selected:
  matches=list(re.finditer(r'^(#{1,6}) '+re.escape(item['heading'])+r'[ \t]*$',body,re.M))
  if len(matches)!=1:raise ValueError('Book section omission must match exactly once: '+slug+' / '+item['heading'])
  match=matches[0];level=len(match[1]);start=match.start()
  following=re.search(r'^#{1,'+str(level)+r'}[ \t]+',body[match.end():],re.M)
  end=match.end()+following.start() if following else len(body)
  anchor=item.get('preceding_anchor')
  if anchor:
   before=re.search(r'<span id="'+re.escape(anchor)+r'"></span>\s*$',body[:start])
   if not before:raise ValueError('Book section omission anchor missing: '+slug)
   start=before.start()
  removed=body[start:end]
  if re.search(r'\[\^[^]]+\]',removed):raise ValueError('Book section omission contains source notes: '+slug)
  records.append({'slug':slug,'heading':item['heading'],'removed_text':removed,'removed_sha256':hashlib.sha256(removed.encode()).hexdigest(),'reason':item.get('reason','')})
  body=body[:start]+body[end:]
 return body,records

def render_body(body,slug,companion=False):
 p=R/entries[slug]['source'];a=entries[slug]
 body,omitted=omit_book_sections(body,slug,narrative.get('book_section_omissions',[]))
 book_section_omissions.extend(omitted)
 for omission in narrative.get('book_navigation_omissions',[]):
  if omission['slug']==slug:
   if body.count(omission['text'])!=1:raise ValueError('Book navigation omission no longer matches: '+slug)
   body=body.replace(omission['text'],'')
 body=line_art_markers(body.split('## Further reading',1)[0],slug)
 lines=body.splitlines();i=0;paragraphs=0;watch_start=None;aside_start=None;body_start=len(story)
 while i<len(lines):
  line=lines[i].strip();i+=1
  if line.startswith('CINEMALINEART:'):
   ident=line.split(':',1)[1]
   if not PRINT and any(item['id']==ident and item.get('new_book_page') for item in narrative.get('line_art',[])):story.append(PageBreak())
   append_line_art(ident,slug);continue
  if re.fullmatch(r'<span id="[^"]+"></span>',line):continue
  if not line or line.startswith('[^') or line.startswith('---') or line.startswith('# ') or line.startswith('By Ahimanikya') or line.startswith('## Footnotes') or line.startswith('## Sources'):continue
  if 'Suggest an update' in line or 'contribution' in line.lower() and line.startswith('<'):continue
  match=re.match(r'!\[([^]]*)\]\(([^)]+)\)',line)
  if match:
   while i<len(lines) and not lines[i].strip():i+=1
   caption=lines[i].strip().strip('*') if i<len(lines) and lines[i].strip().startswith('*') else match[1]
   if i<len(lines) and lines[i].strip().startswith('*'):i+=1
   imagepath=(p.parent/match[2]).resolve()
   if a.get('hero') and imagepath==(R/a['hero']['path']).resolve():continue
   block=figure(imagepath,caption,slug)
   iw,ih=ImageOps.exif_transpose(PILImage.open(imagepath)).size
   if block.image_frame_height>400 and story and isinstance(story[-1],Paragraph) and story[-1].style.name in ['h2','h3']:
    # Keep the section heading and callback with prose after a tall full-width image leaf.
    start=aside_start if aside_start is not None else len(story)-1
    section_opening=story[start:];del story[start:]
    if story and isinstance(story[-1],Paragraph) and story[-1].style.name in ['body','body-tight']:section_opening.insert(0,story.pop())
    story.extend([PageBreak(),block,PageBreak()]);story.extend(section_opening);aside_start=None
   else:
    aside_start=None
    if story and isinstance(story[-1],Paragraph) and story[-1].style.name in ['h2','h3']:
     heading=story.pop();block=KeepTogether([heading]+block._content)
    story.append(block)
   continue
  if line.startswith('|') and i<len(lines) and re.match(r'^\s*\|?\s*:?-{3}',lines[i]):
   rows=[line];i+=1
   while i<len(lines) and lines[i].strip().startswith('|'):rows.append(lines[i].strip());i+=1
   cells=[[c.strip() for c in row.strip('|').split('|')] for row in rows]
   # Transpose wide source tables into labelled per-row panels: full text, readable 6x9 type.
   headers=cells[0]
   for row in cells[1:]:
    data=[[para(headers[j],'small',slug),para(cell,'small',slug)] for j,cell in enumerate(row)]
    table=LongTable(data,colWidths=[WIDTH*.27,WIDTH*.73],hAlign='LEFT')
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(0,-1),HexColor('#eeeae2')),('LINEBELOW',(0,-1),(-1,-1),.5,HexColor('#aaa398')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story.extend([KeepTogether([table]),Spacer(1,10)])
   continue
  if line.startswith('## '):
   title=line[3:]
   if not companion:
    for item in narrative.get('callouts',[]):
     if item['slug']==slug and item['before_heading']==title:
      aside_start=len(story);story.extend([Spacer(1,8),callout(item,slug)])
   if title=='Watch and explore':watch_start=len(story)
   heading=para(title,'h2',slug)
   matches=[item for item in section_guide if item['slug']==slug and item['heading']==title and bool(item.get('companion',False))==companion]
   if len(matches)>1:raise ValueError('Multiple discovery entries for heading: '+title)
   if matches:
    item=matches[0];section_matches[item['id']]+=1
    heading.bookkey='section-'+item['id'];heading.booktitle=item['title'];heading.booklevel=1
   story.append(heading);continue
  if line.startswith('### '):story.append(para(line[4:],'h3',slug));continue
  if line.startswith('- '):story.append(para('- '+line[2:],'body',slug));continue
  chunk=[line]
  while i<len(lines) and lines[i].strip() and not lines[i].startswith(('#','!','- ','|')):
   chunk.append(lines[i].strip());i+=1
  text=' '.join(chunk)
  if narrative.get('viewing_note') and text in ROUTINE_VIEWING_NOTICES:
   replacement=ROUTINE_VIEWING_NOTICES[text]
   suppressed_viewing.append({'slug':slug,'text':text,'replacement':replacement})
   if not replacement:continue
   text=replacement
  paragraph=para(text,'body',slug)
  # Keep the first thought intact beneath Nirad's approved large portrait.
  story.append(KeepTogether([paragraph]) if slug=='nirad-mohapatra' and paragraphs==0 else paragraph);paragraphs+=1
  if slug=='lavanya-preeti' and len(story)>1 and isinstance(story[-2],Paragraph) and story[-2].getPlainText()=='Find the film in the catalogue':
   start=len(story)-2
   for j in range(start-1,max(-1,start-7),-1):
    if isinstance(story[j],Paragraph) and story[j].style.name=='h2':
     start=j;break
   if start>0 and isinstance(story[start-1],Paragraph):start-=1
   if start>0 and isinstance(story[start-1],Paragraph) and story[start-1].style.name in ['h2','h3']:start-=1
   story[start:]=[KeepTogether(story[start:])]
  if aside_start is not None:
   story[aside_start:]=[KeepTogether(flatten_flows(story[aside_start:]))];aside_start=None
  if paragraphs==1:
   for extra in additions.get('poetic_additions',[]):
    if extra['slug']==slug and extra['position']=='after opening paragraph':story.append(para(extra['text'],'body',slug))
 for extra in additions.get('poetic_additions',[]):
  if extra['slug']==slug and extra['position']=='before final transition':story.append(para(extra['text'],'body',slug))
 if slug in TIGHT_CHAPTERS and watch_start is None and all(isinstance(x,Paragraph) for x in story[-4:]):
  tail_start=len(story)-4
  if isinstance(story[tail_start-1],Paragraph) and story[tail_start-1].style.name in ['h2','h3']:tail_start-=1
  tail=story[tail_start:];story[tail_start:]=[KeepTogether(tail)]
 closing_count=3 if PRINT else 2
 if slug==order[-1] and all(isinstance(x,Paragraph) for x in story[-closing_count:]):
  closing=story[-closing_count:];del story[-closing_count:];story.append(KeepTogether(closing))
 if watch_start is not None:
  watch_block=[]
  for item in story[watch_start:]:
   watch_block.extend(item._content if isinstance(item,KeepTogether) else [item])
  if slug not in {'odia-ott','nandita-das'} and len(watch_block)<=5 and isinstance(story[watch_start-1],Paragraph):
   watch_start-=1;watch_block.insert(0,story[watch_start])
   if isinstance(story[watch_start-1],Paragraph) and story[watch_start-1].style.name in ['h2','h3']:
    watch_start-=1;watch_block.insert(0,story[watch_start])
  story[watch_start:]=[KeepTogether(watch_block)]
 # Keep a small final section together, including its heading and preceding paragraph.
 # This prevents a last sentence from taking a page of its own without binding a long section.
 if slug in CLOSING_FLOW_CHAPTERS:
  for j in range(len(story)-1,body_start-1,-1):
   if isinstance(story[j],Paragraph) and story[j].style.name in ['h2','h3']:
    candidate=story[j:]
    if len(candidate)<=4 and all(isinstance(f,Paragraph) for f in candidate):
     height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in candidate)
     if height<=260:story[j:]=[KeepTogether(candidate)]
    break
 # A short terminal listening/reading section should not become a links-only leaf.
 # Bound both the content and measured height; never bind a large prose section or image.
 terminal_titles={'Read her work','Read his work','Read and listen','Listen and explore','Essential Khoka Bhai listening','Find the film in the catalogue'}
 for j in range(len(story)-1,body_start-1,-1):
  if isinstance(story[j],Paragraph) and story[j].style.name in ['h2','h3']:
   if story[j].getPlainText() in terminal_titles and j>body_start:
    candidate=story[j-1:]
    if isinstance(story[j-1],Paragraph) and story[j-1].style.name in ['body','body-tight'] and len(candidate)<=6 and all(isinstance(f,Paragraph) for f in candidate):
     height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in candidate)
     if height<=260:story[j-1:]=[KeepTogether(candidate)]
   break
 return paragraphs

for index,slug in enumerate(order,1):
 a=entries[slug];p=R/a['source'];s=chapter_source(slug);body=re.sub(r'^---\n.*?\n---\n','',s,count=1,flags=re.S);body=re.sub(r'^\[\^[^]]+\]:.*$','',body,flags=re.M)
 body=body.split('## Further reading',1)[0]
 if slug=='odia-cinema' and narrative.get('overview'):body=narrative['overview']['opening_markdown']
 story.append(PageBreak());pn,pt=partmap[slug];chapter_start=len(story);part_label=para(f'PART {pn} · {pt.upper()}','part')
 if slug==plan['parts'][pn-1]['chapters'][0]:part_label.partkey=f'part-{pn}';part_label.parttitle=f'Part {pn} · {pt}'
 story.append(part_label);h=para(f'{index:02}  {a["title"]}','chapter');h.bookkey='ch-'+slug;h.booktitle=f'{index:02}  {short[slug]}';story.append(h)
 if slug==plan['parts'][pn-1]['chapters'][0] and narrative.get('part_intros',{}).get(pt):story.append(para(narrative['part_intros'][pt],'bridge'))
 cap=a.get('hero',{}).get('caption') or 'Illustration.'
 credit=a.get('hero',{}).get('credit',{})
 if credit:
  if not credit.get('creator') or not credit.get('source_url'):raise ValueError('Missing documentary credit: '+slug)
  has_licence=bool(credit.get('license'));has_licence_url=bool(credit.get('license_url'))
  if has_licence!=has_licence_url or (not has_licence and credit.get('rights_status')!='unverified'):raise ValueError('Missing documentary licence or recorded rights status: '+slug)
  cap+=' '+credit['creator']+'. [Source]('+credit['source_url']+')'
  if has_licence:cap+='; ['+credit['license']+']('+credit['license_url']+')'
  cap+='. '+credit.get('notes','')
 if a.get('hero',{}).get('credit_note'):cap+=' '+a['hero']['credit_note']
 if a.get('hero'):
  image_path=R/a['hero']['path'];iw,ih=ImageOps.exif_transpose(PILImage.open(image_path)).size
  hero_flow=figure(image_path,cap,slug,True)
  opener_flows=flatten_flows(story[chapter_start:]+[hero_flow])
  opener_height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in opener_flows)
  if hero_flow.image_frame_height>400 or opener_height>520:
   # Preserve a coherent title/introduction when a complete figure leaves no room for prose.
   running=Spacer(1,0);running.runningtitle=f'{index:02}  {short[slug]}'
   story[chapter_start:chapter_start]=[running,hero_flow,PageBreak()]
  else:story.append(hero_flow)
 paragraphs=render_body(body,slug)
 if slug in bridges:
  if isinstance(story[-1],KeepTogether):story.extend(story.pop()._content)
  previous=story.pop();closing=[previous,para(bridges[slug],'bridge',slug)]
  if story and isinstance(story[-1],Paragraph) and story[-1].style.name in ['h2','h3']:
   closing.insert(0,story.pop())
   if slug=='aadim-vichar' and story and isinstance(story[-1],Paragraph):closing.insert(0,story.pop())
  story.append(KeepTogether(closing))
 # Keep the OTT closing thought with its short access list, avoiding a links-only leaf.
 if slug=='odia-ott':
  for j in range(len(story)-1,chapter_start-1,-1):
   if isinstance(story[j],Paragraph) and story[j].getPlainText()=='Reach must become sustainable work':
    candidate=flatten_flows(story[j:])
    height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in candidate)
    print('OTT closing group height:',height,'paragraphs:',len(candidate),flush=True)
    if all(isinstance(f,Paragraph) for f in candidate) and height<=480:
     story[j:]=[KeepTogether(candidate)]
    break
 # For these three short endings, prefer a coherent section over a detached tail.
 # Include an existing closing bridge, but never bind images or more than 300pt.
 if slug in TAIL_SPACING_CHAPTERS:
  if isinstance(story[-1],KeepTogether) and all(isinstance(f,Paragraph) for f in flatten_flows([story[-1]])):
   story.extend(flatten_flows([story.pop()]))
  end=len(story);start=end
  for j in range(end-1,chapter_start-1,-1):
   if not isinstance(story[j],Paragraph):break
   if story[j].style.name in ['h2','h3']:
    start=j;break
  candidate=story[start:end]
  height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in candidate)
  if not candidate or height>300:
   start=end-2;candidate=story[start:end]
   if start>chapter_start and isinstance(story[start-1],Paragraph) and story[start-1].style.name in ['h2','h3']:
    start-=1;candidate=story[start:end]
  if candidate and all(isinstance(f,Paragraph) for f in candidate):
   height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in candidate)
   if height<=300:story[start:end]=[KeepTogether(candidate)]
 for vignette in book_tail_vignettes:
  if vignette['slug']==slug:story.append(TailVignette(vignette))
 chapters.append({'slug':slug,'source':a['source'],'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'book_body_sha256':hashlib.sha256(body.encode()).hexdigest(),'adaptation':'shortened opening; remaining survey in companion appendix' if slug=='odia-cinema' and narrative.get('overview') else 'canonical narrative with separately recorded reading aids','paragraphs':paragraphs,'notes':len(notes[slug])})
if narrative.get('overview',{}).get('companion_markdown'):
 story.append(PageBreak());h=para('Companion survey: the wider screen','chapter');h.bookkey='overview-companion';h.booktitle='Companion survey: the wider screen';story.append(h)
 story.append(para(f'The detailed survey continues here. Its numbered sources belong to Chapter {order.index("odia-cinema")+1}.','small'))
 render_body(narrative['overview']['companion_markdown'],'odia-cinema',True)
def guide_refs(item):
 assert item['slug'] in entries, 'Unknown guide reading'
 refs=item.get('source_refs',[{'slug':item['slug'],'source_note_id':item.get('source_note_id')}])
 assert isinstance(refs,list) and refs, 'Guide entry needs source references'
 seen=set()
 for ref in refs:
  pair=(ref['slug'],ref['source_note_id'])
  assert pair not in seen, 'Duplicate guide source reference'
  assert pair[0] in notes and pair[1] in notes[pair[0]], 'Unknown guide source note'
  seen.add(pair)
 return refs

def guide_entry(item,heading):
 references=[]
 for ref in guide_refs(item):
  owner,key=ref['slug'],ref['source_note_id']
  references.append(f'<link href="#note-{owner}-{key}" color="{LINK_COLOR}">Ch. {order.index(owner)+1}, note {numbers[owner][key]}</link>')
 destination=item['slug']
 heading_link=f'<link href="#ch-{destination}" color="{LINK_COLOR}">'+inline(heading,destination)+'</link>'
 page_link=(f' <link href="#ch-{destination}" color="{LINK_COLOR}">Reading p. {page_map.get("ch-"+destination,"000")}</link>.' if PRINT else '')
 flows=[Paragraph(heading_link,styles['h3']),Paragraph(inline(item['text'],destination)+' '+ '; '.join(references)+'.'+page_link,styles['body'])]
 height=sum(f.wrap(WIDTH,559)[1]+f.getSpaceBefore()+f.getSpaceAfter() for f in flows)
 if height<=100:story.append(KeepTogether(flows))
 else:story.extend(flows)

for item in narrative.get('people_guide',[])+narrative.get('timeline',[]):guide_refs(item)
years=[item['sort_year'] for item in narrative.get('timeline',[])]
assert all(isinstance(year,(int,float)) and not isinstance(year,bool) for year in years), 'Timeline sort_year must be numeric'
assert years==sorted(years), 'Timeline must be chronological by sort_year'
if narrative.get('people_guide') or narrative.get('timeline'):
 story.append(PageBreak());h=para('People, work and selected milestones','chapter');h.bookkey='reference-guide';h.booktitle='People, work and selected milestones';story.append(h)
 appendix_paths=[path for path in narrative.get('reading_paths',[]) if path.get('primary') is not True]
 if appendix_paths:
  story.append(para('Choose a thread','h2'))
  for path in appendix_paths:
   story.append(para(path['title'],'h3'))
   story.append(para(path['text'],'body'))
   for destination in path['chapters']:
    story.append(para('['+short[destination]+']('+entries[destination]['route']+')','body'))
 if narrative.get('reference_guide_intro'):story.append(para(narrative['reference_guide_intro'],'body'))
 if narrative.get('people_guide'):
  story.append(para('People and their work','h2'))
  group=None
  for item in narrative['people_guide']:
   if item.get('group') and item['group']!=group:
    group=item['group'];story.append(para(group,'h2'))
   guide_entry(item,item['label']+' · '+item['relationship'])
 if narrative.get('timeline'):
  milestone_start=len(story)
  story.append(para('Selected milestones','h2'));story.append(para('Dates mark different kinds of events; releases, awards, institutions and restorations are identified separately.','small'))
  for index,item in enumerate(narrative['timeline']):
   guide_entry(item,str(item['date'])+' · '+item['kind'].replace('-',' ').capitalize())
   if index==0:
    story[milestone_start:]=[KeepTogether(flatten_flows(story[milestone_start:]))]
# Linked chapter-grouped endnotes
story.append(PageBreak());h=para('Sources and reading notes','chapter');h.bookkey='sources';h.booktitle='Sources and reading notes';story.append(h)
story.append(para('Numbered notes give sources and image credits, grouped by chapter. Full source links accompany the articles at projectodisha.org/cinema.' if PRINT else 'Numbered notes give sources and image credits. Return links lead to the cited passages.','small'))
for index,slug in enumerate(order,1):
 if not notes[slug]:continue
 story.append(para(f'{index:02}  {short[slug]}','source-heading'))
 for key,note in notes[slug].items():
  n=numbers[slug][key];return_dest=f'ref-{slug}-{key}-1' if refseq[slug].get(key) else 'ch-'+slug
  text=f'<a name="note-{slug}-{key}"/><b>{n}.</b> '+inline(note,slug,False,print_address=key.startswith('cinema-image-'))
  if not PRINT:text+=f' <link href="#{return_dest}" color="#8c3c2e">Return</link>'
  story.append(Paragraph(text,styles['note']))

if PRINT:
 story.append(PageBreak());h=para('Selected links','chapter');h.bookkey='printed-sources';h.booktitle='Selected links';story.append(h)
 story.append(para('S numbers identify addresses cited in the text and image credits.','small'))
 # A hanging label column cannot break away from the start of its address.
 for url,n in url_directory.items():
  source_row=LongTable([[Paragraph('<b>S'+str(n)+'.</b>',styles['source-address']),Paragraph(html.escape(quote(url,safe=':/?&=%#')),styles['source-address'])]],colWidths=[36,WIDTH-36],hAlign='LEFT')
  source_row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(0,-1),6),('RIGHTPADDING',(1,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
  story.append(source_row)
story.extend([Spacer(1,20),CondPageBreak(130)]);h=para('Edition note','chapter');h.bookkey='credits';h.booktitle='Edition note';story.append(h)
story.append(para('Cover illustration: a symbolic reading of the household world associated with Maya Miriga; not a film still. Cover artwork and design are credited to Project Odisha.','small'))
for p in ['Image sources and available creator and licence credits appear in the numbered notes. Original line drawings accompany selected passages.',f'{len(order)} readings in {len(plan["parts"])} parts. The longer overview appears in the companion survey. Suggestions and corrections are welcome through [Project Odisha](https://projectodisha.org/cinema/).','Typography: Source Serif 4 and Noto Serif Oriya, licensed under the SIL Open Font License.','[Editorial process](https://projectodisha.org/about/editorial-process/).',f'Ahimanikya Satapathy · Project Odisha · {DATE_TEXT}.']:
 if PRINT and '[Project Odisha](https://projectodisha.org/cinema/)' in p:
  p=p.replace('[Project Odisha](https://projectodisha.org/cinema/)','[projectodisha.org/cinema/](https://projectodisha.org/cinema/)')
  story.append(Paragraph(inline(p,print_address=False),styles['small']))
 else:story.append(para(p,'small'))
if PRINT:story.append(para('Printing: 6 x 9 inch pages, no bleed. Print at 100% on 6 x 9 inch stock, or ask a print shop to impose and trim to this size. For duplex printing use the long-edge setting. Mirrored inner margins allow binding space. This reading edition is not a printer-specific press-ready, CMYK or PDF/X file. The final blank verso, if present, keeps the page count even.','small'))
doc=Book(str(OUT),pagesize=(432,648),title='Odia Cinema: A Living Screen',author='Ahimanikya Satapathy',subject='Stories, People and the Places Between',allowSplitting=1)
if len(line_art_placements)!=len(narrative.get('line_art',[])):raise ValueError('Unresolved line-art placements; check section headings and article slugs')
if any(count!=1 for count in section_matches.values()):raise ValueError('Discovery sections must appear exactly once: '+repr(section_matches))
doc.multiBuild(story)
if sum(k.startswith('part-') for k in doc.chapter_pages)!=len(plan['parts']):raise ValueError('Missing part contents entries')
(TMP/'page-map.json').write_text(json.dumps(doc.chapter_pages,indent=2))
if args.layout_only:
 print(json.dumps({'pages':doc.page,'page_map':doc.chapter_pages},indent=2));sys.exit(0)
from pypdf import PdfWriter
covers=R/'output/pdf/odia-cinema-covers-2026-10-27.pdf'
writer=PdfWriter(clone_from=str(OUT))
# Document language is useful metadata; it does not imply tagged-PDF compliance.
from pypdf.generic import NameObject, TextStringObject
writer.root_object[NameObject("/Lang")]=TextStringObject("en")
if covers.exists():
 coverdoc=PdfReader(str(covers));assert len(coverdoc.pages)==2
 writer.pages[0].merge_page(coverdoc.pages[0])
 if PRINT and (len(writer.pages)+1)%2:writer.add_blank_page(width=432,height=648)
 writer.add_page(coverdoc.pages[1])
elif PRINT and len(writer.pages)%2:writer.add_blank_page(width=432,height=648)
with OUT.open('wb') as f:writer.write(f)
reader=PdfReader(str(OUT));pdf=pdfium.PdfDocument(str(OUT));render=TMP/'pages';render.mkdir(exist_ok=True)
for stale in list(render.glob('page-*.png'))+list(TMP.glob('contact-*.jpg')):stale.unlink()
for i,p in enumerate(pdf):p.render(scale=1.5).to_pil().save(render/f'page-{i+1:03}.png')
thumbs=[]
for i in range(len(pdf)):
 im=PILImage.open(render/f'page-{i+1:03}.png');im.thumbnail((216,324));thumbs.append(im.copy())
from PIL import ImageDraw
for offset in range(0,len(thumbs),12):
 sheet=PILImage.new('RGB',(936,1110),'#ddd9d1');draw=ImageDraw.Draw(sheet)
 for k,im in enumerate(thumbs[offset:offset+12]):
  x=12+(k%4)*234;y=12+(k//4)*370;sheet.paste(im,(x,y));draw.text((x,y+329),f'Page {offset+k+1}',fill='black')
 sheet.save(TMP/f'contact-{offset//12+1:02}.jpg',quality=90)
for chapter in chapters:chapter['notes']=len(notes[chapter['slug']])
record={'edition':args.edition,'mirrored_margins':PRINT,'inner_margin_pt':54 if PRINT else 42,'outer_margin_pt':42,'source_directory_entries':len(url_directory),'print_directory_mode':'body-and-image-credit-links' if PRINT else 'not-applicable','print_directory_policy':'Bibliographic notes retain full clickable URLs without duplicate S-address entries; body/viewing links and image source/licence links retain printed addresses.','date':args.date,'revision':args.revision,'edition_key':EDITION_KEY,'status':'built_pending_visual_review','pdf':str(OUT.relative_to(R)),'pdf_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'pages':len(reader.pages),'chapters':chapters,'chapter_pages':doc.chapter_pages,'section_guide_matches':section_matches,'image_placements':images,'line_art_placements':line_art_placements,'tail_vignette_placements':tail_vignette_placements,'image_credit_notes':image_credit_notes,'notes':sum(len(x) for x in notes.values()),'citation_pairs':sum(sum(x.values()) for x in refseq.values()),'fonts':['Source Serif 4','Noto Serif Oriya'],'shaping':'HarfBuzz via ReportLab shaping=True, embedded static Odia font','all_pages_rendered':True,'render_dir':str(render.relative_to(R)),'contact_sheets':[str(p.relative_to(R)) for p in sorted(TMP.glob('contact-*.jpg'))],'cover_pdf':str(covers.relative_to(R)) if covers.exists() else None,'cover_sha256':hashlib.sha256(covers.read_bytes()).hexdigest() if covers.exists() else None,'cover_art_effective_dpi':170.67,'cover_text':'vector','print_embedding':'Original images retained; configured display crop clipped in PDF only. Images above300ppi downsampled for their drawn size to JPEG94; no source upscaling or replacement.','print_press_ready':False,'canonical_sources_unchanged_by_book_builder':True,'source_binding_scope':'Hashes bind to the final revised canonical sources read during this build, not the pre-revision edition.','book_adaptation':True,'narrative_plan_sha256':hashlib.sha256(narrative_path.read_bytes()).hexdigest() if narrative else None,'suppressed_repeated_viewing_notices':suppressed_viewing,'book_section_omissions':book_section_omissions,'printed_page_map_used':page_map,'chapter_page_references_stable':not PRINT or page_map==doc.chapter_pages,'adaptation_section_map':narrative.get('overview',{}).get('section_map',{}),'rendered_bridge_ids':list(bridges),'unused_bridge_options':[slug for slug in narrative.get('bridges',{}) if slug not in bridges],'reading_aids':{'primary_path':{'destination':'primary-reading-path','title':primary_path['title'],'slugs':primary_path['chapters'],'measured_height_pt':primary_path_height,'page':doc.chapter_pages.get('primary-reading-path')} if primary_path else None,'callouts':len(narrative.get('callouts',[])),'bridges':len(bridges),'people':len(narrative.get('people_guide',[])),'milestones':len(narrative.get('timeline',[]))},'artifact_marker':artifact_marker,'browser_used':False,'image_layout_configuration':str(image_layout_path.relative_to(R)),'image_layout_sha256':hashlib.sha256(image_layout_path.read_bytes()).hexdigest()}
(TMP/('book-build-'+EDITION_KEY+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:record[k] for k in ['pages','notes','citation_pairs','chapter_pages']},indent=2))
