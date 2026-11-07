from pathlib import Path
import json,hashlib,re
P=Path(__file__).resolve().parent;ROOT=P.parents[3];A=P.parent/'anvesha'
rd=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,o):(P/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
ar=rd(A/'report.json');assert sha(A/'report.json')=='337fd811becac1fbe83d1818632e03c0d6d6b651e5bf794862bbf586e525c579'
for n,h in ar['bindings'].items():assert sha(A/n)==h,n
cs=rd(A/'candidates.json');bud=rd(A/'source-word-budgets.json');ds=rd(A/'dispositions.json');tot=[]
for e,b in zip(cs['entries'],bud):
 counts={k:len(e[k].split()) for k in b['narrative_field_words']};assert counts==b['narrative_field_words'];n=sum(counts.values())+len(e['odia'].split())+b['borrowed_example_words'];assert n==b['total_charged_words']<=200;tot.append(n)
labels=[]
for d in ds:
 raw=(A/(str(d['pageid'])+'.txt')).read_text();assert d['wording'] in raw;suffix=raw.split(d['wording'],1)[1];label=re.match(r'[\s—–-]*(ଢ଼ଗ|ଢଗ)',suffix).group(1);assert label==d['source_label'];labels.append({'pageid':d['pageid'],'source_label':label,'exact_wording':True})
assert len(ds)==8 and sum(d['fresh_family_count'] for d in ds)==7
assert sum(d['disposition']=='draft_proposal' for d in ds)==3
assert rd(P/'preservation.json')['status']=='PASS_EXACT'
checks={'status':'PASS','author_bindings':len(ar['bindings']),'author_report_sha256':sha(A/'report.json'),'candidate_sha256':sha(A/'candidates.json'),'exact_all_position_labels_and_wordings':labels,'independent_budgets':tot,'counts':ar['counts'],'next_source_pass':ar['next_source_pass'],'candidate_schema_rights_and_exact_comparison':rd(P/'candidate-check.json'),'source_pairs':8,'preservation':{k:v['checked'] for k,v in rd(P/'preservation.json')['groups'].items()},'semantic_verdict':'Three actual full drafts distinct in wording/action from reviewed neighbors; critical/provisional qualifications retained.38192relatedfragmentzero,6269priorunresolvedfamilyexcluded routinefresh; no automatic variants imported.'}
save('final-checks.json',checks)
files=[f for f in P.iterdir() if f.is_file() and f.name!='report.json'];af=[A/'report.json']+[A/n for n in ['candidates.json','dispositions.json','source-coverage.json','source-word-budgets.json','genre-assessment.json','retrieval-history.json','originals.json','source-registry.json']]
report={'status':'PASS_INDEPENDENT_RESEARCH_AUDIT','input_head':rd(P/'baseline.json')['input_head'],'checks':checks,'prefetch':{'identity_files':38694,'phrase_files':47328,'parse_limitations':46,'size_exclusions':False,'all_completed_before_author_retrieval':True,'duplicate_fixture_copies':'Included for coverage but not independent witnesses.'},'comparison':'348 research objects:301 local readings plus47 prior proposals, not produced348edition.','preservation':'1761 canonical book files,1790 local301 files,10319 tracked nonbook files,1600 prior bindings exact; includes B57 corrected labels and113 frozen draft. Historical HANDOFF hashes resolve through prior archived delivery.','history':'B55 late B54 flood prior-B03 captured context qualification retained; no frozen history rewritten.','bindings':{str(f.relative_to(ROOT)):sha(f) for f in files+af},'limits':['No source retrieval, query, canonical/Git/art/build/browser/public change or programme credit.','46 JSON parse failures retained; no assertion every JSON parsed.','Single digital dictionary lineage; no print collation or human specialist approval.','Eight retrieved Dhaga positions comprise7fresh3proposals4deferrals and1related-fragment followup; separate satire not counted as another Dhaga.','Final root assembly and independent Drishti review still required.'],'scope_released':True}
save('report.json',report);print(sha(P/'report.json'))
