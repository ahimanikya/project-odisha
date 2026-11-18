#!/usr/bin/env python3
"""Build the offline, source-linked Odia dhaga collection. Python standard library only."""
import argparse
import html
import json
import re
from pathlib import Path
from reader_content import variant_explanation
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent

def esc(value):
    return html.escape(str(value), quote=True)

def reader_language_spans(value):
    """Escape explanatory prose and mark Odia runs for correct pronunciation."""
    return re.sub(r'([\u0b00-\u0b7f][\u0b00-\u0b7f\s\u200c\u200d–—,;:।-]*)',
                  lambda match: '<span lang="or" class="odia">'+match.group(0)+'</span>', esc(value))

def source_heading(value):
    """Escape source text, retaining intentional verse divisions."""
    return esc(value).replace("\n", "<br>")

def required(obj, fields, context):
    for field in fields:
        if not isinstance(obj.get(field), str) or not obj[field].strip():
            raise ValueError(f'{context}: missing {field}')

def validate_source_location(source):
    """A document is identified by its content digest, never a private file link."""
    if source.get('kind') == 'document':
        required(source, ['title', 'access', 'rights', 'limits', 'locator', 'document_sha256'], 'document source')
        if not re.fullmatch(r'[0-9a-f]{64}', source['document_sha256']):
            raise ValueError('document source requires a lowercase SHA256 identity')
        if 'url' in source or any(k in source for k in ('path', 'filepath', 'file_path', 'local_path', 'filesystem_path')):
            raise ValueError('document source must not contain a URL or filesystem path')
        if re.search(r'/Users/|/private/|/home/|/tmp/|/var/|/Volumes/|file:|[A-Za-z]:[\\\\/]', json.dumps(source)):
            raise ValueError('document source must not expose a private filesystem path')
    else:
        if source.get('kind') not in (None, 'web'):
            raise ValueError('unsupported source kind')
        required(source, ['url'], 'web source')
        url = urlparse(source['url'])
        if url.scheme not in ('https', 'http') or not url.netloc:
            raise ValueError('source URL must be HTTP(S)')


def source_citation(source):
    if source.get('kind') == 'document':
        return f'<cite>{esc(source["title"])}</cite> <span class="note">User-supplied document; not publicly hosted</span>'
    return f'<a href="{esc(source["url"])}">{esc(source["title"])}</a>'


def validate(data):
    required(data, ['title', 'subtitle', 'scope_note', 'checked_on'], 'collection')
    sources, entries = data.get('sources'), data.get('entries')
    if not isinstance(sources, list) or not isinstance(entries, list):
        raise ValueError('sources and entries must be lists')
    def ids(records, kind):
        result = set()
        for record in records:
            ident = record.get('id', '')
            if not isinstance(ident, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]*', ident):
                raise ValueError(f'{kind}: missing or unsafe id')
            if ident in result:
                raise ValueError(f'duplicate {kind} id: {ident}')
            result.add(ident)
        return result
    source_ids = ids(sources, 'source')
    ids(entries, 'entry')
    for source in sources:
        required(source, ['title', 'access', 'rights', 'limits'], source['id'])
        validate_source_location(source)
    for entry in entries:
        required(entry, ['odia', 'literal_meaning', 'explanation', 'usage_example',
                         'cultural_context', 'origin_note', 'rights_note'], entry['id'])
        if not isinstance(entry.get('tags'), list) or not all(isinstance(t, str) and t for t in entry['tags']):
            raise ValueError('tags must be a list of nonempty strings')
        witnesses = entry.get('witnesses')
        if not isinstance(witnesses, list) or not witnesses:
            raise ValueError('entry requires a source witness')
        for witness in witnesses:
            required(witness, ['source_id', 'locator'], entry['id'])
            if witness['source_id'] not in source_ids:
                raise ValueError('dangling witness source')
        for variant in entry.get('variants', []):
            required(variant, ['odia', 'note'], 'variant')
            if variant.get('source_id') and variant['source_id'] not in source_ids:
                raise ValueError('dangling variant source')
            if 'page_url' in variant or 'page_label' in variant:
                required(variant, ['page_url', 'page_label'], 'variant page citation')
                page_url = urlparse(variant['page_url'])
                if page_url.scheme not in ('https', 'http') or not page_url.netloc:
                    raise ValueError('variant page URL must be HTTP(S)')
        if entry.get('graphic'):
            graphic = entry['graphic']
            required(graphic, ['src', 'alt', 'caption'], 'graphic')
            if not re.fullmatch(r'assets/[a-z0-9-]+\.(?:svg|png)', graphic['src']):
                raise ValueError('graphic must be a local assets SVG or PNG')
    cover = data.get('cover')
    if cover:
        required(cover, ['src', 'alt', 'title_english', 'title_odia', 'subtitle', 'byline'], 'cover')
        if not re.fullmatch(r'assets/[a-z0-9-]+\.(?:png|webp)', cover['src']):
            raise ValueError('cover must be a local assets image')
        if any(not isinstance(cover.get(k), int) or isinstance(cover[k], bool) or cover[k] < 1 for k in ('width','height')):
            raise ValueError('cover requires positive intrinsic dimensions')
    sections = data.get('book_intro', {}).get('sections', [])
    ids(sections, 'intro section')
    for section in sections:
        required(section, ['title_odia','title_english'], 'intro section')
        if not isinstance(section.get('paragraphs'), list) or not section['paragraphs']:
            raise ValueError('intro section requires paragraphs')
        for paragraph in section['paragraphs']:
            required(paragraph, ['odia','english'], 'intro paragraph')
            refs = paragraph.get('source_ids', [])
            if not isinstance(refs, list) or any(sid not in source_ids for sid in refs):
                raise ValueError('dangling intro source')
    return data

