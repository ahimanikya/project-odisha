from pathlib import Path
import datetime, hashlib, json
R = Path(__file__).resolve().parents[3]
O = Path(__file__).parent
B = O.parent
def read(p): return json.loads(p.read_text())
pending = {}
originals = {}
def stage(p, text):
    originals.setdefault(p, p.read_text())
    pending[p] = text
def save(p,d): stage(p,json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
deploy=read(O/'deployment.json');live=read(O/'live-verification.json');merge=read(O/'merged-pr.json');ci=read(O/'hosted-review.json')
REVIEWED_HEAD='937ec0af3e30c322e8e0e835763b076272688246'
PR_URL='https://github.com/ahimanikya/project-odisha/pull/755'
ROUTES={'profile.html':'/people/biyott-projna-tripathy/','literature.html':'/cinema/literature-and-screen/','book.html':'/cinema/book/'}
EXPECTED={'digital':('odia-cinema-a-living-screen-2026-11-10-bideha.pdf','4770487a0b57a359f6eaf22e9c816f09717d5fffb7b1b83fc006964a869b8c0a',38419335,272),'print':('odia-cinema-a-living-screen-print-2026-11-10-bideha.pdf','aea1ceb86f02a5709ece434c9dc20e3e85457204e7de76f2c6c115b2c7e13be6',51350591,278)}
assert merge['url']==PR_URL and merge.get('number',755)==755
assert merge['headRefOid']==REVIEWED_HEAD and merge['state']=='MERGED'
assert deploy['status']=='completed' and deploy['conclusion']=='success'
assert deploy['headSha']==merge['mergeCommit']['oid']
assert ci['headSha']==REVIEWED_HEAD and ci['status']=='completed' and ci['conclusion']=='success'
assert live['status']=='PASS'
manifest=read(B/'book-release-manifest.json')
assert manifest['release_tag']=='odia-cinema-book-2026-11-10-bideha'
assets=[a for a in manifest['assets'] if a['edition'] in EXPECTED]
assert len(assets)==2 and {a['edition'] for a in assets}==set(EXPECTED)
route_checks=[c for c in live['checks'] if 'route' in c]
edition_checks=[c for c in live['checks'] if 'edition' in c]
assert len(live['checks'])==5 and len(route_checks)==3 and len(edition_checks)==2
assert {c['route'] for c in route_checks}==set(ROUTES.values()) and all(c['result']=='PASS' for c in route_checks)
assert {c['edition'] for c in edition_checks}==set(EXPECTED) and all(c['result']=='PASS_EXACT_REVIEWED_BYTES' for c in edition_checks)
assert set(live['responses'])==set(ROUTES)|{a['filename'] for a in assets}
for name,route in ROUTES.items():
    response=live['responses'][name];url='https://projectodisha.org'+route
    assert response['url']==url and response['effective_url']==url and response['http_status']==200
for a in assets:
    assert (a['filename'],a['sha256'],a['bytes'],a['pages'])==EXPECTED[a['edition']]
    actual=live['responses'][a['filename']];url='https://projectodisha.org/archive/'+a['filename']
    assert actual['url']==url and actual['effective_url']==url and actual['http_status']==200
    assert actual['sha256']==a['sha256'] and actual['bytes']==a['bytes']
    assert next(c for c in edition_checks if c['edition']==a['edition'])['sha256']==a['sha256']
for p,h in read(O/'protected.json').items(): assert digest(R/p)==h
hp=R/'kb/records/cinema-bideha-publication-2026-11-10.json';h=read(hp)
for p,v in h['reviewed_source_hashes'].items(): assert digest(R/p)==v
operations=read(R/'kb/team/operations.json')
cinema_rows=[a for a in operations['parallel_programmes'] if a.get('name')=='Cinema research and story expansion']
assert len(cinema_rows)==1, 'Expected one named Cinema programme'
index_text=(R/'kb/index.md').read_text()
index_blocks=[x for x in index_text.split('\n\n') if x.startswith('Cinema update published and verified:') and any(receipt in x for receipt in ['records/cinema-biyott-publication-2026-11-10.json','records/cinema-bideha-publication-2026-11-10.json'])]
assert len(index_blocks)==1, 'Expected one Cinema index block'
rollout=read(R/'kb/records/article-editorial-rollout.json')
for route in list(ROUTES.values())[:2]:
    assert len([a for a in rollout['items'] if a.get('route')==route])==1, 'Expected one rollout target: '+route
h.update(status='published_verified',active_article=None,scope_released=True,publication_performed=True,book_assets_published=True,
    next_action='Seek the original story pages and first-publication details when new evidence becomes available; no payment inference.',
    release_review='outputs/cinema-bideha-publication-20261110/review/release-review.json',
    local_validation='outputs/cinema-bideha-publication-20261110/root/local-validation.json',
    live_verification='outputs/cinema-bideha-publication-20261110/root/live-verification.json',
    release={'pr':merge['url'],'head_sha':merge['headRefOid'],'merge_sha':merge['mergeCommit']['oid'],'merged_at':merge['mergedAt'],'validation_run':ci['url'],'deployment_run':deploy['url'],'deployment_conclusion':deploy['conclusion'],'release_tag':manifest['release_tag']},
    published_routes=['/people/biyott-projna-tripathy/','/cinema/literature-and-screen/','/cinema/book/'])
save(hp,h)
p=R/'kb/team/operations.json';d=operations
for a in d['parallel_programmes']:
    if a.get('name')=='Cinema research and story expansion':
        a.update(handoff='records/cinema-bideha-publication-2026-11-10.json',status='published_verified',scope='Bideha source in Biyott profile and Literature and Screen, plus both book downloads',note='Verified source identification and collection metadata published; both live PDFs match reviewed bytes. Original story pages, first-publication details and payment terms remain open. Foreign ownership preserved.',active_article=None,scope_released=True,last_publication_handoff='records/cinema-bideha-publication-2026-11-10.json')
save(p,d)
p=R/'kb/index.md';s=index_text
start=index_blocks[0]
new='Cinema update published and verified: [Bideha’s literary source](records/cinema-bideha-publication-2026-11-10.json). Biyott Projna Tripathy’s profile and Literature and Screen now identify her same-named story in Kadapana o Cleopatra through her own account, with the collection’s catalogued 2010 first edition kept distinct from the recalled writing date. Both matching books retain 49 chapters: 272 digital pages and 278 print pages, with 549 compact notes. The original story pages, first-publication details and payment questions remain open.'
s=s.replace(start,new)
s=s.replace('Original story pages and any earlier magazine appearance remain open, as do payment questions. [Research handoff]', 'Original story pages and any earlier magazine appearance remain open, as do payment questions. The attributed source connection is now published in the profile, Literature and Screen and both books. [Research handoff]')
stage(p,s)
p=R/'kb/history/LEDGER.md'
ledger=p.read_text()
entry='\n\n### 10 November 2026 · Bideha’s literary source published\n\nPublished the concise source-story connection in Biyott Projna Tripathy’s profile and Literature and Screen after separate source, desktop/mobile, PDF and exact-release reviews. The author’s recalled 2005 or 2006 writing date remains distinct from the collection’s catalogued 2010 first edition. Both live PDFs match their reviewed bytes: 272 digital pages and 278 print pages, each with 549 notes. Chapter order, images, earlier editions and foreign programme ownership are preserved. Original story pages, first-publication details and payment arrangements remain open. No outreach or programme credit. [Publication receipt](../records/cinema-bideha-publication-2026-11-10.json).\n'
heading='### 10 November 2026 · Bideha’s literary source published'
assert ledger.count(heading)<=1, 'Duplicate publication ledger heading'
if heading in ledger:
    assert entry.strip() in ledger, 'Existing publication ledger entry differs'
else:
    stage(p,ledger+entry)
p=R/'kb/records/cinema-bideha-source-2026-11-10.json';d=read(p);d['subsequent_publication']='records/cinema-bideha-publication-2026-11-10.json';save(p,d)
p=R/'kb/records/article-editorial-rollout.json';d=rollout
for a in d['items']:
    if a.get('route') in h['published_routes'][:2]:
        a['latest_revision_receipt']='records/cinema-bideha-publication-2026-11-10.json'
d['updated_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();save(p,d)
manifest.update(publication_performed=True,publication_receipt='kb/records/cinema-bideha-publication-2026-11-10.json');save(B/'book-release-manifest.json',manifest)
# No writes occur until every evidence and unique-target preflight has passed.
for p in pending:
    assert p.read_text()==originals[p], 'Concurrent change: '+str(p)
for p,text in pending.items():
    p.write_text(text)
print('Recorded verified publication and preserved open questions.')
