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
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, KeepInFrame, KeepTogether
from svglib.svglib import svg2rlg
from build import load_library
ROOT=Path(__file__).resolve().parent

def make_book(root=ROOT):
    root=Path(root);data=load_library(root);design=json.loads((root/'research-design.json').read_text())
    with tempfile.TemporaryDirectory() as td:
        for name,filename in [('English','SourceSerif4-Variable.woff2'),('Odia','NotoSerifOriya-Variable.woff2')]:
            f=Font(root/'assets'/filename);axes={a.axisTag:a.defaultValue for a in f['fvar'].axes};axes['wght']=400
            f=instantiateVariableFont(f,axes,inplace=True);f.flavor=None;target=Path(td)/(name+'.ttf');f.save(target);pdfmetrics.registerFont(TTFont(name,str(target),shapable=True))
        width,height=A4; usable=width-94; bodyheight=height-100
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
        story=[Spacer(1,90),p('ଓଡ଼ିଆ ଢଗଢମାଳି','title'),p('Odia Dhaga–Dhamali','heading'),p('108 sayings in Odia and English'),Spacer(1,22),p('By Ahimanikya Satapathy'),Spacer(1,35),p('Project Odisha · Reading edition'),PageBreak(),p('ଢଗଢମାଳି ବିଷୟରେ','title'),p('About this collection','heading')]
        for x in data['book_intro']['odia']:story.append(p(x,'odia'))
        for x in data['book_intro']['english']:story.append(p(x))
        story += [Spacer(1,20),p('Read by theme or follow the sayings in order. The examples are original illustrations of everyday use.'),PageBreak(),p('Contents','heading')]
        byid={e['id']:e for e in data['entries']}; ordered=[]; next_page=4; frames=[]
        for ch in design['shelves']:
            story.append(p(f"{ch['label']} · {len(ch['entry_ids'])} sayings · page {next_page}"));ordered.extend(byid[i] for i in ch['entry_ids']);next_page+=len(ch['entry_ids'])
        story += [Spacer(1,20),p('Each reading includes the saying, its literal sense, meaning and an original usage example. Source acknowledgements and reuse rights are collected at the end.','small')]
        primary={}
        for ch in design['shelves']:
            for j,ident in enumerate(ch['entry_ids']):
                e=byid[ident];story.append(PageBreak());blocks=[p(ch['label']+' · Saying '+e['id'].rsplit('-',1)[1],'label'),p(e['odia'],'saying'),p(e['title'],'heading'),p(e.get('meaning_odia',''),'odia')]
                for label,key in [('Literal meaning','literal_meaning'),('Meaning','explanation'),('An example · original','usage_example'),('In context','cultural_context')]:
                    blocks += [p(label,'label'),p(e[key])]
                g=e.get('graphic')
                if g:
                    src=root/g['src']
                    if src.suffix=='.svg':
                        im=svg2rlg(str(src));scale=min(usable/im.width,145/im.height);im.width*=scale;im.height*=scale;im.scale(scale,scale)
                    else:
                        raster=RasterImage.open(src).convert('RGB');raster.thumbnail((1400,1000));encoded=BytesIO();raster.save(encoded,format='JPEG',quality=90);encoded.seek(0)
                        im=Image(encoded);scale=min(usable/im.imageWidth,145/im.imageHeight);im.drawWidth=im.imageWidth*scale;im.drawHeight=im.imageHeight*scale
                    blocks += [Spacer(1,6),im,p(g['caption'],'small')]
                frame=KeepInFrame(usable,bodyheight,blocks,mode='shrink');frames.append(frame);story.append(frame)
                primary.setdefault(e['witnesses'][0]['source_id'],[]).append(e['id'].rsplit('-',1)[1])
        story += [PageBreak(),p('Credits & rights','heading'),p(data['license'],'small'),p('Licence: https://creativecommons.org/licenses/by-sa/4.0/','small'),p('Collection and detailed source records: https://github.com/ahimanikya/project-odisha/tree/main/projects/odia-dhaga','small'),p('Original examples and explanations: Project Odisha. Illustrations are contemporary interpretations. Source links and detailed documentation remain in the online reading pages.','small'),p('Fonts: Noto Serif Oriya and Source Serif 4, SIL Open Font License.','small')]
        sources={s['id']:s for s in data['sources']}
        for sid,ids in primary.items():
            s=sources[sid];parts=urlsplit(s['url']);revision=parse_qs(parts.query).get('oldid',[None])[0]
            if revision:
                url=urlunsplit((parts.scheme,parts.netloc,parts.path,'oldid='+revision,''))
                label=('Odia Wiktionary' if 'wiktionary' in parts.netloc else 'Wikimedia Incubator · Odia sayings')+' · revision '+revision
            else:
                url=quote(s['url'],safe=':/?&=%#')
                label=re.sub(r'[\u0b00-\u0b7f]+','',s['title']).strip();label=re.sub(r'\(\s*\)','',label)
            story.append(KeepTogether([p(label,'body'),p('Sayings '+', '.join(ids)+' · '+url,'small')]))
        out=root/'odia-dhaga-book.pdf'
        def page_number(c,doc):
            c.saveState();c.setFont('English',8);c.setFillColor(colors.HexColor('#665c52'));c.drawCentredString(width/2,28,str(doc.page));c.restoreState()
        SimpleDocTemplate(str(out),pagesize=A4,rightMargin=47,leftMargin=47,topMargin=48,bottomMargin=52,title='ଓଡ଼ିଆ ଢଗଢମାଳି · Odia Dhaga–Dhamali',author='Ahimanikya Satapathy').build(story,onFirstPage=page_number,onLaterPages=page_number)
        print('Maximum shrink factor:',max(getattr(f,'_scale',1) for f in frames))
        return out
if __name__=='__main__':print(make_book())
