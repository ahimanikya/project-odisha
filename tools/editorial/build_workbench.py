#!/usr/bin/env python3
"""Build a read-only editorial view from selected KB identities, never an approval engine."""
from pathlib import Path
import argparse, hashlib, json, re
from collections import Counter, defaultdict
from urllib.parse import urlsplit, urlunsplit, quote

ROOT = Path(__file__).resolve().parents[2]
KB = ROOT / 'kb'
SELECTION = KB / 'records/editorial-workbench-selection.json'
REPORT = KB / 'records/editorial-workbench.json'

def read(path):
    return json.loads(path.read_text())

def normalized_url(url):
    """Keep query and edition-bearing paths; remove fragments only for candidate links."""
    try:
        p = urlsplit(url)
        if p.scheme not in ('http', 'https') or not p.netloc:
            return None
        return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path.rstrip('/'), p.query, ''))
    except ValueError:
        return None

def file_link(path):
    return 'https://github.com/ahimanikya/project-odisha/blob/main/' + quote(path, safe='/')

def excerpt(body, heading):
    match = re.search(r'^## '+re.escape(heading)+r'\s*\n(.*?)(?=\n## |\Z)', body, re.M | re.S)
    return re.sub(r'\s+', ' ', match.group(1)).strip()[:900] if match else None

