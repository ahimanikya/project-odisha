import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const story=JSON.parse(read('../../../kb/research/culture/mahuri-website.json'));
const dossier=JSON.parse(read('../../../kb/research/sources/mahuri-research.json'));
const html=read('../dist-coast/stories/mahuri/index.html');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Mahuri publishes its canonical narrative and scoped source trail',()=>{
 assert.equal(story.canonical_kb_narrative,true);
 for(const b of story.blocks){for(const p of b.paragraphs)assert.ok(html.includes(escape(p)));for(const id of b.source_ids)assert.ok(story.sources.some(s=>s.id===id));}
 for(const s of story.sources){assert.ok(html.includes(escape(s.resource)));assert.ok(html.includes(escape(s.locator)));assert.ok(dossier.sources.some(d=>d.id===s.id&&d.resource===s.resource));}
 for(const phrase of ['double reed','metal bell','machine-translated','acquisition date does not date','do not establish the earliest Mahuri'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('<img src="/images/sounds/'));
});
test('Mahuri is reachable from collection and Explore while retaining editorial hold',()=>{
 for(const page of ['sounds-of-odisha','explore'])assert.ok(read('../dist-coast/'+page+'/index.html').includes('/stories/mahuri/'));
 for(const href of ['/sounds-of-odisha/','/sounds-of-odisha/sankha/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+href+'"'));
 const entries=JSON.parse(read('../../../kb/research/product/sounds-discovery.json')).entries.filter(e=>e.href==='/stories/mahuri/');assert.equal(entries.length,1);assert.deepEqual(entries[0].regions,['Kalahandi','Ganjam','Sambalpur']);
 assert.ok(JSON.parse(read('../../../kb/research/discovery-aliases.json')).entries['/stories/mahuri/'].includes('Muhuri'));
 assert.equal(JSON.parse(read('../../../kb/research/culture/sounds-website.json')).chapters.length,8);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
