import copy
import tempfile
import unittest
from pathlib import Path
from html.parser import HTMLParser
from build import render, validate, build, ROOT

def fixture():
    return {'title':'Odia sayings','subtitle':'A seed collection','scope_note':'Not exhaustive','checked_on':'2026-10-23',
    'sources':[{'id':'source-1','title':'Witness','url':'https://example.org/book','access':'Public','rights':'Unresolved','limits':'One witness'}],
    'entries':[{'id':'POD-DHAGA-001','odia':'ଅତି ଲେମ୍ବୁ','literal_meaning':'Literal','explanation':'Explanation','usage_example':'Example','cultural_context':'Context','origin_note':'Unknown','rights_note':'Limited quote','tags':['moderation'],'witnesses':[{'source_id':'source-1','locator':'p. 1'}],'variants':[]}]}

class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.resources=[]; self.scripts=0; self.entries=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a':self.links.append(a.get('href',''))
        if tag in ('img','script','iframe','link') and ('src' in a or 'href' in a):self.resources.append(a.get('src',a.get('href')))
        if tag=='script':self.scripts+=1
        if tag=='article':self.entries.append(a)

class RepositoryTests(unittest.TestCase):
    def test_valid_and_all_static_entries_without_javascript(self):
        data=fixture(); out=render(data); p=Document();p.feed(out)
        self.assertEqual(len(p.entries),1); self.assertNotIn('hidden',p.entries[0])
        self.assertIn(data['entries'][0]['odia'],out)
        self.assertEqual(len(p.ids),len(set(p.ids)))
        for link in p.links:
            if link.startswith('#'):self.assertIn(link[1:],p.ids)
    def test_missing_and_duplicate_ids(self):
        for kind in ['sources','entries']:
            d=fixture();del d[kind][0]['id']
            with self.assertRaises(ValueError):validate(d)
            d=fixture();d[kind].append(copy.deepcopy(d[kind][0]))
            with self.assertRaises(ValueError):validate(d)
    def test_missing_provenance_and_dangling_sources(self):
        for change in ['missing','dangling','locator']:
            d=fixture()
            if change=='missing':d['entries'][0]['witnesses']=[]
            elif change=='dangling':d['entries'][0]['witnesses'][0]['source_id']='absent'
            else:del d['entries'][0]['witnesses'][0]['locator']
            with self.assertRaises(ValueError):validate(d)
        d=fixture();d['entries'][0]['variants']=[{'odia':'variant','note':'note','source_id':'absent'}]
        with self.assertRaises(ValueError):validate(d)
    def test_untrusted_text_cannot_inject_script_or_attributes(self):
        d=fixture();attack='</script><script>alert("x")</script><img src=x onerror=alert(1)>'
        for key in ['title','subtitle','scope_note']:d[key]=attack
        for key in ['odia','explanation','origin_note']:d['entries'][0][key]=attack
        d['entries'][0]['tags']=[attack]; out=render(d);p=Document();p.feed(out)
        self.assertEqual(p.scripts,1);self.assertEqual(p.resources,[])
        self.assertIn('&lt;/script&gt;',out);self.assertNotIn(attack,out)
    def test_unsafe_source_url_and_graphic_path_rejected(self):
        for url in ['javascript:alert(1)','//example.org','file:///etc/passwd']:
            d=fixture();d['sources'][0]['url']=url
            with self.assertRaises(ValueError):validate(d)
        for path in ['../secret.svg','assets/../secret.png','assets/%2e%2e/secret.png','https://example.org/a.png','assets/x.png?query=1']:
            d=fixture();d['entries'][0]['graphic']={'src':path,'alt':'alt','caption':'caption'}
            with self.assertRaises(ValueError):validate(d)
        for path in ['assets/dhaga-008-unified-line-v1.svg','assets/dhaga-cultural-cover-v2.png']:
            d=fixture();d['entries'][0]['graphic']={'src':path,'alt':'alt','caption':'caption'}
            validate(d)
            self.assertIn('src="'+path+'"',render(d))
    def test_offline_resources_and_no_network_calls(self):
        out=render(fixture());p=Document();p.feed(out)
        self.assertEqual(p.resources,[])
        for forbidden in ['fetch(', 'XMLHttpRequest', 'https://fonts', 'src="https://']:
            self.assertNotIn(forbidden,out)
        self.assertTrue((ROOT/'assets/NotoSerifOriya-Variable.woff2').is_file())
        self.assertTrue((ROOT/'assets/SourceSerif4-OFL.txt').is_file())
    def test_invalid_input_does_not_replace_existing_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            src=Path(tmp)/'bad.json';dst=Path(tmp)/'index.html';src.write_text('{}');dst.write_text('original')
            with self.assertRaises(ValueError):build(src,dst)
            self.assertEqual(dst.read_text(),'original')
    def test_integrated_collection_if_present(self):
        source=ROOT/'collection.json'
        if not source.exists():self.skipTest('Canonical collection not yet supplied')
        import json
        d=json.loads(source.read_text());out=render(d);p=Document();p.feed(out)
        self.assertEqual(len(p.entries),len(d['entries']))
        from html import escape
        for entry in d['entries']:
            if entry.get('meaning_odia'):self.assertIn('<p class="odia" lang="or">'+escape(entry['meaning_odia'],quote=True),out)
            if entry.get('title'):self.assertIn(escape(entry['title'],quote=True),out)
        cited = {item['source_id'] for entry in d['entries']
                 for item in entry['witnesses'] + entry.get('variants', []) if item.get('source_id')}
        for source in d['sources']:
            if source['id'] in cited:
                self.assertIn('source-'+source['id'],p.ids)
                if source.get('bibliography'):self.assertIn(escape(source['bibliography'],quote=True),out)
            else:
                self.assertNotIn('source-'+source['id'],p.ids)
        self.assertEqual(len(p.ids),len(set(p.ids)))
        for link in p.links:
            if link.startswith('#'):self.assertIn(link[1:],p.ids)
        for path in p.resources:self.assertTrue((ROOT/path).is_file(),path)

