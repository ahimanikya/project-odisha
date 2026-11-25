import {deflateSync,inflateSync,crc32} from 'node:zlib';
import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {additionalDeliveryPNGs,eligiblePNG,losslessPNG,optimizePublicationPNGs,recompressIDAT} from '../tools/optimize-publication-png.mjs';
test('delivery scope excludes photographic and source asset folders',()=>{for(const p of ['characters/film/frame.png','images/poetry-jhula/art.png','images/stories/art.png'])assert.ok(eligiblePNG(p));for(const p of ['assets/nimuhi/memorial.png','images/photo.png','characters/photo.jpg','../characters/a.png'])assert.ok(!eligiblePNG(p));});
test('lossless compression retains decoded pixels, metadata and never enlarges',async()=>{const input=await sharp({create:{width:240,height:160,channels:4,background:'#8255aa88'}}).withMetadata({density:144}).png({compressionLevel:0}).toBuffer();const out=await losslessPNG(input);assert.equal(out.status,'losslessly-recompressed');assert.ok(out.bytes.length<input.length);const a=await sharp(input).ensureAlpha().raw().toBuffer(),b=await sharp(out.bytes).ensureAlpha().raw().toBuffer();assert.ok(a.equals(b));const ma=await sharp(input).metadata(),mb=await sharp(out.bytes).metadata();assert.equal(ma.density,mb.density);assert.deepEqual(ma.icc,mb.icc);assert.deepEqual(ma.exif,mb.exif);assert.ok(out.pixel_sha256);assert.ok(out.metadata_sha256);const again=await losslessPNG(out.bytes);assert.ok(again.bytes.length<=out.bytes.length);});
test('optimizer changes only allowed output files and records hashes',async()=>{const dir=await mkdtemp(path.join(tmpdir(),'publication-png-'));try{const base=pathToFileURL(dir+'/');const input=await sharp({create:{width:120,height:120,channels:3,background:'#aabbcc'}}).png({compressionLevel:0}).toBuffer();await mkdir(new URL('characters/',base));await mkdir(new URL('assets/',base));await writeFile(new URL('characters/a.png',base),input);await writeFile(new URL('assets/a.png',base),input);const report=await optimizePublicationPNGs(base);assert.equal(report.files.length,1);assert.ok(report.saved_bytes>0);assert.ok((await readFile(new URL('assets/a.png',base))).equals(input));assert.equal(report.files[0].path,'characters/a.png');assert.notEqual(report.files[0].source_sha256,report.files[0].output_sha256);}finally{await rm(dir,{recursive:true,force:true});}});

test('misnamed non-PNG files remain byte-exact',async()=>{const input=Buffer.from('not a PNG');const result=await losslessPNG(input);assert.equal(result.status,'non-png-content-skipped');assert.ok(result.bytes.equals(input));});

test('IDAT recompression preserves exact filtered scanlines and valid chunk CRC without enlargement',()=>{
 const scanlines=Buffer.from('filtered scanline bytes\0'.repeat(4000));const input=deflateSync(scanlines,{level:0});const result=recompressIDAT(input),chunk=result.chunk,data=chunk.subarray(8,-4);
 assert.equal(chunk.toString('ascii',4,8),'IDAT');assert.equal(chunk.readUInt32BE(0),data.length);assert.ok(data.length<input.length);assert.ok(inflateSync(data).equals(scanlines));assert.equal(chunk.readUInt32BE(chunk.length-4),crc32(chunk.subarray(4,-4))>>>0);assert.ok(result.inflated_sha256);const again=recompressIDAT(data);assert.ok(again.chunk.length<=chunk.length);
 assert.throws(()=>recompressIDAT(Buffer.from('invalid compressed bytes')));
});

test('additional PNG delivery scope is an exact measured allowlist',()=>{
 const expected=[
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
 assert.deepEqual(additionalDeliveryPNGs,expected);
 for(const p of expected){assert.ok(eligiblePNG(p));assert.ok(!eligiblePNG("../"+p));assert.ok(!eligiblePNG(p+".backup"));}
 for(const p of ["assets/cinema/other.png","assets/maniabandha/other.png","assets/nimuhi/other-memorial.png"])assert.ok(!eligiblePNG(p));
});

test('published abhinaya diagram retains its pixels and metadata with smaller original scanlines',async()=>{
 const input=await readFile(new URL('../public/assets/odissi-abhinaya/abhinaya-reading.png',import.meta.url));
 const result=await losslessPNG(input);
 assert.equal(result.status,'losslessly-recompressed');
 assert.ok(input.length-result.bytes.length>=15000);
 assert.ok(result.pixel_sha256 && result.metadata_sha256);
});
