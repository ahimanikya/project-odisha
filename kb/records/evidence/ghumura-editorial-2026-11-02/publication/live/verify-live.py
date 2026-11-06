#!/usr/bin/env python3
"""Prepare from final artifacts; explicitly authorized successful deployment required for HTTP."""
import argparse,json,hashlib,re,subprocess,sys
from pathlib import Path
from datetime import datetime,timezone
from html.parser import HTMLParser
P=Path(__file__).resolve().parent;E=P.parent;ROOT=E.parents[1];R=ROOT/'planning/utkala-odisha/checkouts/utkal-fieldwork-pack';ID='reading:stories/ghumura';ROUTE='/stories/ghumura/';SCHEMA=R/'kb/research/culture/ghumura-website.json'
sha=lambda b:hashlib.sha256(b).hexdigest()
norm=lambda t:' '.join(t.split())
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.stack=[];self.ps=[];self.p=None;self.notes={};self.note=None;self.text=[];self.ids=[];self.links=[];self.scripts=[];self.save=[];self.robots=[];self.skip=0
 def handle_starttag(self,t,attrs):
  a=dict(attrs);skip=t=='sup' or 'footnote-returns'in a.get('class','').split();self.stack.append((t,skip)) if t not in ['meta','link','img','br','input','hr','source'] else None
  if skip:self.skip+=1
  if 'id'in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='script'and'src'in a:self.scripts.append(a['src'])
  if t=='meta'and a.get('name')=='robots':self.robots.append(a.get('content'))
  if 'data-save-journey'in a:self.save.append(a['data-save-journey'])
  if t=='p':self.p=[]
  if t=='li'and a.get('id','').startswith('note-'):self.note=a['id'];self.notes[self.note]=[]
 def handle_data(self,d):
  self.text.append(d)
  if not self.skip:
   if self.p is not None:self.p.append(d)
   if self.note:self.notes[self.note].append(d)
 def handle_endtag(self,t):
  if t=='p'and self.p is not None:self.ps.append(norm(''.join(self.p)));self.p=None
  if t=='li':self.note=None
  if self.stack and self.stack[-1][0]==t:
   _,skip=self.stack.pop();self.skip-=int(skip)
def catalog(t):
 prefix="document.getElementById('journey-data').textContent=";assert t.startswith(prefix),'Unexpected catalog serialization';return json.loads(json.loads(t[len(prefix):].strip().removesuffix(';')))
def parse(html):p=Page();p.feed(html);return p
def inspect(html,story):
 p=parse(html);body=[v for b in story['blocks']for v in b['paragraphs']];assert len(body)==11
 for v in [story['lead']]+body:assert p.ps.count(norm(v))==1,('Paragraph mismatch',v)
 assert len(story['sources'])==5 and len(p.notes)==5
 refs=[]
 for bi,b in enumerate(story['blocks'],1):
  for pi,ids in enumerate(b['paragraph_source_ids']):
   for sid in ids:refs.append(f'ref-story-section-{bi}-{pi}-{sid}')
 for ref in refs:assert p.ids.count(ref)==1 and p.links.count('#'+ref)==1,ref
 for s in story['sources']:
  assert norm(''.join(p.notes['note-'+s['id']]))==norm(s['footnote_text']),s['id']
  for link in s['footnote_links']:assert link['href']in p.links
 assert 'By '+story['author'] in norm(''.join(p.text));assert p.save.count(ID)==1
 assert p.robots==['noindex, follow'];assert '/sounds-of-odisha/'in p.links
 return p,refs
def itemcheck(data,story):
 items=data['catalog'];assert len({x['id']for x in items})==len(items)
 item=next(x for x in items if x['id']==ID);assert item['author']==story['author'] and item['summary']==story['lead']
 expected=[p for b in story['blocks']for p in b['paragraphs']]+[s['footnote_text']for s in story['sources']]
 assert [p for section in item['practical']for p in section['paragraphs']]==expected
 assert item['sources']==[{'title':x['text'],'url':x['href']}for s in story['sources']for x in s['footnote_links']]
 return item
def edition_baseline(base, edition, manifest):
 ep=Path(edition).resolve();rel=ep.relative_to(R).as_posix();current=json.loads(ep.read_text())
 original=json.loads(subprocess.check_output(['git','-C',str(R),'show',manifest['base']+':'+rel],text=True))
 assert set(current['journey_ids'])==set(original['journey_ids'])|{ID}, 'Unexpected edition selection change'
 assert current['href_overrides']==original['href_overrides'], 'Edition href overrides changed'
 assert ID not in {x['id']for x in base['catalog']}
 old={x['id']:dict(x) for x in base['catalog']if x['id']in current['journey_ids']}
 for key,value in current['href_overrides'].items():
  if key in old:old[key]['href']=value
 assert len(old)==112
 return old
