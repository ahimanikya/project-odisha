import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,planningContext} from '../src/lib/tour-book.mjs';
import {correctionDraft} from '../src/lib/correction.mjs';
const entries=[{id:'place:a',title:'Shore',kind:'Place',area:'Balasore',summary:'Watch & listen.',href:'/visit/places/chandipur/',checked:'2026-09-30',access:'Check the tide.',sources:[{title:'Reference',url:'https://example.org/source'}]},{id:'place:b',title:'Forest',kind:'Place',area:'Mayurbhanj',summary:'Leave time.',href:'/visit/places/similipal/',checked:'2026-09-30',access:'Confirm entry.',sources:[{title:'Reference',url:'https://example.org/source'}]}];
const plan={version:1,title:'A coastal <journey>',startDate:'2027-01-31',items:[{id:'place:a',day:2,notes:'Bring water.\nAsk about access.'},{id:'place:b',day:2,notes:''},{id:'place:old',day:0,notes:'Keep this unknown stop.'}]};
test('offline text book preserves days, personal notes, unavailable IDs and deduplicated evidence',()=>{
 const html=buildTourBook(plan,entries,{baseURL:'https://projectodisha.org',generatedAt:'2026-09-30'});
 for(const text of ['1 Feb 2027','Ideas for later','Bring water.\nAsk about access.','Keep this unknown stop.','Unavailable item: place:old','Check the tide.','A coastal &lt;journey&gt;','Several areas: Balasore · Mayurbhanj'])assert.ok(html.includes(text),text);
 assert.equal((html.match(/href="https:\/\/example.org\/source"/g)||[]).length,1);
 assert.ok(html.includes('href="https://projectodisha.org/visit/places/chandipur/"'));
 assert.ok(!/<script|<img|<link|<iframe|<form/i.test(html));
 assert.ok(html.includes("default-src 'none'"));
});
test('offline output treats hostile imported text as text and omits unsafe links',()=>{
 const hostile={...plan,title:'</title><script>alert(1)</script>',items:[{id:'place:a',day:0,notes:'<img src=x onerror=alert(1)> " &'}]};
 const html=buildTourBook(hostile,[{...entries[0],href:'javascript:alert(1)',sources:[{title:'bad',url:'data:text/html,evil'}]}]);
 assert.ok(html.includes('&lt;script&gt;')&&html.includes('&lt;img'));
 assert.ok(!/<script|<img|href="(?:javascript|data):/i.test(html));
 assert.throws(()=>buildTourBook({...plan,version:9},entries));
});
test('offline book handles an empty trip and the largest supported notes without truncation',()=>{
 assert.ok(buildTourBook({version:1,title:'',items:[]},entries).includes('No saved choices yet'));
 const large={version:1,title:'Large journey',items:Array.from({length:100},(_,i)=>({id:'place:x'+i,day:30,notes:'ଅ'.repeat(2990)+'END-'+i}))};
 assert.ok(buildTourBook(large,entries).includes('END-99'));
});
test('planning guidance compares real areas without treating reading as travel or inventing timing',()=>{
 const c=new Map([...entries,{id:'reading:x',kind:'Reading',area:'Culture & language'}].map(i=>[i.id,i]));
 assert.deepEqual(planningContext([{id:'place:a'},{id:'reading:x'}],c).areas,['Balasore']);
 assert.equal(planningContext([{id:'missing'}],c).areas.length,0);
 assert.match(planningContext(plan.items,c).message,/not a verified route/);
});
test('correction drafts validate the entry and evidence without claiming submission',()=>{
 const pages=[{title:'Chandipur',href:'/visit/places/chandipur/'}];
 const good={page:pages[0].href,kind:'Personal recollection',correction:'I remember this place differently.',evidence:'A family visit in 2010.',credit:'Test reader'};
 const draft=correctionDraft(good,pages);assert.match(draft,/Not submitted/);assert.match(draft,/Test reader/);
 for(const bad of [{...good,page:'https://evil.invalid'},{...good,correction:''},{...good,evidence:''},{...good,credit:'x'.repeat(121)},{...good,kind:'Publish now'}])assert.throws(()=>correctionDraft(bad,pages));
});
test('new destination detail claims have evidence and preserve the existing saved identities',()=>{
 const records=JSON.parse(readFileSync('../../kb/research/destinations/northern-details.json','utf8')).records;
 const regions=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
 for(const r of records){
  const html=readFileSync(`dist/visit/${r.kind}/${r.slug}/index.html`,'utf8');
  const item=regions.regions.flatMap(region=>region.items).find(i=>i.detail_href===`/visit/${r.kind}/${r.slug}/`);
  assert.ok(item,r.slug);assert.ok(html.includes(`data-save-journey="${item.id}"`));
  assert.ok(html.includes(`/destinations/${r.parent}/`));
  for(const section of r.sections)if(section.kind==='sourced_summary'){assert.ok(section.sources.length);for(const id of section.sources)assert.ok(regions.sources[id]&&r.sources.includes(id));}
  for(const id of r.gallery||[])assert.ok(html.includes(regions.assets[id].creator)&&html.includes(regions.assets[id].license_url));
 }
});

test('both portable editions retain practical guidance, source trail and escaped text',()=>{
 const notes=[{heading:'When <to go>',text:'Winter & a flexible day.'},{heading:'Local arrangements',text:'Ask about access.'}];
 for(const illustrated of [false,true]){
  const html=buildTourBook(plan,[{...entries[0],practical:notes},entries[1]],{illustrated});
  assert.ok(html.includes('When &lt;to go&gt;')&&html.includes('Winter &amp; a flexible day.'));
  assert.ok(html.includes('Ask about access.')&&html.includes('Keep this unknown stop.'));
  assert.equal((html.match(/href="https:\/\/example.org\/source"/g)||[]).length,1);
 }
});
