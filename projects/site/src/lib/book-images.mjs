export const BOOK_IMAGE_LIMITS={count:12,perImage:2*1024*1024,total:8*1024*1024};
export const localBookPath=path=>typeof path==='string'&&/^\/(?:assets|images)\/[A-Za-z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(path);
export function bookImageBytes(data){
 if(typeof data!=='string'||!/^data:image\/(?:jpeg|png|webp);base64,/.test(data)||data.length>Math.ceil(BOOK_IMAGE_LIMITS.perImage*4/3)+100)return 0;
 const payload=data.slice(data.indexOf(',')+1);if(payload.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(payload))return 0;return payload.length/4*3-(payload.endsWith('==')?2:payload.endsWith('=')?1:0);
}
export function validBookImage(data){const bytes=bookImageBytes(data);return bytes>0&&bytes<=BOOK_IMAGE_LIMITS.perImage;}
function abortIfNeeded(signal){if(signal?.aborted)throw new DOMException('Photo book cancelled.','AbortError');}
// IDs from imported plans never supply URLs. All paths come from the curated catalogue.
export async function collectBookImages(plan,entries,load,{signal,onProgress=()=>{},additionalPhotos=[]}={}){
 const catalog=new Map(entries.map(e=>[e.id,e])),images={},skipped=[];let bytes=0,completed=0;
 const photos=[...new Map([...additionalPhotos,...plan.items.flatMap(saved=>{const item=catalog.get(saved.id);return [item?.photo,...(item?.additionalPhotos||[])];})].filter(Boolean).map(p=>[p.src,p])).values()];
 for(const photo of photos){
  abortIfNeeded(signal);
  if(!localBookPath(photo.src)||Object.keys(images).length>=BOOK_IMAGE_LIMITS.count){skipped.push(photo.src);onProgress({completed:++completed,total:photos.length});continue;}
  try{const image=await load(photo.src,{signal});abortIfNeeded(signal);const actual=bookImageBytes(image.data);
   if(!Number.isFinite(image.bytes)||actual!==image.bytes||!validBookImage(image.data)||bytes+actual>BOOK_IMAGE_LIMITS.total)throw Error('Image outside book limits');
   images[photo.src]=image.data;bytes+=actual;
  }catch(error){abortIfNeeded(signal);skipped.push(photo.src);}
  onProgress({completed:++completed,total:photos.length});
 }
 abortIfNeeded(signal);return {images,skipped,bytes};
}
export async function loadLocalBookImage(path,{signal}={}){
 if(!localBookPath(path))throw Error('Choose a curated local image.');abortIfNeeded(signal);
 const controller=new AbortController(),cancel=()=>controller.abort(),timer=setTimeout(cancel,12000);signal?.addEventListener('abort',cancel,{once:true});
 let reader;
 try{
  const response=await fetch(path,{signal:controller.signal,credentials:'omit',redirect:'error'});if(!response.ok)throw Error('Image unavailable');
  const type=response.headers.get('content-type')?.split(';')[0].trim();if(!['image/jpeg','image/png','image/webp'].includes(type))throw Error('Unsupported image');
  if(Number(response.headers.get('content-length'))>BOOK_IMAGE_LIMITS.perImage)throw Error('Image too large');
  if(!response.body)throw Error('Image stream unavailable');
  reader=response.body.getReader();const chunks=[];let size=0;
  while(true){abortIfNeeded(signal);const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>BOOK_IMAGE_LIMITS.perImage)throw Error('Image too large');chunks.push(value);}
  abortIfNeeded(signal);if(!size)throw Error('Image is empty');
  const blob=new Blob(chunks,{type});const data=await new Promise((resolve,reject)=>{const file=new FileReader();file.onload=()=>resolve(file.result);file.onerror=()=>reject(Error('Image could not be read'));file.readAsDataURL(blob);});
  abortIfNeeded(signal);return {data,bytes:size};
 }finally{clearTimeout(timer);controller.abort();signal?.removeEventListener('abort',cancel);if(reader){try{await reader.cancel();}catch{}reader.releaseLock();}}
}
