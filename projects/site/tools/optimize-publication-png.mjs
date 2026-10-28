// Lossless delivery compression only. Source/coastal files and ancillary metadata stay intact.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {inflateSync,deflateSync,crc32} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex');
export const eligiblePNG=p=>/^(?:characters\/|images\/poetry-jhula\/|images\/stories\/).+\.png$/.test(p);
function chunks(bytes){
 if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid PNG signature');
 const result=[];let pos=8;
 while(pos<bytes.length){const len=bytes.readUInt32BE(pos),end=pos+len+12;if(end>bytes.length)throw Error('Truncated PNG');result.push({type:bytes.toString('ascii',pos+4,pos+8),bytes:bytes.subarray(pos,end)});pos=end;}
 return result;
}
// Re-encode only the compression envelope; PNG filter bytes and scanlines stay identical.
export function recompressIDAT(input){
 const scanlines=inflateSync(input);let best=input,settings=null;
 for(const memLevel of [8,9])for(const strategy of [0,1]){
  const candidate=deflateSync(scanlines,{level:9,memLevel,strategy});
  if(candidate.length<best.length){best=candidate;settings={level:9,memLevel,strategy};}
 }
 if(!inflateSync(best).equals(scanlines))throw Error('PNG inflated scanline equality failed');
 const type=Buffer.from('IDAT'),chunk=Buffer.alloc(best.length+12);
 chunk.writeUInt32BE(best.length,0);type.copy(chunk,4);best.copy(chunk,8);chunk.writeUInt32BE(crc32(Buffer.concat([type,best]))>>>0,best.length+8);
 return {chunk,settings,inflated_sha256:hash(scanlines)};
}
export async function losslessPNG(input){
 if(!input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {bytes:input,status:'non-png-content-skipped'};
 const original=chunks(input);if(original.some(c=>c.type==='acTL'))return {bytes:input,status:'animated-skipped'};
 const candidate=await sharp(input).keepMetadata().png({compressionLevel:9,adaptiveFiltering:true,palette:false}).toBuffer();
 const encoded=chunks(candidate);
 // Preserve every original non-image chunk, including colour profiles, textual credits and EXIF.
 if(!original.find(c=>c.type==='IHDR').bytes.equals(encoded.find(c=>c.type==='IHDR').bytes))return {bytes:input,status:'header-change-skipped'};
 const compressed=Buffer.concat(encoded.filter(c=>c.type==='IDAT').map(c=>c.bytes.subarray(8,-4)));
 const recompressed=recompressIDAT(compressed);const idat=[recompressed.chunk];let inserted=false;
 const output=Buffer.concat([input.subarray(0,8),...original.flatMap(c=>{if(c.type!=='IDAT')return [c.bytes];if(inserted)return [];inserted=true;return idat;})]);
 if(output.length>=input.length)return {bytes:input,status:'not-smaller'};
 const [before,after]=await Promise.all([sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}),sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true})]);
 if(JSON.stringify(before.info)!==JSON.stringify(after.info)||!before.data.equals(after.data))throw Error('PNG pixel equality failed');
 const metadata=b=>Buffer.concat(chunks(b).filter(c=>c.type!=='IDAT').map(c=>c.bytes));
 if(!metadata(input).equals(metadata(output)))throw Error('PNG metadata changed');
 return {bytes:output,status:'losslessly-recompressed',deflate_settings:recompressed.settings,inflated_scanline_sha256:recompressed.inflated_sha256,pixel_sha256:hash(before.data),metadata_sha256:hash(metadata(input)),width:before.info.width,height:before.info.height};
}
export async function optimizePublicationPNGs(output){
 const paths=[];async function walk(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Publication output must not contain symlinks');const p=prefix+e.name;if(e.isDirectory())await walk(new URL(e.name+'/',dir),p+'/');else if(eligiblePNG(p))paths.push(p);}}await walk(output);
 const files=[],cache=new Map();for(const path of paths.sort()){const url=new URL(path,output),input=await readFile(url),source_sha256=hash(input);let result=cache.get(source_sha256);if(!result){result=await losslessPNG(input);cache.set(source_sha256,result);}if(result.bytes.length<input.length)await writeFile(url,result.bytes);const {bytes,...checks}=result;files.push({path,source_sha256,output_sha256:hash(bytes),source_bytes:input.length,output_bytes:bytes.length,saved_bytes:input.length-bytes.length,...checks});}
 return {method:'PNG IDAT recompression with exact inflated scanline equality;  original ancillary chunks preserved byte-exact; decoded RGBA equality required',scope:['characters/','images/poetry-jhula/','images/stories/'],saved_bytes:files.reduce((n,f)=>n+f.saved_bytes,0),files};
}
