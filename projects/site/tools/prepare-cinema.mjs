// Stage reviewed cinema derivatives and PDFs; never alter their retained originals.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.resolve(site,'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'kb/research/culture/cinema-series/manifest.json')));
const preview=path.join(root,'outputs/odia-cinema-series');
const dest=path.join(site,'public/assets/cinema');fs.mkdirSync(dest,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const articles=manifest.articles.map(entry=>{
 const report=JSON.parse(fs.readFileSync(path.join(preview,entry.slug+'-report.json')));
 const source=fs.readFileSync(path.join(root,entry.source));if(hash(source)!==report.source_sha256)throw Error('Stale preview '+entry.slug);
 const images=report.images.map(img=>{
  const derivatives=img.derivatives.map(d=>{const bytes=fs.readFileSync(path.join(preview,d.file));if(hash(bytes)!==d.sha256)throw Error('Changed image '+d.file);fs.writeFileSync(path.join(dest,path.basename(d.file)),bytes);return {...d,file:'/assets/cinema/'+path.basename(d.file)};});
  const provenance=img.provenance_records.map(p=>{fs.copyFileSync(path.join(preview,p.copy),path.join(dest,path.basename(p.copy)));return '/assets/cinema/'+path.basename(p.copy);});
  return {role:img.role,source:img.source,original_sha256:img.original_sha256,file:'/assets/cinema/'+path.basename(img.file),width:img.width,height:img.height,derivatives,provenance};
 });
 return {...entry,route:'/cinema/'+entry.slug+'/',source_sha256:report.source_sha256,images};
});
const books=['odia-cinema-a-living-screen.pdf','odia-cinema-a-living-screen-print.pdf'].map(name=>{const bytes=fs.readFileSync(path.join(root,'output/pdf',name));fs.copyFileSync(path.join(root,'output/pdf',name),path.join(site,'public/archive',name));return {file:'/archive/'+name,bytes:bytes.length,sha256:hash(bytes)};});
const data={parts:manifest.parts,articles,books};
fs.writeFileSync(path.join(site,'src/data/cinema.json'),JSON.stringify(data,null,2)+'\n');
console.log(`Staged ${articles.length} cinema articles and ${books.length} books; optimized derivatives only.`);
