from pathlib import Path
import json,re,hashlib,subprocess,urllib.parse
P=Path(__file__).resolve().parent;ROOT=P.parents[3];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';B=R/'projects/odia-dhaga';ids={84650,10131,110630,37990,41096}
search=json.loads((ROOT/'outputs/dhaga-loop-2026-11-05/batch57/anvesha/search-offset700.json').read_text())['query']['search'];selection={str(x['pageid']):x for x in search if x['pageid'] in ids};hits={i:[] for i in selection};errors=[];count=0
revmap={}
bases=[ROOT/'outputs',B,R/'kb']
for base in bases:
 for f in base.rglob('*.json'):
  if P.parent in f.parents:continue
  count+=1
  try:raw=f.read_text();data=json.loads(raw)
  except Exception as e:errors.append({'path':str(f),'error':str(e)});continue
  for pid,x in selection.items():
   title=x['title'];url='https://or.wiktionary.org/wiki/'+urllib.parse.quote(title,safe='')
   if not (re.search(r'(?<!\d)'+pid+r'(?!\d)',raw) or title in raw or json.dumps(title)[1:-1] in raw or url in raw or (pid in revmap and re.search(r'(?<!\d)'+revmap[pid]+r'(?!\d)',raw))):continue
   rows=[]
   def walk(v,loc=''):
    if isinstance(v,dict):
     matched=[]
     for k,z in v.items():
      if isinstance(z,(str,int)) and k in ['pageid','page_id','title','url','source_url','canonical_url','resource','id','source_id','revision','revid','revision_id']:
       if str(z)==pid or (pid in revmap and (str(z)==revmap[pid] or str(z)=='dhaga-wiktionary-'+revmap[pid] or 'oldid='+revmap[pid] in str(z))) or str(z)==title or urllib.parse.unquote(str(z)).rstrip('/')=='https://or.wiktionary.org/wiki/'+title:matched.append(k)
     if matched:rows.append({'location':loc,'matched':matched,'keys':list(v),'excerpt':str(v)[:700]})
     for k,z in v.items():walk(z,loc+'/'+str(k))
    elif isinstance(v,list):
     for i,z in enumerate(v):walk(z,loc+'/'+str(i))
   walk(data)
   if rows:hits[pid].append({'file':str(f.relative_to(ROOT)),'rows':rows})
(P/'prior-screen.json').write_text(json.dumps({'files_scanned':count,'size_exclusions':False,'scope':'Every JSON in all ROOT outputs except currentbatch, all canonical book and KB; bundled/history/payload included, no size exclusions.','errors':errors,'selection':selection,'hits':hits},ensure_ascii=False,indent=2)+'\n')
for pid,rows in hits.items():
 actual=[r for r in rows if not any(k in r['file'] for k in ['search-offset','search-next','selection','coverage','prior-','screen','baseline'])];print(pid,selection[pid]['title'],[(r['file'],[x['matched'] for x in r['rows'][:3]]) for r in actual[:12]])
print('scanned',count,'errors',len(errors))
