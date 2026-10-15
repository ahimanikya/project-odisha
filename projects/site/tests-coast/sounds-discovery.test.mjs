import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {matchesDiscovery} from '../src/lib/discovery.mjs';
const html=readFileSync('dist-coast/explore/index.html','utf8');
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const cards=[...html.matchAll(/<article\b[^>]*data-entry="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(([,data,body])=>({...JSON.parse(decode(data)),href:body.match(/href="([^"]+)"/)[1]}));
const sounds=JSON.parse(readFileSync('../../kb/research/product/sounds-discovery.json','utf8')).entries;
const find=query=>cards.filter(c=>matchesDiscovery(c,query)).map(c=>c.href);

test('Explore delivers every sound reader once with matching title, lead and a real public route',()=>{
 assert.equal(sounds.length,22);
 for(const item of sounds){
  const rows=cards.filter(c=>c.href===item.href);assert.equal(rows.length,1,item.href);
  const original=JSON.parse(readFileSync('../../kb/'+item.source,'utf8'));
  assert.equal(rows[0].label,original.title);assert.equal(rows[0].dek,original.lead);
  assert.ok(existsSync('dist-coast'+item.href+'index.html'),item.href);
 }
 assert.equal(new Set(cards.map(c=>c.href)).size,cards.length);
});
test('names, existing Odia strings and sound terms reach the intended story through built search data',()=>{
 for(const [q,href] of [
  ['ହୁଳହୁଳି','/sounds-of-odisha/huluhuli/'],['ululation','/sounds-of-odisha/huluhuli/'],
  ['ଶଙ୍ଖ','/sounds-of-odisha/sankha/'],['Jodi Sankha','/sounds-of-odisha/sankha/'],
  ['Mardala','/sounds-of-odisha/mardala/'],['Bhaijuntia','/sounds-of-odisha/dalkhai/'],
  ['wooden rhythm','/sounds-of-odisha/daskathia/'],['ghanti','/sounds-of-odisha/ghanta-ghanti/'],
  ['poetry performance','/sounds-of-odisha/pala/'],['Dhemsa','/sounds-of-odisha/dhemsa/'],
  ['Prahallada Nataka','/stories/prahlada-nataka/'],['Danda Nacha','/stories/danda-nata/'],['Chaiti Ghoda Nacha','/stories/chaiti-ghoda/'],['Utsab Charan Das','/stories/chaiti-ghoda/'],['Ranappa','/stories/ranapa/'],['Muhuri','/stories/mahuri/'],['Kendara Badya','/stories/kendara/'],['Nauria geeta','/stories/boat-songs/'],['Chaiti Ghoda','/stories/boat-songs/'],['wetland listening','/stories/chilika-listening/'],['craft listening','/stories/craft-listening/'],['Nanabaya Gita','/stories/odia-lullabies/'],['Nida Mausi','/stories/odia-lullabies/'],['Gotipua','/stories/gotipua/'],['visitor listening notebook','/sounds-of-odisha/listening-notebook/']
 ])assert.ok(find({q}).includes(href),q);
 assert.deepEqual(find({q:'Sounds of Odisha',topic:'Living culture'}).sort(),sounds.map(x=>x.href).sort());
 assert.deepEqual(find({q:'Sounds of Odisha',topic:'Food'}),[]);
 assert.deepEqual(find({q:'Sounds of Odisha',region:'Koraput'}),['/sounds-of-odisha/dhemsa/','/stories/craft-listening/']);
 assert.deepEqual(find({q:'conch',region:'Ganjam'}),['/sounds-of-odisha/sankha/','/stories/mahuri/']);
 assert.deepEqual(find({q:'Gotipua',region:'Koraput'}),[]);
});
test('internal discovery does not make the sound routes externally indexable',()=>{
 for(const item of sounds){
  const page=readFileSync('dist-coast'+item.href+'index.html','utf8');
  assert.match(page,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
 }
});
