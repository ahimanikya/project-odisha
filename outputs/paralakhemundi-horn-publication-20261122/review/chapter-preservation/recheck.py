"""Read-only rerun against current live content and an existing local build.
Run: python3 recheck.py [repository-root]
The saved report remains the record of the pre-publication observation.
"""
from pathlib import Path
import sys,json,re,hashlib,urllib.request
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[4]
report=json.loads(Path(__file__).with_name('report.json').read_text())
pattern=re.compile(r'<article\b[^>]*class="culture-book culture-reading"[^>]*>[\s\S]*?</article>')
for result in report['results']:
 route=result['route']
 local=(root/'projects/site/dist'/route.lstrip('/')/'index.html').read_text()
 request=urllib.request.Request('https://projectodisha.org'+route,headers={'User-Agent':'ProjectOdisha preservation recheck/1.0'})
 with urllib.request.urlopen(request,timeout=30) as response:live=response.read().decode()
 a=pattern.search(local).group();b=pattern.search(live).group()
 raw_equal=a==b
 for pair in result.get('observed_image_url_pairs',[]):a=a.replace(pair['local'],pair['live'])
 print(json.dumps({'route':route,'raw_equal':raw_equal,'saved_pair_normalized_equal':a==b,'live_matches_saved_observation':hashlib.sha256(b.encode()).hexdigest()==result['live_fragment_sha256']}))
