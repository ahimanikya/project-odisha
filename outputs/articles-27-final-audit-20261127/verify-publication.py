#!/usr/bin/env python3
"""Fresh live delivery check without overwriting the pre-repair audit."""
import importlib.util,json
from pathlib import Path
here=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('audit',here/'technical-audit.py');audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
audit.save=lambda name,obj:(here/('postpublication-'+name)).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
audit.pages()
pages=json.loads((here/'postpublication-technical-live-pages.json').read_text())
notes=json.loads((here/'postpublication-technical-live-footnotes.json').read_text())
prior=json.loads((here/'technical-live-footnotes.json').read_text())
by={a['slug']:a for a in notes['articles']};old={a['slug']:a for a in prior['articles']}
changed={'pakhala','sitabinji','pentha'}
checks={'all27_http200':all(a['http_status']==200 for a in pages['articles']),'all27_notes_credits_images_match':pages['totals']['defects']==0,'all109_notes':pages['totals']['footnotes']==109,'other24_notes_preserved':all(by[k]==v for k,v in old.items() if k not in changed),'pakhala_exact_archive':'20261014232402' in json.dumps(by['pakhala']),'sitabinji_exact_archive':'20220709023011' in json.dumps(by['sitabinji']),'pentha_access_note':'requires sign-in' in json.dumps(by['pentha']),'pentha_distinct_companion':'not an archived copy' in json.dumps(by['pentha']) and 'shipmin.gov.in' in json.dumps(by['pentha'])}
result={'checked_at':audit.now(),'status':'pass' if all(checks.values()) else 'fail','checks':checks,'unique_source_targets':len(notes['external_targets']),'remaining_external_limit':'CAG original requires sign-in; public companion is distinct. See source-summary.json.'}
(here/'live-verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert all(checks.values())
