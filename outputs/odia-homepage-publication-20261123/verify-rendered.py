from pathlib import Path
from lxml import html,etree
import json,hashlib,zipfile,sys
root=Path('/Users/ahimanikya/.codex/worktrees/odia-homepage-article/dongria-release-20261105')
archive=Path('/Users/ahimanikya/Documents/ChatGPT/Odia Archive/archive/first-odia-home-page/provided')
base=Path(sys.argv[1]) if len(sys.argv)>1 else root/'projects/site/dist'
page=base/'stories/when-odisha-became-a-homepage/index.html'
doc=html.fromstring(page.read_bytes());body=doc.get_element_by_id('approved-article')
norm=lambda x:' '.join(x.split())
import re
original=(root/'outputs/odia-homepage-publication-20261123/approved-article.md').read_text()
expected=[norm(re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',re.sub(r'^#{1,2} ', '',p))) for p in re.split(r'\n\s*\n',original) if p.strip() and not p.strip().startswith('![')]
actual=[norm(doc.xpath('//h1')[0].text_content())]+[norm(e.text_content()) for e in body.xpath('.//p|.//figcaption|.//h2')]
assert actual==expected,[(i,a,b) for i,(a,b) in enumerate(zip(actual,expected)) if a!=b]
provenance=json.loads((root/'outputs/odia-homepage-publication-20261123/approved-provenance.json').read_text());images=body.xpath('.//img');assert [Path(x.get('src')).name for x in images]==provenance['displayed_media_order'];assert len(body.xpath('.//figure'))==8
for i in images:
 target=base/i.get('src').lstrip('/');original=root/'projects/site/public/images/stories/odia-homepage'/target.name
 assert target.read_bytes()==original.read_bytes(),str(target)
 assert int(i.get('width'))>0 and int(i.get('height'))>0
links=[(x.text_content(),x.get('href')) for x in body.xpath('.//a')];assert len(links)==8
report={'result':'pass','build':str(base),'paragraphs_equal_approved_article':len(actual),'source_links':len(links),'images_exact_original_bytes':len(images),'caption_groups':8,'image_order':provenance['displayed_media_order'],'page_sha256':hashlib.sha256(page.read_bytes()).hexdigest()}
print(json.dumps(report,indent=2))
