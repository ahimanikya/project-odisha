import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const slugs=['gotipua','odia-lullabies','craft-listening','chilika-listening','boat-songs','kendara','ghumura','mahuri','ranapa','chaiti-ghoda','danda-nata','prahlada-nataka','dhuduki','odissi-music'];
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('fourteen further-reading stories expose real section destinations and revealable sources without losing prose',()=>{
 for(const slug of slugs){
  const story=JSON.parse(readFileSync('../../kb/research/culture/'+slug+'-website.json','utf8'));
  const html=readFileSync('dist-coast/stories/'+slug+'/index.html','utf8');
  const menu=html.match(/<details class="research-contents"[^>]*>([\s\S]*?)<\/details>/)?.[1];
  if(slug==='ghumura'){
   assert.ok(menu);assert.match(menu,/<summary[^>]*>In this article<\/summary>/);
   const links=[...menu.matchAll(/href="#([^"]+)"[^>]*>(.*?)<\/a>/g)];
   assert.deepEqual(links.map(m=>m[1]),[...story.blocks.flatMap((b,i)=>b.title?[`story-section-${i+1}`]:[]),'reading-paths','ghumura-further-reading','story-sources']);
   for(const [,id] of links)assert.equal(html.split('id="'+id+'"').length-1,1);
   for(const block of story.blocks){if(block.title)assert.ok(html.includes(escape(block.title)));for(const text of block.paragraphs)assert.ok(html.includes(escape(text)));}
   assert.match(html,/<section id="story-sources"[^>]*class="article-footnotes"/);
   assert.match(html,/<section class="sound-reading-paths" id="reading-paths"/);
   assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
   continue;
  }
  if(slug==='prahlada-nataka'){
   assert.ok(menu);assert.match(menu,/<summary[^>]*>In this article<\/summary>/);
   const links=[...menu.matchAll(/href="#([^"]+)"[^>]*>(.*?)<\/a>/g)];
   assert.equal(links.length,8);assert.equal(links.at(-1)[1],'footnote-label');
   for(const [,id,label] of links){
    assert.equal(html.split('id="'+id+'"').length-1,1);
    assert.match(html,new RegExp('<h2[^>]*id="'+id+'"[^>]*>'+label+'<'));
   }
   assert.match(html,/<section[^>]*data-footnotes/);
   assert.ok(html.indexOf('id="footnote-label"')<html.indexOf('id="further-reading"'));
   continue;
  }
  assert.ok(menu,slug);assert.match(menu,/<summary[^>]*>In this story<\/summary>/);
  const links=[...menu.matchAll(/href="#([^"]+)"[^>]*>(.*?)<\/a>/g)];
  const article=html.split('<article ',2)[1].split('</article>',1)[0];
  const headings=[...article.matchAll(/<h2 id="(story-section-[^"]+)"[^>]*>(.*?)<\/h2>/g)];
  assert.deepEqual(links.slice(0,-1).map(m=>m.slice(1)),headings.map(m=>m.slice(1)),slug);
  assert.deepEqual(headings.map(m=>m[2]),story.blocks.filter(b=>b.title).map(b=>escape(b.title)),slug);
  assert.equal(links.at(-1)[1],'story-sources');assert.equal(links.at(-1)[2],slug==='boat-songs'?'Footnotes &amp; Sources':'Sources &amp; reading notes');
  if(slug==='boat-songs')assert.match(html,/<section id="story-sources"/);
  else assert.match(html,/<details id="story-sources"[^>]*><summary[^>]*>Sources &amp; reading notes<\/summary>/);
  for(const link of links)assert.equal([...html.matchAll(new RegExp('\\bid="'+link[1]+'"','g'))].length,1,slug+'#'+link[1]);
  for(const block of story.blocks)for(const p of block.paragraphs)assert.ok(html.includes(escape(p)),slug+' missing narrative');
  for(const source of story.sources)assert.ok(html.includes(escape(source.resource)),slug+' missing citation');
  assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
 }
});
