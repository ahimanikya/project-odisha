import hashlib, json, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

output = Path(__file__).resolve().parent
manifest = json.loads((output.parent / 'book-release-manifest.json').read_text())
class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(); self.text, self.links = [], []; self.feed(html)
    def handle_data(self, data): self.text.append(data)
    def handle_starttag(self, tag, attrs):
        if tag == 'a': self.links.append(dict(attrs).get('href', ''))
def fetch(url, headers=None):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'ProjectOdisha-publication-check/1.0', **(headers or {})}), timeout=90)
report = {'checked_at_utc':datetime.now(timezone.utc).isoformat(), 'routes':[], 'downloads':[]}
for route in ['/people/kalindi-charan-panigrahi/', '/cinema/literature-and-screen/', '/cinema/book/']:
    url = 'https://projectodisha.org' + route
    with fetch(url) as response:
        raw = response.read(); assert response.status == 200
    page = Page(raw.decode('utf-8')); text = ' '.join(' '.join(page.text).split())
    if route.startswith('/people/'):
        assert 'inviting him to write a novel for Saraswat Press within two months' in text
        assert 'he recognises his mother in its principal elderly woman' in text
        assert 'textbooks, publicity and insurance work' in text
    elif route.endswith('/literature-and-screen/'):
        assert 'he proposed paying Odia writers and artists' in text
        assert 'his film-adaptation terms remain unverified' in text
        assert 'A credit and a payment answer different questions.' in text
    else:
        for asset in manifest['assets'][:2]: assert '/archive/' + asset['filename'] in page.links
    if route != '/cinema/book/':
        assert 'https://drive.google.com/file/d/1Vzwx4D1ya-NcQjPaICgx99zCz1W04SEp/view' in page.links
    report['routes'].append({'url':url,'status':200,'content_assertions':'PASS','sha256':hashlib.sha256(raw).hexdigest()})
for asset in manifest['assets'][:2]:
    url = 'https://projectodisha.org/archive/' + asset['filename']
    digest, size = hashlib.sha256(), 0
    with fetch(url) as response, (output / ('live-' + asset['filename'])).open('wb') as handle:
        assert response.status == 200; assert 'application/pdf' in response.headers.get('Content-Type','')
        while chunk := response.read(1024 * 1024): handle.write(chunk); digest.update(chunk); size += len(chunk)
    assert size == asset['bytes']; assert digest.hexdigest() == asset['sha256']
    with fetch(url, {'Range':'bytes=0-1023'}) as response:
        range_status = response.status; ranged = response.read()
        assert range_status == 206; assert len(ranged) == 1024; assert ranged.startswith(b'%PDF')
    report['downloads'].append({'edition':asset['edition'],'url':url,'status':200,'range_status':range_status,'bytes':size,'sha256':digest.hexdigest(),'matches_reviewed_artifact':True})
report['result'] = 'PASS'
(output / 'live-verification.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
