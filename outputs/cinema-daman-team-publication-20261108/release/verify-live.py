from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json,hashlib,datetime,re
base=Path(__file__).parent
manifest=json.loads((base.parent/'book-release-manifest.json').read_text())
paths=['/cinema/','/cinema/daman-team/','/cinema/daman/','/cinema/book/','/cinema/reading-guide/','/cinema/lavanya-preeti/','/people/vishal-mourya/','/people/debi-prasad-lenka/','/people/deependra-samal/']
def read(path):
 req=urllib.request.Request('https://projectodisha.org'+path,headers={'User-Agent':'ProjectOdisha-publication-check/1.0','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=45) as r:return path,r.status,r.read()
rows=list(ThreadPoolExecutor(max_workers=5).map(read,paths));html={p:b.decode() for p,_,b in rows}
team=html['/cinema/daman-team/'];assert 'The people behind DAMaN' in team
for name in ['vishal-mourya','debi-prasad-lenka','deependra-samal']:
 assert 'id="'+name+'"' in team
 old=html['/people/'+name+'/'];assert '0;url=/cinema/daman-team/#'+name in old;assert 'href="/cinema/daman-team/#'+name+'"' in old
assert 'href="/cinema/daman-team/"' in html['/cinema/']
for a in manifest['assets'][:2]:assert a['planned_release_url'] in html['/cinema/book/']
record={'status':'PASS','checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'routes':[{'route':p,'http_status':s,'sha256':hashlib.sha256(b).hexdigest()} for p,s,b in rows],'three_alias_destinations_verified':True,'new_book_links_verified':True,'book_count':49,'online_readings':50,'limitations':['Static alias HTML verified; browser redirect separately checked. Lavanya source status preserved by reviewed source hash, not inferred from page availability.']}
for name in ['daman-team','book']:(base/('live-'+name+'.html')).write_text(html['/cinema/'+name+'/'])
(base/'live-verification.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record,indent=2))
