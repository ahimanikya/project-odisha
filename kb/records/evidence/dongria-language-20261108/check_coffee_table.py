from pathlib import Path
import importlib.util,json,re,html,unicodedata,collections
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('coffee',ROOT/'build_coffee_table.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
s=b.load_source();plan=json.loads(b.PLAN.read_text());m=json.loads((ROOT/'book-manifest.json').read_text());r=PdfReader(m['book'])
issues=b.validate_plan(plan,s,[])
def norm(text):
 text=unicodedata.normalize('NFKC',html.unescape(text));text=re.sub('[\u0b00-\u0b7f]','',text)
 return re.sub(r'\s+','',text).replace('−','-')
full=' '.join(p.extract_text() or '' for p in r.pages);nfull=norm(full)
missing=[];checked=0
for ch in plan['chapters']:
 for block in ch['blocks']:
  if block.startswith('|'):
   bits=[x.strip() for line in block.splitlines() for x in line.strip('|').split('|') if x.strip() and not re.fullmatch(r'[:\s-]+',x)]
  else:bits=[block.removeprefix('## ')]
  for part in bits:
   expected=re.sub('<[^>]+>','',s.inline(part,ch['slug']))
   if norm(expected) not in nfull:missing.append({'slug':ch['slug'],'text':expected[:100]})
   checked+=1
note_missing=[]
for slug,notes in s.NOTE_DEFS.items():
 for num,txt in notes.items():
  expected=re.sub('<[^>]+>','',s.inline(txt,slug,True))
  if norm(expected) not in nfull:note_missing.append(f'{slug}:{num}')
uris=set();internal=0;bad=[];fonts=set();unembedded=set()
for index,p in enumerate(r.pages,1):
 for ref in p.get('/Annots',[]):
  a=ref.get_object();action=a.get('/A',{});uri=action.get('/URI')
  if uri:uris.add(str(uri))
  dest=a.get('/Dest') or action.get('/D')
  if dest:
   internal+=1
   if isinstance(dest,list) and not any(dest[0]==page.indirect_reference for page in r.pages):bad.append(index)
 for fontref in p.get('/Resources',{}).get('/Font',{}).values():
  font=fontref.get_object();name=str(font.get('/BaseFont'));fonts.add(name)
  desc=font.get('/FontDescriptor')
  if desc and not any(k in desc.get_object() for k in ('/FontFile','/FontFile2','/FontFile3')):unembedded.add(name)
urls=set()
for notes in s.NOTE_DEFS.values():
 for text in notes.values():urls.update(re.findall(r'https?://[^\s)]+',text))
missingurls=sorted(urls-uris)
assert all(b.sha(p)==d for p,d in m['reading_edition_hashes_unchanged'].items())
# Text bounding-box check against physical page, independent of builder assertions.
import pdfplumber
bounds=[]
with pdfplumber.open(m['book']) as pdf:
 for i,p in enumerate(pdf.pages,1):
  for w in p.extract_words():
   if w['x0'] < -1 or w['x1']>577 or w['top'] < -1 or w['bottom']>721:bounds.append((i,w['text']))
toc=r.pages[2].extract_text()
toc_issues=[a['slug'] for a in s.ARTICLES if norm(a['title']+' · '+str(m['page_map']['chapter-'+a['slug']])) not in norm(toc)]
image_issues=[]
for placement in m['image_placements']:
 if placement['id'].startswith('cover:') or placement['id']=='author-portrait':continue
 limit=b.COLUMN*(.35 if placement['id'].startswith('heritage:') else .85)
 if placement['width_pt']>limit+.01:image_issues.append(placement['id'])
caption_issues=[]
photo_groups=collections.defaultdict(list)
for q in m['image_placements']:
 if q.get('caption_layout')=='side':
  ix,iy,iw,ih=q['image_left_pt'],q['image_bottom_pt'],q['width_pt'],q['height_pt']
  cx,cb,cw,ct=q['caption_left_pt'],q['caption_bottom_pt'],q['caption_width_pt'],q['caption_top_pt']
  if cx<ix+iw and cx+cw>ix and cb<iy+ih and ct>iy:caption_issues.append(q['id']+': image-caption overlap')
  if cb<43 or ct>680 or cx<43 or cx+cw>533:caption_issues.append(q['id']+': caption bounds')
  continue
 if 'caption_gap_pt' not in q:continue
 if abs(q['caption_gap_pt']-8)>.01 or abs(q['caption_left_pt']-q['image_left_pt'])>.01 or abs(q['caption_width_pt']-q['width_pt'])>.01:caption_issues.append(q['id'])
 if q['caption_bottom_pt']<43:caption_issues.append(q['id']+': bottom')
 photo_groups[q['page']].append(q)
for page,group in photo_groups.items():
 for first,second in zip(group,group[1:]):
  if first['caption_bottom_pt']<second['image_bottom_pt']+second['height_pt']+19.9:caption_issues.append(str(page)+': collision')
author_note_issues=[]
author_pages=' '.join(r.pages[i].extract_text() for i,k in enumerate(m['page_kinds']) if k=='author-note')
for paragraph in b.AUTHOR_NOTE.read_text().strip().split('\n\n'):
 if norm(paragraph) not in norm(author_pages):author_note_issues.append(paragraph[:70])
cover_reader=PdfReader(m['cover_panels'])
if norm(b.AUTHOR_BIO) not in norm(r.pages[-1].extract_text()):author_note_issues.append('Book back biography missing')
if norm(b.AUTHOR_BIO) not in norm(cover_reader.pages[-1].extract_text()):author_note_issues.append('Cover panel biography missing')
if norm("Author's note · "+str(m['page_map']['author-note'])) not in norm(toc):author_note_issues.append('Author note TOC missing')
edition_issues=[]
for paragraph in b.CLOSING_NOTE.read_text().strip().split('\n\n'):
 if norm(paragraph) not in nfull:edition_issues.append('Closing: '+paragraph[:60])
extra=json.loads(b.GLOSSARY_MAP.read_text())
extra['glossary']=extra['glossary']+extra.get('glossary_optional_additions',[])
for entry in extra['glossary']:
 if norm(entry['term']) not in nfull or norm(entry['definition']) not in nfull:edition_issues.append('Glossary: '+entry['term'])
 if entry['source_url'] not in uris:edition_issues.append('Glossary source: '+entry['term'])
for item in extra['map']['sources']:
 if item['url'] not in uris:edition_issues.append('Map source: '+item['url'])
for key,title in [('locator-map','Locating Niyamgiri'),('closing','Looking again'),('glossary','Words in this book')]:
 if norm(title+' · '+str(m['page_map'][key])) not in norm(toc):edition_issues.append('TOC: '+title)
for slug,caption in b.OPENING_CONTEXT.items():
 page=r.pages[m['page_map']['chapter-'+slug]-1]
 if norm(caption) not in norm(page.extract_text()):edition_issues.append('Opening context: '+slug)
if 'In the preceding chapter' in full:edition_issues.append('Unnamed Kuvi companion')
if any(t in full for t in ['Dongariya life in Niyamgiri','Songs and singers in Dongariya life','Dongariya ornaments in use','She described Dongariya singers','Dambu Praska as a Dongaria Kondh bard']):edition_issues.append('Unstandardised editorial spelling')
if set(m['selected_photo_ids']) != b.PUBLIC_PHOTO_IDS:edition_issues.append('Public selected photo scope changed')
wedding=next(im for im in b.read_register(b.REGISTER) if im['id']=='commons-2')
uses=[q for q in m['image_placements'] if q.get('original_sha256')==wedding['sha256']]
if len(uses)!=1 or uses[0]['id']!='opening:ornaments-in-use':edition_issues.append('Wedding photograph must appear once at ornaments opening')
if wedding['source_url'] not in uris or wedding['licence_url'] not in uris or wedding['creator'] not in full:edition_issues.append('Wedding attribution missing')
if 'https://commons.wikimedia.org/wiki/File:Dangaria_accessory_detail_01.jpg' not in uris:edition_issues.append('Hairpin source missing')
if b.MAP_OUTLINE_SOURCE not in uris:edition_issues.append('Map outline source missing')
for change in m.get('book_copy_adaptations',[]):
 expected_after=re.sub('<[^>]+>','',s.inline(change['after'],change['slug']))
 if norm(expected_after) not in nfull:edition_issues.append('Adaptation: '+change['slug'])
result={'first_edition_content_issues':edition_issues,'glossary_terms_checked':len(extra['glossary']),'book_copy_adaptations_checked':len(m.get('book_copy_adaptations',[])),'author_note_and_bio_issues':author_note_issues,'caption_geometry_issues':caption_issues,'toc_page_numbers_correct':not toc_issues,'toc_issues':toc_issues,'image_width_issues':image_issues,'status':'pass' if not any((issues,missing,note_missing,missingurls,bad,unembedded,bounds,toc_issues,image_issues,caption_issues,author_note_issues,edition_issues)) else 'needs-review','book_sha256':m['book_sha256'],'pages':len(r.pages),'narrative_fragments_checked':checked,'missing_body':missing,'notes_checked':sum(len(notes) for notes in s.NOTE_DEFS.values()),'missing_notes':note_missing,'unique_note_urls':len(urls),'missing_note_urls':missingurls,'internal_links':internal,'invalid_destinations':bad,'fonts':sorted(fonts),'unembedded_fonts':sorted(unembedded),'physical_page_overflow':bounds,'plan_issues':issues,'reading_edition_unchanged':True}
(ROOT/'technical-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
