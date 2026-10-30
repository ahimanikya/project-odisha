"""Transfer the cinema delta onto current main without replacing upstream work."""
from pathlib import Path
import json, subprocess, shutil, hashlib, datetime

SOURCE=Path(__file__).resolve().parents[2]
TARGET=SOURCE.parent/'cinema-publication-ready-20261030'
OUT=SOURCE/'outputs/cinema-publication-readiness-20261030'
def git(*args): return subprocess.check_output(['git',*args],cwd=SOURCE)
def base(p): return git('show','HEAD:'+p)
def digest(b): return hashlib.sha256(b).hexdigest()
def save(p,b):
    dest=TARGET/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
def dump(p,d): save(p,(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode())
record={'date':str(datetime.date.today()),'source':str(SOURCE),'target':str(TARGET),'target_head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=TARGET,text=True).strip(),'copied':[],'merged':[],'excluded':[]}
shared={'kb/index.md','kb/history/LEDGER.md','kb/history/ledger.jsonl','kb/records/article-editorial-rollout.json','kb/research/references/data/research-map.json','projects/site/editions/coast.json','projects/site/editions/search-candidate.json'}
tracked=git('diff','--name-only','HEAD').decode().splitlines()
untracked=git('ls-files','--others','--exclude-standard').decode().splitlines()
selected=[]
for p in tracked+untracked:
    if p in shared: continue
    allow=(p.startswith(('kb/records/','kb/research/','projects/site/src/','projects/site/public/assets/cinema/','projects/site/tests/')) or p=='output/pdf/build_book.py')
    if p.startswith('outputs/') and Path(p).suffix in {'.json','.md','.py','.mjs','.log','.txt'}: allow=True
    if p.startswith('outputs/cinema-deep-review-20261030/') and Path(p).suffix in {'.png','.jpg'}: allow=True
    if not allow:record['excluded'].append(p);continue
    src=SOURCE/p
    if not src.is_file():raise RuntimeError('Deletion requires explicit review: '+p)
    data=src.read_bytes();dest=TARGET/p
    if p in tracked and dest.exists() and dest.read_bytes()!=base(p) and dest.read_bytes()!=data:
        raise RuntimeError('Concurrent modification needs manual merge: '+p)
    if p in untracked and dest.exists() and dest.read_bytes()!=data:
        raise RuntimeError('New-file collision: '+p)
    selected.append((p,data))
# Validate all simple transfers before changing the candidate.
for p,data in selected:
    save(p,data);record['copied'].append({'path':p,'sha256':digest(data),'bytes':len(data)})

def merge_entries(p,key,identity):
    before=json.loads(base(p));local=json.loads((SOURCE/p).read_text());up=json.loads((TARGET/p).read_text())
    old={identity(x):x for x in before[key]};current={identity(x):x for x in up[key]};changes=[]
    for item in local[key]:
        k=identity(item)
        if item==old.get(k):continue
        if k in current and current[k]!=old.get(k) and current[k]!=item:raise RuntimeError(f'Entry conflict: {p} {k}')
        if k in current:up[key]=[item if identity(x)==k else x for x in up[key]]
        else:up[key].append(item)
        current[k]=item;changes.append(k)
    return before,local,up,changes

p='projects/site/editions/coast.json';b=json.loads(base(p));l=json.loads((SOURCE/p).read_text());u=json.loads((TARGET/p).read_text());changes={}
for key in ('routes','downloads','documents'):
    additions=[x for x in l.get(key,[]) if x not in b.get(key,[])];changes[key]=additions
    for x in additions:
        if x not in u.setdefault(key,[]):u[key].append(x)
dump(p,u);record['merged'].append({'path':p,'additions':changes})
for p,key,ident in [('projects/site/editions/search-candidate.json','pages',lambda x:x['route']),('kb/records/article-editorial-rollout.json','items',lambda x:x['route']),('kb/research/references/data/research-map.json','records',lambda x:x['id'])]:
    b,l,u,changes=merge_entries(p,key,ident)
    if 'updated_at' in l:u['updated_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    if key=='records':
        for item in l['extension_history']:
            if item not in b['extension_history'] and item not in u['extension_history']:u['extension_history'].append(item)
        u['current_counts']['records_mapped']=len(u['records']);u['current_counts']['updated_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    dump(p,u);record['merged'].append({'path':p,'changed_keys':changes})
for p in ['kb/history/LEDGER.md','kb/history/ledger.jsonl']:
    b=base(p).decode();l=(SOURCE/p).read_text();u=(TARGET/p).read_text()
    if not l.startswith(b):raise RuntimeError('Ledger is not append-only: '+p)
    addition=l[len(b):]
    save(p,(u+addition).encode());record['merged'].append({'path':p,'appended_bytes':len(addition.encode())})
p='kb/index.md';u=(TARGET/p).read_text();l=(SOURCE/p).read_text();intro=l.split('## Current delivery and open work\n\n')[1].split('\n\nLatest local cinema copy cleanup:')[0]
save(p,u.replace('## Current delivery and open work\n\n','## Current delivery and open work\n\n'+intro+'\n\n',1).encode());record['merged'].append({'path':p,'action':'Added latest cinema review pointer; retained upstream index'})
# Keep reviewed PDFs outside public-site assets; these are separate release assets.
for name in ['odia-cinema-a-living-screen-2026-10-30-deep-review.pdf','odia-cinema-a-living-screen-print-2026-10-30-deep-review.pdf']:
    p='output/pdf/'+name;save(p,(SOURCE/p).read_bytes())
(OUT/'transfer-receipt.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
save('outputs/cinema-publication-readiness-20261030/transfer-receipt.json',(OUT/'transfer-receipt.json').read_bytes())
print('Copied',len(record['copied']),'files; merged',len(record['merged']),'shared files; retained upstream tools and content.')
