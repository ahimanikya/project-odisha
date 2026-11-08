import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {emptyLibrary,addItem} from '../src/lib/journey.mjs';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const data=JSON.parse(readFileSync('../../kb/research/culture/craft-stories.json'));
const read=p=>readFileSync('dist-coast'+p+'index.html','utf8');
const journey=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
test('craft stories publish sourced process, licensed real photos and accurate maker context',()=>{
 for(const entry of data.pages){
  const route='/crafts/'+entry.slug+'/',html=read(route);
  assert.ok(read('/crafts/').includes('href="'+route+'"'));assert.ok(read('/explore/').includes('href="'+route+'"'));
  assert.ok(html.includes('noindex, nofollow'));assert.ok(html.includes(entry.odia));
  for(const id of new Set([entry.hero,...entry.sections.filter(s=>s.photo).map(s=>s.photo)])){
   const photo=data.assets[id];
   for(const text of [photo.alt,photo.creator,photo.license_url,photo.caption])assert.ok(html.includes(text),route+': '+text);
   assert.equal(createHash('sha256').update(readFileSync('dist-coast'+photo.src)).digest('hex'),photo.sha256);
  }
  for(const id of new Set(entry.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids))))assert.ok(html.includes(data.sources[id].url));
 }
 assert.match(read('/crafts/pipili-applique/'),/not a description of every Pipili workshop/);
 assert.match(read('/crafts/pattachitra/'),/not a specification for every piece sold today/);
 assert.match(read('/crafts/pattachitra/'),/precise medium of the piece are not established/);
});
test('craft starter leaves an existing journey untouched and carries source and maker notes offline',()=>{
 const old=emptyLibrary();old.trips[0].plan=addItem(old.trips[0].plan,'place:chilika');old.trips[0].plan.items[0].notes='Keep my lake day';
 const before=structuredClone(old),starter=journey.starters.find(s=>s.id==='made-by-hand');assert.ok(starter);
 const next=createStarterTrip(old,'craft-review',starter,journey.catalog.map(i=>i.id));assert.deepEqual(old,before);assert.deepEqual(next.trips[0],before.trips[0]);
 const plan=next.trips[1].plan;assert.equal(plan.items.length,5);plan.items[0].notes='Ask permission to record the maker’s story.';
 const book=buildTourBook(plan,journey.catalog);
 for(const id of [data.collection.save_id,...data.pages.map(p=>p.save_id)]){
  const item=journey.catalog.find(i=>i.id===id);assert.ok(item);assert.ok(item.photo);assert.ok(item.practical.length>=3);assert.ok(item.sources.length);
  assert.ok(book.includes(item.title));for(const s of item.sources)assert.ok(book.includes(s.url.replaceAll('&','&amp;')));
 }
 assert.match(book,/Keep|maker/);assert.ok(book.includes('Ask permission to record the maker’s story.'));assert.match(book,/machine-stitched/);
 for(const id of ['place:raghurajpur','experience:cuttack-filigree'])assert.ok(plan.items.some(i=>i.id===id));
});
test('craft discovery connects existing guides and preserves excluded publication scope',()=>{
 for(const route of ['/things-to-do/','/destinations/puri/','/destinations/cuttack/','/visit/experiences/cuttack-filigree/'])assert.ok(read(route).includes('href="/crafts/"'),route);
 assert.ok(read('/visit/places/raghurajpur/').includes('href="/crafts/pattachitra/"'));
 assert.ok(read('/crafts/').includes('href="/journey-starters/#made-by-hand"'));
 assert.ok(read('/journey-starters/').includes('data-journey-starter="made-by-hand"'));
 assert.ok(!existsSync('dist-coast/store/index.html'));assert.ok(!existsSync('dist-coast/culture/pala/index.html'));
});
test('backlog uses the published release and preserves previous review states',()=>{
 const q=JSON.parse(readFileSync('../../kb/records/visitor-review-queue.json'));
 const reconciliation=JSON.parse(readFileSync('../../kb/records/craft-backlog-reconciliation.json'));
 const publication=JSON.parse(readFileSync('../../kb/'+q.current_published_baseline.evidence));
 assert.equal(q.current_published_baseline.pages,publication.counts.public_pages);
 assert.equal(q.current_published_baseline.saveable_ideas,publication.counts.journey_items);
 assert.equal(q.current_published_baseline.indexable_pages,publication.counts.indexable_pages);
 assert.equal(q.current_published_baseline.noindex_pages,publication.counts.noindex_pages);
 assert.equal(q.current_published_baseline.indexing,`limited_${publication.counts.indexable_pages}_pages`);assert.deepEqual(reconciliation.status_changes,[]);
 const records=JSON.parse(readFileSync('../../kb/registers/records.json'));
 for(const previous of reconciliation.changed_work_next_actions){const current=records.work.find(w=>w.id===previous.id);assert.equal(current.status,previous.status);assert.ok(!current.next_action.includes('current 69-page'));}
 assert.ok(q.separate_decisions.find(d=>d.title==='Research integration').next_action.includes('integrated'));
});
