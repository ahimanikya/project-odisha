import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const story=JSON.parse(read('../../../kb/research/culture/ranapa-website.json'));
const dossier=JSON.parse(read('../../../kb/research/sources/ranapa-research.json'));
const html=read('../dist-coast/stories/ranapa/index.html');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Ranapa publishes its canonical narrative and scoped source trail',()=>{
 assert.equal(story.canonical_kb_narrative,true);
 for(const b of story.blocks){for(const p of b.paragraphs)assert.ok(html.includes(escape(p)));for(const id of b.source_ids)assert.ok(story.sources.some(s=>s.id===id));}
 for(const s of story.sources){assert.ok(html.includes(escape(s.resource)));assert.ok(html.includes(escape(s.locator)));assert.ok(dossier.sources.some(d=>d.id===s.id&&d.resource===s.resource));}
 for(const phrase of ['Bajeni','no separate percussion accompaniment','15 December 2016','cannot simply be assigned to Ranapa','where the beat comes from'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('<img src="/images/sounds/'));
});
test('Ranapa is reachable from collection and Explore while retaining editorial hold',()=>{
 for(const page of ['sounds-of-odisha','explore'])assert.ok(read('../dist-coast/'+page+'/index.html').includes('/stories/ranapa/'));
 for(const href of ['/sounds-of-odisha/','/sounds-of-odisha/sankha/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+href+'"'));
 const entries=JSON.parse(read('../../../kb/research/product/sounds-discovery.json')).entries.filter(e=>e.href==='/stories/ranapa/');assert.equal(entries.length,1);assert.deepEqual(entries[0].regions,['Ganjam']);
 assert.ok(JSON.parse(read('../../../kb/research/discovery-aliases.json')).entries['/stories/ranapa/'].includes('Ranappa'));
 assert.equal(JSON.parse(read('../../../kb/research/culture/sounds-website.json')).chapters.length,8);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
