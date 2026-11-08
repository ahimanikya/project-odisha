import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parents[3]
output = Path(__file__).resolve().parent
manifest = json.loads((output.parent / 'book-release-manifest.json').read_text())

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.text, self.links = [], []
        self.feed(html)
    def handle_data(self, data):
        self.text.append(data)
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs).get('href', ''))

def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'ProjectOdisha-publication-check/1.0'})
    return urllib.request.urlopen(request, timeout=90)

report = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'routes': [], 'downloads': []}
for route in ['/cinema/cinema-economics/', '/cinema/book/']:
    url = 'https://projectodisha.org' + route
    with fetch(url) as response:
        raw = response.read()
        page = Page(raw.decode('utf-8'))
        text = ' '.join(' '.join(page.text).split())
        assert response.status == 200
    if route.endswith('cinema-economics/'):
        assert 'Abhyasa’s account of its November 2017 school festival lists' in text
        assert 'The festival’s own trailer identifies Lipika Singh Darai as the director.' in text
        assert 'https://www.youtube.com/watch?v=nplYz453zk4' in page.links
        assert 'https://abhyasaschool.org/first-international-kids-films-festival-on-india-ikffi-in-abhyasa.html' in page.links
    else:
        assert 'Their profiles appear together in the online DAMaN team reading.' in text
        for asset in manifest['assets'][:2]:
            assert '/archive/' + asset['filename'] in page.links
    report['routes'].append({'url': url, 'status': 200, 'content_assertions': 'pass', 'sha256': hashlib.sha256(raw).hexdigest()})

for asset in manifest['assets'][:2]:
    url = 'https://projectodisha.org/archive/' + asset['filename']
    target = output / ('live-' + asset['filename'])
    digest = hashlib.sha256()
    size = 0
    with fetch(url) as response, target.open('wb') as handle:
        assert response.status == 200
        assert 'application/pdf' in response.headers.get('Content-Type', '')
        while chunk := response.read(1024 * 1024):
            handle.write(chunk)
            digest.update(chunk)
            size += len(chunk)
    assert digest.hexdigest() == asset['sha256'], asset['edition']
    assert size == asset['bytes'], asset['edition']
    report['downloads'].append({'edition': asset['edition'], 'url': url, 'status': 200, 'bytes': size, 'sha256': digest.hexdigest(), 'matches_reviewed_artifact': True})

report['result'] = 'PASS'
(output / 'live-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
