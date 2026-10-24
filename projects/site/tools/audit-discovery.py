"""Inspect built metadata and prepare a sitemap proposal outside public output.

This does not enable indexing, submit to a search engine, or approve any route.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import argparse, json, xml.etree.ElementTree as ET
SITE=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,default=SITE/'.astro/discovery-review');args=p.parse_args();args.output.mkdir(parents=True,exist_ok=True)
class Page(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.title='';self.in_head=False;self.in_title=False;self.canonical=[];self.images=[]
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='head':self.in_head=True
  if t=='title':self.in_title=self.in_head
  if t=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content','')
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if t=='img':self.images.append(a.get('src'))
 def handle_endtag(self,t):
  if t=='head':self.in_head=False
  if t=='title':self.in_title=False
 def handle_data(self,d):
  if self.in_title:self.title+=d
scope=json.loads((SITE/'editions/coast.json').read_text());rows=[]
standalone=set(scope.get('standalone_routes',[]))
for route in scope['routes']:
 doc=Page();doc.feed((SITE/'dist-coast'/(route.lstrip('/')+'index.html' if route.endswith('/') else route.lstrip('/'))).read_text());m=doc.meta;share=urlsplit(m.get('og:image',''));errors=[]
 if doc.canonical!=['https://projectodisha.org'+route]:errors.append('canonical')
 if not (1 if route in standalone else 50)<=len(m.get('description',''))<=250:errors.append('description')
 if m.get('og:description')!=m.get('description'):errors.append('social_description')
 if not doc.title or m.get('og:title') not in [doc.title,doc.title.split(' | ')[0]]:errors.append('title')
 if share.netloc!='projectodisha.org' or not (SITE/'dist-coast'/unquote(share.path).lstrip('/')).is_file():errors.append('missing_social_image')
 if not m.get('og:image:alt') or not all(m.get(k,'').isdigit() for k in ['og:image:width','og:image:height']):errors.append('image_description_or_dimensions')
 if 'noindex' not in m.get('robots',''):errors.append('preview_boundary')
 rows.append(dict(route=route,title=doc.title,description=m.get('description'),social_image=m.get('og:image'),social_alt=m.get('og:image:alt'),image_on_page=share.path in doc.images,errors=errors))
for key in ['title','description']:
 # Preserved, non-indexed archive versions may share a title/summary; canonical URLs remain unique.
 counts=Counter(row[key] for row in rows if row['route'] not in standalone)
 for row in rows:
  if row['route'] not in standalone and counts[row[key]]>1:row['errors'].append('duplicate_'+key)
selection=json.loads((SITE/'editions/search-candidate.json').read_text())
selected={p['route'] for p in selection['pages'] if p['decision']=='proposed'}
if {p['route'] for p in selection['pages']}!=set(scope['routes']):raise SystemExit('Search selection must cover the edition')
root=ET.Element('urlset',xmlns='http://www.sitemaps.org/schemas/sitemap/0.9');excluded=[r for r in scope['routes'] if r not in selected]
for row in rows:
 if row['route'] not in excluded:ET.SubElement(ET.SubElement(root,'url'),'loc').text='https://projectodisha.org'+row['route']
ET.ElementTree(root).write(args.output/'sitemap-proposal.xml',encoding='utf-8',xml_declaration=True)
report=dict(status='pass' if not any(row['errors'] for row in rows) else 'fail',scope='Build checks only; no search-engine or social-network crawler verification.',indexing='disabled',sitemap='proposal_only_not_served',excluded_routes=excluded,proposed_routes=len(root),distinct_social_images=len({r['social_image'] for r in rows}),pages=rows)
(args.output/'discovery-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='pages'},indent=2))
for row in rows:
 if row['errors']:print(row['route'],row['errors'])
raise SystemExit(0 if report['status']=='pass' else 1)
