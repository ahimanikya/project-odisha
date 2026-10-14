import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {emptyLibrary,addItem,parseBackup,removeWithUndo} from '../src/lib/journey.mjs';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {selectedStoryTrail,storyTrailPhotos} from '../src/lib/story-trails.mjs';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
import {selectBookPlan} from '../src/lib/journey-ready.mjs';
import {localContributionURL,localContributionPrompts} from '../src/lib/local-contribution.mjs';
const page=readFileSync('dist/journey-starters/chilika/index.html','utf8');
const data=JSON.parse(page.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const trail=data.trails.find(t=>t.starter_id==='chilika-island');
const starters=data.starters.filter(s=>['chilika-birds','chilika-island','chilika-satapada'].includes(s.id));
const expected={'chilika-birds':['birds'],'chilika-island':['island','table'],'chilika-satapada':['open-water']};
test('three gateway choices create isolated journeys and include only their relevant story chapters',()=>{
 const original=emptyLibrary();original.trips[0].plan=addItem(original.trips[0].plan,'place:chilika');original.trips[0].plan.items[0].notes='Keep my earlier plan';
 const snapshot=structuredClone(original);
 for(const starter of starters){
  const library=createStarterTrip(original,starter.id,starter,data.catalog.map(i=>i.id)),plan=library.trips[1].plan;
  assert.deepEqual(library.trips[0],snapshot.trips[0]);assert.deepEqual(original,snapshot);
  assert.deepEqual(parseBackup(JSON.stringify(library)),library);
  assert.ok(plan.items.every(i=>i.day===0));
  assert.deepEqual(selectedStoryTrail(plan,data.trails).chapters.map(c=>c.id),expected[starter.id]);
  const withNotes={...plan,items:plan.items.map(i=>({...i,notes:'PRIVATE_TEST'}))};
  const images=Object.fromEntries(storyTrailPhotos(plan,data.trails).map(p=>[p.src,'data:image/png;base64,AAAA']));
  const book=buildTourBook(withNotes,data.catalog,{trails:data.trails,illustrated:true,images,includePersonalNotes:false});
  const text=buildTextItinerary(withNotes,data.catalog,{trails:data.trails,includePersonalNotes:false});
  for(const chapter of trail.chapters)for(const output of [book,text])assert.equal(output.includes(chapter.title),expected[starter.id].includes(chapter.id));
  assert.equal((book.match(/<img /g)||[]).length,expected[starter.id].length);
  for(const output of [book,text]){assert.ok(!output.includes('PRIVATE_TEST'));assert.ok(output.includes('different starting points'));}
 }
 assert.equal(selectedStoryTrail(original.trips[0].plan,data.trails),null);
});
test('edited and single-day exports follow selected ideas without importing another gateway',()=>{
 const starter=starters.find(s=>s.id==='chilika-island');let plan=createStarterTrip(emptyLibrary(),'island',starter,data.catalog.map(i=>i.id)).trips[1].plan;
 plan.items=plan.items.map(i=>({...i,day:i.id==='food:chilika-fish'?2:1}));
 assert.deepEqual(selectedStoryTrail(selectBookPlan(plan,2),data.trails).chapters.map(c=>c.id),['table']);
 plan=removeWithUndo(plan,'food:chilika-fish').plan;
 assert.deepEqual(selectedStoryTrail(plan,data.trails).chapters.map(c=>c.id),['island']);
 plan=addItem(plan,'experience:chilika-mangalajodi-birding');
 assert.deepEqual(selectedStoryTrail(plan,data.trails).chapters.map(c=>c.id),['birds','island']);
 assert.equal(selectedStoryTrail({...plan,items:[]},data.trails),null);
});
test('illustrated page has linked guides, unique accessible controls, photographs and honest location captions',()=>{
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 const ids=[...page.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const s of starters){assert.equal((page.match(new RegExp('data-journey-starter="'+s.id+'"','g'))||[]).length,1);assert.ok(ids.includes('starter-status-'+s.id));}
 for(const c of trail.chapters){
  assert.ok(existsSync('dist'+c.photo.src));assert.ok(page.includes(c.photo.creator));assert.ok(page.includes(c.photo.license_url));
  for(const id of c.ideas){const entry=data.catalog.find(i=>i.id===id);assert.ok(entry,id);assert.ok(page.includes('href="'+entry.href+'"'));const [route,hash]=entry.href.split('#');const guide=readFileSync('dist'+route+'index.html','utf8');if(hash)assert.ok(guide.includes('id="'+hash+'"'));assert.ok(guide.includes('href="/journey-starters/chilika/"'));}
 }
 assert.ok(page.includes('not a photograph identifying Satapada'));
 assert.ok(page.includes('not a single-day route'));assert.ok(page.includes('current arrangements remain to be confirmed'));
});
test('local prompts preserve the chosen guide and do not assert sightings or operator safety',()=>{
 for(const kind of ['boating','birding','access','food']){
  assert.ok(page.includes('local='+kind));const url=new URL(localContributionURL(kind,'/visit/places/satapada/'),'https://projectodisha.org');
  assert.equal(url.searchParams.get('page'),'/visit/places/satapada/');assert.equal(url.hash,'#correction-draft');
 }
 assert.ok(localContributionPrompts.birding.questions.join(' ').includes('Leave out nest coordinates'));
 assert.ok(localContributionPrompts.boating.evidence.includes('one trip'));
 const form=readFileSync('dist/contribute/index.html','utf8');assert.ok(form.includes('value="/journey-starters/chilika/"'));
});
