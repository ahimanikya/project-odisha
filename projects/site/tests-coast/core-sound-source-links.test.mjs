import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const slug of ['huluhuli', 'sankha', 'mardala', 'daskathia', 'ghanta-ghanti', 'dalkhai', 'pala', 'dhemsa'])test(`${slug} passage citations reach the matching numbered source note and retain its limits`,()=>{
 const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
 const mapping=JSON.parse(readFileSync('../../kb/records/'+(['huluhuli','sankha','mardala','dalkhai','pala'].includes(slug)?slug+'-source-mapping-2026-10-17.json':'core-sound-source-mapping-2026-10-15.json'),'utf8')).records.find(r=>r.slug===slug);
 assert.equal(createHash('sha256').update(story.blocks.flatMap(b=>[...b.paragraphs,...b.items]).join('\n')).digest('hex'),mapping.narrative_sha256);
 assert.deepEqual(story.blocks.map(b=>b.source_ids),mapping.sections.map(b=>b.source_ids));
 const html=readFileSync('dist-coast/sounds-of-odisha/'+slug+'/index.html','utf8');
 const article=html.split('<article ',2)[1].split('</article>',1)[0].replace(/<details class="sound-reading-paths"[^>]*>[\s\S]*?<\/details>/g,'');
 const sections=[...article.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(m=>m[1]);
 assert.equal(sections.length,story.blocks.length);
 const notes=html.match(/<details id="story-sources"[^>]*>([\s\S]*?)<\/details>/)[1];
 assert.match(notes,/<ol\b[^>]*>/);
 story.blocks.forEach((block,i)=>{
  const links=[...sections[i].matchAll(/href="#story-source-([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>Source (\d+)<\/a>/g)];
  assert.deepEqual(links.map(m=>m[1]),block.source_ids);
  for(const link of links){
   const source=story.sources.find(s=>s.id===link[1]);assert.ok(source);
   assert.equal(Number(link[3]),story.sources.indexOf(source)+1);
   assert.equal(link[2].replaceAll("&#39;", "'"),escape(`Source ${link[3]}: ${source.title}`).replaceAll("&#39;", "'"));
   assert.equal(html.split('id="story-source-'+source.id+'"').length-1,1);
   const note=notes.match(new RegExp('<li id="story-source-'+source.id+'"[^>]*tabindex="-1"[^>]*>([\\s\\S]*?)<\\/li>'))?.[1];
   assert.ok(note?.includes(escape(source.resource))&&note.includes(escape(source.locator)),source.id);
  }
  for(const p of block.paragraphs)assert.ok(sections[i].includes(escape(p)));
 });
 assert.ok(notes.includes(escape(story.limits)));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
