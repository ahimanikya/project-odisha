import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const slugs=['gotipua','odia-lullabies','craft-listening','chilika-listening','boat-songs','kendara','ghumura'];
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('seven further-reading stories expose real section destinations and revealable sources without losing prose',()=>{
 for(const slug of slugs){
  const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
  const html=readFileSync('dist-coast/stories/'+slug+'/index.html','utf8');
  const menu=html.match(/<details class="research-contents"[^>]*>([\s\S]*?)<\/details>/)?.[1];
  assert.ok(menu,slug);assert.match(menu,/<summary[^>]*>In this story<\/summary>/);
  const links=[...menu.matchAll(/href="#([^"]+)"[^>]*>(.*?)<\/a>/g)];
  const article=html.split('<article ',2)[1].split('</article>',1)[0];
  const headings=[...article.matchAll(/<h2 id="([^"]+)"[^>]*>(.*?)<\/h2>/g)];
  assert.deepEqual(links.slice(0,-1).map(m=>m.slice(1)),headings.map(m=>m.slice(1)),slug);
  assert.deepEqual(headings.map(m=>m[2]),story.blocks.filter(b=>b.title).map(b=>escape(b.title)),slug);
  assert.equal(links.at(-1)[1],'story-sources');assert.equal(links.at(-1)[2],'Sources &amp; reading notes');
  assert.match(html,/<details id="story-sources"[^>]*><summary[^>]*>Sources &amp; reading notes<\/summary>/);
  for(const link of links)assert.equal([...html.matchAll(new RegExp('\\bid="'+link[1]+'"','g'))].length,1,slug+'#'+link[1]);
  for(const block of story.blocks)for(const p of block.paragraphs)assert.ok(html.includes(escape(p)),slug+' missing narrative');
  for(const source of story.sources)assert.ok(html.includes(escape(source.resource)),slug+' missing citation');
  assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
 }
});