def book_cover(data):
    if not data.get('cover'):
        raise ValueError('Book cover metadata is required')
    return data['cover']

def intro_source_ids(data):
    return list(dict.fromkeys(sid for section in data.get('book_intro',{}).get('sections',[])
        for paragraph in section['paragraphs'] for sid in paragraph.get('source_ids',[])))

def introduction_html(data):
    intro=data['book_intro'];sections=intro.get('sections',[])
    if not sections:
        return ''.join(f'<p class="odia" lang="or">{esc(t)}</p>' for t in intro['odia'])+''.join(f'<p>{esc(t)}</p>' for t in intro['english'])
    parts=[]
    for section in sections:
        parts.append(f'<section id="intro-{esc(section["id"])}"><h2><span class="odia" lang="or">{esc(section["title_odia"])}</span><br>{esc(section["title_english"])}</h2>')
        for para in section['paragraphs']:
            parts.append(f'<p class="odia" lang="or">{esc(para["odia"])}</p><p>{esc(para["english"])}</p>')
        parts.append('</section>')
    return ''.join(parts)

CSS = """
@font-face{font-family:Odia;src:url('assets/NotoSerifOriya-Variable.woff2') format('woff2');font-display:swap}
@font-face{font-family:Reading;src:url('assets/SourceSerif4-Variable.woff2') format('woff2');font-display:swap}
:root{color-scheme:light;--ink:#243b3b;--muted:#536461;--paper:#f8f4e9;--line:#d7d2c2;--accent:#8a4029}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font:17px/1.7 Reading,Odia,Georgia,serif}
a{color:var(--accent);text-underline-offset:.2em}a:hover{text-decoration-thickness:2px}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #006b74;outline-offset:4px}
.skip{position:absolute;left:1rem;top:-10rem;background:white;padding:.5rem}.skip:focus{top:.5rem}
header{border-top:8px solid var(--accent);max-width:1120px;margin:auto;padding:4rem 2rem 2rem}
.eyebrow,.number,.tag,label,button,select,.meta{font:600 .78rem/1.5 system-ui,sans-serif;letter-spacing:.04em}
.eyebrow{text-transform:uppercase;color:var(--accent)}h1{font-size:clamp(2.7rem,6vw,5.2rem);line-height:1.1;letter-spacing:-.035em;margin:.7rem 0}
.subtitle{font-size:1.35rem;max-width:44rem}.scope{max-width:48rem;color:var(--muted)}.header-links{display:flex;flex-wrap:wrap;gap:1.4rem}
main{max-width:1120px;margin:auto;padding:0 2rem 3rem}.tools{border-block:1px solid var(--line);padding:1.4rem 0;margin:1rem 0 2rem}
.filters{display:grid;grid-template-columns:1fr 220px auto;gap:1rem;align-items:end}
label{display:block;margin-bottom:.4rem}input,select,button{font:inherit;border:1px solid #81918b;background:#fffdf7;color:var(--ink);padding:.7rem;border-radius:3px;width:100%}
button{cursor:pointer;width:auto}.status{color:var(--muted);margin:.8rem 0 0;font-size:.9rem}
.collection{display:grid;gap:2rem}.entry{background:#fffdf7;border:1px solid var(--line);border-radius:4px;padding:2rem;scroll-margin-top:1rem}
.entry-header{display:flex;gap:1rem;justify-content:space-between}.number{color:var(--accent)}.entry h2{font-family:Odia,serif;font-size:clamp(1.6rem,3vw,2.25rem);line-height:1.8;font-weight:600;margin:.6rem 0 1.2rem;overflow-wrap:anywhere}
.entry p{max-width:72ch}.entry h3{font:600 .82rem/1.5 system-ui,sans-serif;margin:1.6rem 0 .4rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.entry h3+p{margin-top:0}.transliteration{font-style:italic;color:var(--muted)}.tags{display:flex;flex-wrap:wrap;gap:.4rem}.tag{background:#eceede;padding:.2rem .6rem;border-radius:2rem;letter-spacing:0}
.details-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 2rem}details{border-top:1px solid var(--line);margin-top:1.5rem;padding-top:1rem}summary{cursor:pointer;font-weight:600}
.recorded-variants ul{padding-left:1.2rem}li{margin:.6rem 0}.odia{font-family:Odia,serif;line-height:1.9}.note{font-size:.92rem;color:var(--muted)}
figure{margin:1.8rem 0;max-width:760px}figure img{width:100%;height:auto;display:block}figcaption{font-size:.9rem;color:var(--muted);margin-top:.7rem}
#sources{margin-top:4rem;border-top:2px solid var(--ink);padding-top:1.5rem}.source{border-bottom:1px solid var(--line);padding:1rem 0;overflow-wrap:anywhere}.source h3{margin-bottom:.4rem}.source p{margin:.4rem 0}
footer{border-top:1px solid var(--line);padding:2rem;text-align:center;font-size:.88rem;color:var(--muted)}[hidden]{display:none!important}
@media(max-width:640px){header{padding:2.2rem 1.1rem 1.3rem}main{padding:0 1.1rem 2rem}.filters{grid-template-columns:1fr}.entry{padding:1.2rem}.details-grid{grid-template-columns:1fr}.subtitle{font-size:1.15rem}}
@media print{body{background:white;color:black;font-size:11pt}header{padding:1rem 0;border:0}main{padding:0}.tools,.header-links,.permalink,.skip{display:none!important}.entry{break-inside:avoid;padding:1rem 0;border:0;border-top:1px solid #aaa}.collection{gap:1rem}details>*,details:not([open])>*{display:block!important}details summary{display:block!important}details::details-content{content-visibility:visible!important;display:block!important}a{color:black}figure{max-width:450px}.source{break-inside:avoid}footer{padding:1rem}}
.shelves{display:flex;gap:.6rem;flex-wrap:wrap;margin:1.5rem 0}.shelves button{font:500 .9rem/1.4 system-ui,sans-serif;border:1px solid var(--line);border-radius:2rem;padding:.65rem 1rem;background:#fffdf7}.shelves button span{margin-left:.4rem;opacity:.7}.shelves button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.collection{gap:.7rem}.entry{padding:0;border-radius:5px}.saying-detail{margin:0;padding:0;border:0}.saying-detail>summary{padding:1.15rem 1.5rem;list-style:none}.saying-detail>summary::-webkit-details-marker{display:none}.saying-detail>summary:hover{background:#f0eadb}.saying-detail[open]>summary{border-bottom:1px solid var(--line)}.entry h2{font-size:1.35rem;line-height:1.85;margin:.45rem 0 0}.entry-title{font:500 .92rem/1.4 system-ui,sans-serif;margin:.4rem 0;color:var(--muted)}.open-hint{font:500 .8rem/1.5 system-ui,sans-serif;color:var(--accent);white-space:nowrap}.reading-body{padding:1.3rem 1.5rem 2rem;max-width:820px;margin:auto}.reading-body .details-grid{display:block}.reading-body p{line-height:1.85}.reading-body .permalink{font-size:.85rem}.saying-detail[open]{border-left:3px solid var(--accent)}#collection-heading{font-size:1.3rem;margin:1.2rem 0}#pagination{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin:1.5rem 0}button:disabled{opacity:.4;cursor:default}#page-label{font:500 .85rem system-ui,sans-serif}
@media(max-width:640px){.saying-detail>summary,.reading-body{padding:1rem}.entry h2{font-size:1.15rem}.shelves{gap:.45rem}.shelves button{font-size:.8rem;padding:.55rem .8rem}.entry-header .number{font-size:.65rem}#pagination button{font-size:.85rem}}
@media print{.shelves,#pagination,.open-hint{display:none!important}.entry[hidden]{display:block!important}.saying-detail>summary,.reading-body{padding:.5rem 0}.saying-detail[open]{border:0}.entry{break-inside:auto}.reading-body{max-width:none}}

"""
SHELVES = {
 'Choices & consequences': {'moderation','planning','foresight','timing','premature-action','premature-plans','practical-choices','short-term-choices','lasting-consequences','needless-delay','responsibility','underlying-causes'},
 'People & relationships': {'family-and-individual','cooperation','consultation','conflict','unequal-power','unequal-resources','unequal-attention','authority-and-judgment','bad-advice','double-dealing','shared-fault','gratitude-and-independence','contradictory-affection','feeling-unwelcome','familiarity'},
 'Words & appearances': {'speech','skillful-expression','empty-display','empty-presentation','empty-courtesy','empty-threats','concealment','self-disclosure','proof-and-value','discernment','judgement','intention-and-impact','exaggeration','integrity','self-awareness','self-scrutiny'},
 'Work & experience': {'work','work-and-reward','learning','experience','fruitless-effort','unsuitable-method','endurance','habit-and-change','resisting-change','unthinking-imitation','means-and-desire','means-and-promises','combined-errands'},
 'Feelings & everyday images': set(),
}
def shelf(entry):
    for title, tags in SHELVES.items():
        if tags.intersection(entry['tags']): return title
    return 'Feelings & everyday images'

