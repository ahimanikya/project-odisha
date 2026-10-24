import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {multilingualTotals,count,percent} from '../src/lib/language-atlas.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/voices/multilingual-editorial.json'));
const atlas=JSON.parse(read('../../kb/research/voices/population-2011.json'));
const route='/languages/multilingual-odisha/';
const html=read('dist-coast'+route+'index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const passages=story.sections.flatMap(s=>s.paragraphs.map((p,i)=>({...p,id:`${s.id}-${i}`})));
test('multilingual article renders complete canonical prose and precise visible source returns',()=>{
 assert.match(html,/By Ahimanikya Satapathy/);assert.ok(html.includes(esc(story.lead)));assert.ok(story.description.length<=250);
 assert.ok(html.includes(`name="description" content="${esc(story.description)}"`));
 for(const p of passages){assert.ok(html.includes(esc(p.text)));for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}}
 for(const s of story.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(esc(s.note)));assert.ok(html.includes(esc(s.url)));}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);assert.match(outside,/id="further-reading"/);
 for(const path of ['/languages/','/languages/atlas/','/languages/districts/'])assert.ok(outside.includes(`href="${path}"`));
 assert.match(outside,/Suggest an update/);assert.match(outside,/GitHub submissions are public/);assert.match(html,/noindex, nofollow/);
});
test('multilingual chart reconciles canonical text to source totals without overlap or color dependence',()=>{
 const t=multilingualTotals(atlas);assert.equal(story.chart_text.denominator,t.population);
 assert.deepEqual(story.chart_text.segments.map(s=>s.value),[t.noAdditionalReported,t.exactlyTwoReported,t.three]);
 assert.equal(story.chart_text.segments.reduce((sum,s)=>sum+s.value,0),t.population);
 for(const s of story.chart_text.segments){assert.ok(html.includes(s.label));assert.ok(html.includes(count(s.value)));assert.ok(html.includes(percent(s.value,t.population)));}
 assert.ok(html.includes(count(t.atLeastTwo)));assert.ok(html.includes(count(t.population)));assert.ok(html.includes(esc(story.chart_text.note)));
 assert.match(html,/aria-hidden="true"/);assert.match(html,/No additional language reported/);
});
test('multilingual portable reading retains every paragraph, chart values and concise source links',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='reading:languages/multilingual-odisha');assert.ok(item);assert.equal(item.author,story.author);assert.equal(item.summary,story.lead);assert.equal(item.checked,story.checked_on);
 assert.deepEqual(item.sources,story.sources.map(({title,url})=>({title,url})));
 for(const section of story.sections)assert.deepEqual(item.practical.find(p=>p.heading===section.title).paragraphs,section.paragraphs.map(p=>p.text));
 const plan={version:1,title:'Multilingual reading',items:[{id:item.id,day:1,notes:'Read the Census carefully.'}]};const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const p of passages){assert.ok(book.includes(`<p>${escapeHTML(p.text)}</p>`));assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By '+story.author));assert.ok(output.includes(count(story.chart_text.denominator)));for(const segment of story.chart_text.segments){assert.ok(output.includes(segment.label));assert.ok(output.includes(count(segment.value)));}for(const source of story.sources)assert.ok(!output.includes(source.note));}
 for(const source of story.sources){assert.ok(book.includes(escapeHTML(new URL(source.url).href)));assert.ok(text.includes(new URL(source.url).href));}
 assert.match(html,/data-save-journey="reading:languages\/multilingual-odisha"/);
});
