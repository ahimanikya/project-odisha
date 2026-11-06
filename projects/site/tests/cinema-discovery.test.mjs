import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {cinema,cinemaArticle,cinemaNarrative} from '../src/lib/cinema-article.mjs';
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(site,file),'utf8'));

test('discovery links resolve to distinct existing section headings',()=>{
 const links=cinemaNarrative.section_guide;
 assert.equal(new Set(links.map(x=>x.href)).size,links.length);
 for(const link of links){
  const target=new URL(link.href,'https://projectodisha.org');
  const entry=cinema.articles.find(x=>x.route===target.pathname);
  assert.ok(entry,link.href+' article exists');
  const html=cinemaArticle(entry).fullHTML;
  assert.equal(html.split('id="'+target.hash.slice(1)+'"').length-1,1,link.href+' unique heading');
  assert.equal(entry.slug,link.slug,'book and web agree on article');
 }
});

test('supplementary writers have existing pages without duplicating chapter order',()=>{
 for(const writer of cinemaNarrative.writers_beyond_series){
  assert.ok(fs.existsSync(path.join(site,'src/pages',writer.href.slice(1).replace(/\/$/,'.astro'))),writer.href);
  assert.ok(!cinema.articles.some(x=>x.route===writer.href),'supplementary label agrees with numbered sequence');
 }
});

test('curated viewing room retains selected entries and distinguishes new trailers',()=>{
 const data=read('public/assets/cinema/player/catalogue.json');
 const expected=['daman','biswaprakash-prime','pratikshya-trailer','ananta-trailer','stree-kali-juga','prahalad-airtel','return-of-hanuman-airtel','bara-badhu-trailer','maliput-melodies-trailer'];
 assert.deepEqual(data.entries.map(x=>x.id).sort(),expected.sort());
 assert.equal(new Set(data.entries.map(x=>x.watchURL)).size,data.entries.length);
 for(const id of ['bara-badhu-trailer','maliput-melodies-trailer']){
  const entry=data.entries.find(x=>x.id===id);
  assert.equal(entry.type,'trailer');assert.equal(entry.publicDomainVerified,false);
  assert.match(entry.verificationSummary,/playback is untested/);
  assert.equal(entry.checkedOn,'2026-10-31');
 }
 for(const choice of [...data.curation.featured,...data.curation.explorations])assert.ok(data.entries.some(x=>x.id===choice.id),choice.id);
 assert.equal(data.entries.find(x=>x.id==='daman').checkedOn,'2026-10-26','earlier inspection date retained');
});


test('website and book use explicit distinct sequences with source-bound integrations',()=>{
 assert.equal(cinema.articles.length,52);
 assert.equal(cinemaNarrative.book_order.length,49);
 assert.deepEqual(cinemaNarrative.book_parts.flatMap(part=>part.chapters),cinemaNarrative.book_order);
 assert.equal(new Set(cinemaNarrative.book_order).size,49);
 const excluded=cinema.articles.filter(entry=>!cinemaNarrative.book_order.includes(entry.slug)).map(entry=>entry.slug);
 assert.deepEqual(excluded,['vishal-mourya','debi-prasad-lenka','deependra-samal']);
 for(const slug of excluded){assert.equal(cinemaNarrative.book_integrated_profiles[slug],'daman');assert.equal(cinemaNarrative.book_images[slug].chapter,'daman');}
 for(const [slug,override] of Object.entries(cinemaNarrative.book_overrides)){
  const entry=cinema.articles.find(item=>item.slug===slug);
  assert.equal(override.source_sha256,entry.source_sha256);
  const source=fs.readFileSync(path.resolve(site,'../..',entry.source),'utf8');
  for(const patch of override.patches)assert.equal(source.split(patch.anchor).length-1,1,patch.id+' unique exact source anchor');
  const ids=override.notes.map(note=>note.match(/^\[\^([^\]]+)\]:/)[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ids)assert.ok(!source.includes('[^'+id+']:'),'imported notes do not collide');
 }
 assert.equal(cinemaNarrative.writers_beyond_series.length,3);
 assert.ok(!JSON.stringify(cinema.parts).includes('“The Culprit,” a constable listens'));
});
