#!/usr/bin/env python3
"""Build the offline, source-linked Odia dhaga collection. Python standard library only."""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent

def esc(value):
    return html.escape(str(value), quote=True)

def source_heading(value):
    """Escape source text, retaining intentional verse divisions."""
    return esc(value).replace("\n", "<br>")

def required(obj, fields, context):
    for field in fields:
        if not isinstance(obj.get(field), str) or not obj[field].strip():
            raise ValueError(f'{context}: missing {field}')

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
        required(source, ['title', 'url', 'access', 'rights', 'limits'], source['id'])
        url = urlparse(source['url'])
        if url.scheme not in ('https', 'http') or not url.netloc:
            raise ValueError('source URL must be HTTP(S)')
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
    ids=intro_source_ids(data);sources={s['id']:s for s in data['sources']};parts=[]
    for section in sections:
        parts.append(f'<section id="intro-{esc(section["id"])}"><h2><span class="odia" lang="or">{esc(section["title_odia"])}</span><br>{esc(section["title_english"])}</h2>')
        for index,para in enumerate(section['paragraphs']):
            anchor=f'intro-ref-{section["id"]}-{index}'
            refs=' '.join(f'<a href="#intro-source-{esc(sid)}" aria-label="Source {ids.index(sid)+1}">[{ids.index(sid)+1}]</a>' for sid in para.get('source_ids',[]))
            parts.append(f'<p class="odia" lang="or" id="{esc(anchor)}-or">{esc(para["odia"])} <sup>{refs}</sup></p><p id="{esc(anchor)}">{esc(para["english"])} <sup>{refs}</sup></p>')
        parts.append('</section>')
    if ids:
        parts.append('<section aria-label="Introduction sources"><h2>Notes to the introduction</h2><ol>')
        for sid in ids:
            source=sources[sid]
            backs=[(f'intro-ref-{section["id"]}-{i}',section['title_english'],i+1) for section in sections for i,p in enumerate(section['paragraphs']) if sid in p.get('source_ids',[])]
            returns=' '.join(f'<a href="#{esc(anchor)}-or" aria-label="Return to Odia reference: {esc(title)}, paragraph {number}">↩ Odia ({esc(title)}, {number})</a> <a href="#{esc(anchor)}" aria-label="Return to English reference: {esc(title)}, paragraph {number}">↩ English ({esc(title)}, {number})</a>' for anchor,title,number in backs)
            detail=source.get('citation') or source.get('bibliography') or source.get('locator','')
            parts.append(f'<li id="intro-source-{esc(sid)}"><a href="{esc(source["url"])}">{esc(source["title"])}</a> {esc(detail)} {returns}</li>')
        parts.append('</ol></section>')
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
.witnesses{padding-left:1.2rem}li{margin:.6rem 0}.odia{font-family:Odia,serif;line-height:1.9}.note{font-size:.92rem;color:var(--muted)}
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
        witnesses = ''.join(f'<li><a href="#source-{esc(w["source_id"])}">{esc(sources[w["source_id"]]["title"])}</a> — {esc(w["locator"])}'
                             + (f'<p class="odia" lang="or">{esc(w["wording"])}</p>' if w.get('wording') else '')
                             + (f'<p class="note">{esc(w["note"])}</p>' if w.get('note') else '') + '</li>' for w in entry['witnesses'])
        variants = ''.join(f'<li><span class="odia" lang="or">{esc(v["odia"])}</span> — {esc(v["note"])}'
                            + (f' <a href="#source-{esc(v["source_id"])}">Source</a>' if v.get('source_id') else '') + '</li>' for v in entry.get('variants', []))
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
<details><summary>Witnesses, variants &amp; limits</summary><ul class="witnesses">{witnesses}</ul>
{f'<h3>Recorded variants</h3><ul>{variants}</ul>' if variants else '<p class="note">No additional variant is documented in this entry.</p>'}
<h3>Origins and uncertainty</h3><p>{esc(entry['origin_note'].replace('Meanings here are original editorial interpretations with human Odia proofreading still pending.', 'The interpretation remains provisional.'))}</p>
<h3>Reuse and rights</h3><p>{esc(entry['rights_note'])}</p></details></div></details></article>''')
    cited_source_ids = {item['source_id'] for entry in data['entries']
                        for item in entry['witnesses'] + entry.get('variants', [])
                        if item.get('source_id')}
    bibliography = ''.join(f'''<section class="source" id="source-{esc(s['id'])}"><h3><a href="{esc(s['url'])}">{esc(s['title'])}</a></h3>
{f'<p class="meta">Status: {esc(s["status"])}</p>' if s.get('status') else ''}
{f'<p><strong>Bibliography:</strong> {esc(s["bibliography"])}</p>' if s.get('bibliography') else ''}
<p><strong>Access:</strong> {esc(s['access'])}</p><p><strong>Rights:</strong> {esc(s['rights'])}</p>
<p><strong>Limits:</strong> {esc(s['limits'])}</p></section>''' for s in data['sources'] if s['id'] in cited_source_ids)
    tags = sorted({t for e in data['entries'] for t in e['tags']})
    counts = {title:sum(shelf(e)==title for e in data['entries']) for title in SHELVES}
    shelves = ''.join(f'<button type="button" data-filter-shelf="{esc(title)}" aria-pressed="false">{esc(title)} <span>{count}</span></button>' for title,count in counts.items() if count)
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(data['title'])}</title><meta name="description" content="{esc(data['subtitle'])}"><style>{CSS}</style></head>
<body><a class="skip" href="#collection">Skip to Dhaga</a>
<header><p class="eyebrow">Project Odisha · A living research collection</p><h1>{esc(data['title'])}</h1>
<p class="subtitle">{esc(data['subtitle'])}</p><p class="scope">{esc(data['scope_note'])}</p>
<nav class="header-links" aria-label="Collection resources"><a href="#sources">Sources &amp; rights</a><a href="README.md">Research guide</a><a href="coverage-ledger.json">Coverage ledger</a><a href="source127.html">Research: 127 source items</a><a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0 licence</a><a href="collection.json" download>Download collection JSON</a></nav>
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
<section id="sources"><h2>Sources &amp; rights</h2><p>Sources cited by the Dhaga above, including recorded variants. Availability is not a reuse licence. External source links require an internet connection.</p>{bibliography}</section></main>
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
    abstracts={'intro':data['book_intro'],'summaries':{e['id']:e for e in data['entries']}}
    mapping=design['id_to_shelf']
    labels={x['id']:x['label'] for x in design['shelves']}
    titles=[x['label'] for x in design['shelves']]
    rows=[]
    for e in data['entries']:
        theme=labels[mapping[e['id']]]
        rows.append(f'''<article class="index-row" id="{esc(e["id"])}" data-theme="{esc(theme)}"><p class="number">Dhaga {int(e["id"].rsplit("-",1)[-1]):02d} · {esc(theme)}</p><h2 lang="or">{source_heading(e["odia"])}</h2><p lang="or" class="odia">{esc(abstracts['summaries'][e['id']]['odia_summary'])}</p><p>{esc(abstracts['summaries'][e['id']]['english_summary'])}</p><a href="sayings/{esc(e["id"])}.html">Read the Dhaga, context &amp; sources →</a><span hidden>{esc(' '.join(e['tags']))} {esc(e.get('title',''))}</span></article>''')
    introduction=introduction_html(data)
    cover=book_cover(data)
    web_byline=cover['byline'] if cover['byline'].startswith('By ') else 'By '+cover['byline']
    by_id={e['id']:row for e,row in zip(data['entries'],rows)}
    chapters=''.join(f'<section class="chapter" id="chapter-{esc(ch["id"])}"><h2>{esc(ch["label"])}</h2><p>{esc(ch["description"])}</p>{"".join(by_id[ident] for ident in ch["entry_ids"])}</section>' for ch in design['shelves'])
    contents=''.join(f'<li><a href="#chapter-{esc(ch["id"])}">{esc(ch["label"])} <span>· {len(ch["entry_ids"])} Dhaga</span></a></li>' for ch in design['shelves'])
    script="""(() => {
const q=document.querySelector('#book-search'),menu=document.querySelector('#browse-book'),clear=document.querySelector('#clear-search'),rows=[...document.querySelectorAll('.index-row')],norm=s=>s.normalize('NFC').toLocaleLowerCase();
function filter(){const value=q.value.trim(),words=norm(value).split(/\\s+/).filter(Boolean);let n=0;rows.forEach(r=>{r.hidden=!words.every(w=>norm(r.textContent).includes(w));if(!r.hidden)n++});document.querySelectorAll('.chapter').forEach(ch=>ch.hidden=![...ch.querySelectorAll('.index-row')].some(r=>!r.hidden));document.querySelector('#result-count').textContent=n+' of '+rows.length;document.querySelector('#active-filter').textContent=value?'Search: '+value:'';clear.hidden=!value;document.querySelector('#empty').hidden=!!n;}
q.addEventListener('input',filter);clear.addEventListener('click',()=>{q.value='';filter();menu.querySelector('summary').focus();});
menu.querySelectorAll('a[href^="#chapter-"]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();q.value='';filter();menu.open=false;history.pushState(null,'',a.getAttribute('href'));const heading=document.querySelector(a.getAttribute('href'))?.querySelector('h2');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});}}));
menu.addEventListener('toggle',()=>{if(menu.open)menu.querySelector('.book-browse-panel').scrollTop=0;});
menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();e.preventDefault();}});
document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
document.querySelector('#book-search-tools').hidden=false;filter();
})();"""
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(cover["title_english"] + " — " + cover["title_odia"])}</title><style>{CSS} .book-cover{{display:block;width:min(100%,32rem);height:auto;margin:1.5rem auto 0}} .book-title{{font-family:Odia,serif;font-size:clamp(2.3rem,6vw,4.8rem);line-height:1.5;letter-spacing:0}}.book-toolbar{{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;position:relative;max-width:760px;margin:1rem auto;font-size:.9rem}}.book-toolbar>details{{border:0;margin:0;padding:0}}.book-toolbar summary{{cursor:pointer;white-space:nowrap;padding:.4rem}}.book-toolbar>a{{white-space:nowrap}}#result-count{{font-size:.8rem;color:var(--muted)}}.book-browse-panel{{position:absolute;z-index:20;left:50%;transform:translateX(-50%);top:100%;width:min(36rem,calc(100vw - 2rem));max-height:min(30rem,45vh);overflow:auto;box-sizing:border-box;background:#fffaf0;border:1px solid #bdb09a;border-radius:.4rem;box-shadow:0 8px 28px #0002;padding:1rem;text-align:left}}.book-browse-panel input{{width:100%;box-sizing:border-box;margin:.5rem 0}}.book-browse-panel h2{{font-size:1rem}}.book-browse-panel li a{{display:block;padding:.45rem 0}}.search-state{{max-width:760px;margin:.7rem auto;display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}}.search-state:has(#clear-search[hidden]){{display:none}}#clear-search[hidden]{{display:none!important}}@media(max-width:430px){{.book-toolbar{{gap:.5rem;font-size:.8rem}}}}@media print{{.book-toolbar,.search-state,#empty{{display:none!important}}}}.english-title{{display:block;font-family:Reading,Georgia,serif;font-size:.72em;line-height:1.3;margin-top:.15em}}.book-intro{{max-width:760px;margin:2rem auto}}.index-row{{border-top:1px solid var(--line);padding:1.5rem 0;max-width:760px;margin:auto}}.index-row h2{{font:600 1.35rem/1.9 Odia,serif}}.index-row p{{margin:.7rem 0}}@media print{{.index-row[hidden],.chapter[hidden]{{display:block!important}}.index-row{{break-inside:avoid}}}}</style></head><body><a class="skip" href="#collection">Skip to Dhaga</a><header><p class="eyebrow">Project Odisha · A book of Odia Dhaga</p><h1 class="book-title"><span class="english-title" lang="en">{esc(cover["title_english"])}</span><span lang="or">{esc(cover["title_odia"])}</span></h1><p class="subtitle">{esc(cover["subtitle"])}</p><p>{esc(web_byline)}</p><img class="book-cover" src="{esc(cover['src'])}" width="{cover['width']}" height="{cover['height']}" fetchpriority="high" alt="{esc(cover['alt'])}"></header><main><nav class="book-toolbar" aria-label="Browse the book"><a href="reader.html">Start reading →</a><details id="browse-book"><summary>Browse book</summary><div class="book-browse-panel"><div id="book-search-tools" hidden><label for="book-search">Search in Odia or English</label><input id="book-search" type="search" autocomplete="off"></div><h2>Chapters</h2><ol>{contents}</ol></div></details><a href="odia-dhaga-book.pdf" download>Download book</a><span id="result-count" role="status">{len(rows)} Dhaga</span></nav><div class="search-state"><span id="active-filter"></span><button id="clear-search" type="button" hidden>Clear search</button></div><p id="empty" hidden>No Dhaga match. Try another word, or empty the search box.</p><noscript>All Dhaga remain available below. Open each reading for its sources.</noscript><article class="book-intro" aria-label="About Odia Dhaga">{introduction}</article><div id="collection">{chapters}</div></main><footer><nav aria-label="Book resources"><a href="https://projectodisha.org/about/editorial-process/">Our editorial process</a> · <a href="source127.html">Source concordance</a> · <a href="README.md">Research guide</a></nav><details><summary>Sources &amp; rights</summary><p>{esc(data.get("license",""))}</p><p><a href="https://creativecommons.org/licenses/by-sa/4.0/">Read the CC BY-SA4.0 licence</a>. Each Dhaga links its own witnesses.</p></details></footer><script>{script}</script></body></html>'''

