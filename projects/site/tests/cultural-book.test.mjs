import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const book=JSON.parse(readFileSync('src/data/cultural-book.json','utf8'));
const read=route=>readFileSync(`dist${route}index.html`,'utf8');
const escapeHTML=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('the online book exposes all 48 chapters in the original eight-part order',()=>{
 assert.equal(book.chapters.length,48);assert.equal(book.parts.length,8);
 assert.deepEqual(book.chapters.map(c=>c.number),Array.from({length:48},(_,i)=>i+1));
 const html=read(book.route);
 for(const part of book.parts)assert.ok(html.includes(escapeHTML(part.title)));
 for(const c of book.chapters)assert.ok(html.includes(`href="${book.route}${c.slug}/"`));
 assert.match(html,/About the author/);assert.ok(html.includes(book.portrait.src));
});
test('all chapter sources resolve and return to a unique citation, with adjacent reading links',()=>{
 for(const [index,c] of book.chapters.entries()){
  const html=read(`${book.route}${c.slug}/`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`duplicate ids: chapter ${c.number}`);
  for(const match of html.matchAll(/href="#((?:cite-|source-)\S+?)"/g))assert.ok(ids.includes(match[1]),`missing ${match[1]} in chapter ${c.number}`);
  for(const note of c.notes){assert.ok(ids.includes(`source-${note.number}`));assert.ok(html.includes(escapeHTML(note.url)));if(note.extra_url)assert.ok(html.includes(escapeHTML(note.extra_url)));}
  for(const image of c.images){assert.ok(html.includes(image.src));assert.ok(html.includes(escapeHTML(image.source)));assert.ok(html.includes(escapeHTML(image.license_url)));assert.ok(existsSync('public'+image.src));}
  if(index>0)assert.ok(html.includes(`href="${book.route}${book.chapters[index-1].slug}/"`));
  if(index<47)assert.ok(html.includes(`href="${book.route}${book.chapters[index+1].slug}/"`));
  assert.ok(html.includes(`${book.download.file}#page=${c.startPage+1}`));
  assert.match(html,/<nav[^>]*aria-label="Breadcrumbs"/);assert.match(html,/aria-current="page">Chapter/);
 }
});
test('the complete PDF download matches the delivered 310-page edition',()=>{
 const bytes=readFileSync('public'+book.download.file);assert.equal(book.download.pages,310);assert.equal(bytes.length,book.download.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),book.download.sha256);
});
