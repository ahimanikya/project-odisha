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
 es.append(dict(id=None,candidate_key=key,odia=quote,normalized_odia=None,title=title,category='dictionary-labelled saying; source-informed editorial reading',literal_meaning=literal,explanation=explanation,meaning_odia=meaning,english_summary=summary,odia_summary=osummary,usage_example=example,cultural_context=context,tags=tags,variants=[],witnesses=[dict(source_id=s['id'],locator=locator,wording=quote,source_label='ଢ଼ଗ' if pid==64270 else 'ଢଗ')],context_source_ids=[],origin_note='No first author, historical incident or earliest circulation established.',rights_note='Dictionary documentation credited under CC BY-SA4.0. Editorial applications and labelled imagined examples are original, not collected traditional uses.',narrative_credit='Explanation by Project Odisha, informed by the sources below.'))
add(64270,'anvesha-b62-01','ଆମ୍ୱ ଗଛରେ ଆମ୍ୱ ନାହିଁ ଫୋପାଡ଼ କାହିଁକି ମାରୁ? ମୋ ଅଣ୍ଟାରେ ତ ପଇସା ନାହିଁ ଆଖି କାହିଁ ପାଇଁ ଠାରୁ?','Why signal when nothing is there?','There are no mangoes on the mango tree; why throw a stick? I have no money at my waist; why signal with your eyes?',
'The dictionary defines the thrown stick as one used to knock fruit down. Two questions pair an empty tree with a speaker who says they have no money. Our reading hears a challenge to an expectation without its object. The eye signal’s purpose and the relationship remain unstated; neither a bargain nor flirtation is established.',
'ଅଭିଧାନରେ ଫଳ ଝଡ଼ାଇବାକୁ ଫିଙ୍ଗାଯାଉଥିବା କାଠିର ଅର୍ଥ ଅଛି। ଦୁଇ ପ୍ରଶ୍ନରେ ଫଳ ନଥିବା ଗଛ ସହ ପଇସା ନଥିବା କହୁଥିବା ବକ୍ତା ଯୋଡ଼ିହୁଅନ୍ତି। ଆମ ପାଠରେ ଆଶା କରାଯାଉଥିବା ଜିନିଷଟି ନଥିଲେ ସେ ଆଶାକୁ ପ୍ରଶ୍ନ କରାଯାଏ। ଆଖିଠାରର ଉଦ୍ଦେଶ୍ୟ ଓ ସମ୍ପର୍କ ଅକୁହା; ବେପାର ବା ପ୍ରଣୟ ନିଶ୍ଚିତ ନୁହେଁ।',
'Two questions challenge an expectation; the eye signal’s meaning stays open.',
'ଦୁଇ ପ୍ରଶ୍ନ ଆଶାକୁ ଆହ୍ୱାନ କରେ; ଆଖିଠାରର ଅର୍ଥ ଅକୁହା।',
'Original imagined example: ଧାର ମାଗିବା ପୂର୍ବରୁ ଜଣେ ବନ୍ଧୁ ଅନ୍ୟଜଣଙ୍କ ପାଖରେ ସେହି ବହି ଅଛି କି ପଚାରିଲେ। / An imagined reader checks whether a friend owns a book before asking to borrow it. This application is invented.',
'Exact ଫୋପାଡ଼ differs from headword ଫୋପଡ଼. Preceding Brajanath Samarataringa verse is separate, not this saying’s authorship.',
['expectation','questions'],'64270 domestic noun sense1 thrown stick; Dhaga after separate Brajanath literary example')
add(78172,'anvesha-b62-02','ଆଳୁ ପତର, କି ସାରୁ ପତର, ସେ କି ହୋଇବ ପାନ? ପଛରେ ଯାହାକୁ ଭାରିଯା କରିବ, ସେ କି ଜାଣିବ ମନ?','Leaves and understanding','An alu leaf or a saru leaf—will it become betel? Will the woman you later take as wife know your mind?',
'The source places this comparison under marrying a woman. Its questions move from unlike leaves to doubt about a later wife’s understanding. Our critical reading asks why understanding should be ruled out beforehand. The line supplies no particular marriage history, earlier partner or cause; its doubt is not a fact about women or later marriages.',
'ଉତ୍ସରେ ଏହି ତୁଳନା ବିବାହ କରିବା ଅର୍ଥ ତଳେ ଅଛି। ଭିନ୍ନ ପତ୍ରରୁ ପ୍ରଶ୍ନଟି ପଛରେ ବିବାହ କରିବା ସ୍ତ୍ରୀ ମନ ବୁଝିବେ କି ନାହିଁ, ସେ ସନ୍ଦେହକୁ ଯାଏ। ଆମ ସମାଲୋଚନାମୂଳକ ପାଠ ପଚାରେ, ବୁଝାମଣାର ସମ୍ଭାବନାକୁ ଆଗରୁ କାହିଁକି ନାକଚ କରିବା? ନିର୍ଦ୍ଦିଷ୍ଟ ବିବାହ ଇତିହାସ, ପୂର୍ବ ସାଥୀ ବା କାରଣ ଉତ୍ସରେ ନାହିଁ। ଏହି ସନ୍ଦେହ ନାରୀ ବା ପରବର୍ତ୍ତୀ ବିବାହ ବିଷୟରେ ତଥ୍ୟ ନୁହେଁ।',
'A leaf comparison voices doubt; our response questions its assumption about understanding.',
'ପତ୍ର ତୁଳନାରେ ସନ୍ଦେହ; ଆମ ପାଠ ବୁଝାମଣା ବିଷୟରେ ତାହାର ଧାରଣାକୁ ପ୍ରଶ୍ନ କରେ।',
'Original imagined example: ଦୁଇ ଜଣ ନୂଆ ସହକର୍ମୀ ପରସ୍ପରଙ୍କ କାମର ଢଙ୍ଗ ଜାଣିବାକୁ ସମୟ ନେଲେ। / Imagined colleagues learn one another’s working habits. This alternative application is invented, not a traditional explanation.',
'Leaf names retained without botanical identification. Marriage sense1 is distinct from nonmarital cohabitation sense2; no remarriage custom or inherent incapacity inferred.',
['understanding','comparison','critical-reading'],'78172 domestic verb sense1 marrying a woman; sole Dhaga before separate cohabitation sense2')
put('candidates.json',dict(status='RESEARCH_PROPOSALS_NOT_ACCEPTED',entries=es,sources=[s for s in ss if s['pageid'] in [64270,78172]]))
for e in es:
 f=['title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','cultural_context'];print(e['candidate_key'],sum(len(e[k].split()) for k in f)+len(e['odia'].split()))
