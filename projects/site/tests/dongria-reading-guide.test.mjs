import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const articles=JSON.parse(read('src/data/dongariya.json'));
const guide=JSON.parse(read('src/data/dongria-reading-guide.json'));
const route=a=>`/stories/dongria/${a.routeSlug||a.slug}/`;
test('index and book reuse the same four-part image-and-introduction reading sequence',()=>{
 assert.equal(guide.parts.length,4);
 assert.deepEqual(guide.parts.flatMap(p=>p.chapters.map(c=>c.slug)),articles.map(a=>a.slug));
 for(const path of ['dist/stories/dongria/index.html','dist/stories/dongria/book/index.html']){
  const html=read(path);
  for(const part of guide.parts){assert.ok(html.includes(`id="${part.id}"`));assert.ok(html.includes(part.intro));for(const c of part.chapters){const a=articles.find(a=>a.slug===c.slug);assert.ok(html.includes(c.summary));assert.ok(html.includes(a.image));assert.ok(html.includes(`href="${route(a)}"`));assert.ok(html.includes(`${String(articles.indexOf(a)+1).padStart(2,'0')}. ${a.title}`));}}
  assert.equal(html.includes(guide.opening.summary),!path.includes('/book/'));assert.equal(html.includes(guide.closing.summary),!path.includes('/book/'));for(const note of Object.values(guide.preview_notes))assert.ok(html.includes(note));assert.ok(html.includes('uniform-images'));assert.ok(html.includes('contain-images'));
 }
 for(const file of ['src/pages/stories/dongria/index.astro','src/pages/stories/dongria/book.astro'])assert.ok(read(file).includes('DongriaReadingSequence'));
 assert.ok(read('src/components/DongriaReadingSequence.astro').includes('ArticleReadingPath'));
});
test('each chapter exposes its position and correct previous and next destinations',()=>{
 for(let i=0;i<articles.length;i++){
  const html=read('dist'+route(articles[i])+'index.html');
  const previous=i?route(articles[i-1]):'/stories/dongria/book/#author-note';
  const next=i<11?route(articles[i+1]):'/stories/dongria/book/#looking-again';
  assert.match(html,new RegExp(`href="${previous.replaceAll('?','\\?')}" rel="prev"`));
  assert.match(html,new RegExp(`href="${next.replaceAll('?','\\?')}" rel="next"`));
  assert.ok(html.includes(`Chapter ${String(i+1).padStart(2,'0')} of 12`));
  assert.ok(html.includes('All stories'));assert.ok(html.includes('The book'));
 }
});

test('all twelve source sections contain image credits and intact numbered note destinations',()=>{
 let notes=0;
 for(const a of articles){
  const html=read('dist'+route(a)+'index.html');
  assert.equal((html.match(/<h2[^>]*>Footnotes (?:&amp;|&) Sources<\/h2>/g)||[]).length,1);
  assert.ok(!html.includes('>Footnotes and sources</h2>'));
  const section=html.match(/<section[^>]*data-footnotes[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(section,a.slug);
  assert.ok(section.includes('id="footnotes-and-sources"'));
  assert.ok(/(?:Image:|Illustration:)/i.test(section),a.slug);
  const ids=[...section.matchAll(/<li id="([^"]+)"/g)].map(m=>m[1]);notes+=ids.length;
  for(const id of ids)assert.ok(html.includes(`href="#${id}"`));
  assert.ok(section.includes('data-footnote-backref'));
 }
 assert.equal(notes,95);
});

test('source consolidation does not run on non-Dongria articles',async()=>{
 const {default:plugin}=await import('../tools/nimuhi-footnote-heading.mjs');
 for(const pathname of ['/src/content/cinema/example.md','/src/content/culture/essential-odia-dhaga.md']){
  const p=plugin({fileURL:new URL('file://'+pathname)});
  let changed=false;p?.after?.({children:[]},{replaceNode(){changed=true;}});
  assert.equal(changed,false);
 }
});
