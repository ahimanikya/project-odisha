from pathlib import Path
import json,hashlib,subprocess
if not __debug__:raise RuntimeError('Optimized Python refused')
P=Path(__file__).resolve().parent;ROOT=P.parents[3];A=P.parent/'anvesha'
def rd(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,v):(P/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
r=rd(A/'report.json');c=rd(A/'candidates.json');d=rd(A/'dispositions.json');cov=rd(A/'source-coverage.json')
assert sha(A/'report.json')=='8a6ff2ae2c8fbcfe57c5ff82d7b479271d024a59a7beea74a120ec054194dd91'
assert sha(A/'candidates.json')=='aeb653da4e4570877f5f4994689e0f6596effc5db34af003941fc611cfd7d7d6'
for n,h in r['bindings'].items():assert sha(A/n)==h,(n,h)
for n,h in r['prose_correction']['history'].items():assert sha(A/n)==h
fields=['title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','cultural_context'];budgets=[]
for e,b in zip(c['entries'],r['source_word_budgets']):
 counts={k:len(e[k].split()) for k in fields};assert counts==b['narrative_field_words'];total=sum(counts.values())+len(e['odia'].split());assert total==b['total_charged_words']<=200;budgets.append(total)
assert budgets==[153,159,162];assert len(d)==7 and sum(x['fresh_position'] for x in d)==6
assert sum(x['disposition']=='draft_proposal' for x in d)==3 and sum(x['disposition']=='deferred' for x in d)==3
assert cov['positions']==d and cov['counts']==r['counts'];assert [x['saved_result_offset'] for x in cov['source_order_account']]==list(range(512,525))
assert r['next_source_pass']['pageid']==43183 and r['next_source_pass']['next_result_offset']==525
sem={'status':'PASS_BOUNDED_SEMANTIC_REVIEW','comparison_objects':310,'not_a_produced_edition':True,'comparisons':[
{'candidate':'anvesha-b42-01','actual_neighbor':'POD-DHAGA-278','finding':'Both titles are A fitting pair, but 278 is blackgram/rice soaking and source appropriateness. Current21815 praises a groom/bride fit through Prajapati invocation. Distinct saying; shared fitting theme/title is not identity. Precise referent and sincere/ironic tone remain open.'},
{'candidate':'anvesha-b42-02','actual_neighbor':'POD-DHAGA-227','finding':'Dew cannot fill a pot concerns inadequate small quantity; cane berries contrast hard seed/bony bulk with edible substance. Shared adequacy theme does not establish duplicate wording or family. No botanical species/nutrition result claimed.'},
{'candidate':'anvesha-b42-03','actual_neighbors':['POD-DHAGA-266','POD-DHAGA-287'],'finding':'266 is a husband-concern taunt;287 is a warning against provocation. Current source places a degrading label beside a request not to leave. Distinct speech situation, with no relationship or motive inferred. Final English correction removes assumed fear and matches Odia.'}],
'prior_family_timing':'95371 was actually retrieved before warning; prior B03 lexical quote is related unresolved context, zero extra. Initial beforefetch inference corrected explicitly in selection-audit and author history.',
'objects_read_binding':sha(P/'semantic-neighbors.json'),'candidate_binding':sha(A/'candidates.json')}
wr('semantic-comparisons.json',sem)
subprocess.run(['python3',str(P/'check-preservation.py')],check=True)
wr('final-binding-check.json',{'status':'PASS','author_bindings_checked':len(r['bindings']),'historical_correction_bindings_checked':4,'budgets':budgets,'counts':r['counts'],'source_order_512_through524_accounted':True,'next':r['next_source_pass'],'author_report_sha256':sha(A/'report.json')})
files=['baseline.json','prior-screen.json','prior-phrase-screen.json','revision-screen.json','selection-audit.json','semantic-neighbors.json','semantic-comparisons.json','draft-validation.json','preservation-check.json','final-binding-check.json','check-drafts.py','check-preservation.py','finalize-audit.py']
wr('report.json',{'status':'PASS_INDEPENDENT_RESEARCH_AUDIT_PENDING_SEPARATE_REVIEW','input_head':r['input_head'],'author_report':{'path':str(A/'report.json'),'sha256':sha(A/'report.json')},'candidate_sha256':sha(A/'candidates.json'),'counts':r['counts'],'comparison_scope':'Public299 and reviewed local301 plus nine B39–41 proposals =310 comparison objects, not a produced310 edition.','actual_checks':['34437 JSON identity/history/API scans without size cutoffs;46 parse qualifications retained','40698 phrase files scanned without size cutoffs;zero read errors','Seven actual complete sources and all three bilingual proposals/dispositions read','Seven API/TXT revision/title/timestamp/rights pairs exact;three used sources exact registry subset','310 primary/variant/witness exact-normalized comparisons negative;actual full nearby objects compared separately','All21 author bindings and4 preserved correction files exact','Budgets independently recomputed153/159/162','Saved512–524 dispositions complete;next525/page43183;backlogs retained','1761 canonical/1790 local301/3963 shared/376 prior bindings rehashed unchanged'], 'source_ids':r['used_source_ids'],'next_source_pass':r['next_source_pass'],'history_qualification':sem['prior_family_timing'],'preservation':rd(P/'preservation-check.json'),'bindings':{n:sha(P/n) for n in files},'author_bindings':r['bindings'],'limits':['No network retrieval, print collation, fieldwork or source independence claim.','Exact match negatives alone do not prove semantic novelty; bounded nearest-family readings documented.','No canonical/Git/build/art/publication/acceptance or programme-credit changes.','Rights remain exact structured research metadata; future renderer integration must retain rightsinfo and lossless text/URL representation.','Current112 completed handoff and original archive both preserved; no stale pre-completion mismatch hidden.','Three proposals remain research proposals until separate review and future authorized integration.'],'scope_released':True})
print('REPORT',sha(P/'report.json'))
