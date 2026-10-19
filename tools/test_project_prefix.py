#!/usr/bin/env python3
"""Prefix migration regressions using temporary records; no live records changed."""
import copy
import json
import tempfile
import subprocess
import sys
import unittest
from pathlib import Path

from registers import COLLECTIONS, validate, project_prefixes, matching_project_prefixes, load_id_aliases, resolve_project_id
from check_autonomous_program import check as check_program
from check_bundle import check as check_bundle


class ProjectPrefixTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.kb = self.root / 'kb'
        (self.kb / 'registers').mkdir(parents=True)
        (self.kb / 'records').mkdir()
        (self.kb / 'team').mkdir()
        (self.kb / 'reference').mkdir()
        (self.kb / 'index.md').write_text('---\nokf_version: "0.2"\n---\n')
        self.human = 'Test Founder'
        (self.kb / 'team/assignments.json').write_text(json.dumps({
            'human_owner': {'kind': 'human', 'full_name': self.human}, 'assignments': []}))
        self.config = {'prefix': 'POD', 'legacy_prefixes': ['UTP'],
                       'id_aliases': 'reference/project-id-aliases.json', 'artifact_kind': 'instance', 'record_directory': 'registers',
                       'creator': {'name': self.human, 'kind': 'human'}}
        self.records = {key: [] for key in COLLECTIONS}
        self.records.update(schema_version='1.0.0', project='POD', legacy_prefixes=['UTP'],
                            human_authority=self.human, record_homes={}, id_aliases='reference/project-id-aliases.json')
        self.records['decisions'] = [{'id': 'POD-DEC-001', 'status': 'approved',
            'actor': {'kind': 'human', 'name': self.human}, 'quote': 'Proceed', 'scope': 'Test'}]
        self.records['work'] = [{'id': 'POD-WORK-001', 'status': 'ready', 'readiness': 'draft',
            'human_owner': self.human, 'next_action': 'Review', 'authorization': 'UTP-DEC-001',
            'refs': ['UTP-DEC-001']}]
        self.events = [{'id': 'POD-EVT-001', 'actor': {'kind': 'ai_assistant'},
                        'recorded_at': '2026-10-19T00:00:00Z', 'summary': 'Historical work',
                        'refs': ['POD-WORK-001']}]
        self.program = {'authorization': 'UTP-DEC-001', 'human_owner': self.human,
                        'target_completed_items': 500, 'completed_items': 0,
                        'items': [self.item('POD-A500-001'), self.item('POD-A500-002')]
                        }
        self.alias_document = {'canonical_prefix': 'POD', 'legacy_prefix': 'UTP',
            'aliases': {f'UTP-{suffix}': f'POD-{suffix}' for suffix in ('DEC-001', 'WORK-001', 'EVT-001', 'A500-001', 'JD-001')}}
        self.alias_document['register_aliases'] = {k: v for k, v in self.alias_document['aliases'].items() if '-A500-' not in k and '-JD-' not in k}
        self.alias_document['event_aliases'] = {'UTP-EVT-001': 'POD-EVT-001'}
        self.write_aliases()

    def write_aliases(self):
        (self.kb/'reference/project-id-aliases.json').write_text(json.dumps(self.alias_document))


    @staticmethod
    def item(ident):
        return {'id': ident, 'title': 'A bounded task', 'acceptance': 'Evidence reviewed',
                'status': 'proposed', 'work_id': 'POD-WORK-001', 'evidence': []}

    def save(self, with_config=True):
        (self.kb / 'registers/records.json').write_text(json.dumps(self.records))
        (self.kb / 'records/autonomous-500-program.json').write_text(json.dumps(self.program))
        if with_config:
            (self.root / 'utkal.config.json').write_text(json.dumps(self.config))

    def test_mixed_records_events_and_program_keep_ids_unchanged(self):
        before = copy.deepcopy((self.records, self.events, self.program))
        ids = validate(self.kb, self.records, self.events)
        self.assertEqual(set(ids), {'POD-DEC-001', 'POD-WORK-001', 'POD-EVT-001'})
        self.save()
        self.assertEqual(check_program(self.root), [])
        self.assertEqual(check_bundle(self.kb, self.config)['result'], 'PASS')
        self.assertEqual((self.records, self.events, self.program), before)

    def test_undeclared_prefixes_rejected(self):
        self.records['work'][0]['id'] = 'XYZ-WORK-001'
        with self.assertRaisesRegex(ValueError, 'Invalid ID'):
            validate(self.kb, self.records, self.events)
        self.records['work'][0]['id'] = 'POD-WORK-001'
        self.program['items'][1]['id'] = 'XYZ-A500-002'
        self.save()
        self.assertTrue(any('invalid item ID' in e for e in check_program(self.root)))

    def test_legacy_code_requires_explicit_declaration(self):
        self.records.pop('legacy_prefixes')
        self.config.pop('legacy_prefixes')
        with self.assertRaisesRegex(ValueError, 'undeclared'):
            validate(self.kb, self.records, self.events)
        self.save()
        self.assertTrue(any('undeclared' in e for e in check_program(self.root)))

    def test_malformed_prefix_declarations_rejected(self):
        for current in ('PoD', 'PO', 'PODS', '', None, 42):
            with self.subTest(current=current), self.assertRaisesRegex(ValueError, 'Invalid project prefix'):
                project_prefixes({'project': current})
        for legacy in ('UTP', None, {}, ['utp'], ['UT'], ['UTPP'], [None], [42]):
            with self.subTest(legacy=legacy), self.assertRaises(ValueError):
                project_prefixes({'project': 'POD', 'legacy_prefixes': legacy})

    def test_duplicate_legacy_and_current_in_legacy_rejected(self):
        for legacy in (['UTP', 'UTP'], ['POD']):
            with self.subTest(legacy=legacy):
                self.records['legacy_prefixes'] = legacy
                with self.assertRaises(ValueError):
                    validate(self.kb, self.records, self.events)
                self.save()
                self.assertNotEqual(check_program(self.root), [])
                self.assertEqual(check_bundle(self.kb, self.config)['result'], 'FAIL')

    def test_malformed_and_duplicate_record_ids_still_rejected(self):
        for ident in ('POD-WORK-12', 'POD-work-001', 'POD-WORK-001-extra', 123):
            with self.subTest(ident=ident):
                self.records['work'][0]['id'] = ident
                with self.assertRaisesRegex(ValueError, 'Invalid ID'):
                    validate(self.kb, self.records, self.events)
        self.records['work'][0]['id'] = 'POD-WORK-001'
        self.records['work'].append(copy.deepcopy(self.records['work'][0]))
        with self.assertRaisesRegex(ValueError, 'Duplicate ID'):
            validate(self.kb, self.records, self.events)

    def test_malformed_and_duplicate_program_ids_still_rejected(self):
        for ident in ('POD-A500-12', 'POD-A500-1000', 'pod-A500-003', 'POD-A500-003-extra', 'UTP-A500-001', 'POD-A500-001'):
            with self.subTest(ident=ident):
                self.program['items'][1]['id'] = ident
                self.save()
                self.assertTrue(any('item ID' in e for e in check_program(self.root)))

    def test_dangling_reference_and_authority_still_rejected(self):
        self.records['work'][0]['refs'] = ['UTP-DEC-999']
        with self.assertRaisesRegex(ValueError, 'dangling reference'):
            validate(self.kb, self.records, self.events)
        self.records['work'][0]['refs'] = []
        self.records['work'][0]['authorization'] = 'POD-DEC-999'
        with self.assertRaisesRegex(ValueError, 'valid authorization'):
            validate(self.kb, self.records, self.events)
        self.program['authorization'] = 'POD-DEC-999'
        self.save()
        self.assertTrue(any('approved decision' in e for e in check_program(self.root)))

    def test_config_current_and_legacy_mismatch_rejected(self):
        for field, value in [('prefix', 'UTP'), ('legacy_prefixes', []), ('legacy_prefixes', ['OLD'])]:
            with self.subTest(field=field, value=value):
                self.config = {**self.config, 'prefix': 'POD', 'legacy_prefixes': ['UTP'], field: value}
                with self.assertRaises(ValueError):
                    matching_project_prefixes(self.config, self.records)
                self.save()
                self.assertNotEqual(check_program(self.root), [])
                self.assertEqual(check_bundle(self.kb, self.config)['result'], 'FAIL')

    def test_generic_blueprint_without_legacy_field(self):
        data = {key: [] for key in COLLECTIONS}
        data.update(schema_version='1.0.0', project='UTB', human_authority=self.human, record_homes={})
        self.assertEqual(project_prefixes(data), ('UTB',))
        self.assertEqual(matching_project_prefixes({'prefix': 'UTB'}, data), ('UTB',))
        self.assertEqual(validate(self.kb, data, []), {})

    def test_standalone_bundle_and_program_use_register_declaration(self):
        self.save(with_config=False)
        self.assertEqual(check_program(self.root), [])
        self.assertEqual(check_bundle(self.kb)['result'], 'PASS')
        self.records['legacy_prefixes'] = ['UTP', 'UTP']
        self.save(with_config=False)
        self.assertNotEqual(check_program(self.root), [])
        self.assertEqual(check_bundle(self.kb)['result'], 'FAIL')

    def test_alias_resolution_is_exact_and_new_legacy_canonicals_rejected(self):
        aliases = load_id_aliases(self.kb, self.records, self.events)
        self.assertEqual(resolve_project_id('UTP-DEC-001', self.records, aliases), 'POD-DEC-001')
        self.assertEqual(resolve_project_id('POD-DEC-001', self.records, aliases), 'POD-DEC-001')
        for ident in ('UTP-DEC-999', 'XYZ-DEC-001', 'UTP-DEC-001-extra'):
            with self.assertRaises(ValueError):
                resolve_project_id(ident, self.records, aliases)
        self.records['decisions'][0]['id'] = 'UTP-DEC-001'
        with self.assertRaisesRegex(ValueError, 'Invalid ID'):
            validate(self.kb, self.records, self.events)

    def test_alias_map_safety_and_integrity(self):
        original = copy.deepcopy(self.alias_document)
        for old, new in [('UTP-DEC-001', 'POD-DEC-999'), ('XYZ-DEC-001', 'POD-DEC-001'),
                         ('UTP-dec-012', 'POD-dec-012')]:
            self.alias_document = copy.deepcopy(original)
            self.alias_document['aliases'][old] = new
            self.write_aliases()
            with self.subTest(old=old, new=new), self.assertRaises(ValueError):
                load_id_aliases(self.kb, self.records, self.events)
        self.alias_document = original
        self.write_aliases()
        for path in ('../escape.json', '/tmp/aliases.json', '', None):
            self.records['id_aliases'] = path
            if path is None:
                self.assertEqual(load_id_aliases(self.kb, self.records), {})
            else:
                with self.assertRaises(ValueError):
                    load_id_aliases(self.kb, self.records)
        outside = self.root/'outside.json'
        outside.write_text(json.dumps(original))
        (self.kb/'reference/escape.json').symlink_to(outside)
        self.records['id_aliases'] = 'reference/escape.json'
        with self.assertRaises(ValueError):
            load_id_aliases(self.kb, self.records)

    def test_nonregister_container_and_historical_identifier_shapes(self):
        suffixes = ('A500-20261007', 'N200', 'N210', 'R216', 'EXP-B01', 'EXP-C01', 'EXP-P01',
                    'HIS-HOME-SHARING-PHOTO-20261006', 'HIS-OSHA-B03-20261007',
                    'HIS-PALA-ARTISTS-20261019')
        self.alias_document['aliases'].update({f'UTP-{s}': f'POD-{s}' for s in suffixes})
        self.write_aliases()
        aliases = load_id_aliases(self.kb, self.records, self.events)
        for suffix in suffixes:
            self.assertEqual(resolve_project_id('UTP-'+suffix, self.records, aliases), 'POD-'+suffix)

    def test_explicit_register_subset_targets_and_history_only_aliases(self):
        self.alias_document['aliases']['UTP-DEC-999'] = 'POD-DEC-999'
        self.write_aliases()
        load_id_aliases(self.kb, self.records, self.events)  # historical document ID
        self.alias_document['register_aliases']['UTP-DEC-999'] = 'POD-DEC-999'
        self.write_aliases()
        with self.assertRaisesRegex(ValueError, 'Missing register ID alias target'):
            load_id_aliases(self.kb, self.records, self.events)
        self.alias_document['register_aliases']['UTP-DEC-999'] = 'POD-DEC-001'
        self.write_aliases()
        with self.assertRaisesRegex(ValueError, 'differs from ID alias map'):
            load_id_aliases(self.kb, self.records, self.events)

    def test_duplicate_map_json_keys_and_config_map_mismatch_rejected(self):
        (self.kb/'reference/project-id-aliases.json').write_text(
            '{"canonical_prefix":"POD","legacy_prefix":"UTP","aliases":'
            '{"UTP-DEC-001":"POD-DEC-001","UTP-DEC-001":"POD-DEC-001"}}')
        with self.assertRaisesRegex(ValueError, 'Duplicate JSON key'):
            load_id_aliases(self.kb, self.records)
        self.config['id_aliases'] = 'reference/other.json'
        with self.assertRaisesRegex(ValueError, 'ID aliases conflict'):
            matching_project_prefixes(self.config, self.records)

    def test_missing_program_alias_target_rejected(self):
        self.alias_document['aliases']['UTP-A500-999'] = 'POD-A500-999'
        self.write_aliases()
        self.save()
        self.assertTrue(any('Missing program ID alias target' in e for e in check_program(self.root)))

    def test_original_receipt_and_review_legacy_links_still_resolve(self):
        self.records['work'][0]['status'] = 'completed'
        item = self.program['items'][0]
        item.update(status='completed', completed_at='2026-10-19T00:00:00Z',
                    evidence=['records/review.json', 'records/receipt.json'])
        self.program['completed_items'] = 1
        review = {'program_item': 'UTP-A500-001', 'authorization': 'UTP-DEC-001',
                  'work_id': 'UTP-WORK-001', 'status': 'pass', 'verification': {'tests': 'passed'}}
        receipt = {'program_item': 'UTP-A500-001', 'authorization': 'UTP-DEC-001',
                   'work_id': 'UTP-WORK-001', 'merge_commit': 'a'*40, 'reviewed_head': 'b'*40,
                   'pull_request': 'https://github.com/ahimanikya/project-odisha/pull/1',
                   'review': 'records/review.json',
                   'deployment': {'required': False, 'reason': 'Records-only change'}}
        for name, document in [('review', review), ('receipt', receipt)]:
            (self.kb/f'records/{name}.json').write_text(json.dumps(document))
        before = (self.kb/'records/receipt.json').read_bytes()
        self.save()
        self.assertEqual(check_program(self.root), [])
        self.assertEqual((self.kb/'records/receipt.json').read_bytes(), before)
        receipt['authorization'] = 'UTP-DEC-999'
        (self.kb/'records/receipt.json').write_text(json.dumps(receipt))
        self.assertTrue(any('authorization differs' in e for e in check_program(self.root)))

    def test_explicit_event_subset_supports_arbitrary_event_kind(self):
        self.events[0]['id'] = 'POD-ACT-001'
        for name in ('aliases', 'register_aliases', 'event_aliases'):
            self.alias_document[name].pop('UTP-EVT-001')
            self.alias_document[name]['UTP-ACT-001'] = 'POD-ACT-001'
        self.write_aliases()
        load_id_aliases(self.kb, self.records)  # No ledger provided by standalone caller.
        load_id_aliases(self.kb, self.records, self.events)
        with self.assertRaisesRegex(ValueError, 'Missing event ID alias target'):
            load_id_aliases(self.kb, self.records, [])
        self.alias_document['event_aliases']['UTP-ACT-999'] = 'POD-ACT-999'
        self.write_aliases()
        with self.assertRaisesRegex(ValueError, 'Event alias differs'):
            load_id_aliases(self.kb, self.records)

    def test_cli_resolves_and_rejects_unmapped_alias(self):
        self.save()
        cli = Path(__file__).with_name('resolve_project_id.py')
        good = subprocess.run([sys.executable, str(cli), '--kb', str(self.kb), 'UTP-DEC-001'], capture_output=True, text=True)
        self.assertEqual(good.returncode, 0, good.stderr)
        self.assertEqual(good.stdout.strip(), 'POD-DEC-001')
        bad = subprocess.run([sys.executable, str(cli), '--kb', str(self.kb), 'UTP-DEC-999'], capture_output=True, text=True)
        self.assertNotEqual(bad.returncode, 0)
        self.assertIn('Unknown legacy', bad.stderr)


if __name__ == '__main__':
    unittest.main()
