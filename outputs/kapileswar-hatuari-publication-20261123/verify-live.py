"""After-deployment HTTP/content/asset verification; --run-live explicitly enables fetches."""
import argparse
import hashlib
import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROUTE = '/stories/kapileswar-hatuari/'
ROUTES = [ROUTE, '/history/', '/destinations/kapilash/', '/explore/']
TITLE = 'Kapileswar at Hatuari: What Do We Actually Know?'


def sha(data):
    return hashlib.sha256(data).hexdigest()


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.images, self.text, self.refs, self.notes = [], [], [], [], [], []
        self.meta, self.hidden = {}, 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'):
            self.hidden += 1
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'a':
            self.links.append(a.get('href', ''))
            if 'data-footnote-ref' in a:
                self.refs.append(a.get('href', ''))
        if tag == 'li' and a.get('id', '').startswith('user-content-fn-'):
            self.notes.append(a['id'])
        if tag == 'img':
            self.images.append(a)
        if tag == 'meta':
            self.meta[a.get('property', a.get('name', ''))] = a.get('content', '')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, text):
        if not self.hidden:
            self.text.append(text)

    def plain(self):
        return ' '.join(unicodedata.normalize('NFC', ' '.join(self.text)).split())


def main_article(html):
    matches = re.findall(r'<article\b[^>]*class="[^"]*\barticle-reading\b[^"]*"[^>]*>.*?</article>', html, re.S)
    if len(matches) != 1:
        raise ValueError('Expected exactly one main article-reading element')
    return matches[0]


def discovery_card(html):
    cards = [x for x in re.findall(r'<article\b[^>]*>.*?</article>', html, re.S)
             if ROUTE in Page(x).links]
    if len(cards) != 1:
        raise ValueError('Expected exactly one Hatuari discovery card')
    return cards[0]


def responsive_widths(img):
    found = {}
    for item in img.get('srcset', '').split(','):
        if not item.strip():
            continue
        url, width = item.strip().rsplit(None, 1)
        if not re.fullmatch(r'\d+w', width):
            raise ValueError('Expected width-based responsive candidates')
        width = int(width[:-1])
        if width in found:
            raise ValueError('Duplicate responsive width')
        found[width] = url
    return found


