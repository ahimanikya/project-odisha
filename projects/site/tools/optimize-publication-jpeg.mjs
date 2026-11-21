// Bounded delivery derivatives only; repository and coastal originals remain intact.
import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const deliveryJPEGs=['assets/sahi-jatra/performer.jpg','assets/sakhi-nata-and-sakhi-pila/mardala.jpg','images/stories/bhagabata-tungi-2016.jpg'];
const captions={
 'assets/sahi-jatra/performer.jpg':{page:'stories/sahi-jatra/index.html',source:'https://commons.wikimedia.org/wiki/File:Parsurama_in_Sahi_Jata.jpg'},
 'assets/sakhi-nata-and-sakhi-pila/mardala.jpg':{page:'stories/sakhi-nata-and-sakhi-pila/index.html',source:'https://commons.wikimedia.org/wiki/File:Mardala_used_in_Sakhi_Nata.jpg'},
 'images/stories/bhagabata-tungi-2016.jpg':{page:'stories/reading-the-bhagabata/index.html',source:'https://commons.wikimedia.org/wiki/File:Bhagabata_Tungi.jpg',phrase:'Full frame, resized for display.',description:'Full frame, resized and compressed for web delivery.',updateShareDimensions:true,settings:{maximum_dimension:2048,quality:90}}
};
const settings={maximum_dimension:3072,quality:95,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function optimizePublicationJPEGs(output){
 const files=[];
 for(const path of deliveryJPEGs){
  const url=new URL(path,output);let input;try{input=await readFile(url);}catch(error){if(error.code==='ENOENT')continue;throw error;}
  const caption=captions[path],photoSettings={...settings,...caption.settings};
  const before=await sharp(input).metadata();
  if(before.format!=='jpeg')throw Error('Expected JPEG delivery source: '+path);
  const bytes=await sharp(input).resize({width:photoSettings.maximum_dimension,height:photoSettings.maximum_dimension,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:photoSettings.quality,chromaSubsampling:photoSettings.chromaSubsampling,mozjpeg:photoSettings.mozjpeg}).toBuffer();
  if(bytes.length>=input.length){files.push({path,status:'not-smaller',source_bytes:input.length,output_bytes:input.length,saved_bytes:0});continue;}
  const after=await sharp(bytes).metadata();
  if(after.width>before.width||after.height>before.height||Math.abs(after.height-after.width*before.height/before.width)>1||(after.orientation??1)!==(before.orientation??1))throw Error('JPEG geometry changed unexpectedly: '+path);
  for(const field of ['icc','iptc','xmp'])if(!Buffer.from(before[field]||[]).equals(Buffer.from(after[field]||[])))throw Error('JPEG attribution/profile metadata changed: '+field+' '+path);
  const pageURL=new URL(caption.page,output),html=await readFile(pageURL,'utf8');
  const phrase=caption.phrase??'reproduced without alteration.';
  if(!html.includes(caption.source)||html.split(phrase).length!==2)throw Error('Expected unique photo credit before delivery transform: '+caption.page);
  const changedDimensions=after.width!==before.width||after.height!==before.height;
  const description=caption.description??((changedDimensions?'resized and compressed':'compressed')+' for web delivery without cropping.');
  let transformedHTML=html.replace(phrase,description);
  if(caption.updateShareDimensions){
   const shareImages=[...html.matchAll(/<meta property="og:image" content="([^"]+)">/g)];
   if(shareImages.length!==1||new URL(shareImages[0][1]).pathname!=='/'+path)throw Error('Expected matching share image before delivery transform: '+caption.page);
   for(const dimension of ['width','height']){
    const originalTag='<meta property="og:image:'+dimension+'" content="'+before[dimension]+'">';
    if(transformedHTML.split(originalTag).length!==2)throw Error('Expected unique share image '+dimension+' before delivery transform: '+caption.page);
    transformedHTML=transformedHTML.replace(originalTag,'<meta property="og:image:'+dimension+'" content="'+after[dimension]+'">');
   }
  }
  await writeFile(url,bytes);
  await writeFile(pageURL,transformedHTML);
  files.push({path,...(caption.settings?{settings:photoSettings}:{}),status:changedDimensions?'resized-and-compressed':'compressed',source_sha256:hash(input),output_sha256:hash(bytes),source_bytes:input.length,output_bytes:bytes.length,saved_bytes:input.length-bytes.length,source_dimensions:[before.width,before.height],output_dimensions:[after.width,after.height],orientation:after.orientation??null});
 }
 return {method:'Aspect-preserving JPEG delivery derivatives; originals retained in repository and coastal build; no cropping',settings,files,saved_bytes:files.reduce((n,f)=>n+f.saved_bytes,0)};
}
