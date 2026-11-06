import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/culture/ghumura-website.json'));
const dist=process.env.GHUMURA_TEST_DIST||'dist';
const route='/stories/ghumura/';
const html=read(dist+route+'index.html').replaceAll('&#39;',"'");
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const passages=story.blocks.flatMap((b,i)=>b.paragraphs.map((text,j)=>({text,id:`story-section-${i+1}-${j}`,source_ids:b.paragraph_source_ids[j]})));
const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const item=catalog.find(i=>i.id==='reading:stories/ghumura');
test('Ghumura exact narrative, complete notes and unique native returns',()=>{
 assert.equal(story.author,'Ahimanikya Satapathy');assert.match(html,/By Ahimanikya Satapathy/);
 assert.equal(passages.length,11);assert.equal(story.sources.length,5);
 for(const text of [story.title,story.lead,...passages.map(p=>p.text)])assert.ok(html.includes(esc(text)),text);
 assert.equal(new Set(story.sources.map(s=>s.id)).size,5);
 assert.deepEqual(new Set(passages.flatMap(p=>p.source_ids)),new Set(story.sources.map(s=>s.id)));
 for(const p of passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const source of story.sources){
  assert.equal(html.split(`id="note-${source.id}"`).length-1,1);
  const note=html.split(`id="note-${source.id}"`)[1].split('</li>')[0];
  const visible=decode(note.slice(note.indexOf('>')+1).split('<span class="footnote-returns"')[0].replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
  assert.equal(visible,source.footnote_text);
  for(const link of source.footnote_links)assert.ok(note.includes(`href="${esc(link.href)}"`));
 }
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const article=html.match(/<article\b[\s\S]*?<\/article>/)[0];assert.doesNotMatch(article,/<img\b|<audio\b/);
 const outside=article.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.ok(outside.includes('id="ghumura-further-reading"'));assert.ok(outside.includes('id="story-sources"'));
 for(const link of story.further_reading)assert.ok(article.includes(`href="${link.href}"`));
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending/);
});
test('Ghumura saved HTML and text contain all prose and complete qualified notes',()=>{
 assert.ok(item);assert.equal(item.author,story.author);assert.equal(item.summary,story.lead);assert.equal(item.href,route);
 const notes=story.sources.map(s=>s.footnote_text);
 assert.deepEqual(item.practical.flatMap(p=>p.paragraphs),[...passages.map(p=>p.text),...notes]);
 const plan={version:1,title:'Ghumura reading',items:[{id:item.id,day:1,notes:''}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const paragraph of [story.lead,...passages.map(p=>p.text),...notes]){assert.ok(book.includes(escapeHTML(paragraph)));assert.ok(text.includes(paragraph));}
 for(const source of story.sources)for(const link of source.footnote_links){assert.ok(book.includes(escapeHTML(new URL(link.href).href)));assert.ok(text.includes(new URL(link.href).href));}
 assert.ok(html.includes('data-save-journey="reading:stories/ghumura"'));
});
test('Ghumura keeps its existing route and held search decision',()=>{
 const coast=JSON.parse(read('editions/coast.json'));assert.equal(coast.routes.filter(r=>r===route).length,1);assert.equal(coast.journey_ids.filter(id=>id===item.id).length,1);
 assert.ok(read(dist+'/explore/index.html').includes(`href="${route}"`));
 const search=JSON.parse(read('editions/search-candidate.json'));assert.equal(search.pages.find(p=>p.route===route).decision,'hold');
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
