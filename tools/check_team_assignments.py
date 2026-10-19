"""Check UTP team ownership consistency; not an atomic lock or proof of human review."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def validate(assignments, operations, rollout, decisions):
    errors = []
    names = [x['short_name'] for x in assignments['assignments']]
    if len(names) != len(set(names)) or set(names) != {'Disha','Anvesha','Samanta','Drishti'}:
        errors.append('Four distinct assigned UTP roles required')
    authority = operations['authorization']
    if not any(d['id'] == authority and d['status'] == 'approved' and d['actor']['kind'] == 'human' for d in decisions):
        errors.append('Missing approved human activation record')
    for assignment in assignments['assignments']:
        if assignment.get('human_reports') or assignment['human_supervisor'] != operations['human_authority']:
            errors.append('Invalid human supervision/reporting')
        expected = 'coordinator_in_current_chat' if assignment['short_name'] == 'Disha' else 'separate_subagent_per_assignment'
        if assignment['execution_mode'] != expected or assignment['decision_reference'] != authority:
            errors.append('Assignment mode or authority mismatch')
    if any(operations.get(k) != 'Disha' for k in ['coordinator','shared_writer','publisher']):
        errors.append('Only Disha coordinates shared records and publication')
    active = [x for x in rollout['items'] if x['status'] == 'in_progress']
    if len(active) > 1 or operations['maximum_active_articles'] != 1:
        errors.append('Only one article may be active')
    claim = operations.get('current_article')
    if claim:
        article = next((x for x in rollout['items'] if x['id'] == claim['id']), None)
        if not article or article['route'] != claim['route'] or claim['owner'] != 'Disha':
            errors.append('Claim does not match an owned article')
        if claim['phase'] != 'receipt_integrated' and (not article or article['status'] != 'in_progress'):
            errors.append('Active claim must own the in-progress article')
        if claim['phase'] == 'receipt_integrated' and (not article or article['status'] != 'completed'):
            errors.append('Released claim needs completed article receipt')
        if active and active[0]['id'] != claim['id']:
            errors.append('Claim conflicts with active article')
    return errors

if __name__ == '__main__':
    def load(p): return json.loads((ROOT/'kb'/p).read_text())
    errors = validate(load('team/assignments.json'),load('team/operations.json'),load('records/article-editorial-rollout.json'),load('registers/records.json')['decisions'])
    print(json.dumps({'result':'FAIL' if errors else 'PASS','errors':errors,'scope':'Record consistency, not distributed locking, actual authorization or independent review.'}))
    raise SystemExit(bool(errors))
