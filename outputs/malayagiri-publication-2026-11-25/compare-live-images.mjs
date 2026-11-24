import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),dir=new URL('./',import.meta.url);
const sharp=createRequire(new URL('projects/site/package.json',root))('sharp');
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(new URL('live-verification.json',dir)),v=JSON.parse(raw);
const expectedRoutes=['/destinations/malayagiri/','/destinations/hills/','/destinations/','/explore/','/stories/sahi-jatra/'];
if(!['PASS','REVIEW_DIFFERENCES'].includes(v.status))throw Error('Completed successful HTTP evidence required');
if(v.routes?.length!==expectedRoutes.length||new Set(v.routes.map(x=>x.route)).size!==expectedRoutes.length||!expectedRoutes.every(r=>v.routes.some(x=>x.route===r&&x.status===200)))throw Error('All five expected routes required');
if(!Array.isArray(v.images)||!v.images.length||!['/images/destinations/malayagiri-khuludi-rajani3737.webp','/assets/sahi-jatra/performer.jpg'].every(u=>v.images.some(x=>x.url===u)))throw Error('Complete article image evidence required');
const report={status:'measurement_complete_visual_review_pending',raw_status:v.status,raw_sha256:hash(raw),decoder:{sharp:sharp.versions.sharp,libvips:sharp.versions.vips},images:[],limits:['Same installed decoder for each actual live/local pair; differences do not identify an encoding cause.','Raw HTTP and HTML differences retained; no automatic visual acceptance.']};
for(const e of v.images){
 const live=await readFile(new URL(e.file,root)),local=await readFile(new URL('projects/site/dist-publish'+e.local_url,root));
 if(hash(live)!==e.sha256||hash(local)!==e.local_sha256)throw Error('File changed since HTTP evidence');
 for(const [url,bytes]of [[e.url,live],[e.local_url,local]])if(url.startsWith('/images/responsive/')&&!url.split('/').pop().startsWith(hash(bytes).slice(0,16)+'-'))throw Error('Responsive content-address mismatch '+url);
 const a=await sharp(live).metadata(),b=await sharp(local).metadata();
 if(a.width!==b.width||a.height!==b.height||(a.orientation??1)!==(b.orientation??1))throw Error('Geometry mismatch '+e.url);
 const entry={url:e.url,local_url:e.local_url,saved:e.file,dimensions:[a.width,a.height],orientation:a.orientation??1,live_sha256:hash(live),local_sha256:hash(local),byte_equal:live.equals(local)};
 if(!entry.byte_equal){
  const decode=x=>sharp(x).rotate().removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
  const x=await decode(live),y=await decode(local);if(JSON.stringify(x.info)!==JSON.stringify(y.info))throw Error('Decoded layout mismatch');
  let max=0,sum=0,squares=0,changed=0;
  for(let i=0;i<x.data.length;i++){const delta=Math.abs(x.data[i]-y.data[i]);max=Math.max(max,delta);sum+=delta;squares+=delta*delta;if(delta)changed++;}
  entry.decoded={identical:x.data.equals(y.data),channels:x.info.channels,changed_channels:changed,total_channels:x.data.length,max_absolute_channel_delta:max,mean_absolute_channel_delta:sum/x.data.length,root_mean_squared_channel_delta:Math.sqrt(squares/x.data.length)};
  entry.metadata=Object.fromEntries(['icc','iptc','xmp','exif'].map(k=>[k,{live_bytes:a[k]?.length??0,local_bytes:b[k]?.length??0,identical:Buffer.from(a[k]??[]).equals(Buffer.from(b[k]??[]))}]));
 }
 report.images.push(entry);
}
if(hash(await readFile(new URL('live-verification.json',dir)))!==report.raw_sha256)throw Error('Raw HTTP evidence changed');
report.status=report.images.every(x=>x.byte_equal)?'all_observed_images_byte_exact':'measurement_complete_visual_review_pending';
await writeFile(new URL('live-image-comparison.json',dir),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,images:report.images.length,differences:report.images.filter(x=>!x.byte_equal)}));