JS = """
(() => {
 const search=document.querySelector('#search'), tag=document.querySelector('#tag');
 const cards=[...document.querySelectorAll('.entry')], status=document.querySelector('#result-count');
 const norm=s=>s.normalize('NFC').toLocaleLowerCase().replace(/\\s+/g,' ').trim();
 const texts=new Map(cards.map(c=>[c,norm(c.textContent)]));
 const chips=[...document.querySelectorAll('[data-filter-shelf]')];
 let page=1, activeShelf='', printing=false; const pageSize=12;
 function results(){const words=norm(search.value).split(' ').filter(Boolean);return cards.filter(c=>words.every(w=>texts.get(c).includes(w))&&(!activeShelf||c.dataset.shelf===activeShelf)&&(!tag.value||[...c.querySelectorAll('.tag')].some(t=>t.textContent===tag.value)));}
 function show(){
  const matches=results(), pages=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.min(page,pages);
  const shown=new Set(matches.slice((page-1)*pageSize,page*pageSize));cards.forEach(c=>c.hidden=!shown.has(c));
  status.textContent=matches.length?((page-1)*pageSize+1)+'–'+Math.min(page*pageSize,matches.length)+' of '+matches.length+' matching Dhaga · '+cards.length+' in the library':'No matching Dhaga · '+cards.length+' in the library';
  document.querySelector('#empty').hidden=matches.length!==0;
  document.querySelector('#page-label').textContent='Page '+page+' of '+pages;
  document.querySelector('#previous').disabled=page===1;document.querySelector('#next').disabled=page===pages;
  chips.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.filterShelf===activeShelf)));
 }
 function reset(){search.value='';tag.value='';activeShelf='';page=1;show();}
 search.addEventListener('input',()=>{page=1;show();});tag.addEventListener('change',()=>{page=1;show();});
 chips.forEach(c=>c.addEventListener('click',()=>{activeShelf=c.dataset.filterShelf;page=1;show();}));
 document.querySelector('#clear').addEventListener('click',()=>{reset();search.focus();});
 for(const [id,delta] of [['previous',-1],['next',1]])document.querySelector('#'+id).addEventListener('click',()=>{page+=delta;show();document.querySelector('#collection-heading').focus();});
 const panels=cards.map(c=>c.querySelector('.saying-detail'));
 panels.forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!printing)panels.forEach(other=>{if(other!==d)other.open=false;});}));
 function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const card=cards.find(c=>c.id===id);if(!card)return;reset();page=Math.floor(cards.indexOf(card)/pageSize)+1;show();const panel=card.querySelector('.saying-detail');panel.open=true;panel.querySelector('summary').focus();card.scrollIntoView({block:'start'});}
 window.addEventListener('hashchange',openHash);
 document.querySelector('#filters').hidden=false;document.querySelector('#shelves').hidden=false;document.querySelector('#pagination').hidden=false;show();openHash();
 let previous, disclosures;
 window.addEventListener('beforeprint',()=>{printing=true;previous=cards.map(c=>c.hidden);cards.forEach(c=>c.hidden=false);disclosures=[...document.querySelectorAll('details')].map(d=>[d,d.open]);disclosures.forEach(([d])=>d.open=true);});
 window.addEventListener('afterprint',()=>{if(previous)cards.forEach((c,i)=>c.hidden=previous[i]);if(disclosures)disclosures.forEach(([d,open])=>d.open=open);setTimeout(()=>printing=false,0);});
})();
"""

