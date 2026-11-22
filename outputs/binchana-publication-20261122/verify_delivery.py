"""Verify the four Binchana release routes and its credited delivered images."""
import argparse, hashlib, json, pathlib, re, urllib.request
p=argparse.ArgumentParser();p.add_argument('--base');p.add_argument('--output',required=True);a=p.parse_args()
root=pathlib.Path('projects/site/dist-publish')
routes=['/stories/binchana-and-the-handmade-breeze/','/crafts/pipili-applique/','/books/odisha-culture-memory-and-living-traditions/silver-metal-clay-stone-and-applique/','/books/odisha-culture-memory-and-living-traditions/modern-art-photography-and-public-heritage/']
assets=['/images/stories/binchana-from-odisha.webp','/images/responsive/5358a16ba141b6ae-480.webp','/images/responsive/b0fe97485633ac07-960.webp']
sha=lambda b:hashlib.sha256(b).hexdigest()
def get(path):
 if not a.base:return (root/path.lstrip('/')).read_bytes(),None
 req=urllib.request.Request(a.base.rstrip('/')+path,headers={'User-Agent':'ProjectOdisha-publication-verification/1.0'})
 with urllib.request.urlopen(req,timeout=45) as r:return r.read(),r.status
result={'base':a.base or str(root),'routes':[],'assets':[],'limits':'HTML/article and file integrity checks; visual quality and browser interactions are separate.'}
for route in routes:
 path=route+'index.html';raw,status=get(path);html=raw.decode();local=(root/path.lstrip('/')).read_text();article=re.search(r'<article\b[\s\S]*?</article>',html).group();local_article=re.search(r'<article\b[\s\S]*?</article>',local).group()
 item={'route':route,'http_status':status,'bytes':len(raw),'sha256':sha(raw),'article_sha256':sha(article.encode()),'article_matches_local':article==local_article,'removed_production_phrases_absent':not re.search(r'no generated (?:imagery|elements)',article,re.I)}
 if route==routes[0]:
  item.update({'h1_count':len(re.findall(r'<h1\b',article)),'byline':'By Ahimanikya Satapathy' in re.sub('<[^>]+>','',article),'references':len(re.findall(r'\bid="user-content-fnref-',article)),'notes':len(re.findall(r'\bid="user-content-fn-\d+"',article)),'photo_credit':'Subhashish Panigrahi' in article and 'https://creativecommons.org/licenses/by-sa/3.0/' in article,'alteration_note':'Web version resized and compressed.' in article,'sharing_image':'https://projectodisha.org/images/stories/binchana-from-odisha.webp' in html,'outgoing_routes_present':all(r in article for r in routes[1:])})
 else:item['incoming_link_count']=article.count('href="'+routes[0]+'"')
 result['routes'].append(item)
for asset in assets:
 raw,status=get(asset);local=(root/asset.lstrip('/')).read_bytes();result['assets'].append({'path':asset,'http_status':status,'bytes':len(raw),'sha256':sha(raw),'matches_local':raw==local})
result['status']='PASS' if all(x['article_matches_local'] and x['removed_production_phrases_absent'] for x in result['routes']) and all(x['matches_local'] for x in result['assets']) and all(x.get('incoming_link_count',1)==1 for x in result['routes']) else 'REVIEW_DIFFERENCES'
pathlib.Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(result['status'])
