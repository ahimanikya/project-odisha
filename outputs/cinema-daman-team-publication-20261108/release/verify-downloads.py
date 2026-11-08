from pathlib import Path
import urllib.request,json,hashlib,datetime
r=Path(__file__).parent
m=json.loads(Path('outputs/cinema-daman-team-publication-20261108/book-release-manifest.json').read_text())
results=[]
for a in m['assets'][:2]:
 url=a['planned_release_url']; req=urllib.request.Request(url,headers={'User-Agent':'ProjectOdisha-publication-check/1.0'})
 with urllib.request.urlopen(req,timeout=120) as response:
  h=hashlib.sha256();length=0
  with (r/f"downloaded-{a['edition']}.pdf").open('wb') as out:
   while data:=response.read(1024*1024):out.write(data);h.update(data);length+=len(data)
 ok=h.hexdigest()==a['sha256'] and length==a['bytes'];assert ok,(a['edition'],length,h.hexdigest())
 results.append({'edition':a['edition'],'url':url,'bytes':length,'sha256':h.hexdigest(),'matches_reviewed':ok})
record={'status':'PASS','checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'assets':results}
(r/'public-download-verification.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record,indent=2))
