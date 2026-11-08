#!/usr/bin/env python3
"""Separate 8×10-inch edition. Default operation plans only; never alters the reading book."""
from pathlib import Path
import argparse, collections, datetime, hashlib, html, importlib.util, json, re

ROOT = Path(__file__).resolve().parents[2]
DESIGN = Path(__file__).resolve().parent
SOURCE_BUILDER = ROOT / 'output/dongria-book-design/build_book.py'
SOURCE_DESIGN = ROOT / 'output/dongria-coffee-table'
REGISTER = SOURCE_DESIGN / 'image-register.json'
PLAN = DESIGN / 'page-plan.json'
W, H = 576, 720
MARGIN = 72
COLUMN = W - 2 * MARGIN
TEXT_HEIGHT = 548
IMAGE_MAX_WIDTH = COLUMN * .85
IMAGE_MAX_HEIGHT = 500
HERITAGE_MAX_WIDTH = COLUMN * .35
FONT_SIZE, LEADING = 13.5, 20.5
OUTPUT_BOOK = ROOT / 'output/pdf/dongria-kondh-public-reading.pdf'
OUTPUT_COVERS = ROOT / 'output/pdf/dongria-coffee-table-cover-panels.pdf'
AUTHOR_NOTE = SOURCE_DESIGN / 'author-note.txt'
CLOSING_NOTE = SOURCE_DESIGN / 'closing-note.txt'
GLOSSARY_MAP = SOURCE_DESIGN / 'first-edition/glossary-map.json'
MAP_OUTLINE = ROOT / 'output/dongria-ornament-upgrade-20261108/odisha-natural-earth.geojson'
MAP_OUTLINE_SOURCE = 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/'
AUTHOR_BIO = 'Ahimanikya Satapathy is the founder of Project Odisha, exploring Odisha’s places, culture and literature through research and storytelling.'



BOOK_ADAPTATIONS = {
 'This series':'This book',
 'In the preceding chapter, Jayanti Sabar’s pupils':'In [Learning and belonging](#chapter-learning-and-belonging), Jayanti Sabar’s pupils',
 'Dongariya, Dongria and Dongaria are spellings found in the accounts used here.':'This book uses Dongria; some sources use the spellings Dongariya or Dongaria.',
 'She described Dongariya singers':'She described Dongria singers',
 'Dambu Praska as a Dongaria Kondh bard':'Dambu Praska as a Dongria Kondh bard',
 'Buyers coming to a farm could shorten the selling journey; they did not establish a wider recovery in growers’ earnings.':'Buyers coming to a farm could shorten the selling journey. These reports do not establish a wider recovery in growers’ earnings.',
 'These are his reported instrument names; the recordings have not been checked here.':'These are his reported instrument names.',
}

def adapt_book_text(text):
    for before,after in BOOK_ADAPTATIONS.items():text=text.replace(before,after)
    return text

# Visual duplicate review: these are already represented by existing chapter plates.
EXCLUDED = {'commons-3':'existing market opener', 'commons-5':'existing ornament opener',
 'commons-6':'existing hill opener', 'commons-7':'existing hill opener',
 'commons-8':'park context outside narrative', 'commons-9':'upgrades existing dance opener only',
 'sahapedia-work-3':'alternate framing', 'mongabay-jackfruit':'400px asset too small for a standalone photo page'}
PLACEMENTS = {'harvest-to-market': [['commons-4']]}

PUBLIC_PHOTO_IDS = {'commons-1', 'commons-2', 'commons-4'}
WEDDING_CAPTION = 'A requested group portrait of children preparing for a wedding, according to the photographer.'
OPENING_CONTEXT = {
 'ornaments-in-use': WEDDING_CAPTION,
 'harvest-to-market': 'Posed market-visit photograph; people pictured are not identified as those discussed.',
 'songs-and-singers': 'Public dance performance; not an identified singer or song.',
}



# These are research requests, not descriptions of images that have been obtained.
PHOTO_REQUESTS = {
 'dongariya-life': ['A documented Niyamgiri settlement and its hillside setting', 'Named or securely located household work', 'Cultivated hills or horticulture with a specific place and date'],
 'niyamgiri': ['The cultivated landscape at a documented location', 'A village setting associated with the chapter, with verified context', 'An attributed record or photograph of village deliberation, if reproducible'],
 'homes-and-repair': ['An identifiable dwelling or village street', 'A documented building detail or repair activity', 'A documented decorated wall, with its initiative and date identified'],
 'seed-keeping': ['A documented seed collection', 'A named grower or seed keeper at work', 'Cultivation in a documented place and season'],
 'forest-foods': ['A documented household garden in the region discussed', 'A documented gathering activity with community and place identified', 'Foods associated with the source account, without new species or safety claims'],
 'harvest-to-market': ['A documented market or journey to market', 'Pineapples or other produce in a documented selling context', 'A documented seller or sorting activity'],
 'kapadaganda': ['A complete attributed Kapadaganda textile', 'A documented embroidery process', 'A maker in an identified working context', 'The foundation cloth or its documented weaving process', 'A distinct textile detail whose photographed context is known'],
 'ornaments-in-use': ['An identified ornament or documented collection object', 'A documented maker or wearing context'],
 'kotpad-and-kapadaganda': ['A documented Kotpad loom or weaver', 'An attributed dyeing process or material preparation', 'A complete Kotpad textile with clear provenance'],
 'learning-and-belonging': ['An education setting actually identified in the source, not a generic school', 'An attributed educational resource or documented shared learning activity'],
 'kuvi-and-jatapu-script': ['A reproducible page or cover of an identified language resource', 'A distinct documented writing resource with language and script attribution'],
 'songs-and-singers': ['An attributed singer or recording still, with permission/status recorded', 'A documented performance whose occasion and participants can be identified'],
}