class CulturalEditionTests(unittest.TestCase):
    def test_structured_intro_preserves_bilingual_prose_and_resolving_notes(self):
        from build import validate, introduction_html
        d=fixture();sid=d['sources'][0]['id']
        d['book_intro']={'odia':[],'english':[],'sections':[{'id':'culture','title_odia':'ଢଗ','title_english':'Culture','paragraphs':[{'odia':'ଓଡ଼ିଆ କଥା','english':'A <living> expression & context.','source_ids':[sid]}]}]}
        d['book_intro']['sections'][0]['paragraphs'].append({'odia':'ଦ୍ୱିତୀୟ କଥା','english':'Another use of the same source.','source_ids':[sid]})
        validate(d);out=introduction_html(d);doc=Document();doc.feed(out)
        for anchor in ['intro-ref-culture-0','intro-ref-culture-1']:
            self.assertIn('href="#'+anchor+'"',out);self.assertIn('href="#'+anchor+'-or"',out)
        self.assertIn('ଓଡ଼ିଆ କଥା',out);self.assertIn('A &lt;living&gt; expression &amp; context.',out)
        for link in doc.links:
            if link.startswith('#'):self.assertIn(link[1:],doc.ids)
        d['book_intro']['sections'][0]['paragraphs'][0]['source_ids']=['missing']
        with self.assertRaisesRegex(ValueError,'dangling intro source'):validate(d)
    def test_cover_requires_safe_path_and_intrinsic_dimensions(self):
        from build import validate
        d=fixture();d['cover']={'src':'assets/cover.png','width':1055,'height':1491,'alt':'Portrait illustration','title_odia':'ଢଗ','title_english':'Dhaga','subtitle':'Odia and English','byline':'Project Odisha'}
        validate(d);d['cover']['src']='../cover.png'
        with self.assertRaisesRegex(ValueError,'local assets'):validate(d)
        d['cover']['src']='assets/cover.png';d['cover']['width']=0
        with self.assertRaisesRegex(ValueError,'intrinsic'):validate(d)

