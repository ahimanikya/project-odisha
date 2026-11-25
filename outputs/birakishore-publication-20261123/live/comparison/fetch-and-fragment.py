from pathlib import Path
from urllib.request import Request,urlopen
import json,hashlib,difflib,re
R=Path(__file__).resolve().parents[4]
D=Path(__file__).resolve().parent
raw=R/'outputs/birakishore-publication-20261123/live/delivery-20261124T074845Z'
sha=lambda b:hashlib.sha256(b).hexdigest()
a=(raw/'html/literature.html.local-fragment.html').read_bytes();b=(raw/'html/literature.html.live-fragment.html').read_bytes()
old='/images/responsive/f7fd7db2e2c9d60a-1440.webp';new='/images/responsive/8b030c3b48acd32f-1440.webp'
assert a.count(old.encode())==1 and b.count(new.encode())==1
assert a.replace(old.encode(),new.encode())==b
urls=[new,'/assets/language-literature/odia-manuscript.webp']
items=[]
for rel in urls:
 target=D/Path(rel).name
 if target.exists():raise RuntimeError('Do not overwrite existing captures: '+str(target))
 with urlopen(Request('https://projectodisha.org'+rel,headers={'User-Agent':'ProjectOdisha-ImageComparison/1.0'}),timeout=45) as response:
  data=response.read();target.write_bytes(data);items.append({'url':'https://projectodisha.org'+rel,'http_status':response.status,'bytes':len(data),'sha256':sha(data),'saved_path':str(target),'content_type':response.headers.get('Content-Type')})
report={'status':'MEASURED_SINGLE_URL_DIFFERENCE','raw_report_sha256':sha((raw/'http.json').read_bytes()),'local_fragment_sha256':sha(a),'live_fragment_sha256':sha(b),'sole_changed_attribute':'manuscript hero img srcset 1440w URL','local_url':old,'live_url':new,'exact_after_only_observed_URL_substitution_in_memory':True,'captures':items,'limits':['Raw captures unchanged; comparison substitution performed in memory only.','No cause inferred from URL difference.']}
(D/'fragment-and-fetch.json').write_text(json.dumps(report,indent=2)+'\n')
(D/'literature-fragment.diff').write_text('\n'.join(difflib.unified_diff(re.split('(?<=>)(?=<)',a.decode()),re.split('(?<=>)(?=<)',b.decode()),fromfile='local captured main',tofile='live captured main',n=1))+'\n')
print(json.dumps(report))
