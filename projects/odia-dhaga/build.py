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
            if not re.fullmatch(r'assets/[a-z0-9-]+\.svg', graphic['src']):
                raise ValueError('graphic must be a local assets SVG')
    return data

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
"""
JS = """
(() => {
 const search=document.querySelector('#search'), tag=document.querySelector('#tag');
 const cards=[...document.querySelectorAll('.entry')], status=document.querySelector('#result-count');
 const norm=s=>s.normalize('NFC').toLocaleLowerCase().replace(/\\s+/g,' ').trim();
 function filter(){
  const words=norm(search.value).split(' ').filter(Boolean); let count=0;
  for(const card of cards){
   const matches=words.every(w=>norm(card.textContent).includes(w));
   const matchesTag=!tag.value||[...card.querySelectorAll('.tag')].some(t=>t.textContent===tag.value);
   card.hidden=!(matches&&matchesTag); if(!card.hidden)count++;
  }
  status.textContent=count+' of '+cards.length+' sayings shown';
  document.querySelector('#empty').hidden=count!==0;
 }
 search.addEventListener('input',filter); tag.addEventListener('change',filter);
 document.querySelector('#clear').addEventListener('click',()=>{search.value='';tag.value='';filter();search.focus();});
 document.querySelector('#filters').hidden=false; filter();
 let previous, disclosures;
 window.addEventListener('beforeprint',()=>{previous=cards.map(c=>c.hidden);cards.forEach(c=>c.hidden=false);disclosures=[...document.querySelectorAll('details')].map(d=>[d,d.open]);disclosures.forEach(([d])=>d.open=true);});
 window.addEventListener('afterprint',()=>{if(previous)cards.forEach((c,i)=>c.hidden=previous[i]);if(disclosures)disclosures.forEach(([d,open])=>d.open=open);});
})();
"""

def render(data):
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
        cards.append(f'''<article class="entry" id="{esc(entry['id'])}">
<div class="entry-header"><span class="number">SAYING {n:02d}{' · '+esc(entry['category']) if entry.get('category') else ''}</span><a class="permalink" href="#{esc(entry['id'])}" aria-label="Link to saying {n}">#</a></div>
{f'<p class="entry-title">{esc(entry["title"])}</p>' if entry.get('title') else ''}
<h2 lang="or">{esc(entry['odia'])}</h2>
{f'<p class="odia" lang="or">{esc(entry["meaning_odia"])}</p>' if entry.get('meaning_odia') else ''}
{f'<p class="note">{esc(entry["editorial_status"])}</p>' if entry.get('editorial_status') else ''}
{f'<p class="transliteration">{esc(entry["transliteration"])}</p>' if entry.get('transliteration') else ''}
<div class="tags">{''.join(f'<span class="tag">{esc(t)}</span>' for t in entry['tags'])}</div>
<div class="details-grid">{body}</div>{figure}
<details><summary>Witnesses, variants &amp; limits</summary><ul class="witnesses">{witnesses}</ul>
{f'<h3>Recorded variants</h3><ul>{variants}</ul>' if variants else '<p class="note">No additional variant is documented in this entry.</p>'}
<h3>Origins and uncertainty</h3><p>{esc(entry['origin_note'])}</p>
<h3>Reuse and rights</h3><p>{esc(entry['rights_note'])}</p></details></article>''')
    bibliography = ''.join(f'''<section class="source" id="source-{esc(s['id'])}"><h3><a href="{esc(s['url'])}">{esc(s['title'])}</a></h3>
{f'<p class="meta">Status: {esc(s["status"])}</p>' if s.get('status') else ''}
{f'<p><strong>Bibliography:</strong> {esc(s["bibliography"])}</p>' if s.get('bibliography') else ''}
<p><strong>Access:</strong> {esc(s['access'])}</p><p><strong>Rights:</strong> {esc(s['rights'])}</p>
<p><strong>Limits:</strong> {esc(s['limits'])}</p></section>''' for s in data['sources'])
    tags = sorted({t for e in data['entries'] for t in e['tags']})
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(data['title'])}</title><meta name="description" content="{esc(data['subtitle'])}"><style>{CSS}</style></head>
<body><a class="skip" href="#collection">Skip to sayings</a>
<header><p class="eyebrow">Project Odisha · A living research collection</p><h1>{esc(data['title'])}</h1>
<p class="subtitle">{esc(data['subtitle'])}</p><p class="scope">{esc(data['scope_note'])}</p>
<nav class="header-links" aria-label="Collection resources"><a href="#sources">Sources &amp; rights</a><a href="README.md">Research guide</a><a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0 licence</a><a href="collection.json" download>Download collection JSON</a></nav>
{f'<p class="scope">{esc(data["editorial_note"])}</p>' if data.get('editorial_note') else ''}
{f'<p class="note"><strong>Collection licence:</strong> {esc(data["license"])}</p>' if data.get('license') else ''}
<p class="meta">Checked {esc(data['checked_on'])} · {len(cards)} documented entries</p></header>
<main><section class="tools" aria-label="Find a saying"><div class="filters" id="filters" hidden>
<div><label for="search">Search Odia or English</label><input id="search" type="search" placeholder="Words, meanings, situations…" autocomplete="off"></div>
<div><label for="tag">Theme</label><select id="tag"><option value="">All themes</option>{''.join(f'<option>{esc(t)}</option>' for t in tags)}</select></div>
<button id="clear" type="button">Clear filters</button></div><p class="status" id="result-count" role="status" aria-live="polite">{len(cards)} sayings — all entries are available below.</p>
<noscript><p>Search needs JavaScript. Every saying and its sources remain readable below.</p></noscript></section>
<p id="empty" hidden>No sayings match. Try a different word or clear the filters.</p>
<div id="collection" class="collection">{''.join(cards)}</div>
<section id="sources"><h2>Sources &amp; rights</h2><p>Availability is not a reuse licence. Entry witnesses and research candidates are distinguished below. External source links require an internet connection.</p>{bibliography}</section></main>
<footer>Read locally, share carefully. Explanations and diagrams are contemporary aids, not evidence of a saying’s age.<br>
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

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=ROOT/'collection.json')
    parser.add_argument('--output', type=Path, default=ROOT/'index.html')
    args = parser.parse_args()
    print(f'Built {build(args.source, args.output)} entries → {args.output}')
