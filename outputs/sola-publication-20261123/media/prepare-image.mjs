import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const require=createRequire(new URL('projects/site/package.json',root));
const sharp=require('sharp');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourcePath='kb/media/sola/finished-tahia-prakriti-panda.jpg';
const publicPath='projects/site/public/images/stories/sola-tahia.webp';
const source=await fs.readFile(new URL(sourcePath,root));
if(hash(source)!=='50c47707d4d50cd4855d16e554360145d486cc9536308919c2a17f70a69586be')throw Error('Original source changed');
const original=await sharp(source).metadata();
const {data,info}=await sharp(source).rotate().resize({width:1200,withoutEnlargement:true}).keepMetadata().webp({quality:88,effort:5}).toBuffer({resolveWithObject:true});
await fs.writeFile(new URL(publicPath,root),data);
await fs.writeFile(new URL('sola-tahia.webp',import.meta.url),data);
const variants=[];
for(const width of [480,960,1200]){
 const {data:variant,info:size}=await sharp(data).rotate().resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toBuffer({resolveWithObject:true});
 const filename=`${hash(variant).slice(0,16)}-${size.width}.webp`;
 await fs.writeFile(new URL(filename,import.meta.url),variant);
 variants.push({width:size.width,height:size.height,bytes:variant.length,sha256:hash(variant),filename});
}
const metadata=await sharp(data).metadata();
const total=data.length+variants.reduce((n,v)=>n+v.bytes,0);
const report={creator:'Prakriti Panda',source_url:'https://commons.wikimedia.org/wiki/File:A_fully-made_Tahia.jpg',source_revision:1049053845,source:{path:sourcePath,width:original.width,height:original.height,bytes:source.length,sha256:hash(source)},derivative:{path:publicPath,width:info.width,height:info.height,bytes:data.length,sha256:hash(data)},method:{sharp:sharp.versions.sharp,libvips:sharp.versions.vips,width:1200,quality:88,effort:5,fit:'full-frame aspect-preserving resize',metadata:'keepMetadata()',variantsQuality:82},metadata:{hasProfile:metadata.hasProfile,orientation:metadata.orientation,retainedBuffers:Object.keys(metadata).filter(k=>Buffer.isBuffer(metadata[k]))},variants,projected_image_bytes:total,baseline_headroom_bytes:19406,remaining_before_HTML:19406-total,visual_review:'Original full-frame inspection preview and derivative personally inspected; the curved headpiece, petals, buds, hand and worktable remain in frame. Detail is suitable at the reading-column width.',limits:'Local encoding projection only. Build platform may encode different variant bytes; actual Linux package acceptance and browser review remain required.',licence:'CC BY-SA 4.0',licence_url:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'Resized and compressed for web display.'};
await fs.writeFile(new URL('delivery-image.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
