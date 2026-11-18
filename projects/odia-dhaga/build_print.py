"""Build the reader's print edition. Requires reportlab, fonttools[woff], uharfbuzz, svglib.
The canonical research records remain separate from this reading edition.
"""
from pathlib import Path
import json, re, tempfile, hashlib
from io import BytesIO
from PIL import Image as RasterImage
from urllib.parse import urlsplit, urlunsplit, parse_qs, quote
from html import escape
from fontTools.ttLib import TTFont as Font
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab import rl_config
# Binary PDF streams preserve the compressed image bytes without ASCII85 overhead.
rl_config.useA85 = 0
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, KeepInFrame, KeepTogether, Flowable
from svglib.svglib import svg2rlg
from build import load_library, reading_caption, book_cover, intro_source_ids
ROOT=Path(__file__).resolve().parent
# Reviewed exception: preserve the complete critical bilingual reading at normal type size.
FULL_WIDTH_READING_IDS=frozenset({'POD-DHAGA-540', 'POD-DHAGA-524', 'POD-DHAGA-534', 'POD-DHAGA-535', 'POD-DHAGA-550', 'POD-DHAGA-520', 'POD-DHAGA-481', 'POD-DHAGA-454', 'POD-DHAGA-428', 'POD-DHAGA-431', 'POD-DHAGA-365', 'POD-DHAGA-303', 'POD-DHAGA-268', 'POD-DHAGA-269', 'POD-DHAGA-280', 'POD-DHAGA-285', 'POD-DHAGA-288', 'POD-DHAGA-293', 'POD-DHAGA-252', 'POD-DHAGA-253', 'POD-DHAGA-254', 'POD-DHAGA-246', 'POD-DHAGA-248', 'POD-DHAGA-236', 'POD-DHAGA-235', 'POD-DHAGA-241', 'POD-DHAGA-243', "POD-DHAGA-223", "POD-DHAGA-224", "POD-DHAGA-225", "POD-DHAGA-226", "POD-DHAGA-227", "POD-DHAGA-220", "POD-DHAGA-221", "POD-DHAGA-222", "POD-DHAGA-199", "POD-DHAGA-200", "POD-DHAGA-202", "POD-DHAGA-204", "POD-DHAGA-206", "POD-DHAGA-214", "POD-DHAGA-213", "POD-DHAGA-212", "POD-DHAGA-216", "POD-DHAGA-218", "POD-DHAGA-215", "POD-DHAGA-219", "POD-DHAGA-217"})

def print_raster_bytes(src, entry_id):
    """Keep the original edition encoding; reduce only the reviewed new art batch."""
    number = int(entry_id.rsplit('-', 1)[1])
    quality = 80 if 302 <= number <= 550 else 90
    raster = RasterImage.open(src).convert('RGB')
    raster.thumbnail((1400, 1000))
    encoded = BytesIO()
    raster.save(encoded, format='JPEG', quality=quality)
    encoded.seek(0)
    return encoded

from reader_content import variant_explanation, VARIANT_EXPLANATION_END, VARIANT_EXPLANATION_EXTRA, VARIANT_SHORT_EXPLANATIONS

def variant_reading_blocks(chapter, ident, number, variant, paragraph):
    """Keep recorded wording and its explanation, without research administration."""
    blocks=[paragraph(chapter+' · Dhaga '+ident.rsplit('-',1)[1]+' · Variant '+str(number),'label'),
            paragraph(variant['odia'],'saying')]
    explanation=variant_explanation(ident,number,variant)
    if explanation:
        blocks.append(paragraph(explanation,'body'))
    return blocks

def public_print_note(text):
    """Remove production attribution only; keep textual uncertainty and review limits."""
    return text.replace('Anvesha and Disha visually inspected the scan.', 'The scan was visually inspected.').replace('AI visual reading', 'Provisional visual reading').replace('reviewed by a separate AI reviewer; human Odia proofreading remains pending', 'with human Odia proofreading still pending')

def print_source_citation(source, label):
    if source.get('kind') == 'document':
        return escape(label) + ' · User-supplied document; not publicly hosted'
    return '<link href="'+escape(source['url'],quote=True)+'">'+escape(label)+'</link>'