def model():
    selected = read(SELECTION)
    held_claims = read(KB/'research/references/data/food-preparations.json')['held_claims']
    catalog = read(KB/'research/references/data/source-catalog.json')
    concepts = {c['id']:c for c in read(KB/'research/search-index.json')}
    foods = read(KB/'research/food/collection.json')
    voices = read(KB/'research/voices/collection.json')
    edition = read(ROOT/'projects/site/editions/coast.json')
    source_users = defaultdict(list)
    source_urls = defaultdict(list)
    for sid,s in catalog.items():
        key = normalized_url(s.get('resource',''))
        if key: source_urls[key].append(sid)
    concept_sources = {}
    preparation = {r['concept_id']:r for r in read(KB/'research/references/data/food-preparations.json')['records']}
    for cid,c in concepts.items():
        ids = {s['id'] for s in c.get('sources',[]) if s.get('id') in catalog}
        # Body URL matches only supplement declared IDs; this is an explicit link, not a claim check.
        for url in re.findall(r'https?://[^\s<>\)\]\"]+', c.get('body','')):
            candidates = source_urls.get(normalized_url(url), [])
            if len(candidates)==1: ids.update(candidates)
        ids.update(sid for sid in re.findall(r'\[\^([^\]]+)\]',c.get('body','')) if sid in catalog)
        ids.update(a['source_id'] for a in preparation.get(cid,{}).get('accounts',[]) if a['source_id'] in catalog)
        concept_sources[cid] = sorted(ids)
        for sid in ids:
            source_users[sid].append(cid)
    preparation = {r['concept_id']:r for r in read(KB/'research/references/data/food-preparations.json')['records']}
    route_map = {p['path']:'/'+p['path']+'/' for p in voices['pages']}
    route_map.update({'food/'+p['slug']:'/food/'+p['slug']+'/' for p in foods['pages']})
    route_map.update({'works/six-acres-and-a-third':'/literature/six-acres-and-a-third/','places/chilika':'/knowledge/chilika/','places/konark':'/knowledge/konark/','people/subhas-chandra-bose':'/people/subhas-chandra-bose/'})
    rows=[]
    for key in selected['ids']:
        kind, identity = key.split(':',1)
        if kind=='source':
            s=catalog[identity]
            refs=[{'id':cid,'title':concepts[cid]['title'],'url':file_link('kb/research/'+concepts[cid]['path'])} for cid in source_users[identity]]
            aliases=[sid for sid in source_urls.get(normalized_url(s.get('resource','')),[]) if sid != identity]
            capture=s.get('capture_method') or s.get('capture_note') or 'No capture description recorded.'
            flags=[]
            if not s.get('publisher'): flags.append('Publisher field missing')
            if not s.get('accessed_on'): flags.append('Access date missing')
            if not refs: flags.append('No linked concept found in this scan')
            if aliases: flags.append('Shared reference URL')
            history=s.get('capture_history',[])
            if re.search(r'index(?:ed)?[_ -]only|unavailable|failed|timeout|timed out|uninspected',json.dumps([capture,history]),re.I):
                flags.append('Retrieval limitation recorded')
            path='kb/research/sources/'+identity+'.md'
            if not (ROOT/path).is_file():path='kb/research/references/data/source-catalog.json'
            next_actions=[]
            if aliases:next_actions.append('Compare locators and editions with '+', '.join(aliases)+'. A shared URL may be an index containing different publications. Keep citation IDs and do not infer either identical publications or independent corroboration.')
            if 'Retrieval limitation recorded' in flags:next_actions.append('Read the capture history before reusing this source; identify which passage is still unavailable and whether a later capture resolves it.')
            if not refs:next_actions.append('Find the intended subject and add a justified source connection; do not infer relevance from the title alone.')
            if not s.get('publisher'):next_actions.append('Check the original publication for publisher or author credit before adding that field.')
            if not s.get('accessed_on'):next_actions.append('Record an actual retrieval date on the next source check, without inventing an earlier date.')
            next_actions.append('For the next story using this source, compare each proposed claim with its exact passage and recorded scope.')
            rows.append({'id':key,'kind':'Source','title':s['title'],'knowledge_path':path,'knowledge_url':file_link(path),'publication_url':s.get('resource'),
                'description':s.get('capture_note') or s.get('source_kind') or 'Source catalogue identity.',
                'evidence':{'publisher':s.get('publisher'),'accessed_on':s.get('accessed_on'),'published_on':s.get('published_on'),'locator':s.get('locator'),'capture':capture,'capture_history':history},
                'connections':refs,'related_source_ids':aliases,'flags':flags,'next_actions':next_actions,'stage':'Metadata mapped; claim review required','public_route':None})
        else:
            c=concepts[identity];group=identity.split('/')[0];refs=[]
            for sid in concept_sources[identity]:
                s=catalog[sid];refs.append({'id':sid,'title':s['title'],'url':s['resource']})
            route=route_map.get(identity); prep=preparation.get(identity)
            flags=[]
            holds=[h for h in held_claims if h['concept_id']==identity]
            if holds: flags.append('Specific claim or terminology held')
            if not refs:flags.append('No source connection found')
            if not route:flags.append('No dedicated website page mapped')
            if prep:
                flags.extend(['Local preparation review pending','Odia terminology review pending'])
            if group in ('people','works'):flags.append('Biography or edition review required')
            if group=='places':flags.append('Current visitor information requires checking')
            questions=[]
            if prep and prep.get('open_question'): questions.append(prep['open_question'])
            for heading in ('Next research','Still to verify','Next step'):
                text=excerpt(c.get('body',''),heading)
                if text and text not in questions: questions.append(text)
            if not questions:questions.append('Review the existing narrative and its cited passages; identify a missing reader question before commissioning more research.')
            questions.append('Compare the existing website treatment and source metadata before drafting; secure correctly identified, reusable media for any new feature.' if not route else 'Compare the existing page with this research record and add only useful, supported detail; publication status requires the release ledger.')
            rows.append({'id':key,'kind':{'people':'Person','works':'Work','food':'Food','places':'Place'}[group],'title':c['title'],'knowledge_path':'kb/research/'+c['path'],'knowledge_url':file_link('kb/research/'+c['path']),
                'description':c.get('description',''),'evidence':{'record_status':c.get('status'),'recorded_scope':c.get('verification_scope') or c.get('evidence_basis'),'readiness':c.get('readiness'),'source_connections':len(refs),'held_claims':holds},
                'connections':refs,'related_source_ids':[],'flags':flags,'next_actions':questions,'stage':'Existing page to compare' if route else 'Research to develop',
                'public_route':route,'included_in_candidate_edition':route in edition['routes'] if route else False})
    all_ids={'source:'+sid for sid in catalog}|{'subject:'+cid for cid in concepts if cid.split('/')[0] in ('people','works','food') or cid in ('places/chilika','places/konark','places/debrigarh-hirakud','places/koraput')}
    inputs=['kb/records/editorial-workbench-selection.json','kb/research/references/data/source-catalog.json','kb/research/search-index.json','kb/research/food/collection.json','kb/research/voices/collection.json','kb/research/references/data/food-preparations.json','projects/site/editions/coast.json']
    return {'schema_version':1,'assessed_on':'2026-10-01','title':'From knowledge to stories','human_owner':'Ahimanikya Satapathy','prepared_by':{'kind':'ai_assistant','name':'Current AI assistant','independent_review':False},
      'scope':selected['scope'],'limitations':['Automated assessment of recorded metadata and explicit links, not fresh retrieval or factual verification.','A website route means a page exists in source; the publication ledger is authoritative for live delivery.','Shared source URLs are candidates for comparison: they may point to a catalogue containing different publications. They prove neither identity nor independent corroboration.','Local, language, media, rights and current operating reviews remain separate. No approval is inferred.'],
      'counts':{'records':len(rows),'by_kind':dict(Counter(r['kind'] for r in rows)),'with_flags':sum(bool(r['flags']) for r in rows),'mapped_pages':sum(bool(r['public_route']) for r in rows),'newer_records_outside_frozen_selection':len(all_ids-set(selected['ids']))},
      'additional_ids':sorted(all_ids-set(selected['ids'])),'inputs':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in inputs},'records':rows}

def write_or_check(path,text,check):
    if check:
        if not path.exists() or path.read_text()!=text:raise SystemExit(f'Outdated generated file: {path.relative_to(ROOT)}')
    else:
        path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)

def build(check=False):
    report=model()
    text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    write_or_check(REPORT,text,check)
    embedded=json.dumps(report,ensure_ascii=False).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    colours=read(ROOT/'projects/design-system/tokens.json')['colour']
    tokens=';'.join('--'+alias+':'+colours[name] for alias,name in {'sea':'sea','stone':'earth','ink':'ink','paper':'canvas','line':'line'}.items())
    template=(ROOT/'projects/editorial-workbench/template.html').read_text().replace('/*__WORKBENCH_TOKENS__*/',tokens)
    write_or_check(ROOT/'projects/editorial-workbench/dist/index.html',template.replace('/*__WORKBENCH_DATA__*/',embedded).replace('/*__WORKBENCH_LOGIC__*/',(ROOT/'projects/editorial-workbench/workbench.mjs').read_text().replace('export ', '')),False)
    print(json.dumps({'result':'PASS','counts':report['counts'],'mode':'check' if check else 'build'}))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');build(parser.parse_args().check)