def run(args, report, out):
    root = args.root.resolve()
    site = root / 'projects/site'
    local_build = site / 'dist-publish'
    image = json.loads((root / 'kb/research/places/kapileswar-hatuari-image.json').read_text())
    origin = args.origin.rstrip('/')
    base = urllib.parse.urlsplit(origin)
    if base.scheme != 'https' or base.netloc != 'projectodisha.org' or base.path:
        raise ValueError('This helper is restricted to https://projectodisha.org')

    def check(ok, message):
        if not ok:
            raise AssertionError(message)
        report['checks'].append(message)

    def fetch(path, limit):
        url = urllib.parse.urljoin(origin + '/', path)
        u = urllib.parse.urlsplit(url)
        check(u.scheme == 'https' and u.netloc == base.netloc, 'Same-origin fetch ' + path)
        request = urllib.request.Request(url, headers={
            'User-Agent': 'ProjectOdisha-Hatuari-Delivery-Verification/1.0', 'Cache-Control': 'no-cache'})
        with urllib.request.urlopen(request, timeout=45) as response:
            check(response.status == 200, 'HTTP 200 ' + path)
            final = urllib.parse.urlsplit(response.geturl())
            check(final.scheme == 'https' and final.netloc == base.netloc, 'Same-origin final response ' + path)
            data = response.read(limit + 1)
            check(len(data) <= limit, 'Bounded response ' + path)
            headers = {k: response.headers.get(k) for k in ('Content-Type', 'ETag', 'Last-Modified', 'Cache-Control', 'Date')}
            return data, headers, response.geturl()

    live_pages = {}
    for route in ROUTES:
        data, headers, final_url = fetch(route, 5_000_000)
        html = data.decode('utf-8')
        check('text/html' in (headers['Content-Type'] or ''), 'HTML response ' + route)
        filename = route.strip('/').replace('/', '-') + '.html'
        (out / filename).write_bytes(data)
        report['routes'].append({'route': route, 'http_status': 200, 'final_url': final_url,
                                 'bytes': len(data), 'sha256': sha(data), 'saved': filename, 'headers': headers})
        live_pages[route] = html
        if route != ROUTE:
            check(ROUTE in Page(html).links, 'Incoming article link ' + route)

    live_fragment = main_article(live_pages[ROUTE])
    local_fragment = main_article((local_build / ROUTE.lstrip('/') / 'index.html').read_text())
    live = Page(live_fragment)
    local = Page(local_fragment)
    whole = Page(live_pages[ROUTE])
    for text in [TITLE, 'By Ahimanikya Satapathy', 'provisional architectural attribution',
                 'Post-Ganga', 'apparent chronological inconsistency', 'Gayatri Das Pinky',
                 'board', 'Footnotes & Sources']:
        check(text in live.plain(), 'Article text: ' + text)
    check(len(live.notes) == 8, 'Eight article source notes')
    check(len(live.refs) == 10, 'Ten article reference markers')
    check(len(live.ids) == len(set(live.ids)), 'Unique article IDs')
    check(all(href.startswith('#') and href[1:] in live.ids for href in live.refs), 'Reference markers resolve')
    fragments = [urllib.parse.unquote(href[1:]) for href in live.links if href.startswith('#')]
    check(all(target in whole.ids for target in fragments), 'All article fragment links and backlinks resolve')
    check('user-content-fn-hatuari-board' in live.notes, 'Board has its own source note')
    check(live.plain() == local.plain(), 'Normalized main-article text matches reviewed publication build')
    (out / 'article-live-fragment.html').write_text(live_fragment)
    (out / 'article-local-fragment.html').write_text(local_fragment)
    report['article_text'] = {'normalization': 'HTML text extraction excluding scripts/styles; NFC and whitespace only',
                              'exact_normalized_match': True, 'local_sha256': sha(local.plain().encode()),
                              'live_sha256': sha(live.plain().encode())}
    for text in [image['creator'], image['license'], image['changes']]:
        check(text in live.plain(), 'Visible photograph credit: ' + text)
    for href in [image['source'], image['license_url']]:
        check(href in live.links, 'Linked photograph attribution: ' + href)
    check(whole.meta.get('og:image') == origin + image['src'], 'Expected sharing image')
    check(whole.meta.get('og:image:alt') == image['alt'], 'Expected sharing image description')
    hero = next(x for x in live.images if x.get('src') == image['src'])
    check([hero.get(k) for k in ('width', 'height', 'loading', 'fetchpriority')] ==
          [str(image['width']), str(image['height']), 'eager', 'high'], 'Full hero dimensions and loading priority')
    check(set(responsive_widths(hero).values()) == {image['src'], image['small_src']}, 'Both reviewed hero candidates present')

    def record_image(url, local_path, kind, declared_width=None):
        data, headers, final_url = fetch(url, 5_000_000)
        check((headers['Content-Type'] or '').startswith('image/'), 'Image response ' + url)
        check(local_path.is_file(), 'Comparable local image exists ' + str(local_path))
        local_data = local_path.read_bytes()
        name = sha(url.encode())[:12] + '-' + Path(urllib.parse.urlsplit(url).path).name
        (out / name).write_bytes(data)
        item = {'kind': kind, 'url': url, 'final_url': final_url, 'http_status': 200, 'bytes': len(data),
                'sha256': sha(data), 'local_sha256': sha(local_data), 'local_bytes': len(local_data),
                'byte_equal': data == local_data, 'local_path': str(local_path), 'saved': name,
                'declared_width': declared_width, 'headers': headers}
        report['images'].append(item)
        return item

    for url in (image['src'], image['small_src']):
        item = record_image(url, site / 'public' / url.lstrip('/'), 'tracked_reviewed_asset')
        check(item['byte_equal'], 'Tracked article image bytes exact ' + url)

    local_explore = (local_build / 'explore/index.html').read_text()
    local_card = Page(discovery_card(local_explore))
    live_card = Page(discovery_card(live_pages['/explore/']))
    check(live_card.plain() == local_card.plain(), 'Discovery card text matches')
    check(len(live_card.images) == len(local_card.images) == 1, 'One discovery photograph')
    li, lo = live_card.images[0], local_card.images[0]
    check(li.get('src') == lo.get('src') == image['small_src'], 'Discovery uses reviewed small photograph')
    live_widths, local_widths = responsive_widths(li), responsive_widths(lo)
    check(bool(live_widths) and live_widths.keys() == local_widths.keys(), 'Discovery responsive widths preserved')
    for width, url in live_widths.items():
        check(url.startswith('/images/responsive/'), 'Generated discovery asset location')
        item = record_image(url, local_build / local_widths[width].lstrip('/'), 'generated_discovery_preview', width)
        item['local_url'] = local_widths[width]
        item['url_changed'] = url != local_widths[width]
        item['needs_review'] = not item['byte_equal'] or item['url_changed']
        if item['needs_review']:
            report['review_required'].append({'url': url, 'local_url': local_widths[width],
                                              'reason': 'Generated URL or encoding differs; retained bytes require independent visual/geometry review.'})
    report['status'] = 'REVIEW_REQUIRED' if report['review_required'] else 'PASS'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--root', type=Path, required=True, help='Reviewed Project Odisha checkout')
    p.add_argument('--output', type=Path, help='Evidence directory; defaults to task output/live in checkout')
    p.add_argument('--origin', default='https://projectodisha.org')
    p.add_argument('--run-live', action='store_true', help='Enable live requests after deployment has completed')
    args = p.parse_args()
    if not args.run_live:
        p.error('No requests made. Add --run-live only after the authorized deployment has completed.')
    out = args.output or args.root / 'outputs/kapileswar-hatuari-publication-20261123/live'
    if (out / 'verification.json').exists():
        p.error('Existing verification evidence retained. Choose a fresh --output directory for another run.')
    out.mkdir(parents=True, exist_ok=True)
    report = {'status': 'RUNNING', 'checked_at': datetime.now(timezone.utc).isoformat(),
              'routes': [], 'images': [], 'checks': [], 'review_required': [],
              'limitations': ['HTTP/content/byte checks only; not a browser, accessibility or historical-source review.',
                              'Main article comparison normalizes text only; the complete shell is not required to be byte-identical.',
                              'Generated preview encoding differences are review-required, never automatic visual-equivalence passes.',
                              'No decoded image geometry or visual-equivalence claim; inspect retained variants when they differ.']}
    try:
        run(args, report, out)
    except Exception as exc:
        report['status'] = 'FAIL'
        report['error'] = repr(exc)
    finally:
        (out / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps({'status': report['status'], 'routes': len(report['routes']),
                          'images': len(report['images']), 'review_required': report['review_required'],
                          'error': report.get('error'), 'evidence': str(out)}, ensure_ascii=False))
    return {'PASS': 0, 'REVIEW_REQUIRED': 2, 'FAIL': 1}[report['status']]


if __name__ == '__main__':
    sys.exit(main())
