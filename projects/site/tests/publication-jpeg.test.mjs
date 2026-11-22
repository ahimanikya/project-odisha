import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {deliveryJPEGs,optimizePublicationJPEGs} from '../tools/optimize-publication-jpeg.mjs';
test('JPEG delivery scope remains four explicit photos',()=>assert.deepEqual(deliveryJPEGs,['assets/sahi-jatra/performer.jpg','assets/sakhi-nata-and-sakhi-pila/mardala.jpg','images/stories/bhagabata-tungi-2016.jpg','assets/bhubaneswar-week/conversations.jpg']));
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

test('Bhagabata delivery preserves the full frame and source credits with a photo-specific caption and settings',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-bhagabata-jpeg-'));
 try{
 const sourceURL=new URL('../public/images/stories/bhagabata-tungi-2016.jpg',import.meta.url);
 const source=await readFile(sourceURL);
 const asset=deliveryJPEGs[2],page='stories/reading-the-bhagabata/index.html';
 const credit='<a href="https://commons.wikimedia.org/wiki/File:Bhagabata_Tungi.jpg">Hellohappy, Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.';
 const shareMetadata='<meta property="og:image" content="https://projectodisha.org/images/stories/bhagabata-tungi-2016.jpg"><meta property="og:image:width" content="4208"><meta property="og:image:height" content="2368"><meta name="unrelated:width" content="4208">';
 const html=shareMetadata+'<figure><img src="/images/stories/bhagabata-tungi-2016.jpg" width="4208" height="2368"><figcaption>'+credit+' Full frame, resized for display.</figcaption></figure>';
 await mkdir(path.dirname(path.join(dir,asset)),{recursive:true});await writeFile(path.join(dir,asset),source);
 await mkdir(path.dirname(path.join(dir,page)),{recursive:true});await writeFile(path.join(dir,page),html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>2500000);
 assert.equal(result.files[0].settings.maximum_dimension,2048);assert.equal(result.files[0].settings.quality,90);
 const actual=await sharp(await readFile(path.join(dir,asset))).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,2048);assert.equal(actual.height,1152);assert.ok(Math.abs(actual.height-actual.width*original.height/original.width)<=1);
 assert.equal(actual.orientation??1,original.orientation??1);assert.equal(actual.density,original.density);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 const changedHTML=await readFile(path.join(dir,page),'utf8');
 assert.equal(changedHTML,html.replace('Full frame, resized for display.','Full frame, resized and compressed for web delivery.').replace('property="og:image:width" content="4208"','property="og:image:width" content="2048"').replace('property="og:image:height" content="2368"','property="og:image:height" content="1152"'));
 assert.match(changedHTML,/<meta name="unrelated:width" content="4208">/);
 assert.match(changedHTML,/<img src="\/images\/stories\/bhagabata-tungi-2016.jpg" width="4208" height="2368">/);
 assert.ok(changedHTML.includes(credit));assert.ok((await readFile(sourceURL)).equals(source));
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Bhubaneswar delivery retains the source, photo URL, credit, second photo and sharing metadata',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-bhubaneswar-jpeg-'));
 try{
 const asset='assets/bhubaneswar-week/conversations.jpg',otherAsset='assets/bhubaneswar-week/mentis-films.jpg',page='stories/bhubaneswar-week/index.html';
 const sourceURL=new URL('../public/'+asset,import.meta.url),otherURL=new URL('../public/'+otherAsset,import.meta.url);
 const source=await readFile(sourceURL),otherSource=await readFile(otherURL);
 const caption='A moment from a week of conversations. Photograph supplied by Ahimanikya Satapathy.';
 const otherCaption='At Mentis Films during the week in Bhubaneswar. Photograph supplied by Ahimanikya Satapathy.';
 const sharing='<meta property="og:image" content="https://projectodisha.org/assets/bhubaneswar-week/poem-conversations-v1.png"><meta property="og:image:width" content="1536"><meta property="og:image:height" content="1024">';
 const html=sharing+`<figure><img src="/${asset}" width="3213" height="5712"><figcaption>${caption}</figcaption></figure><figure><img src="/${otherAsset}" width="5712" height="3213"><figcaption>${otherCaption}</figcaption></figure>`;
 await mkdir(path.dirname(path.join(dir,asset)),{recursive:true});await writeFile(path.join(dir,asset),source);await writeFile(path.join(dir,otherAsset),otherSource);
 await mkdir(path.dirname(path.join(dir,page)),{recursive:true});await writeFile(path.join(dir,page),html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].path,asset);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>2000000);
 assert.equal(result.settings.maximum_dimension,3072);assert.equal(result.settings.quality,95);assert.equal(result.settings.chromaSubsampling,'4:4:4');
 const output=await readFile(path.join(dir,asset)),actual=await sharp(output).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,1728);assert.equal(actual.height,3072);assert.equal(actual.width*original.height,actual.height*original.width);
 assert.equal(actual.orientation,original.orientation);assert.equal(actual.density,original.density);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 assert.ok(actual.exif);assert.notEqual(result.files[0].source_sha256,result.files[0].output_sha256);
 assert.equal(await readFile(path.join(dir,page),'utf8'),html.replace(caption,caption+' Full frame, resized and compressed for web delivery.'));
 assert.ok((await readFile(path.join(dir,otherAsset))).equals(otherSource));
 assert.ok((await readFile(sourceURL)).equals(source));assert.ok((await readFile(otherURL)).equals(otherSource));
 }finally{await rm(dir,{recursive:true,force:true});}
});
