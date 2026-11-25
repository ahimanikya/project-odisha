#!/usr/bin/env python3
"""Bounded, read-only publication verification. No network without --live.

Examples (from the checkout):
  python3 outputs/independent-article-images-20261126/review/verify-live-images.py
  python3 outputs/independent-article-images-20261126/review/verify-live-images.py --local-dir projects/site/dist-coast
  python3 outputs/independent-article-images-20261126/review/verify-live-images.py --live --output live-verification.json
Only --live contacts the published site. Commons/licence URLs are inspected in
HTML, never requested. Site requests have at most four workers, no retry loop.
Nine GitHub source HEAD requests run sequentially after site checks.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BASE = 'https://projectodisha.org'
MAX_BYTES = 8 * 1024 * 1024
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def walk(self, tag=None):
        if tag is None or self.tag == tag:
            yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk(tag)
    def text(self):
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node(); self.stack = [self.root]; self.feed(html)
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs); self.stack[-1].children.append(n)
        if tag not in VOID: self.stack.append(n)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]; break
    def handle_data(self, data):
        self.stack[-1].children.append(data)


def norm(value):
    return re.sub(r'\s+', ' ', value).strip()


def fetch(url, head=False):
    request = Request(url, method='HEAD' if head else 'GET', headers={
        'User-Agent': 'ProjectOdisha-PublicationVerification/1.0',
        'Accept-Encoding': 'identity'})
    with urlopen(request, timeout=25) as response:
        body = b'' if head else response.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES: raise ValueError('Response exceeded 8 MiB bound')
        if response.status != 200: raise ValueError(f'HTTP {response.status}')
        return body, {'status': response.status, 'final_url': response.url,
                      'content_type': response.headers.get('Content-Type', '')}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument('--live', action='store_true', help='Run only after publication go-ahead')
    mode.add_argument('--local-dir', type=Path, help='Verify built HTML/assets without network')
    ap.add_argument('--workers', type=int, choices=range(1, 5), default=4)
    ap.add_argument('--output', help='New JSON filename within this review directory; never overwrites')
    args = ap.parse_args()
    manifest_path = ROOT / 'kb/research/stories/independent-features/images.json'
    manifest_bytes = manifest_path.read_bytes(); images = json.loads(manifest_bytes)
    collection = json.loads((manifest_path.parent/'collection.json').read_text())
    articles = collection['articles']
    assets = sorted({v[k] for v in images.values() for k in ('src','small_src') if v.get(k)})
    original_sources = sorted({v['source'] for v in images.values()
        if v['source'].startswith('https://github.com/ahimanikya/project-odisha/blob/main/outputs/')})
    sources = {}; note_urls = {}; note_counts = {}
    for article in articles:
        text = (ROOT/article['source_path']).read_text()
        row = re.search(r'^sources: (\[.*\])$', text, re.M)
        if not row: raise ValueError(f"Missing source register: {article['slug']}")
        sources[article['slug']] = [x['resource'] for x in json.loads(row[1])]
        definitions = re.findall(r'^\[\^[^\]]+\]: (.*)$',text,re.M)
        note_counts[article['slug']] = len(definitions)
        note_urls[article['slug']] = []
        for line in definitions:
            for match in re.finditer(r'\]\((https?://)',line):
                start = match.start()+2; end = start; depth = 1
                while end < len(line):
                    if line[end] == '(': depth += 1
                    if line[end] == ')': depth -= 1
                    if depth == 0: break
                    end += 1
                note_urls[article['slug']].append(line[start:end])
    assert len(articles) == len(images) == 27
    assert len(assets) == 49, f'Expected 49 assets, got {len(assets)}'
    assert len(original_sources) == 9
    assert sum(map(len, sources.values())) == 109
    assert sum(note_counts.values()) == 109
    report = {'checked_at':datetime.now(timezone.utc).isoformat(),
        'mode':'live' if args.live else ('local' if args.local_dir else 'prepared_no_network'),
        'base_url':BASE,'manifest_sha256':hashlib.sha256(manifest_bytes).hexdigest(),
        'expected':{'articles':27,'collection_and_explore':2,'assets':49,
                    'footnote_entries':109,'registered_source_occurrences':109,
                    'footnote_external_link_occurrences':sum(map(len,note_urls.values())),
                    'github_original_sources':9},
        'pages':[], 'assets':[], 'original_sources':[], 'failures':[]}
    if not args.live and not args.local_dir:
        print(json.dumps(report, indent=2)); return 0
    local = args.local_dir.resolve() if args.local_dir else None

    def load(path, html=False):
        if not path.startswith('/') or path.startswith('//'): raise ValueError('Nonlocal site path')
        if local:
            file = local/path.lstrip('/')
            if html: file = file/'index.html'
            return file.read_bytes(), {'status':200,'local_path':str(file)}
        data, evidence = fetch(BASE+path)
        if urlsplit(evidence['final_url']).hostname not in {'projectodisha.org','www.projectodisha.org'}:
            raise ValueError('Unexpected site redirect host')
        return data, evidence

    def check_page(job):
        path, article = job; errors = []; outcome = {'path':path}
        try:
            data, evidence = load(path, html=True); outcome.update(evidence)
            doc = Document(data.decode('utf-8')).root
            def require(ok, message):
                if not ok: errors.append(message)
            def credit(node, image, label):
                text = norm(node.text()); links = {x.attrs.get('href') for x in node.walk('a')}
                for key in ('caption','creator','license','changes'):
                    require(norm(image[key]) in text, f'{label}: missing {key}')
                require(image['source'] in links, f'{label}: missing source link')
                if image.get('license_url'):
                    require(image['license_url'] in links, f'{label}: missing licence link')
            def image_present(node, image, preview=False):
                target = image.get('small_src', image['src']) if preview else image['src']
                return any((x.attrs.get('src') == target or target in x.attrs.get('srcset',''))
                    and x.attrs.get('alt') == image['alt'] for x in node.walk('img'))
            meta = {x.attrs.get('property',x.attrs.get('name')):x.attrs.get('content') for x in doc.walk('meta')}
            if article:
                image = images[article['slug']]
                figures = [n for n in doc.walk('figure') if 'feature-image' in n.attrs.get('class','').split()]
                require(len(figures) == 1, 'Expected one main image figure')
                if figures:
                    require(image_present(figures[0],image),'Main image src/alt mismatch')
                    credit(figures[0],image,'main figure')
                notes = [n for n in doc.walk('section') if 'data-footnotes' in n.attrs]
                hrefs = Counter(x.attrs.get('href') for n in notes for x in n.walk('a')
                    if x.attrs.get('href','').startswith(('http://','https://')))
                count = sum(1 for n in notes for li in n.walk('li') if li.attrs.get('id','').startswith('user-content-fn-'))
                require(count == note_counts[article['slug']], 'Original footnote entry count differs')
                require(hrefs == Counter(note_urls[article['slug']]), 'Original footnote URL occurrences differ')
                outcome['footnote_entries'] = count
                outcome['footnote_external_link_occurrences'] = sum(hrefs.values())
                social = image['src']; social_alt = image['alt']
            else:
                for item in articles:
                    image = images[item['slug']]
                    if path == collection['href']:
                        candidates = [n for n in doc.walk('figure') if image_present(n,image,True)]
                    else:
                        candidates = [n for n in doc.walk('article') if any(a.attrs.get('href') == item['href'] for a in n.walk('a'))]
                    require(bool(candidates),f"{item['slug']}: preview missing")
                    if candidates: require(image_present(candidates[0],image,True),f"{item['slug']}: preview src/alt mismatch")
                    if path == collection['href'] and candidates:
                        credit(candidates[0],image,item['slug'])
                    else:
                        rows = [n for n in doc.walk('li') if any(a.attrs.get('href') == image['source'] for a in n.walk('a'))
                                and norm(image['caption']) in norm(n.text())]
                        require(bool(rows),f"{item['slug']}: Explore credit row missing")
                        if rows: credit(rows[0],image,item['slug'])
                social = images[articles[0]['slug']]['src'] if path == collection['href'] else '/assets/coast-natural-fallback-v2.png'
                social_alt = images[articles[0]['slug']]['alt'] if path == collection['href'] else None
            for tag in ('og:image','twitter:image'):
                require(meta.get(tag) == urljoin(BASE,social),f'{tag} mismatch')
            if social_alt:
                for tag in ('og:image:alt','twitter:image:alt'):
                    require(meta.get(tag) == social_alt,f'{tag} mismatch')
            outcome['social_image'] = meta.get('og:image')
        except Exception as exc: errors.append(str(exc))
        outcome.update(status_check='pass' if not errors else 'fail',errors=errors); return outcome

    jobs = [(a['href'],a) for a in articles]+[(collection['href'],None),('/explore/',None)]
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        report['pages'] = list(pool.map(check_page,jobs))

    def check_asset(path):
        outcome = {'path':path}
        try:
            expected = hashlib.sha256((ROOT/('projects/site/public'+path)).read_bytes()).hexdigest()
            data, evidence = load(path); actual = hashlib.sha256(data).hexdigest()
            outcome.update(evidence,expected_sha256=expected,actual_sha256=actual,bytes=len(data),
                status_check='pass' if expected == actual else 'fail')
        except Exception as exc: outcome.update(status_check='fail',error=str(exc))
        return outcome
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        report['assets'] = list(pool.map(check_asset,assets))
    for url in original_sources:
        outcome = {'url':url}
        if not args.live:
            outcome['status_check']='not_run_local_mode'
        else:
            try:
                _, evidence = fetch(url,head=True)
                outcome.update(evidence,status_check='pass' if evidence['final_url'] == url else 'fail')
            except Exception as exc: outcome.update(status_check='fail',error=str(exc))
        report['original_sources'].append(outcome)
    for section in ('pages','assets','original_sources'):
        report['failures'].extend({'section':section,**row} for row in report[section] if row['status_check']=='fail')
    report['actual_footnote_entries']=sum(x.get('footnote_entries',0) for x in report['pages'])
    report['actual_footnote_external_link_occurrences']=sum(x.get('footnote_external_link_occurrences',0) for x in report['pages'])
    report['status']='pass' if not report['failures'] else 'fail'
    if args.output:
        if Path(args.output).name != args.output or not args.output.endswith('.json'):
            raise ValueError('--output must be a plain .json filename inside review directory')
        with (HERE/args.output).open('x') as output:
            json.dump(report,output,ensure_ascii=False,indent=2); output.write('\n')
    print(json.dumps({'status':report['status'],'mode':report['mode'],
        'pages':len(report['pages']),'assets':len(report['assets']),
        'footnote_entries':report['actual_footnote_entries'],
        'footnote_external_link_occurrences':report['actual_footnote_external_link_occurrences'],
        'github_sources_checked':9 if args.live else 0,'failures':report['failures']},ensure_ascii=False,indent=2))
    return 1 if report['failures'] else 0


if __name__ == '__main__':
    sys.exit(main())
