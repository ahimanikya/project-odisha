#!/usr/bin/env python3
"""Resolve a current project ID or exact declared historical alias, read-only.

Resolution checks identity syntax and the alias map. It does not grant authority
or establish that an arbitrary current ID exists in every external inventory.
"""
import argparse
import json
from pathlib import Path
try:
    from .registers import load_id_aliases, matching_project_prefixes, resolve_project_id
except ImportError:
    from registers import load_id_aliases, matching_project_prefixes, resolve_project_id


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('identifier')
    parser.add_argument('--kb', type=Path, help='Standalone KB; no repository configuration assumed')
    args = parser.parse_args()
    try:
        root = Path(__file__).resolve().parents[1]
        kb = args.kb if args.kb is not None else root/'kb'
        config = None if args.kb is not None else json.loads((root/'utkal.config.json').read_text())
        home = ('maintenance' if (kb/'team/people.json').exists() else 'registers') if config is None else config['record_directory']
        if home not in {'maintenance', 'registers'}:
            raise ValueError('Invalid configured record directory')
        data = json.loads((kb/home/'records.json').read_text())
        if config is not None:
            matching_project_prefixes(config, data)
        ledger = kb/home/'activity.jsonl'
        events = [json.loads(line) for line in ledger.read_text().splitlines() if line.strip()] if ledger.exists() else None
        aliases = load_id_aliases(kb, data, events)
        print(resolve_project_id(args.identifier, data, aliases))
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.exit(1, 'ID resolution failed: '+str(exc)+'\n')


if __name__ == '__main__':
    main()
