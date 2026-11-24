import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {deliveryJPEGs,optimizePublicationJPEGs} from '../tools/optimize-publication-jpeg.mjs';
test('JPEG delivery scope remains eight explicit images',()=>assert.deepEqual(deliveryJPEGs,['assets/sahi-jatra/performer.jpg','assets/sakhi-nata-and-sakhi-pila/mardala.jpg','images/stories/bhagabata-tungi-2016.jpg','assets/bhubaneswar-week/conversations.jpg','assets/bhubaneswar-week/mentis-films.jpg','assets/jhulana-in-odisha/hindola-raga.jpg','assets/ashta-nayika/abhisarika-met.jpg','assets/champu-and-sakhi/radha-confidante-met.jpg']));
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

test('Bhubaneswar delivery retains the source, photo URL, credits, both full frames and sharing metadata',async()=>{
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
 assert.equal(result.files.length,2);assert.equal(result.files[0].path,asset);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>2000000);
 assert.equal(result.settings.maximum_dimension,3072);assert.equal(result.settings.quality,95);assert.equal(result.settings.chromaSubsampling,'4:4:4');
 const output=await readFile(path.join(dir,asset)),actual=await sharp(output).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,1728);assert.equal(actual.height,3072);assert.equal(actual.width*original.height,actual.height*original.width);
 assert.equal(actual.orientation,original.orientation);assert.equal(actual.density,original.density);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 assert.ok(actual.exif);assert.notEqual(result.files[0].source_sha256,result.files[0].output_sha256);
 assert.equal(await readFile(path.join(dir,page),'utf8'),html.replace(caption,caption+' Full frame, resized and compressed for web delivery.').replace(otherCaption,otherCaption+' Full frame, resized and compressed for web delivery.'));
 const second=result.files.find(file=>file.path===otherAsset);assert.equal(second.status,'resized-and-compressed');assert.ok(second.saved_bytes>2400000);
 const secondOutput=await readFile(path.join(dir,otherAsset)),secondMeta=await sharp(secondOutput).metadata(),secondOriginal=await sharp(otherSource).metadata();
 assert.equal(secondMeta.width,3072);assert.equal(secondMeta.height,1728);assert.equal(secondMeta.width*secondOriginal.height,secondMeta.height*secondOriginal.width);
 assert.equal(secondMeta.orientation,secondOriginal.orientation);assert.equal(secondMeta.density,secondOriginal.density);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(secondMeta[field],secondOriginal[field]);
 assert.ok(secondMeta.exif);assert.notEqual(second.source_sha256,second.output_sha256);
 assert.ok((await readFile(sourceURL)).equals(source));assert.ok((await readFile(otherURL)).equals(otherSource));
 }finally{await rm(dir,{recursive:true,force:true});}
});


test('Hindola delivery retains the complete painting, museum credit and source while updating share geometry',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-hindola-jpeg-'));
 try{
 const asset='assets/jhulana-in-odisha/hindola-raga.jpg',page='stories/jhulana-in-odisha/index.html';
 const sourceURL=new URL('../public/'+asset,import.meta.url),source=await readFile(sourceURL);
 const credit='<a href="https://www.clevelandart.org/art/1975.9">Cleveland Museum of Art, 1975.9</a>. Image released under CC0.';
 const html='<meta property="og:image" content="https://projectodisha.org/'+asset+'"><meta property="og:image:width" content="2519"><meta property="og:image:height" content="3400"><p>'+credit+'</p>';
 await mkdir(path.dirname(path.join(dir,asset)),{recursive:true});await writeFile(path.join(dir,asset),source);
 await mkdir(path.dirname(path.join(dir,page)),{recursive:true});await writeFile(path.join(dir,page),html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>1000000);
 const actual=await sharp(await readFile(path.join(dir,asset))).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,1517);assert.equal(actual.height,2048);assert.equal(actual.orientation??1,original.orientation??1);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 assert.equal(await readFile(path.join(dir,page),'utf8'),html.replace('Image released under CC0.','Image released under CC0. Full frame, resized and compressed for web delivery.').replace('property="og:image:width" content="2519"','property="og:image:width" content="1517"').replace('property="og:image:height" content="3400"','property="og:image:height" content="2048"'));
 assert.ok((await readFile(sourceURL)).equals(source));
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Abhisarika delivery retains the complete painting, museum credit and source while updating share geometry',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-abhisarika-jpeg-'));
 try{
 const asset='assets/ashta-nayika/abhisarika-met.jpg',page='stories/ashta-nayika/index.html';
 const sourceURL=new URL('../public/'+asset,import.meta.url),source=await readFile(sourceURL);
 const credit='<a href="https://www.metmuseum.org/art/collection/search/37992">The Metropolitan Museum of Art, Rogers Fund, 1918, 18.134.3</a>; public domain.';
 const html='<meta property="og:image" content="https://projectodisha.org/'+asset+'"><meta property="og:image:width" content="2907"><meta property="og:image:height" content="4000"><p>'+credit+'</p>';
 await mkdir(path.dirname(path.join(dir,asset)),{recursive:true});await writeFile(path.join(dir,asset),source);
 await mkdir(path.dirname(path.join(dir,page)),{recursive:true});await writeFile(path.join(dir,page),html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>1000000);
 const actual=await sharp(await readFile(path.join(dir,asset))).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,1488);assert.equal(actual.height,2048);assert.equal(actual.orientation??1,original.orientation??1);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 assert.equal(await readFile(path.join(dir,page),'utf8'),html.replace('public domain.','public domain. Full frame, resized and compressed for web delivery.').replace('property="og:image:width" content="2907"','property="og:image:width" content="1488"').replace('property="og:image:height" content="4000"','property="og:image:height" content="2048"'));
 assert.ok(original.exif===undefined);assert.ok(actual.exif); // Added technical EXIF is not represented as preserved original metadata.
 assert.ok((await readFile(sourceURL)).equals(source));
 }finally{await rm(dir,{recursive:true,force:true});}
});


