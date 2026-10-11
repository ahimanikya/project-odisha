#!/usr/bin/env python3
"""Check sound intake consistency; never certify consent or publication."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / 'kb'


def check(data, kb=KB):
    errors = []
    ids = set()
    for item in data.get('items', []):
        tag = item.get('id', '<missing>')
        def fail(message):
            errors.append(f'{tag}: {message}')
        if tag in ids:
            fail('duplicate identity')
        ids.add(tag)
        article = item.get('article', '')
        path = (kb / article).resolve()
        if not path.is_relative_to(kb.resolve()) or not path.is_file():
            fail('article absent or outside KB')
            continue
        match = re.search(r'^sources: (.*)$', path.read_text(), re.M)
        source_ids = {s['id'] for s in json.loads(match.group(1))} if match else set()
        if not item.get('source_ids') or not set(item['source_ids']) <= source_ids:
            fail('source pointers absent or not in article')
        for field in ('purpose', 'questions', 'desired_capture'):
            if not item.get(field):
                fail(f'{field} missing')
        state = item.get('status')
        if state == 'planned':
            for field in ('provenance_kind', 'capture', 'asset', 'context_review', 'rights_review', 'accessibility', 'editorial_review', 'publication_authorization'):
                if item.get(field) is not None:
                    fail(f'planned record asserts {field}')
            continue
        if state not in ('captured', 'cleared_for_review'):
            fail('unsupported state; publication is outside this model')
            continue
        if item.get('provenance_kind') not in ('field_recording', 'licensed_archive', 'synthetic'):
            fail('capture provenance missing')
        capture = item.get('capture') or {}
        for field in ('date', 'place', 'recorder_credit', 'participant_credit', 'language_status', 'occasion'):
            if not capture.get(field):
                fail(f'capture {field} missing')
        asset = item.get('asset') or {}
        file = (kb / asset.get('path', '')).resolve()
        if not file.is_relative_to(kb.resolve()) or not file.is_file():
            fail('asset absent or outside KB')
        elif hashlib.sha256(file.read_bytes()).hexdigest() != asset.get('sha256'):
            fail('asset checksum mismatch')
        duration = asset.get('duration_seconds')
        if isinstance(duration, bool) or not isinstance(duration, (float, int)) or duration <= 0:
            fail('positive duration missing')
        if not asset.get('editing_notes'):
            fail('editing notes missing')
        if state == 'cleared_for_review':
            if item.get('provenance_kind') == 'synthetic':
                fail('synthetic sound is not documentary evidence')
            for field in ('context_review', 'rights_review'):
                review = item.get(field) or {}
                for key in ('reviewer', 'scope', 'evidence_ref'):
                    if not review.get(key):
                        fail(f'{field} {key} missing')
            rights = item.get('rights_review') or {}
            for key in ('recording', 'performers', 'underlying_work', 'event_restrictions', 'public_use'):
                if not (rights.get('coverage') or {}).get(key):
                    fail(f'rights coverage {key} missing')
            access = item.get('accessibility') or {}
            for key in ('description', 'speech_lyrics_status', 'text_alternative'):
                if not access.get(key):
                    fail(f'accessibility {key} missing')
    return errors


if __name__ == '__main__':
    data = json.loads((KB / 'records/sound-recording-briefs.json').read_text())
    errors = check(data)
    print(json.dumps({'result': 'FAIL' if errors else 'PASS', 'records': len(data['items']), 'errors': errors, 'scope': 'Record consistency only; not audio, consent or human review.'}, indent=2))
    raise SystemExit(bool(errors))
