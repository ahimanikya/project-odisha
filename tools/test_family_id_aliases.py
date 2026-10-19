#!/usr/bin/env python3
"""Exact family lookup regressions; no changes to project aliases or records."""
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from resolve_project_id import load_family_aliases, resolve_family_id


class FamilyAliasTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.kb = Path(self.temp.name)/'kb'
        (self.kb/'reference').mkdir(parents=True)
        self.path = self.kb/'reference/project-family-id-aliases.json'
        self.doc = {'schema_version': 1, 'prefixes': {'UTB': 'ODB', 'UTU': 'ODU', 'UTS': 'ODS'},
                    'aliases': {'UTB-DEC-005': 'ODB-DEC-005', 'UTS-WORK-001': 'ODS-WORK-001'}}
        self.save()

    def save(self):
        self.path.write_text(json.dumps(self.doc))

    def test_exact_aliases_and_listed_targets(self):
        aliases = load_family_aliases(self.kb)
        for old, new in aliases.items():
            self.assertEqual(resolve_family_id(old, aliases), new)
            self.assertEqual(resolve_family_id(new, aliases), new)

    def test_unknown_old_and_current_ids_rejected(self):
        aliases = load_family_aliases(self.kb)
        for ident in ('UTB-DEC-999', 'ODB-DEC-999', 'UTU-DEC-001', 'ODU-DEC-001',
                      'POD-DEC-001', 'ABC-DEC-001'):
            with self.subTest(ident=ident), self.assertRaisesRegex(ValueError, 'Unknown family ID'):
                resolve_family_id(ident, aliases)

    def test_malformed_identifiers_rejected(self):
        aliases = load_family_aliases(self.kb)
        for ident in ('utb-DEC-005', 'UTB-DEC-005!', 'UTB-', 'UTB', None, 42):
            with self.subTest(ident=ident), self.assertRaisesRegex(ValueError, 'Invalid family ID'):
                resolve_family_id(ident, aliases)

    def test_schema_and_container_types_rejected(self):
        original = copy.deepcopy(self.doc)
        for field, value in [('schema_version', True), ('schema_version', 2), ('prefixes', []),
                             ('prefixes', {}), ('aliases', []), ('aliases', None)]:
            self.doc = {**original, field: value}; self.save()
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                load_family_aliases(self.kb)
        self.path.write_text('[]')
        with self.assertRaises(ValueError):
            load_family_aliases(self.kb)

    def test_prefix_shape_overlap_and_target_collision_rejected(self):
        for prefixes in ({'utb': 'ODB'}, {'UTB': 'ODBB'}, {'UTB': None},
                         {'UTB': 'UTB'}, {'UTB': 'ODB', 'ODB': 'NEW'},
                         {'UTB': 'ODB', 'UTS': 'ODB'}):
            self.doc['prefixes'] = prefixes; self.save()
            with self.subTest(prefixes=prefixes), self.assertRaises(ValueError):
                load_family_aliases(self.kb)

    def test_undeclared_prefix_suffix_change_and_malformed_targets_rejected(self):
        for aliases in ({'ABC-DEC-001': 'ODB-DEC-001'}, {'UTB-DEC-005': 'ODB-DEC-006'},
                        {'UTB-DEC-005': 'ODS-DEC-005'}, {'UTB-DEC-005': 5},
                        {'UTB-dec-005': 'ODB-dec-005'}, {'UTB-DEC-005': 'ODB-DEC-005!'},
                        {'UTB-DEC-005': 'ODB-DEC-005', 'UTB-DEC-006': 'ODB-DEC-005'}):
            self.doc['aliases'] = aliases; self.save()
            with self.subTest(aliases=aliases), self.assertRaises(ValueError):
                load_family_aliases(self.kb)

    def test_duplicate_json_keys_rejected_at_every_level(self):
        for content in (
            '{"schema_version":1,"schema_version":1,"prefixes":{},"aliases":{}}',
            '{"schema_version":1,"prefixes":{"UTB":"ODB","UTB":"ODB"},"aliases":{}}',
            '{"schema_version":1,"prefixes":{"UTB":"ODB"},"aliases":{"UTB-DEC-001":"ODB-DEC-001","UTB-DEC-001":"ODB-DEC-001"}}'):
            self.path.write_text(content)
            with self.assertRaisesRegex(ValueError, 'Duplicate JSON key'):
                load_family_aliases(self.kb)

    def test_symlink_outside_bundle_rejected(self):
        outside = self.kb.parent/'outside.json'; outside.write_text(json.dumps(self.doc))
        self.path.unlink(); self.path.symlink_to(outside)
        with self.assertRaisesRegex(ValueError, 'unsafe family alias file'):
            load_family_aliases(self.kb)

    def test_zero_alias_prefix_declaration_does_not_invent_ids(self):
        self.doc['aliases'] = {}; self.save()
        aliases = load_family_aliases(self.kb)
        self.assertEqual(aliases, {})
        with self.assertRaisesRegex(ValueError, 'Unknown family ID'):
            resolve_family_id('UTU-DEC-001', aliases)

    def test_standalone_cli_requires_explicit_family_mode(self):
        cli = Path(__file__).with_name('resolve_project_id.py')
        def run(*args):
            return subprocess.run([sys.executable, str(cli), '--kb', str(self.kb), *args], capture_output=True, text=True)
        good = run('--family', 'UTB-DEC-005')
        self.assertEqual(good.returncode, 0, good.stderr)
        self.assertEqual(good.stdout.strip(), 'ODB-DEC-005')
        for ident in ('UTB-DEC-999', 'ODB-DEC-999', 'UTU-DEC-001', 'ODU-DEC-001'):
            bad = run('--family', ident)
            self.assertNotEqual(bad.returncode, 0)
            self.assertIn('Unknown family ID', bad.stderr)
        # A family-only bundle has no project registers; default mode cannot silently use it.
        self.assertNotEqual(run('UTB-DEC-005').returncode, 0)

    def test_actual_checked_in_family_index(self):
        repo = Path(__file__).resolve().parents[1]
        aliases = load_family_aliases(repo/'kb')
        self.assertGreater(len(aliases), 0)
        for old, new in aliases.items():
            self.assertEqual(resolve_family_id(old, aliases), new)
            self.assertEqual(resolve_family_id(new, aliases), new)
        for ident in ('UTB-DEC-999999', 'ODB-DEC-999999', 'UTU-DEC-999999', 'ODU-DEC-999999'):
            with self.assertRaises(ValueError):
                resolve_family_id(ident, aliases)

    def test_default_pod_cli_and_map_remain_unchanged(self):
        repo = Path(__file__).resolve().parents[1]
        project_map = repo/'kb/reference/project-id-aliases.json'
        before = project_map.read_bytes()
        old, new = next(iter(json.loads(before)['aliases'].items()))
        cli = repo/'tools/resolve_project_id.py'
        for ident in (old, new):
            result = subprocess.run([sys.executable, str(cli), ident], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout.strip(), new)
        family = subprocess.run([sys.executable, str(cli), 'UTB-DEC-005'], capture_output=True, text=True)
        self.assertNotEqual(family.returncode, 0)
        self.assertIn('Unknown legacy', family.stderr)
        self.assertEqual(project_map.read_bytes(), before)


if __name__ == '__main__':
    unittest.main()
