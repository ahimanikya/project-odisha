from pathlib import Path
import copy, hashlib, json, re, shutil

R = Path(__file__).resolve().parents[3]
B = R / 'outputs/cinema-literary-publication-20261110'
def read(p): return json.loads(p.read_text())
def save(p, data): p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()

previous = read(R / 'outputs/cinema-bideha-publication-20261110/book-release-manifest.json')
site_path = R / 'projects/site/src/data/cinema.json'
site = read(site_path)
old_books = copy.deepcopy(site['review_books'])
assert all('2026-11-10-bideha' in a['file'] for a in old_books)
manifest = {k: copy.deepcopy(previous[k]) for k in ['readings', 'online_readings', 'integrated_profile_sources']}
manifest.update(status='built_pending_independent_review', edition_date='2026-11-10', release_tag='odia-cinema-book-2026-11-10-literary', publication_performed=False, expected_previous_review_books=old_books, assets=[])
replacements = {}
for edition in ['digital', 'print']:
    receipt_path = R / f'tmp/pdfs/2026-11-10-literary/{edition}/book-build-2026-11-10-literary.json'
    receipt = read(receipt_path)
    pdf = R / receipt['pdf']
    assert digest(pdf) == receipt['pdf_sha256']
    assert receipt['book_readings'] == 49 and receipt['online_readings'] == 50
    assert receipt['chapter_page_references_stable']
    retained = B / f'implementation/{edition}-book-build.json'
    shutil.copyfile(receipt_path, retained)
    asset = dict(edition=edition, path=receipt['pdf'], filename=pdf.name, pages=receipt['pages'], bytes=pdf.stat().st_size, sha256=digest(pdf), planned_release_url=f"https://github.com/ahimanikya/project-odisha/releases/download/{manifest['release_tag']}/{pdf.name}", review_receipt=str(retained.relative_to(R)), review_receipt_sha256=digest(retained))
    manifest['assets'].append(asset)
    if edition == 'digital':
        manifest['notes'] = receipt['notes']
        manifest['canonical_sources'] = receipt['chapters']
    else:
        assert receipt['notes'] == manifest['notes']
        assert [a['source_sha256'] for a in receipt['chapters']] == [a['source_sha256'] for a in manifest['canonical_sources']]
    old = next(a for a in old_books if a['edition'] == edition)
    new = next(a for a in site['review_books'] if a['edition'] == edition)
    new.update(file='/archive/' + pdf.name, bytes=asset['bytes'], sha256=asset['sha256'], pages=asset['pages'], edition_date='2026-11-10', release_file=asset['planned_release_url'])
    replacements[old['file']] = new['file']
    archived = copy.deepcopy(old)
    archived['file'] = archived.pop('release_file')
    archived['status'] = 'reviewed_release_asset'
    if not any(a['file'] == archived['file'] for a in site['archived_review_books']): site['archived_review_books'].insert(0, archived)
    shutil.copyfile(pdf, R / 'projects/site/public' / new['file'].lstrip('/'))
manifest['previous_same_origin_descriptors'] = old_books
manifest['expected_previous_review_books'] = [copy.deepcopy(next(a for a in site['archived_review_books'] if a['file'] == old['release_file'])) for old in old_books]
manifest['assets'].append(copy.deepcopy(previous['assets'][2]))
site['review_book_manifest'] = str((B / 'book-release-manifest.json').relative_to(R))
save(B / 'book-release-manifest.json', manifest)
save(site_path, site)
coast_path = R / 'projects/site/editions/coast.json'
coast = read(coast_path)
coast['documents'] = [replacements.get(x, x) for x in coast['documents']]
save(coast_path, coast)
test_path = R / 'projects/site/tests/book-downloads.test.mjs'
test = test_path.read_text()
for a in manifest['assets'][:2]:
    line = " {edition:'%s',file:'/archive/%s',bytes:%s,pages:%s,sha256:'%s'}," % (a['edition'], a['filename'], a['bytes'], a['pages'], a['sha256'])
    test, count = re.subn(r" \{edition:'" + a['edition'] + r"',file:[^\n]+", lambda _: line, test)
    assert count == 1
test_path.write_text(test)
print(json.dumps({'assets': manifest['assets'][:2], 'notes': manifest['notes']}, indent=2))