def render(data):
    # Keep production history in entry JSON; retain reading uncertainty in public prose.
    def public_copy(value):
        if isinstance(value,dict): return {k:public_copy(v) for k,v in value.items()}
        if isinstance(value,list): return [public_copy(v) for v in value]
        if isinstance(value,str):
            return value.replace('AI visual reading', 'Provisional visual reading').replace('reviewed by a separate AI reviewer; human Odia proofreading remains pending', 'with human Odia proofreading still pending')
        return value
    data=public_copy(data)
    validate(data)
    sources = {s['id']:s for s in data['sources']}
    cards = []
    for n, entry in enumerate(data['entries'], 1):
        fields = [('Literal meaning','literal_meaning'),('What it means','explanation'),
                  ('When you might use it','usage_example'),('Cultural context','cultural_context')]
        body = ''.join(f'<section><h3>{label}</h3><p>{esc(entry[key])}</p></section>' for label,key in fields)
        variants = ''.join(
            '<li><p class="odia" lang="or">'+source_heading(v['odia'])+'</p>'
            + ('<p>'+reader_language_spans(variant_explanation(entry['id'],number,v))+'</p>'
               if variant_explanation(entry['id'],number,v) else '')
            + ('<p><a href="'+esc(v['page_url'])+'">'+reader_language_spans(v['page_label'])+'</a></p>'
               if v.get('page_url') else '')+'</li>'
            for number,v in enumerate(entry.get('variants',[]),1))
        graphic = entry.get('graphic')
        figure = f'<figure><img src="{esc(graphic["src"])}" alt="{esc(graphic["alt"])}" loading="lazy"><figcaption>{esc(graphic["caption"])}</figcaption></figure>' if graphic else ''
        cards.append(f'''<article class="entry" id="{esc(entry['id'])}" data-shelf="{esc(shelf(entry))}">
<details class="saying-detail"><summary><span class="entry-header"><span class="number">DHAGA {n:02d}{' · '+esc(entry['category']) if entry.get('category') else ''}</span><span class="open-hint" aria-hidden="true">Read ↗</span></span>
{f'<p class="entry-title">{esc(entry["title"])}</p>' if entry.get('title') else ''}
<h2 lang="or">{source_heading(entry['odia'])}</h2></summary><div class="reading-body"><a class="permalink" href="#{esc(entry['id'])}">Link to this Dhaga</a>
{f'<p class="odia" lang="or">{esc(entry["meaning_odia"])}</p>' if entry.get('meaning_odia') else ''}

{f'<p class="transliteration">{esc(entry["transliteration"])}</p>' if entry.get('transliteration') else ''}
<div class="tags">{''.join(f'<span class="tag">{esc(t)}</span>' for t in entry['tags'])}</div>
<div class="details-grid">{body}</div>{figure}
{f'<section class="recorded-variants"><h3>Recorded variants</h3><ul>{variants}</ul></section>' if variants else ''}
</div></details></article>''')
    tags = sorted({t for e in data['entries'] for t in e['tags']})
    counts = {title:sum(shelf(e)==title for e in data['entries']) for title in SHELVES}
    shelves = ''.join(f'<button type="button" data-filter-shelf="{esc(title)}" aria-pressed="false">{esc(title)} <span>{count}</span></button>' for title,count in counts.items() if count)
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(data['title'])}</title><meta name="description" content="{esc(data['subtitle'])}"><style>{CSS}</style></head>
<body><a class="skip" href="#collection">Skip to Dhaga</a>
<header><p class="eyebrow">Project Odisha · A living research collection</p><h1>{esc(data['title'])}</h1>
<p class="subtitle">{esc(data['subtitle'])}</p><p class="scope">{esc(data['scope_note'])}</p>

