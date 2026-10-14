import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {matchesDiscovery,discoveryQuery} from '../src/lib/discovery.mjs';
import {collectBookImages,validBookImage,BOOK_IMAGE_LIMITS} from '../src/lib/book-images.mjs';
import {buildTourBook} from '../src/lib/tour-book.mjs';
import {publicIssueLink,PUBLIC_ISSUE_URL,correctionDraft} from '../src/lib/correction.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const html=p=>readFileSync('dist'+p+'index.html','utf8');
const data='data:image/jpeg;base64,YWJjZA==';
const photo={src:'/images/test.jpg',width:10,height:10,alt:'Test & photo',caption:'A sample photograph',creator:'Example photographer',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',source:'https://example.org/image',changes:'Resized for review.'};
const entry={id:'place:a',title:'A place',href:'/visit/places/chandipur/',summary:'Summary',kind:'Place',area:'Balasore',checked:'2026-09-30',sources:[],photo};
const plan={version:1,title:'Review',items:[{id:entry.id,day:1,notes:'END OF NOTES'}]};
test('discovery combines topic, area and multiple search terms without partial category matches',()=>{
 const e={label:'Mudhi Mansa',dek:'A Baripada meal',category:'Food',regions:['Mayurbhanj']};
 assert.equal(matchesDiscovery(e,{topic:'Food',region:'Mayurbhanj',q:'MUDHI baripada'}),true);
 for(const f of [{topic:'Places'},{region:'Chilika'},{q:'mudhi dolphin'}])assert.equal(matchesDiscovery(e,f),false);
 const q=discoveryQuery({q:' A & B ',topic:'Stay areas',region:'Konark & Puri'});assert.equal(new URLSearchParams(q).get('q'),'A & B');assert.equal(discoveryQuery({}), '');
});
test('illustrated book embeds safe image data, preserves text and credits a repeated photo once',async()=>{
 const result=await collectBookImages({...plan,items:[...plan.items,{id:'place:b',day:2,notes:''}]},[entry,{...entry,id:'place:b'}],async()=>({data,bytes:4}));
 assert.equal(Object.keys(result.images).length,1);
 const out=buildTourBook({...plan,items:[...plan.items,{id:'place:b',day:2,notes:''}]},[entry,{...entry,id:'place:b'}],{images:result.images,illustrated:true});
 assert.equal((out.match(/<img /g)||[]).length,1);for(const text of ['Example photographer','Photograph credits','END OF NOTES','CC BY-SA 4.0','img-src data:'])assert.ok(out.includes(text));
 assert.ok(!/<img[^>]+src="https?:/.test(out));assert.ok(!/<script|<iframe/i.test(out));
});
test('image collection rejects remote paths, over-size data, unavailable files and counts omissions',async()=>{
 const rows=[entry,{...entry,id:'place:b',photo:{...photo,src:'https://evil.invalid/a.jpg'}},{...entry,id:'place:c',photo:{...photo,src:'/images/large.jpg'}},{...entry,id:'place:d',photo:{...photo,src:'/images/fail.jpg'}}];
 const calls=[];const result=await collectBookImages({items:rows.map(e=>({id:e.id}))},rows,async path=>{calls.push(path);if(path.includes('fail'))throw Error('offline');return {data,bytes:path.includes('large')?BOOK_IMAGE_LIMITS.perImage+1:4};});
 assert.deepEqual(Object.keys(result.images),['/images/test.jpg']);assert.equal(result.skipped.length,3);assert.ok(!calls.some(p=>p.startsWith('https:')));
 assert.equal(validBookImage('data:image/svg+xml;base64,YWJjZA=='),false);assert.equal(validBookImage('data:image/jpeg;base64,abc" onerror="x'),false);
 const out=buildTourBook(plan,[entry],{images:{[photo.src]:'<img onerror=x>'},illustrated:true,omittedImages:1});assert.ok(!/<img /.test(out));assert.ok(out.includes('END OF NOTES'));
});
test('photo count and total byte budget are bounded without dropping plan entries',async()=>{
 const rows=Array.from({length:20},(_,i)=>({...entry,id:'place:'+i,photo:{...photo,src:`/images/photo-${i}.jpg`}}));
 let result=await collectBookImages({items:rows.map(e=>({id:e.id}))},rows,async()=>({data,bytes:4}));assert.equal(Object.keys(result.images).length,12);assert.equal(result.skipped.length,8);
 result=await collectBookImages({items:rows.map(e=>({id:e.id}))},rows,async()=>({data:'data:image/jpeg;base64,'+Buffer.alloc(BOOK_IMAGE_LIMITS.perImage).toString('base64'),bytes:BOOK_IMAGE_LIMITS.perImage}));assert.equal(Object.keys(result.images).length,4);assert.equal(result.bytes,BOOK_IMAGE_LIMITS.total);
});
test('public issue links encode drafts, require a known page, and keep long Unicode drafts intact',()=>{
 const entries=[{title:'Chhena Poda',href:'/food/chhena-poda/'}],value={page:entries[0].href,kind:'Correction',correction:'Test & <markup> #here',evidence:'Synthetic QA source',credit:'Test reader'};
 const result=publicIssueLink(value,entries),url=new URL(result.url);assert.equal(url.origin,'https://github.com');assert.equal(url.pathname,'/ahimanikya/project-odisha/issues/new');assert.ok(url.searchParams.get('body').includes(value.correction));assert.ok(url.searchParams.get('body').includes('Posting this issue does not imply'));assert.ok(!url.searchParams.get('body').includes('Not submitted'));assert.ok(correctionDraft(value,entries).includes('Not submitted'));assert.ok(result.prefilled);assert.equal(url.searchParams.has('labels'),false);
 const large={...value,correction:'ଓ'.repeat(3000)};assert.deepEqual(publicIssueLink(large,entries),{url:PUBLIC_ISSUE_URL,prefilled:false});assert.ok(correctionDraft(large,entries).includes(large.correction));
 assert.throws(()=>publicIssueLink({...value,page:'https://evil.invalid'},entries));assert.throws(()=>correctionDraft({...value,evidence:''},entries),e=>e.field==='evidence');
});
test('new food claims, image provenance and stable save identities appear in built pages',()=>{
 const f=json('../../kb/research/food/collection.json');
 for(const page of f.pages){const out=html('/food/'+page.slug+'/');assert.ok(out.includes(`data-save-journey="${page.save_id}"`));const asset=f.assets[page.hero];assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);for(const s of page.sections)for(const p of s.paragraphs)if(p.kind==='sourced_summary')for(const id of p.source_ids){assert.ok(f.sources[id]);assert.ok(out.includes(f.sources[id].url));}assert.ok(out.includes(asset.creator)&&out.includes(asset.license_url));}
 assert.ok(html('/food/mudhi-mansa/').includes('chicken'));assert.ok(html('/food/chhena-poda/').includes('article’s account'));
});
test('related-discovery links resolve and the new profiles retain uncertainty and translation credit',()=>{
 const links=json('../../kb/research/related-discoveries.json').links;
 for(const l of links){assert.ok(html(l.from).includes(l.to),l.from+' -> '+l.to);assert.equal(l.kind,'editorial_reading_suggestion');}
 assert.ok(html('/people/bhima-bhoi/').includes('uncertainty'));assert.ok(html('/people/gopinath-mohanty/').includes('Bikram Das'));
});
test('public contribution copy distinguishes GitHub visibility from encyclopedia publication',()=>{
 const out=html('/contribute/').replaceAll('&amp;','&');for(const text of ['public immediately on GitHub','Founder & Editor-in-Chief','Prepare public GitHub issue','does not publish an encyclopedia entry'])assert.ok(out.includes(text),text);
 assert.ok(!/<form\b/.test(out));for(const path of ['knowledge.yml','photo.yml']){const template=readFileSync('../../.github/ISSUE_TEMPLATE/'+path,'utf8');assert.ok(template.includes('public on GitHub'));assert.ok(template.includes('required: true'));}
});

// The proposal links must work before issue templates reach the default branch.
test('new-subject and photo handoffs retain public context without a pre-existing entry',()=>{
 const out=html('/contribute/').replaceAll('&amp;','&');
 const urls=[...out.matchAll(/href="(https:\/\/github\.com\/ahimanikya\/project-odisha\/issues\/new\?[^" ]+)"/g)].map(m=>new URL(m[1]));
 assert.equal(urls.length,3);
 assert.ok(urls.some(u=>u.searchParams.get('title').startsWith('[Language]')));
 assert.ok(urls.some(u=>u.searchParams.get('title').startsWith('[Knowledge]')));
 assert.ok(urls.some(u=>u.searchParams.get('title').startsWith('[Photo]')));
 for(const url of urls){assert.ok(url.searchParams.get('body').includes('public'));assert.ok(!url.searchParams.has('assignees'));}
});

test('flagship destination photos are available within offline image limits',()=>{
 const out=html('/journey/');
 for(const path of ['/images/chilika/chilika-lake-hellohappy.jpg','/images/tour-book/konark-wheel.jpg']){
  assert.ok(readFileSync('public'+path).length<=BOOK_IMAGE_LIMITS.perImage);
 }
 const image=json('../../kb/research/destinations/book-images.json').assets['konark-wheel'];
 assert.equal(createHash('sha256').update(readFileSync('public'+image.src)).digest('hex'),image.sha256);
 assert.ok(image.changes.includes('Resized'));
 assert.ok(readFileSync('src/data/book-photos.ts','utf8').includes("'place:chilika'"));
 assert.ok(readFileSync('src/data/book-photos.ts','utf8').includes("'place:konark'"));
});
