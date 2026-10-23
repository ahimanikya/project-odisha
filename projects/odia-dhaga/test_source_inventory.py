import copy
import unittest
from build_source_inventory import render, validate

class SourceInventoryTests(unittest.TestCase):
    def setUp(self):
        self.collection={'entries':[{'id':'POD-DHAGA-001'}]}
        self.data={'title':'Source <127>','scope_note':'Not full text','source':{'title':'Source','url':'https://example.org/source','date':'2017','rights_note':'Unverified'},'positions':[{'number':n,'status':'awaiting_independent_witness','collection_ids':[],'duplicate_of':None,'notes':[]} for n in range(1,128)]}
    def test_complete_static_output_and_escaping(self):
        self.data['positions'][0]['notes']=['<script>alert(1)</script>']
        out=render(self.data,self.collection)
        self.assertIn('127 source positions · 1 explained reader entries',out)
        self.assertEqual(out.count('id="position-'),127)
        self.assertNotIn('<script>',out)
        self.assertIn('&lt;script&gt;',out)
        self.assertNotIn('src="http',out)
    def test_candidate_provenance_and_escaping(self):
        position=self.data['positions'][0]
        position.update(status='independent_witness_candidate',user_wording='<unsafe>',candidate={'odia':'ଢଗ <x>','source_title':'Witness','source_url':'https://example.org/witness','locator':'item1','note':'Not exact blog wording'})
        out=render(self.data,self.collection)
        self.assertIn('Independent witness candidate',out)
        self.assertIn('not necessarily the exact wording',out)
        self.assertIn('&lt;unsafe&gt;',out)
        position['candidate']['source_url']='javascript:alert(1)'
        with self.assertRaises(ValueError):validate(self.data,self.collection)
        position['candidate'].pop('locator')
        with self.assertRaises(ValueError):validate(self.data,self.collection)
    def test_missing_duplicate_or_boolean_number_rejected(self):
        for replacement in (0,2,True):
            data=copy.deepcopy(self.data);data['positions'][0]['number']=replacement
            with self.assertRaises(ValueError):validate(data,self.collection)
    def test_links_and_duplicate(self):
        self.data['positions'][0].update(status='existing_reader_match',collection_ids=['POD-DHAGA-001'])
        self.data['positions'][1].update(status='duplicate_source_position',duplicate_of=1)
        out=render(self.data,self.collection)
        self.assertIn('index.html#POD-DHAGA-001',out);self.assertIn('href="#position-1"',out)
        self.data['positions'][0]['collection_ids']=['MISSING']
        with self.assertRaises(ValueError):validate(self.data,self.collection)
    def test_duplicate_bounds_cycle_and_unsafe_url(self):
        for target in (0,128,1,True):
            data=copy.deepcopy(self.data);data['positions'][0].update(status='duplicate_source_position',duplicate_of=target)
            with self.assertRaises(ValueError):validate(data,self.collection)
        self.data['positions'][0].update(status='duplicate_source_position',duplicate_of=2)
        self.data['positions'][1].update(status='duplicate_source_position',duplicate_of=1)
        with self.assertRaises(ValueError):validate(self.data,self.collection)
        self.data['source']['url']='javascript:alert(1)'
        with self.assertRaises(ValueError):validate(self.data,self.collection)

if __name__=='__main__':unittest.main()
