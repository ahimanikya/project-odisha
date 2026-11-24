"""Read the deployed Tensa article, its incoming previews and actual image URLs."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib, json, re, subprocess

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
LOCAL=ROOT/'projects/site/dist-publish'
ORIGIN='https://projectodisha.org'
ROUTE='/destinations/tensa/'
sha=lambda b:hashlib.sha256(b).hexdigest()
report={'status':'RUNNING','routes':[],'images':[],'differences':[],'checks':[],'limitations':'HTTP delivery checks; image differences require separate decoded and visual review. Browser interactions recorded separately.'}

class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.links=[];self.imgs=[];self.meta={}
    def handle_starttag(self,t,a):
        d=dict(a)
        if 'id' in d:self.ids.append(d['id'])
        if t=='a':self.links.append(d.get('href',''))
        if t=='img':self.imgs.append(d)
        if t=='meta':self.meta[d.get('property',d.get('name',''))]=d.get('content')
def parse(s):p=Page();p.feed(s);return p
def fragment(s):return re.search(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',s,re.S).group()
def plain(s):return ' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
def check(ok,label):
    if not ok:raise AssertionError(label)
    report['checks'].append(label)
def fetch(url,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    status=subprocess.check_output(['curl','-sS','-L','--fail','--max-time','60','--retry','2','-o',str(path),'-w','%{http_code}',url],text=True)
    check(status=='200','HTTP200 '+url);return path.read_bytes()
def variants(i):return {int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',i.get('srcset',''))}
def main():
    im=json.loads((ROOT/'kb/research/destinations/tensa-image.json').read_text())
    contract=json.loads((OUT/'reviewed-article-contract.json').read_text())
    check(sha((ROOT/'kb/research/places/tensa-article.md').read_bytes())==contract['manuscript_sha256'],'Reviewed manuscript preserved at live verification')
    images={};substitutions={}
    for route in [ROUTE,'/destinations/hills/','/destinations/','/explore/']:
        dest=OUT/'live'/route.strip('/')/'index.html';b=fetch(ORIGIN+route,dest);h=b.decode();p=parse(h)
        check(len(p.ids)==len(set(p.ids)),route+': unique IDs')
        expected_page=parse((LOCAL/route.strip('/')/'index.html').read_text())
        check(p.meta.get('robots')==expected_page.meta.get('robots'),route+': exact reviewed search policy')
        if route==ROUTE:check(p.meta.get('robots','').replace(' ','')=='noindex,follow','New article retains search hold')
        if route==ROUTE:
            actual=fragment(h);expected=fragment((LOCAL/route.strip('/')/'index.html').read_text())
            ap=parse(actual);ep=parse(expected)
            refs=[x for x in ap.links if x.startswith('#user-content-fn-')];returns=[x for x in ap.links if x.startswith('#user-content-fnref-')]
            check(len(refs)==contract['references'] and len(set(refs))==contract['unique_notes'] and len(returns)==contract['returns'] and all(x[1:] in p.ids for x in refs+returns),'Live native references and returns resolve')
            for text in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update',im['caption'],im['creator'],im['license'],im['changes']]:check(text in plain(actual),'Live '+text)
            for k in ['og:image','twitter:image']:check(p.meta.get(k)==ORIGIN+im['src'],'Live '+k)
            check(len(ap.imgs)==len(ep.imgs),'Live/local article image count')
            for ai,ei in zip(ap.imgs,ep.imgs):
                check(ai.get('src')==ei.get('src'),'Article base image identity '+str(ai.get('src')))
                src=ai['src'];images[src]=src
                av=variants(ai);ev=variants(ei);check(set(av)==set(ev),'Observed responsive width parity '+src)
                for w,u in av.items():
                    images[u]=ev[w]
                    if u!=ev[w]:substitutions[ev[w]]=u
            normalized=expected
            for old,new in substitutions.items():normalized=normalized.replace(old,new)
            check(normalized==actual,'Live article exact except recorded responsive URL substitutions')
            report['article_fragment']={'live_sha256':sha(actual.encode()),'local_sha256':sha(expected.encode()),'substitutions':substitutions,'normalized_match':True}
        else:
            cards=[c for c in re.findall(r'<article\b[^>]*>.*?</article>',h,re.S) if 'href="'+ROUTE+'"' in c]
            check(len(cards)==1,route+': exactly one Tensa preview')
            check(any(i.get('src')==im['src'] for i in parse(cards[0]).imgs),route+': actual Tensa photograph in preview')
            local_html=(LOCAL/route.strip('/')/'index.html').read_text()
            local_cards=[c for c in re.findall(r'<article\b[^>]*>.*?</article>',local_html,re.S) if 'href=\"'+ROUTE+'\"' in c]
            check(len(local_cards)==1 and plain(cards[0])==plain(local_cards[0]),route+': exact reviewed card text')
            actual_imgs=parse(cards[0]).imgs;local_imgs=parse(local_cards[0]).imgs
            check(len(actual_imgs)==len(local_imgs),route+': card image count')
            for ai,ei in zip(actual_imgs,local_imgs):
                check(ai.get('src')==ei.get('src') and ai.get('alt')==ei.get('alt'),route+': card image identity and alt')
                images[ai['src']]=ei['src'];av=variants(ai);ev=variants(ei)
                check(set(av)==set(ev),route+': card responsive widths')
                for w,u in av.items():images[u]=ev[w]
            credit=[c for c in re.findall(r'<li\b[^>]*>.*?</li>',h,re.S) if im['source'] in unescape(c)]
            check(bool(credit),route+': photograph source credit')
            for v in [im['creator'],im['license_url'],im['changes']]:check(any(v in unescape(c) for c in credit),route+': preview credit '+v)
        report['routes'].append({'route':route,'file':str(dest.relative_to(ROOT)),'sha256':sha(b),'status':200})
    for n,(url,local_url) in enumerate(images.items()):
        path=OUT/'live/images'/(str(n)+Path(url).suffix);b=fetch(ORIGIN+url,path);local=LOCAL/local_url.lstrip('/');lb=local.read_bytes();same=b==lb
        if '/images/responsive/' in url:check(Path(url).name.split('-')[0]==sha(b)[:16],'Live responsive filename hash '+url)
        row={'url':url,'local_url':local_url,'file':str(path.relative_to(ROOT)),'bytes':len(b),'sha256':sha(b),'local_file':str(local.relative_to(ROOT)),'local_sha256':sha(lb),'byte_match':same};report['images'].append(row)
        if not same:report['differences'].append(row)
        if url==im['src']:check(sha(b)==im['original']['sha256'],'Live original photograph exact')
    report['status']='REVIEW_DIFFERENCES' if report['differences'] else 'PASS'

if __name__=='__main__':
    try:main()
    except Exception as exc:report['status']='FAIL';report['error']=repr(exc);raise
    finally:
        (OUT/'live-verification.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'status':report['status'],'routes':len(report['routes']),'images':len(report['images']),'differences':len(report['differences']),'error':report.get('error')}))
