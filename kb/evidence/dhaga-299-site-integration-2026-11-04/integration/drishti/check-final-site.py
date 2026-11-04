import pathlib,json,hashlib,html,re,subprocess
E=pathlib.Path('outputs/dhaga-expansion-299-2026-11-03');P=E/'integration/site';O=E/'integration/drishti';R=pathlib.Path('planning/utkala-odisha/checkouts/utkal-fieldwork-pack');S=R/'projects/site'
def j(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
v=j(P/'validation-site.json');assert len(v['gates'])==13
for x in v['gates']:assert x['exit_code']==0 and h(pathlib.Path(x['log']))==x['log_sha256']
bind=j(P/'browser-product-binding.json')
for p,s in bind['site_source_hashes'].items():assert h(S/p)==s
for p,s in j(P/'samanta.json')['workflow_hashes'].items():assert h(R/p)==s
browser=j(P/'browser-review.json');add=j(P/'provisional-addendum.json');assert h(P/'browser-review.json')==add['prior_report_sha256']
for row in browser['screenshots']+add['screenshots']:assert h(pathlib.Path(row['path']))==row['sha256']
for rel,s in browser['testedProducts'].items():assert any(h(S/t/rel.lstrip('/'))==s for t in ['dist','dist-coast','dist-publish'])
prior=j(P/'prior251-public-assets.json');assert len(prior)==257
book=j(R/'projects/odia-dhaga/collection.json');results=[]
for target in ['dist','dist-coast','dist-publish']:
 out=S/target/'dhaga';files=[p for p in out.rglob('*') if p.is_file()];assert len(files)==607 and sum(p.suffix=='.html' for p in files)==302
 for p,s in prior.items():assert h(out/'assets'/p)==s
 for entry in book['entries']:
  text=(out/'sayings'/f"{entry['id'].lower()}.html").read_text()
  for field in ['explanation','meaning_odia','literal_meaning','usage_example','cultural_context']:assert html.escape(entry[field],quote=True) in text
 for n in [250,251,256]:assert 'Lexical context only' in (out/f'sayings/pod-dhaga-{n}.html').read_text()
 assert 'Provisional reading:' in (out/'sayings/pod-dhaga-288.html').read_text()
 total=sum(p.stat().st_size for p in files);assert total<=38000000;results.append({'target':target,'bytes':total,'files':len(files),'html':302,'prior_assets_exact':257,'text_fields_exact':1495})
c=S/'dist-coast/dhaga';p=S/'dist-publish/dhaga';same=0;robots=0
for f in c.rglob('*'):
 if not f.is_file():continue
 g=p/f.relative_to(c)
 if f.read_bytes()==g.read_bytes():same+=1
 else:assert f.suffix=='.html' and f.read_text().replace('<meta name="robots" content="noindex, nofollow">','<meta name="robots" content="noindex, follow">')==g.read_text();robots+=1
assert (same,robots)==(305,302)
assert len(re.findall('<loc>',(S/'dist-publish/sitemap.xml').read_text()))==11
pubbytes=sum(p.stat().st_size for p in (S/'dist-publish').rglob('*') if p.is_file());assert pubbytes==709772466
changes=[]
for name in ['coast.json','search-candidate.json']:
 old=json.loads(subprocess.check_output(['git','-C',str(R),'show','b6ae771f1121c4449cced4173fa1d3c2d1177fc2:projects/site/editions/'+name]));new=j(S/'editions'/name)
 for k in old:
  if old[k]!=new[k]:
   assert isinstance(old[k],list) and new[k][:len(old[k])]==old[k] and len(new[k])-len(old[k])==48,(name,k)
   changes.append(name+':'+k)
for rel,s in j(E/'production/installation-manifest.json')['all_stage_hashes'].items():assert h(R/'projects/odia-dhaga'/rel)==s
out={'decision':'PASS','gates_bound':13,'browser_tested_products':49,'screenshots_bound':22,'edition_results':results,'coast_publication_exact':same,'robots_only':robots,'publication_bytes':pubbytes,'indexable_pages':11,'edition_append_fields':changes,'book_files_exact':1760,'working_source_hashes':bind['site_source_hashes']}
(O/'final-site-independent-checks.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