def load_source():
    spec = importlib.util.spec_from_file_location('dongria_reading_source', SOURCE_BUILDER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # Resolve canonical and historical local reading links without changing the shared builder.
    original_inline = module.inline
    def public_inline(text, slug, notes=False):
        def chapter_link(match):
            target = match.group(1)
            target = 'dongariya-life' if target == 'dongria-life' else target
            return '(#chapter-' + target + ')' if target in module.NOTE_DEFS else match.group(0)
        text = re.sub(r'\(/stories/(?:dongria|dongariya)/([^/)]+)/\)', chapter_link, text)
        return original_inline(text, slug, notes)
    module.inline = public_inline
    original_plate = module.plate_image
    wedding = next(im for im in read_register(REGISTER) if im['id']=='commons-2')
    module.plate_image = lambda article: Path(wedding['local_path']) if article['slug']=='ornaments-in-use' else original_plate(article)
    module.BOOK_CAPTIONS['ornaments-in-use'] = WEDDING_CAPTION
    return module


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def visible_words(text):
    text = re.sub(r'\[([^\]]+)\]\([^\s]+\)', r'\1', text)
    text = re.sub(r'\[\^\d+\]', '', text)
    return len(text.split())


def read_register(path):
    if not path.exists():
        return []
    value = json.loads(path.read_text())
    images = value if isinstance(value, list) else value.get('images', [])
    ids = [im['id'] for im in images]
    if len(ids) != len(set(ids)):
        raise ValueError('Image register contains duplicate IDs')
    return images


def image_issues(image):
    issues = []
    for field in ('id', 'local_path', 'caption', 'creator', 'source_url', 'rights_status', 'verified_context'):
        if not image.get(field):
            issues.append(f"{image.get('id', '?')}: missing {field}")
    path = image.get('local_path')
    if path and not Path(path).is_file():
        issues.append(f"{image['id']}: local image does not exist")
    if image.get('kind') not in ('photograph', 'documentary photograph', 'publication cover facsimile', 'document', 'illustration', 'film poster'):
        issues.append(f"{image.get('id', '?')}: kind must distinguish documentary/interpretive material")
    return issues


def styles():
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.colors import HexColor
    return {
        'body': ParagraphStyle('CoffeeBody', fontName='Serif', fontSize=FONT_SIZE, leading=LEADING,
                               spaceAfter=11, textColor=HexColor('#26383a'), allowWidows=0, allowOrphans=0, shaping=0),
        'heading': ParagraphStyle('CoffeeSection', fontName='SerifBold', fontSize=19, leading=24,
                                  spaceBefore=13, spaceAfter=10, textColor=HexColor('#244b50'), keepWithNext=True, shaping=0),
        'note': ParagraphStyle('CoffeeNote', fontName='Serif', fontSize=10.5, leading=14.5,
                               spaceAfter=7, textColor=HexColor('#26383a'), shaping=0),
        'caption': ParagraphStyle('CoffeeCaption', fontName='Serif', fontSize=10.5, leading=15,
                                  spaceAfter=7, textColor=HexColor('#566362'), shaping=0),
    }


def photo_geometry(images, st, fit=True):
    from reportlab.lib.utils import ImageReader
    from reportlab.platypus import Paragraph
    boxes=[]
    for im in images:
        limit=216 if im['id'].startswith(('kotpad','school')) else 324 if im['id'].startswith('mongabay') else IMAGE_MAX_WIDTH
        iw,ih=ImageReader(im['local_path']).getSize();scale=min(limit/iw,500/ih)
        boxes.append({'image':im,'width':iw*scale,'height':ih*scale})
    for attempt in range(12):
        for box in boxes:
            cap=Paragraph(html.escape(box['image']['caption']),st['caption'])
            box['caption_height']=cap.wrap(box['width'],500)[1]
        total=sum(b['height']+8+b['caption_height'] for b in boxes)+20*(len(boxes)-1)
        if total<=632 or not fit:break
        image_height=sum(b['height'] for b in boxes)
        ratio=max(.5,(image_height-(total-632)-1)/image_height)
        for box in boxes:box['width']*=ratio;box['height']*=ratio
    assert total<=632.01 or not fit
    return boxes,total


def block_flow(block, slug, source, st):
    from reportlab.platypus import Paragraph, Table, TableStyle
    if block.startswith('## '):
        return Paragraph(source.inline(block[3:], slug), st['heading'])
    if block.startswith('|'):
        rows = []
        for line in block.splitlines():
            cells = [s.strip() for s in line.strip('|').split('|')]
            if all(re.fullmatch(r'[:\s-]+', cell) for cell in cells):
                continue
            rows.append([Paragraph(source.inline(cell, slug), st['caption']) for cell in cells])
        table = Table(rows, colWidths=[COLUMN * .25, COLUMN * .75], repeatRows=1)
        table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                   ('LEFTPADDING', (0, 0), (-1, -1), 5),
                                   ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                                   ('TOPPADDING', (0, 0), (-1, -1), 6),
                                   ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
        return table
    return Paragraph(source.inline(block.replace('\n', ' '), slug), st['body'])


def text_page_groups(blocks, slug, source, st):
    """Measure unchanged paragraph groups; headings travel with their first paragraph."""
    units = []
    index = 0
    while index < len(blocks):
        ids = [index]
        if slug=='forest-foods' and blocks[index]=='## Growing food close to home':
            ids=list(range(index,len(blocks)))
        elif blocks[index].startswith('## ') and index + 1 < len(blocks):
            ids.append(index + 1)
        height = 0
        for i in ids:
            flow = block_flow(blocks[i], slug, source, st)
            _, h = flow.wrap(COLUMN, TEXT_HEIGHT)
            height += h + flow.getSpaceBefore() + flow.getSpaceAfter()
        if height > TEXT_HEIGHT:
            raise ValueError(f'{slug}: paragraph group {ids} exceeds a text page; needs explicit split review')
        units.append((ids, height))
        index = ids[-1] + 1
    groups, current, used = [], [], 0
    for ids, height in units:
        if current and used + height > TEXT_HEIGHT:
            groups.append(current)
            current, used = [], 0
        current.extend(ids)
        used += height
    if current:
        groups.append(current)
    # Balance short endings using intact heading/paragraph units, without changing type or prose.
    if len(groups)>1:
        tail_ids=set(groups[-2]+groups[-1])
        tail_units=[(ids,h) for ids,h in units if ids[0] in tail_ids]
        choices=[]
        for cut in range(1,len(tail_units)):
            left=sum(h for _,h in tail_units[:cut]);right=sum(h for _,h in tail_units[cut:])
            if max(left,right)<=TEXT_HEIGHT:
                choices.append((abs(left-right),cut))
        if choices:
            _,cut=min(choices)
            groups[-2]=[i for ids,_ in tail_units[:cut] for i in ids]
            groups[-1]=[i for ids,_ in tail_units[cut:] for i in ids]
    return groups


def make_plan(source, images):
    st = styles()
    image_map = {im['id']: im for im in images}
    used_ids, used_digests = set(), set()
    chapters = []
    issues = [issue for im in images for issue in image_issues(im)]
    narrative_words = 0
    for article in source.ARTICLES:
        slug = article['slug']
        blocks = [adapt_book_text(b) for b in source.BODY_BLOCKS[slug]
                  if b.casefold() not in ('## footnotes and sources', '## footnotes & sources')]
        groups = text_page_groups(blocks, slug, source, st)
        source_path = source.MANUSCRIPT / f'{slug}.md'
        opening_path = source.plate_image(article)
        opening = {'kind': 'chapter-opening', 'slug': slug, 'image_path': str(opening_path),
                   'image_sha256': sha(opening_path), 'caption': source.BOOK_CAPTIONS.get(slug, article['caption']),
                   'credit_binding': f'existing-reading-edition:{slug}'}
        slots = collections.defaultdict(list)
        chosen=[]
        for ids in PLACEMENTS.get(slug, []):
            _,height=photo_geometry([image_map[id] for id in ids],st,fit=False)
            ordinary=all(not id.startswith(('mongabay','school','kotpad','kuwi-primer','jatapu-primer')) for id in ids)
            if len(ids)==2 and ordinary and height>632:chosen.extend([[id] for id in ids])
            else:chosen.append(ids)
        for i, ids in enumerate(chosen):
            for id in ids:
                if id in used_ids:
                    issues.append(f'Duplicate image placement: {id}')
                used_ids.add(id)
            after = min(len(groups), 1 + (i * len(groups) // max(1, len(chosen))))
            slots[after].append({'kind': 'photograph-page', 'image_ids': ids, 'slug': slug,
                                 'layout': 'single' if len(ids)==1 else 'paired' if len(ids)==2 else 'portrait-triptych',
                                 'images': [image_map[id] for id in ids]})
        pages = [opening]
        for number, group in enumerate(groups, 1):
            pages.append({'kind': 'narrative-page', 'slug': slug, 'block_ids': group,
                          'word_count': sum(visible_words(blocks[i]) for i in group),
                          'layout': 'reading-column'})
            pages.extend(slots[number])
        narrative_words += sum(visible_words(b) for b in blocks)
        chapters.append({'slug': slug, 'title': article['title'], 'source_path': str(source_path),
                         'source_sha256': sha(source_path), 'source_note_ids': list(source.NOTE_DEFS[slug]),
                         'blocks': blocks, 'pages': pages, 'photo_requests': PHOTO_REQUESTS[slug],
                         'selected_photo_ids': [id for p in pages if p['kind'] == 'photograph-page' for id in p['image_ids']]})
    note_count = sum(len(v) for v in source.NOTE_DEFS.values())
    text_pages = sum(p['kind'] == 'narrative-page' for c in chapters for p in c['pages'])
    photo_pages = sum(p['kind'] == 'photograph-page' for c in chapters for p in c['pages'])
    requested = sum(len(v) for v in PHOTO_REQUESTS.values())
    return {
        'status': 'page-plan-approved-for-draft-build',
        'format_inches': [8, 10], 'type_points': {'body': FONT_SIZE, 'leading': LEADING},
        'geometry': {'reading_column_points': COLUMN, 'text_frame_height_points': TEXT_HEIGHT,
                     'image_max_width_points': IMAGE_MAX_WIDTH, 'image_max_width_fraction': .85,
                     'image_max_height_points': IMAGE_MAX_HEIGHT, 'heritage_max_width_fraction': .35},
        'outputs': [str(OUTPUT_BOOK)],
        'frontmatter': ['front-cover', 'title-and-edition', 'contents', 'author-note', 'before-we-begin', 'locator-map'],
        'chapters': chapters,
        'backmatter': ['closing-essay', 'glossary', 'complete-source-notes', 'picture-credits', 'back-cover-with-author-portrait'],
        'preservation': {'narrative_words': narrative_words, 'source_notes': note_count,
                         'chapter_count': len(chapters), 'all_paragraphs_once': True,
                         'reading_edition_builder_unmodified': True,
                         'reading_edition_outputs_untouched': True},
        'page_estimate': {'measured_narrative_pages': text_pages, 'chapter_openings': len(chapters),
                          'selected_new_photo_pages': photo_pages, 'research_photo_requests': requested,
                          'front_and_backmatter_estimate': [19, 24],
                          'natural_total_estimate': [text_pages + len(chapters) + photo_pages + 19,
                                                            text_pages + len(chapters) + photo_pages + 24],
                          'note': 'An estimate, not a quota. Unfilled research requests never become blank or repeated-image pages.'},
        'image_register_path': str(REGISTER), 'image_validation_issues': issues,
        'rules': ['A full opening for every chapter.', 'All existing prose and compact notes retained.',
                  'Photographs are shown intact, not cropped into invented scenes.',
                  'No image repetition to reach a page target.',
                  'Each new photo must have a local file, specific context, caption, source and rights status.',
                  'Draft-only rights status remains visible in the internal register; no licence is invented.',
                  'A final build needs coordinator approval of the register and page plan.'],
    }


def validate_plan(plan, source, images):
    """Returns actionable issues; does not author a PDF."""
    issues = list(plan.get('image_validation_issues', []))
    source_order = [a['slug'] for a in source.ARTICLES]
    if [c['slug'] for c in plan['chapters']] != source_order:
        issues.append('Chapter sequence differs from the approved reading edition')
    for chapter in plan['chapters']:
        if sha(chapter['source_path']) != chapter['source_sha256']:
            issues.append(f"{chapter['slug']}: manuscript changed after the plan was measured")
        positions = [i for p in chapter['pages'] if p['kind'] == 'narrative-page' for i in p['block_ids']]
        if positions != list(range(len(chapter['blocks']))):
            issues.append(f"{chapter['slug']}: narrative blocks omitted, reordered or duplicated")
        expected=[adapt_book_text(b) for b in source.BODY_BLOCKS[chapter['slug']] if b.casefold() not in ('## footnotes and sources','## footnotes & sources')]
        if chapter['blocks']!=expected:issues.append(chapter['slug']+': adapted source text differs')
        if chapter['source_note_ids'] != list(source.NOTE_DEFS[chapter['slug']]):
            issues.append(f"{chapter['slug']}: note IDs differ")
    return issues


def build_pdf(plan, source, images):
    """Render the approved explicit page sequence without modifying the reading edition."""
    from reportlab.pdfgen import canvas
    from reportlab.platypus import Paragraph, KeepTogether
    from reportlab.lib.utils import ImageReader
    from reportlab.lib.colors import HexColor, white
    from PIL import Image as PILImage
    from pypdf import PdfReader
    import shutil
    st=styles(); extra=json.loads(GLOSSARY_MAP.read_text())
    extra['glossary']=sorted(extra['glossary']+extra.get('glossary_optional_additions',[]),key=lambda entry:entry['term'].casefold())
    from reportlab.lib.styles import ParagraphStyle
    st['credit']=ParagraphStyle('CompactPictureCredit',parent=st['note'],leading=13.5,spaceAfter=4)
    st['glossary']=ParagraphStyle('Glossary',parent=st['body'],fontSize=12,leading=18,spaceAfter=13)
    image_map={im['id']:im for im in images}
    prior=DESIGN/'previous'/datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    for path in (OUTPUT_BOOK,DESIGN/'book-manifest.json'):
        if path.exists():
            prior.mkdir(parents=True,exist_ok=True);shutil.copy2(path,prior/path.name)
    untouched={str(p):sha(p) for p in (SOURCE_BUILDER,ROOT/'output/pdf/dongria-kondh-life-in-niyamgiri.pdf',ROOT/'output/pdf/dongria-cover-panels.pdf',SOURCE_DESIGN/'build_coffee_table.py',SOURCE_DESIGN/'book-manifest.json',ROOT/'output/pdf/dongria-coffee-table-book.pdf',OUTPUT_COVERS)}
    source.prepare_odia_words()
    # Match shaped glyphs to this edition's body size while preserving ActualText.
    for meta in source.WORD_ART.values():
        for key in ('width','height','descent'):meta[key]*=FONT_SIZE/10.5
    pages=[{'kind':'cover'},{'kind':'title'},{'kind':'contents'}]
    author_blocks=AUTHOR_NOTE.read_text().strip().split('\n\n')
    author_title=author_blocks.pop(0)
    # Two balanced pages keep the personal account intact and comfortably spaced.
    author_groups=[author_blocks[:4],author_blocks[4:]]
    for index,blocks in enumerate(author_groups):
        pages.append({'kind':'author-note','blocks':blocks,'first':index==0,'title':author_title})
    pages.append({'kind':'preface'})
    pages.append({'kind':'locator-map'})
    for chapter in plan['chapters']:
        for page in chapter['pages']:
            page=dict(page)
            if page['kind']=='chapter-opening' and chapter['slug']=='songs-and-singers':
                page['image_path']=image_map['commons-9']['local_path']
                page['image_sha256']=sha(page['image_path'])
            pages.append(page)
    closing_blocks=CLOSING_NOTE.read_text().strip().split('\n\n')
    pages.append({'kind':'closing','title':closing_blocks[0],'blocks':closing_blocks[1:]})
    def paginate(units,kind,title):
        current=[];used=0
        for unit_index,unit in enumerate(units):
            if unit.get('anchor')=='note-songs-and-singers-1' and current:
                group_height=0
                for tail in units[unit_index:]:
                    tf=Paragraph(tail['text'],st[tail.get('style','note')]);group_height+=tf.wrap(COLUMN,TEXT_HEIGHT)[1]+tf.getSpaceAfter()+tf.getSpaceBefore()
                if used+group_height>TEXT_HEIGHT:
                    pages.append({'kind':kind,'title':title,'units':current});current=[];used=0
            flow=Paragraph(unit['text'],st[unit.get('style','note')]);_,height=flow.wrap(COLUMN,TEXT_HEIGHT)
            height+=flow.getSpaceAfter()+flow.getSpaceBefore()
            if current and used+height>TEXT_HEIGHT:
                pages.append({'kind':kind,'title':title,'units':current});current=[];used=0
            unit['height']=height;current.append(unit);used+=height
        if current:pages.append({'kind':kind,'title':title,'units':current})
    glossary_units=[{'text':'These short definitions explain how the terms are used in this book. Personal and place-name spellings follow the cited accounts and may vary.','style':'caption'}]
    for entry in extra['glossary']:
        chapter_number=next(i for i,a in enumerate(source.ARTICLES,1) if a['slug']==entry['chapter_slug'])
        term=f'<link href="{html.escape(entry["source_url"],quote=True)}"><b>{html.escape(entry["term"])}</b></link>'
        definition=html.escape(entry['definition'])
        glossary_units.append({'text':term+'<br/>'+definition+f' <link href="#chapter-{entry["chapter_slug"]}"><i>Chapter&#160;{chapter_number}.</i></link>','style':'glossary'})
    paginate(glossary_units,'glossary','Words in this book')
    glossary_pages=[page for page in pages if page['kind']=='glossary']
    # Balance intact entries across the existing page count, without shrinking type.
    if len(glossary_pages)>1:
        terms=glossary_units[1:];base,remainder=divmod(len(terms),len(glossary_pages));cursor=0;balanced=[]
        for index,page in enumerate(glossary_pages):
            count=base+(index<remainder)
            group=([glossary_units[0]] if index==0 else [])+terms[cursor:cursor+count];cursor+=count
            balanced.append(group)
        if all(sum(unit['height'] for unit in group)<=TEXT_HEIGHT for group in balanced):
            for page,group in zip(glossary_pages,balanced):page['units']=group

    # Compact notes retain exact text, IDs and source URLs.
    units=[]
    for article in source.ARTICLES:
        slug=article['slug']
        for ix,(num,body) in enumerate(source.NOTE_DEFS[slug].items()):
            prefix=('<b>'+html.escape(article['title'])+'</b><br/><br/>') if ix==0 else ''
            units.append({'text':prefix+f'<b>{num}.</b> '+source.inline(body,slug,True),'anchor':f'note-{slug}-{num}'})
    paginate(units,'notes','Notes & sources')
    # Reuse the already-reviewed existing-plate credits, without the old cover credit.
    old=source.story({}); start=next(i for i,f in enumerate(old) if getattr(f,'key',None)=='media')
    existing=[]
    for flow in old[start:]:
        if isinstance(flow,KeepTogether):
            for f in flow._content:
                if isinstance(f,Paragraph):
                    text=f.text
                    if text.startswith('<b>08.'):
                        im=image_map['commons-2']
                        text='<b>08. Dongria ornaments in use</b><br/>'+html.escape(WEDDING_CAPTION)+'<br/>'+html.escape(im['creator'])+'. <link href="'+html.escape(im['source_url'],quote=True)+'">Original photograph / source</link>. <link href="'+im['licence_url']+'">'+im['licence']+'</link>. Resized; composition unchanged.'
                    existing.append({'text':text})
    selected=['commons-1','commons-2']+[id for c in plan['chapters'] for id in c['selected_photo_ids']]
    assert set(selected)==PUBLIC_PHOTO_IDS
    pagemap={};photomap={}
    for n,page in enumerate(pages,1):
        if page['kind']=='chapter-opening':
            pagemap['chapter-'+page['slug']]=n
            if page['slug']=='ornaments-in-use':photomap['commons-2']=n
        if page['kind']=='preface':pagemap['preface']=n
        if page['kind']=='closing':pagemap['closing']=n
        if page['kind']=='locator-map':pagemap['locator-map']=n
        if page['kind']=='glossary':pagemap.setdefault('glossary',n)
        if page['kind']=='author-note':pagemap.setdefault('author-note',n)
        if page['kind']=='notes':
            pagemap.setdefault('sources',n)
            for unit in page['units']:pagemap[unit['anchor']]=n
        if page['kind']=='photograph-page':
            for id in page['image_ids']:photomap[id]=n
    groups=collections.OrderedDict()
    for id in selected:
        if id=='commons-2':continue  # Full source/licence appears in chapter08 credit.
        im=image_map[id];key=(im['creator'],im['source_url'],im.get('licence',''))
        groups.setdefault(key,[]).append(id)
    new=[]
    for (creator,url,licence),ids in groups.items():
        im=image_map[ids[0]]
        if ids==['commons-1']:label='Front cover'
        else:
            nums=sorted({photomap[id] for id in ids})
            label=('Page ' if len(nums)==1 else 'Pages ')+', '.join(map(str,nums))
        if 'sahapedia.org' in url:creator='Sahapedia; article by Kanak Rajadhyaksha'
        credit=f'<b>{label}</b> · {html.escape(creator.rstrip(". "))}. '
        credit+=f'<link href="{html.escape(url,quote=True)}">Source</link>.'
        # Retain established licences; unresolved permissions remain in the register.
        if licence.startswith('CC '):
            licence=licence.split(' (')[0].rstrip('. ')
            if im.get('licence_url'):credit+=f' <link href="{html.escape(im["licence_url"],quote=True)}">{html.escape(licence)}</link>.'
            else:credit+=' '+html.escape(licence)+'.'
        new.append({'text':credit})
    pagemap['media']=len(pages)+1
    for unit in existing+new:unit['style']='credit'
    paginate(existing+new,'credits','Pictures & credits')
    if len(pages)%2==0:pages.append({'kind':'inside-back'})
    pages.append({'kind':'back'})
    placements=[]
    def para(c,text,x,y,width,style):
        p=Paragraph(text,style);_,height=p.wrap(width,1000);p.drawOn(c,x,y-height);return y-height
    def picture(c,path,x,y,boxw,boxh,label):
        iw,ih=ImageReader(str(path)).getSize();scale=min(boxw/iw,boxh/ih);dw,dh=iw*scale,ih*scale
        # Output-only encoding: cap at 300ppi, never upscale, crop or recolour.
        encoding_dir=DESIGN/'encoded';encoding_dir.mkdir(exist_ok=True)
        with PILImage.open(path) as original:
            im=original.copy();target=(min(iw,max(1,round(dw/72*300))),min(ih,max(1,round(dh/72*300))))
            im.thumbnail(target,PILImage.Resampling.LANCZOS)
            is_alpha=im.mode in ('RGBA','LA')
            facsimile='primer-cover' in label
            suffix='.png' if is_alpha or facsimile else '.jpg'
            key=hashlib.sha256((str(path)+str(im.size)).encode()).hexdigest()[:16]
            encoded=encoding_dir/(key+suffix)
            if not encoded.exists():
                if suffix=='.jpg':im.convert('RGB').save(encoded,quality=95,subsampling=0,optimize=True)
                else:im.save(encoded,optimize=True)
            ew,eh=im.size
        c.drawImage(str(encoded),x+(boxw-dw)/2,y+(boxh-dh)/2,dw,dh,mask='auto')
        placements.append({'page':c.getPageNumber(),'id':label,'width_pt':dw,'height_pt':dh,'effective_dpi':ew/(dw/72),'path':str(path),'encoded_path':str(encoded),'encoded_dimensions':[ew,eh],'encoding':'PNG' if suffix=='.png' else 'JPEG quality95, 4:4:4','original_sha256':sha(path)})
    designed_pages={}
    from reportlab.lib.styles import ParagraphStyle
    display=ParagraphStyle('PhotoDisplay',parent=st['heading'],fontName='Serif',fontSize=26,leading=30,spaceBefore=0,spaceAfter=0)
    reflection=ParagraphStyle('PhotoReflection',parent=st['body'],fontSize=16,leading=22,spaceAfter=0)
    sidecaption=ParagraphStyle('PhotoSideCaption',parent=st['caption'],fontSize=11.5,leading=16.5,spaceAfter=0)
    def design_photo_page(c,page):
        ids=page['image_ids'];number=c.getPageNumber()
        supported={'mongabay-laxmi','mongabay-gatri','mongabay-seeds','mongabay-hillside','sahapedia-work-4','kotpad-craft','school-phulaki'}
        if ids[0] not in supported:return False
        elements=[]
        def line(x,y,width=55):
            c.setStrokeColor(HexColor('#944c35'));c.setLineWidth(.7);c.line(x,y,x+width,y)
        def text(value,x,y,width,style=display,source_location='existing image caption'):
            bottom=para(c,value,x,y,width,style)
            elements.append({'text':value,'source':source_location,'x':x,'top':y,'width':width,'bottom':bottom})
            return bottom
        def photo(id,x,y,width,cx,cy,cw):
            im=image_map[id];iw,ih=ImageReader(im['local_path']).getSize();height=width*ih/iw
            picture(c,im['local_path'],x,y,width,height,id)
            bottom=para(c,html.escape(im['caption']),cx,cy,cw,sidecaption)
            placements[-1].update({'caption_layout':'side','image_left_pt':x,'image_bottom_pt':y,
                'caption_left_pt':cx,'caption_width_pt':cw,'caption_top_pt':cy,'caption_bottom_pt':bottom})
        if ids[0]=='mongabay-laxmi':
            text('With friends in Rodango',72,634,432);line(72,579,82)
            photo('mongabay-laxmi',72,275,302.4,399,519,111)
            text('Land can provide food and income, but the balance between them depends partly on who makes the choices.',72,214,414,reflection,'dongariya-life, narrative block1, exact sentence')
        elif ids[0]=='mongabay-gatri':
            text('Gatri Kadraka',72,634,432);line(72,579,82)
            photo('mongabay-gatri',194.4,300,309.6,72,499,105)
            text('Keeping a home habitable also involves repairs, money and access to help.',194.4,241,309.6,reflection,'homes-and-repair, narrative block1, exact sentence')
        elif ids[0]=='mongabay-seeds':
            text('Seeds in store',72,644,432);line(72,592,82)
            photo('mongabay-seeds',72,400,252,353,552,151)
            photo('mongabay-seed-roles',252,104,252,72,267,154)
        elif ids[0]=='mongabay-hillside':
            text('A stored seed still needs a grower.',72,638,432,display,'seed-keeping, narrative block1, exact sentence')
            line(72,552,82)
            photo('mongabay-hillside',230.4,157,273.6,72,411,134)
            text('Keeping it in use means planting, tending the crop and retaining enough of the harvest for another season.',72,530,432,reflection,'seed-keeping, narrative block1, exact sentence')
        elif ids[0]=='sahapedia-work-4':
            text('Embroidery and work',72,638,432);line(72,581,82)
            photo('sahapedia-work-4',72,172,234,336,510,168)
            text(source.inline('Site Jakesika valued the independence that selling her work could bring.[^1]','kapadaganda'),336,388,168,reflection,'kapadaganda, Learning making and giving, exact sourced sentence')
        elif ids[0]=='kotpad-craft':
            text('Kotpad: yarn and cloth',72,650,432);line(72,596,82)
            photo('kotpad-craft',72,360,180,282,563,222)
            photo('kotpad-textile',324,91,180,72,285,222)
        elif ids[0]=='school-phulaki':
            text('Learning and belonging',72,650,432);line(72,596,82)
            photo('school-phulaki',72,433,201.6,306,536,198)
            photo('school-mukteswar',302.4,263,201.6,72,370,198)
            photo('school-ravindra',72,93,201.6,306,198,198)
        designed_pages[str(number)]={'image_ids':ids,'editorial_elements':elements,'layout':'source-grounded asymmetric composition'}
        return True

    def front(c):
        c.setFillColor(HexColor('#fbf7ed'));c.rect(0,0,W,H,fill=1,stroke=0)
        c.setFillColor(HexColor('#244b50'));c.setFont('Serif',38);c.drawString(48,625,'Dongria Kondh')
        c.setFont('Serif',23);c.drawString(49,587,'Life in Niyamgiri')
        picture(c,image_map['commons-1']['local_path'],0,170,W,384,'cover:commons-1')
        c.setFillColor(HexColor('#244b50'));c.setFont('Serif',16);c.drawString(49,102,source.AUTHOR)
    def back(c):
        c.setFillColor(HexColor('#244b50'));c.rect(0,0,W,H,fill=1,stroke=0)
        from reportlab.lib.styles import ParagraphStyle
        bs=ParagraphStyle('BackCoffee',parent=st['body'],textColor=HexColor('#fbf7ed'),fontSize=15,leading=23)
        y=625
        for block in source.BLURB.split('\n\n'):y=para(c,html.escape(block),72,y,COLUMN,bs)-16
        portrait=source.REPO/'kb/research/media/cinema-book/ahimanikya-satapathy-portrait.png'
        picture(c,portrait,72,90,100,100,'author-portrait')
        c.setFillColor(HexColor('#fbf7ed'));c.setFont('Serif',15);c.drawString(195,146,source.AUTHOR)
        bio_style=ParagraphStyle('AuthorBio',parent=st['caption'],fontSize=11,leading=16,textColor=HexColor('#fbf7ed'))
        para(c,html.escape(AUTHOR_BIO),195,126,309,bio_style)
    c=canvas.Canvas(str(OUTPUT_BOOK),pagesize=(W,H),pageCompression=1)
    c.setTitle('Dongria Kondh: Life in Niyamgiri');c.setAuthor(source.AUTHOR)
    for number,page in enumerate(pages,1):
        kind=page['kind'];c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0)
        if kind=='cover':front(c)
        elif kind=='back':back(c)
        elif kind=='title':
            y=620
            for text,style in [('Dongria Kondh',st['heading']),('Life in Niyamgiri',st['heading']),('Ahimanikya Satapathy',st['body']),('Illustrated reading edition · November 2026',st['caption'])]:y=para(c,text,MARGIN,y,COLUMN,style)-20
            y-=40
            for text in ['Twelve connected chapters drawn from published research and attributed reporting.', 'Photographs document the subjects identified in their credits. Interpretive illustrations depict imagined scenes.', 'Picture credits and source notes appear at the back.', '<link href="https://projectodisha.org/about/editorial-process/">projectodisha.org/about/editorial-process/</link>']:
                y=para(c,text,MARGIN,y,COLUMN,st['caption'])-12
        elif kind=='contents':
            y=640; y=para(c,'Contents',MARGIN,y,COLUMN,st['heading'])-25
            entries=[('author-note',"Author's note"),('preface','Before we begin'),('locator-map','Locating Niyamgiri')]+[('chapter-'+a['slug'],a['title']) for a in source.ARTICLES]+[('closing','Looking again'),('glossary','Words in this book'),('sources','Notes & sources'),('media','Pictures & credits')]
            for key,title in entries:y=para(c,f'<link href="#{key}">{html.escape(title)}  ·  {pagemap[key]}</link>',MARGIN,y,COLUMN,st['body'])-7
        elif kind=='author-note':
            if page['first']:
                c.bookmarkPage('author-note');c.addOutlineEntry("Author's note",'author-note')
                y=para(c,html.escape(page['title']),MARGIN,640,COLUMN,display)-25
            else:
                c.setFillColor(HexColor('#636d68'));c.setFont('Serif',10);c.drawString(MARGIN,660,"Author's note")
                y=630
            for block in page['blocks']:
                y=para(c,html.escape(block),MARGIN,y,COLUMN,st['body'])-15
            assert y>50,('Author note overflow',number,y)
        elif kind=='closing':
            c.bookmarkPage('closing');c.addOutlineEntry(page['title'],'closing')
            y=para(c,html.escape(page['title']),MARGIN,640,COLUMN,display)-25
            for block in page['blocks']:y=para(c,html.escape(block),MARGIN,y,COLUMN,st['body'])-15
            assert y>50,('Closing note overflow',number,y)
        elif kind=='preface':
            c.bookmarkPage('preface');c.addOutlineEntry('Before we begin','preface');y=640
            for block in (source.MANUSCRIPT/'before-we-begin.md').read_text().strip().split('\n\n'):
                y=para(c,source.inline(block.removeprefix('# '),'preface'),MARGIN,y,COLUMN,st['heading'] if block.startswith('# ') else st['body'])-15
            y=para(c,'<link href="https://grain.org/en/article/743-endangered-tribals-up-against-the-terror-of-vedanta">Living Farms, GRAIN, 26 July 2009</link>; translator unnamed.',MARGIN,y,COLUMN,st['caption'])
            assert y>50,('Preface overflow',y)
        elif kind=='locator-map':
            data=extra['map'];c.bookmarkPage('locator-map');c.addOutlineEntry(data['title'],'locator-map')
            para(c,html.escape(data['title']),72,640,432,display)
            para(c,html.escape(data['state_label']),72,591,432,st['caption'])
            # Public-domain geographic outline: equirectangular local projection,
            # with a focus rectangle that indicates the regional view, not hill bounds.
            import math
            geometry=json.loads(MAP_OUTLINE.read_text())['features'][0]['geometry']
            polygons=geometry['coordinates'] if geometry['type']=='MultiPolygon' else [geometry['coordinates']]
            coords=[point for polygon in polygons for ring in polygon for point in ring]
            west=min(p[0] for p in coords);east=max(p[0] for p in coords)
            south=min(p[1] for p in coords);north=max(p[1] for p in coords)
            cosine=math.cos(math.radians((south+north)/2))
            inset_x,inset_y,inset_w,inset_h=85,447,162,136
            scale=min(inset_w/((east-west)*cosine),inset_h/(north-south))
            def inset(lon,lat):return inset_x+(lon-west)*cosine*scale,inset_y+(lat-south)*scale
            c.setFillColor(HexColor('#f1f0e7'));c.setStrokeColor(HexColor('#617d78'));c.setLineWidth(.7)
            for polygon in polygons:
                path=c.beginPath()
                for ring in polygon:
                    for index,(lon,lat,*_) in enumerate(ring):
                        xx,yy=inset(lon,lat)
                        (path.moveTo if index==0 else path.lineTo)(xx,yy)
                    path.close()
                c.drawPath(path,fill=1,stroke=1,fillMode=0)
            focus_w,focus_s,focus_e,focus_n=83.0,19.0,83.8,19.85
            fx,fy=inset(focus_w,focus_s);ex,ny=inset(focus_e,focus_n)
            c.setStrokeColor(HexColor('#944c35'));c.setLineWidth(1);c.rect(fx,fy,ex-fx,ny-fy,fill=0,stroke=1)
            c.setFillColor(HexColor('#244b50'));c.setFont('SerifBold',15);c.drawString(280,564,'Odisha')
            para(c,'The outlined area locates the regional view below.',280,540,210,st['caption'])
            para(c,'State outline: Natural Earth. Regional positions: cited sources.',280,490,210,st['caption'])
            # Larger regional view preserves the approved coordinates and relative orientation.
            x0=(W-IMAGE_MAX_WIDTH)/2;y0=235;mw=IMAGE_MAX_WIDTH;mh=180
            def loc(lat,lon):return x0+(lon-focus_w)/(focus_e-focus_w)*mw,y0+(lat-focus_s)/(focus_n-focus_s)*mh
            c.setStrokeColor(HexColor('#d6c8b4'));c.setLineWidth(.5);c.line(x0,427,x0+mw,427)
            c.setFillColor(HexColor('#636d68'));c.setFont('SerifItalic',12)
            c.drawString(x0+8,400,'Kalahandi district');c.drawString(x0+220,300,'Rayagada district')
            c.setStrokeColor(HexColor('#244b50'));c.setLineWidth(.8)
            c.line(x0+25,290,x0+25,330);c.line(x0+25,330,x0+20,321);c.line(x0+25,330,x0+30,321)
            c.setFillColor(HexColor('#244b50'));c.setFont('SerifBold',11);c.drawCentredString(x0+25,339,'N')
            for place in data['places']:
                x,y=loc(place['latitude'],place['longitude'])
                if place['kind']=='town':
                    c.setFillColor(HexColor('#244b50'));c.circle(x,y,3,fill=1,stroke=0);c.setFont('Serif',13);c.drawString(x+10,y-4,place['label'])
                else:
                    c.setFillColor(HexColor('#944c35'));c.setFont('Serif',21);c.drawCentredString(x,y,place['label'])
                    c.setFont('SerifItalic',11);c.drawCentredString(x,y-20,'approximate regional position')
            y=para(c,html.escape(data['display_caption']),x0,211,mw,st['caption'])-17
            labels=['Rayagada Forest Division working plan, §1.2.2','Niyamgiri field study, surveyed sites','Rayagada Municipality, location','Rayagada District Profile, §2.1']
            linked=['<link href="'+html.escape(item['url'],quote=True)+'">'+html.escape(label)+'</link>' for item,label in zip(data['sources'],labels)]
            linked.append('<link href="'+MAP_OUTLINE_SOURCE+'">Natural Earth state outline</link> (<link href="https://www.naturalearthdata.com/about/terms-of-use/">public domain</link>)')
            y=para(c,'Sources: '+'; '.join(linked)+'.',x0,y,mw,st['caption'])
            assert y>50,('Locator source overflow',y)
            placements.append({'page':number,'id':'locator-map','width_pt':mw,'height_pt':mh,'kind':'original vector locator with geographic inset','coordinate_data':data['places'],'outline_source':MAP_OUTLINE_SOURCE,'outline_sha256':sha(MAP_OUTLINE),'outline_license':'Public domain','focus_bounds':[focus_w,focus_s,focus_e,focus_n]})
        elif kind=='chapter-opening':
            chapter=next(x for x in plan['chapters'] if x['slug']==page['slug']);idx=plan['chapters'].index(chapter)+1
            key='chapter-'+page['slug'];c.bookmarkPage(key);c.addOutlineEntry(chapter['title'],key)
            c.setFillColor(HexColor('#944c35'));c.setFont('SerifBold',11);c.drawString(MARGIN,659,f'CHAPTER  /  {idx:02d}')
            para(c,html.escape(chapter['title']),MARGIN,635,COLUMN,st['heading'])
            picture(c,page['image_path'],(W-IMAGE_MAX_WIDTH)/2,80,IMAGE_MAX_WIDTH,480,'opening:'+page['slug'])
            if page['slug'] in OPENING_CONTEXT:
                placed=placements[-1]
                left=(W-placed['width_pt'])/2
                image_bottom=80+(480-placed['height_pt'])/2
                bottom=para(c,html.escape(OPENING_CONTEXT[page['slug']]),left,image_bottom-10,placed['width_pt'],st['caption'])
                assert bottom>45,('Opening context overflow',number,bottom)
                placed['context_caption']=OPENING_CONTEXT[page['slug']]
                placed['context_caption_bottom_pt']=bottom
        elif kind=='narrative-page':
            chapter=next(x for x in plan['chapters'] if x['slug']==page['slug']);y=640
            for i in page['block_ids']:
                flow=block_flow(chapter['blocks'][i],page['slug'],source,st);_,height=flow.wrap(COLUMN,TEXT_HEIGHT)
                y-=flow.getSpaceBefore();flow.drawOn(c,MARGIN,y-height);y-=height+flow.getSpaceAfter()
            assert y>=70,(page['slug'],number,y)
            # Preserve the two small heritage accents at their unchanged relative scale.
            if page is not None and page['block_ids'][-1]==len(chapter['blocks'])-1 and page['slug'] in ('kapadaganda','ornaments-in-use'):
                name='cloth-band' if page['slug']=='kapadaganda' else 'hairpins'
                path=source.DESIGN/'line-art-heritage'/f'{name}.png'
                with PILImage.open(path) as im:
                    iw,ih=im.size;bbox=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
                scale=HERITAGE_MAX_WIDTH/iw;hh=(bbox[3]-bbox[1])*scale
                if y-hh-15>50:
                    c.saveState();clip=c.beginPath();xx=(W-HERITAGE_MAX_WIDTH)/2;yy=y-hh-10;clip.rect(xx,yy,HERITAGE_MAX_WIDTH,hh);c.clipPath(clip,stroke=0,fill=0)
                    c.drawImage(str(path),xx,yy-(ih-bbox[3])*scale,HERITAGE_MAX_WIDTH,ih*scale,mask='auto');c.restoreState()
                    placements.append({'page':number,'id':'heritage:'+name,'width_pt':HERITAGE_MAX_WIDTH,'height_pt':hh})
        elif kind=='photograph-page' and design_photo_page(c,page):
            pass
        elif kind=='photograph-page':
            boxes,total=photo_geometry(page['images'],st)
            top=360+total/2
            for box in boxes:
                im=box['image'];dw,dh=box['width'],box['height'];ch=box['caption_height'];left=(W-dw)/2
                image_bottom=top-dh
                picture(c,im['local_path'],left,image_bottom,dw,dh,im['id'])
                caption_top=image_bottom-8
                caption_bottom=para(c,html.escape(im['caption']),left,caption_top,dw,st['caption'])
                placements[-1].update({'image_left_pt':left,'image_bottom_pt':image_bottom,
                    'caption_left_pt':left,'caption_width_pt':dw,'caption_top_pt':caption_top,
                    'caption_bottom_pt':caption_bottom,'caption_gap_pt':8})
                top=caption_bottom-20
            assert top+20>=43,('Photo caption overflow',number,top)
        elif kind in ('notes','credits','glossary'):
            key='sources' if kind=='notes' else 'glossary' if kind=='glossary' else 'media'
            if number==pagemap[key]:c.bookmarkPage(key);c.addOutlineEntry(page['title'],key)
            c.setFillColor(HexColor('#244b50'));c.setFont('SerifBold',14);c.drawString(MARGIN,670,page['title'])
            y=635
            for unit in page['units']:
                if unit.get('anchor'):c.bookmarkPage(unit['anchor'])
                style=st[unit.get('style','note')]
                y=para(c,unit['text'],MARGIN,y,COLUMN,style)-style.spaceAfter
            assert y>55,(kind,number,y)
        if kind not in ('cover','back','inside-back'):
            c.setFillColor(HexColor('#636d68'));c.setFont('Serif',9);c.drawCentredString(W/2,30,str(number))
        c.showPage()
    c.save()
    book_placements=list(placements)
    reader=PdfReader(OUTPUT_BOOK)
    assert len(reader.pages)==len(pages)
    assert all(sha(p)==digest for p,digest in untouched.items()),'Reading edition changed'
    manifest={'status':'candidate-awaiting-visual-review','glossary_map_source':str(GLOSSARY_MAP),'glossary_map_sha256':sha(GLOSSARY_MAP),'glossary_and_map_data':extra,'closing_note_source':str(CLOSING_NOTE),'closing_note_sha256':sha(CLOSING_NOTE),'author_note_source':str(AUTHOR_NOTE),'author_note_sha256':sha(AUTHOR_NOTE),'author_bio':AUTHOR_BIO,'format_inches':[8,10],'pages':len(pages),'book':str(OUTPUT_BOOK),'cover_panels':str(OUTPUT_COVERS),'book_sha256':sha(OUTPUT_BOOK),'cover_sha256':sha(OUTPUT_COVERS),'page_map':pagemap,'photograph_pages':photomap,'inside_back_blank_pages':[i for i,p in enumerate(pages,1) if p['kind']=='inside-back'],'blank_reason':'An unprinted inside-back page places the back cover on an even physical page.','page_kinds':[p['kind'] for p in pages],'image_placements':book_placements,'designed_photo_pages':designed_pages,'source_notes':sum(len(n) for n in source.NOTE_DEFS.values()),'preservation':plan['preservation'],'book_copy_adaptations':[{'slug':a['slug'],'before':before,'after':after,'occurrences':sum(b.count(before) for b in source.BODY_BLOCKS[a['slug']])} for a in source.ARTICLES for before,after in BOOK_ADAPTATIONS.items() if any(before in b for b in source.BODY_BLOCKS[a['slug']])],'reading_edition_hashes_unchanged':untouched,'excluded_images':EXCLUDED,'selected_photo_ids':selected,'opener_upgrade':{'songs-and-singers':'commons-9'},'source_registers':[str(REGISTER),str(SOURCE_DESIGN/'supplementary-image-register.json')],'notes_pages':[i for i,p in enumerate(pages,1) if p['kind']=='notes'],'credits_pages':[i for i,p in enumerate(pages,1) if p['kind']=='credits']}
    (DESIGN/'book-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'pages':len(pages),'sha256':manifest['book_sha256'],'notes_pages':manifest['notes_pages'],'credits_pages':manifest['credits_pages']},indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image-register', type=Path, default=REGISTER)
    parser.add_argument('--plan', action='store_true', help='Measure and save the draft page plan; no PDF authoring')
    parser.add_argument('--validate', action='store_true', help='Read-only validation of the saved plan')
    parser.add_argument('--build', action='store_true', help='Author approved PDF draft after operation marker')
    args = parser.parse_args()
    source = load_source()
    images = read_register(args.image_register) + read_register(SOURCE_DESIGN / 'supplementary-image-register.json')
    if args.validate:
        plan = json.loads(PLAN.read_text())
        issues = validate_plan(plan, source, images)
        print(json.dumps({'status': 'pass' if not issues else 'needs-review', 'issues': issues}, indent=2))
        raise SystemExit(bool(issues))
    plan = make_plan(source, images)
    plan['image_register_path'] = str(args.image_register)
    if args.build:
        issues=validate_plan(plan,source,images)
        if issues:raise ValueError(issues)
        build_pdf(plan,source,images)
    DESIGN.mkdir(parents=True, exist_ok=True)
    PLAN.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'status': plan['status'], 'page_estimate': plan['page_estimate'],
                      'preservation': plan['preservation'], 'issues': plan['image_validation_issues']}, indent=2))

if __name__ == '__main__':
    main()
