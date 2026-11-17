import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const book=JSON.parse(read('src/data/mirgan-kotpad-book.json'));
const plain=s=>s.replace(/<\/?(?:p|div|section|article|header|footer|nav|h[1-6]|li|ol|ul|figure|figcaption|blockquote|br|dl|dt|dd)\b[^>]*>/gi,' ').replace(/<[^>]*>/g,'').replace(/&#39;|&#x27;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const expected=s=>s.replace(/\[\d+\]\([^)]+\)/g,' ').replace(/^### /,'').replace(/\*\*/g,'').replace(/\*/g,'').replace(/\s+/g,' ').trim();
const route=c=>`/stories/kotpad/${c.slug}/`;
const chapterPage=c=>read('dist'+route(c)+'index.html');
test('all nine reviewed chapters preserve paragraph text and unique stable routes',()=>{
 assert.equal(book.chapters.length,9);assert.equal(new Set(book.chapters.map(c=>c.slug)).size,9);
 assert.equal(book.author,'Ahimanikya Satapathy');
 assert.deepEqual(book.chapters.map(c=>c.part),[...Array(2).fill('PART ONE · PEOPLE AND HISTORY'),...Array(4).fill('PART TWO · MAKING AND EARNING'),...Array(3).fill('PART THREE · CONTINUITY AND CHANGE')]);
 for(const c of book.chapters){const p=chapterPage(c);assert.ok(p.includes('By Ahimanikya Satapathy'));assert.ok(p.includes(c.title));
  for(const b of c.blocks){const original=expected(b.text);const rendered=plain(p.replace(/<sup>.*?<\/sup>/gs,' '));assert.ok(rendered.includes(original),`${c.number}: ${original.slice(0,100)}`);}
 }
});
test('book-wide citation numbers resolve with working backlinks on every chapter',()=>{
 const used=new Set();
 for(const c of book.chapters){const p=chapterPage(c);const ids=[...p.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`Duplicate ids chapter ${c.number}`);
  for(const s of c.sources){used.add(s.number);assert.ok(p.includes(`id="note-${s.number}"`));assert.ok(p.includes(`value="${s.number}"`));assert.ok(p.includes(s.url.replaceAll('&','&amp;'))||p.includes(s.url));
   for(const id of s.returns){assert.ok(p.includes(`id="${id}"`));assert.ok(p.includes(`href="#${id}"`));}
  }
  for(const m of p.matchAll(/href="#(note-\d+|ref-\d+-\d+)"/g))assert.ok(ids.includes(m[1]),`Unresolved ${m[1]}`);
 }
 assert.equal(used.size,36);
});
test('complete book retains all bookends and one bibliography with navigable chapter sequence',()=>{
 const p=read('dist/stories/kotpad/book/index.html');
 for(const s of book.bookends){assert.ok(p.includes(`id="${s.id}"`));for(const b of s.blocks)assert.ok(plain(p).includes(expected(b.text)),b.text.slice(0,90));}
 assert.equal((p.match(/id="book-note-/g)||[]).length,36);
 for(const c of book.chapters){assert.ok(p.includes(`href="${route(c)}"`));const cp=chapterPage(c);assert.ok(cp.includes(c.number===1?'/stories/kotpad/book/#introduction':route(book.chapters[c.number-2])));assert.ok(cp.includes(c.number===9?'/stories/kotpad/book/#conclusion':route(book.chapters[c.number])));assert.ok(cp.includes('/stories/dongria/book/'));}
});
test('both book entrances link the identical reviewed direct PDF',()=>{
 assert.equal(book.download.pages,58);assert.equal(book.download.file,'/archive/mirgan-kotpad-reading.pdf');
 for(const base of ['public','dist']){const b=readFileSync(base+book.download.file);assert.equal(b.length,book.download.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),book.download.sha256);}
 for(const path of ['dist/stories/kotpad/index.html','dist/stories/kotpad/book/index.html']){const p=read(path);assert.ok(p.includes(book.download.file));assert.ok(p.includes(book.cover.src));const rendered=p.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');assert.doesNotMatch(rendered,/AI-generated|AI-assisted|ISBN\s*\d|printer-ready/);}
});
test('cross-chapter references are actual links and all contributions remain public-aware',()=>{
 for(const c of book.chapters){const p=chapterPage(c);for(const b of c.body)for(const m of b.matchAll(/\bChapter ([1-9])\b/g))assert.ok(p.includes(`href="${route(book.chapters[Number(m[1])-1])}"`));assert.ok(p.includes('Suggest an update'));assert.ok(p.includes('GitHub submissions are public.'));assert.ok(p.includes('Footnotes &amp; Sources'));}
});
