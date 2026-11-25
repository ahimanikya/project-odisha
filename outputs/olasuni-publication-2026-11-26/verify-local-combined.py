"""Read completed Olasuni artifacts; no build, network, copies or publication."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib, json, re, subprocess

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
SITE = ROOT / 'projects/site'
NODE = '/Users/ahimanikya/.nvm/versions/node/v25.8.1/bin/node'
sha = lambda b: hashlib.sha256(b).hexdigest()
report = {'status': 'RUNNING', 'checks': [], 'editions': {}, 'limitations': [
    'Local artifact evidence only; no hosted capacity, visual, browser or live acceptance inferred.',
    'Exact local JPEG encoding is pinned; hosted differences require separate byte/pixel/visual review.',
    'Nilagiri and Jhoti are already published; their public prose and selected derivatives are permitted.',
]}

def read(path):
    return json.loads(path.read_text())

def check(ok, label):
    if not ok:
        raise AssertionError(label)
    report['checks'].append(label)

def plain(text):
    return ' '.join(unescape(re.sub('<[^>]+>', ' ', text)).split())

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=[]; self.links=[]; self.images=[]; self.meta={}; self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag=='a': self.links.append(attrs.get('href',''))
        if tag=='img': self.images.append(attrs)
        if tag=='meta': self.meta[attrs.get('property',attrs.get('name',''))]=attrs.get('content')

def fragment(text):
    matches=re.findall(r'<article\b[^>]*class="[^"]*article-reading[^"]*"[^>]*>.*?</article>',text,re.S)
    check(len(matches)==1,'Exactly one primary article fragment')
    return matches[0]

def file_hash(path):
    digest=hashlib.sha256()
    with path.open('rb') as handle:
        for block in iter(lambda:handle.read(1024*1024),b''):
            digest.update(block)
    return digest.hexdigest()

def main():
    c=read(OUT/'reviewed-article-contract-combined.json')
    stages=read(OUT/'build-results-combined.json')
    order=['full-build','full-disclosures','full-tests','coast-build','coast-disclosures','coast-tests','coast-acceptance','coast-discovery','search-review','launch-readiness','publication-build','publication-disclosures','search-shortlist']
    check([x['stage'] for x in stages]==order and all(x['exit_code']==0 for x in stages),'All thirteen ordered build/test/audit stages passed')
    check(len(c['source_hashes'])==24,'Exactly twenty-four frozen source paths')
    for path,digest in c['source_hashes'].items():
        check(file_hash(ROOT/path)==digest,'Current frozen source '+path)
    for stage in stages:
        check(stage.get('source_hashes')==c['source_hashes'],'Identical twenty-four source hashes in '+stage['stage'])
        check(stage.get('manuscript_sha256')==c['manuscript_sha256'],'Reviewed manuscript used in '+stage['stage'])
        check(stage.get('dhaga_pdf_sha256')==c['dhaga_descriptor']['sha256'],'Pinned Dhaga PDF used in '+stage['stage'])
    check(file_hash(ROOT/c['manuscript'])==c['manuscript_sha256'],'Exact reviewed Olasuni manuscript')
    im=read(ROOT/c['image_record'])
    check(im==c['image'],'Frozen selected image metadata')
    check(file_hash(ROOT/im['original']['path'])==im['original']['sha256'],'Exact source photograph retained')
    check(file_hash(ROOT/im['public']['path'])==im['public']['sha256'],'Exact selected public image retained')
    variants=[x for x in read(SITE/'.astro/responsive-image-report.json')['images'] if x['src']==im['src']]
    check(len(variants)==1,'Exactly one responsive image source record')
    variants=variants[0]['variants']
    check([x['width'] for x in variants]==c['variant_widths'],'Three expected responsive widths')
    check(file_hash(ROOT/'projects/odia-dhaga/pdf-delivery.json')==c['dhaga_descriptor_sha256'],'Pinned Dhaga descriptor bytes unchanged')
    descriptor=read(ROOT/'projects/odia-dhaga/pdf-delivery.json')
    check(descriptor==c['dhaga_descriptor'],'Pinned Dhaga descriptor fields')
    check(file_hash(ROOT/'projects/odia-dhaga/odia-dhaga-book.pdf')==descriptor['sha256'],'Hydrated source Dhaga PDF identity')
    bodies=[]
    for edition in ['dist','dist-coast','dist-publish']:
        base=SITE/edition
        html=(base/c['route'].strip('/')/'index.html').read_text()
        body=fragment(html); bodies.append(body); page=Page(html)
        check(len(page.ids)==len(set(page.ids)),edition+': unique IDs')
        refs=[x for x in page.links if x.startswith('#user-content-fn-')]
        returns=[x for x in page.links if x.startswith('#user-content-fnref-')]
        check(len(refs)==c['references'] and len(set(refs))==c['unique_notes'] and len(returns)==c['returns'] and len(set(returns))==c['returns'] and all(x[1:] in page.ids for x in refs+returns),edition+': reviewed references, notes and resolved returns')
        rendered_paragraphs=[plain(re.sub(r'<sup\b[^>]*>.*?</sup>','',x,flags=re.S)) for x in re.findall(r'<p\b[^>]*>(.*?)</p>',body,re.S)]
        for paragraph in c['paragraphs']:
            check(plain(paragraph) in rendered_paragraphs,edition+': exact reviewed body paragraph '+paragraph[:35])
        for url in c['source_urls']: check(url in page.links,edition+': exact source URL '+url)
        for label in ['By Ahimanikya Satapathy','Footnotes & Sources','Continue reading','Further reading','Suggest an update']:
            check(label in plain(body),edition+': visible '+label)
        check('/contribute/?page=%2Fdestinations%2Folasuni%2F' in page.links,edition+': article-specific update link')
        for key in ['og:image','twitter:image']: check(page.meta.get(key)=='https://projectodisha.org'+im['src'],edition+': matching '+key)
        for key,value in [('og:image:width',str(im['width'])),('og:image:height',str(im['height']))]: check(page.meta.get(key)==value,edition+': '+key)
        figures=[x for x in re.findall(r'<figure\b[^>]*>.*?</figure>',body,re.S) if im['src'] in x]
        check(len(figures)==1,edition+': one credited hero figure')
        fp=Page(figures[0]); hero=next(x for x in fp.images if x.get('src')==im['src'])
        check([hero.get(k) for k in ['width','height','loading','fetchpriority']]==[str(im['width']),str(im['height']),'eager','high'],edition+': intrinsic geometry and hero loading')
        check(hero.get('alt')==im['alt'],edition+': exact image alt')
        srcset={int(w):u for u,w in re.findall(r'(/[^ ,]+)\s+(\d+)w',hero.get('srcset',''))}
        check(srcset=={v['width']:v['src'] for v in variants},edition+': complete responsive hero mapping')
        captions=re.findall(r'<figcaption\b[^>]*>(.*?)</figcaption>',figures[0],re.S)
        check(len(captions)==1,edition+': one caption')
        for value in [im['caption'],im['creator'],im['license'],im['changes']]: check(value in plain(captions[0]),edition+': caption '+value)
        for value in [im['source'],im['license_url']]: check(value in Page(captions[0]).links,edition+': linked photo credit '+value)
        check(file_hash(base/im['src'].lstrip('/'))==im['public']['sha256'],edition+': exact reviewed base image')
        for variant in variants:
            p=base/variant['src'].lstrip('/')
            check(p.stat().st_size==variant['bytes'] and file_hash(p)==variant['sha256'],edition+': exact responsive file '+str(variant['width']))
            check(p.name.startswith(variant['sha256'][:16]+'-'),edition+': content-addressed responsive filename')
        for incoming in ['destinations/hills','destinations','explore']:
            text=(base/incoming/'index.html').read_text()
            cards=[x for x in re.findall(r'<article\b[^>]*>.*?</article>',text,re.S) if 'href="'+c['route']+'"' in x]
            check(len(cards)==1,edition+': unique incoming card '+incoming)
            check(any(x.get('src')==im['src'] and x.get('alt')==im['alt'] for x in Page(cards[0]).images),edition+': same photographed preview '+incoming)
            credits=[x for x in re.findall(r'<li\b[^>]*>.*?</li>',text,re.S) if im['source'] in unescape(x)]
            check(bool(credits),edition+': preview source credit '+incoming)
            for value in [im['creator'],im['source'],im['license_url'],im['changes']]: check(any(value in unescape(x) for x in credits),edition+': preview credit '+incoming+' '+value)
        for route in c['reading_routes']:
            check(route in Page(body).links and (base/route.strip('/')/'index.html').is_file(),edition+': valid reading route '+route)
        pdf=base/'archive'/descriptor['asset_name']
        check(pdf.stat().st_size==descriptor['bytes'] and file_hash(pdf)==descriptor['sha256'],edition+': exact pinned Dhaga PDF')
        report['editions'][edition]={'article_sha256':sha(body.encode()),'references':len(refs),'notes':len(set(refs)),'returns':len(returns)}
    check(bodies[0]==bodies[1]==bodies[2],'Exact Olasuni article fragment across three editions')
    paths=[str(SITE/'dist-publish'/im['src'].lstrip('/'))]+[str(SITE/'dist-publish'/v['src'].lstrip('/')) for v in variants]
    js="import sharp from 'sharp';console.log(JSON.stringify(await Promise.all(JSON.parse(process.argv[1]).map(async p=>{const m=await sharp(p).metadata();return [m.width,m.height]}))));"
    dims=json.loads(subprocess.check_output([NODE,'--input-type=module','-e',js,json.dumps(paths)],cwd=SITE))
    check(dims==[[1440,644],[480,215],[960,429],[1440,644]],'Independent image decoding confirms source and variant dimensions')
    manifest=ROOT/c['protected_manifest']
    check(file_hash(manifest)==c['protected_manifest_sha256'],'Frozen protected preparation manifest')
    protected=read(manifest); check(len(protected)==c['protected_count']==88,'All eighty-eight protected preparation files listed')
    for row in protected: check(file_hash(ROOT/row['path'])==row['sha256'],'Preserved preparation '+row['path'])
    op='kb/team/operations.json'; old=json.loads(subprocess.check_output(['git','show',c['base']+':'+op],cwd=ROOT)); now=read(ROOT/op)
    for key in ['current_task','handoff_home','current_preparation']: check(old[key]==now[key],'Foreign ownership unchanged '+key)
    # Published Nilagiri/Jhoti content is allowed; internal raw sources and Kaincha remain excluded.
    internal=[x for x in protected if ('kaincha' in x['path'] or 'kula' in x['path']) or x['path'].endswith(('nilagiri-stone-utensils-illustration.png','gurubara-jhoti-commons-1920.jpg'))]
    hashes={x['sha256'] for x in internal}; sizes={(ROOT/x['path']).stat().st_size for x in internal}
    forbidden=['The kula (କୁଲା) belongs to the work of cleaning grain.','kula-and-the-work-of-winnowing','kula-trays-1200.webp','winnowing-fan1-original.jpg','Kula and the Work of Winnowing','kaincha-and-golden-grass','golden-grass-square-box.jpg','nilagiri-stone-utensils-illustration.png','gurubara-jhoti-commons-1920.jpg','Golden grass takes its name from the lustre of the dried material.','Kaincha: Making with Golden Grass']
    for edition in ['dist-coast','dist-publish']:
        base=SITE/edition
        for p in base.rglob('*'):
            check(not p.is_symlink(),edition+': no symlink '+str(p.relative_to(base)))
            if not p.is_file(): continue
            name=str(p.relative_to(base))
            check(not name.startswith(('kb/','outputs/')) and not any(x in name for x in forbidden),edition+': no internal export path '+name)
            if p.stat().st_size in sizes: check(file_hash(p) not in hashes,edition+': no exact internal source bytes '+name)
            if p.suffix in ['.html','.json','.md','.txt','.js','.mjs']:
                text=p.read_text(errors='replace'); text_plain=plain(text)
                check(not any(x in text or x in text_plain for x in forbidden),edition+': no internal draft/source text '+name)
    cap=c['capacity']; asset=cap['path']
    for edition in ['public','dist','dist-coast']:
        check(file_hash(SITE/edition/asset)==cap['source']['sha256'],'Original Mentis photograph '+edition)
        check(file_hash(SITE/edition/cap['second_path'])==cap['second_source_sha256'],'Original second photograph '+edition)
        check(file_hash(SITE/edition/cap['sharing_path'])==cap['sharing_source_sha256'],'Original sharing illustration '+edition)
    check(file_hash(SITE/'dist-publish'/asset)==cap['candidate']['sha256'],'Exact reviewed Mentis q86 delivery')
    check(file_hash(SITE/'dist-publish'/cap['second_path'])==cap['second_delivery_sha256'],'Unchanged second-photo delivery encoding')
    check(file_hash(SITE/'dist-publish'/cap['sharing_path'])==cap['sharing_delivery_sha256'],'Unchanged sharing illustration delivery encoding')
    optimized=next(x for x in read(SITE/'.astro/publication-jpeg-optimization.json')['files'] if x['path']==asset)
    check(optimized['output_sha256']==cap['candidate']['sha256'] and optimized['source_sha256']==cap['source']['sha256'] and optimized['output_bytes']==cap['candidate']['bytes'],'Actual JPEG report binds approved source and candidate')
    check(optimized['settings']['quality']==86 and optimized['settings']['maximum_dimension']==3072 and optimized['output_dimensions']==[3072,1728],'Only reviewed Mentis dimensions and quality')
    coast=(SITE/'dist-coast'/cap['page']).read_text(); published=(SITE/'dist-publish'/cap['page']).read_text()
    source_body=fragment((SITE/'dist'/cap['page']).read_text()); coastal_body=fragment(coast); public_body=fragment(published)
    check(source_body==coastal_body,'Full/coastal Bhubaneswar article unchanged')
    expected=coastal_body
    for phrase in ['A moment from a week of conversations. Photograph supplied by Ahimanikya Satapathy.','At Mentis Films during the week in Bhubaneswar. Photograph supplied by Ahimanikya Satapathy.']:
        check(expected.count(phrase)==1,'Unique original Bhubaneswar photo caption')
        expected=expected.replace(phrase,phrase+' Full frame, resized and compressed for web delivery.')
    check(expected==public_body,'Bhubaneswar article differs only by existing two photo-delivery disclosures')
    for text in [coast,published]:
        page=Page(text)
        check(page.meta.get('og:image')=='https://projectodisha.org/'+cap['sharing_path'] and page.meta.get('twitter:image')=='https://projectodisha.org/'+cap['sharing_path'],'Bhubaneswar separate sharing illustration retained')
        check(page.meta.get('og:image:width')=='1536' and page.meta.get('og:image:height')=='1024','Bhubaneswar sharing dimensions unchanged')
    files=[p for p in (SITE/'dist-publish').rglob('*') if p.is_file()]
    total=sum(p.stat().st_size for p in files)
    check(total<1_000_000_000,'Actual complete publication payload below strict decimal-billion limit')
    report['payload']={'bytes':total,'files':len(files),'remaining_bytes':1_000_000_000-total}
    report['variants']=variants; report['source_hash_count']=24; report['protected_files']=88; report['status']='PASS'

if __name__=='__main__':
    try:
        main()
    except Exception as exc:
        report['status']='FAIL'; report['error']=repr(exc); raise
    finally:
        report['check_count']=len(report['checks'])
        (OUT/'local-verification-combined.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({key:report.get(key) for key in ['status','check_count','payload','error']}))
