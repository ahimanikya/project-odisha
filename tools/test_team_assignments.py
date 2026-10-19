"""Regression checks for incompatible ownership and false role activation."""
import copy,json,unittest
from check_team_assignments import ROOT,validate
class OwnershipTests(unittest.TestCase):
    def setUp(self):
        def load(p):return json.loads((ROOT/'kb'/p).read_text())
        self.a=load('team/assignments.json');self.o=load('team/operations.json');self.q=load('records/article-editorial-rollout.json');self.d=load('registers/records.json')['decisions']
    def check(self):return validate(self.a,self.o,self.q,self.d)
    def test_current_records(self):self.assertEqual(self.check(),[])
    def test_second_article_rejected(self):
        next(x for x in self.q['items'] if x['status']=='queued')['status']='in_progress'
        self.assertTrue(self.check())
    def test_worker_cannot_claim_publication(self):
        self.o['publisher']='Samanta';self.assertTrue(self.check())
    def test_role_pass_cannot_masquerade_as_subagent(self):
        self.a['assignments'][1]['execution_mode']='labelled_role_pass_in_current_conversation';self.assertTrue(self.check())
    def test_human_reports_rejected(self):
        self.a['assignments'][1]['human_reports']=['Example human'];self.assertTrue(self.check())
    def test_claim_mismatch_rejected(self):
        self.o['current_article']['route']='/wrong/';self.assertTrue(self.check())
    def test_missing_activation_rejected(self):
        self.d=[x for x in self.d if x['id']!=self.o['authorization']];self.assertTrue(self.check())
if __name__=='__main__':unittest.main()
