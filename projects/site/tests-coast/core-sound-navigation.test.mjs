import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const slug of ['huluhuli','sankha','mardala','daskathia','ghanta-ghanti','dalkhai','pala','dhemsa'])test(`${slug} contents reach all story sections and sources without losing narrative`,()=>{
 const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
 const html=readFileSync('dist-coast/sounds-of-odisha/'+slug+'/index.html','utf8');
 const menu=html.match(/<details class="research-contents"[^>]*>([\s\S]*?)<\/details>/)?.[1];
 assert.ok(menu,'article contents present');assert.match(menu,/In this story/);
 const expected=story.blocks.flatMap((block,i)=>block.title?['story-section-'+(i+1)]:[]).concat(slug==='pala'&&story.visitor_links?.length?['planning-links','story-sources']:['story-sources']);
 assert.deepEqual([...menu.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]),expected);
 for(const id of expected)assert.equal(html.split(`id="${id}"`).length-1,1,`unique destination ${id}`);
 story.blocks.forEach((block,i)=>{
  if(block.title)assert.ok(html.includes(`id="story-section-${i+1}"`)&&menu.includes(escape(block.title)));
  for(const p of [...block.paragraphs,...block.items])assert.ok(html.includes(escape(p)),`retained ${p.slice(0,60)}`);
 });
 const notes=['huluhuli','pala'].includes(slug)?html.match(/<section id="story-sources"[^>]*>([\s\S]*?)<\/section>/)?.[1]:html.match(/<details id="story-sources"[^>]*>([\s\S]*?)<\/details>/)?.[1];
 if(!['huluhuli','pala'].includes(slug))assert.ok(notes?.includes(escape(story.limits)),'limits retained');
 for(const source of story.sources)assert.ok(notes.includes(escape(source.resource))&&notes.includes(escape(source.title)));
 if(!['huluhuli','pala'].includes(slug)&&story.photo?.provenance)assert.ok(notes.includes(escape(story.photo.public_description || story.photo.provenance)));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
