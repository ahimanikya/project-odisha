import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const story=JSON.parse(readFileSync('../../kb/research/culture/huluhuli-website.json','utf8'));
const mapping=JSON.parse(readFileSync('../../kb/records/huluhuli-editorial-source-mapping-2026-10-17.json','utf8')).records[0];
const html=readFileSync('dist-coast/sounds-of-odisha/huluhuli/index.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Huluhuli has individually mapped visible notes and exact passage return links',()=>{
 assert.equal(createHash('sha256').update(story.blocks.flatMap(b=>[...b.paragraphs,...b.items]).join('\n')).digest('hex'),mapping.narrative_sha256);
 assert.deepEqual(story.blocks.map(b=>b.paragraph_source_ids),mapping.sections.map(b=>b.paragraph_source_ids));
 assert.match(html,/<section id="story-sources"/);assert.doesNotMatch(html,/<details id="story-sources"/);
 let count=0;
 story.blocks.forEach((b,bi)=>{
  assert.equal(b.paragraphs.length,b.paragraph_source_ids.length);
  assert.deepEqual([...new Set(b.paragraph_source_ids.flat())],b.source_ids);
  b.paragraph_source_ids.forEach((ids,pi)=>ids.forEach(id=>{
   const ref=`ref-huluhuli-${bi}-${pi}-${id}`;
   assert.ok(story.sources.some(s=>s.id===id));
   assert.equal(html.split(`id="${ref}"`).length-1,1);
   assert.equal(html.split(`href="#${ref}"`).length-1,1);
   count++;
  }));
 });
 assert.equal([...html.matchAll(/<a[^>]+data-footnote-ref\b/g)].length,count);
 for(const s of story.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.reader_note)));assert.ok(html.includes(escape(s.resource)));assert.ok(s.locator.length>0);}
 const kb=readFileSync('../../kb/research/culture/huluhuli.md','utf8');
 for(const b of story.blocks)for(const p of b.paragraphs)assert.ok(kb.includes(p));
 assert.ok(story.photo.provenance.includes('AI assistance'));
 assert.equal(createHash('sha256').update(readFileSync('public'+story.photo.src)).digest('hex'),story.photo.sha256);
 assert.ok(html.includes('An imagined household celebration'));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
