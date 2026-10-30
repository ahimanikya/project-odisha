from pathlib import Path
import json,hashlib,sys
from pypdf import PdfReader
import pdfplumber
R=Path(__file__).resolve().parents[2]
for edition in ('digital','print'):
 record_path=R/'tmp/pdfs/2026-10-30'/edition/'book-build-2026-10-30.json'
 assert record_path.exists(), record_path
 rec=json.loads(record_path.read_text());path=R/rec['pdf'];pdf=PdfReader(path)
 errors=[];external=[];
 if not rec.get('chapter_page_references_stable',False):errors.append('printed chapter references not stable')
 image_objects=0;destinations=set(pdf.named_destinations);page_ids={p.indirect_reference.idnum for p in pdf.pages};internal_count=0
 for c in rec['chapters']:
  if hashlib.sha256((R/c['source']).read_bytes()).hexdigest()!=c['source_sha256']:errors.append('stale '+c['slug'])
 for i,page in enumerate(pdf.pages):
  def inspect_xobjects(resources):
   global image_objects
   for key,ref in resources.get('/XObject',{}).items():
    obj=ref.get_object()
    if obj is None:errors.append('missing image/form object '+str(i+1)+' '+key);continue
    if obj.get('/Subtype')=='/Image':image_objects+=1
    if obj.get('/Subtype')=='/Form':inspect_xobjects(obj.get('/Resources',{}))
  inspect_xobjects(page.get('/Resources',{}))
  if list(map(float,page.mediabox))[2:] != [432.,648.]:errors.append('page size '+str(i+1))
  for ann in page.get('/Annots',[]):
   annotation=ann.get_object();a=annotation.get('/A',{});uri=str(a.get('/URI',''))
   dest=annotation.get('/Dest') or a.get('/D')
   if dest:
    internal_count+=1
    if isinstance(dest,list) and getattr(dest[0],'idnum',None) not in page_ids:errors.append('invalid internal destination '+str(i+1))
   if uri:
    external.append(uri)
    if '/kb/' in uri or 'file:' in uri or '/blob/main/' in uri:errors.append('nonpublic link '+uri)
 with pdfplumber.open(path) as pp:
  outside=[]
  for i,p in enumerate(pp.pages):
   for c in p.chars:
    if c['x0']<-.5 or c['x1']>432.5 or c['top']<-.5 or c['bottom']>648.5:outside.append(i+1);break
  if outside:errors.append('outside page text '+str(outside))
 result={'edition':edition,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'pages':len(pdf.pages),'chapters':len(rec['chapters']),'notes':rec['notes'],'citation_pairs':rec['citation_pairs'],'image_placements':len(rec['image_placements']),'pdf_image_objects':image_objects,'minimum_content_image_dpi':min(x['effective_dpi'] for x in rec['image_placements']),'external_links':len(external),'internal_links':internal_count,'cover_art_dpi':170.67,'cover_text':'vector','press_ready':False,'errors':errors,'visual_review':'pending'}
 (record_path.parent/'structural-check-2026-10-30.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
 if errors:sys.exit(1)
