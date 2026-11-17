import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {collectBookImages,BOOK_IMAGE_LIMITS} from '../src/lib/book-images.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const data=JSON.parse(readFileSync('../../kb/research/culture/textile-stories.json'));
const editorial=JSON.parse(readFileSync('../../kb/research/culture/sambalpuri-bandha-editorial.json'));
const entry=data.pages.find(p=>p.slug==='sambalpuri-bandha');
const item={id:entry.save_id,title:entry.title,kind:'Reading',area:entry.area,summary:'',author:editorial.author,href:'/textiles/sambalpuri-bandha/',checked:entry.checked_on,practical:entry.sections.map(s=>({heading:s.title,paragraphs:s.paragraphs.map(p=>p.text)})),sources:editorial.portable.sources,photo:data.assets[entry.hero],additionalPhotos:[data.assets['bandha-loom']]};
const plan={version:1,title:'Bandha review',items:[{id:item.id,day:1,notes:''}]};
const pixel='data:image/png;base64,YWJjZA==';
test('Bandha optional second photograph loads once with unchanged image limits and provenance',async()=>{
 const calls=[];const result=await collectBookImages(plan,[{...item,additionalPhotos:[item.photo,...item.additionalPhotos]}],async path=>{calls.push(path);return {data:pixel,bytes:4};});
 assert.deepEqual(calls,[item.photo.src,item.additionalPhotos[0].src]);assert.equal(result.bytes,8);assert.equal(result.skipped.length,0);
 const html=buildTourBook(plan,[item],{images:result.images,illustrated:true,generatedAt:'2026-11-08'});
 assert.equal((html.match(/<img /g)||[]).length,2);
 for(const photo of [item.photo,...item.additionalPhotos])for(const key of ['caption','creator','license','license_url','source','changes'])assert.ok(html.includes(escapeHTML(photo[key])),key);
 assert.equal(BOOK_IMAGE_LIMITS.count,12);assert.equal(BOOK_IMAGE_LIMITS.total,8*1024*1024);
});
test('Bandha portable narrative retains exact two paragraphs without empty headings or full note duplication',()=>{
 const html=buildTourBook(plan,[item],{generatedAt:'2026-11-08'}),txt=buildTextItinerary(plan,[item]);
 for(const paragraph of editorial.paragraphs){assert.ok(html.includes('<p>'+escapeHTML(paragraph.text)+'</p>'));assert.ok(txt.includes(paragraph.text));}
 assert.ok(!html.includes('<h4></h4>'));assert.ok(!txt.includes('\n: '));assert.ok(!html.includes(escapeHTML(editorial.notes[0].text)));assert.ok(!txt.includes(editorial.notes[0].text));
 assert.equal(item.sources.length,1);assert.deepEqual(item.sources,editorial.portable.sources);assert.ok(html.includes('By Ahimanikya Satapathy'));
});
test('optional catalogue photos retain safety refusals and do not broaden imported plan URLs',async()=>{
 const unsafe={...item,additionalPhotos:[{...item.photo,src:'https://invalid.example/remote.png'},{...item.photo,src:'/images/large.png'}]};const called=[];
 const result=await collectBookImages(plan,[unsafe],async path=>{called.push(path);return {data:pixel,bytes:path.includes('large')?BOOK_IMAGE_LIMITS.perImage+1:4};});
 assert.ok(!called.includes('https://invalid.example/remote.png'));assert.equal(result.skipped.length,2);assert.equal(Object.keys(result.images).length,1);
 const controller=new AbortController();controller.abort();await assert.rejects(()=>collectBookImages(plan,[item],async()=>({data:pixel,bytes:4}),{signal:controller.signal}),{name:'AbortError'});
});
