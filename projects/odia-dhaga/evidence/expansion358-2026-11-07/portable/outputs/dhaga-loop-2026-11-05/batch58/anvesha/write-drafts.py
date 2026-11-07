import pathlib,json,hashlib
p=pathlib.Path(__file__).parent;raw=json.loads((p/'originals.json').read_text());sources=[]
for k,v in raw['query']['pages'].items():
 r=v['revisions'][0];f=p/(k+'.txt');sources.append(dict(id=f"dhaga-wiktionary-{r['revid']}",pageid=int(k),title=v['title'],revision=r['revid'],timestamp=r['timestamp'],url=f"https://or.wiktionary.org/w/index.php?oldid={r['revid']}",capture=str(f.resolve()),sha256=hashlib.sha256(f.read_bytes()).hexdigest(),creator='Odia Wiktionary contributors; dictionary-derived documentation',rights=raw['query']['rightsinfo'],limits='Digital dictionary witness, not independently collated print. No first author, historical incident or earliest circulation established; same dictionary lineage is not independent corroboration.'))
entries=[]
def add(key,pid,w,title,lit,exp,od,es,os,example,context,loc,tags,label='ଢଗ'):
 s=next(s for s in sources if s['pageid']==pid);assert w in (p/f'{pid}.txt').read_text()
 entries.append(dict(id=None,candidate_key='anvesha-b58-'+key,odia=w,normalized_odia=None,title=title,category='dictionary-labelled saying; source-informed editorial reading',literal_meaning=lit,explanation=exp,meaning_odia=od,english_summary=es,odia_summary=os,usage_example=example,cultural_context=context,tags=tags,variants=[],witnesses=[dict(source_id=s['id'],locator=loc,wording=w,source_label=label)],context_source_ids=[],origin_note='No first author, historical incident or earliest circulation established.',rights_note='Dictionary documentation credited under CC BY-SA4.0. Editorial applications and labelled imagined examples are original, not collected traditional uses.',narrative_credit='Explanation by Project Odisha, informed by the sources below.'))
