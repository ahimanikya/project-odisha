import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {districtHref,count} from '../src/lib/language-atlas.mjs';
const atlas=JSON.parse(readFileSync('../../kb/research/voices/population-2011.json'));
const connections=JSON.parse(readFileSync('../../kb/research/voices/district-connections.json'));
const read=p=>readFileSync('dist-coast'+p+'index.html','utf8');
test('all 30 district profiles expose historical denominators, nested entries and rural/urban views',()=>{
 const index=read('/languages/districts/');for(const area of Object.values(atlas.areas).filter(a=>a.code!=='000')){
  const path=districtHref(area),html=read(path);assert.ok(index.includes('href="'+path+'"'));assert.ok(html.includes(count(area.population[0])));
  for(const text of ['Census 2011','Do not add both tables together','Rural population breakdown','Urban population breakdown','No migration or ancestry claim'])assert.ok(html.includes(text),path+': '+text);
  assert.ok(html.includes('District code '+area.code));assert.match(html,/noindex, nofollow/);
 }
});
test('destination language links use district context without calling city counts district counts',()=>{
 for(const c of connections.connections){const html=read('/destinations/'+c.destination+'/');assert.ok(html.includes('id="local-languages"'));assert.ok(html.includes(districtHref(atlas.areas[c.district])));assert.ok(html.includes(c.note));assert.ok(html.includes('do not establish what a particular person speaks today'))}
});
test('new reading stories preserve attribution, census mappings and portable notes',()=>{
 const catalog=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 for(const [slug,code] of [['sambalpuri','015058'],['desia','015014']]){
  const html=read('/languages/'+slug+'/'),item=catalog.find(i=>i.id==='reading:languages/'+slug);assert.ok(item);assert.ok(item.practical.length>=2);assert.ok(item.sources.length>=2);assert.ok(html.includes('language='+code));if(slug==='sambalpuri')assert.match(html,/Footnotes &amp; Sources/);else assert.match(html,/Sources, image credits/);
 }
 assert.match(read('/languages/sambalpuri/'),/Mitrabhanu Gountia/);assert.match(read('/languages/desia/'),/testing and revision still to come/);
 assert.match(read('/languages/multilingual-odisha/'),/1,38,25,024/);assert.match(read('/languages/multilingual-odisha/'),/55,25,278/);
 assert.match(read('/languages/multilingual-odisha/'),/No additional language reported/);
});
test('atlas links each district from its server-rendered distribution table',()=>{
 const html=read('/languages/atlas/');for(const area of Object.values(atlas.areas).filter(a=>a.code!=='000'))assert.ok(html.includes(districtHref(area)));
});