def reading_caption(text):
    # Credits are collected at the end; retain the image's explanatory/uncertainty text.
    text=re.sub(r'\s*Original illustration for Project Odisha\s*·\s*CC BY-SA\s*4\.0\.?', '', text)
    text=re.sub(r'\s*CC BY-SA\s*4\.0\.?', '', text)
    text=text.replace(' by Project Odisha,;', ';').replace(' by Project Odisha,', '').replace(' for Project Odisha, approved by the Founder;', ';').replace(' for Project Odisha;', ';')
    return text.strip()

def consolidate_entry_sources(page, entry, data):
    # Keep exact witness locators and source links; internal access/status logs stay in JSON.
    sources={source['id']:source for source in data['sources']}
    for sid in dict.fromkeys(w['source_id'] for w in entry['witnesses']+entry.get('variants',[]) if w.get('source_id')):
        source=sources[sid]
        creator=source.get('creator') or source.get('author')
        domain=urlparse(source['url']).netloc
        if not creator:creator='Odia Wiktionary contributors' if 'wiktionary' in domain else 'Wikimedia Incubator contributors' if 'incubator.wikimedia' in domain else ''
        credit=f'<section class="source" id="source-{esc(sid)}"><h3><a href="{esc(source["url"])}">{esc(source["title"])}</a></h3>'
        if creator:credit+=f'<p>{esc(creator)}</p>'
        detail=source.get('citation') or source.get('bibliography','')
        if detail:credit+=f'<p>{esc(detail)}</p>'
        if 'scert' in sid:
            credit+='<p>SCERT Odisha, 2024, p.139. Brief quotations retain separate source rights; not openly licensed.</p>'
        elif '1893' in sid:
            credit+='<p>Historical witness; publisher is not assumed to be author. Transcription and reuse remain qualified.</p>'
        elif not ('wiktionary' in domain or 'incubator.wikimedia' in domain):credit+=f'<p>{esc(source["rights"])}</p>'
        credit+='</section>'
        page=re.sub(r'<section class="source" id="source-'+re.escape(sid)+r'">.*?</section>',lambda m:credit,page,count=1,flags=re.S)
    # Move passage-specific details into the single source area.
    page=re.sub(r'<details><summary>Witnesses, variants &amp; limits</summary>.*?</details>', '', page, count=1, flags=re.S)
    def public_note(text):
        return esc(text.replace('Meanings here are original editorial interpretations with human Odia proofreading still pending.', 'The interpretation remains provisional.').replace('AI visual reading','Provisional visual reading').replace('reviewed by a separate AI reviewer; human Odia proofreading remains pending','with human Odia proofreading still pending').replace('Meanings here are original editorial interpretations with human Odia proofreading still pending.', 'The interpretation remains provisional.'))
    for sid in dict.fromkeys(x['source_id'] for x in entry['witnesses']+entry.get('variants',[]) if x.get('source_id')):
        additions=[]
        for w in entry['witnesses']:
            if w['source_id']!=sid: continue
            additions.append('<p><strong>Passage:</strong> '+esc(w['locator'])+'</p>')
            if w.get('wording'):additions.append('<p class="odia" lang="or">'+esc(w['wording'])+'</p>')
            if w.get('note'):additions.append('<p class="note">'+public_note(w['note'])+'</p>')
        for v in entry.get('variants',[]):
            if v.get('source_id')!=sid: continue
            additions.append('<p><strong>Recorded variant:</strong> <span class="odia" lang="or">'+esc(v['odia'])+'</span></p><p>'+public_note(v['note'])+'</p>')
            if v.get('locator'):additions.append('<p>'+esc(v['locator'])+'</p>')
        pattern=r'(<section class="source" id="source-'+re.escape(sid)+r'">.*?</h3>)'
        page=re.sub(pattern,lambda m:m.group(1)+''.join(additions),page,count=1,flags=re.S)
    if entry.get('graphic'):
        page=page.replace(esc(entry['graphic']['caption']),esc(reading_caption(entry['graphic']['caption'])))
    page=page.replace('Offline typefaces: Noto Serif Oriya and Source Serif 4, SIL Open Font License. Licences are included in assets/.','')
    extra='<h3>Origins and uncertainty</h3><p>'+public_note(entry['origin_note'])+'</p><h3>Entry reuse</h3><p>'+esc(entry['rights_note'])+'</p><p>Original commentary and illustrations: Project Odisha · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Fonts: Noto Serif Oriya and Source Serif 4, SIL Open Font License.</p>'
    for v in entry.get('variants',[]):
        if not v.get('source_id'):extra+='<p class="odia" lang="or">'+esc(v['odia'])+'</p><p>'+public_note(v['note'])+'</p>'
    page=page.replace('<section id="sources"><h2>Sources &amp; rights</h2>','<section id="sources"><details open><summary>Sources &amp; rights</summary>'+extra)
    page=page.replace('</section></main>', '</details></section></main>', 1)
    return page


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
        page=page.replace('<main>','<main>'+saying_navigation(data,i,'top')).replace('<section id="sources">',saying_navigation(data,i,'bottom')+'<section id="sources">',1)
        page=page.replace('</head>','<style>'+BROWSE_CSS+'</style></head>').replace('</body>','<script>'+BROWSE_JS+'</script></body>')
        (dest/(e['id']+'.html')).write_text(page)
    links=''.join(f'<li><a href="sayings/{e["id"]}.html">{esc(e.get("title",e["odia"]))}</a></li>' for e in data['entries'])
    ids=json.dumps([e['id'] for e in data['entries']])
    (directory/'reader.html').write_text(f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Choose a Dhaga</title><style>{CSS}</style><body><main><h1>Open a Dhaga</h1><p><a href="index.html">Browse all Dhaga and themes</a></p><ul>{links}</ul></main><script>const ids={ids};let id=location.hash.slice(1);if(!ids.includes(id))id=ids[0];location.replace("sayings/"+id+".html");</script></body></html>''')
    return len(data['entries'])

if __name__ == '__main__':
    print(f'Built {build_library()} individual readings and bilingual collection article')
