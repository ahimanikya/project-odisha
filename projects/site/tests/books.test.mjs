import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const dongria=JSON.parse(read('src/data/dongariya-book.json'));
const reading=JSON.parse(read('src/data/dongria-book-reading.json'));
const kotpad=JSON.parse(read('src/data/mirgan-kotpad-book.json'));
const cinema=JSON.parse(read('src/data/cinema.json'));
const dhaga=JSON.parse(read('../odia-dhaga/collection.json'));
const dhagaDownload=JSON.parse(read('../odia-dhaga/pdf-delivery.json'));
const html=read('dist/books/index.html');
const cards=new Map([...html.matchAll(/<article\b[^>]*data-book="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>[m[1],m[2]]));
const expected=[{id:'dongria',title:dongria.title,route:'/stories/dongria/book/',download:dongria,cover:reading.cover.at(-1)},{id:'kotpad',title:kotpad.title,route:'/stories/kotpad/book/',download:kotpad.download,cover:kotpad.cover},{id:'cinema',title:'Odia Cinema: A Living Screen',route:'/cinema/',download:cinema.review_books.find(b=>b.edition==='digital'),cover:{src:'/assets/cinema/a-living-screen-cover-20261027.jpg',width:800,height:1199}},{id:'dhaga',title:`${dhaga.cover.title_english} — ${dhaga.cover.title_odia}`,route:'/dhaga/',download:{...dhagaDownload,file:'/archive/'+dhagaDownload.asset_name},cover:{src:'/dhaga/'+dhaga.cover.src.replace(/\.png$/,'.webp'),width:640,height:Math.round(dhaga.cover.height*640/dhaga.cover.width)}}];
test('books remain separate, with descriptive reading and PDF links for each edition',()=>{
 assert.deepEqual([...cards.keys()],['dongria','kotpad','cinema','dhaga']);
 assert.equal(new Set(expected.flatMap(b=>[b.route,b.download.file])).size,8);
 for(const b of expected){const card=cards.get(b.id);
  assert.ok(card.includes(b.title));assert.ok(card.includes(`By ${kotpad.author}`));
  assert.ok(card.includes(`href="${b.route}" aria-label="Read online: ${b.title}"`));
  assert.ok(card.includes(`href="${b.download.file}" aria-label="Download PDF: ${b.title}"`));
  assert.ok(card.includes(`${b.download.pages} pages`));assert.ok(card.includes(`${(b.download.bytes/1000000).toFixed(1)} MB`));
  let linkDepth=0;for(const tag of card.matchAll(/<\/?a\b[^>]*>/g)){linkDepth+=tag[0].startsWith('</')?-1:1;assert.ok(linkDepth>=0&&linkDepth<=1,'Native links must not nest');}assert.equal(linkDepth,0);
 }
});
test('the collection uses the existing complete covers and retains the photographic credit',()=>{
 for(const b of expected){const card=cards.get(b.id);const img=card.match(/<img\b[^>]*>/)?.[0];assert.ok(img,b.id);
  assert.ok(img.includes(`src="${b.cover.src}"`));assert.ok(img.includes(`width="${b.cover.width}"`));assert.ok(img.includes(`height="${b.cover.height}"`));assert.match(img,/alt="[^"]+"/);if(['dongria','kotpad'].includes(b.id))assert.match(img,/srcset="[^"]+"/);
 }
 const d=cards.get('dongria');assert.ok(d.includes(reading.cover_credit.creator));assert.ok(d.includes(reading.cover_credit.source_url));assert.ok(d.includes(reading.cover_credit.licence_url));
});
test('all four downloads still contain the exact independently reviewed book bytes',()=>{
 for(const b of expected){const bytes=readFileSync('dist'+b.download.file);assert.equal(bytes.length,b.download.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),b.download.sha256);}
});

test('Books is available in both main navigation layouts and is current only on the collection',()=>{
 const navigation=[...html.matchAll(/<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/g)].map(m=>m[1]);
 assert.equal(navigation.length,2);
 for(const nav of navigation){assert.match(nav,/<a href="\/books\/" aria-current="page"[^>]*>Books<\/a>/);assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);}
 for(const route of ['cinema/book/index.html','dhaga/index.html'])assert.match(read('dist/'+route),/<a href="\/books\/"[^>]*>(?:← )?All books<\/a>/);
 assert.ok(cards.get('dhaga').includes('Cover illustration: Project Odisha'));
 assert.ok(cards.get('dhaga').includes('https://creativecommons.org/licenses/by-sa/4.0/'));
});
