import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
const read=route=>readFileSync('dist-coast'+route+'index.html','utf8');
const catalog=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const food=JSON.parse(readFileSync('../../kb/research/food/collection.json'));
const bose=JSON.parse(readFileSync('../../kb/research/people/subhas-chandra-bose.json'));
test('Odisha roots pages keep archival limits and modern image context visible in the delivered story',()=>{
 const sweet=read('/food/odisha-rasagola/'),childhood=read('/people/subhas-chandra-bose/');
 for(const phrase of ['Niladri Bije','Dandi Ramayana','Pahala','Salepur','original temple record and poem have not been examined','29 July 2019'])assert.ok(sweet.includes(phrase),phrase);
 for(const phrase of ['1897','1902','1909','Beni Madhav Das','Bengali exposed a gap','unfinished autobiography','2013','establishes no right of entry'])assert.ok(childhood.includes(phrase),phrase);
 assert.ok(!childhood.includes('A literary life'));
 assert.match(childhood,/<figure class="chapter-photo"/);
 assert.match(childhood,/<img[^>]+ravenshaw-collegiate-school[^>]+srcset=/);
 assert.ok(read('/food/puri-coast/').includes('href="/food/odisha-rasagola/"'));
 assert.ok(read('/visit/experiences/cuttack-netaji/').includes('href="/people/subhas-chandra-bose/"'));
 const explore=read('/explore/');for(const path of ['/food/odisha-rasagola/','/people/subhas-chandra-bose/'])assert.ok(explore.includes(`href="${path}"`));
});
test('the new sweet and childhood reading save distinct items and carry their evidence into both offline books',()=>{
 const ids=['food:odisha-rasagola','reading:people/subhas-chandra-bose','experience:cuttack-netaji'];
 const plan={version:1,title:'Odisha roots',items:ids.map((id,i)=>({id,day:i+1,notes:'Keep my own question.'}))};
 for(const id of ids){const matches=catalog.filter(i=>i.id===id);assert.equal(matches.length,1,id);assert.ok(read(matches[0].href).includes(`data-save-journey="${id}"`));}
 assert.equal(catalog.find(i=>i.id===ids[1]).kind,'Reading');assert.equal(catalog.find(i=>i.id===ids[2]).kind,'Experience');
 for(const book of [buildTourBook(plan,catalog),buildTextItinerary(plan,catalog)])for(const phrase of ['Beni Madhav Das','Record of Rights','original temple record and poem have not been examined','Keep my own question.','An Indian Pilgrim','GIRPublicSearch/Application/Details/612'])assert.ok(book.includes(phrase),phrase);
 const puriSection=read('/food/puri-coast/').match(/<section id="rasagola"[\s\S]*?<\/section>/)[0];assert.ok(puriSection.includes('data-save-journey="food:odisha-rasagola"'));assert.ok(!puriSection.includes('data-save-journey="food:puri-mahaprasad"'));
});
test('new real photographs ship unchanged from recorded derivatives with end-of-page credit and licences',()=>{
 for(const [asset,route] of [[food.assets['pahala-rasagola'],'/food/odisha-rasagola/'],[bose.assets.school,'/people/subhas-chandra-bose/']]){
  const bytes=readFileSync('dist-coast'+asset.src);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  const credits=route==='/food/odisha-rasagola/'?read(route).match(/<div id="food-image-credits"[\s\S]*?<\/div>/)[0]:read(route).match(/<div id="bose-image-credits"[\s\S]*?<\/div>/)[0];for(const text of [asset.creator,asset.source,asset.license_url])assert.ok(credits.includes(text),text);
 }
});
