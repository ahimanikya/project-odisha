import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/visit/stays/bhubaneswar/index.html');
const e=JSON.parse(read('../../kb/research/destinations/bhubaneswar-stay-editorial.json'));
const r=JSON.parse(read('../../kb/research/destinations/central-details.json')).records.find(x=>x.slug==='bhubaneswar'&&x.kind==='stays');
test('Bhubaneswar stay guide separates sourced city context from practical comparisons and retains exact source return',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);assert.match(page,/<section id="story-sources"/);
 assert.doesNotMatch(page,/Drafted with AI assistance|human editorial review pending/);
 for(const p of e.passages)for(const id of p.source_ids)for(const v of [`id="ref-${p.id}-${id}"`,`href="#ref-${p.id}-${id}"`,`id="note-${id}"`])assert.equal(page.split(v).length-1,1);
 assert.equal((page.match(/ data-footnote-ref /g)||[]).length,1);
 for(const phrase of ['after midnight','not a verified travel time','No named property has been inspected','not an accommodation'])assert.ok(page.includes(phrase));
 assert.match(read('dist/visit/stays/cuttack/index.html'),/Drafted with AI assistance/);
});
test('Bhubaneswar stay reading exports every comparison and room question with concise sources and preserved image rights',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.href==='/visit/stays/bhubaneswar/');assert.ok(item);
 const plan={version:1,title:'City base',items:[{id:item.id,day:1,notes:'Ask about arrival after midnight.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of r.sections)for(const p of [s.text,...s.paragraphs,...(s.options||[]).flatMap(o=>[o.fit,o.transport,o.check])]){assert.ok(page.includes(escapeHTML(p)));assert.ok(book.includes(escapeHTML(p)));assert.ok(text.includes(p));}
 for(const s of e.sources)for(const output of [book,text]){assert.ok(output.includes(s.url));assert.ok(!output.includes(s.note));}
 assert.ok(text.includes('Ask about arrival after midnight.'));
 const a=JSON.parse(read('../../kb/research/destinations/regions.json')).assets.mukteswar;
 for(const value of [a.creator,a.license_url])assert.ok(page.includes(value));
 assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);
});
