from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import json
R=Path(__file__).resolve().parents[2];dist=R/'projects/site/dist-publish';data=json.loads((R/'projects/site/src/data/cinema.json').read_text());issues=[];pages=[]
class Reading(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.images=[];self.inmain=False;self.incontents=False;self.notes=0;self.headings=0
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  if tag=='main':self.inmain=True
  if tag=='nav' and d.get('aria-label')=='In this article':self.incontents=True
  if self.inmain:
   if tag=='a' and 'href' in d:
    self.links.append(d['href'])
    if self.incontents and d['href']=='#footnote-label':self.notes+=1
   if tag=='img' and 'src' in d:self.images.append(d['src'])
   if tag in ['h2','h3']:self.headings+=1
 def handle_endtag(self,tag):
  if tag=='main':self.inmain=False
  if tag=='nav':self.incontents=False
for a in data['articles']:
 p=dist/a['route'].strip('/')/'index.html';h=Reading();h.feed(p.read_text())
 if len(h.ids)!=len(set(h.ids)):issues.append([a['slug'],'duplicateids'])
 for href in h.links:
  u=urlparse(href)
  if href.startswith('#') and unquote(href[1:]) not in h.ids:issues.append([a['slug'],'missinganchor',href])
  if href.startswith('/'):
   dest=dist/unquote(u.path).lstrip('/');dest=dest/'index.html' if u.path.endswith('/') else dest
   if not dest.exists():issues.append([a['slug'],'missinglocaltarget',href])
  if '/kb/' in href or href.endswith('.md') or href.startswith('file:'):issues.append([a['slug'],'internalresearchlink',href])
 for src in h.images:
  if src.startswith('/') and not (dist/src.lstrip('/')).exists():issues.append([a['slug'],'missingimage',src])
 if h.notes!=1:issues.append([a['slug'],'contentsnoteslink',h.notes])
 pages.append({'slug':a['slug'],'route':a['route'],'contents_note_links':h.notes,'heading_count':h.headings})
x={'date':'2026-10-30','pages':pages,'issues':issues,'scope':'41renderedreadings,localtargets,images,anchors,notecontents. Externalavailabilityseparate.'};(R/'outputs/cinema-publication-readiness-20261030/rendered-publication-audit.json').write_text(json.dumps(x,indent=2)+'\n');print('41renderedreadings',len(issues),'issues');print(issues[:10]);raise SystemExit(bool(issues))