<p class="scope">By Ahimanikya Satapathy · <a href="https://projectodisha.org/about/editorial-process/">Our editorial process</a></p>
{f'<p class="note"><strong>Collection licence:</strong> {esc(data["license"])}</p>' if data.get('license') else ''}
<p class="meta">Checked {esc(data['checked_on'])} · {len(cards)} documented entries</p></header>
<main><section id="shelves" class="shelves" aria-label="Browse thematic shelves" hidden><button type="button" data-filter-shelf="" aria-pressed="true">All Dhaga <span>{len(cards)}</span></button>{shelves}</section><section class="tools" aria-label="Find a Dhaga"><div class="filters" id="filters" hidden>
<div><label for="search">Search Odia or English</label><input id="search" type="search" placeholder="Words, meanings, situations…" autocomplete="off"></div>
<div><label for="tag">Theme</label><select id="tag"><option value="">All themes</option>{''.join(f'<option>{esc(t)}</option>' for t in tags)}</select></div>
<button id="clear" type="button">Clear filters</button></div><p class="status" id="result-count" role="status" aria-live="polite">{len(cards)} Dhaga — all entries are available below.</p>
<noscript><p>Search needs JavaScript. Every Dhaga and its sources remain readable below.</p></noscript></section>
<p id="empty" hidden>No Dhaga match. Try a different word or clear the filters.</p>
<h2 id="collection-heading" tabindex="-1">Find a Dhaga to open</h2><div id="collection" class="collection">{''.join(cards)}</div><nav id="pagination" aria-label="Library pages" hidden><button id="previous" type="button">← Previous</button><span id="page-label"></span><button id="next" type="button">Next →</button></nav>
</main>
<footer>Read locally, share carefully. Explanations and diagrams are contemporary aids, not evidence of a Dhaga’s age.<br>
Offline typefaces: Noto Serif Oriya and Source Serif 4, SIL Open Font License. Licences are included in assets/.</footer>
<script>{JS}</script></body></html>'''

def build(source, output):
    data = json.loads(Path(source).read_text(encoding='utf-8'))
    result = render(data)
    for entry in data['entries']:
        if entry.get('graphic') and not (Path(output).parent / entry['graphic']['src']).is_file():
            raise ValueError('missing graphic asset: '+entry['graphic']['src'])
    Path(output).write_text(result, encoding='utf-8')
    return len(data['entries'])


def load_library(directory=ROOT):
    directory=Path(directory)
    data=json.loads((directory/'collection-metadata.json').read_text())
    entries=[]
    for path in sorted((directory/'entries').glob('*.json')):
        entry=json.loads(path.read_text())
        if path.stem != entry.get('id'): raise ValueError('Entry filename must match its id')
        entries.append(entry)
    if not entries: raise ValueError('Entry folder must not be empty')
    data['entries']=entries
    return validate(data)

def library_index(data, directory=ROOT):
    design=json.loads((Path(directory)/'research-design.json').read_text())
    labels={s['id']:s['label'] for s in design['shelves']}
    by_id={}
    for e in data['entries']:
        theme=labels[design['id_to_shelf'][e['id']]]
        graphic=e.get('graphic')
        card_src=f"assets/cards/{e['id'].lower()}.webp"
        if not (Path(directory)/card_src).is_file():
            card_src=graphic['src'] if graphic else ''
        media=f'<img class="card-art" src="{esc(card_src)}" alt="{esc(graphic["alt"])}" loading="lazy" decoding="async">' if graphic else ''
        by_id[e['id']]=f'''<article class="index-row" id="{esc(e['id'])}" data-theme="{esc(design['id_to_shelf'][e['id']])}">{media}<p class="number">Dhaga {int(e['id'].rsplit('-',1)[-1]):02d} · {esc(theme)}</p><h3 lang="or">{source_heading(e['odia'])}</h3><div class="card-meanings"><p lang="or" class="odia">{esc(e['odia_summary'])}</p><p>{esc(e['english_summary'])}</p></div><a aria-label="Read the Dhaga and explanations for Dhaga {int(e['id'].rsplit('-',1)[-1])}" href="sayings/{esc(e['id'])}.html">Read the Dhaga and explanations →</a><span hidden>{esc(' '.join(e['tags']))} {esc(e.get('title',''))}</span></article>'''
    chapters=''.join(f'''<section class="chapter" id="chapter-{esc(s['id'])}"><h2 tabindex="-1">{esc(s['label'])}</h2><p>{esc(s['description'])}</p><div class="chapter-grid">{''.join(by_id[i] for i in s['entry_ids'])}</div><p class="chapter-back"><a href="#browse-controls">Back to search &amp; themes ↑</a></p></section>''' for s in design['shelves'])
    contents=''.join(f'''<li><a href="#chapter-{esc(s['id'])}">{esc(s['label'])} <span>· {len(s['entry_ids'])}</span></a></li>''' for s in design['shelves'])
    options=''.join(f'''<option value="{esc(s['id'])}">{esc(s['label'])}</option>''' for s in design['shelves'])
    cover=book_cover(data)
    byline=cover['byline'] if cover['byline'].startswith('By ') else 'By '+cover['byline']
    script=r"""(() => {
const q=document.querySelector('#book-search'),theme=document.querySelector('#book-theme'),clear=document.querySelector('#clear-search'),rows=[...document.querySelectorAll('.index-row')],count=document.querySelector('#result-count'),norm=s=>s.normalize('NFC').toLocaleLowerCase();let timer;
function filter(){const words=norm(q.value.trim()).split(/\s+/).filter(Boolean);let n=0;rows.forEach(r=>{r.hidden=!(words.every(w=>norm(r.textContent).includes(w))&&(!theme.value||r.dataset.theme===theme.value));if(!r.hidden)n++});document.querySelectorAll('.chapter').forEach(ch=>ch.hidden=![...ch.querySelectorAll('.index-row')].some(r=>!r.hidden));clear.hidden=!(q.value||theme.value);document.querySelector('#empty').hidden=!!n;clearTimeout(timer);timer=setTimeout(()=>count.textContent=n+' of '+rows.length+' Dhaga',180);}
q.disabled=false;theme.disabled=false;q.addEventListener('input',filter);theme.addEventListener('change',filter);clear.addEventListener('click',()=>{q.value='';theme.value='';filter();q.focus();});
document.querySelectorAll('.chapter-links a').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();q.value='';theme.value='';filter();history.pushState(null,'',a.hash);const h=document.querySelector(a.hash+' h2');if(h){h.focus({preventScroll:true});h.scrollIntoView({block:'start'});}}));
function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=id&&document.getElementById(id);if(!target||!(target.classList.contains('chapter')||target.classList.contains('index-row')))return;const chapter=target.closest('.chapter');if(target.hidden||(chapter&&chapter.hidden)){q.value='';theme.value='';filter();}const focus=target.classList.contains('chapter')?target.querySelector('h2'):target.querySelector('a');if(focus){focus.focus({preventScroll:true});target.scrollIntoView({block:'start'});}}
window.addEventListener('hashchange',revealHash);window.addEventListener('popstate',revealHash);
filter();revealHash();
})();"""
    css="""
[hidden]{display:none!important}.library-hero{display:grid;grid-template-columns:minmax(0,1fr) 8rem;gap:1.5rem;align-items:center;padding:1.5rem 2rem 1rem}.library-hero p{margin:.5rem 0}.library-hero .book-cover{width:100%;height:auto;display:block}.book-title{font-family:Odia,serif;font-size:clamp(1.6rem,1.1rem + 2vw,2.6rem);line-height:1.5;letter-spacing:0;margin:.2rem 0}.english-title{display:block;font-family:Reading,Georgia,serif;font-size:.8em;line-height:1.3}.library-hero .subtitle{font-size:1rem;line-height:1.6}.library-hero .eyebrow{font-size:.75rem}.book-actions{display:flex;gap:.6rem 1.5rem;flex-wrap:wrap;margin:.7rem 0}.book-actions a{padding:.4rem 0}.library-main{max-width:72rem}.browse-controls{border-block:1px solid var(--line);padding:1rem 0;scroll-margin-top:1rem}.filter-fields{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:1rem}.filter-fields label{display:block;margin-bottom:.3rem}.filter-fields input,.filter-fields select{box-sizing:border-box;width:100%;min-width:0;min-height:2.75rem;font:inherit;padding:.5rem;background:var(--paper,#fffaf0);color:inherit;border:1px solid var(--muted);border-radius:.2rem}.filter-state{display:flex;flex-wrap:wrap;align-items:center;gap:1rem;margin:.7rem 0 0}.filter-state p{margin:0}#clear-search{font:inherit;padding:.45rem .7rem;cursor:pointer}.chapter-links{padding:.6rem 0}.chapter-links ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));list-style:none;padding:0;margin:.4rem 0;gap:.15rem 1rem}.chapter-links li{margin:0}.chapter-links a{display:block;padding:.35rem 0;overflow-wrap:anywhere}.chapter-links span{color:var(--muted);white-space:nowrap}.book-intro-disclosure{margin:1rem 0 2rem;padding:.8rem 1rem}.book-intro-disclosure>summary{cursor:pointer;font-weight:600}.book-intro{max-width:72ch}.book-intro p{line-height:1.75}/* Ordinary grid flow preserves reading and keyboard order. No media slot for text-only cards. */
.chapter{margin:2.5rem 0 3.5rem}.chapter>h2{font-size:1.65rem;line-height:1.4;scroll-margin-top:1rem;margin-bottom:.4rem}.chapter>p{color:var(--muted);max-width:70ch}.chapter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem;align-items:stretch;margin-top:1.4rem}.index-row{display:flex;flex-direction:column;min-inline-size:0;background:#fffdf7;border:1px solid var(--line);border-radius:.55rem;padding:1.15rem;box-shadow:0 3px 12px #243b3b08;overflow-wrap:anywhere;scroll-margin-top:1rem}.index-row:focus-within{border-color:var(--accent)}.index-row .card-art{display:block;inline-size:100%;block-size:11rem;object-fit:contain;margin:0 0 1rem;background:#faf7ee;border-radius:.25rem}.index-row h3{font:600 1.5rem/1.9 Odia,serif;letter-spacing:0;margin:.65rem 0 1rem;color:var(--ink)}.index-row p{margin:.65rem 0;line-height:1.7}.index-row p.odia{line-height:1.9;font-size:1.05rem}.index-row .number{font-size:.7rem;line-height:1.6;color:var(--accent);margin:0;letter-spacing:.045em}.card-meanings{flex:1;border-top:1px solid #e8e1d2;padding-top:.3rem}.card-meanings>p:last-child{font-size:.98rem;color:var(--muted)}.index-row>a{display:block;border-top:1px solid #e8e1d2;padding:.85rem 0 0;margin-top:1.1rem;font:600 .8rem/1.65 system-ui,sans-serif;text-decoration-thickness:1px}.index-row:not(:has(>.card-art)){border-top:3px solid #ae7656;background:linear-gradient(145deg,#fffdf7,#f6efdf)}@media(max-width:1000px){.chapter-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}}@media(max-width:600px){.chapter-grid{grid-template-columns:minmax(0,1fr)}.index-row{padding:1.1rem}.index-row .card-art{block-size:12rem}}
.library-main :where(a,button,input,select,summary):focus-visible{outline:3px solid var(--accent);outline-offset:3px}.chapter-back{margin-top:1rem}.web-reading-links{margin:.5rem 0}.web-reading-links a{display:inline-block;padding:.35rem 0;margin-right:1rem}@media(max-width:600px){.library-hero{grid-template-columns:minmax(0,1fr) 4.5rem;gap:.8rem;padding:1rem 1.1rem}.filter-fields{grid-template-columns:1fr;gap:.65rem}.chapter-links ol{grid-template-columns:1fr}.index-row h3{font-size:1.35rem}.book-actions{gap:.3rem 1rem}.library-hero .subtitle{font-size:.9rem}.library-main{padding-inline:1.1rem}}@media print{.browse-controls,.chapter-links,.book-actions,.chapter-back{display:none!important}.index-row[hidden],.chapter[hidden]{display:block!important}.book-intro-disclosure>*{display:block!important}.index-row{break-inside:avoid}}
"""
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(cover['title_english']+' — '+cover['title_odia'])}</title><style>{CSS}{css}</style></head><body><a class="skip" href="#browse-controls">Skip to search and Dhaga</a><header class="library-hero"><div><p class="eyebrow">Project Odisha · A book of Odia Dhaga</p><h1 class="book-title"><span class="english-title" lang="en">{esc(cover['title_english'])}</span><span lang="or">{esc(cover['title_odia'])}</span></h1><p class="subtitle">{esc(cover['subtitle'])}</p><p>{esc(byline)}</p></div><img class="book-cover" src="{esc(cover['src'])}" width="{cover['width']}" height="{cover['height']}" alt="{esc(cover['alt'])}"></header><main class="library-main"><nav class="book-actions" aria-label="Read or download"><a href="reader.html">Start reading →</a><a href="odia-dhaga-book.pdf" download>Download book</a></nav><div class="browse-controls" id="browse-controls" tabindex="-1"><div class="filter-fields"><div><label for="book-search">Search in Odia or English</label><input id="book-search" type="search" autocomplete="off" disabled></div><div><label for="book-theme">Theme</label><select id="book-theme" disabled><option value="">All themes</option>{options}</select></div></div><div class="filter-state"><p id="result-count" role="status">{len(data['entries'])} Dhaga</p><button id="clear-search" type="button" hidden>Clear filters</button></div><p id="empty" hidden>No Dhaga match. Try another word or clear the filters.</p><noscript>Search needs JavaScript. All Dhaga and chapter links remain available below.</noscript></div><nav class="chapter-links" aria-label="Chapters"><ol>{contents}</ol></nav><!-- dhaga-reading-links --><details class="book-intro-disclosure"><summary>About this book · read the full introduction</summary><article class="book-intro" aria-label="About Odia Dhaga">{introduction_html(data)}</article></details><div id="collection">{chapters}</div></main><footer><nav aria-label="Book resources"><a href="https://projectodisha.org/about/editorial-process/">Our editorial process</a></nav></footer><script>{script}</script></body></html>'''

