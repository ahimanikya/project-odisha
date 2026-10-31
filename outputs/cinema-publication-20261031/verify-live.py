import concurrent.futures,datetime,hashlib,json,re,urllib.request
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent
class Main(HTMLParser):
 def __init__(self): super().__init__();self.inside=False;self.text=[];self.images=[]
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='main': self.inside=True
  if self.inside and t=='img': self.images.append(a.get('src',''))
 def handle_endtag(self,t):
  if t=='main': self.inside=False
 def handle_data(self,s):
  if self.inside:self.text.append(s)
 def result(self):return re.sub(r'\s+',' ',' '.join(self.text)).strip(),sorted(self.images)
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'ProjectOdishaPublicationVerification/1.0','Cache-Control':'no-cache'}),timeout=90) as r:return r.status,r.read()
def page(route):
 status,data=get('https://projectodisha.org'+route)
 expected=(ROOT/'projects/site/dist-publish'/route.lstrip('/')/'index.html').read_text()
 local=Main();local.feed(expected);remote=Main();remote.feed(data.decode())
 lt,li=local.result();rt,ri=remote.result()
 return dict(route=route,status=status,main_text_matches_release=lt==rt,image_paths_match=li==ri),li
cinema=json.loads((ROOT/'projects/site/src/data/cinema.json').read_text())
routes=[a['route'] for a in cinema['articles']]+['/cinema/','/cinema/book/','/cinema/reading-guide/','/cinema/watch/']
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(page,routes))
images=sorted({i for _,ims in results for i in ims if i.startswith('/')})
def image(path):
 status,data=get('https://projectodisha.org'+path)
 p=ROOT/'projects/site/dist-publish'/path.lstrip('/')
 return dict(path=path,status=status,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),matches_release=data==p.read_bytes())
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: im=list(pool.map(image,images))
report=dict(verified_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),pages=[r for r,_ in results],images=im)
report['status']='PASS' if all(r['status']==200 and r['main_text_matches_release'] and r['image_paths_match'] for r,_ in results) and all(r['status']==200 and r['matches_release'] for r in im) else 'FAIL'
(OUT/'live-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(report['status'],len(routes),'pages',len(im),'images')
for r in report['pages']:
 if not r['main_text_matches_release'] or not r['image_paths_match']:print(r)
raise SystemExit(0 if report['status']=='PASS' else 1)
