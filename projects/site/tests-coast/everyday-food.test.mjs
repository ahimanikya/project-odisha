import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json'));
const read=p=>readFileSync('dist-coast'+p+'index.html','utf8');
const catalog=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const slugs=['ou-khatta','badi-chura','tala-pitha'];
test('everyday stories retain licensed real photographs and reachable sources in the published candidate',()=>{
 for(const slug of slugs){
  const entry=foods.pages.find(p=>p.slug===slug),photo=foods.assets[entry.hero],html=read('/food/'+slug+'/');
  assert.ok(read('/food/everyday/').includes('href="/food/'+slug+'/"'));
  assert.ok(read('/explore/').includes('href="/food/'+slug+'/"'));
  assert.ok(read('/food/').includes('data-save-journey="'+entry.save_id+'"'));
  for(const text of [photo.alt,photo.creator,photo.license_url,entry.odia,'noindex, nofollow',['ou-khatta','badi-chura','tala-pitha'].includes(slug)?'Footnotes &amp; Sources':'Sources, image credit'])assert.ok(html.includes(text),slug+': '+text);
  assert.equal(createHash('sha256').update(readFileSync('dist-coast'+photo.src)).digest('hex'),photo.sha256);
  for(const id of new Set(entry.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids))))assert.ok(html.includes(foods.sources[id].url));
 }
});
test('all four new saved ideas retain food context, source links and personal notes in portable books',()=>{
 const ids=['reading:food/everyday',...slugs.map(s=>'food:'+s)];
 const plan={version:1,title:'My Odisha table',startDate:'',items:ids.map(id=>({id,day:1,notes:'Ask the maker before recording.'}))};
 const book=buildTourBook(plan,catalog);
 for(const id of ids){const item=catalog.find(i=>i.id===id);assert.ok(item);assert.ok(item.photo);assert.ok(item.sources.length);item.id==='food:tala-pitha'?(assert.equal(item.practical.length,1),assert.equal(item.practical[0].paragraphs.length,2)):assert.ok(item.practical.length>=3);assert.ok(book.includes(item.title));for(const source of item.sources)assert.ok(book.includes(source.url.replaceAll('&','&amp;')));}
 assert.match(book,/Ask the maker before recording/);
 assert.match(book,/mustard/);
 assert.match(book,/Fruit ripeness is unstated/);
 assert.match(book,/Kartik/);
 assert.ok(read('/food/everyday/').includes('data-save-journey="reading:food/everyday"'));
});
test('connections preserve recipe distinctions and held Pala research stays outside the public candidate',()=>{
 assert.match(read('/food/ou-khatta/'),/two recipes by the same cook/);
 assert.match(read('/food/tala-pitha/'),/Fruit ripeness is unstated/);
 assert.ok(read('/food/poda-pitha/').includes('href="/food/tala-pitha/"'));
 assert.ok(read('/destinations/bhubaneswar/').includes('href="/food/everyday/"'));
 assert.ok(read('/food/bhubaneswar/').includes('href="/food/everyday/"'));
 assert.ok(!existsSync('dist-coast/culture/pala/index.html'));
 assert.ok(!catalog.some(i=>i.href==='/culture/pala/'));
});
