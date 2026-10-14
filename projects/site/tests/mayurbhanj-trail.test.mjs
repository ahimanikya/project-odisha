import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {emptyLibrary,addItem,parseBackup,removeWithUndo} from '../src/lib/journey.mjs';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {selectedStoryTrail,storyTrailPhotos} from '../src/lib/story-trails.mjs';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
import {selectBookPlan} from '../src/lib/journey-ready.mjs';
import {collectBookImages} from '../src/lib/book-images.mjs';
import {localContributionPrompts,localContributionURL} from '../src/lib/local-contribution.mjs';
const page=readFileSync('dist/journey-starters/mayurbhanj/index.html','utf8');
const data=JSON.parse(page.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const starter=data.starters.find(s=>s.id==='mayurbhanj-forest-culture');
const trail=data.trails.find(t=>t.starter_id===starter.id);
const create=()=>createStarterTrip(emptyLibrary(),'mayurbhanj',starter,data.catalog.map(i=>i.id)).trips[1].plan;
test('Mayurbhanj retains five starter choices and preserves old journeys without adding chapters to them',()=>{
 assert.deepEqual(starter.items,['place:mayurbhanj','place:similipal','experience:mayurbhanj-chhau','food:baripada-mudhi-mansa','stay:similipal-camps']);
 const library=emptyLibrary();library.trips[0].plan=addItem(library.trips[0].plan,'place:similipal');library.trips[0].plan.items[0].notes='EARLIER_NOTE';
 const before=structuredClone(library),next=createStarterTrip(library,'mayurbhanj',starter,data.catalog.map(i=>i.id));
 assert.deepEqual(library,before);assert.deepEqual(next.trips[0],before.trips[0]);assert.deepEqual(parseBackup(JSON.stringify(next)),next);
 assert.ok(next.trips[1].plan.items.every(i=>i.day===0));assert.equal(selectedStoryTrail(library.trips[0].plan,data.trails),null);
 assert.deepEqual(selectedStoryTrail(create(),data.trails).chapters.map(c=>c.id),['forest','rhythm','meal']);
});
test('Mayurbhanj book deduplicates photographs, preserves the food variation and omits private notes',async()=>{
 const plan=create();plan.items=plan.items.map(i=>({...i,notes:'PRIVATE_TEST_NOTE'}));
 const result=await collectBookImages(plan,data.catalog,async()=>({data:'data:image/png;base64,AAAA',bytes:3}),{additionalPhotos:storyTrailPhotos(plan,data.trails)});
 assert.equal(Object.keys(result.images).length,3);assert.equal(result.skipped.length,0);
 const options={trails:data.trails,illustrated:true,images:result.images,includePersonalNotes:false};
 const book=buildTourBook(plan,data.catalog,options),text=buildTextItinerary(plan,data.catalog,options);
 assert.equal((book.match(/<img /g)||[]).length,3);
 for(const chapter of trail.chapters){for(const output of [book,text]){assert.ok(output.includes(chapter.title));assert.ok(output.includes(chapter.prompt));assert.ok(!output.includes('PRIVATE_TEST_NOTE'));}assert.ok(book.includes(chapter.photo.creator));assert.ok(book.includes(chapter.photo.license_url));}
 assert.ok(book.includes('chicken'));assert.ok(book.includes('not a daily show schedule'));
});
test('performance-only and removed-stop books retain the right story without inventing bookings',()=>{
 let plan=create();plan.items=plan.items.map(i=>({...i,day:i.id==='experience:mayurbhanj-chhau'?2:1}));
 const reading=selectBookPlan(plan,2);assert.deepEqual(selectedStoryTrail(reading,data.trails).chapters.map(c=>c.id),['rhythm']);
 const book=buildTourBook(reading,data.catalog,{trails:data.trails});assert.ok(book.includes(trail.chapters[1].title));assert.ok(!book.includes(trail.chapters[0].title));assert.ok(book.includes('not a daily show schedule'));
 plan=removeWithUndo(plan,'food:baripada-mudhi-mansa').plan;assert.ok(!selectedStoryTrail(plan,data.trails).chapters.some(c=>c.id==='meal'));
 assert.equal(selectedStoryTrail({...plan,items:plan.items.filter(i=>i.id==='stay:similipal-camps')},data.trails),null);
});
test('Mayurbhanj page and contributions preserve current-access uncertainty, performer consent and valid guide links',()=>{
 assert.equal((page.match(/<h1\b/g)||[]).length,1);const ids=[...page.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 assert.equal((page.match(/data-journey-starter="mayurbhanj-forest-culture"/g)||[]).length,1);assert.ok(page.includes('Save these 5 ideas together'));
 for(const chapter of trail.chapters){assert.ok(existsSync('dist'+chapter.photo.src));assert.ok(page.includes(chapter.photo.creator));for(const id of chapter.ideas){const entry=data.catalog.find(i=>i.id===id);assert.ok(page.includes('href="'+entry.href+'"'));assert.ok(readFileSync('dist'+entry.href.split('#')[0]+'index.html','utf8').includes('href="/journey-starters/mayurbhanj/"'));}}
 for(const link of trail.preparation_links){assert.ok(page.includes('href="'+link.href+'"'));if(link.href.startsWith('/'))assert.ok(existsSync('dist'+link.href+'index.html'));else assert.ok(link.href.startsWith('https://www.similipal.org/'));}
 for(const kind of ['forest','performance','food']){assert.ok(page.includes('local='+kind+'&amp;page=%2Fjourney-starters%2Fmayurbhanj%2F'));assert.equal(new URL(localContributionURL(kind,'/journey-starters/mayurbhanj/'),'https://projectodisha.org').searchParams.get('page'),'/journey-starters/mayurbhanj/');}
 assert.ok(readFileSync('dist/contribute/index.html','utf8').includes('value="/journey-starters/mayurbhanj/"'));
 assert.ok(localContributionPrompts.forest.questions.join(' ').includes('wildlife coordinates'));
 assert.ok(localContributionPrompts.performance.questions.join(' ').includes('agreed to public identification'));
 assert.ok(page.includes('reopening to be announced separately'));assert.ok(page.includes('not a daily show schedule'));assert.match(page,/<summary[^>]*>Photographs &(?:amp;)? source notes<\/summary>/);
});
