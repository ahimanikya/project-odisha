import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {deliveryJPEGs,optimizePublicationJPEGs} from '../tools/optimize-publication-jpeg.mjs';
test('JPEG delivery scope remains two explicit photos',()=>assert.deepEqual(deliveryJPEGs,['assets/sahi-jatra/performer.jpg','assets/sakhi-nata-and-sakhi-pila/mardala.jpg']));
test('delivery resizing preserves ratio, orientation and credit metadata while leaving originals and unrelated files unchanged',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-jpeg-'));
 try{
 const source=await sharp({create:{width:4000,height:2400,channels:3,background:'#87553a'}}).withMetadata({orientation:8,density:144}).withXmp('<x:xmpmeta xmlns:x="adobe:ns:meta/"><credit>Test photographer</credit></x:xmpmeta>').jpeg({quality:100}).toBuffer();
 await mkdir(path.join(dir,'assets/sahi-jatra'),{recursive:true});await writeFile(path.join(dir,'original.jpg'),source);await writeFile(path.join(dir,deliveryJPEGs[0]),source);await writeFile(path.join(dir,'assets/unrelated.jpg'),source);
 await mkdir(path.join(dir,'stories/sahi-jatra'),{recursive:true});await writeFile(path.join(dir,'stories/sahi-jatra/index.html'),'<a href="https://commons.wikimedia.org/wiki/File:Parsurama_in_Sahi_Jata.jpg">Source</a>; reproduced without alteration.');
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>0);
 const actual=await sharp(await readFile(path.join(dir,deliveryJPEGs[0]))).metadata(),original=await sharp(source).metadata();assert.equal(actual.width,3072);assert.equal(actual.height,1843);assert.equal(actual.orientation,8);assert.deepEqual(actual.xmp,original.xmp);assert.deepEqual(actual.icc,original.icc);assert.equal(actual.density,original.density);assert.ok((await readFile(path.join(dir,'original.jpg'))).equals(source));assert.ok((await readFile(path.join(dir,'assets/unrelated.jpg'))).equals(source));assert.notEqual(result.files[0].source_sha256,result.files[0].output_sha256);assert.match(await readFile(path.join(dir,'stories/sahi-jatra/index.html'),'utf8'),/resized and compressed for web delivery without cropping/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
