import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json')),scope=JSON.parse(readFileSync('editions/coast.json'));
const read=p=>readFileSync('dist-coast'+p+'index.html','utf8');
const catalog=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
test('both pitha stories carry licensed photographs, sources and portable practical notes',()=>{
 for(const slug of ['enduri-pitha','poda-pitha']){
  const page=foods.pages.find(p=>p.slug===slug),asset=foods.assets[page.hero],html=read('/food/'+slug+'/'),item=catalog.find(i=>i.id===page.save_id);
  assert.ok(item);assert.equal(item.photo.src,asset.src);assert.equal(item.practical.length,page.sections.length);assert.ok(item.sources.length>=2);
  assert.match(html,/noindex, nofollow/);assert.ok(html.includes(asset.creator));assert.ok(html.includes(asset.license_url));assert.ok(html.includes(asset.alt));
  assert.equal(createHash('sha256').update(readFileSync('dist-coast'+asset.src)).digest('hex'),asset.sha256);
  assert.ok(read('/food/').includes(page.save_id));assert.ok(read('/explore/').includes('/food/'+slug+'/'));
  assert.match(html,/By Ahimanikya Satapathy/);assert.match(html,/id="story-sources"/);assert.match(html,/Footnotes &amp; Sources/);assert.doesNotMatch(html,/human editorial review pending/);
 }
});
test('food crosslinks connect the new stories without changing an existing saved-item identity',()=>{
 assert.equal(foods.pages.find(p=>p.slug==='chhena-poda').save_id,'food:konark-chhena-poda');
 for(const slug of ['chhena-poda','enduri-pitha','poda-pitha'])for(const target of ['enduri-pitha','poda-pitha'].filter(t=>t!==slug))assert.ok(read('/food/'+slug+'/').includes('href="/food/'+target+'/"'));
 assert.match(read('/food/enduri-pitha/'),/paneer/);for(const name of ['Sujata Dehury','Sweta Biswal'])assert.ok(read('/food/poda-pitha/').includes(name));
});
test('internal workbench and held commercial or disputed-food pages remain outside the coastal website',()=>{
 for(const path of ['/editorial-workbench/','/store/','/food/kendrapara-rasabali/','/food/dhenkanal-magji/']){assert.ok(!scope.routes.includes(path));assert.ok(!existsSync('dist-coast'+path+'index.html'))}
 assert.doesNotMatch(read('/'),/From knowledge to stories|editorial-workbench\.json/);
});
