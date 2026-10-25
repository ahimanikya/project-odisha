"""Build the reader's print edition. Requires reportlab, fonttools[woff], uharfbuzz, svglib.
The canonical research records remain separate from this reading edition.
"""
from pathlib import Path
import json, re, tempfile
from io import BytesIO
from PIL import Image as RasterImage
from urllib.parse import urlsplit, urlunsplit, parse_qs, quote
from html import escape
from fontTools.ttLib import TTFont as Font
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, KeepInFrame, KeepTogether, Flowable
from svglib.svglib import svg2rlg
from build import load_library, reading_caption
ROOT=Path(__file__).resolve().parent

class FlowPage(Flowable):
    def __init__(self, placements, width, height):
        Flowable.__init__(self);self.placements=placements;self.width=width;self.height=height
    def draw(self):
        c=self.canv;shift=6 if c.getPageNumber()%2 else -6
        for item in self.placements:
            blocks,image,caption=item['unit'];x=item['column']*(self.width+20)/2+shift;y=self.height-item['top'];cw=(self.width-20)/2
            def draw_image(y):
                ih=image.drawHeight if isinstance(image,Image) else image.height;iw=image.drawWidth if isinstance(image,Image) else image.width
                y-=ih;image.drawOn(c,x+(cw-iw)/2,y);y-=5
                _,h=caption.wrap(cw,self.height);y-=h;caption.drawOn(c,x,y)
                return y
            image_first=bool(image and item.get('image_position')=='above')
            if image_first:y=draw_image(y)-8
            for block in blocks:
                _,h=block.wrap(cw,self.height);y-=h;block.drawOn(c,x,y)
                if getattr(block,'source_url',None):c.linkURL(block.source_url,(x,y,x+cw,y+h),relative=1,thickness=0)
                y-=block.getSpaceAfter()
            if image and not image_first:y=draw_image(y-8)
            if y < -0.01:raise ValueError('Measured reading unit overflow')

def unit_height(unit,cw):
    blocks,image,caption=unit
    h=sum(b.wrap(cw,10000)[1]+b.getSpaceAfter() for b in blocks)
    if image:h+=8+(image.drawHeight if isinstance(image,Image) else image.height)+5+caption.wrap(cw,10000)[1]
    return h