class LibraryFileTests(unittest.TestCase):
    def test_default_cli_reads_entry_folder_deterministically(self):
        import subprocess,sys
        before=(ROOT/'collection.json').read_bytes()
        subprocess.run([sys.executable,str(ROOT/'build.py')],cwd=ROOT,check=True,capture_output=True)
        self.assertEqual(before,(ROOT/'collection.json').read_bytes())
        self.assertTrue((ROOT/'sayings'/'POD-DHAGA-108.html').is_file())
    def test_folder_parity_and_bad_filename(self):
        import json
        from build import load_library
        data=load_library();self.assertEqual(data,json.loads((ROOT/'collection.json').read_text()))
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp);(folder/'entries').mkdir();d=fixture();(folder/'collection-metadata.json').write_text(json.dumps({k:v for k,v in d.items() if k!='entries'}))
            (folder/'entries'/'wrong.json').write_text(json.dumps(d['entries'][0]))
            with self.assertRaisesRegex(ValueError,'filename'):load_library(folder)
    def test_every_reading_has_one_saying_and_resolving_navigation(self):
        from html import escape
        from build import load_library
        data=load_library()
        for i,e in enumerate(data['entries']):
            path=ROOT/'sayings'/(e['id']+'.html');out=path.read_text();doc=Document();doc.feed(out)
            self.assertEqual(len(doc.entries),1);self.assertEqual(doc.entries[0]['id'],e['id']);self.assertNotIn('hidden',doc.entries[0])
            self.assertIn('<details class="saying-detail" open>',out)
            self.assertNotIn('id="pagination"',out)
            if e.get('meaning_odia'):self.assertIn(escape(e['meaning_odia'],quote=True),out)
            expected={x['source_id'] for x in e['witnesses']+e.get('variants',[]) if x.get('source_id')}
            actual={x.removeprefix('source-') for x in doc.ids if x.startswith('source-')}
            self.assertEqual(actual,expected)
            for link in doc.links:
                if link.startswith(('https:','http:','#')):continue
                self.assertTrue((path.parent/link.split('#')[0]).is_file(),link)
            for resource in doc.resources:self.assertTrue((path.parent/resource).is_file())
            if i:self.assertIn(data['entries'][i-1]['id']+'.html',out)
            if i+1<len(data['entries']):self.assertIn(data['entries'][i+1]['id']+'.html',out)
    def test_collection_article_preserves_bilingual_summaries_and_shelves(self):
        from build import load_library
        import json
        from html import escape
        data=load_library();out=(ROOT/'index.html').read_text();design=json.loads((ROOT/'research-design.json').read_text())
        self.assertEqual(set(design['id_to_shelf']),{e['id'] for e in data['entries']})
        for e in data['entries']:
            self.assertIn('id="'+e['id']+'"',out)
            for key in ['odia']:
                if e.get(key):self.assertIn('<h2 lang="or">'+escape(e[key],quote=True).replace('\n','<br>')+'</h2>',out)
            self.assertIn('sayings/'+e['id']+'.html',out)
        for brief in data['entries']:
            self.assertIn(escape(brief['odia_summary'],quote=True),out)
            self.assertIn(escape(brief['english_summary'],quote=True),out)
        from build import source_heading
        self.assertEqual(source_heading('<img src=x>\n& second'), '&lt;img src=x&gt;<br>&amp; second')
        for e in data['entries']:
            heading='<h2 lang="or">'+escape(e['odia'],quote=True).replace('\n','<br>')+'</h2>'
            self.assertIn(heading,(ROOT/'sayings'/f"{e['id']}.html").read_text())
        self.assertNotIn('editorial_status',out)
        self.assertNotIn('AI-assisted',out)
        self.assertIn('<p>By Ahimanikya Satapathy</p>',out)

if __name__=='__main__':unittest.main()