class FlowPage(Flowable):
    def __init__(self, placements, width, height, filler=None):
        Flowable.__init__(self);self.placements=placements;self.width=width;self.height=height;self.filler=filler
    def draw(self):
        c=self.canv;shift=6 if c.getPageNumber()%2 else -6
        for item in self.placements:
            blocks,image,caption=item['unit'];cw=self.width if item.get('layout')=='full-width' else (self.width-20)/2
            x=shift if item.get('layout')=='full-width' else item['column']*(self.width+20)/2+shift;y=self.height-item['top']
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
        if self.filler:
            f=self.filler
            c.drawImage(f['path'],f['x']+shift,f['y'],width=f['width'],height=f['height'],preserveAspectRatio=True,mask='auto')

def unit_height(unit,cw):
    blocks,image,caption=unit
    h=sum(b.wrap(cw,10000)[1]+b.getSpaceAfter() for b in blocks)
    if image:h+=8+(image.drawHeight if isinstance(image,Image) else image.height)+5+caption.wrap(cw,10000)[1]
    return h

def fit_reading_unit(unit, column_width, available):
    """Reduce only artwork when a complete reading barely exceeds the column."""
    image=unit[1];height=unit_height(unit,column_width)
    original=(image.drawHeight if isinstance(image,Image) else image.height) if image else 0
    factor=1.0
    if height>available and image:
        target=original-(height-available+2)
        if target<130:
            raise ValueError(f'Artwork accommodation would require {target:.2f}pt, below130pt; layout decision required')
        factor=target/original
        if isinstance(image,Image):image.drawWidth*=factor;image.drawHeight*=factor
        else:image.width*=factor;image.height*=factor;image.scale(factor,factor)
        height=unit_height(unit,column_width)
    if height>available:raise ValueError(f'Complete reading exceeds column: {height:.2f}pt > {available:.2f}pt')
    return height,{'original_image_height_pt':original,'image_height_pt':original*factor,'image_scale_factor':factor,'text_scale_factor':1}

def pack_reading_units(units,column_width,page_width,available):
    """Pack intact units; only explicitly reviewed exceptions get a dedicated wide page."""
    pages=[];placed=[];column=0;top=0;chapter_pages={};packing=[]
    for item in units:
        wide=item['id'] in FULL_WIDTH_READING_IDS or item.get('variant_reading',False)
        measure_width=page_width if wide else column_width
        try:h,image_fit=fit_reading_unit(item['unit'],measure_width,available)
        except ValueError as error:raise ValueError(f"Unit {item['id']}: {error}") from error
        item.update(image_fit)
        if wide:
            if placed:pages.append(placed)
            placed=[];column=0;top=0
        elif top and top+h>available:
            if column==0:column=1;top=0
            else:pages.append(placed);placed=[];column=0;top=0
        item.update(column=column,top=top,height=h,image_position=('below' if wide else 'above' if column==0 else 'below') if item['unit'][1] else None,
                    layout='full-width' if wide else 'two-column',measured_width_pt=measure_width)
        page=4+len(pages);chapter_pages.setdefault(item['chapter'],page)
        packing.append({k:v for k,v in item.items() if k!='unit'}|{'page':page})
        if wide:
            pages.append([item]);column=0;top=0
        else:
            placed.append(item);top+=h+22
    if placed:pages.append(placed)
    return pages,chapter_pages,packing

