import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync('dist-coast/food/sweets-and-places/index.html','utf8');
const article=html.match(/<article\b[^>]*class="[^"]*sweets-and-places[^"]*"[^>]*>[\s\S]*?<\/article>/)?.[0];
const story=JSON.parse(readFileSync('../../kb/research/food/sweets-and-places.json'));
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('the sweets survey credits its author and distinguishes eight sweets with nine place associations',()=>{
 assert.ok(article);
 assert.equal((article.match(/By Ahimanikya Satapathy/g)||[]).length,1);
 assert.ok(article.indexOf('By Ahimanikya Satapathy')>article.indexOf('</h1>'));
 assert.ok(article.indexOf('By Ahimanikya Satapathy')<article.indexOf('class="sweet-entry"'));
 assert.equal(story.entries.length,8);
 assert.equal(story.entries.reduce((n,entry)=>n+entry.places.length,0),9);
 assert.match(article,/Nimapada/);assert.match(article,/Jhili/);assert.match(article,/Kendrapara/);assert.match(article,/Rasabali/);
 assert.doesNotMatch(article,/Prepared with AI|Written with AI|human editorial.*pending/);
 for(const entry of story.entries){
  assert.ok(article.includes(`id="${entry.id}"`));
  assert.ok(article.includes(`href="#${entry.id}"`));
  for(const place of entry.places)assert.ok(article.includes(escape(place)),entry.name+' place');
 }
});
test('visible source notes retain unique passage targets and return links',()=>{
 const ids=[...article.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 const refs=[...article.matchAll(/<a\b[^>]*\bdata-footnote-ref\b[^>]*>/g)].map(m=>m[0]);
 const returns=[...article.matchAll(/<a\b[^>]*\bdata-footnote-backref\b[^>]*>/g)].map(m=>m[0]);
 const paragraphs=[...story.intro,...story.entries.flatMap(e=>e.paragraphs),...story.closing];
 const expected=paragraphs.reduce((n,p)=>n+p.source_ids.length,0);
 assert.ok(expected>0);assert.equal(refs.length,expected);assert.equal(returns.length,expected);
 for(const a of [...refs,...returns])assert.ok(ids.includes(a.match(/href="#([^"]+)"/)[1]));
 for(const source of story.sources){assert.ok(article.includes(`id="note-${source.id}"`));assert.ok(article.includes(escape(source.url)));}
 assert.match(article,/<h2[^>]*id="footnote-title"[^>]*>Footnotes &amp; Sources<\/h2>/);
 assert.doesNotMatch(article,/<details[^>]*>[\s\S]*?id="story-sources"/);
});
test('the two documentary photographs retain their original assets and visible reuse credit',()=>{
 const pictured=story.entries.filter(e=>e.photo);assert.equal(pictured.length,2);
 assert.deepEqual(pictured.map(e=>e.photo.asset).toSorted(),['chhena-poda','pahala-rasagola'].toSorted());
 assert.equal((article.match(/<img\b/g)||[]).length,2);
 for(const entry of pictured){
  const photo=foods.assets[entry.photo.asset];
  assert.ok(article.includes(`src="${photo.src}"`));
  for(const s of [photo.creator,photo.source,photo.license_url,entry.photo.caption||photo.caption])assert.ok(article.includes(escape(s)),entry.name+' image credit');
  assert.equal(createHash('sha256').update(readFileSync('public'+photo.src)).digest('hex'),photo.sha256);
 }
});
test('reading stays optional and the article-specific update action remains visible',()=>{
 assert.match(article,/<details\b[^>]*id="reading-paths"[^>]*>/);
 const reading=article.match(/<details\b[^>]*id="reading-paths"[^>]*>/)[0];assert.doesNotMatch(reading,/\bopen(?:\s|=|>)/);
 for(const link of story.further_reading)assert.ok(article.includes(`href="${escape(link.href)}"`));
 const outside=article.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.ok(outside.includes('id="story-sources"'));
 assert.match(outside,/href="\/contribute\/\?page=%2Ffood%2Fsweets-and-places%2F"[^>]*>Suggest an update/);
 assert.ok(outside.includes('GitHub submissions are public'));
 assert.ok(readFileSync('dist-coast/food/index.html','utf8').includes('href="/food/sweets-and-places/"'));
 assert.ok(readFileSync('dist-coast/contribute/index.html','utf8').includes('value="/food/sweets-and-places/"'));
});
