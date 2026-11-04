import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/stories/odia-literature-preservation.json'));
const dist=process.env.PRESERVATION_TEST_DIST||'dist';
const html=read(dist+story.route+'index.html');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const visible=s=>decode(s.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g,'').replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
const paragraphs=story.sections.flatMap(s=>s.paragraphs.map((p,i)=>({...p,id:`${s.id}-${i}`})));
const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const item=catalog.find(i=>i.id==='reading:stories/odia-literature-preservation');
test('preservation article exact reviewed paragraphs, complete notes and native returns',()=>{
 assert.equal(paragraphs.length,21);assert.equal(story.sources.length,10);
 const rendered=[...html.matchAll(/<p\b[^>]*data-source-ids(?:="[^"]*")?[^>]*>([\s\S]*?)<\/p>/g)].map(m=>visible(m[1]));
 assert.deepEqual(rendered,paragraphs.map(p=>p.text));
 let markers=0;
 for(const p of paragraphs)for(const id of p.source_ids){markers++;assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 assert.equal(markers,11);
 for(const source of story.sources){
  assert.equal(html.split(`id="note-${source.id}"`).length-1,1);
  const note=html.split(`id="note-${source.id}"`)[1].split('</li>')[0];
  assert.equal(visible(note.slice(note.indexOf('>')+1).split('<span class="footnote-returns"')[0]),source.footnote_text);
  for(const link of source.footnote_links)assert.ok(decode(note).includes(`href="${link.href}"`));
 }
 assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.match(html,/By Ahimanikya Satapathy/);
 for(const link of [...story.further_reading,story.continue_reading,story.collection_return])assert.ok(html.includes(`href="${link.href}"`));
});
test('portable article contains opening once, remaining twenty paragraphs and twelve short sources',()=>{
 assert.ok(item);assert.equal(item.summary,paragraphs[0].text);assert.deepEqual(item.practical.flatMap(p=>p.paragraphs),paragraphs.slice(1).map(p=>p.text));
 assert.deepEqual(item.sources,story.sources.flatMap(s=>s.footnote_links.map(l=>({title:l.text,url:l.href}))));assert.equal(item.sources.length,12);
 const plan={version:1,title:'Odia literature reading',items:[{id:item.id,day:1,notes:''}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const p of paragraphs){assert.ok(book.includes(escapeHTML(p.text)));assert.ok(text.includes(p.text));}
 for(const source of item.sources){assert.ok(book.includes(escapeHTML(new URL(source.url).href)));assert.ok(text.includes(new URL(source.url).href));}
 assert.ok(html.includes(`data-save-journey="${item.id}"`));
});
test('article is discoverable, edition included and held outside search shortlist',()=>{
 const coast=JSON.parse(read('editions/coast.json'));assert.equal(coast.routes.filter(r=>r===story.route).length,1);assert.equal(coast.journey_ids.filter(id=>id===item.id).length,1);
 assert.ok(read(dist+'/explore/index.html').includes(`href="${story.route}"`));
 const search=JSON.parse(read('editions/search-candidate.json'));assert.equal(search.pages.find(p=>p.route===story.route).decision,'hold');
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
