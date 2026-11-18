import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const culture=JSON.parse(read('src/data/cultural-book.json'));
const dongria=JSON.parse(read('src/data/dongariya-book.json'));
const reading=JSON.parse(read('src/data/dongria-book-reading.json'));
const kotpad=JSON.parse(read('src/data/mirgan-kotpad-book.json'));
const cinema=JSON.parse(read('src/data/cinema.json'));
const dhaga=JSON.parse(read('../odia-dhaga/collection.json'));
const dhagaDownload=JSON.parse(read('../odia-dhaga/pdf-delivery.json'));
const html=read('dist/books/index.html');
const cards=new Map([...html.matchAll(/<article\b[^>]*data-book="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>[m[1],m[2]]));
const expected=[{id:'culture',title:culture.title,route:culture.route,download:culture.download,cover:culture.cover},{id:'dongria',title:dongria.title,route:'/stories/dongria/book/',download:dongria,cover:reading.cover.at(-1)},{id:'kotpad',title:kotpad.title,route:'/stories/kotpad/book/',download:kotpad.download,cover:kotpad.cover},{id:'cinema',title:'Odia Cinema: A Living Screen',route:'/cinema/',download:cinema.review_books.find(b=>b.edition==='digital'),cover:{src:'/assets/cinema/a-living-screen-cover-20261027.jpg',width:800,height:1199}},{id:'dhaga',title:`${dhaga.cover.title_english} — ${dhaga.cover.title_odia}`,route:'/dhaga/',download:{...dhagaDownload,file:'/archive/'+dhagaDownload.asset_name},cover:{src:'/dhaga/'+dhaga.cover.src.replace(/\.png$/,'.webp'),width:640,height:Math.round(dhaga.cover.height*640/dhaga.cover.width)}}];
test('books remain separate, with descriptive online reading links and no direct PDF downloads',()=>{
 assert.deepEqual([...cards.keys()],['culture','dongria','kotpad','cinema','dhaga']);
 assert.equal(new Set(expected.map(b=>b.route)).size,5);
 assert.doesNotMatch(html,/<a\b[^>]*href="[^"]*\.pdf(?:[?#][^"]*)?"/i);
 assert.doesNotMatch(html,/Book editions and printing notes/);
 assert.doesNotMatch(html,/Download PDF|\bPDF \d|\d+(?:\.\d+)? MB|download(?:able)? (?:a book|edition|its complete)/i);
 for(const b of expected){const card=cards.get(b.id);
  assert.ok(card.includes(b.title));assert.ok(card.includes(`By ${kotpad.author}`));
  assert.ok(card.includes(`href="${b.route}" aria-label="Read online: ${b.title}"`));
  assert.ok(card.includes(`${b.download.pages} pages`));
  let linkDepth=0;for(const tag of card.matchAll(/<\/?a\b[^>]*>/g)){linkDepth+=tag[0].startsWith('</')?-1:1;assert.ok(linkDepth>=0&&linkDepth<=1,'Native links must not nest');}assert.equal(linkDepth,0);
 }
});
test('the collection uses the existing complete covers and retains the photographic credit',()=>{
 for(const b of expected){const card=cards.get(b.id);const img=card.match(/<img\b[^>]*>/)?.[0];assert.ok(img,b.id);
  assert.ok(img.includes(`src="${b.cover.src}"`));assert.ok(img.includes(`width="${b.cover.width}"`));assert.ok(img.includes(`height="${b.cover.height}"`));assert.match(img,/alt="[^"]+"/);if(['dongria','kotpad'].includes(b.id))assert.match(img,/srcset="[^"]+"/);
 }
 const d=cards.get('dongria');assert.ok(d.includes(reading.cover_credit.creator));assert.ok(d.includes(reading.cover_credit.source_url));assert.ok(d.includes(reading.cover_credit.licence_url));
});
test('all five downloads still contain the exact independently reviewed book bytes',()=>{
 for(const b of expected){const bytes=readFileSync(b.id==='culture'?'../cultural-book/odisha-culture-memory-and-living-traditions.pdf':'dist'+b.download.file);assert.equal(bytes.length,b.download.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),b.download.sha256);}
});

test('Books is available in both main navigation layouts and is current only on the collection',()=>{
 const navigation=[...html.matchAll(/<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/g)].map(m=>m[1]);
 assert.equal(navigation.length,2);
 for(const nav of navigation){assert.match(nav,/<a href="\/books\/" aria-current="page"[^>]*>Books<\/a>/);assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);}
 for(const route of ['cinema/book/index.html','dhaga/index.html'])assert.match(read('dist/'+route),/<a href="\/books\/"[^>]*>(?:← )?All books<\/a>/);
 assert.ok(cards.get('dhaga').includes('Cover illustration: Project Odisha'));
 assert.ok(cards.get('dhaga').includes('https://creativecommons.org/licenses/by-sa/4.0/'));
});

test('every cover face has descriptive alternative text and explicit image dimensions',()=>{
 const faces=new Map([
  ['/assets/cultural-book/back-cover.png',[700,1000]],
  ['/assets/book-covers/culture-spine.png',[104,1440]],
  ['/assets/book-covers/dongria-back.png',[800,1000]],
  ['/images/mirgan-kotpad/back-cover.png',[767,1200]],
  ['/assets/book-covers/cinema-back.png',[801,1200]],
 ]);
 const seen=new Set();
 for(const card of cards.values())for(const [img] of card.matchAll(/<img\b[^>]*>/g)){
  assert.match(img,/alt="[^"\s][^"]*"/);
  assert.match(img,/width="[1-9]\d*"/);
  assert.match(img,/height="[1-9]\d*"/);
  const src=img.match(/src="([^"]+)"/)[1];
  if(faces.has(src)){const [width,height]=faces.get(src);assert.ok(img.includes(`width="${width}"`),src);assert.ok(img.includes(`height="${height}"`),src);seen.add(src);}
 }
 assert.deepEqual([...seen].sort(),[...faces.keys()].sort());
});

test('all five online books and their chapters omit book download and printing controls',()=>{
 const bookFiles=new Set([culture.download.file,dongria.file,kotpad.download.file,'/archive/'+dhagaDownload.asset_name,cinema.standalone_intro.file,...[...cinema.books,...cinema.review_books,...cinema.archived_review_books].flatMap(b=>[b.file,b.release_file]).filter(Boolean)]);
 const dirs=['books','stories/dongria','stories/kotpad','cinema','dhaga'];let count=0;
 for(const dir of dirs)for(const file of readdirSync('dist/'+dir,{recursive:true}).filter(f=>f.endsWith('.html'))){
  const page=read('dist/'+dir+'/'+file);count++;
  for(const match of page.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
   assert.ok(!bookFiles.has(match[1].split('#')[0]),dir+'/'+file+': book download link');
   const label=match[2].replace(/<[^>]*>/g,' ');
   assert.doesNotMatch(label,/Download (?:the )?(?:(?:complete|illustrated|PDF) )?(?:book|reading edition)|Read or download the book|Read or print the book|Book editions and printing notes|standalone PDF/i,dir+'/'+file);
  }
 }
 assert.ok(count>=48+12+9+cinema.articles.length+dhagaDownload.entries,'All book chapter families must be checked');
});
