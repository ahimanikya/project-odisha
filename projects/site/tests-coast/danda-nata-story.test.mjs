import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const story=JSON.parse(read('../../../kb/research/culture/danda-nata-website.json'));
const dossier=JSON.parse(read('../../../kb/research/sources/danda-nata-research.json'));
const html=read('../dist-coast/stories/danda-nata/index.html');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Danda Nata publishes its canonical narrative and scoped source trail',()=>{
 assert.equal(story.canonical_kb_narrative,true);
 for(const b of story.blocks){for(const p of b.paragraphs)assert.ok(html.includes(escape(p)));for(const id of b.source_ids)assert.ok(story.sources.some(s=>s.id===id));}
 for(const s of story.sources){assert.ok(html.includes(escape(s.resource)));assert.ok(html.includes(escape(s.locator)));assert.ok(dossier.sources.some(d=>d.id===s.id&&d.resource===s.resource));}
 for(const phrase of ['Dandua','Suanga and Leela','verified founding date','no recording has been auditioned'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('<img src="/images/sounds/'));
});
test('Danda Nata is reachable from collection and Explore while retaining editorial hold',()=>{
 for(const page of ['sounds-of-odisha','explore'])assert.ok(read('../dist-coast/'+page+'/index.html').includes('/stories/danda-nata/'));
 for(const href of ['/sounds-of-odisha/','/stories/mahuri/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+href+'"'));
 const entries=JSON.parse(read('../../../kb/research/product/sounds-discovery.json')).entries.filter(e=>e.href==='/stories/danda-nata/');assert.equal(entries.length,1);assert.deepEqual(entries[0].regions,['Ganjam']);
 assert.ok(JSON.parse(read('../../../kb/research/discovery-aliases.json')).entries['/stories/danda-nata/'].includes('Danda Nacha'));
 assert.equal(JSON.parse(read('../../../kb/research/culture/sounds-website.json')).chapters.length,8);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