def pack_credit_blocks(units,width,available,header_height):
    """Continue long source acknowledgements across columns without shrinking text."""
    pages=[];group=[];column=0;top=0;limit=available-header_height
    def advance():
        nonlocal group,column,top,limit
        if column==0:column=1
        else:pages.append(group);group=[];column=0;limit=available
        top=0
    for blocks,_,_ in units:
        pending=list(blocks)
        # Keep a source/entry heading with its first detail, wherever it fits.
        opening=sum(b.wrap(width,10000)[1]+b.getSpaceAfter() for b in pending[:2])
        if top and opening<=limit and opening>limit-top:advance()
        while pending:
            block=pending.pop(0);h=block.wrap(width,10000)[1]+block.getSpaceAfter()
            if h>limit-top:
                pieces=block.split(width,max(0,limit-top-block.getSpaceAfter()))
                if pieces:
                    block=pieces[0];pending=pieces[1:]+pending
                    h=block.wrap(width,10000)[1]+block.getSpaceAfter()
                elif top or limit<available:
                    advance();pending.insert(0,block);continue
                else:raise ValueError('Unsplittable credit block exceeds column')
            group.append({'unit':([block],None,None),'column':column,'top':top});top+=h
        top+=9
    if group:pages.append(group)
    return pages

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
            # A single shaping font preserves mixed-script glyphs and word spacing.
            # Noto Serif Oriya covers both Odia and the Latin text used here.
            style=styles[kind]
            if re.search(r'[\u0b00-\u0b7f]',str(text)) and style.fontName != 'Odia':
                style=style.clone(style.name+'-mixed',fontName='Odia')
            markup=escape(str(text))
            if kind == 'saying':
                # Source verse divisions are distinct from automatic line wrapping.
                markup=markup.replace('\n', '<br/>')
            return Paragraph(markup,style)
        cover=book_cover(data)
        class CoverPage(Flowable):
            def __init__(self):
                Flowable.__init__(self);self.width=usable-12;self.height=bodyheight-12
            def draw(self):
                c=self.canv;c.saveState();c.resetTransforms()
                c.setFillColor(colors.HexColor('#fff9ec'));c.rect(0,0,width,height,fill=1,stroke=0)
                # Contain the complete portrait artwork: never crop its border or subjects.
                c.drawImage(str(root/cover['src']),0,0,width=width,height=height,preserveAspectRatio=True,anchor='c',mask='auto')
                title_style=styles['title'].clone('cover-title',alignment=1,fontSize=30,leading=43)
                english_style=styles['heading'].clone('cover-english',alignment=1,fontSize=17,leading=22)
                small_style=styles['body'].clone('cover-subtitle',alignment=1,fontSize=11,leading=16)
                y=height-48
                for text,style,gap in [(cover['title_odia'],title_style,12),(cover['title_english'],english_style,14),(cover['subtitle'],small_style,12),(cover['byline'],small_style,0)]:
                    block=Paragraph(escape(text),style);_,h=block.wrap(width-84,height);y-=h;block.drawOn(c,42,y);y-=gap
                if y<height*.62:raise ValueError('Cover typography exceeds reserved upper38% area')
                c.restoreState()
        byid={e['id']:e for e in data['entries']}
        def frontmatter(chapter_pages):
            story=[CoverPage(),PageBreak(),p('ଢଗଢମାଳି ବିଷୟରେ','title'),p('About Odia Dhaga','heading')]
            intro=data['book_intro'];sections=intro.get('sections',[])
            for section in sections:
                story.extend([p(section['title_odia'],'heading'),p(section['title_english'],'heading')])
                for para in section['paragraphs']:
                    story.append(KeepTogether([p(para['odia'],'odia'),p(para['english'])]))
            if not sections:
                story.extend(p(x,'odia') for x in intro['odia']);story.extend(p(x) for x in intro['english'])
            story.extend([Spacer(1,24),p('Contents','heading')])
            story.extend(p(f"{ch['label']} · {len(ch['entry_ids'])} Dhaga · page {chapter_pages.get(ch['label'],0)}") for ch in design['shelves'])
            story.extend([Spacer(1,20),p('Each reading includes the Dhaga, its literal sense, meaning and an original usage example.','small')])
            return story
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
                        encoded=print_raster_bytes(src,ident)
                        im=Image(encoded);scale=min(cardwidth/im.imageWidth,190/im.imageHeight)
                        if ident in {'POD-DHAGA-268','POD-DHAGA-269','POD-DHAGA-280','POD-DHAGA-293'}:
                            scale=min((usable-12)/im.imageWidth,159.7014735658043/im.imageHeight)
                        im.drawWidth=im.imageWidth*scale;im.drawHeight=im.imageHeight*scale
                    caption=p(reading_caption(g['caption']),'small')
                units.append({'id':ident,'chapter':ch['label'],'source_entry_sha256':hashlib.sha256((root/'entries'/(ident+'.json')).read_bytes()).hexdigest(),'unit':(blocks,im,caption)})
                for variant_number,variant in enumerate(e.get('variants',[]),1):
                    variant_blocks=variant_reading_blocks(ch['label'],ident,variant_number,variant,p)
                    units.append({'id':ident+'-variant-'+str(variant_number),'entry_id':ident,'variant_reading':True,'variant_sha256':hashlib.sha256(json.dumps(variant,ensure_ascii=False,sort_keys=True).encode()).hexdigest(),'chapter':ch['label'],'unit':(variant_blocks,None,None)})
        # First pass: measure intact reading units and pack down left, then right.
        available=bodyheight-12
        pages,chapter_pages,packing=pack_reading_units(units,cardwidth,usable-12,available)
        # Decorative tail art never participates in measurement or text packing.
        filler_manifest=root/'filler-manifest.json'
        motifs=json.loads(filler_manifest.read_text()).get('motifs',[]) if filler_manifest.exists() else []
        fillers=[];page_fillers={}
        for index,placements in enumerate(pages):
            if any(i.get('layout')=='full-width' for i in placements):continue
            tails=[{'column':col,'content_end':max((i['top']+i['height'] for i in placements if i['column']==col),default=0)} for col in (0,1)]
            # Never decorate an otherwise empty column; whitespace may be intentional.
            tails=[t for t in tails if t['content_end']>0]
            if not motifs or len(tails)!=2:continue
            tail=max(tails,key=lambda t:t['content_end']);gap=available-tail['content_end']
            if gap<180:continue
            motif=motifs[len(fillers)%len(motifs)];path=root/motif['src']
            with RasterImage.open(path) as raster:iw,ih=raster.size
            scale=min(160/iw,110/ih,(gap-48)/ih);fw,fh=iw*scale,ih*scale
            if fh<45:continue
            top=tail['content_end']+24+(gap-48-fh)/2
            f={'page':index+4,'column':'page-centered','src':motif['src'],'path':str(path),'x':(usable-12-fw)/2,'y':available-top-fh,'width':fw,'height':fh,'top':top,'bottom':top+fh,'content_end':tail['content_end'],'gap_height':gap,'separation_pt':top-tail['content_end']}
            assert f['separation_pt']>=24 and f['bottom']<=available-24+0.001
            fillers.append({k:v for k,v in f.items() if k!='path'});page_fillers[index]=f
        # Measure actual frontmatter, including the complete cultural introduction.
        # Rebuild fresh flowables until contents pagination stabilizes; never assume page4.
        reading_styles=styles;styles=front_styles
        first_reading_page=4
        original_chapters=dict(chapter_pages)
        for attempt in range(5):
            chapter_pages={name:page+first_reading_page-4 for name,page in original_chapters.items()}
            probe=SimpleDocTemplate(BytesIO(),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=43,bottomMargin=47)
            probe.build(frontmatter(chapter_pages))
            measured=probe.page+1
            if measured==first_reading_page:break
            first_reading_page=measured
        else:raise ValueError('Frontmatter pagination did not converge')
        for item in packing:item['page']+=first_reading_page-4
        for item in fillers:item['page']+=first_reading_page-4
        story=frontmatter(chapter_pages)
        styles=reading_styles
        for index,placements in enumerate(pages):story.extend([PageBreak(),FlowPage(placements,usable-12,available,page_fillers.get(index))])
        out=root/'odia-dhaga-book.pdf'
        def page_number(c,doc):
            if doc.page==1:return
            c.saveState();c.setFont('English',8);c.setFillColor(colors.HexColor('#665c52'));c.drawCentredString(width/2,28,str(doc.page));c.restoreState()
        document=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=43,bottomMargin=47,title=cover['title_english']+' - '+cover['title_odia'],author='Ahimanikya Satapathy')
        document.build(story,onFirstPage=page_number,onLaterPages=page_number)
        pdf_bytes=out.read_bytes()
        pdf_metadata={'pages':document.page,'bytes':len(pdf_bytes),'sha256':hashlib.sha256(pdf_bytes).hexdigest()}
        (root/'packing-report.json').write_text(json.dumps({'pdf':pdf_metadata,'entries':len(data['entries']),'reading_units':len(units),'variant_readings':sum(len(e.get('variants',[])) for e in data['entries']),'illustrated_entries':sum(bool(e.get('graphic')) for e in data['entries']),'textual_note_entries':0,'textual_note_pages':0,'variant_print_content':'wording_and_explanations_without_source_notes','reading_pages':len(pages),'first_reading_page':first_reading_page,'chapter_pages':chapter_pages,'placements':packing,'fillers':fillers,'filler_policy':{'max_per_reading_page':1,'minimum_gap_pt':180,'requires_both_columns':True,'minimum_separation_pt':24,'maximum_width_pt':160,'maximum_height_pt':110,'text_reflow':False},'shrink':1,'body_font_size':10.5,'column_width':cardwidth,'column_height':available,'mirrored_margins_pt':{'inner':54,'outer':42}},indent=2)+'\n')
        print('Reading pages:',len(pages),'units:',len(units),'shrink:',1)
        return out
if __name__=='__main__':print(make_book())