def reading_caption(text):
    # Keep internal credits separate; retain explanatory/uncertainty text.
    text=re.sub(r'\s*Original illustration for Project Odisha\s*·\s*CC BY-SA\s*4\.0\.?', '', text)
    text=re.sub(r'\s*CC BY-SA\s*4\.0\.?', '', text)
    text=text.replace(' by Project Odisha,;', ';').replace(' by Project Odisha,', '').replace(' for Project Odisha, approved by the Founder;', ';').replace(' for Project Odisha;', ';')
    return text.strip()

def narrative_credit_parts(entry, sources):
    """Plain editorial credit with optional exact registry-title links; never raw markup."""
    text=entry.get('narrative_credit') or 'Explanation by Project Odisha.'
    if not isinstance(text,str):raise ValueError('narrative_credit must be a plain string')
    titles={source['title']:source['url'] for source in sources if source.get('title') and source.get('url')}
    if not titles:return [(text,None)]
    pattern='|'.join(re.escape(title) for title in sorted(titles,key=len,reverse=True))
    parts=[];start=0
    for match in re.finditer(pattern,text):
        if match.start()>start:parts.append((text[start:match.start()],None))
        parts.append((match.group(),titles[match.group()]));start=match.end()
    if start<len(text):parts.append((text[start:],None))
    return parts

