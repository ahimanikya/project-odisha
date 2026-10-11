"""Exercise false media readiness and integrity failures with synthetic fixtures."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from check_sound_collection import check


class SoundCollectionTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.kb = Path(self.temp.name)
        (self.kb / 'article.md').write_text('sources: [{"id": "source1"}]\n')
        (self.kb / 'fixture.bin').write_bytes(b'fixture bytes, not playable audio')
        self.item = {'id': 'fixture', 'article': 'article.md', 'source_ids': ['source1'], 'purpose': 'Fixture', 'questions': 'Fixture', 'desired_capture': 'Fixture', 'status': 'cleared_for_review', 'provenance_kind': 'licensed_archive', 'capture': {k: 'fixture only' for k in ('date', 'place', 'recorder_credit', 'participant_credit', 'language_status', 'occasion')}, 'asset': {'path': 'fixture.bin', 'sha256': hashlib.sha256((self.kb / 'fixture.bin').read_bytes()).hexdigest(), 'duration_seconds': 1, 'editing_notes': 'Fixture'}, 'context_review': {'reviewer': 'fixture', 'scope': 'fixture', 'evidence_ref': 'fixture'}, 'rights_review': {'reviewer': 'fixture', 'scope': 'fixture', 'evidence_ref': 'fixture', 'coverage': {k: 'fixture' for k in ('recording', 'performers', 'underlying_work', 'event_restrictions', 'public_use')}}, 'accessibility': {k: 'fixture' for k in ('description', 'speech_lyrics_status', 'text_alternative')}}

    def errors(self):
        return check({'items': [self.item]}, self.kb)

    def test_complete_structural_fixture(self):
        self.assertEqual(self.errors(), [])

    def test_missing_underlying_work_rights(self):
        del self.item['rights_review']['coverage']['underlying_work']
        self.assertTrue(any('underlying_work' in e for e in self.errors()))

    def test_synthetic_not_documentary(self):
        self.item['provenance_kind'] = 'synthetic'
        self.assertTrue(any('synthetic sound' in e for e in self.errors()))

    def test_checksum_detects_changed_asset(self):
        (self.kb / 'fixture.bin').write_bytes(b'changed')
        self.assertTrue(any('checksum mismatch' in e for e in self.errors()))

    def test_planned_cannot_assert_capture(self):
        self.item['status'] = 'planned'
        self.assertTrue(any('planned record asserts asset' in e for e in self.errors()))

    def test_source_must_belong_to_article(self):
        self.item['source_ids'] = ['unrelated']
        self.assertTrue(any('source pointers' in e for e in self.errors()))

    def test_asset_cannot_escape_kb(self):
        self.item['asset']['path'] = '../outside.bin'
        self.assertTrue(any('outside KB' in e for e in self.errors()))

    def test_published_state_not_granted(self):
        self.item['status'] = 'published'
        self.assertTrue(any('publication is outside' in e for e in self.errors()))


if __name__ == '__main__':
    unittest.main()
