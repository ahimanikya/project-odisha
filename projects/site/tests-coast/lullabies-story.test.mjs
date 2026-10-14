import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const story=JSON.parse(readFileSync(new URL('../../../kb/research/culture/odia-lullabies-website.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist-coast/stories/odia-lullabies/index.html',import.meta.url),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('lullaby story delivers the complete KB narrative and evidence distinctions',()=>{
 const kb=readFileSync(new URL('../../../kb/research/culture/odia-lullabies.md',import.meta.url),'utf8').split('# Odia lullabies and the songs of childhood\n')[1].split('[Continue with Huluhuli]')[0].trim();
 const paragraphs=kb.split(/\n\n/).filter(p=>!p.startsWith('## ')).map(p=>p.replace(/\[\^[^\]]+\]/g,'').replaceAll('*','').trim());
 assert.deepEqual(story.blocks.flatMap(b=>b.paragraphs),paragraphs);
 for(const p of paragraphs)assert.ok(html.includes(escape(p)),p);
 for(const s of story.sources)assert.ok(html.includes(escape(s.resource)));
 for(const x of ['1955','1934','not the beginning of Odia lullabies','not an interview conducted by Project Odisha'])assert.ok(html.includes(x));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('sounds-reading-trail'));
});
test('lullaby further reading connects the collection and notebook without expanding the eight-chapter trail',()=>{
 for(const route of ['/sounds-of-odisha/','/sounds-of-odisha/huluhuli/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+route+'"'));
 const collection=readFileSync(new URL('../dist-coast/sounds-of-odisha/index.html',import.meta.url),'utf8');
 assert.ok(collection.includes('href="/stories/odia-lullabies/"'));
 const chapters=JSON.parse(readFileSync(new URL('../../../kb/research/culture/sounds-website.json',import.meta.url),'utf8')).chapters;
 assert.equal(chapters.length,8);assert.ok(!chapters.some(c=>c.id==='odia-lullabies'));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
