#!/usr/bin/env python3
"""Utkal register model 1.0.0 — validate sources and generate one portable view.
Created for Ahimanikya Satapathy's Utkal Blueprint with AI assistance.
No dependencies, network access, authority grants or publication actions.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

COLLECTIONS = ('projects','work','decisions','requirements','reviews','releases','sources','relationships')
WORK_STATES = {'proposed','ready','in_progress','blocked','awaiting_review','completed','deferred','cancelled'}
READINESS = {'concept','draft','reviewed','approved','applied','published'}
DECISIONS = {'proposed','approved','rejected','superseded','recorded_direction'}
REVIEWS = {'pass','pass_with_limitations','fail','not_tested'}

def require(condition, message):
    if not condition:
        raise ValueError(message)

def project_prefixes(data, key='project'):
    """Current code and explicitly declared historical alias prefixes."""
    require(isinstance(data, dict), 'Project prefix declaration must be an object')
    prefix = data.get(key)
    require(isinstance(prefix, str) and re.fullmatch(r'[A-Z]{3}', prefix),
            'Invalid project prefix')
    legacy = data.get('legacy_prefixes', [])
    require(isinstance(legacy, list), 'legacy_prefixes must be a list')
    require(all(isinstance(value, str) and re.fullmatch(r'[A-Z]{3}', value)
                for value in legacy), 'Invalid legacy prefix')
    require(len(legacy) == len(set(legacy)), 'Duplicate legacy prefix')
    require(prefix not in legacy, 'Current prefix must not appear in legacy_prefixes')
    return (prefix, *legacy)


def matching_project_prefixes(config, data):
    configured = project_prefixes(config, 'prefix')
    declared = project_prefixes(data)
    require(configured[0] == declared[0], 'Configuration identity conflicts with registers')
    require(set(configured[1:]) == set(declared[1:]),
            'Configuration legacy prefixes conflict with registers')
    require(config.get("id_aliases") == data.get("id_aliases"),
            "Configuration ID aliases conflict with registers")
    return declared


PROJECT_ID = re.compile(r'[A-Z]{3}-[A-Z0-9]+(?:-[A-Z0-9]+)*')


def unique_json_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'Duplicate JSON key in ID aliases: '+key)
        result[key] = value
    return result


def load_id_aliases(root, data, events=None):
    """Load exact historical aliases; never infer a legacy-prefix substitution."""
    prefixes = project_prefixes(data)
    name = data.get('id_aliases')
    if name is None:
        return {}
    require(isinstance(name, str) and bool(name) and not Path(name).is_absolute()
            and '..' not in Path(name).parts, 'ID aliases must be a KB-relative path without traversal')
    path = (root / name).resolve()
    require(path.is_relative_to(root.resolve()) and path.is_file(), 'Missing or unsafe ID alias file')
    document = json.loads(path.read_text(), object_pairs_hook=unique_json_object)
    require(isinstance(document, dict), 'ID alias document must be an object')
    require(document.get('canonical_prefix') == prefixes[0], 'ID alias canonical prefix mismatch')
    require(document.get('legacy_prefix') in prefixes[1:], 'ID alias legacy prefix is undeclared')
    aliases = document.get('aliases')
    require(isinstance(aliases, dict), 'ID aliases must be an object')
    targets = set()
    for old, new in aliases.items():
        require(isinstance(old, str) and PROJECT_ID.fullmatch(old)
                and old.split('-')[0] == document['legacy_prefix'], 'Invalid legacy ID alias: '+str(old))
        require(isinstance(new, str) and PROJECT_ID.fullmatch(new)
                and new == prefixes[0]+old[3:], 'ID alias must preserve suffix: '+old)
        require(new not in targets, 'Duplicate ID alias target: '+new)
        targets.add(new)
    available = {row['id'] for collection in COLLECTIONS for row in data.get(collection, [])}
    event_ids = {event['id'] for event in events} if events is not None else set()
    available.update(event_ids)
    register_aliases = document.get('register_aliases', {})
    require(isinstance(register_aliases, dict), 'register_aliases must be an object')
    event_aliases = document.get('event_aliases', {})
    require(isinstance(event_aliases, dict), 'event_aliases must be an object')
    for old, new in event_aliases.items():
        require(old in register_aliases and register_aliases[old] == new,
                'Event alias differs from register alias subset: '+old)
        if events is not None:
            require(new in event_ids, 'Missing event ID alias target: '+str(new))
    for old, new in register_aliases.items():
        require(old in aliases and aliases[old] == new, 'Register alias differs from ID alias map: '+old)
        # Standalone programme fixtures can omit the ledger. The explicit event
        # subset tells us which targets require it, without guessing by ID kind.
        if not (old in event_aliases and events is None):
            require(new in available, 'Missing register ID alias target: '+str(new))
    return aliases


def resolve_project_id(ident, data, aliases):
    """Resolve syntax/alias identity only; callers must check target existence."""
    prefixes = project_prefixes(data)
    require(isinstance(ident, str) and PROJECT_ID.fullmatch(ident), 'Invalid project ID: '+str(ident))
    if ident.startswith(prefixes[0]+'-'):
        return ident
    require(ident in aliases and ident.split('-')[0] in prefixes[1:],
            'Unknown legacy project ID: '+ident)
    return aliases[ident]


def local_path(root, name):
    aliases_file = root / 'references/migration-paths.json'
    aliases = json.loads(aliases_file.read_text()) if aliases_file.exists() else {}
    direct = (root / name).resolve()
    p = direct if direct.is_file() else (root / aliases.get(name, name)).resolve()
    require(p.is_relative_to(root.resolve()), 'Path outside repository: '+name)
    require(p.is_file(), 'Missing record/evidence file: '+name)
    return p

def validate(root, data, events):
    require(data['schema_version'] == '1.0.0', 'Unsupported schema version')
    prefixes = project_prefixes(data)
    id_pattern = prefixes[0]+r'-[A-Z]+-\d{3,}'
    require(bool(data.get('human_authority')), 'Missing human authority')
    rows = [r for c in COLLECTIONS for r in data[c]]
    by_id = {}
    for r in rows + events:
        require(isinstance(r['id'], str) and re.fullmatch(id_pattern, r['id']), 'Invalid ID: '+str(r['id']))
        require(r['id'] not in by_id, 'Duplicate ID: '+r['id'])
        by_id[r['id']] = r
    aliases = load_id_aliases(root, data, events)
    def resolved(ref):
        return aliases.get(ref, ref) if isinstance(ref, str) else None
    external = data.get('external_refs', {})
    require(not set(by_id).intersection(external), 'External/local ID collision')
    for key, ref in external.items():
        require(bool(ref.get('location')), 'External reference needs location: '+key)
        if not ref['location'].startswith('https://'):
            local_path(root, ref['location'])
    for r in rows + events:
        for ref in r.get('refs', []):
            require(resolved(ref) in by_id or resolved(ref) in external, r['id']+' has dangling reference '+str(ref))
        for path in r.get('evidence', []):
            if not path.startswith('https://'):
                local_path(root, path)
    for home in data['record_homes'].values():
        local_path(root, home)
    for p in data['projects']:
        local_path(root,p['charter'])
        require(bool(p.get('human_owner')), 'Project needs human owner')
    for d in data['decisions']:
        require(d['status'] in DECISIONS, 'Unknown decision status')
        if d['status'] in {'approved','recorded_direction'}:
            require(d['actor']['kind']=='human', 'AI cannot grant approval: '+d['id'])
            require(bool(d.get('quote') or d.get('evidence')), 'Approval lacks source')
            require(bool(d.get('scope')), 'Approval lacks scope')
    def authorized(ref):
        ref = resolved(ref)
        if ref in external:
            d = external[ref]
            return d.get('kind') == 'decision' and d.get('actor_kind') == 'human' and d.get('status') in {'approved','recorded_direction'}  # Source authenticity still requires review.
        return any(d['id']==ref and d['actor']['kind']=='human' and d['status'] in {'approved','recorded_direction'} for d in data['decisions'])
    for w in data['work']:
        require(w['status'] in WORK_STATES, 'Unknown work status')
        require(w['readiness'] in READINESS, 'Unknown readiness')
        require(bool(w.get('human_owner')) and bool(w.get('next_action')), 'Work needs human owner and next action')
        require(authorized(w['authorization']), 'Work lacks valid authorization: '+w['id'])
        if w['status']=='blocked': require(bool(w.get('blockers')), 'Blocked work needs a reason')
        if w['readiness']=='published':
            require(any(w['id'] in [resolved(ref) for ref in r.get('refs',[])] and r['status']=='published' for r in data['releases']), 'Published work needs release evidence')
    for r in data['reviews']:
        require(r['status'] in REVIEWS and isinstance(r['independent'],bool), 'Invalid review/independence')
        if r['status'] in {'fail','pass_with_limitations','not_tested'}:
            require(bool(r.get('limitations')), 'Review needs limitations')
    for r in data['releases']:
        require(r['status'] in {'applied','published'}, 'Release must record an actual event')
        require(authorized(r['authorization']), 'Release lacks authorization')
        require(bool(r.get('destination')) and bool(r.get('evidence')), 'Release lacks destination/evidence')
    for s in data['sources']:
        require(bool(s.get('creator_credit')) and bool(s.get('rights')), 'Source needs credit/rights')
    for e in events:
        require(e['actor']['kind'] in {'human','persona','ai_assistant'}, 'Invalid event actor')
        require(bool(e.get('recorded_at')) and bool(e.get('summary')), 'Incomplete event')
    # Existing role assignments stay authoritative; humans may not report to AI.
    assignments = data['record_homes'].get('members_and_assignments','')
    if assignments.endswith('.json'):
        team=json.loads(local_path(root,assignments).read_text())
        human=team['human_owner']
        require(human['kind']=='human','Human owner kind invalid')
        for a in team['assignments']:
            require(a['kind'] in {'human','persona'},'Invalid member kind')
            if a['kind']=='persona':
                require(not a.get('human_reports'), 'Human cannot report to persona')
                require(a.get('human_supervisor')==human['full_name'],'Unknown human supervisor')
    return by_id

def cell(value):
    if isinstance(value,list): value='; '.join(str(x) for x in value)
    return str('—' if value is None or value == '' else value).replace('|','\\|').replace('\n',' ')

def render(data, events, digest):
    lines=['---','type: Generated register',f"title: {json.dumps(data['name']+' dashboard')}",'---','',f"# {data['name']} · dashboard",'',f"Generated from `records.json` and `activity.jsonl`. Source SHA-256: `{digest}`.",'',f"Accountable human: **{data['human_authority']}**. Model {data['model_version']}. This view reports records; it grants no authority.",'']
    def table(title, heads, rows):
        lines.extend(['## '+title,'','| '+' | '.join(heads)+' |','|'+'|'.join('---' for _ in heads)+'|'])
        for row in rows: lines.append('| '+' | '.join(cell(v) for v in row)+' |')
        if not rows: lines.append('| No records |'+' — |'*(len(heads)-1))
        lines.append('')
    table('Work and readiness',['ID / work','Status','Readiness','Human owner','Next action','Blockers'],[[w['id']+' · '+w['title'],w['status'],w['readiness'],w['human_owner'],w['next_action'],w['blockers']] for w in data['work']])
    table('Pending human review and decisions',['Record','Reason / scope'],[[w['id'],w['next_action']] for w in data['work'] if w['status']=='awaiting_review']+[[d['id'],d['scope']] for d in data['decisions'] if d['status']=='proposed'])
    table('Decisions',['ID / decision','Status','Human / proposer','Scope'],[[d['id']+' · '+d['title'],d['status'],d['actor']['name'],d['scope']] for d in data['decisions']])
    table('Reviews',['ID','Outcome','Independent','Limitations'],[[r['id'],r['status'],r['independent'],r.get('limitations',[])] for r in data['reviews']])
    table('Publication and application history',['ID / event','Status','Destination','Authorization'],[[r['id']+' · '+r['title'],r['status'],r['destination'],r['authorization']] for r in data['releases']])
    table('Sources and assets',['ID / title','State','Credit','Rights'],[[s['id']+' · '+s['title'],s['status'],s['creator_credit'],s['rights']] for s in data['sources']])
    table('Relationships',['ID / relationship','State','Next action'],[[r['id']+' · '+r['title'],r['status'],r.get('next_action')] for r in data['relationships']])
    table('Project / requirements index',['ID / title','State','References'],[[r['id']+' · '+r['title'],r['status'],r.get('refs',[])] for c in ['projects','requirements'] for r in data[c]])
    table('Canonical record homes',['Record','Location'],[[k,f'[{v}](../{v})'] for k,v in data['record_homes'].items()])
    table('Latest activity and handovers',['Event','Recorded at','Summary','Next action'],[[e['id'],e['recorded_at'],e['summary'],e.get('next_action')] for e in events[-10:]])
    lines += ['## Deferred extensions','']+[f"- {k}: {'active' if v['enabled'] else 'inactive'} — {v['activation']}." for k,v in data['optional_extensions'].items()]
    lines += ['','Generated views may lag edits until regeneration. Run `python3 tools/registers.py --check` to detect drift. External URLs are evidence pointers, not network-verified by this tool.','']
    return '\n'.join(lines)

def run(root, check=False):
    config=json.loads((root.parent/'utkal.config.json').read_text())
    home=config['record_directory']
    require(home in {'maintenance','registers'}, 'Invalid configured record directory')
    source=root/home/'records.json'; ledger=root/home/'activity.jsonl'
    raw=source.read_bytes(); activity=ledger.read_bytes()
    data=json.loads(raw); events=[json.loads(line) for line in activity.splitlines() if line.strip()]
    matching_project_prefixes(config, data)
    validate(root,data,events)
    output=render(data,events,hashlib.sha256(raw+b'\n'+activity).hexdigest())
    target=root/home/'DASHBOARD.md'
    if check:
        require(target.exists() and target.read_text()==output,'Dashboard stale; regenerate')
    else: target.write_text(output,encoding='utf-8')
    print(f"{data['project']}: valid; {sum(len(data[c]) for c in COLLECTIONS)} records, {len(events)} events; dashboard {'current' if check else 'generated'}")

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    try: run(Path(__file__).resolve().parents[1]/'kb', args.check)
    except (ValueError,KeyError,TypeError,OSError) as exc:
        parser.exit(1,'Register check failed: '+str(exc)+'\n')
