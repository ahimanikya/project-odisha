import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/stories/kandhamal-haladi.json'));
const dist=import.meta.url.includes('/tests-coast/')?'dist-coast':'dist';
const route='/stories/kandhamal-haladi/';
const raw=read(dist+route+'index.html');
const html=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const passages=story.sections.flatMap(s=>s.paragraphs.map((p,i)=>({...p,id:`${s.id}-${i}`})));
const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const item=catalog.find(i=>i.id==='reading:stories/kandhamal-haladi');
test('Kandhamal Haladi retains complete dated prose and exact-return source notes',()=>{
 assert.equal(story.author,'Ahimanikya Satapathy');assert.match(html,/By Ahimanikya Satapathy/);
 assert.equal(passages.length,7);assert.equal(story.sources.length,3);
 for(const text of [story.title,story.lead,...passages.map(p=>p.text)])assert.ok(html.includes(esc(text)),text);
 assert.equal(new Set(story.sources.map(s=>s.id)).size,3);
 assert.deepEqual(new Set(passages.flatMap(p=>p.source_ids)),new Set(story.sources.map(s=>s.id)));
 for(const p of passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const source of story.sources){assert.equal(html.split(`id="note-${source.id}"`).length-1,1);assert.ok(html.includes(esc(source.note)));assert.ok(html.includes(esc(source.url)));}
 assert.doesNotMatch(html,/<h[1-6][^>]*>\s*<\/h[1-6]>/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const article=html.match(/<article\b[\s\S]*?<\/article>/)[0];assert.doesNotMatch(article,/<img\b/);
 const outside=article.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.ok(outside.includes('id="kandhamal-haladi-further-reading"'));assert.ok(outside.includes('id="story-sources"'));
 assert.ok(article.includes('kandhamal-haladi-further-reading'));assert.match(article,/GitHub submissions are public; omit private contact details and consent documents/);
 for(const link of story.further_reading)assert.ok(article.includes(`href="${link.href}"`));
});
test('Kandhamal Haladi saved HTML and text retain all paragraphs and substantive source qualifications',()=>{
 assert.ok(item);assert.equal(item.author,story.author);assert.equal(item.summary,story.lead);assert.equal(item.href,route);
 const notes=story.sources.map(s=>s.title+'. '+s.note);
 assert.deepEqual(item.practical.flatMap(p=>p.paragraphs),[...passages.map(p=>p.text),...notes]);
 assert.ok(item.practical.every(p=>p.heading.trim()));
 const plan={version:1,title:'Kandhamal Haladi reading',items:[{id:item.id,day:1,notes:''}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const paragraph of [story.lead,...passages.map(p=>p.text),...notes]){assert.ok(book.includes(escapeHTML(paragraph)));assert.ok(text.includes(paragraph));}
 for(const source of story.sources){assert.ok(book.includes(escapeHTML(new URL(source.url).href)));assert.ok(text.includes(new URL(source.url).href));}
 assert.ok(html.includes('data-save-journey="reading:stories/kandhamal-haladi"'));
});
test('Kandhamal Haladi discovery and edition additions preserve search hold',()=>{
 const coast=JSON.parse(read('editions/coast.json'));assert.ok(coast.routes.includes(route));
 assert.ok(read(dist+'/explore/index.html').includes(`href="${route}"`));
 const search=JSON.parse(read('editions/search-candidate.json'));assert.equal(search.pages.find(p=>p.route===route).decision,'hold');
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending/);
});
