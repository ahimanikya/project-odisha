import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const dongria=JSON.parse(read('src/data/dongariya-book.json'));
const reading=JSON.parse(read('src/data/dongria-book-reading.json'));
const kotpad=JSON.parse(read('src/data/mirgan-kotpad-book.json'));
const html=read('dist/books/index.html');
const cards=new Map([...html.matchAll(/<article\b[^>]*data-book="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>[m[1],m[2]]));
const expected=[{id:'dongria',title:dongria.title,route:'/stories/dongria/book/',download:dongria,cover:reading.cover.at(-1)},{id:'kotpad',title:kotpad.title,route:'/stories/kotpad/book/',download:kotpad.download,cover:kotpad.cover}];
test('books remain separate, with descriptive reading and PDF links for each edition',()=>{
 assert.deepEqual([...cards.keys()],['dongria','kotpad']);
 assert.equal(new Set(expected.flatMap(b=>[b.route,b.download.file])).size,4);
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
  assert.ok(img.includes(`src="${b.cover.src}"`));assert.ok(img.includes(`width="${b.cover.width}"`));assert.ok(img.includes(`height="${b.cover.height}"`));assert.match(img,/alt="[^"]+"/);assert.match(img,/srcset="[^"]+"/);
 }
 const d=cards.get('dongria');assert.ok(d.includes(reading.cover_credit.creator));assert.ok(d.includes(reading.cover_credit.source_url));assert.ok(d.includes(reading.cover_credit.licence_url));
});
test('both downloads still contain the exact independently reviewed book bytes',()=>{
 for(const b of expected){const bytes=readFileSync('dist'+b.download.file);assert.equal(bytes.length,b.download.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),b.download.sha256);}
});
