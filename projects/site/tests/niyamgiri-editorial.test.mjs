import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/economy/niyamgiri-editorial.json'));
const dist=process.env.NIYAMGIRI_TEST_DIST||'dist';
const route='/reading-room/economy/niyamgiri-rights-and-mining/';
const html=read(dist+route+'index.html').replaceAll('&#39;',"'");
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const passages=story.sections.flatMap(b=>b.paragraphs.map((p,j)=>({...p,id:`${b.id}-${j}`})));
const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const item=catalog.find(i=>i.id==='reading:reading-room/economy/niyamgiri-rights-and-mining');
test('Niyamgiri exact narrative, complete notes and unique native returns',()=>{
 assert.equal(story.author,'Ahimanikya Satapathy');assert.match(html,/By Ahimanikya Satapathy/);
 assert.equal(passages.length,8);assert.equal(story.sources.length,4);
 for(const text of [story.title,...passages.map(p=>p.text)])assert.ok(html.includes(esc(text)),text);
 assert.equal(new Set(story.sources.map(s=>s.id)).size,4);
 assert.deepEqual(new Set(passages.flatMap(p=>p.source_ids)),new Set(story.sources.map(s=>s.id)));
 for(const p of passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const source of story.sources){
  assert.equal(html.split(`id="note-${source.id}"`).length-1,1);
  const note=html.split(`id="note-${source.id}"`)[1].split('</li>')[0];
  const visible=decode(note.slice(note.indexOf('>')+1).split('<span class="footnote-returns"')[0].replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
  assert.equal(visible,source.footnote_text);
  assert.ok(note.includes(`href="${esc(source.url)}"`));
 }
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const article=html.match(/<article\b[\s\S]*?<\/article>/)[0];assert.doesNotMatch(article,/<img\b|<audio\b/);
 const outside=article.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.ok(outside.includes('id="niyamgiri-further-reading"'));assert.ok(outside.includes('id="story-sources"'));
 for(const link of story.further_reading)assert.ok(article.includes(`href="${link.href}"`));
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending/);
});
test('Niyamgiri saved HTML and text contain exact prose and concise source titles and links',()=>{
 assert.ok(item);assert.equal(item.author,story.author);assert.equal(item.summary,passages[0].text);assert.equal(item.href,route);
 const notes=story.sources.map(s=>s.footnote_text);
 assert.deepEqual([item.summary,...item.practical.flatMap(p=>p.paragraphs)],passages.map(p=>p.text));
 const plan={version:1,title:'Niyamgiri reading',items:[{id:item.id,day:1,notes:''}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const paragraph of passages.map(p=>p.text)){assert.ok(book.includes(escapeHTML(paragraph)));assert.ok(text.includes(paragraph));}
 for(const source of story.sources){assert.ok(book.includes(escapeHTML(new URL(source.url).href)));assert.ok(text.includes(new URL(source.url).href));assert.ok(!book.includes(escapeHTML(source.footnote_text)));assert.ok(!text.includes(source.footnote_text));}
 assert.equal(book.split(escapeHTML(passages[0].text)).length-1,1);assert.equal(text.split(passages[0].text).length-1,1);
 assert.ok(html.includes('data-save-journey="reading:reading-room/economy/niyamgiri-rights-and-mining"'));
});
test('Niyamgiri keeps its existing route and held search decision',()=>{
 const coast=JSON.parse(read('editions/coast.json'));assert.equal(coast.routes.filter(r=>r===route).length,1);assert.equal(coast.journey_ids.filter(id=>id===item.id).length,1);
 assert.ok(read(dist+'/reading-room/index.html').includes(`href="${route}"`));
 const search=JSON.parse(read('editions/search-candidate.json'));assert.equal(search.pages.find(p=>p.route===route).decision,'hold');
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
