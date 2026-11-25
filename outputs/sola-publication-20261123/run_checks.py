"""Sequential dated local publication gates; preserves each actual log and outcome."""
import argparse,json,os,pathlib,subprocess,time
p=argparse.ArgumentParser();p.add_argument('--start',type=int,default=0);p.add_argument('--stop',type=int);a=p.parse_args()
root=pathlib.Path.cwd();out=root/'outputs/sola-publication-20261123';site=root/'projects/site';steps=[('full-build',['npm','run','build']),('full-disclosure',['node','tools/check-public-disclosures.mjs','dist']),('full-tests',['npm','test']),('coast-build',['npm','run','build:coast']),('coast-disclosure',['node','tools/check-public-disclosures.mjs','dist-coast']),('coast-tests',['npm','run','test:coast']),('publication-build',['npm','run','build:publication']),('publication-disclosure',['node','tools/check-public-disclosures.mjs','dist-publish'])]
summary=[]
for i,(name,cmd) in enumerate(steps):
 if i<a.start or a.stop is not None and i>a.stop:continue
 state={'step':i,'name':name,'status':'running','started':time.time()};(out/'check-progress.json').write_text(json.dumps(state));print(name,'started',flush=True)
 with (out/(name+'.log')).open('w') as log:r=subprocess.run(cmd,cwd=site,stdout=log,stderr=subprocess.STDOUT)
 state.update(status='pass' if r.returncode==0 else 'fail',exit_code=r.returncode,finished=time.time());summary.append(state);(out/'check-progress.json').write_text(json.dumps(state));(out/f'checks-{a.start}.json').write_text(json.dumps(summary,indent=2)+'\n');print(name,state['status'],flush=True)
 if r.returncode:raise SystemExit(r.returncode)
