from pathlib import Path
import json,hashlib,re
P=Path(__file__).resolve().parent;ROOT=P.parents[3];A=P.parent/'anvesha';b=json.loads((P/'baseline.json').read_text());d=json.loads((A/'candidates.json').read_text());api=json.loads((A/'originals.json').read_text())['query'];reg=json.loads((A/'source-registry.json').read_text())['sources'];es=json.loads((Path(b['local301_stage'])/'collection.json').read_text())['entries'];prior=[]
for n in range(39,58):
 if n==55:continue
 choices=[ROOT/'outputs'/day/('batch'+str(n))/'anvesha/candidates.json' for day in ['dhaga-loop-2026-11-04','dhaga-loop-2026-11-05']];f=next(x for x in choices if x.exists());prior.extend(json.loads(f.read_text())['entries'])
assert len(es)==301 and len(prior)==47
norm=lambda s:re.sub(r'[^\w]','',s);used=set();quotes=[]
for e in d['entries']:
 assert not [x for x in es+prior if norm(x['odia'])==norm(e['odia'])]
 for k in ['title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','usage_example','cultural_context','rights_note','origin_note']:assert e[k]
 for w in e['witnesses']:
  s=next(s for s in d['sources'] if s['id']==w['source_id']);assert w['wording']==e['odia'] and w['wording'] in Path(s['capture']).read_text();raw=Path(s['capture']).read_text();suffix=raw[raw.index(w['wording'])+len(w['wording']):];assert re.match(r'[\s—–-]*(ଢ଼ଗ|ଢଗ)',suffix).group(1)==w['source_label'];used.add(s['id']);quotes.append(e['candidate_key'])
 used.update(e['context_source_ids'])
assert used=={s['id'] for s in d['sources']}
for s in d['sources']:
 assert s in reg and s['rights']==api['rightsinfo'];page=api['pages'][str(s['pageid'])];assert page['title']==s['title'] and page['revisions'][0]['revid']==s['revision'];assert hashlib.sha256(Path(s['capture']).read_bytes()).hexdigest()==s['sha256']
r={'status':'PASS_CURRENT_CANDIDATES','candidate_sha256':hashlib.sha256((A/'candidates.json').read_bytes()).hexdigest(),'comparison_objects':348,'local_book_entries':301,'prior_proposals':47,'exact_normalized_matches':0,'exact_quotes':quotes,'used_source_union':sorted(used),'source_registry_exact_subset':True,'rights_exact_API':True,'limits':'Final author report/budgets pending; no acceptance/publication.'}
(P/'candidate-check.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(r['status'])
