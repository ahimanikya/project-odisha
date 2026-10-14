#!/usr/bin/env python3
"""Read-only record integrity checks; not proof of research or live behavior.

Evidence paths are KB-relative. Existing shared-batch receipts remain valid.
No network requests, rewrites, approvals or inferred completion take place.
"""
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATES = {'proposed', 'in_progress', 'blocked', 'deferred', 'failed', 'completed'}
SHA = re.compile(r'[0-9a-f]{40}')
RUN = re.compile(r'https://github\.com/ahimanikya/(?:utkal-project|project-odisha)/actions/runs/[1-9][0-9]*')
PR = re.compile(r'https://github\.com/ahimanikya/(?:utkal-project|project-odisha)/pull/[1-9][0-9]*')


def timestamp(value):
    try:
        return isinstance(value, str) and datetime.fromisoformat(value.replace('Z', '+00:00')).tzinfo is not None
    except ValueError:
        return False


def linked(record, item):
    return (record.get('program_item') == item or any(
        isinstance(record.get(key), list) and item in record[key]
        for key in ('completed_program_items', 'items')))


def evidence_file(kb, value):
    if not isinstance(value, str) or not value or Path(value).is_absolute() or '..' in Path(value).parts:
        raise ValueError('evidence must be a KB-relative path without traversal')
    path = (kb / value).resolve()
    if not path.is_relative_to(kb.resolve()) or not path.is_file():
        raise ValueError('evidence missing or outside KB: ' + value)
    return path


def record_index(registers, key):
    """Reject ambiguous identities before any authority or work lookup."""
    rows = registers.get(key)
    if not isinstance(rows, list):
        raise ValueError(f'{key} must be a list of objects with unique IDs')
    indexed = {}
    for position, row in enumerate(rows):
        if not isinstance(row, dict):
            raise ValueError(f'{key}[{position}] must be an object')
        ident = row.get('id')
        if not isinstance(ident, str) or not ident.strip():
            raise ValueError(f'{key}[{position}] needs a non-empty string ID')
        if ident in indexed:
            raise ValueError(f'duplicate {key} ID: {ident}')
        indexed[ident] = row
    return indexed


def delivery_consistency(receipt):
    """Check supplied evidence for contradictions; never query GitHub or infer missing facts.

    Older receipts use run/result or a bare deployment URL. Keep these shapes
    readable, but do not let one successful alias hide another failed value.
    """
    errors = []

    def run_urls(record, label):
        for key in ('url', 'run'):
            if key in record and (not isinstance(record[key], str)
                                  or not RUN.fullmatch(record[key])):
                errors.append(f'{label} {key} requires this repository’s Actions run URL')

    for key in ('validation', 'required_checks'):
        if key not in receipt:
            continue
        record = receipt[key]
        outcomes = [record[k] for k in ('conclusion', 'result') if k in record] if isinstance(record, dict) else []
        if not outcomes or any(v != 'success' for v in outcomes):
            errors.append(f'{key} must record success without contradictory outcomes')
        if isinstance(record, dict):
            run_urls(record, key)

    deployment = receipt.get('deployment')
    if isinstance(deployment, str):
        if not RUN.fullmatch(deployment):
            errors.append('deployment requires this repository’s Actions run URL')
    elif isinstance(deployment, dict):
        run_urls(deployment, 'deployment')
        if 'head' in deployment and deployment['head'] != receipt.get('merge_commit'):
            errors.append('deployment head must match merge_commit')
        if 'workflow' in deployment and deployment['workflow'] != 'publish-site.yml':
            errors.append('deployment workflow must be publish-site.yml')
        if 'publish_approved' in deployment and deployment['publish_approved'] is not True:
            errors.append('deployment publish_approved must be true')
        if 'input' in deployment:
            inputs = deployment['input']
            if not isinstance(inputs, dict):
                errors.append('deployment input must be an object')
            elif 'publish_approved' in inputs and inputs['publish_approved'] is not True:
                errors.append('deployment input publish_approved must be true')
    outcomes = [deployment[k] for k in ('conclusion', 'result') if k in deployment] if isinstance(deployment, dict) else []
    if 'deployment_conclusion' in receipt:
        outcomes.append(receipt['deployment_conclusion'])
    if any(value != 'success' for value in outcomes):
        errors.append('deployment outcomes must all be success')
    return errors


