import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchesDiscovery} from '../src/lib/discovery.mjs';
const read=p=>readFileSync(p,'utf8');
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&amp;','&');
const cards=[...read('dist-coast/explore/index.html').matchAll(/<article\b[^>]*data-entry="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(([,data,body])=>({...JSON.parse(decode(data)),href:body.match(/href="([^"]+)"/)[1]}));
const route='/stories/nimuhi-temple/';
test('Nimuhi is discoverable once by literary and local names with correct filters',()=>{
 const entries=cards.filter(c=>c.href===route);assert.equal(entries.length,1);
 assert.equal(entries[0].category,'Literature');assert.deepEqual(entries[0].regions,['Subarnapur']);
 for(const q of ['Nimuhi','Sashisena','Shashisena','Sasisena','Ahimanikya','Sonepur','Suvarnapura','Pratap Ray','doorless temple']){
  assert.deepEqual(cards.filter(c=>matchesDiscovery(c,{q,topic:'Literature',region:'Subarnapur'})).map(c=>c.href),[route],q);
 }
 assert.ok(!matchesDiscovery(entries[0],{q:'Nimuhi',topic:'Food'}));
 assert.ok(!matchesDiscovery(entries[0],{q:'Nimuhi',region:'Puri'}));
 const page=read('dist-coast'+route+'index.html');assert.ok(page.includes(entries[0].label));
 assert.match(page,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
 const selected=JSON.parse(read('editions/search-candidate.json'));assert.ok(JSON.stringify(selected).includes('Article published on explicit author request'));
});
