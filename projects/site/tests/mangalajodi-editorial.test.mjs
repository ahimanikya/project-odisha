import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/visit/places/mangalajodi/index.html');
const editorial=JSON.parse(read('../../kb/research/destinations/mangalajodi-editorial.json'));
const copy=JSON.parse(read('../../kb/research/destinations/details.json')).records.find(r=>r.slug==='mangalajodi'&&r.kind==='places');
test('Mangalajodi has visible sources and exact returns without assigning the unreviewed stay guide a byline',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);
 assert.doesNotMatch(page,/Drafted with AI assistance|human editorial review pending|id="current-arrangements"/);
 assert.match(page,/<section id="story-sources"/);
 for(const p of editorial.passages)for(const id of p.source_ids){
  assert.ok(page.includes(`id="ref-${p.id}-${id}"`));
  assert.ok(page.includes(`href="#ref-${p.id}-${id}"`));
  assert.ok(page.includes(`id="note-${id}"`));
 }
 assert.equal((page.match(/data-footnote-ref/g)||[]).length,6);
 assert.equal((page.match(/data-footnote-backref/g)||[]).length,6);
 for(const route of ['stays/konark']){
  const other=read(`dist/visit/${route}/index.html`);
  assert.doesNotMatch(other,/By Ahimanikya Satapathy/);
  assert.doesNotMatch(other,/Drafted with AI assistance/);
 }
});
test('saved Mangalajodi carries the complete reading and concise sources into both formats',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'Wetland reading',items:[{id:'place:mangalajodi',day:1,notes:'Ask about bird monitoring.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of copy.sections)for(const p of [s.text,...s.paragraphs]){
  assert.ok(page.includes(escapeHTML(p)));assert.ok(book.includes(escapeHTML(p)));assert.ok(text.includes(p));
 }
 for(const s of editorial.sources){for(const output of [book,text]){assert.ok(output.includes(s.url));assert.ok(!output.includes(s.note));}}
 assert.ok(text.includes('Ask about bird monitoring.'));
 assert.match(page,/Mamta Parmar/);assert.match(page,/creativecommons.org\/licenses\/by-sa\/4.0/);
 assert.equal(createHash('sha256').update(readFileSync('public/images/destinations/mangalajodi.webp')).digest('hex'),'a07dc76946d677bbdef4982bc1e4270c54e570b0685498acaab40d235eb17bfd');
});
