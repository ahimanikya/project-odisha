import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import nimuhiFootnoteHeading from '../tools/nimuhi-footnote-heading.mjs';
const html=readFileSync('dist-coast/stories/nimuhi-temple/index.html','utf8');
const article=html.match(/<article class="nimuhi-story"[\s\S]*?<\/article>/)[0];
const source=readFileSync('../../kb/research/culture/sashisena-and-nimuhi-temple.md','utf8');
const evidence=JSON.parse(readFileSync('../../kb/records/nimuhi-editorial-source-mapping-2026-10-17.json','utf8'));
test('reference article credits the author near its title without changing the research date',()=>{
 assert.equal((article.match(/By Ahimanikya Satapathy/g)||[]).length,1);
 assert.ok(article.indexOf('By Ahimanikya Satapathy')>article.indexOf('</h1>'));
 assert.ok(article.indexOf('By Ahimanikya Satapathy')<article.indexOf('In Sonepur, Odisha'));
 assert.match(article,/<time datetime="2026-10-14">14 October 2026<\/time>/);
 assert.ok(article.includes('I have carried the name Ahimanikya all my life.'));
 assert.equal((article.match(/class="kavya-excerpt"/g)||[]).length,6);
 assert.doesNotMatch(article,/prepared with AI|written with AI|Researched and written by/);
});
test('native notes have unique targets, passage returns and visible heading',()=>{
 const ids=[...article.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
 const refs=[...article.matchAll(/<a\b[^>]*\bdata-footnote-ref\b[^>]*>/g)].map(m=>m[0]);
 const returns=[...article.matchAll(/<a\b[^>]*\bdata-footnote-backref\b[^>]*>/g)].map(m=>m[0]);
 const expected=evidence.claim_source_mapping.reduce((n,p)=>n+p.source_ids.length,0);
 assert.equal(refs.length,expected);assert.equal(returns.length,expected);
 assert.equal((article.match(/<li id="user-content-fn-source-/g)||[]).length,20);
 for(const a of [...refs,...returns]) assert.ok(ids.includes(a.match(/href="#([^"]+)"/)[1]));
 assert.match(article,/<h2[^>]*id="footnote-label"[^>]*>Footnotes &amp; Sources<\/h2>/);
 assert.doesNotMatch(article,/<details[^>]*>[\s\S]*data-footnotes/);
 for(const n of evidence.original_source_notes) assert.ok(source.includes('[^'+n.id+']:'));
});
test('documentary images and source books retain bytes, provenance and qualifications',()=>{
 for(const a of evidence.assets) assert.equal(createHash('sha256').update(readFileSync('../../'+a.path)).digest('hex'),a.sha256);
 for(const text of ['Original signature retained.','Exact capture date unconfirmed.','photographer and date of exposure','By Pratapa Raya.','CC BY-SA 4.0','not handwritten manuscripts']) assert.ok(article.includes(text),text);
 for(const file of ['sashi-sena-prachi-samiti.pdf','kathalahari-sixth-edition-1927.pdf']) assert.ok(article.includes('/archive/'+file));
 for(const p of ['I.56','XI.13','VIII.5','VIII.9','X.58','X.81']) assert.ok(article.includes(p));
});
test('reference heading transform does not relabel other Markdown pages',()=>{
 assert.equal(nimuhiFootnoteHeading({fileURL:new URL('file:///culture/another.md')}),null);
 assert.equal(nimuhiFootnoteHeading({}),null);
});
