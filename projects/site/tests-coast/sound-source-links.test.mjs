import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const slug of ['ghumura','mahuri','ranapa','chaiti-ghoda','danda-nata','prahlada-nataka','dhuduki','odissi-music'])test(`${slug} passage citations reach the matching numbered source note and retain its limits`,()=>{
 const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
 const html=readFileSync('dist-coast/stories/'+slug+'/index.html','utf8');
 if(slug==='prahlada-nataka'){
  const source=readFileSync('../../kb/research/culture/prahallad-nataka.md','utf8');
  const ids=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)].map(m=>m[1].toLowerCase());
  assert.equal(ids.length,7);
  for(const id of ids)assert.equal(html.split('id="user-content-fn-'+id+'"').length-1,1);
  const refs=[...html.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)];
  assert.equal(refs.length,13);
  for(const [tag] of refs){
   const target=tag.match(/href="#([^"]+)"/)[1];const origin=tag.match(/\bid="([^"]+)"/)[1];
   assert.ok(html.includes('id="'+target+'"'));assert.ok(html.includes('href="#'+origin+'"'));
  }
  assert.match(html,/<section[^>]*data-footnotes[^>]*class="article-footnotes"/);
  assert.ok(!html.includes('<details id="story-sources"'));
  assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
  return;
 }
 const article=html.split('<article ',2)[1].split('</article>',1)[0].replace(/<details class="sound-reading-paths"[^>]*>[\s\S]*?<\/details>/g,'');
 const sections=[...article.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(m=>m[1]);
 assert.equal(sections.length,story.blocks.length);
 const notes=html.match(/<details id="story-sources"[^>]*>([\s\S]*?)<\/details>/)[1];
 assert.match(notes,/<ol\b[^>]*>/);
 story.blocks.forEach((block,i)=>{
  const links=[...sections[i].matchAll(/href="#story-source-([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>(\d+)<\/a>/g)];
  assert.deepEqual(links.map(m=>m[1]),block.source_ids);
  for(const link of links){
   const source=story.sources.find(s=>s.id===link[1]);assert.ok(source);
   assert.equal(Number(link[3]),story.sources.indexOf(source)+1);
   assert.equal(link[2],escape(`Footnote ${link[3]}: ${source.title}`));
   assert.equal(html.split('id="story-source-'+source.id+'"').length-1,1);
   const note=notes.match(new RegExp('<li id="story-source-'+source.id+'"[^>]*tabindex="-1"[^>]*>([\\s\\S]*?)<\\/li>'))?.[1];
   assert.ok(note?.includes(escape(source.resource))&&note.includes(escape(source.locator)),source.id);
  }
  for(const p of block.paragraphs)assert.ok(sections[i].includes(escape(p)));
 });
 assert.ok(notes.includes(escape(story.limits)));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
