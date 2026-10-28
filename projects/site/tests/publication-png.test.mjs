import {deflateSync,inflateSync,crc32} from 'node:zlib';
import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {eligiblePNG,losslessPNG,optimizePublicationPNGs,recompressIDAT} from '../tools/optimize-publication-png.mjs';
test('delivery scope excludes photographic and source asset folders',()=>{for(const p of ['characters/film/frame.png','images/poetry-jhula/art.png','images/stories/art.png'])assert.ok(eligiblePNG(p));for(const p of ['assets/nimuhi/memorial.png','images/photo.png','characters/photo.jpg','../characters/a.png'])assert.ok(!eligiblePNG(p));});
test('lossless compression retains decoded pixels, metadata and never enlarges',async()=>{const input=await sharp({create:{width:240,height:160,channels:4,background:'#8255aa88'}}).withMetadata({density:144}).png({compressionLevel:0}).toBuffer();const out=await losslessPNG(input);assert.equal(out.status,'losslessly-recompressed');assert.ok(out.bytes.length<input.length);const a=await sharp(input).ensureAlpha().raw().toBuffer(),b=await sharp(out.bytes).ensureAlpha().raw().toBuffer();assert.ok(a.equals(b));const ma=await sharp(input).metadata(),mb=await sharp(out.bytes).metadata();assert.equal(ma.density,mb.density);assert.deepEqual(ma.icc,mb.icc);assert.deepEqual(ma.exif,mb.exif);assert.ok(out.pixel_sha256);assert.ok(out.metadata_sha256);const again=await losslessPNG(out.bytes);assert.ok(again.bytes.length<=out.bytes.length);});
test('optimizer changes only allowed output files and records hashes',async()=>{const dir=await mkdtemp(path.join(tmpdir(),'publication-png-'));try{const base=pathToFileURL(dir+'/');const input=await sharp({create:{width:120,height:120,channels:3,background:'#aabbcc'}}).png({compressionLevel:0}).toBuffer();await mkdir(new URL('characters/',base));await mkdir(new URL('assets/',base));await writeFile(new URL('characters/a.png',base),input);await writeFile(new URL('assets/a.png',base),input);const report=await optimizePublicationPNGs(base);assert.equal(report.files.length,1);assert.ok(report.saved_bytes>0);assert.ok((await readFile(new URL('assets/a.png',base))).equals(input));assert.equal(report.files[0].path,'characters/a.png');assert.notEqual(report.files[0].source_sha256,report.files[0].output_sha256);}finally{await rm(dir,{recursive:true,force:true});}});

test('misnamed non-PNG files remain byte-exact',async()=>{const input=Buffer.from('not a PNG');const result=await losslessPNG(input);assert.equal(result.status,'non-png-content-skipped');assert.ok(result.bytes.equals(input));});

test('IDAT recompression preserves exact filtered scanlines and valid chunk CRC without enlargement',()=>{
 const scanlines=Buffer.from('filtered scanline bytes\0'.repeat(4000));const input=deflateSync(scanlines,{level:0});const result=recompressIDAT(input),chunk=result.chunk,data=chunk.subarray(8,-4);
 assert.equal(chunk.toString('ascii',4,8),'IDAT');assert.equal(chunk.readUInt32BE(0),data.length);assert.ok(data.length<input.length);assert.ok(inflateSync(data).equals(scanlines));assert.equal(chunk.readUInt32BE(chunk.length-4),crc32(chunk.subarray(4,-4))>>>0);assert.ok(result.inflated_sha256);const again=recompressIDAT(data);assert.ok(again.chunk.length<=chunk.length);
 assert.throws(()=>recompressIDAT(Buffer.from('invalid compressed bytes')));
});
