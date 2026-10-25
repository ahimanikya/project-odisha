import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {cinema,cinemaArticle} from '../src/lib/cinema-article.mjs';
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.resolve(site,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('eleven canonical articles preserve notes, captions and source hashes',()=>{
 assert.equal(cinema.articles.length,11);
 for(const entry of cinema.articles){
  const source=fs.readFileSync(path.join(root,entry.source),'utf8');assert.equal(hash(source),entry.source_sha256,entry.slug);
  const {article,hero,readingLinks,fullHTML}=cinemaArticle(entry);const html=fullHTML;
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,entry.slug+' duplicate anchors');
  for(const [,target]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(target),entry.slug+' '+target);
  assert.equal((html.match(/<figure\b/g)||[]).length,entry.images.length,entry.slug+' figures');
  assert.ok(/AI-generated[^<]*illustration/.test(html),entry.slug+' illustration label');
  assert.ok(html.includes('Footnotes &amp; Sources')||html.includes('Footnotes & Sources'),entry.slug+' sources');
  assert.ok(html.includes('/contribute/?page='+encodeURIComponent(entry.route)),entry.slug+' update route');
  assert.ok(readingLinks.length,entry.slug+' reading links');assert.equal(hero.file,entry.images.find(i=>i.role==='title').file);
  for(const image of entry.images){assert.ok(html.includes(image.file),entry.slug+' visible image');for(const d of image.derivatives){const bytes=fs.readFileSync(path.join(site,'public',d.file));assert.equal(hash(bytes),d.sha256);}}
 }
});
test('children sections and Watch links promoted exactly once',()=>{for(const [slug,heading,note]of [['odia-cinema','Children, imagination and the screen','children-babula-parliament'],['odia-television','Animation, and the language a child hears','child-idmt']]){const entry=cinema.articles.find(e=>e.slug===slug),source=fs.readFileSync(path.join(root,entry.source),'utf8');assert.equal(source.split('## '+heading).length-1,1);assert.equal(source.split('[^'+note+']:').length-1,1);assert.ok(cinemaArticle(entry).article.html.includes(heading));}});
test('books staged byte-exact and no source-sized hero PNGs deployed',()=>{for(const book of cinema.books){assert.equal(hash(fs.readFileSync(path.join(site,'public',book.file))),book.sha256);const delivery=JSON.parse(fs.readFileSync(path.join(root,'kb/records/cinema-children-delivery-2026-10-26.json'),'utf8'));const reviewed=Object.values(delivery.outputs).find(output=>path.basename(output.path)===path.basename(book.file));assert.ok(reviewed);assert.equal(book.sha256,reviewed.sha256);}const deployed=fs.readdirSync(path.join(site,'public/assets/cinema'));assert.ok(!deployed.some(f=>f.endsWith('.png')));});
test('player logic source-identical, scoped styling, explicit frame policy',()=>{for(const name of ['app.js','core.js','catalogue.js'])assert.equal(fs.readFileSync(path.join(site,'public/assets/cinema/player',name),'utf8'),fs.readFileSync(path.join(root,'outputs/odia-movie-player',name),'utf8'));const app=fs.readFileSync(path.join(site,'public/assets/cinema/player/app.js'),'utf8');assert.ok(app.includes("frame.referrerPolicy='strict-origin-when-cross-origin'"));assert.ok(!app.includes('innerHTML'));const css=fs.readFileSync(path.join(site,'public/assets/cinema/player/player.css'),'utf8');assert.ok(css.includes('.cinema-player'));const page=fs.readFileSync(path.join(site,'src/pages/cinema/watch.astro'),'utf8');assert.ok(!page.includes('<iframe'));assert.equal((page.match(/is:inline defer/g)||[]).length,3);});
