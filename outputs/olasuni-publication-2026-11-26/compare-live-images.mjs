// Measurement only: run after successful deployment and verify-live-combined.py.
// Required: --expected-merge <40 hex> --deployment-run <positive run ID>.
// The predecessor was copied with the APFS clone-aware helper; no network calls.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url),dir=new URL('./',import.meta.url);
const sharp=createRequire(new URL('projects/site/package.json',root))('sharp');
const hash=b=>createHash('sha256').update(b).digest('hex');
const args=process.argv.slice(2),options={};
if(args.length!==4)throw Error('Supply --expected-merge and --deployment-run');
for(let i=0;i<args.length;i+=2){if(!['--expected-merge','--deployment-run'].includes(args[i])||options[args[i]])throw Error('Unknown or repeated option');options[args[i]]=args[i+1];}
const expectedMerge=options['--expected-merge'],expectedRun=options['--deployment-run'];
if(!/^[0-9a-f]{40}$/.test(expectedMerge??'')||!/^\d+$/.test(expectedRun??'')||BigInt(expectedRun)<=0n)throw Error('Explicit merge and positive deployment run required');
const raw=await readFile(new URL('live-verification.json',dir)),v=JSON.parse(raw);
const contractRaw=await readFile(new URL('reviewed-article-contract-combined.json',dir)),c=JSON.parse(contractRaw);
const localRaw=await readFile(new URL('local-verification-combined.json',dir));
if(!['PASS','REVIEW_DIFFERENCES'].includes(v.status))throw Error('Completed successful HTTP evidence required');
if(v.expected_merge!==expectedMerge||String(v.deployment_run)!==expectedRun)throw Error('Explicit release does not match captured evidence');
if(v.contract_sha256!==hash(contractRaw)||v.local_verification_sha256!==hash(localRaw)||JSON.parse(localRaw).status!=='PASS')throw Error('Reviewed combined contract/local evidence mismatch');
const deploymentRaw=await readFile(v.deployment_evidence),deployment=JSON.parse(deploymentRaw);
if(hash(deploymentRaw)!==v.deployment_evidence_sha256||deployment.status!=='completed'||deployment.conclusion!=='success'||String(deployment.id??deployment.databaseId??deployment.run)!==expectedRun||(deployment.head_sha??deployment.headSha??deployment.head)!==expectedMerge)throw Error('Successful deployment proof does not match release');
const expectedRoutes=['/destinations/olasuni/','/destinations/hills/','/destinations/','/explore/','/stories/bhubaneswar-week/'];
if(c.route!==expectedRoutes[0]||v.routes?.length!==5||new Set(v.routes.map(x=>x.route)).size!==5||!expectedRoutes.every(r=>v.routes.some(x=>x.route===r&&x.status===200)))throw Error('Five exact successful route captures required');
const requiredImages=[c.image.src,'/'+c.capacity.path,'/'+c.capacity.second_path,'/'+c.capacity.sharing_path];
if(!Array.isArray(v.images)||!v.images.length||!requiredImages.every(u=>v.images.some(x=>x.url===u))||new Set(v.images.map(x=>x.url)).size!==v.images.length||v.images.some(x=>x.status!==200))throw Error('Complete unique successful image evidence required');
// Resolve only bounded paths that the HTTP helper actually recorded.
const bounded=(name,prefix)=>{
 if(typeof name!=='string'||name.includes('\\')||name.includes('?')||name.includes('#')||path.posix.isAbsolute(name)||name.split('/').some(x=>x==='..'||x==='.')||!name.startsWith(prefix))throw Error('Unbounded evidence path '+name);
 return new URL(name,root);
};
if(typeof v.raw_directory!=='string'||!v.raw_directory.startsWith('outputs/olasuni-publication-2026-11-26/live/'))throw Error('Expected Olasuni raw evidence directory');
const rawPrefix=v.raw_directory+'/';bounded(v.raw_directory, 'outputs/olasuni-publication-2026-11-26/live/');
for(const route of v.routes){const bytes=await readFile(bounded(route.file,rawPrefix));if(hash(bytes)!==route.sha256)throw Error('Raw captured page changed '+route.route);}
const run=new URL('image-comparison-'+new Date().toISOString().replace(/[:.]/g,'-')+'/',dir);
await mkdir(run); // New evidence directory; never overwrite prior measurements.
const report={status:'RUNNING',raw_status:v.status,raw_sha256:hash(raw),raw_directory:v.raw_directory,contract_sha256:hash(contractRaw),expected_merge:expectedMerge,deployment_run:expectedRun,decoder:{sharp:sharp.versions.sharp,libvips:sharp.versions.vips},images:[],limits:['Only actual observed live/local pairs are compared; no network retrieval or unknown URL normalization.','The same installed decoder orientation-normalizes both images to sRGB RGBA. Decoded identity is not whole-file or original-encoding identity.','Raw HTTP/HTML differences remain untouched. Statistics and contact sheets are measurements, not automatic visual acceptance or evidence of an encoding cause.','Contact sheets are resized full-frame previews on white; actual source bytes remain available for detailed visual review.']};
try{
 for(const [index,e] of v.images.entries()){
  if(typeof e.local_url!=='string'||!e.local_url.startsWith('/')||e.local_url.startsWith('//')||typeof e.url!=='string'||!e.url.startsWith('/')||e.url.startsWith('//'))throw Error('Bounded actual image URLs required');
  const expectedLocal='projects/site/dist-publish'+e.local_url;
  if(e.local_file!==expectedLocal)throw Error('Recorded local file/URL mismatch');
  const live=await readFile(bounded(e.file,rawPrefix)),local=await readFile(bounded(e.local_file,'projects/site/dist-publish/'));
  if(hash(live)!==e.sha256||hash(local)!==e.local_sha256||live.length!==e.bytes||local.length!==e.local_bytes)throw Error('Image changed since HTTP evidence');
  for(const [url,bytes]of [[e.url,live],[e.local_url,local]])if(url.startsWith('/images/responsive/')&&!url.split('/').pop().startsWith(hash(bytes).slice(0,16)+'-'))throw Error('Responsive content-address mismatch '+url);
  const a=await sharp(live).metadata(),b=await sharp(local).metadata();
  if(a.width!==b.width||a.height!==b.height||(a.orientation??1)!==(b.orientation??1))throw Error('Geometry mismatch '+e.url);
  const decode=x=>sharp(x).rotate().toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const x=await decode(live),y=await decode(local);
  if(x.info.width!==y.info.width||x.info.height!==y.info.height||x.info.channels!==y.info.channels||x.data.length!==y.data.length)throw Error('Decoded layout mismatch');
  let max=0,sum=0,squares=0,changed=0;
  for(let i=0;i<x.data.length;i++){const delta=Math.abs(x.data[i]-y.data[i]);max=Math.max(max,delta);sum+=delta;squares+=delta*delta;if(delta)changed++;}
  const entry={url:e.url,local_url:e.local_url,saved:e.file,local_file:e.local_file,live_bytes:live.length,local_bytes:local.length,dimensions:[a.width,a.height],orientation:a.orientation??1,has_alpha:{live:a.hasAlpha,local:b.hasAlpha},live_sha256:hash(live),local_sha256:hash(local),byte_equal:live.equals(local),decoded:{identical:x.data.equals(y.data),width:x.info.width,height:x.info.height,channels:x.info.channels,changed_channels:changed,total_channels:x.data.length,max_absolute_channel_delta:max,mean_absolute_channel_delta:sum/x.data.length,root_mean_squared_channel_delta:Math.sqrt(squares/x.data.length)},metadata:Object.fromEntries(['icc','iptc','xmp','exif'].map(k=>[k,{live_bytes:a[k]?.length??0,local_bytes:b[k]?.length??0,identical:Buffer.from(a[k]??[]).equals(Buffer.from(b[k]??[])),live_sha256:a[k]?hash(a[k]):null,local_sha256:b[k]?hash(b[k]):null}]))};
  // Each observed pair receives a labelled, full-frame contact sheet.
  const tile=bytes=>sharp(bytes).rotate().toColourspace('srgb').resize({width:640,height:480,fit:'contain',background:'#ffffff',withoutEnlargement:true}).png().toBuffer();
  const labels=Buffer.from('<svg width="1280" height="32"><rect width="1280" height="32" fill="white"/><text x="12" y="23" font-size="18" fill="black">Reviewed local</text><text x="652" y="23" font-size="18" fill="black">Actual live</text></svg>');
  const sheet=await sharp({create:{width:1280,height:512,channels:3,background:'#ffffff'}}).composite([{input:labels,left:0,top:0},{input:await tile(local),left:0,top:32},{input:await tile(live),left:640,top:32}]).png().toBuffer();
  const filename=String(index).padStart(2,'0')+'-local-live.png';await writeFile(new URL(filename,run),sheet,{flag:'wx'});
  entry.contact_sheet={file:path.relative(fileURLToPath(root),fileURLToPath(new URL(filename,run))),sha256:hash(sheet),layout:'Reviewed local left; actual live right; full frame'};
  report.images.push(entry);
 }
 if(hash(await readFile(new URL('live-verification.json',dir)))!==report.raw_sha256||hash(await readFile(new URL('reviewed-article-contract-combined.json',dir)))!==report.contract_sha256)throw Error('Evidence changed during measurement');
 for(const e of report.images)if(hash(await readFile(bounded(e.saved,rawPrefix)))!==e.live_sha256||hash(await readFile(bounded(e.local_file,'projects/site/dist-publish/')))!==e.local_sha256)throw Error('Image changed during measurement');
 report.status=report.images.every(x=>x.byte_equal)?'all_observed_images_byte_exact':'measurement_complete_visual_review_pending';
}catch(error){report.status='FAIL';report.error=String(error);throw error;}
finally{
 await writeFile(new URL('report.json',run),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:report.status,report:path.relative(fileURLToPath(root),fileURLToPath(new URL('report.json',run))),images:report.images.length,byte_differences:report.images.filter(x=>!x.byte_equal).length}));
}
