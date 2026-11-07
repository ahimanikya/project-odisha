import json,hashlib,urllib.request,re
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent
manifest=json.loads((OUT/'book-release-manifest.json').read_text())
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.links=[]
 def handle_data(self,s):self.parts.append(s)
 def handle_starttag(self,t,a):
  if t=='a':self.links.append(dict(a).get('href',''))
def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Project-Odisha-publication-verification/1.0','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=90) as r:return r.read(),r.status,r.geturl()
expect={
 '/people/gourahari-das/':['In a December 2022 account','Nirmal Rout of Bhadrak','24 October 2026','These accounts do not disclose payment terms.'],
 '/cinema/pratikshya/':['Das recalls an earlier television film','Nirmal Rout of Bhadrak and shown on Doordarshan'],
 '/cinema/book/':['52 readings','49 readings','271 pages','276 pages']}
rows=[]
for route,phrases in expect.items():
 raw,status,url=get('https://projectodisha.org'+route+'?verify=bapa-20261107');p=Text();p.feed(raw.decode());text=' '.join(' '.join(p.parts).split());missing=[s for s in phrases if s not in text];assert not missing,(route,missing)
 if route=='/cinema/book/':
  for asset in manifest['assets']:
   assert asset['planned_release_url'] in p.links,asset['filename']
  assert any('2026-11-07-sequence/' in s for s in p.links)
 if route!='/cinema/book/':assert 'https://www.facebook.com/groups/1008186199594431/posts/1563651764047869/' in p.links
 rows.append({'route':route,'status':status,'expected_text':phrases,'verified':True,'sha256':hashlib.sha256(raw).hexdigest()})
asset_receipt=json.loads((OUT/'remote-assets.json').read_text())
assert asset_receipt['status']=='PASS'
assets=asset_receipt['assets']
for expected, actual in zip(manifest['assets'],assets,strict=True):
 assert expected['planned_release_url']==actual['url'] and expected['sha256']==actual['sha256'] and expected['bytes']==actual['bytes'] and actual['verified']
r={'status':'PASS','verified_at':datetime.now(timezone.utc).isoformat(),'routes':rows,'assets':assets,'assets_verified_at':asset_receipt['verified_at'],'method':'Anonymous public HTTP article retrieval and exact download link targets; prior same-release anonymous download byte verification reused.','limits':'No full-site or mobile manual re-audit.'};(OUT/'live-verification.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
