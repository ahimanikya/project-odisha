"""Read-only check that the reconciled Pentha footnote survives this deployment."""
from pathlib import Path
from urllib.request import Request,urlopen
from datetime import datetime,timezone
from html import unescape
import re,json,hashlib,argparse
O=Path(__file__).resolve().parent;R=O.parents[1]
p=argparse.ArgumentParser();p.add_argument('--deployment',required=True);a=p.parse_args()
run=O/('pentha-live-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'));run.mkdir()
url='https://projectodisha.org/stories/odisha/pentha/'
with urlopen(Request(url,headers={'User-Agent':'Project-Odisha-delivery-check/1.0','Accept-Encoding':'identity'}),timeout=45) as r:
 status=r.status;final=r.url;b=r.read(5000001)
(run/'page.html').write_bytes(b)
s=b.decode();md=(R/'kb/research/stories/independent-features/nature/pentha.md').read_text();expected=re.search(r'^\[\^2\]: (.+)$',md,re.M).group(1)
urls=re.findall(r'\]\(([^)]+)\)',expected)
expected=re.sub(r'\[([^]]+)\]\([^)]+\)',r'\1',expected).replace('*','')
plain=lambda t:' '.join(unescape(re.sub('<[^>]+>',' ',t)).split())
notes=re.findall(r'<li\b[^>]*id="user-content-fn-2"[^>]*>(.*?)</li>',s,re.S)
checks={'http200':status==200,'exact_final_url':final==url,'bounded':len(b)<=5000000,'unique_note2':len(notes)==1}
if len(notes)==1:
 note=notes[0];clean=re.sub(r'<a\b[^>]*data-footnote-backref[^>]*>.*?</a>','',note,flags=re.S)
 checks['exact_corrected_note_prose']=plain(clean)==' '.join(expected.split())
 checks['exact_source_and_return_links']=re.findall(r'href="([^"]+)"',note)==urls+['#user-content-fnref-2']
 checks['backref_target_present']='id="user-content-fnref-2"' in s
result={'result':'PASS' if all(checks.values()) else 'FAIL','deployment':a.deployment,'url':url,'status':status,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'checks':checks,'source_sha256':hashlib.sha256(md.encode()).hexdigest(),'limits':'Targeted note continuity only; not independent re-research of the other article or a claim of all-page byte identity.'}
(run/'report.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(0 if all(checks.values()) else 1)
