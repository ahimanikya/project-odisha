import {createHash} from 'node:crypto';
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
test('public book media use only approved plates and one contextual supplementary photograph and relocated wedding portrait',()=>{
 assert.deepEqual(reading.additional_photographs.map(x=>x.id),['commons-4']);
 for(const p of reading.additional_photographs){assert.ok(page.includes(p.source_url));for(const v of p.variants)assert.ok(existsSync('public'+v.src));}
 for(const a of articles){assert.ok(a.image.startsWith('/assets/dongria-book/'));assert.ok(page.includes(a.title));assert.ok(a.book_credit);}
 const ornament=articles.find(a=>a.slug==='ornaments-in-use');assert.ok(ornament.caption.includes('preparing for a wedding'));assert.ok(ornament.creator==='Shubhamkindia');
 assert.ok(!read('dist/stories/dongria/dongria-life/index.html').includes('20261107-commons-2'));
 assert.ok(read('dist/stories/dongria/ornaments-in-use/index.html').includes('File:Dangaria_accessory_detail_01.jpg'));
 assert.ok(page.includes('Natural Earth'));assert.ok(page.includes('odisha-outline-title'));
 assert.ok(page.includes('Amitt M Patell'));
 assert.ok(page.includes('Author portrait: supplied by Ahimanikya Satapathy.'));
 assert.doesNotMatch(page,/pari-|mongabay-|sahapedia-technique-|school-phulaki|AI-generated|AI-assisted/);
});


test('Dongria PDF is an exact same-origin document linked from both book entrances',()=>{
 assert.equal(book.file,'/archive/dongria-kondh-public-reading.pdf');
 const scope=JSON.parse(read('editions/coast.json'));assert.ok(scope.documents.includes(book.file));
 for(const root of ['public','dist']){const bytes=readFileSync(root+book.file);assert.equal(bytes.length,book.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),book.sha256);}
 for(const route of ['dist/stories/dongria/index.html','dist/stories/dongria/book/index.html'])assert.ok(read(route).includes(`href="${book.file}"`));
 assert.ok(page.includes('A shawl bought at a dinner party with friends'));assert.ok(!page.includes('supper club'));
});
