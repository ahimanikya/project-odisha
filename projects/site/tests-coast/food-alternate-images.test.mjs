import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json'));
const read=path=>readFileSync('dist-coast'+path+'index.html','utf8');
const catalog=JSON.parse(read('/journey/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const replacements=[{slug:'dalma',id:'food:bhubaneswar-dalma',asset:'dalma-alternate',old:'dalma'},{slug:'tomato-poda',id:'food:tomato-poda',asset:'tomato-poda',old:'pakhala-tomato-poda'},{slug:'poda-pitha',id:'food:poda-pitha',asset:'poda-pitha',old:'poda-pitha-alternate'}];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Dalma and tomato poda retain their alternate photographs while Poda pitha restores its earlier photograph',()=>{
 for(const r of replacements){
  const page=foods.pages.find(p=>p.slug===r.slug),photo=foods.assets[r.asset],old=foods.assets[r.old],html=read('/food/'+r.slug+'/');
  assert.equal(page.hero,r.asset);assert.notEqual(photo.src,old.src);
  const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
  assert.ok(images.some(tag=>tag.includes(`src="${photo.src}"`)),r.slug);
  assert.ok(!images.some(tag=>tag.includes(`src="${old.src}"`)),r.slug+' stale photograph');
  for(const text of [photo.alt,photo.caption,photo.creator,photo.source,photo.license_url])assert.ok(html.includes(escape(text)),r.slug+' credit');
  assert.equal(createHash('sha256').update(readFileSync('dist-coast'+photo.src)).digest('hex'),photo.sha256);
 }
 assert.doesNotMatch(read('/food/dalma/'),/A black pan rests on orange cloth/);
 assert.doesNotMatch(read('/food/tomato-poda/'),/photograph keeps pakhala at the centre/);
 const poda=foods.pages.find(p=>p.slug==='poda-pitha');
 assert.ok(read('/food/poda-pitha/').includes(escape(poda.sections[0].paragraphs[0].text)));
 assert.match(read('/food/poda-pitha/'),/mag-cover--contain/);
 assert.doesNotMatch(read('/food/poda-pitha/'),/interior is not visible/);
});
test('saved food identities and illustrated readings follow the new photographs',()=>{
 const plan={version:1,title:'Three dishes to understand',items:replacements.map(r=>({id:r.id,day:1,notes:''}))};
 const images={};
 for(const r of replacements){
  const item=catalog.find(i=>i.id===r.id),photo=foods.assets[r.asset];
  assert.ok(item);assert.equal(item.href,'/food/'+r.slug+'/');assert.equal(item.photo.src,photo.src);
  images[photo.src]='data:image/png;base64,AAAA';
 }
 const book=buildTourBook(plan,catalog,{images,illustrated:true});
 for(const r of replacements){
  const photo=foods.assets[r.asset];
  for(const text of [photo.caption,photo.creator,photo.source,photo.license_url])assert.ok(book.includes(escape(text)),r.slug+' portable credit');
 }
});
test('connected food views update while the Pakhala meal photograph remains unchanged',()=>{
 const dalma=foods.assets['dalma-alternate'],tomato=foods.assets['tomato-poda'],poda=foods.assets['poda-pitha'];
 for(const route of ['/food/','/food/three-tastes/','/journey-starters/bhubaneswar-objects-ideas/'])assert.ok(read(route).includes(`src="${dalma.src}"`),route);
 for(const route of ['/food/','/food/fire-cooking/'])assert.ok(read(route).includes(`src="${tomato.src}"`),route);
 for(const route of ['/food/','/food/everyday/','/food/fire-cooking/'])assert.ok(read(route).includes(`src="${poda.src}"`),route);
 assert.ok(read('/food/three-tastes/').match(/<meta property="og:image" content="([^"]+)"/)[1].endsWith(dalma.src));
 const hub=read('/food/'),pakhala=[...hub.matchAll(/<article\b[^>]*class="[^"]*\bplanning-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]).find(card=>card.includes('data-save-journey="food:pakhala"'));
 assert.ok(pakhala.includes(`src="${foods.assets['pakhala-tomato-poda'].src}"`));
});
