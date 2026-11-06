import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const reading=JSON.parse(read('src/data/dongria-book-reading.json'));
const articles=JSON.parse(read('src/data/dongariya.json'));
const book=JSON.parse(read('src/data/dongariya-book.json'));
const route=a=>`/stories/dongria/${a.routeSlug||a.slug}/`;
const page=read('dist/stories/dongria/book/index.html');
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
test('book companion preserves complete author opening, preface, closing and sixteen definitions',()=>{
 for(const key of ['author_note','preface','closing'])for(const p of reading[key].paragraphs)assert.ok(plain(page).includes(p.replace(/\s+/g,' ').trim()),p);
 assert.equal(reading.glossary.length,16);
 for(const e of reading.glossary){assert.ok(page.includes(e.source_url.replaceAll('&','&amp;'))||page.includes(e.source_url));assert.ok(plain(page).includes(e.definition));}
 assert.ok(page.includes(book.file));assert.ok(page.includes(String(book.pages)+' pages'));
 assert.ok(page.includes('I have not yet visited Niyamgiri.'));
 assert.ok(page.includes('translator unnamed'));
});
test('book sequence connects the full opening, twelve readings and closing essay',()=>{
 for(const a of articles)assert.ok(page.includes(`href="${route(a)}"`));
 const last=read('dist'+route(articles.at(-1))+'index.html');assert.ok(last.includes('/stories/dongria/book/#looking-again'));
 const first=read('dist'+route(articles[0])+'index.html');assert.ok(first.includes('/stories/dongria/book/#author-note'));
 for(const a of articles)assert.ok(read('dist'+route(a)+'index.html').includes('href="/stories/dongria/book/"'));
});
test('public book media use only approved plates and two contextual supplementary photographs',()=>{
 assert.deepEqual(reading.additional_photographs.map(x=>x.id),['commons-2','commons-4']);
 for(const p of reading.additional_photographs){assert.ok(page.includes(p.source_url));for(const v of p.variants)assert.ok(existsSync('public'+v.src));}
 for(const a of articles){assert.ok(a.image.startsWith('/assets/dongria-book/'));assert.ok(page.includes(a.title));assert.ok(a.book_credit);}
 assert.ok(reading.additional_photographs[0].caption.includes('preparing for a wedding'));
 assert.ok(page.includes('Amitt M Patell'));
 assert.ok(page.includes('Author portrait: supplied by Ahimanikya Satapathy.'));
 assert.doesNotMatch(page,/pari-|mongabay-|sahapedia-technique-|school-phulaki|AI-generated|AI-assisted/);
});
