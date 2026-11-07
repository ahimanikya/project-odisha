"""Versioned release PDF hydration. No upload, settings change, fallback or overwrite."""
if not __debug__:
    raise RuntimeError('Optimized Python refused')
import argparse, hashlib, json, os, re, subprocess, tempfile
from pathlib import Path

def need(ok, message):
    if not ok: raise ValueError(message)

def safe_path(path):
    path = Path(os.path.abspath(path))
    for node in [path, *path.parents]:
        need(not node.is_symlink(), f'Symlink refused: {node}')
    return path

def validate_descriptor(d, packing):
    need(d.get('schema') == 'project-odisha-pdf-release-v1', 'Unsupported descriptor')
    need(d.get('repository') == 'ahimanikya/project-odisha', 'Wrong repository')
    need(d.get('release_immutable') is False and d.get('mutability_limit') == 'Release assets and tags can change; every retrieval must verify identity and bytes.', 'Mutable-release limitation required')
    for key in ['release_id', 'asset_id']:
        need(type(d.get(key)) is int and d[key] > 0, f'Actual {key} required')
    commit=d.get('target_commit','');digest=d.get('sha256','')
    need(re.fullmatch('[a-f0-9]{40}',commit) is not None,'Full commit required')
    need(re.fullmatch('[a-f0-9]{64}',digest) is not None,'SHA256 required')
    need(d.get('tag') == 'dhaga-358-'+commit, 'Tag must bind full commit')
    name='odia-dhaga-358-'+digest+'.pdf'
    need(d.get('asset_name') == name, 'Content-addressed filename required')
    url=f'https://github.com/{d["repository"]}/releases/download/{d["tag"]}/{name}'
    need(d.get('browser_download_url') == url,'Exact versioned browser URL required')
    need(type(d.get('bytes')) is int and d['bytes']>0 and d.get('pages')==226 and d.get('entries')==358,'Invalid edition metadata')
    need({k:d[k] for k in ['bytes','pages','sha256']} == packing['pdf'],'Packing mismatch')
    return url

def validate(d, packing, release, asset):
    url=validate_descriptor(d,packing);commit=d['target_commit'];digest=d['sha256'];name=d['asset_name']
    need(release.get('id')==d['release_id'] and release.get('tag_name')==d['tag'],'Release ID/tag mismatch')
    need(release.get('target_commitish')==commit,'Release target must be full commit')
    need(release.get('draft') is False and release.get('prerelease') is False,'Published non-prerelease required')
    need(release.get('immutable') is False,'Unexpected release protection state; review required')
    need(asset.get('id')==d['asset_id'] and asset.get('name')==name and asset.get('state')=='uploaded','Asset identity/state mismatch')
    need(asset.get('size')==d['bytes'] and asset.get('digest')=='sha256:'+digest,'Asset size/digest mismatch')
    need(asset.get('browser_download_url')==url,'Asset URL mismatch')
    members=[x for x in release.get('assets',[]) if x.get('id')==d['asset_id']]
    fields=['id','name','state','size','digest','browser_download_url']
    need(len(members)==1 and all(members[0].get(k)==asset.get(k) for k in fields),'Asset must belong to exact release')
    return url

def check_bytes(path,d):
    need(path.is_file() and path.stat().st_size==d['bytes'],'PDF byte count mismatch')
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    need(h.hexdigest()==d['sha256'],'PDF SHA256 mismatch')
    with path.open('rb') as f:need(f.read(5)==b'%PDF-','Missing PDF signature')

def curl(url,dest,max_bytes):
    # No credentials/cookies; HTTPS-only redirects, bounded connect and overall runtime.
    command=['curl','-q','--max-redirs','5','--fail','--location','--silent','--show-error','--proto','=https','--proto-redir','=https','--connect-timeout','10','--max-time','180','--max-filesize',str(max_bytes),'--output',str(dest),'--write-out','%{http_code}',url]
    a=subprocess.run(command,capture_output=True,text=True,timeout=190)
    need(a.returncode==0 and a.stdout.strip()=='200',f'Anonymous HTTP download failed: exit={a.returncode}, status={a.stdout.strip()}')

def hydrate(d,packing,target,fetch=curl):
    validate_descriptor(d,packing)
    target=safe_path(target);need(target.parent.is_dir(),'Existing target directory required')
    with tempfile.TemporaryDirectory(prefix='.dhaga-verified-',dir=target.parent) as td:
        td=Path(td)
        def api(suffix,name):
            out=td/name;fetch('https://api.github.com/repos/'+d['repository']+suffix,out,8*1024*1024);return json.loads(out.read_text())
        release=api('/releases/'+str(d['release_id']),'release.json')
        asset=api('/releases/assets/'+str(d['asset_id']),'asset.json')
        url=validate(d,packing,release,asset)
        tag=api('/git/ref/tags/'+d['tag'],'tag.json')
        need(tag.get('ref')=='refs/tags/'+d['tag'] and tag.get('object',{}).get('type')=='commit' and tag['object'].get('sha')==d['target_commit'],'Exact lightweight tag commit required')
        if target.exists():
            check_bytes(target,d)
            return {'status':'PASS_EXISTING_EXACT','sha256':d['sha256'],'mutable_release':True}
        tmp=td/'verified.pdf';fetch(url,tmp,d['bytes']);check_bytes(tmp,d)
        # Check metadata again after transfer to catch observed replacement during download.
        release2=api('/releases/'+str(d['release_id']),'release-after.json')
        asset2=api('/releases/assets/'+str(d['asset_id']),'asset-after.json')
        validate(d,packing,release2,asset2)
        tag2=api('/git/ref/tags/'+d['tag'],'tag-after.json')
        need(tag2.get('ref')==tag.get('ref') and tag2.get('object',{}).get('type')=='commit' and tag2['object'].get('sha')==d['target_commit'],'Tag changed during transfer')
        # Both snapshots independently match the frozen descriptor; download counters and other telemetry may change.
        safe_path(target)
        # Atomic no-clobber publication on same filesystem; existing paths cause failure.
        os.link(tmp,target,follow_symlinks=False)
        check_bytes(target,d)
        return {'status':'PASS_HYDRATED_EXACT','sha256':d['sha256'],'mutable_release':True}

def main():
    p=argparse.ArgumentParser();p.add_argument('--descriptor',required=True);p.add_argument('--packing',required=True);p.add_argument('--target',required=True);a=p.parse_args()
    need(os.environ.get('RUN_AUTHORIZED_PDF_HYDRATION')=='1','Explicit hydration authorization required')
    d=json.loads(safe_path(a.descriptor).read_text());packing=json.loads(safe_path(a.packing).read_text())
    # Validate descriptor shape before any network request using strict known fields.
    need(d.get('repository')=='ahimanikya/project-odisha','Wrong repository')
    for k in ['release_id','asset_id']:need(type(d.get(k)) is int and d[k]>0,'Actual IDs required')
    print(json.dumps(hydrate(d,packing,a.target)))
if __name__=='__main__':main()
