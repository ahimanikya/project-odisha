"""Independent read-only book audit. Prints JSON; does not mutate artifacts.
Requires pypdf. Exact normalized matching is intentionally conservative: inspect
reported misses rather than automatically blessing extraction/edition differences.
"""
from pathlib import Path
import argparse, hashlib, html, json, re, unicodedata
from pypdf import PdfReader
ap=argparse.ArgumentParser()
ap.add_argument('--date',default='2026-10-30')
ap.add_argument('--expected-count',type=int,default=41)
ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
ap.add_argument('--plan',default='kb/research/culture/cinema-series/book-narrative-2026-10-27.json')
a=ap.parse_args();R=a.root.resolve()
data=json.loads((R/'projects/site/src/data/cinema.json').read_text())
plan=json.loads((R/a.plan).read_text())
entries={x['slug']:x for x in data['articles']}
order=[s for p in data['parts'] for s in p['chapters']]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def plain(t):
 t=re.sub(r'\[\^[^]]+\]','',t)
 t=re.sub(r'!?\[([^]]*)\]\((?:[^()]|\([^()]*\))*\)',r'\1',t)
 t=re.sub(r'<[^>]+>','',t)
 return html.unescape(t)
def norm(t):
 # Preserve all scripts, digits and combining marks; ignore typography/spacing.
 t=re.sub(r'\[S\d+\]|\(Chapter\s+\d+,\s+p\.\s+\d+\)|\(p\.\s+\d+\)','',t)
 return ''.join(c for c in unicodedata.normalize('NFC',plain(t)).casefold() if unicodedata.category(c)[0] in 'LNM')
def body(s):
 return re.sub(r'^---\n.*?\n---\n','',s,count=1,flags=re.S).split('## Further reading')[0]
