// Deterministic display derivatives; original artwork is never changed.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const sharp=createRequire(new URL('../site/package.json',import.meta.url))('sharp');
const root=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(root,'assets/cards');
await fs.mkdir(target,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=[];
for(const name of (await fs.readdir(path.join(root,'entries'))).filter(n=>n.endsWith('.json')).sort()){
 const entry=JSON.parse(await fs.readFile(path.join(root,'entries',name),'utf8'));
 if(!entry.graphic)continue;
 if(!/^assets\/[a-z0-9-]+\.(png|svg)$/.test(entry.graphic.src))throw new Error('Unsafe original art path');
 const original=await fs.readFile(path.join(root,entry.graphic.src));
 const output=await sharp(original).resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:80,effort:6}).toBuffer();
 const src=`assets/cards/${entry.id.toLowerCase()}.webp`;
 await fs.writeFile(path.join(root,src),output);
 const {width,height}=await sharp(output).metadata();
 rows.push({id:entry.id,original:entry.graphic.src,original_sha256:hash(original),original_bytes:original.length,src,width,height,bytes:output.length,sha256:hash(output)});
}
await fs.writeFile(path.join(target,'manifest.json'),JSON.stringify({recipe:'Sharp WebP quality80 effort6; max640x640 fit inside without enlargement, no cropping',images:rows,total_bytes:rows.reduce((n,r)=>n+r.bytes,0)},null,2)+'\n');
console.log(`${rows.length} thumbnails, ${rows.reduce((n,r)=>n+r.bytes,0)} bytes`);