def make_book(root=ROOT):
    root=Path(root);data=load_library(root);design=json.loads((root/'research-design.json').read_text())
    with tempfile.TemporaryDirectory() as td:
        for name,filename in [('English','SourceSerif4-Variable.woff2'),('Odia','NotoSerifOriya-Variable.woff2')]:
            f=Font(root/'assets'/filename);axes={a.axisTag:a.defaultValue for a in f['fvar'].axes};axes['wght']=400
            f=instantiateVariableFont(f,axes,inplace=True);f.flavor=None;target=Path(td)/(name+'.ttf');f.save(target);pdfmetrics.registerFont(TTFont(name,str(target),shapable=True))
        width,height=A4; usable=width-84; bodyheight=height-90
        styles={
          'body':ParagraphStyle('body',fontName='English',fontSize=10.5,leading=15,spaceAfter=7,shaping=True),
          'odia':ParagraphStyle('odia',fontName='Odia',fontSize=12,leading=20,spaceAfter=10,shaping=True),
          'title':ParagraphStyle('title',fontName='Odia',fontSize=27,leading=43,spaceAfter=18,shaping=True),
          'saying':ParagraphStyle('saying',fontName='Odia',fontSize=17,leading=28,spaceAfter=12,shaping=True),
          'heading':ParagraphStyle('heading',fontName='English',fontSize=20,leading=26,spaceAfter=14,shaping=True),
          'label':ParagraphStyle('label',fontName='English',fontSize=8.5,leading=12,textColor=colors.HexColor('#87503b'),spaceBefore=6,spaceAfter=4,shaping=True),
          'small':ParagraphStyle('small',fontName='English',fontSize=8,leading=11,spaceAfter=6,shaping=True)}
        def p(text,kind='body'):
            # Preserve Odia shaping in mixed-language credits and text.
            chunks=re.split(r'([\u0b00-\u0b7f]+)',str(text));s=''.join('<font name="Odia">'+escape(c)+'</font>' if re.search(r'[\u0b00-\u0b7f]',c) else escape(c) for c in chunks)
            return Paragraph(s,styles[kind])
        story=[Spacer(1,90),p('Sayings and Proverbs -','heading'),p('ଓଡ଼ିଆ ଢଗଢମାଳି','title'),p('108 Dhaga in Odia and English'),Spacer(1,22),p('By Ahimanikya Satapathy'),Spacer(1,35),p('Project Odisha · Reading edition'),PageBreak(),p('ଢଗଢମାଳି ବିଷୟରେ','title'),p('About this collection','heading')]
        for x in data['book_intro']['odia']:story.append(p(x,'odia'))
        for x in data['book_intro']['english']:story.append(p(x))
        story += [Spacer(1,20),p('Read by theme or follow the Dhaga in order. The examples are original illustrations of everyday use.'),PageBreak(),p('Contents','heading')]
        byid={e['id']:e for e in data['entries']}; ordered=[]; next_page=4; frames=[]; entry_offset=0
        for ch in design['shelves']:
            ordered.extend(byid[i] for i in ch['entry_ids']);entry_offset+=len(ch['entry_ids'])
        story += [Spacer(1,20),p('Each reading includes the Dhaga, its literal sense, meaning and an original usage example. Source acknowledgements and reuse rights are collected at the end.','small')]
        primary={}
        front_styles=styles
        styles={k:v.clone('card-'+k) for k,v in styles.items()}
        cardwidth=(usable-12-20)/2
        styles['body'].fontSize=10.5; styles['body'].leading=14; styles['body'].spaceAfter=5
        styles['odia'].fontSize=10.5; styles['odia'].leading=16; styles['odia'].spaceAfter=7
        styles['saying'].fontSize=14; styles['saying'].leading=22; styles['saying'].spaceAfter=8
        styles['heading'].fontSize=14; styles['heading'].leading=18; styles['heading'].spaceAfter=8
        styles['label'].fontSize=7.5; styles['label'].leading=10; styles['label'].spaceAfter=3
        styles['small'].fontSize=7.5; styles['small'].leading=10
        units=[]
        processed=0
        for ch in design['shelves']:
            for j,ident in enumerate(ch['entry_ids']):
                e=byid[ident];blocks=[p(ch['label']+' · Dhaga '+e['id'].rsplit('-',1)[1],'label'),p(e['odia'],'saying'),p(e['title'],'heading'),p(e.get('meaning_odia',''),'odia')]
                for label,key in [('Literal meaning','literal_meaning'),('Meaning','explanation'),('An example · original','usage_example'),('In context','cultural_context')]:
                    blocks += [p(label,'label'),p(e[key])]
                g=e.get('graphic'); im=None; caption=None
                if g:
                    src=root/g['src']
                    if src.suffix=='.svg':
                        im=svg2rlg(str(src));scale=min(cardwidth/im.width,190/im.height);im.width*=scale;im.height*=scale;im.scale(scale,scale)
                    else:
                        raster=RasterImage.open(src).convert('RGB');raster.thumbnail((1400,1000));encoded=BytesIO();raster.save(encoded,format='JPEG',quality=90);encoded.seek(0)
                        im=Image(encoded);scale=min(cardwidth/im.imageWidth,190/im.imageHeight);im.drawWidth=im.imageWidth*scale;im.drawHeight=im.imageHeight*scale
                    caption=p(reading_caption(g['caption']),'small')
                units.append({'id':ident,'chapter':ch['label'],'unit':(blocks,im,caption)})
                for sid in dict.fromkeys(w['source_id'] for w in e['witnesses']+e.get('variants',[]) if w.get('source_id')):
                    primary.setdefault(sid,[]).append(e['id'].rsplit('-',1)[1])
        # First pass: measure intact reading units and pack down left, then right.
        pages=[];placed=[];column=0;top=0;chapter_pages={};packing=[]
        available=bodyheight-12
        for item in units:
            h=unit_height(item['unit'],cardwidth)
            if h>available:raise ValueError(f"Unit {item['id']} exceeds a column: {h}")
            if top and top+h>available:
                if column==0:column=1;top=0
                else:pages.append(placed);placed=[];column=0;top=0
            item.update(column=column,top=top,height=h,image_position=('above' if column==0 else 'below') if item['unit'][1] else None)
            page=4+len(pages);chapter_pages.setdefault(item['chapter'],page)
            packing.append({k:v for k,v in item.items() if k!='unit'}|{'page':page})
            placed.append(item);top+=h+22
        if placed:pages.append(placed)
        # Second pass: contents use measured chapter starts, then draw measured pages.
        insert_at=next(i for i,v in enumerate(story) if isinstance(v,Paragraph) and v.getPlainText()=='Contents')+1
        story[insert_at:insert_at]=[p(f"{ch['label']} · {len(ch['entry_ids'])} Dhaga · page {chapter_pages[ch['label']]}") for ch in design['shelves']]
        for placements in pages:story.extend([PageBreak(),FlowPage(placements,usable-12,available)])
        styles=front_styles
        sources={s['id']:s for s in data['sources']}
        headers=[p('Sources & Credits','heading'),p(data['license'],'small'),Paragraph('<link href="https://creativecommons.org/licenses/by-sa/4.0/" color="#87503b">CC BY-SA4.0 licence</link>',styles['small']),p(f'Wikimedia source wording is credited below. Project Odisha supplies original translations, explanations and examples. Illustrations: Project Odisha, contemporary interpretations accompanying {sum(bool(e.get("graphic")) for e in data["entries"])} Dhaga, CC BY-SA4.0; detailed provenance retained with the digital book. Fonts: Noto Serif Oriya and Source Serif4, SIL Open Font License.','small')]
        credit_units=[]
        for sid,ids in primary.items():
            source=sources[sid];url=quote(source['url'],safe=':/?&=%#');parts=urlsplit(url)
            creator=source.get('creator') or source.get('author') or ('Odia Wiktionary contributors' if 'wiktionary' in parts.netloc else 'Wikimedia Incubator contributors' if 'incubator.wikimedia' in parts.netloc else 'Creator not established in source record')
            if not isinstance(creator,str):creator=json.dumps(creator,ensure_ascii=False)
            credit_title_style=styles['body'].clone('credit-title',fontName='Odia' if re.search(r'[\u0b00-\u0b7f]',source['title']) else 'English')
            title=Paragraph(escape(source['title']),credit_title_style)
            title.source_url=url
            blocks=[title,p(creator+' · Dhaga '+', '.join(sorted(ids,key=int)),'small')]
            if not ('wiktionary' in parts.netloc or 'incubator.wikimedia' in parts.netloc):blocks.append(p(source['rights'],'small'))
            credit_units.append((blocks,None,None))
        header_height=sum(v.wrap(usable-12,10000)[1]+v.getSpaceAfter() for v in headers)+16
        credit_pages=[];group=[];column=0;top=0;limit=available-header_height
        for unit in credit_units:
            h=unit_height(unit,cardwidth)
            if top and top+h>limit:
                if column==0:column=1;top=0
                else:credit_pages.append(group);group=[];column=0;top=0;limit=available
            if h>limit:raise ValueError('Credit entry too tall')
            group.append({'unit':unit,'column':column,'top':top});top+=h+9
        if group:credit_pages.append(group)
        class CreditPage(Flowable):
            def __init__(self,placements,first):
                Flowable.__init__(self);self.width=usable-12;self.height=available;self.placements=placements;self.first=first
            def draw(self):
                if self.first:
                    y=available
                    for block in headers:
                        _,h=block.wrap(usable-12,available);y-=h;block.drawOn(self.canv,0,y);y-=block.getSpaceAfter()
                FlowPage(self.placements,usable-12,available-header_height if self.first else available).drawOn(self.canv,0,0)
        for n,placements in enumerate(credit_pages):story.extend([PageBreak(),CreditPage(placements,n==0)])
        out=root/'odia-dhaga-book.pdf'
        def page_number(c,doc):
            c.saveState();c.setFont('English',8);c.setFillColor(colors.HexColor('#665c52'));c.drawCentredString(width/2,28,str(doc.page));c.restoreState()
        SimpleDocTemplate(str(out),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=43,bottomMargin=47,title='Sayings and Proverbs - ଓଡ଼ିଆ ଢଗଢମାଳି',author='Ahimanikya Satapathy').build(story,onFirstPage=page_number,onLaterPages=page_number)
        (root/'packing-report.json').write_text(json.dumps({'entries':len(units),'reading_pages':len(pages),'chapter_pages':chapter_pages,'placements':packing,'shrink':1,'body_font_size':10.5,'column_width':cardwidth,'column_height':available,'mirrored_margins_pt':{'inner':54,'outer':42}},indent=2)+'\n')
        print('Reading pages:',len(pages),'units:',len(units),'shrink:',1)
        return out
if __name__=='__main__':print(make_book())
