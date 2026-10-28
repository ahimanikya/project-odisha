from pathlib import Path
import sys,json,hashlib
R=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(R.parent/'prahallad-nataka-research/tmp/pdfs/deps'))
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from pypdf import PdfReader
from fontTools.pens.basePen import BasePen
from fontTools.svgLib.path import parse_path
import xml.etree.ElementTree as ET
class CanvasPen(BasePen):
 def __init__(self,path): super().__init__(None); self.path=path
 def _moveTo(self,p): self.path.moveTo(*p)
 def _lineTo(self,p): self.path.lineTo(*p)
 def _curveToOne(self,a,b,d): self.path.curveTo(*a,*b,*d)
 def _closePath(self): self.path.close()
def logo(x,y,width,tone='colour'):
 svg=ET.parse(R/f'projects/site/public/assets/brand-v4/project-odisha-en-{tone}.svg').getroot()
 c.saveState();c.translate(x,y+width*140/850);c.scale(width/850,-width/850)
 def visit(node,fill='#000000'):
  fill=node.get('fill',fill)
  if node.tag.endswith('path'):
   path=c.beginPath();parse_path(node.get('d'),CanvasPen(path));c.setFillColor(HexColor(fill));c.drawPath(path,fill=1,stroke=0,fillMode=1)
  for child in node: visit(child,fill)
 visit(svg);c.restoreState()
