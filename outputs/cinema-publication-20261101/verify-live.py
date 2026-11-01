from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re
import urllib.request
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
LOCAL = ROOT / 'projects/site/dist-publish'
DATA = json.loads((ROOT / 'projects/site/src/data/cinema.json').read_text())
BASE = 'https://projectodisha.org'
ROUTES = [a['route'] for a in DATA['articles']] + ['/cinema/', '/cinema/book/', '/cinema/reading-guide/', '/cinema/watch/']
assert len(ROUTES) == 54 and len(set(ROUTES)) == 54

def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Project-Odisha-publication-verification', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.status, response.read(), response.headers.get('Content-Type', '')

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.main = False; self.text = []; self.assets = set(); self.links = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'main': self.main = True
        if tag in ('script', 'style'): self.skip += 1
        if self.main and tag in ('img', 'source'):
            if d.get('src'): self.assets.add(d['src'])
            for item in d.get('srcset', '').split(','):
                if item.strip(): self.assets.add(item.strip().split()[0])
        if self.main and d.get('href'): self.links.append(d['href'])
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
        if tag == 'main': self.main = False
    def handle_data(self, text):
        if self.main and not self.skip and text.strip(): self.text.append(' '.join(text.split()))

def inspect(route):
    expected = Page(); expected.feed((LOCAL / route.strip('/') / 'index.html').read_text())
    assert expected.text, f'Empty local main: {route}'
    status, raw, content_type = fetch(BASE + route)
    actual = Page(); actual.feed(raw.decode())
    assert actual.text, f'Empty live main: {route}'
    return {'route': route, 'http': status, 'main_text_matches': actual.text == expected.text,
            'images_match': actual.assets == expected.assets, 'links_match': actual.links == expected.links,
            'assets': sorted(expected.assets), 'content_type': content_type}

with ThreadPoolExecutor(max_workers=6) as pool:
    pages = list(pool.map(inspect, ROUTES))
assets = sorted({urlsplit(a).path for p in pages for a in p['assets'] if a.startswith('/assets/cinema/')})

def inspect_asset(path):
    expected = (LOCAL / unquote(path).lstrip('/')).read_bytes()
    status, actual, _ = fetch(BASE + path)
    return {'path': path, 'http': status, 'bytes': len(actual), 'sha256': hashlib.sha256(actual).hexdigest(),
            'matches': actual == expected}

with ThreadPoolExecutor(max_workers=6) as pool:
    images = list(pool.map(inspect_asset, assets))
ok = all(p['http'] == 200 and p['main_text_matches'] and p['images_match'] and p['links_match'] for p in pages) and all(i['matches'] for i in images)
result = {'result': 'PASS' if ok else 'FAIL', 'pages': pages, 'images': images,
          'checked_at': datetime.now(timezone.utc).isoformat(),
          'source_head': 'f44ce28e6bb95184bf1e375065da55227412d9d8',
          'deployment_head': 'e315bed1dc3541761fcb3beedc2b967c7e6dfbdd',
          'comparison_artifact': 'projects/site/dist-publish',
          'scope': 'Live main text, link lists and inline image bindings match the reviewed local artifact; inline cinema image bytes match. Target fragments were checked separately in the local artifact. This is not a full visual or assistive-technology audit.',
          'counts': {'pages': len(pages), 'images': len(images)},
          'pdf_verification': 'remote-book-verification.json; both exact released PDF files independently downloaded before activation'}
(OUT / 'live-verification.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'result': result['result'], **result['counts'], 'failed_routes': [p['route'] for p in pages if not (p['main_text_matches'] and p['images_match'] and p['links_match'])], 'failed_images': [i['path'] for i in images if not i['matches']]}))
raise SystemExit(0 if ok else 1)
