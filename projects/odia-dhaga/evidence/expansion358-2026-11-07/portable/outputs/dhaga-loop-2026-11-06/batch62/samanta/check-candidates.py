from pathlib import Path
import json,hashlib,re,unicodedata
P=Path(__file__).resolve().parent;ROOT=P.parents[3];A=P.parent/'anvesha';rd=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
c=rd(A/'candidates.json');reg=rd(A/'source-registry.json');reg=reg.get('sources',reg) if isinstance(reg,dict) else reg
pages=rd(A/'originals.json')['query']['pages'];local=rd(ROOT/'outputs/dhaga-expansion-301-2026-11-04/production/stage/collection.json')['entries'];prior=[];priorbindings={}
for n in range(39,62):
 for f in (ROOT/'outputs').glob(f'dhaga-loop-*/batch{n}/anvesha/candidates.json'):
  prior+=rd(f)['entries'];priorbindings[str(f.relative_to(ROOT))]=sha(f)
assert len(local)==301 and len(prior)==54
required=['candidate_key','odia','title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','usage_example','cultural_context','witnesses','rights_note','origin_note']
rows=[];used=set()
for e in c['entries']:
 assert all(e.get(k) for k in required);assert e['id'] is None and e['normalized_odia'] is None and not e['variants']
 for w in e['witnesses']:
  used.add(w['source_id']);s=next(s for s in c['sources'] if s['id']==w['source_id']);raw=Path(s['capture']).read_text();assert w['wording']==e['odia'] and w['wording'] in raw
  suffix=raw.split(w['wording'],1)[1];assert re.match(r'[\s—–-]*(ଢ଼ଗ|ଢଗ)',suffix).group(1)==w['source_label']
 norm=lambda x:re.sub(r'[^\w]','',unicodedata.normalize('NFC',x))
 exact=[z.get('id') or z.get('candidate_key') for z in local+prior if norm(z['odia'])==norm(e['odia'])];assert not exact
 rows.append({'candidate_key':e['candidate_key'],'required_fields':True,'exact_wording_and_immediate_label':True,'normalized_exact_duplicates':exact})
assert used=={s['id'] for s in c['sources']}
for s in c['sources']:
 pg=pages[str(s['pageid'])];v=pg['revisions'][0];assert s['revision']==v['revid'] and s['timestamp']==v['timestamp'] and s['title']==pg['title'];assert sha(Path(s['capture']))==s['sha256'];assert s==next(z for z in reg if z['id']==s['id']);assert s['rights']==rd(A/'originals.json')['query']['rightsinfo']
result={'status':'PASS','comparison_objects':355,'comparison_scope':'301local readings+54prior proposals, notproduced355edition','rows':rows,'used_source_ids':sorted(used),'rights':'Exact API rightsinfo retained as object; future renderer import must losslessly map text+URL and retain original rightsinfo.','prior_candidate_bindings':priorbindings,'semantic_comparisons':[{'candidate':'b62-01','neighbors':['277','B49-03','B61-01'],'finding':'Fruitless tree/no money pairedquestions distinct from absenthead/headache, stones/cotton protection and ghee/conditionalbeauty. Explicit eye-signal uncertainty preventsunsupported bargain/flirtation; attributedprecedingverse separate.'},{'candidate':'b62-02','neighbors':['042','044','274','B41-02'],'finding':'Laterwife understanding/leafquestion differs from prematureimaginaryfamily, spite, two-wifequarrel and stovecomplaint. Criticalinterpretation expressly rejects woman/latermarriageincapacity; no earlierpartner event inferred.'}],'limits':'Exact normalized comparison is not exhaustive semantic proof; allnewdrafts/fullsources and concrete nearestfamilies read. No independent lineage/origin or humanreview.'}
(P/'candidate-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('PASS')
