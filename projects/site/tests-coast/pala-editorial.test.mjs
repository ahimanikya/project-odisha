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
 assert.equal(story.sources.length,7);
 assert.equal(count,13);
 assert.equal(createHash('sha256').update(readFileSync('public/images/sounds/pala-nalconagar.webp')).digest('hex'),'8a0fc3f16e7091b1f0169f6a10992315ce8efab2bbc3cc5e953f8e802f21ef35');
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
