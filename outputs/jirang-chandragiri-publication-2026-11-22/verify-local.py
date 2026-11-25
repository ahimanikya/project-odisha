from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re, subprocess, sys

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SITE = ROOT / 'projects/site'
BASE = '39da6cb89f49558148676b7162f7aab04a644c2e'
ROUTE = '/destinations/jirang-chandragiri/'
NODE = '/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
sha = lambda b: hashlib.sha256(b).hexdigest()

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.imgs, self.meta = [], [], [], {}
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if 'id' in d: self.ids.append(d['id'])
        if tag == 'a': self.links.append(d.get('href', ''))
        if tag == 'img': self.imgs.append(d)
        if tag == 'meta': self.meta[d.get('property', d.get('name', ''))] = d.get('content')

def parsed(html):
    p = Page(); p.feed(html); return p

def check(condition, description):
    if not condition: raise AssertionError(description)
    report['checks'].append(description)

builds = json.loads((OUT / 'build-results.json').read_text())
publication = [b for b in builds if b['name'] in ('publication-build', 'publication')]
if not publication or publication[-1]['exit_code'] != 0:
    sys.exit('Publication build has not completed successfully in build-results.json; no verification report written.')

report = {'status': 'running', 'base': BASE, 'checks': [], 'editions': {}, 'limitations': [
    'Local emitted-file verification only; no browser, live deployment or Linux package result is established.',
    'Source/rights and visual review are separate from structural and byte-level verification.',
    'JPEG output is a lossy delivery derivative; preserving original files is distinct from pixel equality.'
]}
try:
    manuscript = ROOT / 'kb/research/places/jirang-chandragiri-article.md'
    report['manuscript_sha256'] = sha(manuscript.read_bytes())
    check(report['manuscript_sha256'] == '6bbbc602670f2a156cfe3d969adcd3e014cfbf4cff9a8009a13385ac151d7563', 'Frozen manuscript hash matches')
    image = json.loads((ROOT / 'kb/research/destinations/jirang-chandragiri-image.json').read_text())
    variants = next(i['variants'] for i in json.loads((SITE / '.astro/responsive-image-report.json').read_text())['images'] if i['src'] == image['src'])
    check([v['width'] for v in variants] == [480, 960, 1200], 'Exactly three expected responsive widths')
    fragments = []
    for edition in ['dist', 'dist-coast', 'dist-publish']:
        base = SITE / edition
        html = (base / ROUTE.strip('/') / 'index.html').read_text()
        p = parsed(html)
        check(len(p.ids) == len(set(p.ids)), edition + ': unique page IDs')
        notes = [x for x in p.links if x.startswith('#user-content-fn')]
        check(len(notes) == 14 and all(x[1:] in p.ids for x in notes), edition + ': all 14 native citation/return targets resolve')
        check('Footnotes &amp; Sources' in html, edition + ': visible source heading')
        for key in ['og:image', 'twitter:image']:
            check(p.meta.get(key) == 'https://projectodisha.org' + image['src'], edition + ': ' + key + ' uses selected photograph')
        hero = next(i for i in p.imgs if i.get('src') == image['src'])
        check(hero.get('width') == '1200' and hero.get('height') == '757' and hero.get('loading') == 'eager', edition + ': hero intrinsic size and eager loading')
        check(hero.get('alt') == image['alt'], edition + ': hero alternative text matches metadata')
        check(sha((base / image['src'].lstrip('/')).read_bytes()) == image['public_derivative']['sha256'], edition + ': hero bytes match reviewed derivative')
        emitted = re.findall(r'(/images/responsive/[^ ,]+)', hero.get('srcset', ''))
        check(emitted == [v['src'] for v in variants], edition + ': hero srcset maps all three variants')
        for variant in variants:
            data = (base / variant['src'].lstrip('/')).read_bytes()
            check(len(data) == variant['bytes'] and sha(data) == variant['sha256'], edition + ': responsive hash ' + str(variant['width']))
        for credit in [image['creator'], image['source'], image['license_url'], image['changes']]:
            check(credit in html, edition + ': retained credit ' + credit[:45])
        cards = {}
        for incoming in ['destinations/hills', 'destinations', 'explore']:
            incoming_html = (base / incoming / 'index.html').read_text()
            matches = [card for card in re.findall(r'<article\b.*?</article>', incoming_html, re.S) if 'href="' + ROUTE + '"' in card]
            check(len(matches) == 1, edition + ': one mapped card on /' + incoming + '/')
            card = parsed(matches[0])
            check(any(i.get('src') == image['src'] and i.get('alt') == image['alt'] for i in card.imgs), edition + ': mapped preview photograph on /' + incoming + '/')
            cards['/' + incoming + '/'] = sha(matches[0].encode())
        fragment = re.search(r'<article\b.*?</article>', html, re.S).group()
        fragments.append(fragment)
        report['editions'][edition] = {'html_sha256': sha(html.encode()), 'article_fragment_sha256': sha(fragment.encode()), 'citation_return_links': len(notes), 'variants': emitted, 'incoming_card_sha256': cards}
    check(fragments[0] == fragments[1] == fragments[2], 'Article fragment byte-identical across full/coastal/publication output')
    report['media'] = {'image': image['src'], 'variants': variants, 'total_bytes': image['public_derivative']['bytes'] + sum(v['bytes'] for v in variants)}
    check(report['media']['total_bytes'] == 715678, 'Selected image and all responsive variants total 715678 bytes')

    mentis = 'assets/bhubaneswar-week/mentis-films.jpg'
    original = (SITE / 'public' / mentis).read_bytes()
    inherited = subprocess.check_output(['git', 'show', BASE + ':projects/site/public/' + mentis], cwd=ROOT)
    check(original == inherited, 'Mentis repository source matches inherited base')
    check(sha(original) == '798bc7eb53ac2fe76b29305d8c6d979952b32aa673156d7112291c94d11c1734', 'Mentis original known source hash')
    for edition in ['dist', 'dist-coast']:
        check((SITE / edition / mentis).read_bytes() == original, edition + ': Mentis original bytes preserved')
    derivative = (SITE / 'dist-publish' / mentis).read_bytes()
    check(len(derivative) == 1279563 and sha(derivative) == '49d0b2418bff5216afe5dd907acd7fcb0ff79b452a01bea97e702a29cf832d6d', 'Mentis delivered bytes match reviewed local candidate')
    code = """
import sharp from 'sharp';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const paths=['public/assets/bhubaneswar-week/mentis-films.jpg','dist-publish/assets/bhubaneswar-week/mentis-films.jpg'];
const a=await sharp(readFileSync(paths[0])).metadata(),b=await sharp(readFileSync(paths[1])).metadata();
console.log(JSON.stringify({source:[a.width,a.height],output:[b.width,b.height],orientation:[a.orientation,b.orientation],chroma:b.chromaSubsampling,metadata:Object.fromEntries(['icc','iptc','xmp'].map(k=>[k,{equal:Buffer.from(a[k]||[]).equals(Buffer.from(b[k]||[])),sha256:createHash('sha256').update(Buffer.from(b[k]||[])).digest('hex')}]))}));
"""
    dimensions = json.loads(subprocess.check_output([NODE, '--input-type=module', '-e', code], cwd=SITE))
    check(dimensions['source'] == [5712, 3213] and dimensions['output'] == [3072, 1728], 'Mentis full-frame geometry is 3072×1728 from 5712×3213')
    check(dimensions['orientation'][0] == dimensions['orientation'][1] and dimensions['chroma'] == '4:4:4', 'Mentis orientation retained and expected chroma format')
    check(all(m['equal'] for m in dimensions['metadata'].values()), 'Mentis ICC/IPTC/XMP preserved byte-exact')
    phrase = 'At Mentis Films during the week in Bhubaneswar. Photograph supplied by Ahimanikya Satapathy.'
    changed = phrase + ' Full frame, resized and compressed for web delivery.'
    conversations = 'A moment from a week of conversations. Photograph supplied by Ahimanikya Satapathy.'
    for edition in ['dist', 'dist-coast', 'dist-publish']:
        html = (SITE / edition / 'stories/bhubaneswar-week/index.html').read_text()
        captions = re.findall(r'<figcaption\b[^>]*>(.*?)</figcaption>', html, re.S)
        check((changed if edition == 'dist-publish' else phrase) in captions, edition + ': exact Mentis caption')
        check((conversations + ' Full frame, resized and compressed for web delivery.' if edition == 'dist-publish' else conversations) in captions, edition + ': sibling photograph caption preserved')
        check(parsed(html).meta.get('og:image', '').endswith('/assets/bhubaneswar-week/poem-conversations-v1.png'), edition + ': unrelated sharing illustration preserved')
    report['mentis'] = {'source_bytes': len(original), 'source_sha256': sha(original), 'output_bytes': len(derivative), 'output_sha256': sha(derivative), 'saved_bytes': len(original)-len(derivative), 'metadata': dimensions}

    operations_path = 'kb/team/operations.json'
    current = json.loads((ROOT / operations_path).read_text())
    old = json.loads(subprocess.check_output(['git', 'show', BASE + ':' + operations_path], cwd=ROOT))
    for key in ['current_task', 'handoff_home']:
        check(current[key] == old[key], 'Foreign operations.' + key + ' unchanged from inherited base')
    report['foreign_ownership'] = {key: current[key] for key in ['current_task', 'handoff_home']}
    files = [p for p in (SITE / 'dist-publish').rglob('*') if p.is_file()]
    size = sum(p.stat().st_size for p in files)
    check(size < 1_000_000_000, 'Actual local publication below strict decimal 1GB gate')
    report['payload'] = {'files': len(files), 'bytes': size, 'limit_bytes': 1_000_000_000, 'remaining_bytes': 1_000_000_000-size}
    report['build_results_seen'] = builds
    report['status'] = 'pass'
except Exception as error:
    report['status'] = 'fail'
    report['error'] = str(error)
finally:
    (OUT / 'local-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'payload': report.get('payload'), 'error': report.get('error')}))
if report['status'] != 'pass': sys.exit(1)
