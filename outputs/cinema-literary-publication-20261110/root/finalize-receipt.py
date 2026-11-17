from pathlib import Path
import json,datetime
R=Path(__file__).resolve().parents[3];O=Path(__file__).parent
rel=O.parent
load=lambda p:json.loads((R/p).read_text())
def save(p,d):(R/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
hp='kb/records/cinema-literary-publication-2026-11-10.json'
h=load(hp);pr=json.loads((O/'merged-pr.json').read_text());ci=json.loads((O/'validation-run.json').read_text());deploy=json.loads((O/'deployment-run.json').read_text());live=json.loads((O/'live-verification.json').read_text());delivery=json.loads((rel/'review/delivery-review.json').read_text())
assert pr['state']=='MERGED' and ci['conclusion']=='success' and deploy['conclusion']=='success' and live['status']=='PASS'
assert deploy['headSha']==pr['mergeCommit']['oid']
assert 'PASS' in str(delivery.get('status',delivery.get('verdict',delivery.get('result',''))))
h.update(status='published_verified',publication_performed=True,scope_released=True,book_assets_published=True,release_review=str((rel/'review/release-review.json').relative_to(R)),delivery_review=str((rel/'review/delivery-review.json').relative_to(R)),delivery_review_result='PASS_DELIVERY',live_verification=str((O/'live-verification.json').relative_to(R)),live_browser_review=str((O/'live-browser-review.json').relative_to(R)),next_action='Seek original texts and first-publication/translation evidence when available; preserve independent film-credit, payment and delivered-support gaps without inference.')
h['release']={'pr':pr['url'],'head_sha':pr['headRefOid'],'merge_sha':pr['mergeCommit']['oid'],'merged_at':pr['mergedAt'],'validation_run':ci['url'],'deployment_run':deploy['url'],'deployment_conclusion':deploy['conclusion'],'release_tag':h['release_tag']}
h['published_routes']=['/cinema/literature-and-screen/','/people/biyott-projna-tripathy/','/cinema/book/'];save(hp,h)
m=load(str((rel/'book-release-manifest.json').relative_to(R)));m.update(status='published_verified',publication_performed=True,publication_receipt=hp);save(str((rel/'book-release-manifest.json').relative_to(R)),m)
op=load('kb/team/operations.json')
for row in op['parallel_programmes']:
 if row.get('name')=='Cinema research and story expansion':
  row.update(status='published_verified',scope_released=True,active_article=None,last_publication_handoff=hp.removeprefix('kb/'),note='Nilamani stage example and Palmful opening observation published; exact digital and print downloads verified. Open research questions retained; no programme credit.')
save('kb/team/operations.json',op)
for prev in ['kb/records/cinema-nilamani-adaptation-2026-11-10.json','kb/records/cinema-palmful-source-2026-11-10.json']:
 d=load(prev);d['subsequent_publication']={'receipt':hp.removeprefix('kb/'),'status':'published_verified','scope':'Reviewed bounded observation only; original research limits retained.'};save(prev,d)
p=R/'kb/index.md';s=p.read_text();lines=s.splitlines();lines=[('Cinema literary additions published and verified: [Nilamani’s dramatic example and Biyott’s Palmful opening](records/cinema-literary-publication-2026-11-10.json). Both articles retain compact source notes and their research limits. Matching book downloads preserve 49 chapters, with 273 digital pages, 278 print pages and 550 notes. Original-story, first-publication, translation, film-credit and payment questions remain open.' if x.startswith(('Cinema publication in preparation: [Nilamani','Cinema publication awaiting host recovery: [Nilamani')) else x) for x in lines];s='\n'.join(lines)+'\n';s=s.replace('Current public articles and books are unchanged. [Research handoff](records/cinema-palmful-source-2026-11-10.json).','The bounded opening-page observation is now published in Biyott’s profile; the research limits remain open. [Research handoff](records/cinema-palmful-source-2026-11-10.json).');p.write_text(s)
roll=load('kb/records/article-editorial-rollout.json')
def visit(x):
 if isinstance(x,dict):
  if x.get('latest_revision_receipt')=='records/cinema-bideha-publication-2026-11-10.json':x['latest_revision_receipt']=hp.removeprefix('kb/')
  for v in x.values():visit(v)
 elif isinstance(x,list):
  for v in x:visit(v)
visit(roll);save('kb/records/article-editorial-rollout.json',roll)
p=R/'kb/history/LEDGER.md';s=p.read_text();s+='\n### 10 November 2026 · Literary examples and both Cinema editions published\n\nPublished the reviewed Nilamani Sahu printed-dramatization example in Literature and Screen and the opening-page Palmful observation in Biyott Projna Tripathy’s profile. Separate source, article, PDF and staged-release gates passed; current-main integration preserved other work. Both live PDFs match reviewed bytes: 273 digital pages and 278 print pages, 49 chapters and 550 notes. Numbered sources, existing imagery and prior editions remain intact. Original-story, first-publication, translation, film-credit, compensation and delivered-support questions retain their limits. No outreach or programme credit. [Publication and verification](../records/cinema-literary-publication-2026-11-10.json).\n';p.write_text(s)
print('Recorded actual publication and released own scope')
