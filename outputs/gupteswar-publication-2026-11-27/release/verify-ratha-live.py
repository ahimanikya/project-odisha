"""Read-only Ratha/CSS supplement. Requires successful exact-head deployment evidence.

Writes fresh HTTP evidence only under a new /private/tmp run directory. Does not
build, publish, modify the checkout, or infer a foreign article's factual approval.
"""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit
from datetime import datetime, timezone

DEFAULT_ROOT='/Users/ahimanikya/.codex/worktrees/odisha-hill-destinations/publication-checkout'
REVIEWED='202d8dff762033f57e16e1e6fbbb190b1441b212'
RATHA_MERGE='edd54a121262581f2965807d321ecad867b74d7f'
ORIGIN='https://projectodisha.org'
ROUTE='/stories/ratha-yatra/'
ROUTES=[ROUTE,'/stories/snana-purnima/','/stories/the-year-that-feeds-us/']
CSS_ORDER=['0c13bb31666646ca03617a37bef3e002cfb701ee810c491d7a8a81a714ed6d03','e60ee5ef5c6dc23cabdc3a38b47dde84923d79070fd109b1b548622328f113e9']
SOURCE_PATHS=['kb/research/culture/ratha-yatra.md','projects/site/src/pages/stories/ratha-yatra.astro','projects/site/src/pages/stories/snana-purnima.astro','projects/site/src/pages/stories/the-year-that-feeds-us/index.astro','projects/site/tools/shared-reading-styles.mjs']
H=lambda b:hashlib.sha256(b).hexdigest()
report={'status':'PRECONDITIONS','checks':[],'pages':[],'stylesheets':[],'differences':[],'limits':['This is a bounded source-text, link and exact stylesheet-byte check; separate desktop/mobile visual and interaction review remains required.','Historical coastal Snana HTML supplies only the two independently reviewed unchanged CSS byte strings; it is not represented as a fresh combined build.','Without an explicitly supplied fresh artifact, full Ratha wrapper HTML equivalence is untested; manuscript paragraphs, headings, notes and links are checked separately.','No foreign factual re-review, image review or publication approval inferred. All raw HTTP pages and stylesheet responses retained; no HTML/CSS rewriting for acceptance.']}
RUN=None

def check(ok,label):
    if not ok:raise AssertionError(label)
    report['checks'].append(label)

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.ids=[];self.links=[];self.css=[];self.parts=[];self.feed(text)
    def handle_starttag(self,t,a):
        a=dict(a)
        if 'id' in a:self.ids.append(a['id'])
        if t=='a':self.links.append(a.get('href',''))
        if t=='link' and a.get('rel')=='stylesheet':self.css.append(a.get('href',''))
    def handle_data(self,data):self.parts.append(data)

def plain(html):return ' '.join(''.join(Page(html).parts).split())
def md_plain(text):
    text=re.sub(r'<sup\b[^>]*>.*?</sup>','',text,flags=re.S)
    text=re.sub(r'\[([^]]+)\]\(([^)]*)\)',lambda m:m[1],text)
    return plain(text.replace('*',''))
def primary(html):
    a=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',html,re.S)
    check(len(a)==1,'One Ratha article');return a[0]

def fetch(path,name,limit=8_000_000):
    u=urlsplit(path);check(not u.scheme and not u.netloc and path.startswith('/') and not u.query and not u.fragment and '..' not in u.path.split('/'),'Bounded same-origin URL '+path)
    req=Request(ORIGIN+path,headers={'User-Agent':'Project-Odisha-Ratha-CSS-verification/1.0','Accept-Encoding':'identity'})
    try:r=urlopen(req,timeout=45)
    except HTTPError as e:r=e
    with r:
        data=r.read(limit+1);http={'requested_url':ORIGIN+path,'final_url':r.url,'status':r.status,'headers':{k:v for k,v in r.headers.items() if k.lower() in ['content-type','content-length','etag','last-modified','cache-control','content-encoding']}}
    p=RUN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
    http.update(file=str(p),bytes=len(data),sha256=H(data),truncated=len(data)>limit)
    p.with_suffix(p.suffix+'.http.json').write_text(json.dumps(http,indent=2)+'\n')
    check(http['status']==200 and http['final_url']==ORIGIN+path,'HTTP200 without unexpected redirect '+path)
    check(len(data)<=limit,'Response limit '+path)
    return data,http

