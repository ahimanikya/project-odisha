// Pala uses paragraph-level footnotes, covered by pala-editorial.test.mjs.
import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const slug of ['sankha', 'mardala', 'daskathia', 'ghanta-ghanti', 'dalkhai', 'dhemsa'])test(`${slug} passage citations reach the matching numbered source note and retain its limits`,()=>{
 const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
 const mapping=JSON.parse(readFileSync('../../kb/records/'+(['huluhuli','sankha','mardala','dalkhai','pala','dhemsa'].includes(slug)?slug+'-source-mapping-2026-10-17.json':'core-sound-source-mapping-2026-10-15.json'),'utf8')).records.find(r=>r.slug===slug);
 assert.equal(createHash('sha256').update(story.blocks.flatMap(b=>[...b.paragraphs,...b.items]).join('\n')).digest('hex'),mapping.narrative_sha256);
 assert.deepEqual(story.blocks.map(b=>b.source_ids),mapping.sections.map(b=>b.source_ids));
 const html=readFileSync('dist-coast/sounds-of-odisha/'+slug+'/index.html','utf8');
 const article=html.split('<article ',2)[1].split('</article>',1)[0].replace(/<details class="sound-reading-paths"[^>]*>[\s\S]*?<\/details>/g,'');
 const blocks=[...article.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
 // Connected reading is navigation, not one of the independently sourced narrative blocks.
 const isReadingPath=block=>/class="[^"]*\barticle-reading-path\b[^"]*"/.test(block[1]);
 const sections=blocks.filter(block=>!isReadingPath(block)).map(block=>block[2]);
 if(slug==='daskathia'){
  const reading=blocks.filter(isReadingPath);assert.equal(reading.length,1);
  assert.match(reading[0][2],/href="\/sounds-of-odisha\/chakulia-panda\/"/);
  assert.match(reading[0][2],/src="\/images\/chakulia-panda\/chakulia-panda-1200\.webp"/);
  const credit=article.match(/<p\b[^>]*class="chakulia-credit"[^>]*>([\s\S]*?)<\/p>/)?.[1];assert.ok(credit);
  assert.ok(credit.includes('https://commons.wikimedia.org/wiki/File:Chakulia_panda_walking_at_a_village_area_in_Odisha.JPG'));
  assert.ok(credit.includes('https://creativecommons.org/licenses/by-sa/4.0/'));
  assert.match(credit,/Aditya Mahar/);assert.match(credit,/Resized and compressed; same licence\./);
 }
 assert.equal(sections.length,story.blocks.length);
 const notes=html.match(/<details id="story-sources"[^>]*>([\s\S]*?)<\/details>/)[1];
 assert.match(notes,/<ol\b[^>]*>/);
 story.blocks.forEach((block,i)=>{
  const links=[...sections[i].matchAll(/href="#story-source-([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>(\d+)<\/a>/g)];
  assert.deepEqual(links.map(m=>m[1]),block.source_ids);
  for(const link of links){
   const source=story.sources.find(s=>s.id===link[1]);assert.ok(source);
   assert.equal(Number(link[3]),story.sources.indexOf(source)+1);
   assert.equal(link[2].replaceAll("&#39;", "'"),escape(`Footnote ${link[3]}: ${source.title}`).replaceAll("&#39;", "'"));
   assert.equal(html.split('id="story-source-'+source.id+'"').length-1,1);
   const note=notes.match(new RegExp('<li id="story-source-'+source.id+'"[^>]*tabindex="-1"[^>]*>([\\s\\S]*?)<\\/li>'))?.[1];
   assert.ok(note?.includes(escape(source.resource))&&note.includes(escape(source.locator)),source.id);
  }
  for(const p of block.paragraphs)assert.ok(sections[i].includes(escape(p)));
 });
 assert.ok(notes.includes(escape(story.limits)));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
