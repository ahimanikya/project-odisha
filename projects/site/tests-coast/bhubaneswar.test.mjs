import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {emptyLibrary,addItem} from '../src/lib/journey.mjs';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8');
const data=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const city=data.starters.find(s=>s.id==='bhubaneswar-stone-painted-streets');
test('city starter creates six choices without replacing a dated existing journey',()=>{
 const old=emptyLibrary();old.trips[0].plan=addItem(old.trips[0].plan,'place:chilika');old.trips[0].plan.startDate='2026-12-12';old.trips[0].plan.items[0].notes='Keep my lake plan';
 const before=structuredClone(old),next=createStarterTrip(old,'city-review',city,data.catalog.map(i=>i.id));
 assert.deepEqual(old,before);assert.deepEqual(next.trips[0],before.trips[0]);assert.equal(next.trips[1].plan.items.length,6);
 const book=buildTourBook(next.trips[1].plan,data.catalog);
 for(const text of ['Old Town / Ekamra','Janpath and the central city','An arrival-focused base','tenth century','February 2009','not a verified current mural route','portions and price'])assert.ok(book.includes(text),text);
});
test('new guides expose stable choices, scoped links and truthful photo context',()=>{
 const food=read('/food/bhubaneswar/');
 assert.ok(food.includes('data-save-journey="food:pakhala"'));assert.ok(food.includes('photographed in Puri'));
 assert.equal(data.catalog.find(i=>i.id==='food:pakhala').href,'/food/bhubaneswar/#pakhala');
 assert.ok(food.includes('href="/food/chhena-poda/"'));
 assert.ok(read('/visit/places/mukteswar/').includes('Andrew Moore'));
 assert.ok(read('/visit/stays/bhubaneswar/').includes('not an accommodation'));
});
test('Fresco ships the complete credited art archive with exact original bytes and no event photos',()=>{
 const source=JSON.parse(readFileSync('../../kb/collections/bhubaneswar-fresco/import.json','utf8'));
 const base='dist-coast/stories/bhubaneswar-fresco/';
 assert.equal(readdirSync(base+'photos').length,166);assert.equal(readdirSync(base+'thumbnails').length,166);
 for(const asset of source.assets)assert.equal(createHash('sha256').update(readFileSync(base+asset.path)).digest('hex'),asset.sha256,asset.path);
 const html=read('/stories/bhubaneswar-fresco/');
 for(const text of ['February 2009','Mural artists','present condition remain unverified','id="journey-data"','id="story-selection"','href="/destinations/bhubaneswar/"'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('href="/stories/bhubaneswar-fresco/story/"'));
 const payload=JSON.parse(html.match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);assert.deepEqual(payload,data);
});
