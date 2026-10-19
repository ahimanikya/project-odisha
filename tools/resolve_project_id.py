#!/usr/bin/env python3
"""Resolve a current project ID or exact declared historical alias, read-only.

Resolution checks identity syntax and the alias map. It does not grant authority
or establish that an arbitrary current ID exists in every external inventory.
"""
import argparse
import json
import re
from pathlib import Path
try:
    from .registers import load_id_aliases, matching_project_prefixes, resolve_project_id, PROJECT_ID, require, unique_json_object
except ImportError:
    from registers import load_id_aliases, matching_project_prefixes, resolve_project_id, PROJECT_ID, require, unique_json_object



def load_family_aliases(kb):
    """Validate the separate family index without changing project identity rules."""
    path = (kb/'reference/project-family-id-aliases.json').resolve()
    require(path.is_relative_to(kb.resolve()) and path.is_file(), 'Missing or unsafe family alias file')
    document = json.loads(path.read_text(), object_pairs_hook=unique_json_object)
    require(isinstance(document, dict), 'Family alias document must be an object')
    require(type(document.get('schema_version')) is int and document['schema_version'] == 1,
            'Unsupported family alias schema')
    prefixes = document.get('prefixes')
    require(isinstance(prefixes, dict) and bool(prefixes), 'Family prefixes must be a nonempty object')
    for old, new in prefixes.items():
        require(isinstance(old, str) and re.fullmatch(r'[A-Z]{3}', old)
                and isinstance(new, str) and re.fullmatch(r'[A-Z]{3}', new), 'Invalid family prefix')
    require(len(set(prefixes.values())) == len(prefixes), 'Duplicate family prefix target')
    require(not set(prefixes).intersection(prefixes.values()), 'Family current and legacy prefixes overlap')
    aliases = document.get('aliases')
    require(isinstance(aliases, dict), 'Family aliases must be an object')
    targets = set()
    for old, new in aliases.items():
        require(isinstance(old, str) and PROJECT_ID.fullmatch(old)
                and old[:3] in prefixes, 'Invalid or undeclared family alias: '+str(old))
        require(isinstance(new, str) and PROJECT_ID.fullmatch(new)
                and new == prefixes[old[:3]]+old[3:], 'Family alias must preserve declared prefix and suffix: '+old)
        require(new not in targets, 'Duplicate family alias target: '+new)
        targets.add(new)
    return aliases


def resolve_family_id(identifier, aliases):
    """Resolve only a listed alias or listed canonical target; never infer an ID."""
    require(isinstance(identifier, str) and PROJECT_ID.fullmatch(identifier),
            'Invalid family ID: '+str(identifier))
    require(identifier in aliases or identifier in aliases.values(), 'Unknown family ID: '+identifier)
    return aliases.get(identifier, identifier)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('identifier')
    parser.add_argument('--kb', type=Path, help='Standalone KB; no repository configuration assumed')
    parser.add_argument('--family', action='store_true', help='Resolve only exact entries in the separate family alias index')
    args = parser.parse_args()
    try:
        root = Path(__file__).resolve().parents[1]
        kb = args.kb if args.kb is not None else root/'kb'
        if args.family:
            print(resolve_family_id(args.identifier, load_family_aliases(kb)))
            return
        home = 'maintenance' if (kb/'team/people.json').exists() else 'registers'
        data = json.loads((kb/home/'records.json').read_text())
        if args.kb is None:
            matching_project_prefixes(json.loads((root/'utkal.config.json').read_text()), data)
        ledger = kb/home/'activity.jsonl'
        events = [json.loads(line) for line in ledger.read_text().splitlines() if line.strip()] if ledger.exists() else None
        aliases = load_id_aliases(kb, data, events)
        print(resolve_project_id(args.identifier, data, aliases))
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.exit(1, 'ID resolution failed: '+str(exc)+'\n')


if __name__ == '__main__':
    main()
