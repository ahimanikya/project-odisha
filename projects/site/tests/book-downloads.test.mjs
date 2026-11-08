import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Default: test the full build. Run explicitly with BOOK_DOWNLOAD_STAGE=source
// before building, or dist-coast/dist-publish after the corresponding pipeline stage.
const stage=process.env.BOOK_DOWNLOAD_STAGE||'dist';
assert.ok(['source','dist','dist-coast','dist-publish'].includes(stage),'Unknown BOOK_DOWNLOAD_STAGE');
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const expected=[
 {edition:'digital',file:'/archive/odia-cinema-a-living-screen-2026-11-08-daman-team.pdf',bytes:38850788,pages:272,sha256:'750a3202714846dae6340aeda8c0e82cbb0719e8b0fa40600a3183cfe7b6efc8'},
 {edition:'print',file:'/archive/odia-cinema-a-living-screen-print-2026-11-08-daman-team.pdf',bytes:51419386,pages:278,sha256:'4f6e677ec6c9604ba69c5bac36b99551b5f948e47f3c7c692c29f64d2e9130c4'},
 {edition:'introduction',file:'/archive/the-question-that-brought-me-here-2026-11-06.pdf',bytes:992878,pages:6,sha256:'8c5db39b9ee5fc262409c8636ca5abdb624774347c67e728a4fedc199934a933'},
];
function verify(root,book){
 const bytes=readFileSync(root+book.file);
 assert.equal(bytes.length,book.bytes,`${root}${book.file}: byte length`);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),book.sha256,`${root}${book.file}: reviewed SHA-256`);
}
test('three current Cinema download originals exactly match the reviewed edition',()=>{
 for(const book of expected)verify('public',book);
});
test('current Cinema descriptors use direct documents without changing edition identity',()=>{
 const cinema=json('src/data/cinema.json');
 const scope=json('editions/coast.json');
 for(const book of expected){
  const actual=book.edition==='introduction'?cinema.standalone_intro:cinema.review_books.find(x=>x.edition===book.edition);
  assert.ok(actual,book.edition);
  for(const key of ['file','bytes','pages','sha256'])assert.equal(actual[key],book[key],`${book.edition}: ${key}`);
  assert.ok(scope.documents.includes(book.file),`${book.file} declared for Coast retention`);
 }
});
test(`built Cinema downloads remain exact and linked (${stage})`,{skip:stage==='source'?'Source-only stage explicitly requested; run again after building.':false},()=>{
 const html=readFileSync(`${stage}/cinema/book/index.html`,'utf8');
 for(const book of expected){
  verify(stage,book);
  assert.ok(html.includes(`href="${book.file}"`),`${book.edition}: same-origin book link`);
 }
});
