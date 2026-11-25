// Lossless delivery compression only. Source/coastal files and ancillary metadata stay intact.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {inflateSync,deflateSync,crc32} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex');
// Exact measured additions; all retain decoded pixels and ancillary chunks byte-exact.
export const additionalDeliveryPNGs=[
  "assets/coast-natural-fallback-v2.png",
  "assets/maniabandha/maniabandha-illustration.png",
  "assets/cinema/pencil-akshaya-mohanty-20261101.png",
  "assets/bhubaneswar-week/poem-conversations-v1.png",
  "assets/cinema/pencil-gour-prasad-ghose-20261101.png",
  "assets/cinema/pencil-uttam-mohanty-20261101.png",
  "assets/cinema/pencil-searching-for-sita-bibaha-20261101.png",
  "assets/cinema/pencil-bijaya-jena-20261101.png",
  "assets/cinema/pencil-manmohan-mahapatra-20261101.png",
  "assets/cinema/pencil-kalindi-charan-panigrahi-20261101.png",
  "assets/cinema/pencil-nandita-das-20261101.png",
  "assets/cinema/pencil-kanhu-charan-mohanty-20261101.png",
  "assets/cinema/pencil-the-question-that-brought-me-here-20261101.png",
  "assets/cinema/pencil-aparajita-mohanty-20261101.png",
  "assets/cinema/basanta-knitting.png",
  "assets/cinema/preservation-can-and-notes-20261030.png",
  "assets/cinema/pencil-sabyasachi-mohapatra-20261101.png",
  "assets/cinema/learning-three-bicycles.png",
  "assets/cinema/pencil-who-keeps-a-film-alive-20261101.png",
  "assets/cinema/pencil-odia-ott-20261101.png",
  "assets/cinema/pencil-prafulla-kar-20261101.png",
  "assets/cinema/pencil-literature-and-screen-20261101.png",
  "assets/cinema/pencil-ak-bir-20261101.png",
  "assets/cinema/pencil-odia-television-20261101.png",
  "assets/cinema/pencil-gopal-chhotray-20261101.png",
  "assets/cinema/pencil-daman-20261101.png",
  "assets/cinema/pencil-anupam-patnaik-20261101.png",
  "assets/cinema/pencil-nirad-mohapatra-20261101.png",
  "assets/cinema/bijay-speaking-pages.png",
  "assets/cinema/pencil-commercial-successes-20261101.png",
  "assets/cinema/pencil-reading-odia-cinema-20261101.png",
  "assets/cinema/maya-miriga-threshold.png",
  "assets/cinema/pratikshya-waiting.png",
  "assets/cinema/pencil-bijay-mohanty-20261101.png",
  "assets/cinema/pencil-sadhu-meher-20261101.png",
  "assets/cinema/pencil-manglu-charan-biswal-20261101.png",
  "assets/cinema/economics-boat-screening.png",
  "assets/cinema/pencil-tapu-mishra-20261101.png",
  "assets/cinema/air-listener.png",
  "assets/cinema/surya-material-passed-on.png",
  "assets/cinema/bhukha-publicity.png",
  "assets/cinema/lipika-film-letter.png",
  "assets/cinema/pramod-paper-movement.png",
  "assets/nimuhi/user-supplied-memorial.png",
  "assets/cultural-book/author.png",
  "assets/odissi-abhinaya/abhinaya-reading.png"
];
export const eligiblePNG=p=>additionalDeliveryPNGs.includes(p)||/^(?:characters\/|images\/poetry-jhula\/|images\/stories\/).+\.png$/.test(p);
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
export async function losslessPNG(input, sourceHash=hash(input)){
 if(!input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {bytes:input,status:'non-png-content-skipped'};
 const original=chunks(input);if(original.some(c=>c.type==='acTL'))return {bytes:input,status:'animated-skipped'};
 // The line-art diagram compresses better with its original row filters.
 const keepOriginalFilters=sourceHash==='e2f4a6275a5e905c934d4b492f073fb673ed36b861dfcb9a637ae50a1d9bc6b6';
 const candidate=keepOriginalFilters ? input : await sharp(input).keepMetadata().png({compressionLevel:9,adaptiveFiltering:true,palette:false}).toBuffer();
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
 const files=[],cache=new Map();for(const path of paths.sort()){const url=new URL(path,output),input=await readFile(url),source_sha256=hash(input);let result=cache.get(source_sha256);if(!result){result=await losslessPNG(input,source_sha256);cache.set(source_sha256,result);}if(result.bytes.length<input.length)await writeFile(url,result.bytes);const {bytes,...checks}=result;files.push({path,source_sha256,output_sha256:hash(bytes),source_bytes:input.length,output_bytes:bytes.length,saved_bytes:input.length-bytes.length,...checks});}
 return {method:'PNG IDAT recompression with exact inflated scanline equality;  original ancillary chunks preserved byte-exact; decoded RGBA equality required',scope:['characters/','images/poetry-jhula/','images/stories/',...additionalDeliveryPNGs],saved_bytes:files.reduce((n,f)=>n+f.saved_bytes,0),files};
}
