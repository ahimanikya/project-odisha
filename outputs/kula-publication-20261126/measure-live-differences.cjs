// Read-only pixel measurements of the actual live/local image pairs retained by verify-live.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const sharp=require(path.join(root,'projects/site/node_modules/sharp'));
async function main(){
 const reportPath=process.argv[2];if(!reportPath)throw Error('Pass actual live http.json');
 const report=JSON.parse(fs.readFileSync(reportPath,'utf8')),rows=[];
 for(const item of report.images.filter(x=>x.byte_match===false)){
  const local=path.join(root,item.local_file),live=path.join(root,item.file);
  const [a,b]=await Promise.all([local,live].map(p=>sharp(p).rotate().removeAlpha().raw().toBuffer({resolveWithObject:true})));
  if(JSON.stringify(a.info)!==JSON.stringify(b.info))throw Error('Decoded geometry differs: '+item.url);
  let channels=0,pixels=0,max=0,sum=0,squares=0;
  for(let i=0;i<a.data.length;i+=a.info.channels){let changed=false;for(let c=0;c<a.info.channels;c++){const d=Math.abs(a.data[i+c]-b.data[i+c]);if(d){channels++;changed=true;}max=Math.max(max,d);sum+=d;squares+=d*d;}if(changed)pixels++;}
  rows.push({url:item.url,local_file:item.local_file,live_file:item.file,width:a.info.width,height:a.info.height,channels:a.info.channels,changed_channels:channels,changed_pixels:pixels,max_absolute_delta:max,mean_absolute_delta:sum/a.data.length,rms_delta:Math.sqrt(squares/a.data.length)});
 }
 const out={status:rows.length?'VISUAL_REVIEW_REQUIRED':'NO_BYTE_DIFFERENCES',source_report:reportPath,pairs:rows,limits:'Decoded measurements only; no visual acceptance or encoding-cause assertion.'};
 const target=path.join(path.dirname(reportPath),'pixel-differences.json');if(fs.existsSync(target))throw Error('Refuse overwriting measurements');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log(target);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
