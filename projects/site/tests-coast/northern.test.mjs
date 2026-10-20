import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {emptyLibrary,addItem} from '../src/lib/journey.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8');
const data=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const details=JSON.parse(readFileSync('../../kb/research/destinations/northern-details.json')).records;
test('northern starters create distinct unscheduled plans while preserving a previous trip',()=>{
 const old=emptyLibrary();old.trips[0].plan=addItem(old.trips[0].plan,'place:chilika');old.trips[0].plan.items[0].notes='Keep my lake question';old.trips[0].plan.startDate='2026-12-12';
 const before=structuredClone(old);
 for(const id of ['northern-stories','mayurbhanj-forest-culture']){
  const starter=data.starters.find(s=>s.id===id),next=createStarterTrip(old,id,starter,data.catalog.map(i=>i.id));
  assert.deepEqual(old,before);assert.deepEqual(next.trips[0],before.trips[0]);assert.equal(next.trips[1].plan.items.length,5);
  const book=buildTourBook(next.trips[1].plan,data.catalog);
  for(const phrase of id==='northern-stories'?['Balasore town','Chandipur coast','portion','Fakir Mohan']:['Pithabata','Kaliani','Jamuani, Gurguria, Kumari and Barehipani','day-entry passes','overnight reservations','certified local nature guide','Mayurbhanj Chhau','chicken'])assert.ok(book.includes(phrase),phrase);
 }
});
test('northern guidance, stay comparisons and source links survive both offline formats',()=>{
 for(const detail of details){
  const item=data.catalog.find(i=>i.href===`/visit/${detail.kind}/${detail.slug}/`);assert.ok(item,detail.slug);
  const plan={version:1,title:'Northern test',items:[{id:item.id,day:1,notes:'ମୋ ଯାତ୍ରା · keep this note'}]};
  const html=buildTourBook(plan,data.catalog),text=buildTextItinerary(plan,data.catalog);
  for(const s of detail.sections){assert.ok(html.includes(escapeHTML(s.text)),s.heading);assert.ok(text.includes(s.text));for(const o of s.options||[]){assert.ok(html.includes(escapeHTML(o.area)));assert.ok(text.includes(o.transport));}}
  for(const source of item.sources){assert.ok(html.includes(escapeHTML(source.url)));assert.ok(text.includes(source.url));}
  assert.ok(html.includes('ମୋ ଯାତ୍ରା'));assert.ok(text.includes('keep this note'));
 }
});
test('regional pages link every new guide and photographs retain their actual context',()=>{
 for(const [parent,paths] of Object.entries({balasore:['/visit/places/chandipur/','/visit/stays/balasore-coast/','/food/balasore/'],mayurbhanj:['/visit/places/similipal/','/visit/stays/similipal-gateways/','/visit/experiences/mayurbhanj-chhau/','/food/mudhi-mansa/']})){
  const html=read('/destinations/'+parent+'/');for(const path of paths)assert.ok(html.includes(`href="${path}"`),path);
  assert.ok(html.includes('mag-cover'));if(parent==='mayurbhanj')assert.ok(html.includes('href="/languages/santali/"'));
 }
 assert.ok(read('/food/mudhi-mansa/').includes('home-cooked variation'));
 assert.ok(read('/visit/stays/similipal-gateways/').includes('not a camp or room'));
 const a=JSON.parse(readFileSync('../../kb/records/northern-image-provenance.json')).new_assets['mayurbhanj-chhau'];
 assert.equal(createHash('sha256').update(readFileSync('dist-coast'+a.src)).digest('hex'),a.sha256);
 assert.ok(read('/visit/experiences/mayurbhanj-chhau/').includes(a.license_url));
 assert.equal(data.catalog.find(i=>i.id==='food:konark-chhena-poda').href,'/food/chhena-poda/');
});