def narrative_credit_html(entry, sources):
    return ''.join(f'<a href="{esc(url)}">{esc(text)}</a>' if url else esc(text)
                   for text,url in narrative_credit_parts(entry,sources))


def consolidate_entry_sources(page, entry, data):
    """Keep textual qualifications in their original disclosure, without a bibliography."""
    if entry.get('graphic'):
        page=page.replace(esc(entry['graphic']['caption']),esc(reading_caption(entry['graphic']['caption'])))
    return page.replace('Anvesha and Disha visually inspected the scan.', 'The scan was visually inspected.')


BROWSE_CSS = """
.saying-nav{display:flex;align-items:center;justify-content:center;gap:.65rem;position:relative;margin:1.25rem 0;font-size:.88rem;flex-wrap:wrap}
.saying-nav>a,.saying-nav>span{white-space:nowrap}.saying-nav .nav-count{font-variant-numeric:tabular-nums;color:var(--muted);font-size:.8rem}
.saying-nav .browse{margin:0;border:0;padding:0}.browse>summary{cursor:pointer;white-space:nowrap;padding:.45rem .5rem}
.browse-panel{position:absolute;z-index:20;top:100%;left:50%;transform:translateX(-50%);width:min(36rem,calc(100vw - 2rem));max-height:min(28rem,65vh);overflow:auto;padding:1rem;background:#fffaf0;color:#29251f;border:1px solid #bdb09a;box-shadow:0 8px 28px #0002;border-radius:.4rem;box-sizing:border-box;text-align:left}
.saying-nav-bottom .browse-panel{top:auto;bottom:100%}.browse-panel input{box-sizing:border-box;width:100%;margin:.4rem 0}.browse-panel ul{padding:0;list-style:none;margin:.6rem 0}.browse-panel li{border-top:1px solid #d8cdbb}.browse-panel a{display:block;padding:.65rem .2rem;text-decoration:none}.browse-panel a span{display:block}.browse-panel [lang=or]{font-family:Odia,serif;line-height:1.8}.browse-panel a[aria-current=page]{font-weight:bold}.browse-panel [hidden]{display:none!important}
@media(max-width:430px){.saying-nav{gap:.4rem;font-size:.8rem}.browse>summary{padding:.45rem .15rem}.saying-nav .nav-count{font-size:.7rem}}
@media print{.saying-nav{display:none!important}}
"""
BROWSE_JS = """
document.querySelectorAll('.browse').forEach(details=>{
 const input=details.querySelector('input'), rows=[...details.querySelectorAll('li')], status=details.querySelector('[role=status]'), empty=details.querySelector('.browse-empty');
 input.addEventListener('input',()=>{const q=input.value.normalize('NFC').trim().toLocaleLowerCase();let n=0;rows.forEach(row=>{row.hidden=!row.textContent.normalize('NFC').toLocaleLowerCase().includes(q);if(!row.hidden)n++;});status.textContent=n+' Dhaga';empty.hidden=n!==0;});
 details.addEventListener('keydown',event=>{if(event.key==='Escape'&&details.open){details.open=false;details.querySelector('summary').focus();event.preventDefault();event.stopPropagation();}});
 details.addEventListener('toggle',()=>{if(details.open)document.querySelectorAll('.browse').forEach(other=>{if(other!==details)other.open=false;});});
 document.addEventListener('click',event=>{if(details.open&&!details.contains(event.target))details.open=false;});
});
"""
def saying_navigation(data, current, position):
    entries=data['entries']; e=entries[current]; suffix=position+'-'+e['id']
    previous=f'<a rel="prev" href="{entries[current-1]["id"]}.html" aria-label="Previous Dhaga">← Previous</a>' if current else '<span>First</span>'
    following=f'<a rel="next" href="{entries[current+1]["id"]}.html" aria-label="Next Dhaga">Next →</a>' if current+1<len(entries) else '<span>Last</span>'
    rows=[]
    for item in entries:
        active=' aria-current="page"' if item['id']==e['id'] else ''
        rows.append(f'<li><a href="{esc(item["id"])}.html"{active}><span lang="or">{esc(item["odia"])}</span><span lang="en">{esc(item.get("title",item.get("literal_english","")))}</span></a></li>')
    return f'<nav class="saying-nav saying-nav-{position}" aria-label="{position.title()} Dhaga navigation">{previous}<details class="browse" id="browse-{suffix}"><summary>Browse Dhaga</summary><div class="browse-panel"><a href="../index.html">Book contents &amp; themes →</a><label for="browse-search-{suffix}">Search in Odia or English</label><input id="browse-search-{suffix}" type="search" autocomplete="off"><p role="status">{len(entries)} Dhaga</p><p class="browse-empty" hidden>No Dhaga match. Try another word.</p><ul>{"".join(rows)}</ul></div></details><span class="nav-count">{current+1}/{len(entries)}</span>{following}</nav>'

