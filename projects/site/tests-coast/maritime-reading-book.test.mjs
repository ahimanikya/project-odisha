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
 for(const s of story.sources){assert.ok(!book.includes(escapeHTML(s.reader_note)));assert.ok(!text.includes(s.reader_note));assert.ok(book.includes(s.url.replaceAll('&','&amp;')));assert.ok(text.includes(s.url));}
 assert.ok(book.includes('not a scheduled visit'));assert.equal(item.photo.caption,story.hero_caption);
 assert.equal(JSON.parse(readFileSync('editions/search-candidate.json')).pages.find(page=>page.route===story.href).decision,'hold');
});

test('Boita article preserves canonical prose and passage evidence in visible footnotes',()=>{
 const html=readFileSync('dist-coast/stories/maritime-memory/index.html','utf8');
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const notes=html.match(/<section id="story-sources"[\s\S]*?<\/section>/)?.[0];
 assert.ok(notes,'visible footnotes are available');
 assert.ok(!notes.includes('<details'));
 for(const source of story.sources) assert.ok(notes.includes(escape(source.reader_note)));
 assert.ok(!/PDF screenshots failed|page could not be fetched/.test(notes));
 const process=readFileSync('dist-coast/about/editorial-process/index.html','utf8');
 assert.ok(process.includes('AI assistants help us'));
 assert.ok(html.includes('href="/about/editorial-process/"'));
 assert.equal(JSON.parse(readFileSync('editions/search-candidate.json')).pages.find(p=>p.route==='/about/editorial-process/').decision,'exclude');
 assert.ok(html.includes('By Ahimanikya Satapathy'));
 assert.ok(!/prepared with AI|drafted with AI/i.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')));
 for(const chapter of story.chapters){
  assert.ok(html.includes('id="'+chapter.id+'"'));
  for(const p of chapter.paragraphs) assert.ok(html.includes(escape(p)),chapter.id+': missing canonical prose');
  chapter.paragraph_source_ids.forEach((ids,i)=>{for(const id of ids){assert.ok(html.includes('href="#note-'+id+'"'));assert.ok(notes.includes('href="#ref-'+chapter.id+'-'+i+'-'+id+'"'));}});
  for(const id of chapter.source_ids){ assert.ok(story.sources.some(s=>s.id===id),'unresolved source '+id);assert.ok(chapter.paragraph_source_ids.flat().includes(id),'unmapped chapter source '+id);assert.equal(html.split('id="note-'+id+'"').length-1,1);}
 }
 assert.ok(!html.includes('Read the evidence:'));
 assert.match(html,/<meta name="robots" content="noindex, nofollow"/);
});
