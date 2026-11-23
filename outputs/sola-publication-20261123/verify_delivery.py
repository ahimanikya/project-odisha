"""Dated delivery verification: fetch actual image URLs; never assume local variant hashes."""
import argparse,hashlib,json,pathlib,re,urllib.request
from html.parser import HTMLParser
p=argparse.ArgumentParser();p.add_argument('--base');p.add_argument('--output',required=True);a=p.parse_args()
root=pathlib.Path('projects/site/dist-publish');out=pathlib.Path(a.output);out.parent.mkdir(parents=True,exist_ok=True)
routes=['/stories/sola-and-odissi-tahia/','/stories/odissi-abhinaya/','/books/odisha-culture-memory-and-living-traditions/silver-metal-clay-stone-and-applique/']
routes.append('/stories/jhulana-in-odisha/')
sha=lambda b:hashlib.sha256(b).hexdigest()
def get(path):
 if not a.base:return (root/path.lstrip('/')).read_bytes(),None
 with urllib.request.urlopen(urllib.request.Request(a.base.rstrip('/')+path,headers={'User-Agent':'ProjectOdisha-delivery-verification/1.0'}),timeout=60) as r:return r.read(),r.status
class Images(HTMLParser):
 def __init__(self):super().__init__();self.items=[]
 def handle_starttag(self,tag,attrs):
  if tag=='img':
   d=dict(attrs);variants={}
   for x in d.get('srcset','').split(','):
    bits=x.strip().split()
    if bits:variants[bits[1] if len(bits)>1 else 'unsized']=bits[0]
   self.items.append({'src':d.get('src'),'alt':d.get('alt'),'variants':variants})
def parse(s):
 p=Images();p.feed(s);return p.items
res={'base':a.base or str(root),'routes':[],'images':[],'limits':'HTTP/content/file comparisons only; browser, pixel and visual checks are separate.'};seen=set()
for route in routes:
 raw,status=get(route+'index.html');html=raw.decode();local=(root/(route.lstrip('/')+'index.html')).read_text();article=re.search(r'<article\b[\s\S]*?</article>',html).group();loc=re.search(r'<article\b[\s\S]*?</article>',local).group();li=parse(loc);ri=parse(article);assert len(li)==len(ri),(route,len(li),len(ri))
 mapped=article;maps=[]
 for left,right in zip(li,ri):
  assert left['alt']==right['alt'],(route,'alt mismatch')
  pairs=[(left['src'],right['src'])]+[(u,right['variants'][w]) for w,u in left['variants'].items()]
  for lp,rp in pairs:
   if lp!=rp:maps.append({'local':lp,'delivered':rp});mapped=mapped.replace(rp,lp)
   if (lp,rp) in seen:continue
   seen.add((lp,rp));b,st=get(rp);lb=(root/lp.lstrip('/')).read_bytes();item={'path':rp,'local_path':lp,'http_status':st,'bytes':len(b),'sha256':sha(b),'matches_local':b==lb}
   if b!=lb:
    q=out.parent/'media'/pathlib.Path(rp).name;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(b);item['saved_delivered_file']=str(q)
   res['images'].append(item)
 item={'route':route,'http_status':status,'bytes':len(raw),'article_sha256':sha(article.encode()),'article_exact':article==loc,'article_matches_with_observed_image_urls':mapped==loc,'observed_image_url_pairs':maps}
 if route==routes[0]:
  item.update({'one_h1':len(re.findall('<h1\\b',article))==1,'byline':'By Ahimanikya Satapathy' in re.sub('<[^>]+>','',article),'notes':len(re.findall('id="user-content-fn-[0-9]+"',article)),'photo_credit':'Prakriti Panda' in article and 'https://creativecommons.org/licenses/by-sa/4.0/' in article,'alteration_note':'Resized and compressed for web display.' in article,'sharing_image':'https://projectodisha.org/images/stories/sola-tahia.webp' in html,'outgoing_links':all(r in article for r in routes[1:3])});(out.parent/'article.html').write_text(html)
 elif route in routes[1:3]:item['incoming_link_count']=article.count('href="'+routes[0]+'"')
 res['routes'].append(item)
res['status']='PASS' if all(x['article_exact'] for x in res['routes']) and all(x['matches_local'] for x in res['images']) and all(x.get('incoming_link_count',1)==1 for x in res['routes'][:3]) and all(res['routes'][0][k] for k in ['one_h1','byline','photo_credit','alteration_note','sharing_image','outgoing_links']) and res['routes'][0]['notes']==4 else 'REVIEW_DIFFERENCES'
out.write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n');print(res['status'],len(res['routes']),'routes',len(res['images']),'images')
