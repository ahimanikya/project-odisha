#!/usr/bin/env python3
"""Validate provisional transcription structure, never glyph accuracy or completeness.
Usage: python3 validate_transcription.py DRAFT.json [--review REVIEW.json]
Review must bind exact draft bytes in transcription_sha256 or draft_sha256.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse

class ValidationError(ValueError):
    pass

def require(condition, message):
    if not condition:
        raise ValidationError(message)

def text(value):
    return isinstance(value, str) and bool(value.strip())

def positive_int(value):
    return type(value) is int and value > 0

def validate(data, review=None, draft_sha256=None):
    require(isinstance(data, dict), 'draft must be an object')
    require(text(data.get('source_id')), 'source_id required')
    require(text(data.get('source_url')), 'source_url required')
    parsed = urlparse(data['source_url'])
    require(parsed.scheme in ('http', 'https') and bool(parsed.netloc), 'source_url must be HTTP(S)')
    require(text(data.get('input_head')), 'input_head required')
    require(text(data.get('page_status')), 'page_status required')
    require(text(data.get('line_numbering')), 'line_numbering convention required')
    require(text(data.get('uncertainty_convention')), 'uncertainty_convention required')
    require(data.get('page_complete') is False, 'provisional page_complete must be false')
    require(type(data.get('accepted_corpus_increment')) is int and data['accepted_corpus_increment'] == 0,
            'provisional accepted_corpus_increment must be integer zero')
    # These fields are optional, but cannot imply acceptance if present.
    for key in ('human_reviewed', 'human_proofread', 'complete_source_extraction'):
        if key in data:
            require(data[key] is False, key+' must be false')
    for key in ('human_proofread_entries', 'accepted_entry_count', 'accepted_entries_increment'):
        if key in data:
            require(type(data[key]) is int and data[key] == 0, key+' must be integer zero')
    for key in ('accepted_entry_ids', 'pages_fully_transcribed', 'pages_human_reviewed'):
        if key in data:
            require(data[key] == [], key+' must be empty for a provisional draft')
    segments = data.get('segments')
    require(isinstance(segments, list) and bool(segments), 'nonempty segments required')
    ids = set()
    last_end = 0
    previous_segment = None
    portion_mode = any("line_portions" in s for s in segments)
    previous_portion = (0, 0)
    pages = set()
    covered = []
    for i, segment in enumerate(segments):
        require(isinstance(segment, dict), 'segment must be object')
        ident = segment.get('id')
        require(text(ident) and re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*', ident), 'invalid segment id')
        require(ident not in ids, 'duplicate segment id')
        ids.add(ident)
        page = segment.get('pdf_page')
        require(positive_int(page), 'positive integer pdf_page required')
        pages.add(page)
        require(positive_int(segment.get('printed_page')) or text(segment.get('printed_page')), 'printed_page anchor required')
        if 'source_id' in segment:
            require(segment['source_id'] == data['source_id'], 'segment source mismatch')
        line_range = segment.get('text_line_range')
        require(isinstance(line_range, list) and len(line_range) == 2
                and all(positive_int(n) for n in line_range), 'positive line range pair required')
        start, end = line_range
        require(start <= end, 'reversed line range')
        if portion_mode:
            portions = segment.get('line_portions')
            require(isinstance(portions, list) and bool(portions), 'all segments require line_portions in portion mode')
            portion_lines = []
            for part in portions:
                require(isinstance(part, dict) and positive_int(part.get('line'))
                        and positive_int(part.get('portion_index')) and text(part.get('position_note')),
                        'line portion requires positive line/index and position note')
                key = (part['line'], part['portion_index'])
                require(start <= part['line'] <= end and key > previous_portion,
                        'unordered, duplicate or out-of-range line portion')
                previous_portion = key
                portion_lines.append(part['line'])
            require(set(portion_lines) == set(range(start, end+1)), 'line portions must cover declared line range')
        else:
            if start <= last_end:
                require(previous_segment is not None and start == end == last_end
                        and previous_segment['text_line_range'] == [start, end],
                        'unordered or overlapping line ranges')
                require(positive_int(segment.get('subline_index')) and positive_int(previous_segment.get('subline_index'))
                        and segment['subline_index'] > previous_segment['subline_index']
                        and text(segment.get('position_note')) and text(previous_segment.get('position_note')),
                        'same-line segments require ordered distinct subline_index and position_note')
            if 'subline_index' in segment:
                require(start == end and positive_int(segment['subline_index']) and text(segment.get('position_note')),
                        'subline_index requires single line and position_note')
        last_end = end
        previous_segment = segment
        covered.extend(range(start, end+1))
        require(text(segment.get('provisional_visible_reading')), 'provisional reading required')
        require(text(segment.get('status')) and 'provisional' in segment['status'].lower()
                and 'not_accepted' in segment['status'].lower(), 'explicit provisional not_accepted status required')
        require(isinstance(segment.get('uncertainties'), list) and bool(segment['uncertainties'])
                and all(text(u) for u in segment['uncertainties']), 'explicit uncertainty notes required')
        require('normalized_reading' in segment and segment['normalized_reading'] is None,
                'provisional normalized_reading must be explicitly null')
        require(segment.get('human_reviewed') is False, 'segment human_reviewed must be false')
        for key in ('continues_from_previous_page', 'continues_to_next_page'):
            require(key in segment and (segment[key] is None or type(segment[key]) is bool),
                    'continuation must be explicit boolean or null')
        require(text(segment.get('continuation_certainty')), 'continuation certainty note required')
        if i > 0:
            require(segment['continues_from_previous_page'] is False, 'only first segment may have incoming continuation')
        if i < len(segments)-1:
            require(segment['continues_to_next_page'] is False, 'only final segment may have outgoing continuation')
    require(len(pages) == 1, 'one PDF page per draft required')
    page = next(iter(pages))
    if 'pdf_page' in data:
        require(data['pdf_page'] == page, 'top-level PDF page mismatch')
    cross = data.get('cross_page')
    incoming_needed = segments[0]['continues_from_previous_page'] is not False
    outgoing_needed = segments[-1]['continues_to_next_page'] is not False
    if incoming_needed or outgoing_needed:
        require(isinstance(cross, dict), 'unresolved continuation requires cross_page note')
    if cross and ('incoming' in cross or 'outgoing' in cross):
        incoming = cross.get('incoming')
        outgoing = cross.get('outgoing')
        if incoming_needed:
            require(isinstance(incoming, dict), 'incoming continuation note required')
        if incoming:
            require(incoming.get('previous_pdf_page') == page-1
                    and incoming.get('current_segment') == segments[0]['id']
                    and text(incoming.get('previous_segment')) and text(incoming.get('status')),
                    'invalid incoming continuation anchors')
        if outgoing_needed:
            require(isinstance(outgoing, dict) and outgoing.get('segment_id') == segments[-1]['id'],
                    'outgoing continuation must reference final segment')
        if outgoing:
            require(outgoing.get('next_pdf_page') == page+1 and text(outgoing.get('status')),
                    'invalid outgoing continuation anchors')
    elif cross:
        require(not incoming_needed, 'legacy cross_page note does not describe incoming continuation')
        require(isinstance(cross, dict) and cross.get('segment_id') == segments[-1]['id'],
                'cross_page must reference final segment')
        require(cross.get('next_pdf_page') == page+1, 'cross_page next page mismatch')
        require(text(cross.get('status')) and text(cross.get('action')), 'cross_page status/action required')
    if review is not None:
        require(isinstance(review, dict), 'review must be object')
        bindings = [review[k] for k in ('transcription_sha256','draft_sha256') if k in review]
        require(draft_sha256 is not None and bool(bindings) and all(h == draft_sha256 for h in bindings),
                'review SHA does not bind exact draft bytes')
    return {'segment_count':len(segments), 'pdf_page':page, 'declared_body_lines':sorted(set(covered)),
            'same_line_segments':len(covered)-len(set(covered)),
            'line_gaps':[n for n in range(covered[0],covered[-1]+1) if n not in covered],
            'accepted_corpus_increment':0, 'human_reviewed':False,
            'review_hash_verified':review is not None}

def validate_file(path, review_path=None):
    raw = Path(path).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    data = json.loads(raw)
    review = json.loads(Path(review_path).read_bytes()) if review_path else None
    return {'draft_path':str(path), 'transcription_sha256':digest,
            'result':'pass', **validate(data, review, digest),
            'limits':['Structure only: not glyph accuracy, segmentation correctness, physical page completeness, rights or human review.']}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('draft', type=Path)
    parser.add_argument('--review', type=Path)
    args = parser.parse_args()
    try:
        result = validate_file(args.draft, args.review)
    except (ValidationError, ValueError, OSError) as exc:
        print(json.dumps({'result':'fail','error':str(exc)}))
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
