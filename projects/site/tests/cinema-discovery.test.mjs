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
