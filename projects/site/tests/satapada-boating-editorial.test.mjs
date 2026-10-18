import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/visit/experiences/satapada-boating/index.html');
const e=JSON.parse(read('../../kb/research/destinations/satapada-boating-editorial.json'));
const r=JSON.parse(read('../../kb/research/destinations/details.json')).records.find(x=>x.kind==='experiences'&&x.slug==='satapada-boating');
test('Satapada boating explains limited sightings and historical boat practice and links exact source returns',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);
 assert.match(page,/<section id="story-sources"/);
 assert.doesNotMatch(page,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 for(const p of e.passages)for(const id of p.source_ids){
  assert.equal(page.split(`id="ref-${p.id}-${id}"`).length-1,1);
  assert.equal(page.split(`href="#ref-${p.id}-${id}"`).length-1,1);
  assert.equal(page.split(`id="note-${id}"`).length-1,1);
 }
 assert.equal((page.match(/data-footnote-ref/g)||[]).length,3);
 for(const phrase of ['In 2005','not proof of how a particular boat operates today','A glimpse may be all you see','does not identify a Satapada operator'])assert.ok(page.includes(phrase));
 assert.match(read('dist/visit/stays/konark/index.html'),/Drafted with AI assistance/);
 assert.match(page,/data-save-journey="experience:chilika-satapada"/);
});
test('Satapada boating portable reading retains every paragraph and concise sources with original photograph credit',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'An island story',items:[{id:'experience:chilika-satapada',day:1,notes:'Ask about the return crossing.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of r.sections)for(const p of [s.text,...s.paragraphs]){assert.ok(page.includes(escapeHTML(p)));assert.ok(book.includes(escapeHTML(p)));assert.ok(text.includes(p));}
 for(const s of e.sources)for(const output of [book,text]){assert.ok(output.includes(s.url));assert.ok(!output.includes(s.note));}
 assert.ok(text.includes('Ask about the return crossing.'));
 assert.match(page,/Hellohappy/);assert.match(page,/creativecommons.org\/licenses\/by-sa\/4.0/);
 assert.equal(createHash('sha256').update(readFileSync('public/images/chilika/chilika-lake-hellohappy.webp')).digest('hex'),'0c07d18090ac7a1d7fc4e9a61f16e8eed3633ac1db1c11d84ab2586b9d06543c');
});
