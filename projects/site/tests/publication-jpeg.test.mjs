import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {deliveryJPEGs,optimizePublicationJPEGs} from '../tools/optimize-publication-jpeg.mjs';
test('JPEG delivery scope remains ten explicit images',()=>assert.deepEqual(deliveryJPEGs,['assets/sahi-jatra/performer.jpg','assets/sakhi-nata-and-sakhi-pila/mardala.jpg','images/stories/bhagabata-tungi-2016.jpg','assets/bhubaneswar-week/conversations.jpg','assets/bhubaneswar-week/mentis-films.jpg','assets/jhulana-in-odisha/hindola-raga.jpg','assets/ashta-nayika/abhisarika-met.jpg','assets/champu-and-sakhi/radha-confidante-met.jpg','images/destinations/taptapani-worship.jpg','assets/osakothi/simanchala-nahaka-2019.jpg']));
test('Mardala delivery preserves the source frame, credit metadata and originals while updating sharing geometry',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-jpeg-'));
 try{
 const sourceURL=new URL('../public/assets/sakhi-nata-and-sakhi-pila/mardala.jpg',import.meta.url),source=await readFile(sourceURL);
 await mkdir(path.join(dir,'assets/sakhi-nata-and-sakhi-pila'),{recursive:true});await writeFile(path.join(dir,'original.jpg'),source);await writeFile(path.join(dir,deliveryJPEGs[1]),source);await writeFile(path.join(dir,'assets/unrelated.jpg'),source);
 const page=path.join(dir,'stories/sakhi-nata-and-sakhi-pila/index.html');
 const html='<meta property="og:image" content="https://projectodisha.org/assets/sakhi-nata-and-sakhi-pila/mardala.jpg"><meta property="og:image:width" content="2716"><meta property="og:image:height" content="3024"><figure><img src="/assets/sakhi-nata-and-sakhi-pila/mardala.jpg" width="2716" height="3024"><figcaption><a href="https://commons.wikimedia.org/wiki/File:Mardala_used_in_Sakhi_Nata.jpg">Prateek Pattanaik</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>; reproduced without alteration. The image documents an instrument, not a particular troupe’s performance.</figcaption></figure>';
 await mkdir(path.dirname(page),{recursive:true});await writeFile(page,html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>0);
 assert.deepEqual(result.files[0].settings,{maximum_dimension:1728,quality:95,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true});
 const output=await readFile(path.join(dir,deliveryJPEGs[1])),actual=await sharp(output).metadata(),original=await sharp(source).metadata();
 assert.deepEqual([original.width,original.height,original.orientation],[2716,3024,1]);assert.deepEqual([actual.width,actual.height,actual.orientation],[1552,1728,1]);
 assert.ok(Math.abs(actual.height-actual.width*original.height/original.width)<=1);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);assert.equal(actual.density,original.density);
 // Technical EXIF dimensions change; exact original bytes remain available.
 const previous=await sharp(source).resize({width:3072,height:3072,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:95,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 assert.ok(previous.length-output.length>1100000);
 assert.equal(await readFile(page,'utf8'),html.replace('reproduced without alteration.','resized and compressed for web delivery without cropping.').replace('property="og:image:width" content="2716"','property="og:image:width" content="1552"').replace('property="og:image:height" content="3024"','property="og:image:height" content="1728"'));
 assert.ok((await readFile(path.join(dir,'original.jpg'))).equals(source));assert.ok((await readFile(path.join(dir,'assets/unrelated.jpg'))).equals(source));assert.ok((await readFile(sourceURL)).equals(source));assert.notEqual(result.files[0].source_sha256,result.files[0].output_sha256);
 for(const invalid of [html.replace('Mardala_used_in_Sakhi_Nata.jpg','Other.jpg'),html+'<p>reproduced without alteration.</p>',html.replace('property="og:image:width" content="2716"','property="og:image:width" content="1"'),html.replace('content="https://projectodisha.org/assets/sakhi-nata-and-sakhi-pila/mardala.jpg"','content="https://projectodisha.org/unrelated.jpg"')]){
  await writeFile(path.join(dir,deliveryJPEGs[1]),source);await writeFile(page,invalid);await assert.rejects(optimizePublicationJPEGs(pathToFileURL(dir+'/')));assert.ok((await readFile(path.join(dir,deliveryJPEGs[1]))).equals(source));assert.equal(await readFile(page,'utf8'),invalid);
 }
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('Sahi delivery keeps the reviewed portrait orientation, credits and originals while correcting only its displayed share dimensions',async(t)=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-sahi-jpeg-'));
 try{
 const asset='assets/sahi-jatra/performer.jpg',page='stories/sahi-jatra/index.html';
 const sourceURL=new URL('../public/'+asset,import.meta.url),source=await readFile(sourceURL);
 const credit='<a href="https://commons.wikimedia.org/wiki/File:Parsurama_in_Sahi_Jata.jpg">Prateek Pattanaik, 2018</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>; reproduced without alteration.';
 const html='<meta property="og:image" content="https://projectodisha.org/'+asset+'"><meta property="og:image:width" content="3264"><meta property="og:image:height" content="4928"><meta name="unrelated:width" content="3264"><figure><img src="/'+asset+'" width="3264" height="4928"><figcaption>'+credit+'</figcaption></figure><p>Unrelated article text.</p>';
 await mkdir(path.dirname(path.join(dir,asset)),{recursive:true});
 if(process.platform==='darwin')execFileSync('python3',[fileURLToPath(new URL('../tools/cow_copy.py',import.meta.url)),fileURLToPath(sourceURL),path.join(dir,asset)],{stdio:'pipe'});
 else await copyFile(sourceURL,path.join(dir,asset)); // Existing explicit non-macOS fixture policy; independent file.
 await mkdir(path.dirname(path.join(dir,page)),{recursive:true});await writeFile(path.join(dir,page),html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].path,asset);
 assert.deepEqual(result.files[0].settings,{maximum_dimension:2400,quality:88,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true});
 const output=await readFile(path.join(dir,asset)),actual=await sharp(output).metadata(),original=await sharp(source).metadata();
 assert.deepEqual([actual.width,actual.height,actual.orientation],[2400,1590,8]);
 assert.deepEqual([actual.autoOrient.width,actual.autoOrient.height],[1590,2400]);
 assert.equal(actual.density,original.density);for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 // EXIF MakerNote bytes are not promised unchanged; the exact original remains available.
 const current=await sharp(source).resize({width:3072,height:3072,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:95,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 assert.ok(current.length-output.length>850000);
 const previousDelivery=await sharp(source).resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:95,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 assert.ok(previousDelivery.length-output.length>700000);
 assert.deepEqual(actual.exif,(await sharp(previousDelivery).metadata()).exif);
 t.diagnostic('Sahi capacity measurement: '+JSON.stringify({...result.files[0],incremental_saved_bytes:previousDelivery.length-output.length}));
 assert.equal(await readFile(path.join(dir,page),'utf8'),html.replace('reproduced without alteration.','resized and compressed for web delivery without cropping.').replace('property="og:image:width" content="3264"','property="og:image:width" content="1590"').replace('property="og:image:height" content="4928"','property="og:image:height" content="2400"'));
 assert.ok((await readFile(sourceURL)).equals(source));
 const wrongOrientation=await sharp(source).withMetadata({orientation:1}).jpeg({quality:100}).toBuffer();
 for(const [name,input,invalidHTML,error] of [
  ['orientation',wrongOrientation,html,/Expected reviewed Sahi orientation8 geometry/],
  ['unrelated sharing image',source,html.replace('https://projectodisha.org/'+asset,'https://projectodisha.org/assets/unrelated.jpg'),/Expected matching share image/],
  ['raw instead of displayed width',source,html.replace('property="og:image:width" content="3264"','property="og:image:width" content="4928"'),/Expected unique share image width/],
  ['duplicate caption',source,html+'<p>reproduced without alteration.</p>',/Expected unique photo credit/]
 ]){
  await writeFile(path.join(dir,asset),input);await writeFile(path.join(dir,page),invalidHTML);
  await assert.rejects(optimizePublicationJPEGs(pathToFileURL(dir+'/')),error,name);
  assert.ok((await readFile(path.join(dir,asset))).equals(input),name+': image unchanged after rejected guard');
  assert.equal(await readFile(path.join(dir,page),'utf8'),invalidHTML,name+': HTML unchanged after rejected guard');
 }
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
 await mkdir(path.dirname(path.join(dir,asset)),{recursive:true});
 for(const [from,to] of [[sourceURL,path.join(dir,asset)],[otherURL,path.join(dir,otherAsset)]]){
  if(process.platform==='darwin')execFileSync('python3',[fileURLToPath(new URL('../tools/cow_copy.py',import.meta.url)),fileURLToPath(from),to],{stdio:'pipe'});
  else await copyFile(from,to); // Existing explicit non-macOS fixture policy; independent files.
 }
 await mkdir(path.dirname(path.join(dir,page)),{recursive:true});await writeFile(path.join(dir,page),html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,2);assert.equal(result.files[0].path,asset);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>2000000);
 assert.equal(result.settings.maximum_dimension,3072);assert.equal(result.settings.quality,95);assert.equal(result.settings.chromaSubsampling,'4:4:4');
 const output=await readFile(path.join(dir,asset)),actual=await sharp(output).metadata(),original=await sharp(source).metadata();
 assert.equal(actual.width,1728);assert.equal(actual.height,3072);assert.equal(actual.width*original.height,actual.height*original.width);
 assert.equal(actual.orientation,original.orientation);assert.equal(actual.density,original.density);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(actual[field],original[field]);
 assert.ok(actual.exif);assert.notEqual(result.files[0].source_sha256,result.files[0].output_sha256);
 assert.deepEqual(result.files[0].settings,{maximum_dimension:3072,quality:90,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true});
 const previous=await sharp(source).resize({width:3072,height:3072,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:95,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 assert.ok(previous.length-output.length>500000);
 assert.deepEqual(actual.exif,(await sharp(previous).metadata()).exif);
 assert.equal(await readFile(path.join(dir,page),'utf8'),html.replace(caption,caption+' Full frame, resized and compressed for web delivery.').replace(otherCaption,otherCaption+' Full frame, resized and compressed for web delivery.'));
 const second=result.files.find(file=>file.path===otherAsset);assert.equal(second.status,'resized-and-compressed');assert.ok(second.saved_bytes>2400000);
 const secondOutput=await readFile(path.join(dir,otherAsset)),secondMeta=await sharp(secondOutput).metadata(),secondOriginal=await sharp(otherSource).metadata();
 assert.deepEqual(second.settings,{maximum_dimension:3072,quality:86,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true});
 const previousSecond=await sharp(otherSource).resize({width:3072,height:3072,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:95,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 assert.ok(previousSecond.length-secondOutput.length>600000);
 assert.deepEqual(secondMeta.exif,(await sharp(previousSecond).metadata()).exif);
 const unchangedFirst=await sharp(source).resize({width:3072,height:3072,fit:'inside',withoutEnlargement:true}).keepMetadata().jpeg({quality:90,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 assert.ok(output.equals(unchangedFirst));
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

test('Taptapani delivery preserves source and licence while bounding full-frame geometry and caption changes',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-taptapani-jpeg-'));
 try{
  const asset='images/destinations/taptapani-worship.jpg',page='destinations/taptapani/index.html';
  const sourceURL=new URL('../public/'+asset,import.meta.url),source=await readFile(sourceURL);
  const credit='<a href="https://commons.wikimedia.org/wiki/File:Brahmana_performing_puja_Taptapani_Orissa.JPG">Ilya Mauter</a>, <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.';
  const phrase='Original photograph; full frame in the article. Responsive copies are resized; previews may be cropped.';
  const replacement='Full-frame photograph, resized and compressed for web delivery. Responsive copies are resized; previews may be cropped.';
  const html='<meta property="og:image" content="https://projectodisha.org/'+asset+'"><meta property="og:image:width" content="2304"><meta property="og:image:height" content="1728"><figure><img src="/'+asset+'" width="2304" height="1728"><figcaption>'+credit+' '+phrase+'</figcaption></figure>';
  const assetPath=path.join(dir,asset),pagePath=path.join(dir,page);
  await mkdir(path.dirname(assetPath),{recursive:true});await mkdir(path.dirname(pagePath),{recursive:true});
  await writeFile(assetPath,source);await writeFile(pagePath,html);
  const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
  assert.equal(result.files.length,1);assert.equal(result.files[0].status,'resized-and-compressed');assert.ok(result.saved_bytes>600000);
  const before=await sharp(source).metadata(),after=await sharp(await readFile(assetPath)).metadata();
  assert.deepEqual([after.width,after.height],[1600,1200]);assert.equal(after.orientation??1,before.orientation??1);
  for(const key of ['icc','iptc','xmp'])assert.deepEqual(after[key],before[key]);
  assert.equal(after.density,before.density);
  assert.equal(await readFile(pagePath,'utf8'),html.replace(phrase,replacement).replace('property="og:image:width" content="2304"','property="og:image:width" content="1600"').replace('property="og:image:height" content="1728"','property="og:image:height" content="1200"'));
  for(const invalid of [html.replace('Orissa.JPG','Other.JPG'),html+'<p>'+phrase+'</p>',html.replace('property="og:image:width" content="2304"','property="og:image:width" content="1"')]){
   await writeFile(assetPath,source);await writeFile(pagePath,invalid);await assert.rejects(optimizePublicationJPEGs(pathToFileURL(dir+'/')));assert.ok((await readFile(assetPath)).equals(source));assert.equal(await readFile(pagePath,'utf8'),invalid);
  }
  assert.ok((await readFile(sourceURL)).equals(source));
 }finally{await rm(dir,{recursive:true,force:true});}
});


test('Osakothi delivery compresses only the reviewed JPEG with unchanged geometry and complete credit guards',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'publication-osakothi-jpeg-'));
 try{
 const asset='assets/osakothi/simanchala-nahaka-2019.jpg',page='stories/when-the-goddess-comes-to-the-wall/index.html';
 const sourceURL=new URL('../public/'+asset,import.meta.url),source=await readFile(sourceURL);
 const originalPhrase='Responsive versions resized and re-encoded without cropping; original photograph retained.';
 const deliveryPhrase='Full-frame photograph compressed for web delivery; responsive versions resized and re-encoded without cropping.';
 const credit='<a href="https://commons.wikimedia.org/wiki/File:Guru_Simanchala_Nahaka_performs_Dhanakoila_or_Osakothi_(Gahana).jpg">Guru Simanchala Nahaka performs Dhanakoila or Osakothi</a>. Photograph by Prateek Pattanaik, 5 August 2019. CC BY-SA 4.0. '+originalPhrase+' <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.';
 const html='<meta property="og:image" content="https://projectodisha.org/'+asset+'"><meta property="og:image:width" content="2046"><meta property="og:image:height" content="2838"><figure><img src="/'+asset+'" width="2046" height="2838"></figure><p>'+credit+'</p><p>Unrelated article text.</p>';
 const destination=path.join(dir,asset),pagePath=path.join(dir,page);
 await mkdir(path.dirname(destination),{recursive:true});await mkdir(path.dirname(pagePath),{recursive:true});
 const resetSource=async()=>{
  await rm(destination,{force:true});
  if(process.platform==='darwin')execFileSync('python3',[fileURLToPath(new URL('../tools/cow_copy.py',import.meta.url)),fileURLToPath(sourceURL),destination],{stdio:'pipe'});
  // Hosted non-macOS tests use the same explicit independent-copy policy as publication staging.
  else await copyFile(sourceURL,destination);
 };
 await resetSource();await writeFile(pagePath,html);
 const result=await optimizePublicationJPEGs(pathToFileURL(dir+'/'));
 assert.equal(result.files.length,1);assert.equal(result.files[0].path,asset);assert.equal(result.files[0].status,'compressed');assert.ok(result.saved_bytes>250000);
 assert.deepEqual(result.files[0].settings,{maximum_dimension:3072,quality:88,chromaSubsampling:'4:4:4',mozjpeg:true,preserve_metadata:true});
 const output=await readFile(destination),before=await sharp(source).metadata(),after=await sharp(output).metadata();
 assert.deepEqual([before.width,before.height],[2046,2838]);assert.deepEqual([after.width,after.height],[2046,2838]);assert.equal(after.orientation??1,before.orientation??1);
 for(const field of ['icc','iptc','xmp'])assert.deepEqual(after[field],before[field]);
 assert.equal(before.iptc.length,100);assert.equal(before.xmp.length,2992);assert.equal(before.icc,undefined);
 // EXIF bytes may be rewritten by Sharp; no raw EXIF equality is claimed.
 assert.equal(await readFile(pagePath,'utf8'),html.replace(originalPhrase,deliveryPhrase));assert.ok((await readFile(sourceURL)).equals(source));
 for(const [name,invalid] of [
  ['missing creator',html.replace('Prateek Pattanaik','Other Person')],
  ['missing licence URL',html.replace('https://creativecommons.org/licenses/by-sa/4.0/','https://example.invalid/')],
  ['missing source',html.replace('Guru_Simanchala_Nahaka_performs_Dhanakoila_or_Osakothi_(Gahana).jpg','Other.jpg')],
  ['duplicate alteration',html+'<p>'+originalPhrase+'</p>'],
  ['wrong share image',html.replace('content="https://projectodisha.org/'+asset+'"','content="https://projectodisha.org/unrelated.jpg"')],
  ['wrong share width',html.replace('property="og:image:width" content="2046"','property="og:image:width" content="1"')]
 ]){
  await resetSource();await writeFile(pagePath,invalid);
  await assert.rejects(optimizePublicationJPEGs(pathToFileURL(dir+'/')),undefined,name);
  assert.ok((await readFile(destination)).equals(source),name+': source preserved after guard failure');assert.equal(await readFile(pagePath,'utf8'),invalid);
 }
 assert.ok((await readFile(sourceURL)).equals(source));
 }finally{await rm(dir,{recursive:true,force:true});}
});
