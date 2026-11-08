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
 {edition:'digital',file:'/archive/odia-cinema-a-living-screen-2026-11-08-school-audience.pdf',bytes:38852518,pages:272,sha256:'f50741862ebf2d250188be335a41e7816429ccd17531b2cb3bf952bccb25a80d'},
 {edition:'print',file:'/archive/odia-cinema-a-living-screen-print-2026-11-08-school-audience.pdf',bytes:51785133,pages:278,sha256:'79aa3dbaa2c2c04ae116d225e0d00af257b4392506bb860f0ee300488743e391'},
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

const characterManifest=json('../characters/release-assets.json');
const characterPDFs=characterManifest.assets.filter(a=>a.source.endsWith('.pdf'));
const characterPages=['gudul-gudli.html','nilu-chaiti.html','index.html','design-path.html','complete-report.html'];
const characterURL=a=>'/'+a.source.replace(/^public\//,'');
test('six character PDFs retain release identity and direct links; other archives remain remote',()=>{
 assert.equal(characterPDFs.length,6);
 const scope=json('editions/coast.json');
 const pages=characterPages.map(p=>readFileSync('public/characters/'+p,'utf8'));
 let references=0;
 for(const a of characterPDFs){
  const file=characterURL(a);verify('public',{...a,file});
  assert.ok(scope.downloads.includes(file),file+' retention');
  const count=pages.reduce((n,h)=>n+h.split(`href="${file}"`).length-1,0);
  assert.ok(count>0,file+' direct reference');references+=count;
  for(const h of pages)assert.ok(!h.includes(a.destination),file+' no release-only PDF link');
 }
 assert.equal(references,13);
 for(const a of characterManifest.assets.filter(a=>!a.source.endsWith('.pdf'))){
  const local=characterURL(a);
  for(const h of pages)assert.ok(!h.includes(`href="${local}"`),local+' remains release-hosted');
 }
});
test(`character PDFs are retained byte-exact with direct built links (${stage})`,{skip:stage==='source'},()=>{
 const html=characterPages.map(p=>readFileSync(stage+'/characters/'+p,'utf8')).join('\n');
 for(const a of characterPDFs){const file=characterURL(a);verify(stage,{...a,file});assert.ok(html.includes(`href="${file}"`));assert.ok(!html.includes(a.destination));}
});
test('Dhaga adapter preserves the pinned descriptor and validates bytes before direct delivery',async()=>{
 const d=json('../odia-dhaga/pdf-delivery.json');
 const {validatePdfDelivery}=await import('../tools/export-dhaga.mjs');
 const result=await validatePdfDelivery();assert.deepEqual(result.delivery,d);
 assert.equal(result.pdfURL,'/archive/'+d.asset_name);
 assert.equal(result.pdfBytes.length,d.bytes);
 assert.equal(createHash('sha256').update(result.pdfBytes).digest('hex'),d.sha256);
 assert.ok(json('editions/coast.json').documents.includes(result.pdfURL));
 assert.match(d.browser_download_url,/^https:\/\/github\.com\/ahimanikya\/project-odisha\/releases\/download\//);
});
test(`Dhaga staged PDF is exact and linked directly (${stage})`,{skip:stage==='source'},()=>{
 const d=json('../odia-dhaga/pdf-delivery.json'),file='/archive/'+d.asset_name;
 verify(stage,{...d,file});
 assert.ok(readFileSync(stage+'/dhaga/index.html','utf8').includes(`href="${file}"`));
});
