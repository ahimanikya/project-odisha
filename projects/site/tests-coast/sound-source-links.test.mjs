import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const slug of ['ghumura','mahuri','ranapa'])test(`${slug} passage citations reach the matching numbered source note and retain its limits`,()=>{
 const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
 const html=readFileSync('dist-coast/stories/'+slug+'/index.html','utf8');
 const sections=[...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(m=>m[1]);
 assert.equal(sections.length,story.blocks.length);
 const notes=html.match(/<details id="story-sources"[^>]*>([\s\S]*?)<\/details>/)[1];
 assert.match(notes,/<ol\b[^>]*>/);
 story.blocks.forEach((block,i)=>{
  const links=[...sections[i].matchAll(/href="#story-source-([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>Source (\d+)<\/a>/g)];
  assert.deepEqual(links.map(m=>m[1]),block.source_ids);
  for(const link of links){
   const source=story.sources.find(s=>s.id===link[1]);assert.ok(source);
   assert.equal(Number(link[3]),story.sources.indexOf(source)+1);
   assert.equal(link[2],escape(`Source ${link[3]}: ${source.title}`));
   assert.equal(html.split('id="story-source-'+source.id+'"').length-1,1);
   const note=notes.match(new RegExp('<li id="story-source-'+source.id+'"[^>]*tabindex="-1"[^>]*>([\\s\\S]*?)<\\/li>'))?.[1];
   assert.ok(note?.includes(escape(source.resource))&&note.includes(escape(source.locator)),source.id);
  }
  for(const p of block.paragraphs)assert.ok(sections[i].includes(escape(p)));
 });
 assert.ok(notes.includes(escape(story.limits)));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
