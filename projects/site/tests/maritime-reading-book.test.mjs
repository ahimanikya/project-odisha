import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyJourney,addItem} from '../src/lib/journey.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
import {isReadingCollection} from '../src/lib/journey-reading.mjs';
const story=JSON.parse(readFileSync('../../kb/research/stories/narratives/maritime-memory.json'));
const html=readFileSync('dist/stories/maritime-memory/index.html','utf8');
const data=JSON.parse(html.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const item=data.catalog.find(x=>x.id===story.save_id);
test('saving maritime reading remains separate from museum visit and preserves earlier notes',()=>{
 const previous=addItem(emptyJourney(),'place:konark');previous.items[0].notes='Keep the earlier plan';const before=structuredClone(previous);
 const combined=addItem(previous,story.save_id);assert.deepEqual(previous,before);assert.equal(combined.items[0].notes,'Keep the earlier plan');assert.ok(!combined.items.some(x=>x.id===story.visit.save_id));
 const reading=addItem(emptyJourney(),story.save_id);assert.equal(reading.items[0].day,0);assert.equal(item.kind,'Reading');assert.ok(isReadingCollection(reading,data.catalog));
 assert.ok(html.includes('data-save-journey="'+story.save_id+'"'));assert.ok(html.includes('data-save-journey="'+story.visit.save_id+'"'));
});
test('portable maritime book retains narrative, questions, source limits and photo credit',()=>{
 const plan=addItem(emptyJourney(),story.save_id);plan.items[0].notes='PRIVATE_MARITIME_NOTE';
 const options={includePersonalNotes:false,illustrated:true,images:{[item.photo.src]:'data:image/png;base64,AAAA'}};
 const book=buildTourBook(plan,data.catalog,options),text=buildTextItinerary(plan,data.catalog,options);
 for(const chapter of story.chapters){for(const p of chapter.paragraphs){assert.ok(book.includes(p));assert.ok(text.includes(p));}assert.ok(book.includes(chapter.question));assert.ok(text.includes(chapter.question));}
 for(const source of story.sources){assert.ok(book.includes(escapeHTML(source.reader_note)));assert.ok(text.includes(source.reader_note));assert.ok(book.includes(source.url.replaceAll('&','&amp;')));assert.ok(text.includes(source.url));}
 assert.ok(book.includes(item.photo.creator));assert.ok(book.includes(story.hero_caption));assert.ok(book.includes(item.photo.license_url));assert.ok(book.includes(story.editorial_note));
 assert.ok(!book.includes('PRIVATE_MARITIME_NOTE'));assert.ok(!text.includes('PRIVATE_MARITIME_NOTE'));
 assert.ok(buildTourBook(plan,data.catalog,{includePersonalNotes:true}).includes('PRIVATE_MARITIME_NOTE'));
});
