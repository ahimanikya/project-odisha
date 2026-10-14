import test from 'node:test';
import assert from 'node:assert/strict';
import {pageShareURL} from '../src/lib/page-share.mjs';
const choices={topics:['All','Food','Places'],regions:['All','Across Odisha','Puri']};
test('Explore sharing preserves the rendered query, filters and order with safe URL encoding',()=>{
 const location=new URL('https://projectodisha.org/explore/?q=stale&token=private#private');
 const state={q:' piṭha & ପିଠା ',topic:'Food',region:'Across Odisha',sort:'title'};
 const result=new URL(pageShareURL(location,state,choices));
 assert.deepEqual([...result.searchParams],[['q','piṭha & ପିଠା'],['topic','Food'],['region','Across Odisha'],['sort','title']]);
 assert.equal(result.hash,'');assert.equal(result.origin,location.origin);
 assert.equal(state.q,' piṭha & ପିଠା ');
});
test('clean and invalid selections stay bounded and do not forward unrelated URL fields',()=>{
 const location=new URL('https://projectodisha.org/explore/?credit=private&topic=Bad#notes');
 assert.equal(pageShareURL(location,{},choices),'https://projectodisha.org/explore/');
 const result=new URL(pageShareURL(location,{q:'x'.repeat(250),topic:'Bad',region:'Unknown',sort:'evil',notes:'private'},choices));
 assert.equal(result.searchParams.get('q').length,200);
 assert.deepEqual([...result.searchParams.keys()],['q']);
});
test('journey, contribution and article links never include query, fragment or selected data',()=>{
 for(const pathname of ['/journey/','/contribute/','/knowledge/chilika/']) {
  const location=new URL('https://projectodisha.org'+pathname+'?notes=private&q=secret#draft');
  assert.equal(pageShareURL(location,{q:'secret',topic:'Food',region:'Puri',sort:'title'},choices),'https://projectodisha.org'+pathname);
 }
});

test('atlas sharing uses current controls and excludes unrelated data, even from the current URL',()=>{
 const location=new URL('https://projectodisha.org/languages/atlas/?language=stale&notes=private#draft');
 const result=new URL(pageShareURL(location,{language:'018000',residence:'rural',sort:'share',district:' Mayurbhanj '},{languages:['015000','018000']}));
 assert.deepEqual([...result.searchParams],[['language','018000'],['residence','rural'],['sort','share'],['district','Mayurbhanj']]);
 assert.equal(result.hash,'');
 assert.equal(result.origin,location.origin);
});
test('atlas sharing bounds district text, encodes Unicode, and rejects unrendered controls',()=>{
 const location=new URL('https://projectodisha.org/languages/atlas/');
 const choices={languages:['015000']};
 assert.deepEqual([...new URL(pageShareURL(location,{language:'015000'},choices)).searchParams],[['language','015000'],['residence','total'],['sort','count']]);
 const invalid=new URL(pageShareURL(location,{language:'invalid',residence:'invalid',sort:'invalid',district:'x'.repeat(250)},choices));
 assert.equal(invalid.searchParams.has('language'),false);
 assert.equal(invalid.searchParams.get('residence'),'total');assert.equal(invalid.searchParams.get('sort'),'count');
 assert.equal(invalid.searchParams.get('district').length,200);
 const query='ମୟୂରଭଞ୍ଜ & coast';
 assert.equal(new URL(pageShareURL(location,{district:query},choices)).searchParams.get('district'),query);
});

test('shared atlas links restore the same Census totals and district rows',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {selection,districtRows}=await import('../src/lib/language-atlas.mjs');
 const data=JSON.parse(await readFile(new URL('../../../kb/research/voices/population-2011.json',import.meta.url),'utf8'));
 const languages=Object.keys(data.labels);
 for(const language of ['015000',...languages.filter(code=>data.labels[code].level==='mother_tongue').slice(0,2)]) {
  for(const residence of ['total','rural','urban'])for(const sort of ['count','share','name']) {
   const state={language,residence,sort,district:'Mayurbhanj'};
   const query=new URL(pageShareURL(new URL('https://projectodisha.org/languages/atlas/'),state,{languages})).searchParams;
   assert.deepEqual(selection(data,query.get('language'),query.get('residence')),selection(data,language,residence));
   assert.deepEqual(districtRows(data,query.get('language'),query.get('residence'),query.get('sort'),query.get('district')),districtRows(data,language,residence,sort,state.district));
  }
 }
});
