import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/visit/stays/rajhans-satapada/index.html');
const e=JSON.parse(read('../../kb/research/destinations/rajhans-satapada-editorial.json'));
const r=JSON.parse(read('../../kb/research/destinations/details.json')).records.find(x=>x.kind==='stays'&&x.slug==='rajhans-satapada');
test('Rajhans and Satapada stay distinguishes published property leads from verified rooms and links both passages to visible notes',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);assert.match(page,/<section id="story-sources"/);
 assert.doesNotMatch(page,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 for(const p of e.passages)for(const id of p.source_ids){
  assert.equal(page.split(`id="ref-${p.id}-${id}"`).length-1,1);
  assert.equal(page.split(`href="#ref-${p.id}-${id}"`).length-1,1);
  assert.equal(page.split(`id="note-${id}"`).length-1,1);
 }
 assert.equal((page.match(/data-footnote-ref/g)||[]).length,3);
 for(const phrase of ['limited once on the island','has not inspected its rooms','confirmed transfer booking','does not show Rajhans Nature Camp'])assert.ok(page.includes(phrase));
 assert.ok(!page.split('<section id="story-sources"')[1].split('</section>')[0].includes('chilika-nature-camps.html'));
 assert.doesNotMatch(read('dist/visit/stays/konark/index.html'),/Drafted with AI assistance/);
 assert.match(page,/data-save-journey="base:chilika-rajhans"/);
});
test('Rajhans and Satapada stay portable reading keeps all planning paragraphs and concise sources with photograph provenance',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'Rajhans stay',items:[{id:'base:chilika-rajhans',day:1,notes:'Check the room and meeting point.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of r.sections)for(const p of [s.text,...s.paragraphs]){assert.ok(page.includes(escapeHTML(p)));assert.ok(book.includes(escapeHTML(p)));assert.ok(text.includes(p));}
 for(const s of e.sources)for(const output of [book,text]){assert.ok(output.includes(s.url));assert.ok(!output.includes(s.note));}
 assert.ok(text.includes('Check the room and meeting point.'));
 assert.match(page,/Hellohappy/);assert.match(page,/creativecommons.org\/licenses\/by-sa\/4.0/);
 assert.equal(createHash('sha256').update(readFileSync('public/images/chilika/chilika-lake-hellohappy.webp')).digest('hex'),'0c07d18090ac7a1d7fc4e9a61f16e8eed3633ac1db1c11d84ab2586b9d06543c');
});
