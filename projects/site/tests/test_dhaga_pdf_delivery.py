"""OFFLINE synthetic fixtures only; fake IDs are never a release descriptor."""
import unittest,unittest.mock,importlib.util,tempfile,json,hashlib,copy,subprocess,sys,os
from pathlib import Path
P=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('guard',P.parent/'tools/verify-dhaga-pdf.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
class Tests(unittest.TestCase):
 def setUp(self):
  self.t=tempfile.TemporaryDirectory();self.root=Path(self.t.name).resolve();self.body=b'%PDF-SYNTHETIC-OFFLINE-FIXTURE';sha=hashlib.sha256(self.body).hexdigest();commit='a'*40;tag='dhaga-358-'+commit;name='odia-dhaga-358-'+sha+'.pdf';url=f'https://github.com/ahimanikya/project-odisha/releases/download/{tag}/{name}'
  self.d={'schema':'project-odisha-pdf-release-v1','repository':'ahimanikya/project-odisha','release_immutable':False,'mutability_limit':'Release assets and tags can change; every retrieval must verify identity and bytes.','release_id':123,'asset_id':456,'target_commit':commit,'sha256':sha,'tag':tag,'asset_name':name,'browser_download_url':url,'bytes':len(self.body),'pages':226,'entries':358}
  self.pack={'pdf':{k:self.d[k] for k in ['pages','bytes','sha256']}}
  self.asset={'id':456,'name':name,'state':'uploaded','size':len(self.body),'digest':'sha256:'+sha,'browser_download_url':url}
  self.release={'id':123,'tag_name':tag,'target_commitish':commit,'draft':False,'prerelease':False,'immutable':False,'assets':[self.asset]};self.calls=[]
 def tearDown(self):self.t.cleanup()
 def fetch(self,url,dest,limit):
  self.calls.append(url)
  body=json.dumps({'ref':'refs/tags/'+self.d['tag'],'object':{'type':'commit','sha':self.d['target_commit']}} if '/git/ref/' in url else self.asset if '/releases/assets/' in url else self.release).encode() if 'api.github.com' in url else self.body
  assert len(body)<=limit;dest.write_bytes(body)
 def test_positive_and_existing(self):
  target=self.root/'book.pdf';r=g.hydrate(self.d,self.pack,target,self.fetch);self.assertEqual(r['status'],'PASS_HYDRATED_EXACT');self.assertEqual(target.read_bytes(),self.body)
  self.calls=[];self.assertEqual(g.hydrate(self.d,self.pack,target,self.fetch)['status'],'PASS_EXISTING_EXACT');self.assertEqual(len(self.calls),3)
 def test_wrong_existing_no_clobber(self):
  t=self.root/'book.pdf';t.write_bytes(b'OLD251')
  with self.assertRaises(ValueError):g.hydrate(self.d,self.pack,t,self.fetch)
  self.assertEqual(t.read_bytes(),b'OLD251')
 def test_old_edition_refused_before_fetch(self):
  d=copy.deepcopy(self.d);d.update(entries=299,pages=193)
  with self.assertRaises(ValueError):g.hydrate(d,self.pack,self.root/'old.pdf',self.fetch)
  self.assertEqual(self.calls,[])
 def test_identity_refusals(self):
  for key,value in [('release_id',None),('asset_id',0),('tag','latest'),('target_commit','main'),('asset_name','old.pdf'),('sha256','bad'),('bytes',1),('release_immutable',True),('browser_download_url','https://evil.invalid/a')]:
   with self.subTest(key=key):
    d=copy.deepcopy(self.d);d[key]=value
    with self.assertRaises(ValueError):g.hydrate(d,self.pack,self.root/'bad.pdf',self.fetch)
    self.assertFalse((self.root/'bad.pdf').exists())
 def test_api_replacement_existing_refused(self):
  t=self.root/'book.pdf';t.write_bytes(self.body);self.asset['id']=789
  with self.assertRaises(ValueError):g.hydrate(self.d,self.pack,t,self.fetch)
  self.assertEqual(t.read_bytes(),self.body)
 def test_corrupt_download_cleanup(self):
  self.body=b'%PDF-WRONG'
  with self.assertRaises(ValueError):g.hydrate(self.d,self.pack,self.root/'book.pdf',self.fetch)
  self.assertEqual(list(self.root.iterdir()),[])
 def test_symlink_target_and_parent(self):
  real=self.root/'real';real.mkdir();link=self.root/'link';link.symlink_to(real,target_is_directory=True)
  with self.assertRaises(ValueError):g.hydrate(self.d,self.pack,link/'x.pdf',self.fetch)
  t=self.root/'book.pdf';t.symlink_to(real/'missing')
  with self.assertRaises(ValueError):g.hydrate(self.d,self.pack,t,self.fetch)
 def test_racing_existing_not_overwritten(self):
  t=self.root/'book.pdf'
  def fetch(url,dest,limit):
   self.fetch(url,dest,limit)
   if dest.name=='asset-after.json':t.write_bytes(b'RACE')
  with self.assertRaises(FileExistsError):g.hydrate(self.d,self.pack,t,fetch)
  self.assertEqual(t.read_bytes(),b'RACE')
 def test_change_during_download(self):
  def fetch(url,dest,limit):
   self.fetch(url,dest,limit)
   if dest.name=='verified.pdf':self.release['target_commitish']='b'*40
  with self.assertRaises(ValueError):g.hydrate(self.d,self.pack,self.root/'book.pdf',fetch)
  self.assertFalse((self.root/'book.pdf').exists())
 def test_download_count_changes_allowed(self):
  def fetch(url,dest,limit):
   self.fetch(url,dest,limit)
   if dest.name=='verified.pdf':
    self.asset['download_count']=2
    self.release['name']='Cosmetic title changed'
  self.assertEqual(g.hydrate(self.d,self.pack,self.root/'book.pdf',fetch)['status'],'PASS_HYDRATED_EXACT')
 def test_membership_telemetry_skew_allowed(self):
  asset=copy.deepcopy(self.asset);asset['download_count']=999
  self.assertEqual(g.validate(self.d,self.pack,self.release,asset),self.d['browser_download_url'])
 def test_curl_ignores_configuration_and_bounds_redirects(self):
  with unittest.mock.patch.object(g.subprocess,'run',return_value=subprocess.CompletedProcess([],0,'200','')) as mock:
   g.curl('https://example.invalid/fixture',self.root/'download',123)
   command=mock.call_args.args[0]
   self.assertEqual(command[:2],['curl','-q'])
   self.assertEqual(command[command.index('--max-redirs')+1],'5')
   self.assertEqual(command[command.index('--proto-redir')+1],'=https')
   self.assertEqual(mock.call_args.kwargs['timeout'],190)
 def test_cli_authorization_and_optimized(self):
  for opt in [[],['-O']]:
   env={**os.environ};env.pop('RUN_AUTHORIZED_PDF_HYDRATION',None)
   a=subprocess.run([sys.executable,*opt,str(P.parent/'tools/verify-dhaga-pdf.py'),'--descriptor','missing','--packing','missing','--target',str(self.root/'x')],env=env,capture_output=True,text=True)
   self.assertNotEqual(a.returncode,0);self.assertIn('Optimized Python refused' if opt else 'Explicit hydration authorization required',a.stderr)
if __name__=='__main__':unittest.main()
