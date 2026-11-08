from pathlib import Path
import json,hashlib,datetime
root=Path.cwd();base=Path('outputs/cinema-daman-team-publication-20261108');rel=base/'release'
def load(p):return json.loads(Path(p).read_text())
def save(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
dep=load(rel/'deployment-final.json');live=load(rel/'live-verification.json');downloads=load(rel/'public-download-verification.json');pr=load(rel/'merged-pr.json')
manifest=load(base/'book-release-manifest.json');ci=load(rel/'required-validation-integrated.json')
assert pr['state']=='MERGED' and pr['url']=='https://github.com/ahimanikya/project-odisha/pull/724'
assert pr['headRefOid']=='f25aebdaa8b3b3ddd2043e076e0f438ea3a99bf1'
assert pr['mergeCommit']['oid']=='f2cce35d3e97aeba3e4f2f764e79f1b3775d3c3b'
assert ci['conclusion']=='success' and ci['headSha']==pr['headRefOid'] and ci['status']=='completed'
assert dep['databaseId']==42496450895 and dep['status']=='completed' and dep['conclusion']=='success' and dep['headSha']==pr['mergeCommit']['oid']
expected_routes={'/cinema/','/cinema/daman-team/','/cinema/daman/','/cinema/book/','/cinema/reading-guide/','/cinema/lavanya-preeti/','/people/vishal-mourya/','/people/debi-prasad-lenka/','/people/deependra-samal/'}
assert live['status']=='PASS' and len(live['routes'])==len(expected_routes) and {x['route'] for x in live['routes']}==expected_routes
assert all(x['http_status']==200 and len(x['sha256'])==64 for x in live['routes'])
assert live['three_alias_destinations_verified'] is True and live['new_book_links_verified'] is True
assert downloads['status']=='PASS' and len(downloads['assets'])==2
assert {x['edition'] for x in downloads['assets']}=={'digital','print'}
for actual in downloads['assets']:
 expected=next(x for x in manifest['assets'] if x['edition']==actual['edition'])
 assert actual['url']==expected['planned_release_url'] and actual['sha256']==expected['sha256'] and actual['bytes']==expected['bytes'] and actual['matches_reviewed'] is True
rollout=load('kb/records/article-editorial-rollout.json');ops=load('kb/team/operations.json')
assert sum(x['id']=='POD-EDIT-DAMAN-TEAM-20261108' for x in rollout['items'])==1
for path in ['/people/vishal-mourya/','/people/debi-prasad-lenka/','/people/deependra-samal/']:assert sum(x['route']==path for x in rollout['items'])==1
assert sum(x['name']=='Cinema research and story expansion' for x in ops['parallel_programmes'])==1
now=datetime.datetime.now(datetime.timezone.utc).isoformat();record='records/cinema-daman-team-publication-2026-11-08.json'
p=Path('kb')/record;d=load(p);d.update(status='published_verified_receipt_integration',active_article=None,scope_released=False,publication_performed=True,book_assets_published=True,programme_credit=0)
d['release']={'pr':724,'pr_url':pr['url'],'reviewed_head':pr['headRefOid'],'merge_commit':pr['mergeCommit']['oid'],'validation_run':42495077513,'validation_result':'success','deployment_run':42496450895,'deployment_result':'success','release_tag':d['release_tag'],'release_url':'https://github.com/ahimanikya/project-odisha/releases/tag/'+d['release_tag'],'downloads_verification':str(rel/'public-download-verification.json'),'live_verification':str(rel/'live-verification.json'),'verified_at_utc':now}
d['pull_request']=pr['url'];d['deployment']=dep;d['verified_routes']=[x['route'] for x in live['routes']];d['final_review']=str(base/'review/main-integration-review.json');d['final_review_sha256']=hashlib.sha256(Path(d['final_review']).read_bytes()).hexdigest();d['coordination_boundary']=str(rel/'coordination-boundary.json');d['next_action']='Integrate the evidence-only receipt after independent review and required checks, then release this publication scope. No additional website deployment is needed for receipt-only records. Lavanya original story credit remains open.';d['receipt_release_condition']='Release own publication reservations only on the actual reviewed receipt merge; never release another worker claim.';save(p,d)
p=Path('kb/records/article-editorial-rollout.json');d=load(p)
for x in d['items']:
 if x['id']=='POD-EDIT-DAMAN-TEAM-20261108':
  x.update(status='completed',publication=True,editorial_stage='published_verified',publication_receipt=record,publication_authorization='Founder explicitly requested publication of the consolidated DAMaN team page and both book downloads.',human_review_claimed=False,next_action='Retain original profile sources and Lavanya unresolved status; respond to reader feedback with verified evidence.');x.pop('blocker',None)
 if x.get('route') in ['/people/vishal-mourya/','/people/debi-prasad-lenka/','/people/deependra-samal/'] and x.get('pending_transition',{}).get('kind')=='consolidated_profile_redirect':
  transition=x.pop('pending_transition');transition.update(status='published_verified',publication_receipt=record);x['route_transition']=transition
save(p,d)
p=Path('kb/team/operations.json');d=load(p)
for x in d['parallel_programmes']:
 if x['name']=='Cinema research and story expansion':x.update(status='published_verified_receipt_integration',active_article=None,scope_released=False,last_publication_handoff=record,handoff=record,note='DAMaN page and both books published and live-verified. Own evidence-only receipt remains to integrate; preserve the separate active owner and its receipt status.')
save(p,d)
p=Path('kb/index.md');s=p.read_text();a=s.index('Current cinema publication:');b=s.index('Current cinema research:',a);s=s[:a]+'''Current cinema publication: [The people behind DAMaN](records/cinema-daman-team-publication-2026-11-08.json). The consolidated team page, three named profile redirects and both book downloads are live and verified: 50 online readings, 49 book chapters, 272 digital pages and 278 print pages. All three portraits and the original research profiles remain. The previous [film-credits publication](records/cinema-film-credits-publication-2026-11-08.json) remains in the release history; its qualified documentary roles are preserved in the current edition.

'''+s[b:];p.write_text(s)
p=Path('kb/research/methods/research-map.md');s=p.read_text();heading='### DAMaN team publication · 8 November 2026'
if heading not in s:s+='\n'+heading+'\n\nThe [publication receipt](../../records/cinema-daman-team-publication-2026-11-08.json) records the live combined team reading, three person-anchor redirects and matching 272/278-page downloads. The 50-reading website and49-chapter book retain all three portraits and original profile sources. Lavanya’s original story credit remains unresolved; no new source attribution was introduced.\n'
p.write_text(s)
event={'id':'POD-HIS-CINEMA-DAMAN-TEAM-PUBLISHED-20261108','recorded_on':'2026-11-08','status':'published_verified','title':'Consolidated DAMaN team page and matching book downloads published','summary':'PR724 and deployment42496450895 succeeded. Nine live routes, three named redirects and both public PDF hashes verified:50online readings/49bookchapters,272digital/278print pages. Original portraits and Lavanya unresolved credit preserved. Zero programme credit; foreign owner and receipt state retained.','record':record}
p=Path('kb/history/ledger.jsonl');s=p.read_text()
if event['id'] not in s:p.write_text(s.rstrip()+'\n'+json.dumps(event,ensure_ascii=False)+'\n')
p=Path('kb/history/LEDGER.md');s=p.read_text();heading='### 8 November 2026 · DAMaN team and matching books published'
if heading not in s:s+='\n'+heading+'\n\nPR724 and deployment42496450895 succeeded. The combined team page, three named redirects and both downloaded PDFs match the reviewed edition:50online readings,49chapters,272digital pages and278print pages. Lavanya’s original story credit remains open. [Receipt](../'+record+').\n'
p.write_text(s)
print('Recorded verified delivery; retained foreign ownership and own receipt-integration condition.')
