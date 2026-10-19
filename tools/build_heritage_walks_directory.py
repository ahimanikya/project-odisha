"""Rebuild visitor exports from the reviewed, dated walk catalogue. No network calls."""
import csv,io,json,pathlib,zipfile,html
R=pathlib.Path(__file__).resolve().parents[1]
source=R/'kb/research/references/data/odisha-heritage-walks-20261019.json'
d=json.loads(source.read_text()); walks=d['walks']
lines=['---','type: Visitor guide','title: Heritage walks to look for in Odisha','status: Published visitor reference','---','','# Heritage walks to look for in Odisha','','Checked 19 October 2026. Times are Indian Standard Time. Prices and departures can change.','',d['scope'],'','## Start with your travel date','','Khordha advertises a free 25 October walk with phone registration. Ekamra Living Temple City showed a ticket selector for 21 October. The checked 20 October Dhauli event was sold out. Reopen the event before arranging travel. These observations are not reservations.','']
for k,v in d['general'].items(): lines += ['### '+{'season':'Best time to walk','booking':'How to book','ask':'What to confirm','etiquette':'On the walk','gaps':'Coverage and unverified routes','winter':'Upcoming winter programme'}[k],'',v,'']
lines += ['## General sources','']+[f"- [{s['name']}]({s['url']})" for s in d['generalSources']]+['']
last=None
for w in walks:
 if w['group']!=last: lines+=['## '+w['group'],''];last=w['group']
 lines+=['### '+w['name'],'',f"**{w['place']} · {w['theme']} · {w['status']}**",'',w['expect'],'']
 for label,key in [('Provider','provider'),('When','schedule'),('Duration','duration'),('Meet','meeting'),('Price','price'),('Best time','bestTime'),('Format','mode'),('Language','language'),('Before booking','note'),('Contact','contact')]:lines+=[f'- **{label}:** {w[key]}']
 lines += [f"- **Book or enquire:** [Provider page]({w['booking']})",'']
text='\n'.join(lines).rstrip()+'\n'
(R/'kb/research/product/odisha-heritage-walks-visitor-guide-20261019.md').write_text(text)
out=R/'outputs/heritage-walks-directory-20261019';out.mkdir(parents=True,exist_ok=True)
public=R/'projects/site/public/downloads/heritage-walks'; public.mkdir(parents=True,exist_ok=True)
esc=html.escape
html_guide='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heritage walks in Odisha</title><style>body{max-width:850px;margin:30px auto;padding:20px;font:17px/1.65 system-ui;color:#243b36}article{border-top:1px solid #ccc;padding:20px 0}a{color:#155c50;overflow-wrap:anywhere}h1,h2{line-height:1.2}dt{font-weight:bold}dd{margin:0 0 12px}@media print{article{break-inside:avoid}}</style><h1>Heritage walks in Odisha</h1><p>Checked 19 October 2026. A saved snapshot, not live availability. All times IST. Recheck dates and final prices with the organiser.</p><p>'+esc(d['scope'])+'</p>'
for key,value in d['general'].items():html_guide+='<p>'+esc(value)+'</p>'
for w in walks:
 html_guide+='<article><h2>'+esc(w['name'])+'</h2><p>'+esc(w['place']+' · '+w['status'])+'</p><p>'+esc(w['expect'])+'</p><dl>'
 for label,key in [('When','schedule'),('Duration','duration'),('Meeting point','meeting'),('Price','price'),('Best time','bestTime'),('Format','mode'),('Language','language'),('Check before booking','note'),('Contact','contact')]:html_guide+='<dt>'+label+'</dt><dd>'+esc(w[key])+'</dd>'
 html_guide+='</dl><p><a href="'+esc(w['booking'],quote=True)+'">Provider details and booking</a></p></article>'
html_guide+='</html>'
for folder in [out,public]:
 (folder/'odisha-heritage-walks.html').write_text(html_guide)
 (folder/'odisha-heritage-walks.md').write_text(text)
 (folder/'odisha-heritage-walks.json').write_text(source.read_text())
 with (folder/'odisha-heritage-walks.csv').open('w',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=['checked']+list(walks[0]),lineterminator='\n');writer.writeheader();writer.writerows([{'checked':d['checked'],**w} for w in walks])
 with zipfile.ZipFile(folder/'odisha-heritage-walks.zip','w',zipfile.ZIP_DEFLATED) as z:
  for ext in ['md','json','csv','html']:z.write(folder/f'odisha-heritage-walks.{ext}',f'odisha-heritage-walks.{ext}')
print(f'Exported {len(walks)} entries as guide, CSV, JSON and ZIP')
