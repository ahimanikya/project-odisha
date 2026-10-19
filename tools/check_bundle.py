#!/usr/bin/env python3
"""Check a Utkal KB alone: live links, metadata, record scope and human authority.
Created for Ahimanikya Satapathy with AI assistance. Standard library only.
"""
import argparse,json,re
from pathlib import Path
from urllib.parse import unquote,urlsplit
try:
    from .registers import project_prefixes, matching_project_prefixes, load_id_aliases
except ImportError:  # Direct script execution, including --kb exports.
    from registers import project_prefixes, matching_project_prefixes, load_id_aliases
ARCHIVES=('references/pre-repair/','history/evidence/initial-capture/','records/evidence/research-import/')
def check(kb, config=None):
    kb=kb.resolve(); errors=[]; links=concepts=0
    def need(ok,message):
        if not ok:errors.append(message)
    need(not (kb/'project.json').exists() and not (kb/'utkal.config.json').exists(), 'Runtime configuration belongs at repository root, outside kb/')
    template=(kb/'team/people.json').is_file()
    instance=(kb/'team/assignments.json').is_file()
    need(template != instance, 'Bundle must contain exactly one actual team record type')
    kind='template' if template else 'instance'
    records=json.loads((kb/('maintenance' if template else 'registers')/'records.json').read_text())
    try:
        project_prefixes(records) if config is None else matching_project_prefixes(config, records)
        ledger = kb/("maintenance" if template else "registers")/"activity.jsonl"
        events = [json.loads(line) for line in ledger.read_text().splitlines() if line.strip()] if ledger.exists() else None
        load_id_aliases(kb, records, events)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(str(exc))
    if config is not None:
        need(config['artifact_kind']==kind, 'Configuration artifact kind conflicts with team records')
        need(config['creator']['kind']=='human', 'Creator authority must be human')
        need(config['record_directory']==('maintenance' if template else 'registers'), 'Configuration points to wrong record directory')
    need((kb/'index.md').read_text().startswith('---\nokf_version: "0.2"\n---'),'Bundle root version missing')
    for p in kb.rglob('*.md'):
        rel=p.relative_to(kb).as_posix()
        if rel.startswith(ARCHIVES):continue
        raw=p.read_text()
        if p.name=='index.md':
            need(p==kb/'index.md' or not raw.startswith('---\n'),f'{rel}: group index has frontmatter')
        elif p.name=='log.md':
            need(not raw.startswith('---\n'),f'{rel}: log has frontmatter')
        else:
            concepts+=1
            header=raw.split('\n---',1)[0]
            need(raw.startswith('---\n') and bool(re.search(r'^type:\s*\S',header,re.M)),f'{rel}: missing concept type')
        for value in re.findall(r'\[[^\]]*\]\(([^)]+)\)',raw):
            value=value.strip('<>');parts=urlsplit(value)
            if parts.scheme or value.startswith('#'):continue
            target=(p.parent/unquote(parts.path)).resolve();links+=1
            need(target.is_relative_to(kb),f'{rel}: internal link escapes bundle: {value}')
            need(target.exists(),f'{rel}: missing link: {value}')
    if template:
        people=json.loads((kb/'team/people.json').read_text())
        need(people['human_owner']['kind']=='human','Template owner must be human')
        if config is not None:need(people['human_owner']['full_name']==config['creator']['name'],'Template owner differs from creator')
        need(people['assignments']==[],'Template must not have additional actual assignments')
        definitions=json.loads((kb/'roles/definitions.json').read_text())['definitions']
        for item in definitions:
            need(item['definition_type']=='template' and item['active_assignment'] is False,'Persona definition activated in template')
        seeds=json.loads((kb/'registers/records.json').read_text())
        for name in ['projects','work','decisions','requirements','reviews','releases','sources','relationships']:
            need(seeds[name]==[],f'Instance seed {name} contains real history')
        need((kb/'registers/activity.jsonl').read_text()=='','Instance seed ledger is populated')
    else:
        team=json.loads((kb/'team/assignments.json').read_text())
        human=team['human_owner'];need(human['kind']=='human','Instance human authority missing')
        if config is not None:need(human['full_name']==config['creator']['name'],'Instance owner differs from configuration')
        for a in team['assignments']:
            need(a['kind'] in {'human','persona'},'Unknown assignment type')
            if a['kind']=='persona':
                need(a.get('human_supervisor')==human['full_name'] and not a.get('human_reports'),'Invalid AI supervision or human reporting')
    return {'result':'PASS' if not errors else 'FAIL','concepts':concepts,'local_links':links,'errors':errors,'configuration_checked':config is not None,'scope':'Structure and declared authority; standalone --kb checks do not validate repository configuration. Not proof of consent or factual correctness.'}
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--kb',type=Path,help='Check a standalone KB without repository configuration')
    args=parser.parse_args()
    try:
        root=Path(__file__).resolve().parents[1]
        config=None if args.kb is not None else json.loads((root/'utkal.config.json').read_text())
        result=check(args.kb if args.kb is not None else root/'kb',config)
    except (OSError,ValueError,KeyError,TypeError) as e:result={'result':'FAIL','errors':[str(e)]}
    print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(result['result']!='PASS')
