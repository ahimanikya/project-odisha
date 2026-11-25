"""Record review expectations after source freeze; does not run checks or publish."""
import ast,hashlib,json,re
from pathlib import Path
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
astmod=ast.parse((OUT/'run-checks-combined.py').read_text())
paths=next(ast.literal_eval(n.value) for n in astmod.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='bound_paths' for t in n.targets))
paths += ['projects/site/src/data/discovery.ts', 'projects/site/tools/shared-reading-styles.mjs', 'kb/reference/public-website-routes.json']
article='kb/research/places/olasuni-article.md';image_record='kb/research/places/olasuni-image.json'
s=(ROOT/article).read_text().split('---',2)[2].strip();body=s.split('\n[^',1)[0];refs=re.findall(r'\[\^([^]]+)\]',body)
paragraphs=[re.sub(r'\[\^[^]]+\]','',p).replace('*','') for p in body.split('\n\n') if p and not p.startswith('#')]
# Read verified source URLs from the bounded manifest, not by truncating parentheses in Markdown destinations.
urls=[x['url'] for x in read(OUT/'research/source-manifest.json')['sources']]
proposal=read(OUT/'capacity/proposal.json')['selected'];old=read(ROOT/'outputs/barunei-publication-2026-11-25/reviewed-article-contract.json')['capacity']
cap={k:proposal[k] for k in ['path','page','source','candidate']};cap.update(selected_quality=86,second_path=old['path'],second_source_sha256=old['source']['sha256'],second_delivery_sha256=old['candidate']['sha256'],sharing_path=old['sharing_path'],sharing_source_sha256=old['sharing_source_sha256'],sharing_delivery_sha256=old['sharing_delivery_sha256'])
protected='outputs/olasuni-publication-2026-11-26/protected-preparation.json';descriptor='projects/odia-dhaga/pdf-delivery.json'
c={'status':'FROZEN_EXPECTATIONS_NOT_EXECUTION_RESULT','base':'a8ec2c87a','route':'/destinations/olasuni/','manuscript':article,'manuscript_sha256':sha(ROOT/article),'references':len(refs),'unique_notes':len(set(refs)),'returns':len(refs),'source_hashes':{p:sha(ROOT/p) for p in paths},'paragraphs':paragraphs,'source_urls':urls,'reading_routes':['/destinations/kapilash/','/destinations/saptasajya/','/destinations/hills/'],'image_record':image_record,'image':read(ROOT/image_record),'variant_widths':[480,960,1440],'dhaga_descriptor':read(ROOT/descriptor),'dhaga_descriptor_sha256':sha(ROOT/descriptor),'protected_manifest':protected,'protected_manifest_sha256':sha(ROOT/protected),'protected_count':len(read(ROOT/protected)),'capacity':cap,'limits':'Expectations only, no build/live pass. Historical sources and prior preparations protected; Kula and Kaincha remain unpublished and excluded from dedicated public export.'}
(OUT/'reviewed-article-contract-combined.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
print('Frozen',len(paths),'sources;',len(refs),'references;',len(set(refs)),'notes')
