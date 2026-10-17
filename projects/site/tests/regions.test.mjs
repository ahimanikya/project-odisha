import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/bhubaneswar-editorial.json','utf8'));
const puriEditorial=JSON.parse(readFileSync('../../kb/research/destinations/puri-editorial.json','utf8'));
const data=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
test('regional guides connect discoverable places and choices to the journey catalogue',()=>{
 const explore=readFileSync('dist/explore/index.html','utf8');
 const journey=readFileSync('dist/journey/index.html','utf8');
 const ids=new Set();
 for(const r of data.regions){
  const html=readFileSync(`dist/destinations/${r.slug}/index.html`,'utf8');
  assert.ok(explore.includes(`href="/destinations/${r.slug}/"`));
  assert.ok(html.includes(['bhubaneswar','puri'].includes(r.slug)?'By Ahimanikya Satapathy':'Editorial preview'));
  for(const i of [{id:r.id},...r.items]){
   assert.ok(!ids.has(i.id),`Duplicate region ID ${i.id}`);ids.add(i.id);
   assert.ok(html.includes(`data-save-journey="${i.id}"`));
   assert.ok(journey.includes(`data-save-journey="${i.id}"`));
  }
  assert.ok(html.includes('id="before-you-go"'));
  assert.ok(html.includes('id="stories"'));
 }
});
test('regional facts and images retain source coverage and quiet, accessible reuse credits',()=>{
 for(const r of data.regions){
  const html=readFileSync(`dist/destinations/${r.slug}/index.html`,'utf8');
  const credits=['bhubaneswar','puri'].includes(r.slug)?html.match(/<section id="story-sources"[\s\S]*?<\/section>/)?.[0]:html.match(/<details id="sources"[\s\S]*?<\/details>/)?.[0];
  assert.ok(credits&&!/<details[^>]*\bopen\b/.test(credits));
  const claims=[r,...r.items,...r.facts,...r.sections.flatMap(s=>s.paragraphs)];
  for(const claim of claims){
   if(claim.kind==='sourced_summary')assert.ok(claim.source_ids.length);
   for(const id of claim.source_ids){assert.ok(data.sources[id]);assert.ok(credits.includes((['bhubaneswar','puri'].includes(r.slug)?(r.slug==='puri'?puriEditorial:editorial).sources.find(s=>s.id===id).url:data.sources[id].url).replaceAll('&','&amp;')));}
  }
  for(const id of new Set([r.hero,...r.items.map(i=>i.asset).filter(Boolean)])){
   const asset=data.assets[id];assert.ok(asset.alt&&asset.creator&&asset.changes);
   assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
   assert.ok(credits.includes(asset.creator)&&credits.includes(asset.license_url));
  }
 }
});
