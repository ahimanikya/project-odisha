import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const story=JSON.parse(readFileSync(new URL('../../../kb/research/culture/craft-listening-website.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist-coast/stories/craft-listening/index.html',import.meta.url),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('craft-listening story delivers the complete KB narrative and evidence distinctions',()=>{
 const kb=readFileSync(new URL('../../../kb/research/culture/craft-listening.md',import.meta.url),'utf8').split('# Listening to craft through Kotpad\n')[1].split('[Continue with the Kotpad profile]')[0].trim();
 const paragraphs=kb.split(/\n\n/).filter(p=>!p.startsWith('## ')).map(p=>p.replace(/\[\^[^\]]+\]/g,'').replaceAll('*','').trim());
 assert.deepEqual(story.blocks.flatMap(b=>b.paragraphs),paragraphs);
 for(const p of paragraphs)assert.ok(html.includes(escape(p)),p);
 for(const s of story.sources)assert.ok(html.includes(escape(s.resource)));
 for(const x of ['2018','29 minutes','Gobardhan Panika','not an account of a workshop visited by Utkal Project'])assert.ok(html.includes(x));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('sounds-reading-trail'));
});
test('craft-listening further reading connects the collection and notebook without expanding the eight-chapter trail',()=>{
 for(const route of ['/sounds-of-odisha/','/knowledge/kotpad/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+route+'"'));
 const collection=readFileSync(new URL('../dist-coast/sounds-of-odisha/index.html',import.meta.url),'utf8');
 assert.ok(collection.includes('href="/stories/craft-listening/"'));
 const chapters=JSON.parse(readFileSync(new URL('../../../kb/research/culture/sounds-website.json',import.meta.url),'utf8')).chapters;
 assert.equal(chapters.length,8);assert.ok(!chapters.some(c=>c.id==='craft-listening'));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
