// Project Odisha publication staging. APFS copies must never silently become full copies.
import {cp,lstat,readdir,statfs} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

export async function copyPublicationTree(source,destination,{allowNonMacFullCopy=false}={}){
 const from=source instanceof URL?fileURLToPath(source):source;
 const to=destination instanceof URL?fileURLToPath(destination):destination;
 try{await lstat(to);throw Error('Publication copy destination already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 if(process.platform==='darwin'){
  const result=spawnSync('python3',[fileURLToPath(new URL('./cow_copy.py',import.meta.url)),from,to],{encoding:'utf8'});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error(`APFS publication clone failed; no full-copy fallback: ${result.stderr}`);
  console.log(result.stdout.trim());
  return;
 }
 if(!allowNonMacFullCopy)throw Error('Storage sharing unavailable; an explicit non-macOS full-copy policy is required');
 let bytes=0;
 async function measure(path){for(const item of await readdir(path,{withFileTypes:true})){const child=path+'/'+item.name;if(item.isSymbolicLink())throw Error('Publication staging must not contain symlinks');if(item.isDirectory())await measure(child);else if(item.isFile())bytes+=(await lstat(child)).size;else throw Error('Unsupported publication file type');}}
 if(!(await lstat(from)).isDirectory()||(await lstat(from)).isSymbolicLink())throw Error('Publication source must be a real directory');
 await measure(from);
 const space=await statfs(dirname(to));
 if(space.bavail*space.bsize<bytes+1024**3)throw Error('Insufficient free space for explicit publication copy and safety reserve');
 console.log(`Explicit non-macOS publication copy: ${bytes} bytes; independent files, no source hard links.`);
 await cp(from,to,{recursive:true,force:false,errorOnExist:true,preserveTimestamps:true});
}
