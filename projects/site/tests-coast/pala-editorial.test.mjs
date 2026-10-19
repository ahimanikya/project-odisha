import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const story=JSON.parse(readFileSync('../../kb/research/culture/pala-website.json','utf8'));
const mapping=JSON.parse(readFileSync('../../kb/records/pala-editorial-source-mapping-2026-10-19.json','utf8'));
const html=readFileSync('dist-coast/sounds-of-odisha/pala/index.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Pala has individually mapped visible notes and exact passage return links',()=>{
 assert.equal(createHash('sha256').update(story.blocks.flatMap(b=>[...b.paragraphs,...b.items]).join('\n')).digest('hex'),mapping.narrative_sha256);
 assert.deepEqual(story.blocks.map(b=>b.paragraph_source_ids),mapping.sections.map(b=>b.paragraph_source_ids));
 assert.match(html,/<section id="story-sources"/);assert.doesNotMatch(html,/<details id="story-sources"/);
 let count=0;
 story.blocks.forEach((b,bi)=>{
  assert.equal(b.paragraphs.length,b.paragraph_source_ids.length);
  assert.deepEqual([...new Set(b.paragraph_source_ids.flat())],b.source_ids);
  b.paragraph_source_ids.forEach((ids,pi)=>ids.forEach(id=>{
   const ref=`ref-pala-${bi}-${pi}-${id}`;
   assert.ok(story.sources.some(s=>s.id===id));
   assert.equal(html.split(`id="${ref}"`).length-1,1);
   assert.equal(html.split(`href="#${ref}"`).length-1,1);
   count++;
  }));
 });
 assert.equal([...html.matchAll(/<a[^>]+data-footnote-ref\b/g)].length,count);
 for(const s of story.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.reader_note)));assert.ok(html.includes(escape(s.resource)));assert.ok(s.locator.length>0);}
 const kb=readFileSync('../../kb/research/culture/pala.md','utf8');
 for(const b of story.blocks)for(const p of b.paragraphs)assert.ok(kb.includes(p));
 assert.equal(story.sources.length,mapping.source_ids.length);
 assert.ok(count>13);
 assert.equal(createHash('sha256').update(readFileSync('public/images/sounds/pala-nalconagar.webp')).digest('hex'),'8a0fc3f16e7091b1f0169f6a10992315ce8efab2bbc3cc5e953f8e802f21ef35');
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});

test('Pala visitor guidance distinguishes enquiry links from current performance offers',()=>{
 assert.ok(story.blocks.some(b=>b.title==='Why Pala deserves a future'));
 assert.ok(story.blocks.some(b=>b.title==='Finding a performance during your visit'));
 assert.ok(story.blocks.some(b=>b.title==='Enjoy the evening, even if Odia is new to you'));
 assert.ok(html.includes('id="planning-links"'));
 for(const link of story.visitor_links){assert.ok(html.includes(escape(link.url)));assert.ok(html.includes(escape(link.purpose)));}
 const evidence=JSON.parse(readFileSync('../../kb/research/references/data/pala-preservation-visit.json','utf8'));
 assert.equal(evidence.visitor_status.forthcoming_public_event_confirmed,false);
 assert.equal(evidence.visitor_status.price,null);
 assert.equal(evidence.visitor_status.booking_availability,null);
 assert.ok(html.includes('No forthcoming public performance is confirmed'));
 assert.ok(html.includes('It is not a claim that Pala has a UNESCO listing.'));
});
