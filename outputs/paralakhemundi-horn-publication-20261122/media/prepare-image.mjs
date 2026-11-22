import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=new URL('../../../',import.meta.url);
const require=createRequire(new URL('projects/site/package.json',root));
const sharp=require('sharp');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourcePath='kb/media/paralakhemundi-horn/horn-fish-odisha-crafts-museum.jpg';
const publicPath='projects/site/public/images/stories/paralakhemundi-horn-fish.webp';
const source=await fs.readFile(new URL(sourcePath,root));
if(hash(source)!=='1eb8818471fe5da74eabaa356bad5746c4e6337d1247e47e5273bcd963af9743')throw Error('Original source changed');
const original=await sharp(source).metadata();
const {data,info}=await sharp(source).rotate().resize({width:1200,withoutEnlargement:true}).keepMetadata().webp({quality:86,effort:5}).toBuffer({resolveWithObject:true});
await fs.writeFile(new URL(publicPath,root),data);
await fs.writeFile(new URL('paralakhemundi-horn-fish.webp',import.meta.url),data);
const variants=[];
for(const width of [480,960,1200]){
 const {data:variant,info:size}=await sharp(data).rotate().resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toBuffer({resolveWithObject:true});
 const filename=`${hash(variant).slice(0,16)}-${size.width}.webp`;
 await fs.writeFile(new URL(filename,import.meta.url),variant);
 variants.push({width:size.width,height:size.height,bytes:variant.length,sha256:hash(variant),filename});
}
const metadata=await sharp(data).metadata();
const total=data.length+variants.reduce((n,v)=>n+v.bytes,0);
const report={source:{path:sourcePath,width:original.width,height:original.height,bytes:source.length,sha256:hash(source)},derivative:{path:publicPath,width:info.width,height:info.height,bytes:data.length,sha256:hash(data)},method:{sharp:sharp.versions.sharp,libvips:sharp.versions.vips,width:1200,quality:86,effort:5,fit:'full-frame aspect-preserving resize',metadata:'keepMetadata()',variantsQuality:82},metadata:{hasProfile:metadata.hasProfile,orientation:metadata.orientation,retainedBuffers:Object.keys(metadata).filter(k=>Buffer.isBuffer(metadata[k]))},variants,projected_image_bytes:total,baseline_headroom_bytes:875469,remaining_before_HTML:875469-total,visual_review:'Original and derivative personally inspected; both fish, fins, patterns and tails retain full framing. Indoor grain remains visible; suitable at the reading-column width.',limits:'Local encoding projection only. Build platform may encode different variant bytes; actual Linux package acceptance and browser review remain required.',licence:'CC BY-SA 4.0',licence_url:'https://creativecommons.org/licenses/by-sa/4.0/',changes:'Resized and compressed.'};
await fs.writeFile(new URL('delivery-image.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
