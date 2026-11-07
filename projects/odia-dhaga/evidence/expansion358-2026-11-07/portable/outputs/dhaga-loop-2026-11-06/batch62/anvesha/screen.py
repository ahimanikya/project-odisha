from pathlib import Path
import json,hashlib,urllib.parse,re
root=Path.cwd();p=Path(__file__).parent;repo=root/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';qf=root/'outputs/dhaga-loop-2026-11-05/batch57/anvesha/search-offset700.json';q=json.loads(qf.read_text())['query']['search'];ids={78739,66100,96290,43366,96289,77999,45859,73596,64270,78172};sel=[dict(offset=700+i,pageid=h['pageid'],title=h['title'],snippet=h['snippet']) for i,h in enumerate(q) if h['pageid'] in ids];titles={h['title'] for h in sel};urls={f'https://or.wiktionary.org/wiki/{t}' for t in titles}
ex=[]
(p/'selection.json').write_text(json.dumps(dict(input_head='ac2c3bc255966aae26e351b1fb552658fbe4eed0',status='PROVISIONAL_BEFORE_PREFETCH_AUDIT',selected=sel,excluded=ex,saved_query_path=str(qf.relative_to(root)),saved_query_sha256=hashlib.sha256(qf.read_bytes()).hexdigest()),ensure_ascii=False,indent=2)+'\n')
terms=['ଭୁଜା ବୋଲି','କାଚ ତଳ','ନିୟତିରେ ବରକତି','ଚୁଟିଆ ମୂଷା','କାଟଇ ଖୋସା','ଅପୂଜା ଦେବତା','ହାତରେ ନ ମାରି','ଭାତରେ ମାରିବା','ବିହନ ଗଲେଣି','ଧୋକଡ଼ ହୋଇ','ଭାସିଲା ପଥର','ଅଣ୍ଟାରେ ତ ପଇସା','କି ସାରୁ ପତର','ସେ କି ଜାଣିବ ମନ']
hits=[];phrase=[];errors=[];nj=0;nf=0

def walk(x,f,loc='$'):
 if isinstance(x,dict):
  pid=x.get('pageid');t=x.get('title');u=x.get('url',x.get('resource',x.get('source_url','')))
  if isinstance(u,str):u=urllib.parse.unquote(u)
  if (isinstance(pid,int) and pid in ids and any(k in x for k in ['revisions','revision','revid'])) or (isinstance(t,str) and t in titles) or (isinstance(u,str) and u in urls):hits.append(dict(path=str(f.relative_to(root)),locator=loc,pageid=pid,title=t,url=u,source_id=x.get('source_id',x.get('id')),revision=x.get('revision',x.get('revid')),keys=list(x)))
  for k,v in x.items():walk(v,f,loc+'.'+k)
 elif isinstance(x,list):
  for i,v in enumerate(x):walk(v,f,loc+f'[{i}]')
for base in [root/'outputs',repo/'kb',repo/'projects/odia-dhaga']:
 for f in base.rglob('*'):
  if not f.is_file() or f.suffix not in ['.json','.txt','.md'] or p.parent in f.parents:continue
  nf+=1
  try:t=f.read_text()
  except Exception as e:errors.append(dict(path=str(f.relative_to(root)),error=str(e)[:100]));continue
  if f.suffix=='.json':
   nj+=1
   try:x=json.loads(t);walk(x,f);t=json.dumps(x,ensure_ascii=False)
   except Exception as e:errors.append(dict(path=str(f.relative_to(root)),error=str(e)[:100]))
  for term in terms:
   at=t.find(term)
   if at>=0:phrase.append(dict(path=str(f.relative_to(root)),term=term,context=t[max(0,at-100):at+420]))
for n,x in [('prior-page-screen.json',dict(files=nj,no_size_cutoff=True,matches=hits,parse_errors=errors)),('prior-phrase-screen.json',dict(files=nf,no_size_cutoff=True,terms=terms,matches=phrase))]:(p/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
print(nj,nf,len(hits),len(phrase),len(errors))