def validate(e):
 assert re.fullmatch('[0-9a-f]{40}',e['candidate_head'])
 m=Path(e['manifest_path']);assert sha(m.read_bytes())==e['manifest_sha256'];v=json.loads(m.read_text());assert v['head']==e['candidate_head']and v['files']
 assert sha(SCHEMA.read_bytes())==e['schema_sha256'];assert e['story']==json.loads(SCHEMA.read_text())
 assert sha(Path(e['baseline_catalog']).read_bytes())==e['baseline_catalog_sha256']
 base=json.loads(Path(e['baseline_catalog']).read_text());assert sha(Path(e['edition_path']).read_bytes())==e['edition_sha256'];old=edition_baseline(base,e['edition_path'],v);new={x['id']:x for x in e['catalog']['catalog']if x['id']!=ID};assert old==new and len(old)==e['sibling_count']>0;itemcheck(e['catalog'],e['story'])
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--prepare',action='store_true');ap.add_argument('--live',action='store_true');ap.add_argument('--manifest');ap.add_argument('--site');ap.add_argument('--baseline-catalog');ap.add_argument('--edition');ap.add_argument('--deployment-status');ap.add_argument('--deployed-head');args=ap.parse_args()
 if not(args.prepare or args.live):ap.error('Require --prepare, or explicit --live only after successful deployment authorization.')
 assert not(args.prepare and args.live)
 if args.prepare:
  assert args.manifest and args.site and args.baseline_catalog and args.edition
  m=Path(args.manifest).resolve();manifest=json.loads(m.read_text());assert re.fullmatch('[0-9a-f]{40}',manifest['head'])and manifest['files']
  story=json.loads(SCHEMA.read_text());reviewed=json.loads((E/'anvesha/ghumura-website.json').read_text());assert all(story[k]==reviewed[k] for k in ['blocks','sources','author','lead']), 'Reviewed prose/source drift'
  site=Path(args.site);html=(site/'stories/ghumura/index.html').read_text();page,refs=inspect(html,story)
  scripts=[x for x in page.scripts if re.fullmatch(r'/assets/journey-data-[0-9a-f]+\.js',x)];assert len(scripts)==1
  data=catalog((site/scripts[0].lstrip('/')).read_text());item=itemcheck(data,story)
  bp=Path(args.baseline_catalog).resolve();base=json.loads(bp.read_text());old=edition_baseline(base,args.edition,manifest);new={x['id']:x for x in data['catalog']if x['id']!=ID};assert old and old==new,'Non-Ghumura catalog drift'
  sitemap=(site/'sitemap.xml').read_text();assert ROUTE not in sitemap
  holds=R/'projects/site/editions/search-candidate.json';assert ROUTE in holds.read_text()
  e={'edition_path':str(Path(args.edition).resolve()),'edition_sha256':sha(Path(args.edition).read_bytes()),'candidate_head':manifest['head'],'manifest_path':str(m),'manifest_sha256':sha(m.read_bytes()),'story':story,'schema_sha256':sha(SCHEMA.read_bytes()),'catalog':data,'article_item':item,'baseline_catalog':str(bp),'baseline_catalog_sha256':sha(bp.read_bytes()),'sibling_count':len(old),'search_hold_sha256':sha(holds.read_bytes()),'built_sitemap_sha256':sha(sitemap.encode()),'built_article_sha256':sha(html.encode()),'expected_refs':refs}
  validate(e);(P/'expected.json').write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n');print('Prepared; no HTTP requests');return
 assert args.deployment_status and re.fullmatch('[0-9a-f]{40}',args.deployed_head or ''),'Actual deployment evidence required'
 e=json.loads((P/'expected.json').read_text());validate(e);dp=Path(args.deployment_status);d=json.loads(dp.read_text());assert d['status']=='completed'and d['conclusion']=='success'and d['headSha']==args.deployed_head and d['databaseId']
 assert __import__('os').environ.get('RUN_AUTHORIZED_LIVE')=='1','Explicit execution authorization required'
 captures=P/'captures';captures.mkdir(exist_ok=True);log=[]
 def get(path,name):
  f=captures/name;r=subprocess.run(['curl','-fLsS','--connect-timeout','10','--max-time','40','-H','Cache-Control: no-cache','-o',str(f),'-w','%{http_code}','https://projectodisha.org'+path],capture_output=True,text=True,timeout=45);row={'url':'https://projectodisha.org'+path,'exit':r.returncode,'status':r.stdout,'stderr':r.stderr};log.append(row);(P/'http-attempts.json').write_text(json.dumps(log,indent=2));assert r.returncode==0 and r.stdout=='200',row;row['sha256']=sha(f.read_bytes());return f.read_text()
 page,refs=inspect(get(ROUTE,'article.html'),e['story']);paths=[x for x in page.scripts if re.fullmatch(r'/assets/journey-data-[0-9a-f]+\.js',x)];assert len(paths)==1
 data=catalog(get(paths[0],'journey-data.js'));assert data==e['catalog'];itemcheck(data,e['story']);assert ROUTE not in get('/sitemap.xml','sitemap.xml')
 explore=parse(get('/explore/','explore.html'));assert ROUTE in explore.links
 result={'status':'PASS','checked_at':datetime.now(timezone.utc).isoformat(),'candidate_head':e['candidate_head'],'deployed_head':args.deployed_head,'deployment_id':d['databaseId'],'deployment_status_sha256':sha(dp.read_bytes()),'expected_sha256':sha((P/'expected.json').read_bytes()),'checks':{'body_paragraphs':11,'lead':1,'complete_notes':5,'unique_references_and_returns':len(refs),'byline_save_id':True,'portable_complete_paragraphs_and_notes':16,'unchanged_non_ghumura_catalog_items':e['sibling_count'],'entire_catalog_exact':True,'noindex_follow_and_sitemap_exclusion':True,'explore_link':True},'http':log,'limits':['Whitespace normalized; superscript citation numbers and footnote-return text excluded before exact comparisons. No complete HTML byte-identity claim.','HTTP/source semantics only; browser interactions/download UI require separate review.','No live verification of all Dhaga assets or original research claims.']};(P/'live-http-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(result['checks'])
if __name__=='__main__':main()
