#!/usr/bin/env python3
"""Fault injection against actual record shapes in isolated temporary fixtures."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from check_autonomous_program import ROOT, check, RUN, PR


class ProgramEvidenceTests(unittest.TestCase):
    def test_repository_rename_preserves_evidence_urls(self):
        for name in ('utkal-project', 'project-odisha'):
            self.assertIsNotNone(RUN.fullmatch(f'https://github.com/ahimanikya/{name}/actions/runs/123'))
            self.assertIsNotNone(PR.fullmatch(f'https://github.com/ahimanikya/{name}/pull/123'))
        self.assertIsNone(PR.fullmatch('https://github.com/other/project-odisha/pull/123'))
        self.assertIsNone(RUN.fullmatch('https://github.com/ahimanikya/unrelated/actions/runs/123'))

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.program = json.loads((ROOT / 'kb/records/autonomous-500-program.json').read_text())
        self.registers = json.loads((ROOT / 'kb/registers/records.json').read_text())
        for item in self.program['items']:
            for name in item['evidence']:
                path = self.root / 'kb' / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes((ROOT / 'kb' / name).read_bytes())
        if self.registers.get('id_aliases'):
            alias = self.registers['id_aliases']
            path = self.root / 'kb' / alias
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes((ROOT / 'kb' / alias).read_bytes())
        self.receipt_path = next(p for p in self.program['items'][12]['evidence'] if 'publication-' in p)

    def write(self, name, data):
        path = self.root / 'kb' / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data))

    def run_check(self):
        self.write('records/autonomous-500-program.json', self.program)
        self.write('registers/records.json', self.registers)
        return check(self.root)

    def rejects(self, message):
        self.assertTrue(any(message in error for error in self.run_check()), message)

    def test_current_shared_batch_and_document_deliveries(self):
        self.assertEqual(self.run_check(), [])

    def test_count_drift_and_boolean(self):
        for value in (self.program['completed_items'] + 1, True):
            self.program['completed_items'] = value
            self.rejects('completed_items must equal')

    def test_duplicate_even_with_matching_count(self):
        self.program['items'].append(copy.deepcopy(self.program['items'][0]))
        self.program['completed_items'] += 1
        self.rejects('duplicate item ID')

    def test_unknown_work(self):
        self.program['items'][0]['work_id'] = 'POD-WORK-9999'
        self.rejects('unknown work_id')

    def test_unfinished_work(self):
        next(w for w in self.registers['work'] if w['id'] == 'POD-WORK-190')['status'] = 'in_progress'
        self.rejects('must reference completed work')

    def test_failed_item_not_counted(self):
        self.program['items'][0]['status'] = 'failed'
        self.program['items'][0].pop('completed_at')
        self.rejects('completed_items must equal')

    def test_unfinished_timestamp(self):
        self.program['items'][0]['status'] = 'deferred'
        self.program['completed_items'] -= 1
        self.rejects('unfinished item cannot carry')

    def test_human_authority(self):
        next(d for d in self.registers['decisions'] if d['id'] == self.program['authorization'])['actor']['kind'] = 'persona'
        self.rejects('approved decision by its human owner')

    def test_duplicate_registry_ids(self):
        for key in ('work', 'decisions'):
            with self.subTest(registry=key):
                self.registers[key].append(copy.deepcopy(self.registers[key][-1]))
                self.rejects('duplicate ' + key + ' ID')
                self.registers[key].pop()

    def test_registry_shapes(self):
        for key in ('work', 'decisions'):
            original = self.registers[key]
            for value in (None, {}, [None], ['record'], [{}], [{'id': []}], [{'id': ''}], [{'id': '  '}]):
                with self.subTest(registry=key, value=value):
                    self.registers[key] = value
                    self.rejects(key)
            self.registers[key] = original

    def test_program_authority_shapes(self):
        for field in ('authorization', 'human_owner'):
            original = self.program[field]
            for value in (None, [], {}, '', '  '):
                with self.subTest(field=field, value=value):
                    self.program[field] = value
                    self.rejects(field)
            self.program[field] = original

    def test_actor_shapes(self):
        decision = next(d for d in self.registers['decisions'] if d['id'] == self.program['authorization'])
        for value in (None, [], 'human', {}, {'kind': 'human', 'name': []}):
            with self.subTest(actor=value):
                decision['actor'] = value
                self.rejects('approved decision by its human owner')

    def test_invalid_registry_check_is_read_only(self):
        self.registers['work'].append(copy.deepcopy(self.registers['work'][-1]))
        self.run_check()
        before = {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertTrue(check(self.root))
        self.assertEqual(before, {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()})

    def test_missing_evidence(self):
        (self.root / 'kb' / self.receipt_path).unlink()
        self.rejects('evidence missing')

    def test_unsafe_paths(self):
        for path in ('../outside.json', '/tmp/outside.json'):
            with self.subTest(path=path):
                self.program['items'][0]['evidence'] = [path]
                self.rejects('KB-relative path')

    def test_symlink_escape(self):
        outside = self.root / 'outside.json'
        outside.write_text('{}')
        (self.root / 'kb/records/escape.json').symlink_to(outside)
        self.program['items'][0]['evidence'].append('records/escape.json')
        self.rejects('outside KB')

    def test_receipt_faults(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        faults = [
            ('program_item', 'POD-A500-999', 'missing linked delivery receipt'),
            ('work_id', 'POD-WORK-190', 'work_id differs'),
            ('authorization', 'POD-DEC-001', 'authorization differs'),
            ('review', 'records/missing.json', 'receipt review must be listed'),
            ('deployment', {'conclusion': 'failure'}, 'successful deployment'),
            ('deployment', {'required': False}, 'exemption reason'),
            ('live', {}, 'dated live evidence'),
            ('merge_commit', 'main', 'merge_commit SHA'),
            ('pull_request', 'https://github.com/example/elsewhere/pull/1', 'repository’s PR URL'),
        ]
        for field, value, message in faults:
            with self.subTest(field=field, value=value):
                self.write(self.receipt_path, dict(original, **{field: value}))
                self.rejects(message)

    def test_deployment_commit_and_workflow(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        for field, value, message in (
            ('head', 'a' * 40, 'deployment head must match'),
            ('head', None, 'deployment head must match'),
            ('workflow', 'unreviewed.yml', 'publish-site.yml'),
            ('publish_approved', False, 'publish_approved must be true'),
            ('publish_approved', 1, 'publish_approved must be true'),
            ('input', {'publish_approved': False}, 'publish_approved must be true'),
            ('input', [], 'deployment input must be an object'),
        ):
            with self.subTest(field=field, value=value):
                candidate = copy.deepcopy(original)
                candidate['deployment'][field] = value
                self.write(self.receipt_path, candidate)
                self.rejects(message)

    def test_failed_or_malformed_validation(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        for key in ('validation', 'required_checks'):
            for value in (None, [], {}, {'conclusion': 'failure'},
                          {'conclusion': 'success', 'result': 'failure'}):
                with self.subTest(key=key, value=value):
                    self.write(self.receipt_path, dict(original, **{key: value}))
                    self.rejects(key + ' must record success')

    def test_run_urls_reject_other_repositories_and_non_runs(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        for key in ('validation', 'required_checks', 'deployment'):
            for field in ('url', 'run'):
                for value in ('https://github.com/example/elsewhere/actions/runs/1',
                              'https://github.com/ahimanikya/project-odisha/pull/1', None):
                    with self.subTest(key=key, field=field, value=value):
                        candidate = copy.deepcopy(original)
                        candidate.setdefault(key, {'conclusion': 'success'})[field] = value
                        self.write(self.receipt_path, candidate)
                        self.rejects('repository’s Actions run URL')

    def test_legacy_deployment_url_checked(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        self.write(self.receipt_path, dict(original, deployment='https://example.com/run',
                                         deployment_conclusion='success'))
        self.rejects('repository’s Actions run URL')

    def test_conflicting_deployment_results(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        for legacy in (False, True):
            candidate = copy.deepcopy(original)
            if legacy:
                candidate['deployment_conclusion'] = 'failure'
            else:
                candidate['deployment']['result'] = 'failure'
            self.write(self.receipt_path, candidate)
            self.rejects('deployment outcomes must all be success')

    def test_document_receipt_validation_is_not_exempt(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        original['deployment'] = {'required': False, 'reason': 'Tooling only'}
        original['validation'] = {'conclusion': 'failure'}
        self.write(self.receipt_path, original)
        self.rejects('validation must record success')

    def test_delivery_failure_check_is_read_only(self):
        original = json.loads((self.root / 'kb' / self.receipt_path).read_text())
        original['deployment']['head'] = 'a' * 40
        self.write(self.receipt_path, original)
        self.run_check()
        before = {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertTrue(check(self.root))
        self.assertEqual(before, {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()})

    def test_missing_review(self):
        self.program['items'][12]['evidence'] = [self.receipt_path]
        self.rejects('missing linked passing review')

    def test_malformed_json(self):
        (self.root / 'kb' / self.receipt_path).write_text('{')
        self.rejects('Expecting property name')

    def test_missing_acceptance_and_naive_date(self):
        self.program['items'][0]['acceptance'] = ''
        self.program['items'][0]['completed_at'] = '2026-10-09'
        self.rejects('acceptance is required')
        self.rejects('timezone-aware')

    def test_target_overrun(self):
        self.program['target_completed_items'] = 1
        self.rejects('exceeded completion target')

    def test_read_only(self):
        self.run_check()
        before = {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        check(self.root)
        self.assertEqual(before, {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()})


if __name__ == '__main__':
    unittest.main()
