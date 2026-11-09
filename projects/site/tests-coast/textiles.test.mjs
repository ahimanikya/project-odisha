import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {emptyLibrary,addItem} from '../src/lib/journey.mjs';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const data=JSON.parse(readFileSync('../../kb/research/culture/textile-stories.json'));
const read=p=>readFileSync('dist-coast'+p+'index.html','utf8');
const journey=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const escape=s=>s.replaceAll('&','&amp;');
test('textile stories retain identified media, licences and claim sources',()=>{
 for(const p of data.pages){
  const html=read(p.href);assert.ok(read('/textiles/').includes('href="'+p.href+'"'));assert.ok(read('/explore/').includes('href="'+p.href+'"'));
  assert.ok(html.includes('noindex, nofollow'));assert.ok(html.includes(p.odia));
  for(const id of new Set([p.hero,...p.sections.filter(s=>s.photo).map(s=>s.photo)])){
   const a=data.assets[id];for(const v of [a.alt,a.creator,a.license_url,a.caption])assert.ok(html.includes(escape(v)),p.href+': '+v);
   assert.equal(createHash('sha256').update(readFileSync('dist-coast'+a.src)).digest('hex'),a.sha256);
  }
  for(const s of p.sections)for(const q of s.paragraphs){assert.ok(q.kind==='editorial_invitation'||q.source_ids.length>0);for(const id of q.source_ids)assert.ok(html.includes(escape(data.sources[id].url)));}
 }
 assert.match(read('/textiles/khandua/'),/The passage has not been transcribed here/);
 assert.match(read('/knowledge/kotpad/'),/not a workshop photograph/);
 assert.match(read('/knowledge/kotpad/'),/licence does not extend to the film/);
 assert.match(read('/textiles/sambalpuri-bandha/'),/synthetic dyes/);
});
test('textile starter preserves existing plans and carries sources, care and media into the tour book',()=>{
 const old=emptyLibrary();old.trips[0].plan=addItem(old.trips[0].plan,'place:chilika');old.trips[0].plan.items[0].notes='Keep my lake day';const before=structuredClone(old);
 const starter=journey.starters.find(s=>s.id==='woven-in-odisha');assert.ok(starter);
 const next=createStarterTrip(old,'textile-review',starter,journey.catalog.map(i=>i.id));assert.deepEqual(old,before);assert.deepEqual(next.trips[0],before.trips[0]);
 const plan=next.trips[1].plan;assert.equal(plan.items.length,5);assert.ok(plan.items.every(i=>!i.day));plan.items[0].notes='Ask for care instructions and the weaver’s preferred credit.';
 const book=buildTourBook(plan,journey.catalog);
 for(const id of starter.items){const item=journey.catalog.find(i=>i.id===id);assert.ok(item.photo);if(id==='reading:textiles/sambalpuri-bandha'){assert.equal(item.practical.length,2);assert.deepEqual(item.practical.flatMap(p=>p.paragraphs),data.pages.find(p=>p.slug==='sambalpuri-bandha').sections.flatMap(s=>s.paragraphs.map(p=>p.text)));}else if(id==='reading:knowledge/kotpad'){assert.equal(item.practical.length,1);const ed=JSON.parse(readFileSync('../../kb/research/culture/kotpad-editorial.json'));assert.equal(ed.portable.paragraphs.length,2);assert.deepEqual(item.practical.flatMap(p=>p.paragraphs),ed.portable.paragraphs);}else if(item.id==='reading:textiles/tasar'){const entry=JSON.parse(readFileSync('../../kb/research/culture/textile-stories.json')).pages.find(p=>p.slug==='tasar');assert.equal(item.practical.length,1);assert.equal(item.practical[0].text,undefined);assert.deepEqual(item.practical.flatMap(p=>p.paragraphs),entry.sections.flatMap(s=>s.paragraphs.map(p=>p.text)));}else assert.ok(item.practical.length>=3);assert.ok(item.sources.length);assert.ok(book.includes(escape(item.title)));for(const s of item.sources)assert.ok(book.includes(escape(s.url)));}
 assert.ok(book.includes('Ask for care instructions'));const poster=data.assets['kotpad-film'];const illustrated=buildTourBook(plan,journey.catalog,{illustrated:true,images:{[poster.src]:'data:image/png;base64,YWJjZA=='}});assert.ok(illustrated.includes(escape(poster.caption)));assert.ok(illustrated.includes(poster.license_url));assert.ok(book.includes('washing or cleaning'));
});
test('Kotpad keeps one canonical story and discovery entry; deferred scope stays excluded',()=>{
 assert.equal([...read('/explore/').matchAll(/<article[^>]*data-entry=[\s\S]*?<\/article>/g)].filter(m=>m[0].includes('href="/knowledge/kotpad/"')).length,1);
 assert.equal(journey.catalog.filter(i=>i.href==='/knowledge/kotpad/').length,1);
 assert.ok(!existsSync('dist-coast/textiles/kotpad/index.html'));
 for(const p of ['/crafts/','/things-to-do/'])assert.ok(read(p).includes('href="/textiles/"'));
 assert.ok(read('/journey-starters/').includes('data-journey-starter="woven-in-odisha"'));
 for(const p of ['store','culture/pala'])assert.ok(!existsSync('dist-coast/'+p+'/index.html'));
 const held=JSON.parse(readFileSync('../site/editions/search-candidate.json')).pages;
 for(const p of ['/textiles/',...data.pages.map(p=>p.href)])assert.equal(held.find(x=>x.route===p).decision,'hold');
});
