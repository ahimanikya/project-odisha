#!/usr/bin/env node
/** Read-only measurement of a single retained verify-live.py HTTP report.
 * Usage: node analyze-live-images.mjs /absolute/path/to/http.json
 * No network, resizing, orientation correction, asset copies or visual acceptance.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash,randomUUID} from 'node:crypto';
const outputDirectory=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(outputDirectory,'../..');
const sharp=createRequire(path.join(root,'projects/site/package.json'))('sharp');
const hash=b=>createHash('sha256').update(b).digest('hex');
if(process.argv.length!==3)throw Error('Supply exactly one explicit retained http.json path; no network is performed.');
const input=path.resolve(process.argv[2]);
const bytes=await fs.readFile(input),http=JSON.parse(bytes);
if(!Array.isArray(http.images))throw Error('Expected verify-live.py schema with images array.');
const report={status:'MEASUREMENT_ONLY',input,input_sha256:hash(bytes),created_at:new Date().toISOString(),sharp_versions:sharp.versions,method:'Sharp decode to explicit8-bit raw pixels with ensureAlpha(), without resize, crop, orientation correction or compositing; all channel deltas include alpha. Input files are never written.',limitations:['Byte or pixel equality is measured, not inferred from filenames.','No visual acceptance or explanation of the encoding difference is supplied.','Decoded comparisons require matching geometry, channel count and colour space.','All original HTTP differences and captures remain unchanged.'],images:[],skipped:[],errors:[]};
function capturedPath(value){
 if(typeof value!=='string'||!value)throw Error('Missing retained capture path');
 const result=path.resolve(root,value),relative=path.relative(root,result);
 if(relative==='..'||relative.startsWith('..'+path.sep))throw Error('Capture path outside repository: '+value);
 return result;
}
function metadata(m){
 const info={};
 for(const key of ['format','width','height','space','channels','depth','density','orientation','hasAlpha','hasProfile','pages'])info[key]=m[key]??null;
 for(const key of ['icc','iptc','xmp','exif'])info[key]={bytes:m[key]?.length??0,sha256:m[key]?hash(m[key]):null};
 return info;
}
for(const row of http.images){
 if(row.status!==200){report.skipped.push({url:row.url,reason:'HTTP response was not successful',status:row.status??null});continue;}
 const entry={url:row.url,local_file:row.local_file,live_file:row.file};
 try{
  const [local,live]=await Promise.all([fs.readFile(capturedPath(row.local_file)),fs.readFile(capturedPath(row.file))]);
  const localHash=hash(local),liveHash=hash(live);
  Object.assign(entry,{local_bytes:local.length,live_bytes:live.length,local_sha256:localHash,live_sha256:liveHash,recorded_byte_match:row.byte_match??null});
  if(row.local_sha256!==localHash||row.sha256!==liveHash)throw Error('Retained file does not match HTTP report hash; measurement halted for this pair.');
  if(local.equals(live)){report.skipped.push({...entry,reason:'Actual retained bytes identical; no decode needed'});continue;}
  const [lm,am]=await Promise.all([sharp(local).metadata(),sharp(live).metadata()]);
  entry.local_metadata=metadata(lm);entry.live_metadata=metadata(am);
  entry.source_geometry_channels_equal=lm.width===am.width&&lm.height===am.height&&lm.channels===am.channels;
  const [a,b]=await Promise.all([sharp(local).ensureAlpha().raw({depth:'uchar'}).toBuffer({resolveWithObject:true}),sharp(live).ensureAlpha().raw({depth:'uchar'}).toBuffer({resolveWithObject:true})]);
  entry.local_decoded=a.info;entry.live_decoded=b.info;
  entry.decoded_compatible=a.info.width===b.info.width&&a.info.height===b.info.height&&a.info.channels===b.info.channels&&a.info.depth===b.info.depth&&a.data.length===b.data.length&&lm.space===am.space;
  if(!entry.decoded_compatible){entry.status='GEOMETRY_OR_CHANNEL_MISMATCH';report.images.push(entry);continue;}
  if(a.info.depth!=='uchar')throw Error('Expected 8-bit raw output; other channel depths need separate comparison.');
  const channels=a.info.channels,pixels=a.info.width*a.info.height;
  let changedPixels=0,changedChannels=0,maximum=0,total=0,squares=0;
  const perChannel=Array.from({length:channels},(_,index)=>({index,changed:0,max:0,sum:0,sum_squared:0}));
  for(let p=0;p<pixels;p++){
   let changed=false;
   for(let c=0;c<channels;c++){
    const i=p*channels+c,d=Math.abs(a.data[i]-b.data[i]),v=perChannel[c];
    if(d){changed=true;changedChannels++;v.changed++;}
    maximum=Math.max(maximum,d);total+=d;squares+=d*d;v.max=Math.max(v.max,d);v.sum+=d;v.sum_squared+=d*d;
   }
   if(changed)changedPixels++;
  }
  entry.status='MEASURED_REVIEW_REQUIRED';
  entry.metrics={pixels,total_channels:a.data.length,changed_pixels:changedPixels,changed_pixels_fraction:changedPixels/pixels,changed_channels:changedChannels,max_absolute_channel_delta:maximum,mean_absolute_channel_delta:total/a.data.length,rms_channel_delta:Math.sqrt(squares/a.data.length),decoded_pixel_identical:changedChannels===0,per_channel:perChannel.map(v=>({index:v.index,changed:v.changed,max_absolute_delta:v.max,mean_absolute_delta:v.sum/pixels,rms_delta:Math.sqrt(v.sum_squared/pixels)}))};
  report.images.push(entry);
 }catch(error){entry.status='MEASUREMENT_ERROR';entry.error=String(error);report.errors.push(entry);}
}
if(report.errors.length||report.images.some(r=>r.status==='GEOMETRY_OR_CHANNEL_MISMATCH'))report.status='REVIEW_REQUIRED_WITH_ERRORS';
else if(report.images.length)report.status='MEASURED_REVIEW_REQUIRED';
const destination=path.join(path.dirname(input),'image-analysis-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8)+'.json');
await fs.writeFile(destination,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({report:destination,status:report.status,measured:report.images.length,skipped:report.skipped.length,errors:report.errors.length},null,2));
if(report.errors.length)process.exitCode=2;
