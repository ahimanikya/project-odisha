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
        for path in ['assets/lemon-moderation.svg','assets/lemon-heritage-v1.png']:
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
        for source in d['sources']:
            if source.get('bibliography'):self.assertIn(escape(source['bibliography'],quote=True),out)
        self.assertEqual(len(p.ids),len(set(p.ids)))
        for link in p.links:
            if link.startswith('#'):self.assertIn(link[1:],p.ids)
        for path in p.resources:self.assertTrue((ROOT/path).is_file(),path)

if __name__=='__main__':unittest.main()
