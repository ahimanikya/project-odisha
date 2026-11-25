import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const sharp=createRequire(new URL('projects/site/package.json',root))('sharp');
const dir=new URL('./',import.meta.url);
const rawVerification=await readFile(new URL('live-http.json',dir));
const verification=JSON.parse(rawVerification);
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!Array.isArray(verification.images))throw Error('Expected list-form image verification');
const differing=verification.images.filter(entry=>entry.matches_local===false);
if(differing.length!==2)throw Error('Expected exactly two observed differing images');
const report={status:'measurement_complete_visual_review_pending',raw_http_status:verification.status,raw_http_sha256:hash(rawVerification),decoder:{sharp:sharp.versions.sharp,libvips:sharp.versions.vips},base_images:[],images:[],limits:['Both files decoded using the same installed Sharp decoder. Different bytes and pixels do not identify a cause.','Side-by-side PNGs use native decoded dimensions; left is delivered, right is local, with a 16px separator.','Base-image equality is corroborated against the saved HTTP-response hashes and current local delivery files; no new network requests are made.','Original REVIEW_DIFFERENCES report is preserved; these measurements do not overwrite it or assert pixel-exact delivery.']};
for(const path of ['/images/stories/paralakhemundi-horn-fish.webp','/images/stories/binchana-from-odisha.webp']){
 const entry=verification.images.find(item=>item.path===path);
 const local=await readFile(new URL('projects/site/dist-publish'+path,root));
 if(!entry||!entry.matches_local||entry.sha256!==hash(local)||entry.bytes!==local.length)throw Error('Base-image verification mismatch '+path);
 const metadata=await sharp(local).metadata();report.base_images.push({path,bytes:local.length,width:metadata.width,height:metadata.height,sha256:hash(local),matches_saved_live_hash:true,http_status:entry.http_status});
}
for(const entry of differing){
 const live=await readFile(new URL(entry.saved_delivered_file,root));
 const local=await readFile(new URL('projects/site/dist-publish'+entry.local_path,root));
 if(hash(live)!==entry.sha256||live.length!==entry.bytes)throw Error('Saved live image differs from HTTP evidence');
 const a=await sharp(live).metadata(),b=await sharp(local).metadata();
 if(a.width!==b.width||a.height!==b.height)throw Error('Geometry mismatch '+entry.path);
 const decode=buffer=>sharp(buffer).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
 const x=await decode(live),y=await decode(local);if(JSON.stringify(x.info)!==JSON.stringify(y.info))throw Error('Decoded layout mismatch');
 let max=0,sum=0,sumSquares=0,changedChannels=0,changedPixels=0;
 for(let p=0;p<x.data.length;p+=x.info.channels){let changed=false;for(let c=0;c<x.info.channels;c++){const delta=Math.abs(x.data[p+c]-y.data[p+c]);max=Math.max(max,delta);sum+=delta;sumSquares+=delta*delta;if(delta){changedChannels++;changed=true;}}if(changed)changedPixels++;}
 const image={url:entry.path,local_url:entry.local_path,live_bytes:live.length,local_bytes:local.length,live_sha256:hash(live),local_sha256:hash(local),dimensions:[a.width,a.height],byte_equal:live.equals(local),decoded:{identical:x.data.equals(y.data),channels:x.info.channels,total_pixels:a.width*a.height,changed_pixels:changedPixels,total_channels:x.data.length,changed_channels:changedChannels,max_absolute_channel_delta:max,mean_absolute_channel_delta:sum/x.data.length,root_mean_squared_channel_delta:Math.sqrt(sumSquares/x.data.length)},metadata:{live:Object.fromEntries(['format','space','channels','depth','hasAlpha','hasProfile','orientation'].map(k=>[k,a[k]??null])),local:Object.fromEntries(['format','space','channels','depth','hasAlpha','hasProfile','orientation'].map(k=>[k,b[k]??null])),buffers:Object.fromEntries(['icc','iptc','xmp','exif'].map(k=>[k,{live_bytes:a[k]?.length??0,local_bytes:b[k]?.length??0,identical:Buffer.from(a[k]??[]).equals(Buffer.from(b[k]??[]))}]))}};
 const name=entry.path.split('/').pop().replace(/\.[^.]+$/,'')+'-comparison.png';
 await sharp({create:{width:a.width*2+16,height:a.height,channels:3,background:'#eeeeee'}}).composite([{input:live,left:0,top:0},{input:local,left:a.width+16,top:0}]).png().toFile(new URL(name,dir).pathname);
 image.comparison=name;report.images.push(image);
}
if(hash(await readFile(new URL('live-http.json',dir)))!==report.raw_http_sha256)throw Error('Raw HTTP evidence changed during comparison');
await writeFile(new URL('image-comparison.json',dir),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
