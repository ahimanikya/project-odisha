from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import subprocess,json,hashlib,datetime
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).parent
TMP=Path('/tmp/cinema-bideha-live-20261110');TMP.mkdir(exist_ok=True)
manifest=json.loads((OUT.parent/'book-release-manifest.json').read_text())
class Page(HTMLParser):
 def __init__(self):super().__init__();self.words=[];self.links=[];self.images=[];self.ids=[];self.anchors=[];self.note_links=[];self.in_story_note=False
 def handle_data(self,s):self.words.append(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if t=='li' and a.get('id')=='user-content-fn-bideha-story':self.in_story_note=True
  if t=='a':
   self.anchors.append(a)
   if self.in_story_note and a.get('href'):self.note_links.append(a['href'])
  if t=='a' and a.get('href'):self.links.append(a['href'])
  if t=='img' and a.get('src'):self.images.append(a['src'])
 def handle_endtag(self,t):
  if t=='li':self.in_story_note=False
def check_story_note(p):
 ref='user-content-fnref-bideha-story';note='user-content-fn-bideha-story'
 assert p.ids.count(ref)==1 and p.ids.count(note)==1, 'Missing or duplicate story note/citation'
 citations=[a for a in p.anchors if a.get('id')==ref]
 assert len(citations)==1 and citations[0].get('href')=='#'+note and 'data-footnote-ref' in citations[0]
 assert '#'+ref in p.note_links, 'Missing story note return link'
 assert any(a.get('href')=='#'+ref and 'data-footnote-backref' in a for a in p.anchors)
 expected={'https://sambad.in/special/the-pairing-of-literature-and-cinema-11010926','https://culture.odisha.gov.in/sites/default/files/2022-06/List%20of%20Selected%20Books%20Under%20Raja%20Rammohan%20Ray%20Library%20Foundation%20%28RRRLF%29%20Scheme%20for%20the%20Year%202010-11.pdf#page=11'}
 assert expected.issubset(set(p.note_links)), 'Story note lacks exact original sources'
def fetch(item):
 name,url=item;p=TMP/name
 cmd=['curl','--fail','--location','--silent','--show-error','--proto','=https','--proto-redir','=https','--max-redirs','5','--connect-timeout','15','--max-time','150','--header','Cache-Control: no-cache','--output',str(p),'--write-out','%{http_code}\n%{url_effective}',url]
 r=subprocess.run(cmd,capture_output=True,text=True);assert r.returncode==0,(url,r.returncode,r.stderr[:200]);status,effective=r.stdout.strip().split('\n',1);assert status=='200' and effective==url,(url,status,effective);return name,{'url':url,'effective_url':effective,'http_status':200,'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
routes={'profile.html':'/people/biyott-projna-tripathy/','literature.html':'/cinema/literature-and-screen/','book.html':'/cinema/book/'}
assets=[a for a in manifest['assets'] if a['edition'] in ['digital','print']]
assert len(assets)==2 and {a['edition'] for a in assets}=={'digital','print'}
assert len({a['filename'] for a in assets})==2
requests=[(name,'https://projectodisha.org'+route) for name,route in routes.items()]+[(a['filename'],'https://projectodisha.org/archive/'+a['filename']) for a in assets]
with ThreadPoolExecutor(max_workers=4) as pool:results=dict(pool.map(fetch,requests))
checks=[]
for name,route in routes.items():
 p=Page();p.feed(Path(results[name]['path']).read_text());text=' '.join(p.words)
 if name=='profile.html':
  assert all(s in text for s in ['Biyott Projna Tripathy','Ladakh','Yogini','Bideha','OrissaPOST']);assert '/cinema/literature-and-screen/' in p.links and '/cinema/cinema-music/' in p.links;assert any('biyott-projna-tripathy-portrait' in x for x in p.images);assert all(x in text for x in ['Kadapana o Cleopatra','2005 or 2006','Pakshighara Prakashanee','2010'])
 elif name == 'literature.html':
  assert all(x in text for x in ['Kadapana o Cleopatra','2005 or 2006','Pakshighara Prakashanee','2010']) and '/people/biyott-projna-tripathy/' in p.links
 else:
  assert '10 November 2026' in text
  for a in assets:assert '/archive/'+a['filename'] in p.links and str(a['pages'])+' pages' in text
 if name in ['profile.html','literature.html']:check_story_note(p)
 checks.append({'route':route,'result':'PASS'})
for a in assets:
 r=results[a['filename']];assert r['sha256']==a['sha256'] and r['bytes']==a['bytes'];assert Path(r['path']).read_bytes()[:5]==b'%PDF-';checks.append({'edition':a['edition'],'result':'PASS_EXACT_REVIEWED_BYTES','sha256':r['sha256']})
receipt={'status':'PASS','verified_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'responses':results}
(OUT/'live-verification.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','pages':3,'matching_PDFs':2}))
