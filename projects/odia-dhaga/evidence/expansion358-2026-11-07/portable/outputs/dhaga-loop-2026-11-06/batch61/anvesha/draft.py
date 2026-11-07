from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parent
put=lambda n,x:(p/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
d=json.loads((p/'originals.json').read_text());ss=[]
for k,v in d['query']['pages'].items():
 rv=v['revisions'][0];f=p/(k+'.txt');ss.append(dict(id=f"dhaga-wiktionary-{rv['revid']}",pageid=int(k),title=v['title'],revision=rv['revid'],timestamp=rv['timestamp'],url=f"https://or.wiktionary.org/w/index.php?oldid={rv['revid']}",capture=str(f),sha256=hashlib.sha256(f.read_bytes()).hexdigest(),creator='Odia Wiktionary contributors; dictionary-derived documentation',rights=d['query']['rightsinfo'],limits='Digital dictionary witness, not independently collated print. No first author, historical incident or earliest circulation established; same dictionary lineage is not independent corroboration.'))
put('source-registry.json',{'sources':ss});es=[]
def add(pid,key,quote,title,literal,explanation,meaning,summary,osummary,example,context,tags,locator):
 s=next(x for x in ss if x['pageid']==pid)
 es.append(dict(id=None,candidate_key=key,odia=quote,normalized_odia=None,title=title,category='dictionary-labelled saying; source-informed editorial reading',literal_meaning=literal,explanation=explanation,meaning_odia=meaning,english_summary=summary,odia_summary=osummary,usage_example=example,cultural_context=context,tags=tags,variants=[],witnesses=[dict(source_id=s['id'],locator=locator,wording=quote,source_label='ଢ଼ଗ')],context_source_ids=[],origin_note='No first author, historical incident or earliest circulation established.',rights_note='Dictionary documentation credited under CC BY-SA4.0. Editorial applications and labelled imagined examples are original, not collected traditional uses.',narrative_credit='Explanation by Project Odisha, informed by the sources below.'))
add(110630,'anvesha-b61-01','ଯେତେ କାଳ ଥିଲା ଘଡ଼ିରେ ଘିଅ ସୁନ୍ଦର ଦିଶୁଥିଲା ସଜନୀ ଦିହ','While the jar held ghee','As long as there was ghee in the jar, Sajani’s body looked beautiful.',
'The line places admired appearance beside a supply of ghee. It does not explain who admired her or why. Our editorial reading questions regard that lasts only while something desirable is available. That is an interpretation of the conditional praise, not proof that food changed her body or that a particular partner was selfish.',
'ଘଡ଼ିରେ ଘିଅ ଥିବା ସମୟ ସହ ସଜନୀଙ୍କ ଦେହ ସୁନ୍ଦର ଦିଶିବାକୁ ଧାଡ଼ିଟି ଯୋଡ଼େ। କାହାକୁ ବା କାହିଁକି ସୁନ୍ଦର ଦିଶୁଥିଲା, ତାହା ସ୍ପଷ୍ଟ ନୁହେଁ। ଆମ ପାଠରେ ମନପସନ୍ଦ ଜିନିଷ ମିଳୁଥିବା ଯାଏଁ ରହୁଥିବା ଆଦରକୁ ପ୍ରଶ୍ନ କରାଯାଏ। ଏହା ସମ୍ପାଦକୀୟ ବ୍ୟାଖ୍ୟା; ଖାଦ୍ୟରେ ଦେହ ବଦଳିବା ବା କୌଣସି ସାଥୀଙ୍କ ସ୍ୱାର୍ଥର ପ୍ରମାଣ ନୁହେଁ।',
'Conditional praise invites an editorial question about conditional regard.',
'ସର୍ତ୍ତ ସହ ଯୋଡ଼ା ପ୍ରଶଂସାରୁ ଆମ ପାଠରେ ଆଦରର ସର୍ତ୍ତକୁ ପ୍ରଶ୍ନ କରାଯାଏ।',
'Original imagined example: ଜଣେ ବନ୍ଧୁ ଉପହାର ଆଣିବା ବନ୍ଦ କଲେ। ଦଳଟି ତାଙ୍କୁ ପୂର୍ବପରି ଡାକିଲା। / An imagined group keeps welcoming a friend after the gifts stop. This affirmative response is invented, not the saying’s supplied ending.',
'The headword allows female companion, beloved or wife; this quotation fixes no particular relationship. No nutritional effect, actual incident or gender trait established.',
['regard','appearance','critical-reading'],'110630 domestic feminine noun; explanatory note after senses1–5, sole Dhaga')
add(37990,'anvesha-b61-02','ବାର ଯାଇ ତେର ପଶିଲା ଦିହରେ ଶକତି ପଶିଲା','Twelve passes, thirteen enters','Twelve passed and thirteen entered; strength entered the body.',
'The dictionary places this rhyme under the age of thirteen. Repeating “entered” makes the new age and bodily strength arrive together in the saying. Our reading hears an emphatic image of growing up, not a timetable for everyone’s development. The separate year-number prediction below belongs to another labelled genre.',
'ଅଭିଧାନରେ ଏହି ଧାଡ଼ି ତେର ବର୍ଷ ବୟସ ଅର୍ଥ ତଳେ ଅଛି। ପଶିଲା ପଦର ପୁନରାବୃତ୍ତିରେ ନୂଆ ବୟସ ଓ ଦେହର ଶକ୍ତି ଏକାଠି ଆସନ୍ତି। ଆମ ପାଠରେ ଏହା ବଢ଼ିବାର ଜୋରଦାର ଚିତ୍ର; ସମସ୍ତଙ୍କ ବିକାଶର ନିର୍ଦ୍ଦିଷ୍ଟ ସମୟସୂଚୀ ନୁହେଁ। ତଳେ ଥିବା ସନ ସମ୍ପର୍କୀୟ ଭବିଷ୍ୟବାଣୀ ଅଲଗା ନାମିତ ଶ୍ରେଣୀର।',
'A rhythmic age-and-strength claim, not a universal developmental rule.',
'ବୟସ ଓ ଶକ୍ତିକୁ ଯୋଡ଼ୁଥିବା ଛନ୍ଦମୟ କଥା, ସାର୍ବଜନୀନ ବିକାଶ ନିୟମ ନୁହେଁ।',
'Original imagined example: ଜନ୍ମଦିନରେ ଜଣେ କିଶୋର ନୂଆ କାମ ଶିଖିବାକୁ ଚାହିଁଲେ। ଶିକ୍ଷକ ତାଙ୍କ ସୁବିଧା ଅନୁସାରେ ଅଭ୍ୟାସ ବାଛିଲେ। / An imagined learner begins a new activity at a comfortable pace; the scene is invented, not a traditional birthday practice.',
'No gender, initiation custom or medical threshold supplied. Age sense2 is distinct from year-number sense3 and its Malika vachana.',
['growing-up','age','wordplay'],'37990 domestic noun sense2 age thirteen; sole Dhaga before separate sense3 Malika vachana')
put('candidates.json',dict(status='RESEARCH_PROPOSALS_NOT_ACCEPTED',entries=es,sources=[s for s in ss if s['pageid'] in [110630,37990]]))
for e in es:
 f=['title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','cultural_context']; print(e['candidate_key'],sum(len(e[k].split()) for k in f)+len(e['odia'].split()))
