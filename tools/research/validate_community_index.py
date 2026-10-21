"""Read-only structural checks for community research coverage, not identity adjudication."""
import argparse
from datetime import date
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

DEFAULT_INDEX = Path(__file__).resolve().parents[2] / 'kb/research/communities/coverage-index.json'
EQUIVALENCE_TYPES = {'alias_of', 'same_as', 'equivalent'}
SCOPE = ('Checks declared structure, provenance references and explicit equivalence evidence flags. '
         'Does not establish factual equivalence, exhaustive coverage, ancestry, caste/legal status, '
         'source truth or human approval; derives no aliases and writes no files.')


def validate(data):
    errors = []

    def check(ok, message):
        if not ok:
            errors.append(message)

    def text(value):
        return isinstance(value, str) and bool(value.strip())

    def strings(value, label, nonempty=True):
        ok = isinstance(value, list) and (bool(value) or not nonempty)
        ok = ok and all(text(item) for item in value)
        check(ok, label + ' must be a list of nonempty strings' + (' with at least one entry' if nonempty else ''))
        return value if ok else []

    def rows(key):
        value = data.get(key)
        check(isinstance(value, list), key + ' must be an array')
        if not isinstance(value, list):
            return []
        for i, row in enumerate(value):
            check(isinstance(row, dict), f'{key}[{i}] must be an object')
        return [row for row in value if isinstance(row, dict)]

    def ids(items, label):
        found = set()
        for i, item in enumerate(items):
            value = item.get('id')
            check(text(value), f'{label}[{i}] missing id')
            if text(value):
                check(value not in found, f'Duplicate {label} id: {value}')
                found.add(value)
        return found

    if not isinstance(data, dict):
        return {'result': 'FAIL', 'counts': {}, 'errors': ['Index must be an object'], 'scope': SCOPE}
    check(type(data.get('schema_version')) is int and data['schema_version'] == 1, 'schema_version must be 1')
    coverage = data.get('coverage')
    check(isinstance(coverage, dict), 'coverage must be an object')
    if isinstance(coverage, dict):
        check(coverage.get('exhaustive') is False, 'coverage.exhaustive must be false')
        check(text(coverage.get('scope')), 'coverage.scope must be nonempty')
        strings(coverage.get('limits'), 'coverage.limits')
        counting = coverage.get('counting_note')
        check(text(counting), 'coverage.counting_note must explicitly state no substantive credit')
        if text(counting):
            check(bool(re.search(r'\b(?:no|zero|0)\s+substantive\s+(?:programme\s+)?credit\b', counting, re.I)),
                  'coverage.counting_note must state "no substantive credit" (or zero substantive credit)')
    sources, observations, topics = rows('sources'), rows('observations'), rows('topics')
    source_ids = ids(sources, 'source')
    observation_ids = ids(observations, 'observation')
    topic_ids = ids(topics, 'topic')
    for source in sources:
        label = 'Source ' + str(source.get('id', '?'))
        for field in ('title', 'url', 'accessed_on', 'scope'):
            check(text(source.get(field)), f'{label}: missing {field}')
        url = source.get('url')
        if text(url):
            try:
                parsed = urlsplit(url)
                valid_url = parsed.scheme in {'https', 'http'} and bool(parsed.netloc)
            except ValueError:
                valid_url = False
            check(valid_url, label + ': URL must be absolute HTTP(S)')
        accessed = source.get('accessed_on')
        valid_date = False
        if text(accessed) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', accessed):
            try:
                date.fromisoformat(accessed)
                valid_date = True
            except ValueError:
                pass
        check(valid_date, label + ': accessed_on must be an ISO calendar date')
        check(source.get('status') in ('inspected', 'partial', 'unavailable'), label + ': invalid status')
        strings(source.get('limits'), label + '.limits')
    locators = set()
    for observation in observations:
        label = 'Observation ' + str(observation.get('id', '?'))
        source_id = observation.get('source_id')
        check(text(source_id) and source_id in source_ids, label + ': dangling or missing source_id')
        for field in ('locator', 'raw_label', 'context'):
            check(text(observation.get(field)), f'{label}: missing {field}')
        if text(source_id) and text(observation.get('locator')):
            key = (source_id, observation['locator'])
            check(key not in locators, f'{label}: duplicate source+locator {key!r}')
            locators.add(key)

    def evidence_refs(value, label):
        references = strings(value, label)
        check(len(references) == len(set(references)), label + ': duplicate observation references')
        for reference in references:
            check(reference in observation_ids, label + ': dangling observation ' + reference)
        return references

    routes = set()
    relationships_count = 0
    for topic in topics:
        label = 'Topic ' + str(topic.get('id', '?'))
        for field in ('label', 'kind', 'status'):
            check(text(topic.get(field)), f'{label}: missing {field}')
        provenance = evidence_refs(topic.get('source_observation_ids'), label + '.source_observation_ids')
        evidence = evidence_refs(topic.get('evidence'), label + '.evidence')
        check(set(evidence).issubset(provenance), label + ': evidence must be included in source_observation_ids')
        if 'route' in topic:
            route = topic['route']
            valid_route = text(route) and route.startswith('/') and not route.startswith('//') and not any(c in route for c in '?#')
            check(valid_route, label + ': route must be a local absolute path without query or fragment')
            if valid_route:
                check(route not in routes, label + ': duplicate canonical route ' + route)
                routes.add(route)
        relationships = topic.get('relationships')
        check(isinstance(relationships, list), label + ': relationships must be an array')
        if not isinstance(relationships, list):
            continue
        relationships_count += len(relationships)
        for i, relationship in enumerate(relationships):
            rel_label = f'{label}.relationships[{i}]'
            check(isinstance(relationship, dict), rel_label + ' must be an object')
            if not isinstance(relationship, dict):
                continue
            target = relationship.get('target')
            check(text(target) and target in topic_ids, rel_label + ': dangling or missing target')
            for field in ('type', 'note'):
                check(text(relationship.get(field)), f'{rel_label}: missing {field}')
            evidence_refs(relationship.get('evidence'), rel_label + '.evidence')
            if text(relationship.get('type')) and relationship['type'] in EQUIVALENCE_TYPES:
                check(relationship.get('evidence_status') == 'verified', rel_label + ': equivalence requires evidence_status verified')
    return {'result': 'FAIL' if errors else 'PASS',
            'counts': {'sources': len(sources), 'observations': len(observations), 'topics': len(topics),
                       'relationships': relationships_count, 'routes': len(routes)},
            'errors': errors, 'scope': SCOPE}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--index', type=Path, default=DEFAULT_INDEX, help='Index JSON to inspect; default is canonical coverage index')
    args = parser.parse_args(argv)
    try:
        data = json.loads(args.index.read_text(encoding='utf-8'))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        result = {'result': 'FAIL', 'counts': {}, 'errors': [str(exc)], 'scope': SCOPE}
    else:
        result = validate(data)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return int(result['result'] != 'PASS')


if __name__ == '__main__':
    sys.exit(main())