add('01',85104,'କାଳୀମାୟୀ, ଚୂନ ବୋଳିଲେ କି ଗୋରୀ ହୋଇ?','A question about complexion','Dark woman, does applying lime make you fair?',
'The question places a woman’s dark complexion beside an applied white substance. The dictionary quotes it under the domestic word for woman, not its earlier magical or divine senses. Our critical reading asks why fairness should be a measure of worth at all. That response is editorial: the source supplies the taunt, not a stated challenge to colour prejudice.',
'କଳା ରଙ୍ଗର ସ୍ତ୍ରୀଙ୍କ ଦେହରେ ଚୂନ ବୋଳି ଗୋରା ହେବାର ପ୍ରଶ୍ନଟି ଉଠିଛି। ଉତ୍ସରେ ଏହା ନାରୀ ଅର୍ଥ ତଳେ ଅଛି, ପୂର୍ବର କୁହୁକ ବା ଦେବତା ଅର୍ଥରେ ନୁହେଁ। ଆମ ସମାଲୋଚନାମୂଳକ ପାଠ ପଚାରେ, ଗୋରା ରଙ୍ଗ କାହିଁକି ମଣିଷର ମୂଲ୍ୟ ନିର୍ଣ୍ଣୟ କରିବ? ଏହା ଆମ ପ୍ରତିକ୍ରିୟା; ଉତ୍ସରେ ଥିବା ତାଚ୍ଛଲ୍ୟକୁ ପାରମ୍ପରିକ ସମତାର ବାଣୀ ବୋଲି କହୁନାହୁଁ।',
'Our critical response questions the colour hierarchy implied by the taunt.',
'ରଙ୍ଗକୁ ମୂଲ୍ୟର ମାପ କରିବା ଧାରଣାକୁ ଆମ ପାଠ ପ୍ରଶ୍ନ କରେ।',
'Original imagined example: ଏକ ପୁରୁଣା କଥା ଆଲୋଚନାରେ ଜଣେ ରଙ୍ଗକୁ ନେଇ ଥଟ୍ଟା କଲେ। ଆଉ ଜଣେ କହିଲେ, ଦେହର ରଙ୍ଗ ମଣିଷର ମୂଲ୍ୟ କହେନାହିଁ। / In an imagined discussion, a listener challenges a colour-based joke. This response is invented.',
'Attributed gendered colour taunt, not a biological, cosmetic or medical claim. No historical speaker, incident or community-wide attitude established.',
'85104 domestic feminine noun sense1 Woman; bracketed Dhaga',['complexion','critical-reading','dignity'])
add('02',15254,'ଥାଇକରି ଯେ ଖାଇମନ କରେ ତା ମୁହଁଟା ପୋଡ଼ୁ','A curse directed at craving','Provisional reading: may the mouth of one who craves while having be burnt.',
'The headword defines wanting a particular food. The line curses someone described as having yet craving; it does not specify what is possessed or establish that their needs are met. Our critical reading separates a speaker’s accusation from knowledge of another’s circumstances. Neither the curse nor the accusation becomes advice about how a person should eat.',
'ଖାଇମନ କରିବାର ଅର୍ଥ କୌଣସି ଖାଦ୍ୟ ପାଇଁ ଇଚ୍ଛା କରିବା। ଥାଇ ମଧ୍ୟ ଚାହୁଁଥିବା ବ୍ୟକ୍ତିଙ୍କୁ ଧାଡ଼ିଟି ଅଭିଶାପ ଦିଏ। କଣ ଅଛି ବା ଆବଶ୍ୟକତା ପୂରଣ ହୋଇଛି କି, ଉତ୍ସ କହେନାହିଁ; ଏହି ପାଠ ସମ୍ଭାବ୍ୟ। ଆମ ପାଠରେ କଥକଙ୍କ ଅଭିଯୋଗ ଓ ଅନ୍ୟର ପରିସ୍ଥିତି ଜାଣିବା ଅଲଗା। ଅଭିଶାପଟି ଖାଦ୍ୟ ବା ଆଚରଣର ପରାମର୍ଶ ନୁହେଁ।',
'The accusation leaves the person’s possessions and actual needs unspecified.',
'କଣ ଅଛି ଓ କଣ ଦରକାର, ଅଭିଯୋଗଟି ତାହା ସ୍ପଷ୍ଟ କରେନାହିଁ।',
'Original imagined example: ଆଉ ଗୋଟିଏ ଖାଦ୍ୟ ମାଗିବାରୁ ଜଣେ ଅତିଥିଙ୍କୁ ଦୋଷ ଦିଆଗଲା। ଘରଲୋକ ପ୍ରଥମେ ତାଙ୍କ କଥା ଶୁଣିବାକୁ କହିଲେ। / An imagined host asks others to hear a guest’s reason before judging a request. This alternative is invented.',
'The later pregnancy sense does not identify this subject. The following Nilamani Chintatarangini passage is a separate literary illustration, not this saying’s author.',
'15254 domestic verb sense1 craving a delicacy; first line before separate Nilamani literary passage',['craving','accusation','uncertainty'],label='ଢ଼ଗ')
add('03',36984,'ଆସିବୁ ଯିବୁରେ କଳାମାଣିକ! ତୋହରି ପାଇଁ କି ନିତି ଗଞ୍ଜଣା, ପିଠିରେ ତିନ୍ତୁଳି ଛାଟ','Visits and a painful complaint','Provisional reading: come and go, dark jewel! Must there be daily reproach for you, a tamarind switch on the back?',
'The address joins coming and going to a question about repeated reproach and a switch on the back. The dictionary defines the switch but does not identify who speaks, visits, receives a blow or inflicts one. Our reading hears a complaint about a connection’s painful cost, while leaving those roles open. It neither reconstructs a romance nor justifies punishment.',
'আସିବାଯିବାର ସମ୍ବୋଧନ ସହ ନିତି ଗଞ୍ଜଣା ଓ ପିଠିରେ ଛାଟର ପ୍ରଶ୍ନ ଅଛି। ଏହା ସମ୍ଭାବ୍ୟ ପାଠ; କିଏ କହୁଛନ୍ତି, ଯାଆନ୍ତି, ମାଡ଼ ଖାଆନ୍ତି ବା ଦିଅନ୍ତି, ଉତ୍ସ ସ୍ପଷ୍ଟ କରେନାହିଁ। ଆମ ପାଠରେ ଏକ ସମ୍ପର୍କର କଷ୍ଟକୁ ନେଇ ଅଭିଯୋଗ ଶୁଣାଯାଏ। ଏଥିରୁ ପ୍ରେମକାହାଣୀ ତିଆରି କରୁନାହୁଁ ବା ଦଣ୍ଡକୁ ଯଥାର୍ଥ କହୁନାହୁଁ।',
'Our provisional reading hears complaint without assigning the unnamed roles.',
'ସମ୍ଭାବ୍ୟ ପାଠରେ ଅଭିଯୋଗ ଅଛି; ଅକୁହା ଭୂମିକା ଭରିଦିଆଯାଏନାହିଁ।',
'Original imagined example: ଆଲୋଚନାରେ ଜଣେ ଧାଡ଼ିଟିକୁ ପ୍ରେମକାହାଣୀ କହିଲେ। ଅନ୍ୟଜଣେ ପଚାରିଲେ, କଥକ ଓ ସମ୍ପର୍କକୁ ଉତ୍ସ କେଉଁଠି ଚିହ୍ନାଇଛି? / An imagined reader questions an unsupported romantic reconstruction. The exchange is invented.',
'No gender, lover, deity, actual assault or disciplinary custom established. The dictionary’s adjacent physical claims about switches are not adopted as practical guidance.',
'36984 domestic noun sense1 rod of tamarind twig; sole Dhaga',['complaint','agency','visiting'])
# Preserve exact Odia script in editorial prose.
entries[-1]['meaning_odia']=entries[-1]['meaning_odia'].replace('আ','ଆ')
used={w['source_id'] for e in entries for w in e['witnesses']}
(p/'candidates.json').write_text(json.dumps(dict(status='RESEARCH_PROPOSALS_NOT_ACCEPTED',entries=entries,sources=[s for s in sources if s['id'] in used]),ensure_ascii=False,indent=2)+'\n')
(p/'source-registry.json').write_text(json.dumps(dict(sources=sources),ensure_ascii=False,indent=2)+'\n')
for e in entries:print(e['candidate_key'],sum(len(e[k].split()) for k in ['title','literal_meaning','explanation','meaning_odia','english_summary','odia_summary','cultural_context'])+len(e['odia'].split()))
