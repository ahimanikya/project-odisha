import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {emptyLibrary,addItem,parseBackup,removeWithUndo} from '../src/lib/journey.mjs';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {selectedStoryTrail,storyTrailPhotos} from '../src/lib/story-trails.mjs';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
import {selectBookPlan} from '../src/lib/journey-ready.mjs';
import {collectBookImages} from '../src/lib/book-images.mjs';
const page=readFileSync('dist/journey-starters/cuttack/index.html','utf8');
const data=JSON.parse(page.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const starter=data.starters.find(s=>s.id==='cuttack-silver-stories');
const trail=data.trails.find(t=>t.starter_id===starter.id);
const create=()=>createStarterTrip(emptyLibrary(),'cuttack',starter,data.catalog.map(i=>i.id)).trips[1].plan;
test('Cuttack preserves six starter choices and existing journeys; only new plans opt into the story',()=>{
 assert.deepEqual(starter.items,['place:cuttack','place:barabati','experience:cuttack-filigree','food:cuttack-dahibara','experience:cuttack-netaji','stay:cuttack']);
 const library=emptyLibrary();library.trips[0].plan=addItem(library.trips[0].plan,'place:cuttack');library.trips[0].plan.items[0].notes='MY_EXISTING_NOTE';
 const before=structuredClone(library),next=createStarterTrip(library,'cuttack',starter,data.catalog.map(i=>i.id));
 assert.deepEqual(library,before);assert.deepEqual(next.trips[0],before.trips[0]);assert.deepEqual(parseBackup(JSON.stringify(next)),next);
 assert.ok(next.trips[1].plan.items.every(i=>i.day===0));assert.equal(selectedStoryTrail(library.trips[0].plan,data.trails),null);
 assert.deepEqual(selectedStoryTrail(create(),data.trails).chapters.map(c=>c.id),['gateway','silver','childhood','table']);
});
test('Cuttack offline books embed four credited photographs and exclude private notes',async()=>{
 const plan=create();plan.items=plan.items.map(i=>({...i,notes:'PRIVATE_TEST_NOTE'}));
 const collected=await collectBookImages(plan,data.catalog,async()=>({data:'data:image/png;base64,AAAA',bytes:3}),{additionalPhotos:storyTrailPhotos(plan,data.trails)});
 assert.equal(Object.keys(collected.images).length,4);
 const options={trails:data.trails,illustrated:true,images:collected.images,includePersonalNotes:false};
 const book=buildTourBook(plan,data.catalog,options),text=buildTextItinerary(plan,data.catalog,options);
 assert.equal((book.match(/<img /g)||[]).length,4);
 for(const chapter of trail.chapters){for(const output of [book,text]){assert.ok(output.includes(chapter.title));assert.ok(output.includes(chapter.prompt));assert.ok(!output.includes('PRIVATE_TEST_NOTE'));}assert.ok(book.includes(chapter.photo.creator));assert.ok(book.includes(chapter.photo.license_url));}
 assert.ok(book.includes('source descriptions differ on its metal'));
});
test('day and edited books keep only matching Cuttack chapters; a stay guide is not a photographed hotel',()=>{
 let plan=create();plan.items=plan.items.map(i=>({...i,day:i.id==='experience:cuttack-netaji'?2:1}));
 const museum=selectBookPlan(plan,2);assert.deepEqual(selectedStoryTrail(museum,data.trails).chapters.map(c=>c.id),['childhood']);
 const book=buildTourBook(museum,data.catalog,{trails:data.trails});assert.ok(book.includes(trail.chapters[2].title));assert.ok(!book.includes(trail.chapters[1].title));
 plan=removeWithUndo(plan,'experience:cuttack-filigree').plan;assert.ok(!selectedStoryTrail(plan,data.trails).chapters.some(c=>c.id==='silver'));
 const base={...plan,items:plan.items.filter(i=>i.id==='stay:cuttack')};assert.equal(selectedStoryTrail(base,data.trails),null);assert.deepEqual(storyTrailPhotos(base,data.trails),[]);
});
test('Cuttack page has one heading and starter, resolved photos, reciprocal guides and contextual contributions',()=>{
 assert.equal((page.match(/<h1\b/g)||[]).length,1);const ids=[...page.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 assert.equal((page.match(/data-journey-starter="cuttack-silver-stories"/g)||[]).length,1);assert.ok(page.includes('Save these 6 ideas together'));
 for(const chapter of trail.chapters){assert.ok(existsSync('dist'+chapter.photo.src));assert.ok(page.includes(chapter.photo.creator));for(const id of chapter.ideas){const entry=data.catalog.find(i=>i.id===id);assert.ok(page.includes('href="'+entry.href+'"'));assert.ok(readFileSync('dist'+entry.href.split('#')[0]+'index.html','utf8').includes('href="/journey-starters/cuttack/"'));}}
 assert.ok(page.includes('href="/visit/stays/cuttack/"'));
 for(const kind of ['maker','access','food'])assert.ok(page.includes('local='+kind+'&amp;page=%2Fjourney-starters%2Fcuttack%2F'));
 assert.ok(readFileSync('dist/contribute/index.html','utf8').includes('value="/journey-starters/cuttack/"'));
 assert.ok(page.includes('No fixed transfer times'));assert.match(page,/<section\b[^>]*class="trail-credits"[^>]*aria-labelledby="trail-credits-title"/);assert.match(page,/<h2\b[^>]*id="trail-credits-title"[^>]*>Photographs &(?:amp;)? source notes<\/h2>/);assert.doesNotMatch(page,/<details\b[^>]*class="trail-credits"/);
});
