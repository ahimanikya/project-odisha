from pathlib import Path
import json,hashlib,unicodedata
if not __debug__:raise RuntimeError('Optimized Python refused')
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';A=P.parent/'anvesha';C=R/'projects/odia-dhaga'
def rd(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def norm(t):return ''.join(c for c in unicodedata.normalize('NFC',t) if c.isalnum())
api=rd(A/'originals.json')['query'];candidate=rd(A/'candidates.json');registry=rd(A/'source-registry.json');old=rd(ROOT/'outputs/dhaga-expansion-301-2026-11-04/production/stage/collection.json')['entries'];assert len(old)==301
old+=rd(ROOT/'outputs/dhaga-loop-2026-11-04/batch39/anvesha/candidates.json')['entries'];assert len(old)==303
old+=rd(ROOT/'outputs/dhaga-loop-2026-11-04/batch40/anvesha/candidates.json')['entries'];assert len(old)==307
old+=rd(ROOT/'outputs/dhaga-loop-2026-11-04/batch41/anvesha/candidates.json')['entries'];assert len(old)==310
assert len(registry)==len(api['pages'])==7
for s in registry:
 page=api['pages'][str(s['pageid'])];v=page['revisions'][0];cap=Path(s['capture']);assert cap.read_text()==v['slots']['main']['*'];assert sha(cap)==s['sha256'];assert s['revision']==v['revid'] and s['id']=='dhaga-wiktionary-'+str(v['revid']);assert s['timestamp']==v['timestamp'] and s['title']==page['title'];assert s['rights']==api['rightsinfo']
assert len(candidate['entries'])==len(candidate['sources'])==3
used=set();checks=[]
for e in candidate['entries']:
 for key in ['odia','title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','usage_example','cultural_context','origin_note','rights_note','narrative_credit']:assert isinstance(e[key],str) and e[key].strip()
 assert e['id'] is None and e['normalized_odia'] is None and not e['variants'] and not e['context_source_ids'];assert e['usage_example'].startswith('Original imagined example:')
 for w in e['witnesses']:
  used.add(w['source_id']);s=next(s for s in candidate['sources'] if s['id']==w['source_id']);assert s in registry;assert w['wording']==e['odia'] and w['wording'] in Path(s['capture']).read_text()
 hits=[]
 for prior in old:
  texts=[prior['odia']]+[v.get('odia',v.get('wording','')) for v in prior.get('variants',[])]+[w.get('wording','') for w in prior.get('witnesses',[])]
  if any(norm(e['odia'])==norm(t) for t in texts if t):hits.append(prior.get('candidate_key') or prior['id'])
 assert not hits
 checks.append({'candidate':e['candidate_key'],'full_required_schema':'PASS','exact_source_quote':'PASS','normalized_primary_variant_witness_matches_against310':hits})
assert used=={s['id'] for s in candidate['sources']}=={'dhaga-wiktionary-217316','dhaga-wiktionary-114152','dhaga-wiktionary-143667'}
result={'status':'PASS_CAPTURE_SCHEMA_QUOTE_CHECK','input_head':'006fe88973d14a890b989eb6238d8547a5e6ad0a','capture_pairs':7,'rightsinfo_exact':True,'source_ids_are_revision_ids_not_pageids':True,'candidate_checks':checks,'used_sources':sorted(used),'sources_not_used':4,'comparison_objects':310,'bindings':{f:sha(A/f) for f in ['candidates.json','source-registry.json','originals.json','selection.json']},'limits':['Exact normalized negative is not by itself semantic proof; separate actual full nearest-family reading recorded in semantic-comparisons.json.','No newsource retrieval,canonical changes,acceptance or bookbuild.']}
(P/'draft-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(sha(P/'draft-validation.json'))
