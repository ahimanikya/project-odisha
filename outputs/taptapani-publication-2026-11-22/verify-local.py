from pathlib import Path
from html.parser import HTMLParser
import json,hashlib,re,subprocess
root=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
class Page(HTMLParser):
 def __init__(self): super().__init__(); self.ids=[];self.links=[];self.imgs=[];self.meta={}
 def handle_starttag(self,t,a):
  d=dict(a)
  if 'id' in d:self.ids.append(d['id'])
  if t=='a':self.links.append(d.get('href',''))
  if t=='img':self.imgs.append(d)
  if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
sha=lambda b:hashlib.sha256(b).hexdigest()
article=root/'kb/research/places/taptapani-article.md'
assert sha(article.read_bytes())=='695700a82dc3f7a4b9484817ed36aa1e1edb7cdbdf815173085be86dfedbcd2b'
report={'manuscript_sha256':sha(article.read_bytes()),'editions':{},'binchana':{}}
for edition in ['dist','dist-coast','dist-publish']:
 base=root/'projects/site'/edition; html=(base/'destinations/taptapani/index.html').read_text();page=Page();page.feed(html)
 assert 'Taptapani’s temple' in html and 'It offers a different focus' not in html
 assert len(page.ids)==len(set(page.ids))
 notes=[x for x in page.links if x.startswith('#user-content-fn')]
 assert len(notes)==10 and all(x[1:] in page.ids for x in notes)
 assert 'Footnotes &amp; Sources' in html
 assert page.meta['og:image'].endswith('/images/destinations/taptapani-worship.jpg')
 assert page.meta['twitter:image'].endswith('/images/destinations/taptapani-worship.jpg')
 img=next(i for i in page.imgs if i.get('src')=='/images/destinations/taptapani-worship.jpg')
 assert img['width']=='2304' and img['height']=='1728' and img['loading']=='eager'
 variants=re.findall(r'(/images/responsive/[^ ,]+)',img['srcset'])
 assert len(variants)==3 and all((base/v.lstrip('/')).exists() for v in variants)
 assert sha((base/'images/destinations/taptapani-worship.jpg').read_bytes())=='5bad4ad57c149007d76683b953d8082368fedb1abb90e837e25dbf7887a02c75'
 for route in ['destinations/hills','destinations','explore']:
  s=(base/route/'index.html').read_text();assert '/destinations/taptapani/' in s and '/images/destinations/taptapani-worship.jpg' in s
 frag=re.search(r'<article\b.*?</article>',html,re.S).group()
 report['editions'][edition]={'article_sha256':sha(html.encode()),'article_fragment_sha256':sha(frag.encode()),'native_reference_return_links':len(notes),'variants':variants,'incoming_routes':['/destinations/hills/','/destinations/','/explore/']}
 markers=['With a hand fan, a breeze is something you make.','Binchana and the Handmade Breeze','binchana-from-odisha.jpg','binchana-and-the-handmade-breeze']
 hits=[];hashhits=[];texts=0
 for file in base.rglob('*'):
  if not file.is_file():continue
  if 'binchana' in str(file.relative_to(base)).lower():hits.append(str(file))
  if file.suffix.lower() in ['.html','.json','.md','.txt']:
   texts+=1;s=file.read_text(errors='replace')
   if any(m in s for m in markers):hits.append(str(file))
  if file.stat().st_size==3374337 and sha(file.read_bytes())=='12d5949655c798f7034d256b475bc282c17bb23c2401e73e35835814e651fd01':hashhits.append(str(file))
 assert not hits and not hashhits,(hits,hashhits)
 report['binchana'][edition]={'scanned_text_files':texts,'markers':markers,'path_or_text_hits':hits,'original_image_hash_hits':hashhits}
for rel in ['kb/research/culture/binchana-and-the-handmade-breeze.md','kb/media/binchana/binchana-from-odisha.jpg']:
 b=(root/rel).read_bytes();old=subprocess.check_output(['git','show','b4c75736:'+rel],cwd=root);assert b==old;report['binchana'][rel]={'sha256':sha(b),'matches_inherited_commit':True}
files=[p for p in (root/'projects/site/dist-publish').rglob('*') if p.is_file()]
report['payload']={'files':len(files),'bytes':sum(p.stat().st_size for p in files),'limit':1000000000};assert report['payload']['bytes']<1000000000
(out/'local-checks.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report['payload']))
