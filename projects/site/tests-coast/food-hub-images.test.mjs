import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const html=readFileSync('dist-coast/food/index.html','utf8');
const hub=JSON.parse(readFileSync('../../kb/research/food/discovery-hub.json'));
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json'));
const cards=[...html.matchAll(/<article\b[^>]*class="[^"]*\bplanning-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);
const repaired=['food:puri-mahaprasad','food:konark-chingudi','food:chilika-fish','food:chilika-curd','food:pakhala'];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('every regional food card has a photograph and retains its unique saved idea',()=>{
 const catalog=JSON.parse(html.match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const expected=catalog.filter(i=>i.kind==='Food');
 assert.equal(cards.length,expected.length);
 for(const item of expected){
  const matches=cards.filter(c=>c.includes(`data-save-journey="${item.id}"`));
  assert.equal(matches.length,1,item.id);
  assert.match(matches[0],/<img\b/,item.id);
  assert.ok(matches[0].includes(`href="${escape(item.href)}"`),item.id);
 }
});
test('the five repaired cards use licensed assets with visible scope captions',()=>{
 assert.deepEqual(Object.keys(hub.card_images).toSorted(),repaired.toSorted());
 for(const id of repaired){
  const mapping=hub.card_images[id],asset=foods.assets[mapping.asset];assert.ok(asset,id);
  const card=cards.find(c=>c.includes(`data-save-journey="${id}"`));
  assert.ok(card.includes(`src="${asset.src}"`),id);
  assert.ok(card.includes(escape(mapping.caption||asset.caption)),id+' caption');
  for(const field of ['creator','license','license_url','source'])assert.ok(asset[field],id+' '+field);
  for(const text of [asset.creator,asset.license_url,asset.source])assert.ok(html.includes(escape(text)),id+' credit');
  if(asset.sha256)assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256,id);
 }
});
test('all food hub image files decode with nonzero dimensions',async()=>{
 const sources=[...new Set([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]))];
 assert.ok(sources.length>0);
 for(const src of sources){
  assert.ok(src.startsWith('/'),src);assert.ok(existsSync('public'+src),src);
  const metadata=await sharp(readFileSync('public'+src)).metadata();
  assert.ok(metadata.width>0&&metadata.height>0,src);
 }
});