def build_library(directory=ROOT):
    directory=Path(directory);data=load_library(directory)
    (directory/'collection.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    (directory/'index.html').write_text(library_index(data,directory))
    dest=directory/'sayings';dest.mkdir(exist_ok=True)
    for i,e in enumerate(data['entries']):
        one={**data,'entries':[e]}
        page=consolidate_entry_sources(render(one),e,one)
        page=re.sub(r'<script>.*?</script>','',page,flags=re.S)
        page=re.sub(r'<section id="shelves".*?</section>','',page,flags=re.S)
        page=re.sub(r'<section class="tools".*?</section>','',page,flags=re.S)
        page=re.sub(r'<nav id="pagination".*?</nav>','',page,flags=re.S)
        page=re.sub(r'<span class="open-hint"[^>]*>.*?</span>','',page,flags=re.S)
        page=page.replace('<details class="saying-detail">','<details class="saying-detail" open>')
        page=page.replace('Find a Dhaga to open','').replace('DHAGA 01',f'DHAGA {i+1:02d}')
        page=page.replace('<h1>'+esc(data['title'])+'</h1>','<h1>'+esc(e.get('title',e['odia']))+'</h1>')
        page=page.replace('href="#'+e['id']+'"','href="../index.html#'+e['id']+'"')
        page=page.replace("url('assets/","url('../assets/").replace('src="assets/','src="../assets/')
        for name in ['README.md','coverage-ledger.json','source127.html','collection.json']:
            page=page.replace('href="'+name+'"','href="../'+name+'"')
        header=f'<header><p class="eyebrow">Project Odisha · A book of Odia Dhaga</p><h1>{esc(e.get("title",e["odia"]))}</h1><p>By Ahimanikya Satapathy</p></header>'
        page=re.sub(r'<header>.*?</header>',header,page,count=1,flags=re.S)
        page=page.replace('<main>','<main>'+saying_navigation(data,i,'top')).replace('</main>',saying_navigation(data,i,'bottom')+'</main>',1)
        page=page.replace('</head>','<style>'+BROWSE_CSS+'</style></head>').replace('</body>','<script>'+BROWSE_JS+'</script></body>')
        (dest/(e['id']+'.html')).write_text(page)
    links=''.join(f'<li><a href="sayings/{e["id"]}.html">{esc(e.get("title",e["odia"]))}</a></li>' for e in data['entries'])
    ids=json.dumps([e['id'] for e in data['entries']])
    (directory/'reader.html').write_text(f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Choose a Dhaga</title><style>{CSS}</style><body><main><h1>Open a Dhaga</h1><p><a href="index.html">Browse all Dhaga and themes</a></p><ul>{links}</ul></main><script>const ids={ids};let id=location.hash.slice(1);if(!ids.includes(id))id=ids[0];location.replace("sayings/"+id+".html");</script></body></html>''')
    return len(data['entries'])

if __name__ == '__main__':
    print(f'Built {build_library()} individual readings and bilingual collection article')
