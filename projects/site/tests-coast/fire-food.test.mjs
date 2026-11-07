import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json'));
const read=p=>readFileSync('dist-coast'+p+'index.html','utf8');
const catalog=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const slugs=['baigana-poda','tomato-poda','patrapoda'];
test('fire stories carry truthful photo context, licensed assets and source links',()=>{
 for(const slug of slugs){
  const entry=foods.pages.find(p=>p.slug===slug),photo=foods.assets[entry.hero],html=read('/food/'+slug+'/');
  for(const route of ['/food/fire-cooking/','/explore/'])assert.ok(read(route).includes('href="/food/'+slug+'/"'));
  for(const text of [photo.alt,photo.caption,photo.creator,photo.license_url,'noindex, nofollow'])assert.ok(html.includes(text),slug+': '+text);
  assert.equal(createHash('sha256').update(readFileSync('dist-coast'+photo.src)).digest('hex'),photo.sha256);
  for(const id of new Set(entry.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids))))assert.ok(html.includes(foods.sources[id].url));
 }
 assert.ok(read('/food/baigana-poda/').includes('The photograph shows combined eggplant and tomato, baigana-bilati poda. It is not a photograph of either recipe described here.'));
 assert.match(read('/food/tomato-poda/'),/The author uses knife and spoon rather than hand-mashing/);
 assert.match(read('/food/patrapoda/'),/Mushroom and prawn preparations.*not pictured/);
 assert.match(read('/food/patrapoda/'),/Leaf wrapping does not by itself mean charring/);
 assert.match(read('/food/patrapoda/'),/historical account, not evidence of a dish available to book today/);
});
test('fire and table starter preserves sources, personal notes and real photos in portable books',()=>{
 const starter=JSON.parse(readFileSync('../../kb/research/journey-starters.json')).starters.find(s=>s.id==='fire-and-table');
 const plan={version:1,title:starter.title,startDate:'',items:starter.items.map(id=>({id,day:1,notes:'Ask what is inside the parcel.'}))};
 const book=buildTourBook(plan,catalog);
 for(const id of ['reading:food/fire-cooking',...slugs.map(s=>'food:'+s)]){
  assert.ok(starter.items.includes(id));const item=catalog.find(i=>i.id===id);assert.ok(item);assert.ok(item.photo);assert.ok(item.sources.length);id==='food:baigana-poda'?(assert.equal(item.practical.length,1),assert.equal(item.practical[0].heading,''),assert.equal(item.practical[0].paragraphs.length,3)):id==='food:tomato-poda'?(assert.equal(item.practical.length,1),assert.equal(item.practical[0].heading,''),assert.equal(item.practical[0].paragraphs.length,1)):assert.ok(item.practical.length>=3);
  assert.ok(book.includes(item.title));for(const source of item.sources)assert.ok(book.includes(source.url.replaceAll('&','&amp;')));
 }
 assert.ok(starter.items.includes('food:pakhala'));assert.ok(starter.items.includes('food:badi-chura'));
 assert.match(read('/journey-starters/'),/Fire and the Odisha table/);
 assert.match(book,/Ask what is inside the parcel/);assert.match(book,/mustard/);
 for(const route of ['/food/','/food/everyday/','/food/bhubaneswar/','/destinations/bhubaneswar/'])assert.ok(read(route).includes('href="/food/fire-cooking/"'));
});
test('Pala photo has checked provenance but held feature and media remain outside website',()=>{
 const draft=JSON.parse(readFileSync('../../kb/research/culture/pala-feature-draft.json')),photo=draft.media_candidate;
 assert.equal(draft.status,'draft_held_from_website');assert.match(photo.status,/visually inspected/);assert.match(photo.caption,/performer is not identified/);
 assert.equal(createHash('sha256').update(readFileSync('../../kb/research/'+photo.local_file)).digest('hex'),photo.sha256);
 assert.ok(draft.before_website.some(t=>t.includes('Dash 2011')));assert.ok(!existsSync('dist-coast/culture/pala/index.html'));assert.ok(!existsSync('dist-coast/images/culture/pala-nalconagar.webp'));assert.ok(!catalog.some(i=>i.href==='/culture/pala/'));
});
