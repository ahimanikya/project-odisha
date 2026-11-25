// Read-only comparison of captured delivery files; never edits source/capture bytes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,'../../..');
const sharp=createRequire(path.join(root,'projects/site/package.json'))('sharp');
const sha=b=>createHash('sha256').update(b).digest('hex');
const rawPath=path.join(here,'delivery-20261125T100929.906584Z/http.json');const raw=JSON.parse(fs.readFileSync(rawPath));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'projects/site/.astro/responsive-image-report.json')));const sources=new Map();for(const image of manifest.images)for(const variant of image.variants)sources.set(variant.src,image.src);
const meta=m=>Object.fromEntries(['format','width','height','space','channels','depth','density','isProgressive','hasProfile','hasAlpha','orientation'].map(k=>[k,m[k]??null]).concat(['icc','iptc','xmp','exif'].map(k=>[k,m[k]?{bytes:m[k].length,sha256:sha(m[k])}:null])));
const pairs=[];
for(const item of raw.images.filter(i=>i.byte_match===false)){
 const localPath=path.join(root,item.local_file),livePath=path.join(root,item.file);const local=fs.readFileSync(localPath),live=fs.readFileSync(livePath);
 const [lm,rm,l,r]=await Promise.all([sharp(local).metadata(),sharp(live).metadata(),sharp(local).ensureAlpha().raw().toBuffer({resolveWithObject:true}),sharp(live).ensureAlpha().raw().toBuffer({resolveWithObject:true})]);
 const row={url:item.url,local_file:item.local_file,live_file:item.file,source_base:sources.get(item.local_url)||null,local_bytes:local.length,live_bytes:live.length,local_sha256:sha(local),live_sha256:sha(live),captured_hashes_verified:sha(local)===item.local_sha256&&sha(live)===item.sha256,local_metadata:meta(lm),live_metadata:meta(rm),metadata_equal:JSON.stringify(meta(lm))===JSON.stringify(meta(rm)),raw_dimensions_equal:JSON.stringify(l.info)===JSON.stringify(r.info),visual_review:'Not yet reviewed in this measurement pass'};
 if(row.raw_dimensions_equal){
  let changed=0,sum=0,max=0,sq=0;const channelMax=[0,0,0,0],channelSum=[0,0,0,0],histogram={zero:0,one:0,two:0,three_to_five:0,six_to_ten:0,over_ten:0};
  for(let i=0;i<l.data.length;i+=4){let pixelChanged=false,pm=0;for(let c=0;c<4;c++){const d=Math.abs(l.data[i+c]-r.data[i+c]);pixelChanged ||= d>0;pm=Math.max(pm,d);sum+=d;sq+=d*d;max=Math.max(max,d);channelMax[c]=Math.max(channelMax[c],d);channelSum[c]+=d;}if(pixelChanged)changed++;histogram[pm===0?'zero':pm===1?'one':pm===2?'two':pm<=5?'three_to_five':pm<=10?'six_to_ten':'over_ten']++;}
  const pixels=l.info.width*l.info.height;
  row.decoded={width:l.info.width,height:l.info.height,channels:4,pixels,changed_pixels:changed,changed_pixel_percent:100*changed/pixels,identical:changed===0,max_channel_delta:max,mean_absolute_channel_delta:sum/l.data.length,root_mean_square_channel_delta:Math.sqrt(sq/l.data.length),channel_max_rgba:channelMax,channel_mean_absolute_rgba:channelSum.map(n=>n/pixels),max_per_pixel_delta_histogram:histogram};
 }
 pairs.push(row);
}
const result={status:pairs.every(p=>p.captured_hashes_verified&&p.raw_dimensions_equal)?'MEASURED_REVIEW_REQUIRED':'FAILED_PRESERVATION_OR_GEOMETRY',raw_report:path.relative(root,rawPath),raw_report_sha256:sha(fs.readFileSync(rawPath)),raw_report_preserved:true,raw_failed_checks:raw.checks.filter(c=>!c.pass),raw_difference_kinds:raw.differences.reduce((a,d)=>(a[d.kind]=(a[d.kind]||0)+1,a),{}),all_seven_fragments_match_after_observed_urls:raw.routes.every(r=>r.fragment?.match_after_only_observed_substitutions),byte_different_pairs:pairs.length,byte_matching_images:raw.images.filter(i=>i.byte_match).map(i=>({url:i.url,roles:i.roles,families:i.families})),pairs,summary:{same_geometry:pairs.every(p=>p.raw_dimensions_equal),same_metadata:pairs.every(p=>p.metadata_equal),pixel_identical_pairs:pairs.filter(p=>p.decoded?.identical).length,maximum_channel_delta:Math.max(...pairs.map(p=>p.decoded?.max_channel_delta||0)),maximum_mean_absolute_channel_delta:Math.max(...pairs.map(p=>p.decoded?.mean_absolute_channel_delta||0))},limits:['Byte differences are measured, not automatically accepted.','Sharp decoded RGBA comparison is independent of the HTTP helper; no causal attribution to platform or encoder is made.','This pass does not establish visual quality or authorize release acceptance.','Source files, public assets, raw HTTP report and captured files were read-only.']};
fs.writeFileSync(path.join(here,'image-comparison.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,pairs:result.byte_different_pairs,summary:result.summary,worst:pairs.toSorted((a,b)=>b.decoded.max_channel_delta-a.decoded.max_channel_delta).slice(0,5).map(p=>({source:p.source_base,local:p.local_file,live:p.live_file,max:p.decoded.max_channel_delta,mean:p.decoded.mean_absolute_channel_delta,changed:p.decoded.changed_pixel_percent}))},null,2));
