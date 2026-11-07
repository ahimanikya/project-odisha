from pathlib import Path
import json,hashlib,urllib.parse,re
root=Path.cwd();p=Path(__file__).parent;repo=root/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';qf=p.parent.parent/'batch57/anvesha/search-offset700.json';q=json.loads(qf.read_text())['query']['search'];ids={85104,15254,28015,35405,89447,20545,6269,38192,36984};sel=[dict(offset=700+i,pageid=h['pageid'],title=h['title'],snippet=h['snippet']) for i,h in enumerate(q) if h['pageid'] in ids];titles={h['title'] for h in sel};urls={f'https://or.wiktionary.org/wiki/{t}' for t in titles}
ex=[]
(p/'selection.json').write_text(json.dumps(dict(input_head='639ba41896e1f02877b87af742ead9dc70bca62a',status='PROVISIONAL_BEFORE_PREFETCH_AUDIT',selected=sel,excluded=ex,saved_query_path=str(qf.relative_to(root)),saved_query_sha256=hashlib.sha256(qf.read_bytes()).hexdigest()),ensure_ascii=False,indent=2)+'\n')
terms=['କାଳୀମାୟୀ','ଥାଇକରି ଯେ','ବଡ଼େଇ ଖାଈର','ଚାଉଳ ସେରକୁ','ଅଲେଇ ମେଣ୍ଡ','ଗୋଛିରେ ଲୋଚା','କରାଟରେ ହେଙ୍ଗୁ','ମାଗି ଆଣିଲା ତିଅଣ','ଆସିବୁ ଯିବୁରେ କଳାମାଣିକ']
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
