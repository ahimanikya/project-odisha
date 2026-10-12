import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const story=JSON.parse(readFileSync(new URL('../../../kb/research/culture/pala-website.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist-coast/sounds-of-odisha/pala/index.html',import.meta.url),'utf8');
test('full Pala reader text and sources survive with collection return and honest limits',()=>{
 for(const block of story.blocks) for(const p of [...block.paragraphs,...block.items]) assert.ok(html.includes(p.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')),p);
 assert.ok(html.includes('href="/sounds-of-odisha/#pala"'));
 for(const s of story.sources)assert.ok(html.includes(s.resource));
 assert.ok(html.indexOf('A question: which poem')<html.indexOf('Confirm the actual occasion'));
 assert.ok(html.includes('CC BY-SA 3.0'));
 assert.ok(html.includes('Practitioner/Odia review remains open'));
 assert.ok(!html.includes('<audio'));
 assert.ok(!html.includes('Preserved research overview'));
 assert.ok(readFileSync(new URL('../dist-coast/sounds-of-odisha/index.html',import.meta.url),'utf8').includes('href="/sounds-of-odisha/pala/"'));
});