def main(args):
    global RUN
    root=Path(args.root).resolve();contract_path=root/'outputs/gupteswar-publication-2026-11-27/combined-source-contract.json'
    c=json.loads(contract_path.read_text());contract_hash=H(contract_path.read_bytes())
    reviewed_contract=subprocess.check_output(['git','show',REVIEWED+':outputs/gupteswar-publication-2026-11-27/combined-source-contract.json'],cwd=root)
    check(contract_hash==H(reviewed_contract),'Combined contract bytes exactly match reviewed commit')
    dep_path=Path(args.deployment_evidence).resolve();dep=json.loads(dep_path.read_text())
    check(bool(re.fullmatch('[0-9a-f]{40}',args.expected_merge)) and args.deployment_run>0,'Explicit full merge hash and positive deployment run')
    head=dep.get('head_sha',dep.get('headSha',dep.get('head')));run=dep.get('id',dep.get('databaseId',dep.get('run')))
    check(dep.get('status')=='completed' and dep.get('conclusion')=='success' and head==args.expected_merge and str(run)==str(args.deployment_run),'Actual successful deployment matches expected merge and run')
    check(subprocess.run(['git','merge-base','--is-ancestor',REVIEWED,args.expected_merge],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0,'Deployment includes reviewed combined head')
    check(subprocess.run(['git','merge-base','--is-ancestor',RATHA_MERGE,args.expected_merge],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0,'Deployment includes reviewed Ratha merge')
    for path in SOURCE_PATHS:
        check(path in c['source_hashes'],'Relevant source included in combined contract '+path)
        digest=c['source_hashes'][path]
        check(H((root/path).read_bytes())==digest,'Current reviewed source '+path)
        check(H(subprocess.check_output(['git','show',args.expected_merge+':'+path],cwd=root))==digest,'Deployed commit preserves reviewed source '+path)
    css_reference=Path(args.css_reference).resolve() if args.css_reference else root/'projects/site/dist-coast/stories/snana-purnima/index.html'
    ref=css_reference.read_text();head_html=re.search(r'<head\b[^>]*>(.*?)</head>',ref,re.S)[1]
    css_by_hash={H(x.encode()):x.encode() for x in re.findall(r'<style>(.*?)</style>',head_html,re.S)}
    check(all(h in css_by_hash for h in CSS_ORDER),'Both reviewed CSS byte strings available in historical reference')
    artifact=Path(args.artifact_root).resolve() if args.artifact_root else None
    if artifact:
        # The caller's artifact provenance must identify this successful deployment head.
        check(bool(args.artifact_evidence),'Explicit fresh artifact provenance required')
        evidence=json.loads(Path(args.artifact_evidence).read_text())
        check(evidence.get('head_sha')==args.expected_merge and evidence.get('status')=='verified','Artifact manifest explicitly bound to expected merge')
        check(isinstance(evidence.get('files'),dict),'Artifact manifest has per-file SHA256 map')
    RUN=Path('/private/tmp')/('gupteswar-ratha-live-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ'));RUN.mkdir(exist_ok=False)
    report.update(status='RUNNING',reviewed_head=REVIEWED,expected_merge=args.expected_merge,deployment_run=args.deployment_run,deployment_evidence_sha256=H(dep_path.read_bytes()),combined_contract_sha256=contract_hash,css_reference=str(css_reference),css_reference_sha256=H(css_reference.read_bytes()),run_directory=str(RUN))
    md=(root/SOURCE_PATHS[0]).read_text();content=md.split('---',2)[2].strip();text_part,notes=content.split('## Footnotes & Sources',1)
    paragraphs=[md_plain(x) for x in text_part.split('\n\n') if x.strip() and not x.startswith('#')]
    note_lines=[re.sub(r'^\d+\.\s*','',x) for x in notes.splitlines() if re.match(r'^\d+\. ',x)]
    source_hrefs=re.findall(r'\[[^]]+\]\(([^)]*)\)',content)+Page(content).links
    source_ids=Page(content).ids
    title=re.search(r'^title: "(.*)"$',md,re.M)[1]
    style_urls=set();pages={}
    for route in ROUTES:
        raw,http=fetch(route,'pages/'+route.strip('/')+'/index.html');html=raw.decode();p=Page(html);pages[route]=html
        report['pages'].append({'route':route,**http})
        check(len(p.ids)==len(set(p.ids)),route+' uniqueIDs')
        check(not any(x in html for x in ['chakulia-panda','Kaincha: Making with Golden Grass','golden-grass-square-box.jpg']),route+' unpublished preparations absent')
        shared=[x for x in p.css if x.startswith('/assets/reading-style-')]
        for url in shared:check(bool(re.fullmatch(r'/assets/reading-style-[0-9a-f]{64}\.css',url)),'Actual bounded stylesheet URL '+url)
        if route in [ROUTE,'/stories/snana-purnima/']:
            check(shared==['/assets/reading-style-'+h+'.css' for h in CSS_ORDER],route+' exact reviewed shared CSS identity and ordering')
            style_urls.update(shared)
        if route==ROUTE:
            article=primary(html);ap=Page(article)
            actual_paragraphs=[plain(re.sub(r'<sup\b[^>]*>.*?</sup>','',x,flags=re.S)) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',article,re.S)]
            indexes=[]
            for paragraph in paragraphs:
                check(actual_paragraphs.count(paragraph)==1,'Exact unique manuscript paragraph '+paragraph[:45]);indexes.append(actual_paragraphs.index(paragraph))
            check(indexes==sorted(indexes),'Manuscript paragraph order preserved')
            check(title in [plain(x) for x in re.findall(r'<h1\b[^>]*>(.*?)</h1>',article,re.S)],'Exact Ratha title')
            for heading in re.findall(r'^## (.*)$',content,re.M):check(heading in [plain(x) for x in re.findall(r'<h2\b[^>]*>(.*?)</h2>',article,re.S)],'Exact source heading '+heading)
            actual_notes=[plain(x) for x in re.findall(r'<li\b[^>]*>(.*?)</li>',article,re.S)]
            for note in note_lines:check(md_plain(note) in actual_notes,'Exact visible source note '+md_plain(note)[:55])
            for target in source_hrefs:check(target in ap.links,'Source-defined link '+target)
            check(all(i in ap.ids for i in source_ids),'All manuscript reference and note IDs retained')
            check(all(x[1:] in ap.ids for x in ap.links if x.startswith(('#source-','#ref-'))),'All note and return targets resolve')
            for route_link in ['/stories/the-year-that-feeds-us/','/stories/snana-purnima/','/stories/chandan-yatra/','/contribute/?page=%2Fstories%2Fratha-yatra%2F']:check(route_link in ap.links,'Ratha reviewed reading/update link '+route_link)
            check('By Ahimanikya Satapathy' in plain(article),'Reviewed byline present')
            report['ratha_content']={'paragraphs':len(paragraphs),'notes':len(note_lines),'source_ids':len(source_ids),'article_sha256':H(article.encode()),'comparison':'Exact source-derived visible content groups; no arbitrary live HTML substitution'}
        else:
            check(ROUTE in p.links,route+' incoming Ratha link')
            check('Join the deities on the road during Odisha’s chariot festival.' in plain(html),route+' reviewed incoming Ratha description')
        scripts=re.findall(r'<script\b[^>]*>.*?</script>',html,re.S)
        report.setdefault('analytics',[]).append({'route':route,'scripts':[x for x in scripts if re.search(r'analytics|googletagmanager|gtag',x,re.I)],'scope':'separate observation; never removed for equality'})
        if artifact:
            rel=route.strip('/')+'/index.html';b=(artifact/rel).read_bytes();check(H(b)==evidence['files'].get(rel),'Artifact page hash '+route)
            if raw!=b:report['differences'].append({'kind':'raw_page','route':route,'live_sha256':H(raw),'artifact_sha256':H(b),'live_file':http['file'],'artifact_file':str(artifact/rel)})
    for url in sorted(style_urls):
        raw,http=fetch(url,'styles/'+Path(url).name,200_000);h=re.search(r'([0-9a-f]{64})\.css$',url)[1]
        check(H(raw)==h,'Live CSS bytes match content-address '+url)
        check(raw==css_by_hash[h],'Live CSS exact reviewed bytes '+url)
        if artifact:
            rel=url.lstrip('/');b=(artifact/rel).read_bytes();check(H(b)==evidence['files'].get(rel) and b==raw,'Exact fresh-artifact/live CSS '+url)
        report['stylesheets'].append({'url':url,'reviewed_sha256':h,'exact_reviewed_bytes':True,**http})
    check(H(contract_path.read_bytes())==contract_hash,'Combined contract unchanged during capture')
    check(all(H((root/p).read_bytes())==c['source_hashes'][p] for p in SOURCE_PATHS),'Relevant sources unchanged during capture')
    report['status']='REVIEW_DIFFERENCES' if report['differences'] else 'PASS_BOUNDED_SOURCE_AND_CSS'

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--root',default=DEFAULT_ROOT);p.add_argument('--expected-merge',required=True);p.add_argument('--deployment-run',type=int,required=True);p.add_argument('--deployment-evidence',required=True);p.add_argument('--css-reference');p.add_argument('--artifact-root');p.add_argument('--artifact-evidence');args=p.parse_args()
    try:main(args)
    except Exception as e:report['status']='FAIL';report['error']=repr(e);raise
    finally:
        if RUN:(RUN/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({'status':report['status'],'run_directory':str(RUN) if RUN else None,'error':report.get('error'),'checks':len(report['checks'])}))
