"""Check final local publication artifacts; no build or publication side effects."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import json,re,hashlib,subprocess
OUT=Path(__file__).resolve().parent; ROOT=OUT.parents[1]; SITE=ROOT/'projects/site'
BASE='82267ea4268b2690ee9a72204e3fca23a4f3d351'; ROUTE='/stories/jhoti-chita/'; IMAGE='/assets/jhoti/gurubara-jhoti-1200.webp'
sha=lambda b:hashlib.sha256(b).hexdigest()
report={'status':'RUNNING','checks':[],'editions':{},'limits':'Local artifact verification; separate source, browser, hosted and live review required.'}
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.images=[];self.meta={}
 def handle_starttag(self,t,a):
  d=dict(a)
  if 'id'in d:self.ids.append(d['id'])
  if t=='a':self.links.append(d.get('href',''))
  if t=='img':self.images.append(d)
  if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
def parse(s):p=Page();p.feed(s);return p
def plain(s):return ' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
def check(ok,label):
 if not ok:raise AssertionError(label)
 report['checks'].append(label)
def main():
 stages=json.loads((OUT/'build-results.json').read_text());check(len(stages)==13 and all(x['exit_code']==0 for x in stages),'All 13 build/test/audit stages passed')
 canonical=ROOT/'kb/research/culture/jhoti-chita.md';check(sha(canonical.read_bytes())=='836a0685e258a1dbc4de6bc24ec3d9f1b2e7c39fcd3caa644ef7dd39a07f0eea','Exact reviewed original manuscript')
 check(all(x['manuscript_sha256']==sha(canonical.read_bytes()) for x in stages),'Every stage used exact manuscript')
 variants=next(x['variants'] for x in json.loads((SITE/'.astro/responsive-image-report.json').read_text())['images'] if x['src']==IMAGE)
 check([x['width'] for x in variants]==[480,960,1200],'Three expected responsive widths')
 fragments=[]
 for edition in ['dist','dist-coast','dist-publish']:
  base=SITE/edition;html=(base/ROUTE.strip('/')/'index.html').read_text();p=parse(html)
  body=re.search(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',html,re.S).group();fragments.append(body)
  check(len(p.ids)==len(set(p.ids)),edition+' unique IDs')
  refs=[x for x in p.links if x.startswith('#user-content-fn-')];returns=[x for x in p.links if x.startswith('#user-content-fnref-')]
  check(len(refs)==6 and len(set(refs))==4 and len(returns)==6 and all(x[1:] in p.ids for x in refs+returns),edition+' 6 references, 4 notes and 6 resolving returns')
  for value in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update','Prateek Pattanaik','CC BY-SA 4.0','official Commons preview']:check(value in plain(body),edition+' visible '+value)
  for key in ['og:image','twitter:image']:check(p.meta.get(key)=='https://projectodisha.org'+IMAGE,edition+' '+key)
  hero=next(x for x in p.images if x.get('src')==IMAGE)
  check([hero.get(k)for k in ['width','height','loading','fetchpriority']]==['1200','900','eager','high'],edition+' full-frame hero dimensions/loading')
  check(bool(hero.get('alt')),edition+' informative hero alt')
  check({int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}=={v['width']:v['src']for v in variants},edition+' emitted responsive set')
  check(sha((base/IMAGE.lstrip('/')).read_bytes())=='7a3f7094998bcdc8c6f52a31caba2b4ea8bd31b72716d382a14464a939138d84',edition+' reviewed base photograph exact')
  for v in variants:check(sha((base/v['src'].lstrip('/')).read_bytes())==v['sha256'],edition+' exact responsive '+str(v['width']))
  for incoming in ['culture/osha/manabasa-gurubara','culture/osha','stories/craft-listening']:
   h=(base/incoming/'index.html').read_text();q=parse(h)
   cards=re.findall(r'<article\b[^>]*class="[^"]*jhoti-reading-card[^>]*>.*?</article>',h,re.S)
   check(len(cards)==1 and ROUTE in parse(cards[0]).links and any(x.get('src')==IMAGE for x in parse(cards[0]).images),edition+' credited incoming preview '+incoming)
   check('Prateek Pattanaik' in h and 'https://creativecommons.org/licenses/by-sa/4.0/' in q.links and '#jhoti-photo-source' in q.links and 'jhoti-photo-source'in q.ids,edition+' incoming credit and note '+incoming)
  for href in parse(body).links:
   if href.startswith('/') and '?' not in href and '#'not in href:check((base/href.strip('/')/'index.html').is_file(),edition+' local reading target '+href)
  report['editions'][edition]={'fragment_sha256':sha(body.encode()),'variants':variants}
 check(len(set(fragments))==1,'Exact article fragment across all three editions')
 (OUT/'reviewed-article-fragment.html').write_text(fragments[-1])
 # Originals and previously completed preparation remain unchanged.
 preserved=[]
 for record in ['antaranga-after-tensa-preparation-20261124','antaranga-after-belghar-preparation-20261123']:
  d=json.loads((ROOT/'kb/records'/f'{record}.json').read_text())
  for x in d['delivery_files']+[d['completion_record_review']]:
   path=x.get('path',x.get('record'));check(sha((ROOT/path).read_bytes())==x['sha256'],'Preserved '+path);preserved.append({'path':path,'sha256':x['sha256']})
 (OUT/'preserved-preparation.json').write_text(json.dumps(preserved,indent=2)+'\n')
 old=json.loads(subprocess.check_output(['git','show',BASE+':kb/team/operations.json'],cwd=ROOT));new=json.loads((ROOT/'kb/team/operations.json').read_text())
 for key in ['current_task','handoff_home']:check(old[key]==new[key],'Foreign ownership '+key)
 png=json.loads((SITE/'.astro/publication-png-optimization.json').read_text());jpeg=json.loads((SITE/'.astro/publication-jpeg-optimization.json').read_text())
 selected=[]
 for path,data in [('assets/nimuhi/user-supplied-memorial.png',png),('assets/cultural-book/author.png',png),('images/destinations/taptapani-worship.jpg',jpeg)]:
  item=next(x for x in data['files'] if x['path']==path);selected.append(item)
  src=(SITE/'public'/path).read_bytes();check(src==(SITE/'dist-coast'/path).read_bytes(),'Source/coastal original exact '+path)
  check(sha(src)==item['source_sha256'] and sha((SITE/'dist-publish'/path).read_bytes())==item['output_sha256'],'Measured delivery '+path)
 tapt=(SITE/'dist-publish/destinations/taptapani/index.html').read_text();tp=parse(tapt)
 check('Full-frame photograph, resized and compressed for web delivery.'in tapt and 'Ilya Mauter'in tapt and 'CC BY 3.0'in tapt,'Taptapani truthful transform and creator/licence preserved')
 check(tp.meta['og:image:width']=='1600' and tp.meta['og:image:height']=='1200','Taptapani share dimensions updated')
 for edition in ['dist-coast','dist-publish']:
  for f in (SITE/edition).rglob('*'):
   if f.is_file() and f.suffix in ['.html','.md','.txt','.json']:
    content=f.read_text(errors='replace');check(not any(x in content for x in ['golden-grass-square-box.jpg','Golden grass takes its name from the lustre of the dried material.','gurubara-jhoti-commons-1920.jpg','journal-technique-pdf118.png']),edition+' internal export exclusion '+str(f.relative_to(SITE/edition)))
 files=[p for p in (SITE/'dist-publish').rglob('*')if p.is_file()];total=sum(p.stat().st_size for p in files);check(total<1000000000,'Actual local package below decimal GB limit')
 report.update(status='PASS',payload={'bytes':total,'files':len(files),'remaining_bytes':1000000000-total},capacity=selected)
try:main()
except Exception as e:report.update(status='FAIL',error=str(e));raise
finally:(OUT/'local-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':len(report['checks']),'payload':report.get('payload')}))
