import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/food/bhubaneswar/index.html');
const g=JSON.parse(read('../../kb/research/food/bhubaneswar.json'));
const e=JSON.parse(read('../../kb/research/food/bhubaneswar-editorial.json'));
test('Bhubaneswar meal connects kitchen methods and dated local testimony with exact visible references',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);assert.match(page,/<section id="story-sources"/);
 assert.doesNotMatch(page,/Prepared with AI assistance|human editorial review pending/);
 for(const p of e.passages)for(const id of p.source_ids)for(const value of [`id="ref-${p.id}-${id}"`,`href="#ref-${p.id}-${id}"`,`id="note-${id}"`])assert.equal(page.split(value).length-1,1);
 assert.equal((page.match(/ data-footnote-ref /g)||[]).length,6);assert.equal((page.match(/ data-footnote-backref /g)||[]).length,6);
 for(const phrase of ['separate tempering','Trinath Badu','Subash Sahu','2016 report','not an independently established invention date'])assert.ok(page.includes(phrase));
 assert.match(read('dist/food/cuttack/index.html'),/Prepared with AI assistance/);
 assert.match(page,/story-contents-mobile/);
});
test('Saved dalma retains the complete city meal context, concise source links and original photo rights',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'Bhubaneswar meal',items:[{id:'food:bhubaneswar-dalma',day:1,notes:'Ask about the finishing spices.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of g.sections)for(const p of [s.text,...s.paragraphs])for(const out of [page,book])assert.ok(out.includes(escapeHTML(p)),p);
 for(const s of g.sections)for(const p of [s.text,...s.paragraphs])assert.ok(text.includes(p));
 for(const s of e.sources)for(const out of [book,text]){assert.ok(out.includes(s.url));assert.ok(!out.includes(s.note));}
 assert.ok(text.includes('Ask about the finishing spices.'));
 const a=JSON.parse(read('../../kb/research/food/collection.json')).assets['chhena-poda'];assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);
 for(const s of [a.creator,a.license_url,'photographed in Puri'])assert.ok(page.includes(s));
});