def check(root=ROOT):
    kb = root / 'kb'
    errors = []
    try:
        program = json.loads((kb / 'records/autonomous-500-program.json').read_text())
        registers = json.loads((kb / 'registers/records.json').read_text())
        if not isinstance(program, dict) or not isinstance(registers, dict):
            raise ValueError('program and registers must be objects')
        items = program.get('items')
        if not isinstance(items, list) or not all(isinstance(i, dict) for i in items):
            raise ValueError('items must be a list of objects')
        work = record_index(registers, 'work')
        decisions = record_index(registers, 'decisions')
    except (OSError, ValueError, KeyError, TypeError) as exc:
        return [f'Cannot read program/registers: {exc}']

    authority = program.get('authorization')
    for field in ('authorization', 'human_owner'):
        if not isinstance(program.get(field), str) or not program[field].strip():
            errors.append(f'Program {field} must be a non-empty string')
    if errors:
        return errors
    decision = decisions.get(authority, {})
    actor = decision.get('actor')
    if (decision.get('status') != 'approved' or not isinstance(actor, dict)
            or actor.get('kind') != 'human' or actor.get('name') != program['human_owner']):
        errors.append('Program authorization must reference an approved decision by its human owner')
    completed = sum(i.get('status') == 'completed' for i in items)
    if type(program.get('completed_items')) is not int or program['completed_items'] != completed:
        errors.append(f'completed_items must equal {completed} completed entries')
    target = program.get('target_completed_items')
    if type(target) is not int or target <= 0 or completed > target:
        errors.append('Invalid or exceeded completion target')
    seen = set()
    for item in items:
        ident = item.get('id')
        label = ident if isinstance(ident, str) else '<invalid ID>'
        def fail(message):
            errors.append(f'{label}: {message}')
        if not isinstance(ident, str) or not re.fullmatch(r'UTP-A500-[0-9]{3}', ident):
            fail('invalid item ID')
        elif ident in seen:
            fail('duplicate item ID')
        else:
            seen.add(ident)
        for field in ('title', 'acceptance'):
            if not isinstance(item.get(field), str) or not item[field].strip():
                fail(f'{field} is required before implementation')
        status = item.get('status')
        if not isinstance(status, str) or status not in STATES:
            fail('unknown status')
        work_id = item.get('work_id')
        w = work.get(work_id, {}) if isinstance(work_id, str) else {}
        if not w:
            fail('unknown work_id')
        references = item.get('evidence')
        if not isinstance(references, list):
            fail('evidence must be a list'); references = []
        documents = {}
        for reference in references:
            try:
                path = evidence_file(kb, reference)
                if path.suffix == '.json':
                    document = json.loads(path.read_text())
                    if not isinstance(document, dict):
                        raise ValueError('JSON evidence must be an object')
                    documents[reference] = document
            except (OSError, ValueError) as exc:
                fail(str(exc))
        if status != 'completed':
            if item.get('completed_at') is not None:
                fail('unfinished item cannot carry completed_at')
            continue
        if not timestamp(item.get('completed_at')):
            fail('completion requires a timezone-aware completed_at')
        if w.get('status') != 'completed':
            fail('completed item must reference completed work')
        related = [d for d in documents.values() if linked(d, ident)]
        reviews = [d for d in related if d.get('status') in ('pass', 'pass_with_limitations')
                   and isinstance(d.get('verification'), dict) and d['verification']]
        if not reviews:
            fail('missing linked passing review with verification evidence')
        receipts = [d for d in related if 'merge_commit' in d]
        if not receipts:
            fail('missing linked delivery receipt')
        for record in related:
            if record.get('authorization') != authority:
                fail('linked evidence authorization differs from program')
            if 'work_id' in record and record['work_id'] != work_id:
                fail('linked evidence work_id differs from item')
        for receipt in receipts:
            for finding in delivery_consistency(receipt):
                fail(finding)
            if not PR.fullmatch(str(receipt.get('pull_request', ''))):
                fail('delivery receipt requires this repository’s PR URL')
            for field in ('reviewed_head', 'merge_commit'):
                if not SHA.fullmatch(str(receipt.get(field, ''))):
                    fail(f'delivery receipt requires {field} SHA')
            if 'review' in receipt and (not isinstance(receipt['review'], str)
                                       or documents.get(receipt['review']) not in reviews):
                fail('receipt review must be listed and linked in item evidence')
            deployment = receipt.get('deployment')
            if isinstance(deployment, dict) and deployment.get('required') is False:
                if not isinstance(deployment.get('reason'), str) or not deployment['reason'].strip():
                    fail('non-website delivery needs a deployment exemption reason')
            else:
                outcome = (deployment.get('conclusion', deployment.get('result'))
                           if isinstance(deployment, dict) else receipt.get('deployment_conclusion'))
                if outcome != 'success':
                    fail('website delivery needs a successful deployment record')
                live = receipt.get('live', receipt.get('live_verification'))
                if not isinstance(live, dict) or not timestamp(live.get('checked_at')) or len(live) < 2:
                    fail('website delivery needs dated live evidence')
    return errors


if __name__ == '__main__':
    findings = check()
    print('\n'.join(findings) if findings else 'PASS: autonomous program count and linked delivery records')
    raise SystemExit(bool(findings))
