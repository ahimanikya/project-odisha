"""Bounded postdeployment source checks for Manikapatna 913 and Bahuda 912.
No comparison against the pre-913 local package; no visual or comprehensive QA claim.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from datetime import datetime,timezone
import argparse,hashlib,json,re
HERE=Path(__file__).resolve().parent;OUT=HERE.parent;ROOT=OUT.parents[1];ORIGIN='https://projectodisha.org'
sha=lambda b:hashlib.sha256(b).hexdigest()
report={'status':'RUNNING','checks':[],'failures':[],'routes':[],'limits':['Read-only HTTP/source assertion supplement, not comprehensive article quality or visual approval.','No full-page or final-package byte equivalence inferred from the pre-913 local build.','No images fetched; Chakulia/Radha assets remain the separate five-route verifier scope.']};RUN=None
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.ids=[];self.links=[];self.meta={};self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content')
class Text(HTMLParser):
 def __init__(self,s):super().__init__();self.parts=[];self.feed(s)
 def handle_data(self,s):self.parts.append(s)
def plain(s):return ' '.join(''.join(Text(s).parts).split())
def check(ok,label):
 report['checks'].append({'label':label,'pass':bool(ok)})
 if not ok:report['failures'].append(label)
 return bool(ok)
def require(ok,label):
 if not check(ok,label):raise AssertionError(label)
def capture(route):
 request=Request(ORIGIN+route,headers={'User-Agent':'Project-Odisha-incoming-release-verification/1.0','Accept-Encoding':'identity'})
 try:response=urlopen(request,timeout=45)
 except HTTPError as e:response=e
 with response:body=response.read(10_000_001);row={'route':route,'url':response.url,'status':response.status,'headers':dict(response.headers),'bytes':len(body),'sha256':sha(body)}
 p=RUN/route.strip('/')/'index.html';p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(body)
 row['file']=str(p.relative_to(ROOT));p.with_suffix('.http.json').write_text(json.dumps(row,indent=2)+'\n');report['routes'].append(row)
 require(row['status']==200 and row['url']==ORIGIN+route and len(body)<=10_000_000,'Complete HTTP 200 expected route '+route)
 return body.decode('utf-8')
def main(args):
 global RUN
 require(bool(re.fullmatch('[0-9a-f]{40}',args.expected_merge)),'Explicit full expected merge')
 dp=Path(args.deployment_evidence).resolve();d=json.loads(dp.read_text())
 require(d.get('status')=='completed' and d.get('conclusion')=='success','Completed successful deployment')
 require(str(d.get('id',d.get('databaseId',d.get('run'))))==str(args.deployment_run) and d.get('head_sha',d.get('headSha',d.get('head')))==args.expected_merge,'Deployment identity agrees')
 cp=HERE/'incoming-source-assertions.json';c=json.loads(cp.read_text())
 for x in c['articles']:
  require(sha((ROOT/x['sourcePath']).read_bytes())==x['source_sha256'] and sha((ROOT/x['pagePath']).read_bytes())==x['page_sha256'],'Observed article source unchanged '+x['route'])
 for x in c['bahuda_incoming']:require(sha((ROOT/x['path']).read_bytes())==x['sha256'],'Observed incoming source unchanged '+x['route'])
 RUN=OUT/'live'/('incoming-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ'));RUN.mkdir(parents=True,exist_ok=False)
 report.update(expected_merge=args.expected_merge,deployment_run=args.deployment_run,deployment_evidence_sha256=sha(dp.read_bytes()),assertions_sha256=sha(cp.read_bytes()),raw_directory=str(RUN.relative_to(ROOT)))
 for x in c['articles']:
  route=x['route']
  try:
   html=capture(route);page=Page(html)
   found=re.findall(r'<article\b[^>]*class="[^"]*(?:article-reading|prose)[^"]*"[^>]*>.*?</article>',html,re.S);require(len(found)==1,route+' one article fragment');article=found[0];actual=Page(article);expected=Page(x['expected_source_html'])
   (RUN/route.strip('/')/'article.html').write_text(article)
   headings=re.findall(r'<h1\b[^>]*>(.*?)</h1>',html,re.S);check(len(headings)==1 and plain(headings[0])==x['title'],route+' exact title')
   check('By Ahimanikya Satapathy' in plain(article),route+' visible byline')
   check(page.meta.get('description')==x['description'],route+' sourced metadata description')
   check('noindex' in page.meta.get('robots','') and x['hold']=='hold',route+' search hold')
   check(len(page.ids)==len(set(page.ids)),route+' unique IDs')
   for tag in ['p','li']:
    wanted=[plain(t) for t in re.findall('<'+tag+r'\b[^>]*>(.*?)</'+tag+'>',x['expected_source_html'],re.S)]
    observed=[plain(t) for t in re.findall('<'+tag+r'\b[^>]*>(.*?)</'+tag+'>',article,re.S)]
    for value in wanted:check(value in observed,route+' exact source '+tag+' '+value[:45])
   labels=re.findall(r'aria-label="Footnote (\d+)"',article);check(labels==x['expected_marker_labels'],route+' exact manual marker sequence')
   for target in expected.ids:check(actual.ids.count(target)==1,route+' unique source anchor '+target)
   for u in expected.links:
    check(actual.links.count(u)==expected.links.count(u) if u.startswith('#') else u in actual.links,route+' source/note/return link '+u)
    if u.startswith('#'):check(u[1:] in actual.ids,route+' note target resolves '+u)
   source_headings=[plain(h) for h in re.findall(r'<h2\b[^>]*>(.*?)</h2>',article,re.S)];check(source_headings.count('Footnotes & Sources')==1,route+' one visible source section')
   check('/contribute/?page='+('%2Fknowledge%2Fmanikapatna-anchor%2F' if 'manikapatna' in route else '%2Fstories%2Fbahuda-yatra%2F') in actual.links,route+' scoped update link')
   check('public' in plain(article) and 'private contact details' in plain(article),route+' public submission privacy notice')
   report['routes'][-1].update(article_sha256=sha(article.encode()),manual_markers=len(labels),unique_source_labels=len(set(labels)))
  except Exception as e:report['failures'].append(route+': '+repr(e))
 for x in c['bahuda_incoming']:
  try:
   html=capture(x['route']);check(x['expected_link'] in Page(html).links,x['route']+' retains Bahuda incoming link')
  except Exception as e:report['failures'].append(x['route']+': '+repr(e))
 check(len(report['routes'])==4,'Four supplemental route captures')
 report['status']='FAIL' if report['failures'] else 'PASS_SCOPED_SOURCE_ASSERTIONS'
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--expected-merge',required=True);p.add_argument('--deployment-run',required=True,type=int);p.add_argument('--deployment-evidence',required=True);args=p.parse_args()
 try:main(args)
 except Exception as e:report['status']='FAIL';report['error']=repr(e)
 finally:
  if RUN:
   with (RUN/'http.json').open('x') as f:json.dump(report,f,indent=2,ensure_ascii=False);f.write('\n')
  print(json.dumps({'status':report['status'],'raw_directory':str(RUN) if RUN else None,'failures':report['failures'],'error':report.get('error')}))
 raise SystemExit(1 if report['status']=='FAIL' else 0)
