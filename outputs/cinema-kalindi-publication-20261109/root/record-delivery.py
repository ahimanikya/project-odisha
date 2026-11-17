import hashlib, json
from pathlib import Path

root = Path(__file__).resolve().parents[3]
out = root / 'outputs/cinema-kalindi-publication-20261109'
def read(path): return json.loads((root / path).read_text())
def write(path, value): (root / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
base = 'outputs/cinema-kalindi-publication-20261109/'
live = read(base+'root/live-verification.json')
deploy = read(base+'root/deployment.json')
pr = read(base+'root/merged-pr.json')
review = read(base+'review/delivery-review.json')
hosted = read(base+'root/hosted-validation.json')
assert live['result'] == 'PASS' and deploy['conclusion'] == 'success'
assert pr['state'] == 'MERGED' and review['status'] == 'PASS_DELIVERY'
assert hosted['conclusion'] == 'success' and hosted['headSha'] == pr['headRefOid']
assert deploy['headSha'] == pr['mergeCommit']['oid']
record = 'records/cinema-kalindi-publication-2026-11-09.json'
handoff = read('kb/'+record)
handoff.update(status='published_verified', active_article=None, scope_released=True, publication_performed=True, book_assets_published=True, book_manifest=base+'book-release-manifest.json', pull_request=pr['url'], verified_routes=['/people/kalindi-charan-panigrahi/','/cinema/literature-and-screen/','/cinema/book/'], deployment=deploy, live_verification=base+'root/live-verification.json', delivery_review=base+'review/delivery-review.json', delivery_review_sha256=hashlib.sha256((out/'review/delivery-review.json').read_bytes()).hexdigest(), next_action='Memoir additions and both downloads are live. Film payment remains unverified; Kala Academy reply and Bapa author follow-up remain external dependencies. No additional deployment is required for this receipt.')
handoff['release'] = {'pr':pr['number'],'pr_url':pr['url'],'reviewed_head':pr['headRefOid'],'merge_commit':pr['mergeCommit']['oid'],'validation_run':hosted['databaseId'],'validation_result':'success','deployment_run':deploy['databaseId'],'deployment_result':deploy['conclusion'],'release_tag':handoff['release_tag'],'live_verification':base+'root/live-verification.json','verified_at_utc':live['checked_at_utc']}
write('kb/'+record,handoff)
operations = read('kb/team/operations.json')
for item in operations['parallel_programmes']:
    if item.get('name')=='Cinema research and story expansion':
        item.update(status='published_verified', active_article=None, scope_released=True, handoff=record, last_publication_handoff=record, note='Kalindi memoir additions and both matching downloads published and verified. The other active programme and its ownership are preserved.')
write('kb/team/operations.json',operations)
rollout = read('kb/records/article-editorial-rollout.json')
source_paths = {'/people/kalindi-charan-panigrahi/':'kb/research/people/kalindi-charan-panigrahi.md','/cinema/literature-and-screen/':'kb/research/culture/cinema-series/literature-and-screen.md'}
for item in rollout['items']:
    if item['route'] in source_paths:
        old = item.get('publication_receipt')
        previous = item.setdefault('prior_publication_receipts',[])
        if old and old not in previous: previous.append(old)
        sha = hashlib.sha256((root/source_paths[item['route']]).read_bytes()).hexdigest()
        item.update(publication_receipt=record, revision_status='published_verified', source_sha256=sha, publication_authorization=handoff['authorization'], next_action='Film-adaptation payment remains unresolved; no payment amount is asserted.')
        item['latest_verified_publication']={'receipt':record,'date':'2026-11-09','source_sha256':sha}
write('kb/records/article-editorial-rollout.json',rollout)
p=root/'kb/index.md';text=p.read_text();lines=text.splitlines()
for i,line in enumerate(lines):
    if line.startswith('Current cinema publication:'):
        lines[i]='Current cinema publication: [Kalindi’s memoir, writing and livelihood]('+record+'). His profile and Literature and Screen now include separately reviewed recollections with compact notes. Both matching downloads are live: 50 online readings, 49 book chapters, 272 digital pages, 278 print pages and 545 notes. Chapter order, 62 images, covers and earlier editions are preserved. Periodical contributor payments are distinguished from unverified film-adaptation terms.'
    if line.startswith('Current cinema research:'):
        lines[i]=line.replace('No public article or book changes.','The selected findings are now incorporated and published; source-reading limits remain.').replace('[current handoff](records/cinema-kalindi-memoir-2026-11-09.json)','[research handoff](records/cinema-kalindi-memoir-2026-11-09.json)')
p.write_text('\n'.join(lines)+'\n')
entry={'id':'POD-HIS-CINEMA-KALINDI-PUBLICATION-20261109','recorded_on':'2026-11-09','status':'published_verified','title':'Kalindi memoir integrated into the profile, literature chapter and both books','summary':'Two sequentially reviewed memoir additions published. Film payment remains unverified. Matching digital (272 pages) and print (278 pages) editions with 545 notes and unchanged 49 chapters and 62 images were separately inspected; live PDF bytes match reviewed artifacts. No human-review claim or programme credit.','record':record,'pull_request':pr['url'],'deployment_run':deploy['databaseId']}
p=root/'kb/history/ledger.jsonl';text=p.read_text();assert entry['id'] not in text;p.write_text(text+json.dumps(entry,ensure_ascii=False)+'\n')
p=root/'kb/history/LEDGER.md';p.write_text(p.read_text()+'\n### 9 November 2026 · Kalindi’s memoir reaches the series and books\n\nThe profile and Literature and Screen now include compact, source-reviewed accounts of writing, livelihood and periodical contributor payment. Film-adaptation payment remains unverified. Both matching books are published and their live downloads match the independently reviewed files. Chapter sequence, photographs, covers and earlier editions are preserved. No outreach or programme credit. [Publication receipt](../'+record+').\n')
print('Delivery records updated from verified live evidence; foreign current_task preserved.')
