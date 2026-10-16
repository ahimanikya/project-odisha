import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyJourney,addItem} from '../src/lib/journey.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const story=JSON.parse(readFileSync('../../kb/research/stories/narratives/maritime-memory.json'));
test('public maritime reading item has the same portable evidence and separate museum choice',()=>{
 const html=readFileSync('dist-coast/stories/maritime-memory/index.html','utf8');
 const data=JSON.parse(html.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
 const item=data.catalog.find(x=>x.id===story.save_id);assert.equal(item.kind,'Reading');assert.equal(item.href,story.href);
 assert.ok(data.catalog.some(x=>x.id===story.visit.save_id));assert.ok(html.includes('data-save-journey="'+story.save_id+'"'));assert.ok(html.includes('museum visit is a separate choice'));
 const plan=addItem(emptyJourney(),story.save_id),book=buildTourBook(plan,data.catalog),text=buildTextItinerary(plan,data.catalog);
 for(const s of story.sources){assert.ok(book.includes(escapeHTML(s.note)));assert.ok(text.includes(s.note));}
 assert.ok(book.includes('not a scheduled visit'));assert.equal(item.photo.caption,story.hero_caption);
 assert.equal(JSON.parse(readFileSync('editions/search-candidate.json')).pages.find(page=>page.route===story.href).decision,'hold');
});

test('Boita article preserves canonical prose and section evidence in expandable end notes',()=>{
 const html=readFileSync('dist-coast/stories/maritime-memory/index.html','utf8');
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const notes=html.match(/<details id="story-sources"[\s\S]*?<\/details>/)?.[0];
 assert.ok(notes,'source disclosure is available');
 for(const chapter of story.chapters){
  assert.ok(html.includes('id="'+chapter.id+'"'));
  for(const p of chapter.paragraphs) assert.ok(html.includes(escape(p)),chapter.id+': missing canonical prose');
  assert.ok(notes.includes(escape(chapter.title)),chapter.id+': source mapping missing');
  for(const id of chapter.source_ids) assert.ok(story.sources.some(s=>s.id===id),'unresolved source '+id);
 }
 assert.ok(!html.includes('Read the evidence:'));
 assert.match(html,/<meta name="robots" content="noindex, nofollow"/);
});