fontdir=R/'tools/cinema-book/fonts'
for name,f in [('Serif','SourceSerif4-Regular.ttf'),('SerifBold','SourceSerif4-Bold.ttf'),('SerifItalic','SourceSerif4-It.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fontdir/f),shapable=True))
pdfmetrics.registerFontFamily('Serif',normal='Serif',bold='SerifBold',italic='SerifItalic',boldItalic='SerifBold')
pdfmetrics.registerFont(TTFont('Odia',str(R/'tmp/pdfs/fonts/NotoSerifOriya-Regular.ttf'),shapable=True))
pdfmetrics.registerFont(TTFont('Label','/System/Library/Fonts/Supplemental/Arial.ttf'))
W,H=432,648
ivory='#F7F1E6';ink='#193344';rust='#9B4A30'
out=R/'output/pdf/odia-cinema-covers-2026-10-27.pdf'
c=canvas.Canvas(str(out),pagesize=(W,H),pageCompression=1)
c.setTitle('Odia Cinema: A Living Screen - front and back covers')
c.setAuthor('Ahimanikya Satapathy');c.setSubject('Project Odisha, cover proof, 6 x 9 inch trim size')
def text(t,x,y,size,font='Serif',color=ink,align='left',width=342,leading=None):
 p=Paragraph(t,ParagraphStyle('cover',fontName=font,fontSize=size,leading=leading or size*1.33,textColor=HexColor(color),alignment={'left':0,'center':1}[align],shaping=(font=='Odia')))
 _,h=p.wrap(width,H);p.drawOn(c,x,y-h);return y-h
c.drawImage(str(R/'kb/research/media/cinema-book/a-living-screen-cover-art-v2.png'),0,0,width=W,height=H)
logo(131,602,170,'colour')
text('ଓଡ଼ିଆ ସିନେମା',45,588,17,'Odia',ink,'center')
text('Odia Cinema',36,551,32,'Serif',ink,'center',360)
text('A Living Screen',27,508,37,'Serif',ink,'center',378)
text('Stories, People and the Places Between',36,457,11.6,'SerifItalic',ink,'center',360)
text('AHIMANIKYA SATAPATHY',40,32,9.4,'Label',ink,'center',352)
c.showPage()
c.setFillColor(HexColor(ink));c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(HexColor('#C28A61'));c.rect(45,600,40,2,fill=1,stroke=0)
y=text('A language. A people.<br/>A living screen.',45,577,28,'Serif',ivory,leading=33)
blurb='A film begins with people: someone who writes, someone who listens, and others willing to bring a story to the screen. <i>Odia Cinema: A Living Screen</i> follows those connections across literature, performance, radio, film, television and streaming.<br/><br/>From the household world of <i>Maya Miriga</i> to the journeys of <i>DAMaN</i> and <i>Pratikshya</i>, these readings explore the work behind recognition, the search for audiences and the care that lets older films be seen again. They invite us to enjoy what has been made, and consider how the next good story might reach its audience.'
y=text(blurb,45,y-26,11.1,'Serif',ivory,leading=15.5)
c.setStrokeColor(HexColor('#647880'));c.setLineWidth(.5);c.line(45,y-26,387,y-26)
text('Ahimanikya Satapathy',45,y-46,18,'SerifBold',ivory,leading=22)
portrait_top=y-81
c.drawImage(str(R/'kb/research/media/cinema-book/ahimanikya-satapathy-portrait.png'),45,portrait_top-86,width=86,height=86)
bio='Ahimanikya Satapathy, founder and editor-in-chief of Project Odisha, connects research, local knowledge and storytelling. His interest in Odisha’s people, language, arts and culture shapes this book: an invitation to discover the people behind cinema and imagine its possibilities.'
bio_end=text(bio,147,portrait_top,10.3,'Serif',ivory,width=240,leading=14.5)
assert bio_end>159, bio_end
text('projectodisha.org',45,59,10,'Label','#DDB796')
text('PROJECT ODISHA',45,151,9,'Label','#DDB796',leading=12)
project_end=text('A growing collection of Odisha’s stories and knowledge, welcoming residents, the diaspora and curious readers everywhere. A place to rediscover heritage, share perspectives and imagine what comes next.',45,130,10.1,'Serif',ivory,leading=14)
assert project_end>70, project_end
c.linkURL('https://projectodisha.org/',(45,44,210,60),relative=0)
c.showPage();c.save()
r=PdfReader(out);assert len(r.pages)==2
assert 'A Living Screen' in r.pages[0].extract_text();assert 'Ahimanikya Satapathy, founder' in r.pages[1].extract_text()
record={'title':'Odia Cinema: A Living Screen','subtitle':'Stories, People and the Places Between','author':'Ahimanikya Satapathy','date':'2026-10-27','pdf':str(out.relative_to(R)),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'pages':2,'trim_inches':[6,9],'fonts':['Source Serif 4','Noto Serif Oriya','Arial labels'],'art':{'file':'kb/research/media/cinema-book/a-living-screen-cover-art-v2.png','kind':'original generated symbolic illustration','mode':'Human Natural / Poetic Natural','inspiration':'Domestic life, family and belonging associated with Maya Miriga; not a still or reconstruction','pixels':[1024,1536],'effective_ppi_at_full_trim':170.67,'rights':'No third-party film still reproduced'},'press_limits':['Trim-size printable cover proof; no printer-specific spine, bleed or color profile','No ISBN assigned or printed'],'brand':{'front':'projects/site/public/assets/brand-v4/project-odisha-en-colour.svg','back':None,'method':'Original outlined vector paths preserved. Front restores original centred170pt colour signature above heading; back balances an author portrait/profile with a concise Project Odisha introduction and website; no back logo. Earlier centred colour front restored at user request; balanced author/project back retained.'},'back_copy_source':'Founder public profile (projects/site/src/pages/founder.astro) and user-stated book purpose; no personal claims beyond documented editorial role','portrait':{'file':'kb/research/media/cinema-book/ahimanikya-satapathy-portrait.png','sha256':hashlib.sha256((R/'kb/research/media/cinema-book/ahimanikya-satapathy-portrait.png').read_bytes()).hexdigest(),'source':'Previously user-supplied asset: output/social/sashisena/carousel-v2/assets/ahimanikya.png','source_record':'output/social/sashisena/carousel-v2/asset-provenance.json','kind':'User-supplied watercolor-treated portrait; not an untreated photograph','treatment':'Embedded intact without face regeneration or retouching','authorization':'User explicitly requested their photo on the back cover, 27 October 2026','placed_inches':[1.1944,1.1944],'effective_ppi':502.33},'review':'pending rendered visual inspection'}
(R/'kb/research/media/cinema-book/cover-provenance-2026-10-27.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(out)
