"""Regression checks for incompatible ownership and false role activation."""
import json,unittest
from check_team_assignments import ROOT,validate
class OwnershipTests(unittest.TestCase):
    def setUp(self):
        def load(p):return json.loads((ROOT/'kb'/p).read_text())
        self.a=load('team/assignments.json');self.o=load('team/operations.json');self.q=load('records/article-editorial-rollout.json');self.d=load('registers/records.json')['decisions']
    def check(self):return validate(self.a,self.o,self.q,self.d)
    def active_claim_fixture(self):
        """Create ownership inputs independently of the current runtime phase."""
        self.q['items']=[
            {'id':'POD-EDIT-999901','route':'/test-owned-article/','status':'in_progress'},
            {'id':'POD-EDIT-999902','route':'/test-next-article/','status':'queued'},
        ]
        self.o['current_article']={
            'id':'POD-EDIT-999901','route':'/test-owned-article/',
            'owner':'Disha','phase':'reviewing',
        }
        self.assertEqual(self.check(),[])
    def test_current_records(self):self.assertEqual(self.check(),[])
    def test_explicit_active_claim_accepted(self):self.active_claim_fixture()
    def test_idle_without_claim_accepted(self):
        self.active_claim_fixture()
        self.q['items'][0]['status']='queued'
        self.o['current_article']=None
        self.assertEqual(self.check(),[])
    def test_second_article_rejected(self):
        self.active_claim_fixture()
        next(x for x in self.q['items'] if x['status']=='queued')['status']='in_progress'
        self.assertIn('Only one article may be active',self.check())
    def test_worker_cannot_claim_publication(self):
        self.o['publisher']='Samanta';self.assertTrue(self.check())
    def test_role_pass_cannot_masquerade_as_subagent(self):
        self.a['assignments'][1]['execution_mode']='labelled_role_pass_in_current_conversation';self.assertTrue(self.check())
    def test_human_reports_rejected(self):
        self.a['assignments'][1]['human_reports']=['Example human'];self.assertTrue(self.check())
    def test_missing_claim_rejected(self):
        self.active_claim_fixture()
        self.o['current_article']=None
        self.assertIn('Active article requires a coordinator claim',self.check())
    def test_claim_mismatch_rejected(self):
        self.active_claim_fixture()
        self.o['current_article']['route']='/wrong/'
        self.assertIn('Claim does not match an owned article',self.check())
    def test_missing_activation_rejected(self):
        self.d=[x for x in self.d if x['id']!=self.o['authorization']];self.assertTrue(self.check())
if __name__=='__main__':unittest.main()
