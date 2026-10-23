import copy,hashlib,importlib.util,json
from pathlib import Path
import validate_transcription as v
ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=ROOT/'kb/research/folklore'
raw=Path(EVIDENCE/'odia-dhaga-1893-page2-transcription-2026-10-23.json').read_bytes();base=json.loads(raw);sha=hashlib.sha256(raw).hexdigest()
cases={
 'duplicate ID':lambda d:d['segments'][1].update(id=d['segments'][0]['id']),
 'missing ID':lambda d:d['segments'][0].pop('id'),
 'negative line':lambda d:d['segments'][0].update(text_line_range=[0,1]),
 'boolean line':lambda d:d['segments'][0].update(text_line_range=[True,1]),
 'overlapping lines':lambda d:d['segments'][1].update(text_line_range=[1,3]),
 'missing page anchor':lambda d:d['segments'][0].pop('printed_page'),
 'mixed PDF page':lambda d:d['segments'][0].update(pdf_page=3),
 'source mismatch':lambda d:d['segments'][0].update(source_id='other'),
 'missing uncertainties':lambda d:d['segments'][0].update(uncertainties=[]),
 'accepted status':lambda d:d['segments'][0].update(status='accepted'),
 'normalized speculative text':lambda d:d['segments'][0].update(normalized_reading='invented'),
 'missing normalized null':lambda d:d['segments'][0].pop('normalized_reading'),
 'page complete claim':lambda d:d.update(page_complete=True),
 'accepted corpus increase':lambda d:d.update(accepted_corpus_increment=1),
 'human claim':lambda d:d['segments'][0].update(human_reviewed=True),
 'top human count':lambda d:d.update(human_proofread_entries=1),
 'accepted IDs':lambda d:d.update(accepted_entry_ids=['new']),
 'null continuation without cross note':lambda d:d.pop('cross_page'),
 'dangling continuation':lambda d:d['cross_page'].update(segment_id='absent'),
 'wrong next page':lambda d:d['cross_page'].update(next_pdf_page=7),
 'nonfinal outgoing':lambda d:d['segments'][0].update(continues_to_next_page=True)
}
results=[]
for name,mutate in cases.items():
 d=copy.deepcopy(base);mutate(d)
 try:v.validate(d);raise AssertionError('Accepted bad fixture '+name)
 except v.ValidationError as e:results.append({'case':name,'result':'rejected','reason':str(e)})
try:v.validate(base,{'transcription_sha256':'0'*64},sha);raise AssertionError('Accepted stale review')
except v.ValidationError as e:results.append({'case':'stale review hash','result':'rejected','reason':str(e)})
positive=v.validate_file(EVIDENCE/'odia-dhaga-1893-page2-transcription-2026-10-23.json',EVIDENCE/'odia-dhaga-1893-page2-validation-2026-10-23.json')
print('Page2 with exact review passes; '+str(len(results))+' malformed fixtures rejected.')
# A wrapped saying ending on line2 and another beginning later on line2.
portioned=copy.deepcopy(base);a=portioned['segments'][0];b=portioned['segments'][1]
a['text_line_range']=[1,2];b['text_line_range']=[2,3]
for segment in portioned['segments']:
 segment['line_portions']=[{'line':n,'portion_index':1,'position_note':'whole line or first portion'} for n in range(segment['text_line_range'][0],segment['text_line_range'][1]+1)]
b['line_portions'][0]={'line':2,'portion_index':2,'position_note':'after first saying'}
v.validate(portioned)
portion_cases={
 'duplicate portion':lambda d:d['segments'][1]['line_portions'][0].update(portion_index=1),
 'missing portion note':lambda d:d['segments'][0]['line_portions'][0].pop('position_note'),
 'missing declared line portion':lambda d:d['segments'][0]['line_portions'].pop(),
 'unanchored overlap in portion mode':lambda d:d['segments'][1].pop('line_portions'),
 'out of range portion':lambda d:d['segments'][0]['line_portions'][0].update(line=99)
}
for name,mutate in portion_cases.items():
 d=copy.deepcopy(portioned);mutate(d)
 try:v.validate(d);raise AssertionError('Accepted bad fixture '+name)
 except v.ValidationError as e:results.append({'case':name,'result':'rejected','reason':str(e)})
v.validate(base,{'draft_sha256':sha},sha)
try:v.validate(base,{'draft_sha256':sha,'transcription_sha256':'0'*64},sha);raise AssertionError('Accepted conflicting review')
except v.ValidationError as e:results.append({'case':'conflicting review hashes','result':'rejected','reason':str(e)})
print('Wrapped same-line segmentation and review alias pass; '+str(len(results))+' negative cases rejected.')
page3_path=Path(EVIDENCE/'odia-dhaga-1893-page3-transcription-2026-10-23.json')
if page3_path.exists():
 page3=json.loads(page3_path.read_bytes());v.validate(page3)
 for name,mutate in {
  'missing incoming boundary':lambda d:d['cross_page'].pop('incoming'),
  'wrong incoming target':lambda d:d['cross_page']['incoming'].update(current_segment='absent'),
  'wrong incoming page':lambda d:d['cross_page']['incoming'].update(previous_pdf_page=1),
  'wrong outgoing page':lambda d:d['cross_page']['outgoing'].update(next_pdf_page=99)
 }.items():
  d=copy.deepcopy(page3);mutate(d)
  try:v.validate(d);raise AssertionError('Accepted bad fixture '+name)
  except v.ValidationError as e:results.append({'case':name,'result':'rejected','reason':str(e)})
 print('Page3 nested boundaries pass; '+str(len(results))+' negative cases rejected.')
