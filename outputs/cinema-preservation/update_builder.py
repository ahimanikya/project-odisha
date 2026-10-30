from pathlib import Path
p=Path('output/pdf/build_book.py');s=p.read_text()
s=s.replace('parser.add_argument("--page-map");args=parser.parse_args();PRINT=', 'parser.add_argument("--page-map");parser.add_argument("--date",required=True);args=parser.parse_args();EDITION_DATE=datetime.date.fromisoformat(args.date);DATE_TEXT=EDITION_DATE.strftime("%d %B %Y").lstrip("0");PRINT=')
s=s.replace("OUT=R/('output/pdf/odia-cinema-a-living-screen-print-2026-10-27.pdf' if PRINT else 'output/pdf/odia-cinema-a-living-screen-2026-10-27.pdf');BASE_TMP=R/'tmp/pdfs';TMP=BASE_TMP/args.edition;", "OUT=R/('output/pdf/odia-cinema-a-living-screen'+('-print' if PRINT else '')+'-'+args.date+'.pdf');BASE_TMP=R/'tmp/pdfs';TMP=BASE_TMP/args.date/args.edition;")
s=s.replace("para('Reading edition · 27 October 2026','small')","para('Reading edition · '+DATE_TEXT,'small')")
s=s.replace("para('Twenty-eight connected readings follow", "para(f'{len(order)} connected readings follow")
s=s.replace("'This edition gathers twenty-eight readings into five parts.", "f'This edition gathers {len(order)} readings into {len(plan[\"parts\"])} parts.")
s=s.replace("'Prepared by Ahimanikya Satapathy, Project Odisha. Review edition dated 27 October 2026.'","f'Prepared by Ahimanikya Satapathy, Project Odisha. Review edition dated {DATE_TEXT}.'")
s=s.replace("'date':'2026-10-27'","'date':args.date")
s=s.replace("(TMP/'book-build-2026-10-27.json')","(TMP/('book-build-'+args.date+'.json'))")
s=s.replace("'artifact_marker':'Samanta executed PDF edit marker once for unified source footnotes; expected output count2; existing covers unchanged'","'artifact_marker':'Disha executed PDF edit marker once on2026-10-30; expected output count2; existing covers unchanged'")
# Give the book the same optional thematic reading paths as the web companion.
needle=" if narrative.get('people_guide'):\n  story.append(para('People and their work','h2'))"
replacement=""" if narrative.get('reading_paths'):
  story.append(para('Choose a thread','h2'))
  for path in narrative['reading_paths']:
   story.append(para(path['title'],'h3'))
   story.append(para(path['text'],'body'))
   for destination in path['chapters']:
    story.append(para('['+short[destination]+']('+entries[destination]['route']+')','body'))
 if narrative.get('people_guide'):
  story.append(para('People and their work','h2'))"""
assert needle in s;s=s.replace(needle,replacement)
p.write_text(s)

