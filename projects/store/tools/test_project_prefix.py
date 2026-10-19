#!/usr/bin/env python3
"""Migration identity regressions; temporary fixtures never activate an instance."""
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from registers import (COLLECTIONS, validate, project_prefixes,
                       matching_project_prefixes, load_id_aliases, resolve_project_id)
from check_bundle import check as check_bundle


class PrefixTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.kb = Path(self.temp.name)/'kb'
        for folder in ('maintenance', 'registers', 'reference', 'team', 'roles'):
            (self.kb/folder).mkdir(parents=True, exist_ok=True)
        (self.kb/'index.md').write_text('---\nokf_version: "0.2"\n---\n')
        (self.kb/'team/people.json').write_text(json.dumps({
            'human_owner': {'kind': 'human', 'full_name': 'Test Founder'}, 'assignments': []}))
        (self.kb/'roles/definitions.json').write_text(json.dumps({'definitions': [
            {'definition_type': 'template', 'active_assignment': False}]}))
        (self.kb/'registers/records.json').write_text(json.dumps({c: [] for c in COLLECTIONS}))
        (self.kb/'registers/activity.jsonl').write_text('')
        self.config = {'prefix': 'ODS', 'legacy_prefixes': ['UTS'],
                       'id_aliases': 'reference/project-id-aliases.json',
                       'artifact_kind': 'template', 'record_directory': 'maintenance',
                       'creator': {'name': 'Test Founder', 'kind': 'human'}}
        self.data = {c: [] for c in COLLECTIONS}
        self.data.update(schema_version='1.0.0', project='ODS', legacy_prefixes=['UTS'],
                         id_aliases='reference/project-id-aliases.json',
                         human_authority='Test Founder', record_homes={})
        self.data['decisions'] = [{'id': 'ODS-DEC-001', 'status': 'approved',
            'actor': {'kind': 'human'}, 'quote': 'Proceed', 'scope': 'Fixture only'}]
        self.data['work'] = [{'id': 'ODS-WORK-001', 'status': 'ready', 'readiness': 'draft',
            'human_owner': 'Test Founder', 'next_action': 'Review',
            'authorization': 'UTS-DEC-001', 'refs': ['UTS-DEC-001']}]
        self.events = [{'id': 'ODS-ACT-001', 'actor': {'kind': 'ai_assistant'},
                        'recorded_at': '2026-10-19T00:00:00Z', 'summary': 'Fixture',
                        'refs': ['UTS-WORK-001']}]
        self.map = {'canonical_prefix': 'ODS', 'legacy_prefix': 'UTS',
                    'aliases': {f'UTS-{s}': f'ODS-{s}' for s in ('DEC-001', 'WORK-001', 'ACT-001', 'GOV-005')},
                    'register_aliases': {f'UTS-{s}': f'ODS-{s}' for s in ('DEC-001', 'WORK-001', 'ACT-001')},
                    'event_aliases': {'UTS-ACT-001': 'ODS-ACT-001'}}
        self.save()

    def save(self):
        (self.kb/'reference/project-id-aliases.json').write_text(json.dumps(self.map))
        (self.kb/'maintenance/records.json').write_text(json.dumps(self.data))
        (self.kb/'maintenance/activity.jsonl').write_text(''.join(json.dumps(e)+'\n' for e in self.events))

    def test_migrated_rows_and_exact_historical_references(self):
        before = copy.deepcopy((self.data, self.events))
        self.assertEqual(set(validate(self.kb, self.data, self.events)),
                         {'ODS-DEC-001', 'ODS-WORK-001', 'ODS-ACT-001'})
        self.assertEqual((self.data, self.events), before)
        aliases = load_id_aliases(self.kb, self.data, self.events)
        self.assertEqual(resolve_project_id('UTS-DEC-001', self.data, aliases), 'ODS-DEC-001')
        self.assertEqual(resolve_project_id('ODS-DEC-001', self.data, aliases), 'ODS-DEC-001')

    def test_canonical_rows_must_use_current_prefix(self):
        for ident in ('UTS-WORK-001', 'ABC-WORK-001', 'ODS-WORK-01', 'ODS-work-001', 123):
            with self.subTest(ident=ident):
                self.data['work'][0]['id'] = ident
                with self.assertRaisesRegex(ValueError, 'Invalid ID'):
                    validate(self.kb, self.data, self.events)

    def test_unknown_and_dangling_legacy_references_rejected(self):
        aliases = load_id_aliases(self.kb, self.data, self.events)
        for ident in ('UTS-DEC-999', 'ABC-DEC-001', 'UTS-DEC-001-extra'):
            with self.subTest(ident=ident), self.assertRaises(ValueError):
                resolve_project_id(ident, self.data, aliases)
        for ident in ('UTS-DEC-999', 'ODS-DEC-999', 'UTS-GOV-005'):
            self.data['work'][0]['refs'] = [ident]
            with self.subTest(ident=ident), self.assertRaisesRegex(ValueError, 'dangling reference'):
                validate(self.kb, self.data, self.events)

    def test_duplicate_canonical_rows_rejected(self):
        self.data['work'].append(copy.deepcopy(self.data['work'][0]))
        with self.assertRaisesRegex(ValueError, 'Duplicate ID'):
            validate(self.kb, self.data, self.events)

    def test_malformed_prefix_declarations(self):
        for current in ('OdB', 'OD', 'ODSB', '', None, 42):
            with self.subTest(current=current), self.assertRaises(ValueError):
                project_prefixes({'project': current})
        for old in ('UTS', None, {}, ['utb'], ['UT'], ['UTSB'], [None], ['UTS', 'UTS'], ['ODS']):
            with self.subTest(legacy=old), self.assertRaises(ValueError):
                project_prefixes({'project': 'ODS', 'legacy_prefixes': old})

    def test_undeclared_alias_prefix_rejected(self):
        self.data.pop('legacy_prefixes')
        with self.assertRaisesRegex(ValueError, 'undeclared'):
            validate(self.kb, self.data, self.events)

    def test_config_and_register_declarations_must_agree(self):
        for field, value in [('prefix', 'UTS'), ('legacy_prefixes', []),
                             ('legacy_prefixes', ['ABC']), ('id_aliases', 'reference/other.json')]:
            config = {**self.config, field: value}
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                matching_project_prefixes(config, self.data)
            self.assertEqual(check_bundle(self.kb, config)['result'], 'FAIL')

    def test_map_identity_and_suffix_rejected(self):
        original = copy.deepcopy(self.map)
        for field, value in [('canonical_prefix', 'XYZ'), ('legacy_prefix', 'XYZ'),
                             ('aliases', {'UTS-DEC-001': 'ODS-DEC-999'}),
                             ('aliases', {'XYZ-DEC-001': 'ODS-DEC-001'}),
                             ('aliases', {'UTS-dec-001': 'ODS-dec-001'}),
                             ('aliases', []), ('register_aliases', []), ('event_aliases', [])]:
            self.map = {**original, field: value}; self.save()
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                load_id_aliases(self.kb, self.data, self.events)

    def test_duplicate_json_keys_rejected(self):
        path = self.kb/'reference/project-id-aliases.json'
        path.write_text('{"canonical_prefix":"ODS","legacy_prefix":"UTS","aliases":'
                        '{"UTS-DEC-001":"ODS-DEC-001","UTS-DEC-001":"ODS-DEC-001"}}')
        with self.assertRaisesRegex(ValueError, 'Duplicate JSON key'):
            load_id_aliases(self.kb, self.data, self.events)

    def test_missing_and_inconsistent_register_targets_rejected(self):
        self.data['work'] = []
        with self.assertRaisesRegex(ValueError, 'Missing register ID alias target'):
            load_id_aliases(self.kb, self.data, self.events)
        self.map['register_aliases']['UTS-WORK-001'] = 'ODS-DEC-001'; self.save()
        with self.assertRaisesRegex(ValueError, 'differs from ID alias map'):
            load_id_aliases(self.kb, self.data, self.events)

    def test_explicit_event_subset_requires_actual_target(self):
        load_id_aliases(self.kb, self.data)  # A caller may not supply a ledger.
        with self.assertRaisesRegex(ValueError, 'Missing event ID alias target'):
            load_id_aliases(self.kb, self.data, [])
        self.map['event_aliases']['UTS-ACT-999'] = 'ODS-ACT-999'; self.save()
        with self.assertRaisesRegex(ValueError, 'Event alias differs'):
            load_id_aliases(self.kb, self.data, self.events)

    def test_alias_path_containment(self):
        for name in ('../escape.json', '/tmp/aliases.json', '', 42):
            self.data['id_aliases'] = name
            with self.subTest(path=name), self.assertRaises(ValueError):
                load_id_aliases(self.kb, self.data, self.events)
        outside = self.kb.parent/'outside.json'; outside.write_text(json.dumps(self.map))
        (self.kb/'reference/escape.json').symlink_to(outside)
        self.data['id_aliases'] = 'reference/escape.json'
        with self.assertRaisesRegex(ValueError, 'unsafe'):
            load_id_aliases(self.kb, self.data, self.events)

    def test_external_approval_alias_resolves_without_weakening_authority(self):
        external = {'location': 'https://example.org/approval', 'kind': 'decision',
                    'actor_kind': 'human', 'status': 'approved'}
        self.data['external_refs'] = {'ODS-GOV-005': external}
        self.data['work'][0].update(authorization='UTS-GOV-005', refs=['UTS-GOV-005'])
        validate(self.kb, self.data, self.events)
        for field, value in [('kind', 'source'), ('actor_kind', 'persona'), ('status', 'proposed')]:
            original = external[field]; external[field] = value
            with self.subTest(field=field), self.assertRaisesRegex(ValueError, 'valid authorization'):
                validate(self.kb, self.data, self.events)
            external[field] = original

    def test_external_collisions_and_unmapped_legacy_keys_rejected(self):
        ref = {'location': 'https://example.org/record'}
        for entries in ({'ODS-DEC-001': ref}, {'UTS-DEC-001': ref},
                        {'UTS-GOV-005': ref, 'ODS-GOV-005': ref}, {'UTS-DEC-999': ref}):
            self.data['external_refs'] = entries
            with self.subTest(entries=entries), self.assertRaises(ValueError):
                validate(self.kb, self.data, self.events)

    def test_human_gate_unchanged(self):
        self.data['decisions'][0]['actor']['kind'] = 'persona'
        with self.assertRaisesRegex(ValueError, 'AI cannot grant approval'):
            validate(self.kb, self.data, self.events)

    def test_published_work_requires_aliased_release_evidence(self):
        self.data['work'][0]['readiness'] = 'published'
        with self.assertRaisesRegex(ValueError, 'release evidence'):
            validate(self.kb, self.data, self.events)
        self.data['releases'] = [{'id': 'ODS-REL-001', 'status': 'published',
            'authorization': 'UTS-DEC-001', 'destination': 'https://example.org/result',
            'evidence': ['https://example.org/receipt'], 'refs': ['UTS-WORK-001']}]
        validate(self.kb, self.data, self.events)

    def test_generic_unmigrated_instance_seed_remains_valid(self):
        data = {c: [] for c in COLLECTIONS}
        data.update(schema_version='1.0.0', project='NEW', human_authority='Test Founder', record_homes={})
        self.assertEqual(matching_project_prefixes({'prefix': 'NEW'}, data), ('NEW',))
        self.assertEqual(validate(self.kb, data, []), {})

    def test_standalone_bundle_preserves_template_invariants(self):
        self.assertEqual(check_bundle(self.kb)['result'], 'PASS')
        self.assertEqual(check_bundle(self.kb, self.config)['result'], 'PASS')
        seeds = {c: [] for c in COLLECTIONS}; seeds['work'] = [{'id': 'NEW-WORK-001'}]
        (self.kb/'registers/records.json').write_text(json.dumps(seeds))
        self.assertEqual(check_bundle(self.kb, self.config)['result'], 'FAIL')
        seeds['work'] = []; (self.kb/'registers/records.json').write_text(json.dumps(seeds))
        (self.kb/'roles/definitions.json').write_text(json.dumps({'definitions': [
            {'definition_type': 'template', 'active_assignment': True}]}))
        self.assertEqual(check_bundle(self.kb, self.config)['result'], 'FAIL')

    def test_cli_exact_alias_and_unknown_rejection(self):
        cli = Path(__file__).with_name('resolve_project_id.py')
        for ident, expected in [('UTS-DEC-001', 'ODS-DEC-001'), ('UTS-GOV-005', 'ODS-GOV-005')]:
            result = subprocess.run([sys.executable, str(cli), '--kb', str(self.kb), ident], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout.strip(), expected)
        result = subprocess.run([sys.executable, str(cli), '--kb', str(self.kb), 'UTS-DEC-999'], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Unknown legacy', result.stderr)

    def test_checked_in_configuration_and_aliases(self):
        repo = Path(__file__).resolve().parents[1]
        config = json.loads((repo/'utkal.config.json').read_text())
        kb = repo/'kb'; home = config['record_directory']
        data = json.loads((kb/home/'records.json').read_text())
        events = [json.loads(s) for s in (kb/home/'activity.jsonl').read_text().splitlines() if s.strip()]
        matching_project_prefixes(config, data)
        validate(kb, data, events)
        aliases = load_id_aliases(kb, data, events)
        for old, new in aliases.items():
            self.assertEqual(resolve_project_id(old, data, aliases), new)
        self.assertEqual(check_bundle(kb, config)['result'], 'PASS')
        self.assertEqual(check_bundle(kb)['result'], 'PASS')
        # Naming migration grants neither appointments nor commercial launch.
        self.assertEqual(config['artifact_kind'], 'instance')
        self.assertIs(config['instance_activation_automatic'], False)
        team = json.loads((kb/'team/assignments.json').read_text())
        self.assertEqual(team['assignments'], [])
        self.assertEqual(data['releases'], [])


if __name__ == '__main__':
    unittest.main()
