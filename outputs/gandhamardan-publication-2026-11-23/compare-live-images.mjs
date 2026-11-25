import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='/Users/ahimanikya/.codex/worktrees/odisha-hill-destinations/publication-checkout/';
const sharp=createRequire(root+'projects/site/package.json')('sharp');
const dir=root+'outputs/gandhamardan-publication-2026-11-23/live/';
const verification=JSON.parse(await readFile(dir+'verification.json','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const report={status:'measurement_complete_visual_review_pending',images:[],limits:['Same local Sharp decoder used for both files. Different bytes or pixels do not establish the cause. Any differences require separate visual acceptance.']};
for(const [url,entry] of Object.entries(verification.images)){
 const live=await readFile(dir+url.split('/').pop());const local=await readFile(root+'projects/site/dist-publish/'+(entry.local_path??url).replace(/^\//,''));
 const a=await sharp(live).metadata(),b=await sharp(local).metadata();
 if(a.width!==b.width||a.height!==b.height)throw Error('Geometry mismatch '+url);
 const r={url,live_bytes:live.length,local_bytes:local.length,live_sha256:hash(live),local_sha256:hash(local),dimensions:[a.width,a.height],byte_equal:live.equals(local)};
 if(!r.byte_equal){
  const raw=async x=>sharp(x).removeAlpha().toColourspace('srgb').raw().toBuffer();const x=await raw(live),y=await raw(local);if(x.length!==y.length)throw Error('Raw mismatch');let max=0,sum=0,changed=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);max=Math.max(max,d);sum+=d;changed+=d>0;}
  r.decoded={identical:x.equals(y),max_absolute_channel_delta:max,mean_absolute_channel_delta:sum/x.length,differing_channels:changed};
  r.metadata=Object.fromEntries(['icc','iptc','xmp','exif'].map(k=>[k,{live_bytes:a[k]?.length??0,local_bytes:b[k]?.length??0,identical:Buffer.from(a[k]??[]).equals(Buffer.from(b[k]??[]))}]));
  const imgs=await Promise.all([live,local].map(x=>sharp(x).resize({width:600,withoutEnlargement:true}).png().toBuffer()));const m=await sharp(imgs[0]).metadata();const name=url.split('/').pop().replace(/\.[^.]+$/,'')+'-comparison.png';await sharp({create:{width:m.width*2+16,height:m.height,channels:3,background:'#eee'}}).composite([{input:imgs[0],left:0,top:0},{input:imgs[1],left:m.width+16,top:0}]).png().toFile(dir+name);r.comparison=name;
 }
 report.images.push(r);
}
await writeFile(dir+'image-comparison.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
