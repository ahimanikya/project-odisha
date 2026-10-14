import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const story=JSON.parse(read('../../../kb/research/culture/chilika-listening-website.json'));
const html=read('../dist-coast/stories/chilika-listening/index.html');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Chilika listening publishes the complete narrative with the source and observation boundaries',()=>{
 const body=read('../../../kb/research/culture/chilika-listening.md').split('# Listening to Chilika\n')[1].split('[Continue with the Chilika guide]')[0].trim();
 const paragraphs=body.split(/\n\n/).filter(p=>!p.startsWith('## '));
 assert.deepEqual(story.blocks.flatMap(b=>b.paragraphs),paragraphs);
 for(const p of paragraphs)assert.ok(html.includes(escape(p)),p);
 for(const s of story.sources){assert.ok(html.includes(escape(s.resource)));assert.ok(html.includes(escape(s.locator)));}
 for(const phrase of ['keep bird-call playback off','not a survey of the wetland','local site rules still govern'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('sounds-reading-trail'));
});
test('Chilika further reading connects destination and notebook without changing the chapter trail',()=>{
 for(const route of ['/sounds-of-odisha/','/knowledge/chilika/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+route+'"'));
 assert.ok(read('../dist-coast/sounds-of-odisha/index.html').includes('href="/stories/chilika-listening/"'));
 assert.equal(JSON.parse(read('../../../kb/research/culture/sounds-website.json')).chapters.length,8);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
