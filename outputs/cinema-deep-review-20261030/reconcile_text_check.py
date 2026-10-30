from pathlib import Path
import json,collections
R=Path(__file__).resolve().parents[2];out=R/'outputs/cinema-deep-review-20261030';raw=json.loads((out/'book-text-check-final.json').read_text());result=[]
for row in raw:
 groups=collections.Counter();unresolved=[];explanations=[]
 for item in row['unmatched']:
  t=item['text'];slug=item['slug']
  if item['has_odia'] and item['all_surrounding_runs_present']:
   groups['odia_shaped_glyph_extraction']+=1
  elif slug=='odia-cinema' and t.startswith('- [Odia Cinema Music:'):
   groups['website_further_reading_navigation']+=1;explanations.append('Overview further-reading cards are web navigation; book supplies reading paths and chapter references.')
  elif slug=='odia-cinema' and t.startswith('The screening listing cited here was checked'):
   groups['dated_maintenance_copy']+=1;explanations.append('Dated cinema-listing maintenance sentence suppressed in book; underlying dated source retained and availability note remains.')
  elif slug in ['sadhu-meher','nirad-mohapatra','sabyasachi-mohapatra','nandita-das'] and item['kind']=='paragraphs' and t.startswith('*'):
   groups['body_photo_promoted_to_hero']+=1;explanations.append(slug+': original body figure promoted once to hero; complete licence/creator retained in shared note and image binding. No missing photograph.')
  else:unresolved.append(item)
 result.append({'edition':row['edition'],'sha256':row['sha256'],'raw_checker_exit':1,'raw_unmatched':len(row['unmatched']),'resolved_groups':dict(groups),'explanations':explanations,'unresolved':unresolved,'limits':['103 mixed-script strings do not match PDF extraction; all their surrounding Latin/digit runs are present. Representative Odia passages were visually inspected, including both literary excerpts and new dhaga; not a character-by-character native-speaker proofread.','The raw checker is preserved and not relabelled PASS. Layout, source/image hashes, note destinations and render receipts are independently recorded.']})
(out/'book-text-reconciliation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print([(r['edition'],r['resolved_groups'],len(r['unresolved'])) for r in result]);assert not any(r['unresolved'] for r in result)