test('Radha delivery preserves the source and complete museum credit with guarded caption and share geometry',async(t)=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-radha-jpeg-'));
 try{
 const asset='assets/champu-and-sakhi/radha-confidante-met.jpg',page='literature/champu-and-sakhi/index.html';
 const sourceURL=new URL('../public/'+asset,import.meta.url),source=await readFile(sourceURL);
 const credit='<a href="https://www.metmuseum.org/art/collection/search/662782">The Metropolitan Museum of Art, Gift of Steven Kossak, The Kronos Collections, 2020, 2020.383</a>; public domain.';
 const html='<meta property="og:image" content="https://projectodisha.org/'+asset+'"><meta property="og:image:width" content="3923"><meta property="og:image:height" content="2569"><figure><img src="/'+asset+'" width="3923" height="2569"><figcaption>'+credit+'</figcaption></figure><p>This Gita Govinda painting is not an illustration of Kishorachandrananda Champu.</p>';
 const assetPath=path.join(dir,asset),pagePath=path.join(dir,page);
 await mkdir(path.dirname(assetPath),{recursive:true});await writeFile(assetPath,source);
 await mkdir(path.dirname(pagePath),{recursive:true});await writeFile(pagePath,html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>1000000);
 assert.deepEqual(result.files[0].settings,{maximum_dimension:2048,quality:95,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true});
 const actual=await sharp(await readFile(assetPath)).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,2048);assert.equal(actual.height,1341);
 assert.ok(Math.abs(actual.height-actual.width*original.height/original.width)<=1);
 assert.equal(original.orientation,undefined);assert.equal(actual.orientation,1);assert.equal(actual.orientation??1,original.orientation??1);
 for(const field of ['icc','iptc','xmp']){assert.equal(original[field],undefined);assert.equal(actual[field],undefined);}
 assert.equal(original.exif,undefined);assert.ok(actual.exif); // Technical EXIF added; no claim of raw metadata equality.
 assert.equal(await readFile(pagePath,'utf8'),html.replace('public domain.','public domain. Full frame, resized and compressed for web delivery.').replace('property="og:image:width" content="3923"','property="og:image:width" content="2048"').replace('property="og:image:height" content="2569"','property="og:image:height" content="1341"'));
 assert.ok((await readFile(sourceURL)).equals(source));
 t.diagnostic('Radha capacity measurement: '+JSON.stringify(result.files[0]));
 for(const [invalidHTML,message] of [
  [html.replace('/search/662782','/search/other'),/Expected unique photo credit/],
  [html+'<p>public domain.</p>',/Expected unique photo credit/],
  [html.replace('content="https://projectodisha.org/'+asset+'"','content="https://projectodisha.org/unrelated.jpg"'),/Expected matching share image/],
  [html.replace('property="og:image:width" content="3923"','property="og:image:width" content="1"'),/Expected unique share image width/]
 ]){
  await writeFile(assetPath,source);await writeFile(pagePath,invalidHTML);
  await assert.rejects(optimizePublicationJPEGs(pathToFileURL(dir+'/')),message);
  assert.ok((await readFile(assetPath)).equals(source));assert.equal(await readFile(pagePath,'utf8'),invalidHTML);
 }
 assert.ok((await readFile(sourceURL)).equals(source));
 }finally{await rm(dir,{recursive:true,force:true});}
});
