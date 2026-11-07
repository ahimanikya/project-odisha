from pathlib import Path
import json
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack'
needles=['ସେହି ଗାଣ୍ଡିବ','ଗାଣ୍ଡିବ','ହଳଦି ମଖା','ସୁବର୍ଣ୍ଣରେଖା','ଘଡ଼ିରେ ଘିଅ','ସଜନୀ ଦିହ','ବାର ଯାଇ ତେର','ତେର ପଶିଲା','ଦିଅକୁ ଦିଆ','ଅଦିଆକୁ'];patterns={n:[n,json.dumps(n)[1:-1]] for n in needles};hits=[];read=0;errors=[]
for base in [ROOT/'outputs',R/'projects/odia-dhaga',R/'kb']:
 for f in base.rglob('*'):
  if f.suffix not in ['.json','.txt','.md'] or P.parent in f.parents:continue
  try:s=f.read_text()
  except Exception as e:errors.append({'path':str(f),'error':str(e)});continue
  read+=1;matched=[n for n,variants in patterns.items() if any(v in s for v in variants)]
  if matched:hits.append({'path':str(f.relative_to(ROOT)),'phrases':matched})
(P/'prior-phrase-screen.json').write_text(json.dumps({'files_read':read,'size_exclusions':False,'phrases':needles,'hits':hits,'errors':errors,'qualification':'Literal and JSON-escaped fragments across full file bytes, including bundled API payloads/history; discovery snippets and repeated snapshots require actual-role classification, not processed-source inference.'},ensure_ascii=False,indent=2)+'\n');print(read,len(hits),len(errors))
