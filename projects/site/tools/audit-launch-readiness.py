from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,urljoin
import json,xml.etree.ElementTree as ET
import argparse,os
os.chdir(Path(__file__).resolve().parents[3])
parser=argparse.ArgumentParser(description="Audit the prepared search review and shared contrast tokens")
parser.add_argument("--output",type=Path,default=Path("projects/site/.astro/launch-readiness"))
args=parser.parse_args()
site=Path('projects/site');ep=args.output;ep.mkdir(parents=True,exist_ok=True)
selection=json.loads((site/'editions/search-candidate.json').read_text());errors=[];routes=[]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.nodes=[]
 def handle_starttag(self,t,a):self.nodes.append((t,dict(a)))
for page in selection['pages']:
 route=page['route'];path=route.lstrip('/')+('index.html' if route.endswith('/') else '')
 html=(site/'.search-review'/path).read_text();doc=Page();doc.feed(html);tags=[a.get('content') for t,a in doc.nodes if t=='meta' and a.get('name')=='robots'];expected='index, follow' if page['decision']=='proposed' else 'noindex, follow'
 if tags!=[expected]:errors.append(route+' robots mismatch')
 normal=(site/'dist-coast'/path).read_text()
 if 'content="noindex, nofollow"' not in normal:errors.append(route+' production boundary lost')
 routes.append({'route':route,'candidate':expected,'normal_publication':'noindex, nofollow'})
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'};urls=[n.text for n in ET.parse(site/'.search-review/sitemap.xml').findall('s:url/s:loc',ns)];expected=['https://projectodisha.org'+p['route'] for p in selection['pages'] if p['decision']=='proposed'];assert urls==expected
r={'status':'pass' if not errors else 'fail','scope':'Generated local search candidate, not a deployed or crawler-verified release','pages':routes,'sitemap_count':len(urls),'errors':errors};(ep/'search-checks.json').write_text(json.dumps(r,indent=2)+'\n')
# Check computed palette values separately from a browser rendering audit.
tokens=json.loads(Path('projects/design-system/tokens.json').read_text())['colour']
def lum(s):
 c=[int(s[i:i+2],16)/255 for i in (1,3,5)];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c];return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
pairs=[]
for bg in ['canvas','surface']:
 for fg in ['ink','sea','earth','muted','danger','olive']:
  a,b=sorted([lum(tokens[bg]),lum(tokens[fg])]);ratio=(b+.05)/(a+.05);pairs.append({'foreground':fg,'background':bg,'contrast':round(ratio,2),'normal_text_pass':ratio>=4.5})
for bg in ['sea','earth']:
 a,b=sorted([lum(tokens['on-action']),lum(tokens[bg])]);ratio=(b+.05)/(a+.05);pairs.append({'foreground':'on-action','background':bg,'contrast':round(ratio,2),'normal_text_pass':ratio>=4.5})
assert all(p['normal_text_pass'] for p in pairs)
(ep/'contrast-checks.json').write_text(json.dumps({'scope':'Token pairs only; not a rendered-page or WCAG conformance certification','pairs':pairs},indent=2)+'\n')
assert not errors;print(f'All candidate/default indexing comparisons, {len(urls)} sitemap URLs, {len(pairs)} contrast pairs passed.')
