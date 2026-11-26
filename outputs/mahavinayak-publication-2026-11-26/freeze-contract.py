"""Freeze actual article/release inputs; not proof of build or review."""
import hashlib,json,re,subprocess
from pathlib import Path
O=Path(__file__).resolve().parent;R=O.parents[1]
H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
J=lambda p:json.loads(p.read_text())
article='kb/research/places/mahavinayak-article.md';im='kb/research/places/mahavinayak-image.json'
changed=subprocess.check_output(['git','diff','--name-only','aace6c370'],cwd=R,text=True).splitlines()
paths=[p for p in changed if p.startswith('projects/site/') or p== 'kb/reference/public-website-routes.json']
paths += [article,im,'projects/site/src/pages/destinations/mahavinayak.astro','projects/site/public/images/destinations/mahavinayak-temple-kamalakanta777.webp','projects/site/tools/storage-copy.mjs','projects/site/tools/build-publication.mjs','projects/site/tools/prepare-search-review.mjs','projects/site/src/pages/destinations/hills.astro','projects/site/src/pages/destinations/index.astro','projects/site/src/pages/explore.astro']
paths=sorted(set(paths));text=(R/article).read_text().split('---',2)[2].strip();body=text.split('\n[^',1)[0];refs=re.findall(r'\[\^([^]]+)\]',body)
paragraphs=[re.sub(r'\[\^[^]]+\]','',p).replace('*','') for p in body.split('\n\n') if p and not p.startswith('#')]
sources=J(O/'research/source-manifest.json')['sources'];urls=[s['url'] for s in sources]+[s['related_url'] for s in sources if 'related_url' in s]
c={'status':'FROZEN_EXPECTATIONS_ONLY','base':'aace6c370ee19906a5aec4b2b44917945e5ca8fd','route':'/destinations/mahavinayak/','manuscript':article,'manuscript_sha256':H(R/article),'source_hashes':{p:H(R/p) for p in paths},'paragraphs':paragraphs,'references':len(refs),'unique_notes':len(set(refs)),'source_urls':list(dict.fromkeys(urls)),'reading_routes':['/destinations/olasuni/','/destinations/kapilash/','/destinations/hills/'],'image_record':im,'image':J(R/im),'variant_dimensions':[[480,360],[960,720],[1200,900]],'dhaga_descriptor':J(R/'projects/odia-dhaga/pdf-delivery.json'),'protected_manifest':str((O/'protected-preparation.json').relative_to(R)),'protected_manifest_sha256':H(O/'protected-preparation.json'),'capacity':J(O/'capacity/proposal.json'),'limits':'Source expectations only. Kaincha and Godabarish remain unpublished and excluded from dedicated export; Kula is already published.'}
(O/'reviewed-article-contract.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n');print('Frozen',len(paths),'paths;',len(refs),'references')
