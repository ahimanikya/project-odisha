"""Validate and render the sequential article work list; never marks work complete."""
import json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[2]; KB=ROOT/'kb'
p=KB/'records/article-editorial-rollout.json';d=json.loads(p.read_text());items=d['items'];errors=[]
ids=[x['id'] for x in items];routes=[x['route'] for x in items]
if len(set(ids))!=len(ids) or len(set(routes))!=len(routes):errors.append('Duplicate ID or route')
for route in d['baseline_routes']:
 if route not in routes:errors.append('Missing baseline route '+route)
for route in json.loads((ROOT/'projects/site/editions/coast.json').read_text())['routes']:
 if route not in routes:errors.append('Unaccounted current route '+route)
if sum(x['status']=='in_progress' for x in items)>1:errors.append('Only one article may be in progress')
for x in items:
 if x['status'] not in {'queued','in_progress','completed','blocked','excluded'}:errors.append(x['id']+' has invalid status')
 if x['status']=='blocked' and not x.get('blocker'):errors.append(x['id']+' lacks blocker')
 if x['status']=='completed':
  if not all(x['checks'].get(k) is True for k in ['authorship','language','formatting','footnotes','images','kb_alignment','responsive']):errors.append(x['id']+' lacks editorial acceptance')
  receipt=x.get('publication_receipt');f=KB/receipt if receipt else None
  if not f or not f.exists():errors.append(x['id']+' lacks publication receipt')
  else:
   r=json.loads(f.read_text())
   if not r.get('pull_request') or r.get('deployment',{}).get('conclusion')!='success' or x['route'] not in r.get('verified_routes',[]):errors.append(x['id']+' lacks successful delivery evidence')
 if x['status']=='excluded' and not x.get('exclusion_reason'):errors.append(x['id']+' lacks exclusion reason')
counts={s:sum(x['status']==s for x in items) for s in sorted(set(x['status'] for x in items))}
lines=['---', 'type: "Work list"', 'title: "Article editorial work list"', 'status: "active"', '---', '', '# Article editorial work list','','Reference: [Ahimanikya and Sashisena](https://projectodisha.org/stories/nimuhi-temple/). [Editorial standard](../reference/article-editorial-standard.md).','','One route at a time. This inventory includes navigation and utility pages for explicit classification; it is not a claim that every route is an article. Formatting changes are separate from the 500 substantive-item programme.','',f'Route inventory: {len(items)}. '+', '.join(f'{k}: {v}' for k,v in counts.items())+'.','','| Order | Page | Status | Scope |','| --- | --- | --- | --- |']
for x in items:lines.append(f"| {x['id']} | [{x['title'].replace('|','—')}](https://projectodisha.org{x['route']}) | {x['status']} | {x['scope']} |")
text='\n'.join(lines)+'\n';target=KB/'records/article-editorial-work-list.md'
if '--check' in sys.argv:
 if not target.exists() or target.read_text()!=text:errors.append('Work list needs regeneration')
else:target.write_text(text)
print(json.dumps(dict(result='FAIL' if errors else 'PASS',counts=counts,errors=errors)))
sys.exit(bool(errors))
