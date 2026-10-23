#!/usr/bin/env python3
"""Render a source-position concordance, never source text or invented explanations."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse
from build import CSS, esc
ROOT = Path(__file__).resolve().parent
STATUSES = {'independent_witness_candidate': 'Independent witness candidate', 'awaiting_independent_witness': 'Awaiting independent witness', 'existing_reader_match': 'Existing reader match', 'duplicate_source_position': 'Duplicate source position', 'user_supplied_candidate': 'User-supplied candidate'}

def validate(data, collection):
    for field in ('title', 'scope_note'):
        if not isinstance(data.get(field), str) or not data[field].strip():
            raise ValueError('Missing '+field)
    source = data.get('source', {})
    for field in ('title', 'url', 'date', 'rights_note'):
        if not isinstance(source.get(field), str) or not source[field].strip():
            raise ValueError('Missing source '+field)
    u = urlparse(source['url'])
    if u.scheme not in ('http','https') or not u.netloc:
        raise ValueError('Unsafe source URL')
    positions = data.get('positions', [])
    numbers = [p.get('number') for p in positions]
    if len(numbers) != 127 or any(type(n) is not int for n in numbers) or sorted(numbers) != list(range(1,128)):
        raise ValueError('Require unique positions 1..127')
    valid_ids = {e['id'] for e in collection['entries']}
    for p in positions:
        if p.get('status') not in STATUSES:
            raise ValueError('Unknown position status')
        ids = p.get('collection_ids')
        if not isinstance(ids,list) or any(not isinstance(i,str) or i not in valid_ids for i in ids) or len(set(ids)) != len(ids):
            raise ValueError('Invalid collection references')
        if 'user_wording' in p and not isinstance(p['user_wording'], str):
            raise ValueError('User wording must be string')
        candidate = p.get('candidate')
        if candidate is not None:
            if not isinstance(candidate,dict) or any(not isinstance(candidate.get(k),str) or not candidate[k].strip() for k in ('odia','source_title','source_url','locator','note')):
                raise ValueError('Candidate requires complete witness provenance')
            parsed=urlparse(candidate['source_url'])
            if parsed.scheme not in ('http','https') or not parsed.netloc:
                raise ValueError('Unsafe candidate URL')
        if p['status']=='independent_witness_candidate' and candidate is None:
            raise ValueError('Candidate status requires witness')
        target = p.get('duplicate_of')
        if 'duplicate_of' not in p or (target is not None and (type(target) is not int or not 1 <= target <= 127 or target == p['number'])):
            raise ValueError('Invalid duplicate target')
        if (p['status'] == 'duplicate_source_position') != (target is not None):
            raise ValueError('Duplicate status and target must agree')
        if p['status'] == 'existing_reader_match' and not ids:
            raise ValueError('Reader match requires collection reference')
        if not isinstance(p.get('notes'),list) or any(not isinstance(n,str) for n in p['notes']):
            raise ValueError('Notes must be strings')
    by_number = {p['number']:p for p in positions}
    for p in positions:
        seen=set(); current=p['number']
        while current is not None:
            if current in seen: raise ValueError('Duplicate cycle')
            seen.add(current); current=by_number[current]['duplicate_of']

def render(data, collection):
    validate(data, collection)
    cards=[]
    for p in sorted(data['positions'],key=lambda x:x['number']):
        n=p['number']
        links=' '.join(f'<a href="index.html#{esc(i)}">{esc(i)}</a>' for i in p['collection_ids'])
        duplicate=f'<p>Repeated source position: <a href="#position-{p["duplicate_of"]}">position {p["duplicate_of"]}</a>.</p>' if p['duplicate_of'] else ''
        candidate=p.get('candidate')
        witness=(f'<section aria-label="Independent witness"><h3>Independent witness candidate</h3><p lang="or">{esc(candidate["odia"])}</p><p><a href="{esc(candidate["source_url"])}">{esc(candidate["source_title"])}</a> · {esc(candidate["locator"])}</p><p>{esc(candidate["note"])}</p><p>This independent wording is not necessarily the exact wording at the blog position.</p></section>' if candidate else '')
        user=(f'<p>User-supplied wording (not independently verified): <span lang="or">{esc(p["user_wording"])}</span></p>' if p.get('user_wording') else '')
        notes=''.join(f'<li>{esc(note)}</li>' for note in p['notes'])
        cards.append(f'<li class="entry" id="position-{n}"><h2><a href="#position-{n}">Position {n}</a></h2><p class="status">{STATUSES[p["status"]]}</p>{"<p>Reader links: "+links+"</p>" if links else ""}{duplicate}{user}{witness}{"<ul>"+notes+"</ul>" if notes else ""}</li>')
    source=data['source']; counts={s:sum(p['status']==s for p in data['positions']) for s in STATUSES}
    tally=' · '.join(f'{STATUSES[s]}: {n}' for s,n in counts.items())
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(data['title'])}</title><style>{CSS}
.positions{{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}}.positions .entry{{padding:1.3rem}}.positions h2{{font-family:inherit;font-size:1.25rem;line-height:1.4;margin:0}}[lang="or"]{{font-family:Odia,serif;font-size:1.2rem;line-height:1.9}}.positions a,.positions li{{overflow-wrap:anywhere}}@media(max-width:640px){{.positions{{grid-template-columns:1fr}}}}</style></head><body><a class="skip" href="#positions">Skip to positions</a><header><p class="eyebrow">Project Odisha · Source concordance</p><h1>{esc(data['title'])}</h1><p class="subtitle">127 source positions · {len(collection['entries'])} explained reader entries</p><p class="scope">{esc(data['scope_note'])}</p><p>This is a map of numbered source positions, not a transcription of all 127 sayings or 127 independently verified entries.</p><nav class="header-links" aria-label="Concordance resources"><a href="index.html">Read explained sayings</a><a href="{esc(source['url'])}">Open original source</a><a href="source127.json">Concordance data</a></nav><p>Source: {esc(source['title'])} · {esc(source['date'])}</p><p>{esc(source['rights_note'])}</p><p>{tally}</p></header><main><h2 id="positions">Source positions</h2><ol class="positions">{''.join(cards)}</ol></main><footer>Unmatched positions retain their research status. No missing wording or meaning has been invented.<p>{esc(data.get("attribution", "Independent witness wording is attributed to the linked sources."))}</p><p>Adaptation licence: <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>; source rights and limits remain as stated. The original blog compilation is not reproduced or relicensed here.</p></footer></body></html>'''

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',type=Path,default=ROOT/'source127.json');p.add_argument('--collection',type=Path,default=ROOT/'collection.json');p.add_argument('--output',type=Path,default=ROOT/'source127.html');a=p.parse_args()
    a.output.write_text(render(json.loads(a.source.read_text()),json.loads(a.collection.read_text())),encoding='utf-8')
    print('Rendered127 source positions')
