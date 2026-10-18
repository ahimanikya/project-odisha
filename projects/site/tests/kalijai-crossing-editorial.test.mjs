import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/visit/experiences/kalijai-crossing/index.html');
const e=JSON.parse(read('../../kb/research/destinations/kalijai-crossing-editorial.json'));
const r=JSON.parse(read('../../kb/research/destinations/details.json')).records.find(x=>x.kind==='experiences'&&x.slug==='kalijai-crossing');
test('Kalijai crossing distinguishes the authored account from chronology and links exact source returns',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);
 assert.match(page,/<section id="story-sources"/);
 assert.doesNotMatch(page,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 for(const p of e.passages)for(const id of p.source_ids){
  assert.equal(page.split(`id="ref-${p.id}-${id}"`).length-1,1);
  assert.equal(page.split(`href="#ref-${p.id}-${id}"`).length-1,1);
  assert.equal(page.split(`id="note-${id}"`).length-1,1);
 }
 assert.equal((page.match(/data-footnote-ref/g)||[]).length,2);
 for(const phrase of ['Janmejay Choudhury','Godabarish Mishra','not a dated record of a wreck','Begin with the return','Give the shrine its own time'])assert.ok(page.includes(phrase));
 assert.match(read('dist/visit/stays/rajhans-satapada/index.html'),/Drafted with AI assistance/);
 assert.match(page,/data-save-journey="experience:chilika-kalijai"/);
});
test('Kalijai crossing portable reading retains every paragraph and concise sources with original photograph credit',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'An island story',items:[{id:'experience:chilika-kalijai',day:1,notes:'Ask about the return crossing.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of r.sections)for(const p of [s.text,...s.paragraphs]){assert.ok(page.includes(escapeHTML(p)));assert.ok(book.includes(escapeHTML(p)));assert.ok(text.includes(p));}
 for(const s of e.sources)for(const output of [book,text]){assert.ok(output.includes(s.url));assert.ok(!output.includes(s.note));}
 assert.ok(text.includes('Ask about the return crossing.'));
 assert.match(page,/Aruni Nayak/);assert.match(page,/creativecommons.org\/licenses\/by-sa\/3.0/);
 assert.equal(createHash('sha256').update(readFileSync('public/images/destinations/kalijai.jpg')).digest('hex'),'db5b8c2c721ffeed52fdaf53eb7c54814727b845dc2be97c758f42a68a9ee031');
});