results=[]
for edition in ('digital','print'):
 errors=[];missing=[];checks={'paragraphs':0,'table_cells':0,'notes':0,'credits':0};canonical_overview_not_verbatim=[]
 path=R/f'tmp/pdfs/{a.date}/{edition}/book-build-{a.date}.json'
 if not path.exists():
  results.append({'edition':edition,'errors':['Missing required record '+str(path)]});continue
 rec=json.loads(path.read_text());pdfpath=R/rec['pdf']
 if not pdfpath.exists():
  results.append({'edition':edition,'errors':['Missing required PDF '+str(pdfpath)]});continue
 pdf=PdfReader(pdfpath)
 pieces=[];removed_superscripts=[]
 for page_index,page in enumerate(pdf.pages):
  state={'rise':0.0,'pending_rise':0.0}
  def operand(op,args,cm,tm):
   if op==b'BT':state.update(rise=0.0,pending_rise=0.0)
   elif op==b'Ts':
    state['rise']=float(args[0])
    if state['rise']>0:state['pending_rise']=state['rise']
  def visitor(fragment,cm,tm,font,size):
   # ReportLab body/caption citation spans are raised and two points smaller.
   # Never remove baseline numbers, Odia digits/text or arbitrary small text.
   if abs(float(size)-8.0)<0.01 and abs(float(cm[5]))<0.01 and (float(tm[5])<40 or float(tm[5])>610):
    return  # Known running-head/folio bands, not body numbers.
   if state['pending_rise']>0 and float(size)<=9.0 and re.fullmatch(r'[0-9,\s]+',fragment) and re.search(r'[0-9]',fragment):
    removed_superscripts.append({'page':page_index+1,'text':fragment.strip(),'font_size':size,'rise':state['pending_rise']})
    state['pending_rise']=0.0
   else:pieces.append(fragment)
  page.extract_text(visitor_operand_before=operand,visitor_text=visitor)
 text=norm(''.join(pieces))
 if len(entries)!=a.expected_count or len(order)!=a.expected_count or len(set(order))!=a.expected_count:errors.append('Manifest count/order is not expected complete set')
 if [c['slug'] for c in rec['chapters']]!=order:errors.append('Recorded chapter order/set differs from manifest')
 if sha(pdfpath)!=rec['pdf_sha256']:errors.append('PDF hash mismatch')
 if len(pdf.pages)!=rec['pages']:errors.append('Page count mismatch')
 if not rec.get('chapter_page_references_stable'):errors.append('Chapter page references not stable')
 def match(t,slug,kind):
  n=norm(t)
  if not n:return
  checks[kind]+=1
  if n not in text:missing.append({'slug':slug,'kind':kind,'text':t})
 def paragraphs(s,slug):
  for block in re.split(r'\n\s*\n',s):
   if block.startswith(('#','[^','!','By ')) or 'Suggest an update' in block:continue
   if any(block.strip()==x['text'] for x in rec.get('suppressed_repeated_viewing_notices',[])):continue
   if block.startswith('|'):
    for row in block.splitlines():
     if re.match(r'^\|?\s*:?-{3}',row):continue
     for cell in row.strip('|').split('|'):match(cell,slug,'table_cells')
   else:match(block,slug,'paragraphs')
 records={c['slug']:c for c in rec['chapters']}
 for slug,e in entries.items():
  source=R/e['source'];s=source.read_text()
  if sha(source)!=e['source_sha256'] or records.get(slug,{}).get('source_sha256')!=sha(source):errors.append('Source hash mismatch '+slug)
  if slug=='odia-cinema' and plan.get('overview'):
   paragraphs(plan['overview']['opening_markdown'],slug)
   paragraphs(plan['overview']['companion_markdown'],slug)
   for block in re.split(r'\n\s*\n',body(s)):
    if not block.startswith(('#','[^','!','By ')) and 'Suggest an update' not in block and norm(block) and norm(block) not in text:canonical_overview_not_verbatim.append(block[:250])
  else:paragraphs(body(s),slug)
  for key,note in re.findall(r'^\[\^([^]]+)\]:\s*(.*)$',s,re.M):match(note,slug+':'+key,'notes')
 for credit in rec.get('image_credit_notes',[]):match(credit['full_credit'],credit['slug'],'credits')
 expected_images=[(e['slug'],i['source']) for e in data['articles'] for i in e['images']]
 actual_images=[(i['chapter'],i['source']) for i in rec['image_placements']]
 if sorted(expected_images)!=sorted(actual_images):errors.append('Image placement set differs from manifest')
 for im in rec['image_placements']:
  if sha(R/im['source'])!=im['sha256']:errors.append('Original image hash mismatch '+im['source'])
 latin_pdf=re.sub(r'[\u0b00-\u0b7f]','',text)
 for item in missing:
  target=re.sub(r'[\u0b00-\u0b7f]','',norm(item['text']))
  item['latin_and_digits_match']=target in latin_pdf
  runs=[norm(z) for z in re.split(r'[\u0b00-\u0b7f]+',plain(item['text'])) if len(norm(z))>=12]
  item['all_surrounding_runs_present']=all(z in text for z in runs)
  item['has_odia']=bool(re.search(r'[\u0b00-\u0b7f]',item['text']))
 if missing:errors.append('Unmatched text requires review; not automatic extraction exception')
 results.append({'edition':edition,'pdf':rec['pdf'],'sha256':sha(pdfpath),'pages':len(pdf.pages),'checks':checks,'citation_markers_excluded':len(removed_superscripts),'citation_marker_examples':removed_superscripts[:12],'errors':errors,'unmatched':missing,'overview_adaptation_requires_review':canonical_overview_not_verbatim,'limits':['Pixel layout, Odia shaping, credit completeness against metadata and semantic link destinations require separate review.','Whole-document matching proves presence, not exactly-once placement.','Any overview exceptions must be reconciled explicitly; this script does not approve them.']})
print(json.dumps(results,ensure_ascii=False,indent=2))
raise SystemExit(1 if any(x['errors'] for x in results) else 0)
