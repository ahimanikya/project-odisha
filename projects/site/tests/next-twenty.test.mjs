import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseSearch,matchesDiscovery,sortDiscoveries,discoveryQuery} from '../src/lib/discovery.mjs';
test('aliases and punctuation help discovery without destroying Odia signs',()=>{
 assert.equal(normaliseSearch('ଓଡ଼ିଆ'),'ଓଡ଼ିଆ'.normalize('NFKC'));
 assert.ok(matchesDiscovery({label:'Samanta Chandrasekhar',aliases:['Pathani Samanta']},{q:'PATHANI—SAMANTA'}));
 assert.ok(matchesDiscovery({label:'Odia',aliases:['ଓଡ଼ିଆ']},{q:'ଓଡ଼ିଆ'}));
 assert.ok(!matchesDiscovery({label:'Kuvi'},{q:'Kui'}));
 const rows=[{label:'Puri',href:'/puri/'},{label:'Chilika',href:'/chilika/'}];
 assert.equal(sortDiscoveries(rows,'title')[0].label,'Chilika');assert.equal(rows[0].label,'Puri');
 assert.equal(discoveryQuery({q:'',sort:'title'}),'sort=title');
});
import {emptyLibrary,addItem,addTrip,duplicateTrip,removeWithUndo,restoreRemoved,transferItem,journeyOverview} from '../src/lib/journey.mjs';
test('duplicate trips preserve notes and dates but remain independently editable',()=>{
 const l=emptyLibrary();l.trips[0].plan=addItem(l.trips[0].plan,'place:chilika');Object.assign(l.trips[0].plan,{title:'A'.repeat(120),startDate:'2026-11-01'});l.trips[0].plan.items[0].notes='Keep my note';
 const copy=duplicateTrip(l,'first','copy');assert.equal(copy.trips[1].plan.title.length,120);copy.trips[1].plan.items[0].notes='Changed';assert.equal(copy.trips[0].plan.items[0].notes,'Keep my note');assert.equal(l.trips.length,1);assert.equal(copy.trips[1].plan.startDate,'2026-11-01');
 const full={version:2,activeId:'t0',trips:Array.from({length:10},(_,i)=>({id:'t'+i,plan:l.trips[0].plan}))};assert.throws(()=>duplicateTrip(full,'t0','more'));
});
test('undo restores position, day and notes without replacing later edits or duplicates',()=>{
 let p=addItem(addItem(emptyLibrary().trips[0].plan,'place:chilika'),'place:konark');p.items[0]={id:'place:chilika',day:2,notes:'Early start'};
 const removed=removeWithUndo(p,'place:chilika');removed.plan.items[0].notes='A later edit';const restored=restoreRemoved(removed.plan,removed.undo);
 assert.deepEqual(restored.items[0],p.items[0]);assert.equal(restored.items[1].notes,'A later edit');assert.throws(()=>restoreRemoved(restored,removed.undo));
});
test('moving ideas is atomic, preserves notes, resets the day and rejects duplicates/full targets',()=>{
 let l=emptyLibrary();l.trips[0].plan=addItem(l.trips[0].plan,'place:chilika');l.trips[0].plan.items[0]={id:'place:chilika',day:4,notes:'My notes'};l=addTrip(l,'two');
 const moved=transferItem(l,'first','two','place:chilika');assert.equal(l.trips[0].plan.items.length,1);assert.deepEqual(moved.trips[1].plan.items,[{id:'place:chilika',day:0,notes:'My notes'}]);assert.equal(moved.trips[0].plan.items.length,0);
 const duplicate=structuredClone(l);duplicate.trips[1].plan=addItem(duplicate.trips[1].plan,'place:chilika');assert.throws(()=>transferItem(duplicate,'first','two','place:chilika'));assert.equal(duplicate.trips[0].plan.items.length,1);
 const full=structuredClone(l);full.trips[1].plan.items=Array.from({length:100},(_,i)=>({id:'place:x'+i,day:0,notes:''}));assert.throws(()=>transferItem(full,'first','two','place:chilika'));assert.equal(full.trips[0].plan.items.length,1);
 assert.deepEqual(journeyOverview(moved.trips[1].plan),{ideas:1,scheduledDays:0,later:1});
});
import {correctionDraft,publicIssueLink} from '../src/lib/correction.mjs';
test('new subjects have explicit validation and complete public drafts without automatic submission',()=>{
 const value={page:'__new__',subject:'A local story · ଓଡ଼ିଆ',kind:'Additional knowledge',correction:'Please consider this new subject.',evidence:'A book and page number',credit:'A reader'};
 const draft=correctionDraft(value,[]);assert.ok(draft.includes(value.subject)&&draft.includes('no existing page'));
 assert.throws(()=>correctionDraft({...value,subject:''},[]),e=>e.field==='subject');
 assert.throws(()=>correctionDraft({...value,page:'https://unlisted.example/'},[]),e=>e.field==='page');
 const prepared=publicIssueLink(value,[]);assert.equal(prepared.prefilled,true);assert.equal(new URL(prepared.url).searchParams.get('title'),'[Knowledge] '+value.subject);
 const long={...value,correction:'ଓଡ଼ିଆ '.repeat(1200)};assert.equal(publicIssueLink(long,[]).prefilled,false);assert.ok(correctionDraft(long,[]).includes(long.correction.trim()));
});
import {readFileSync} from 'node:fs';
test('new detail pages retain claim evidence, image credits and stable save IDs',()=>{
 const data=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
 const details=JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8'));
 const journey=readFileSync('dist/journey/index.html','utf8');
 const ids=[...journey.matchAll(/data-save-journey="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'A duplicate save ID could silently select the wrong catalogue entry');
 for(const r of details.records){
  const html=readFileSync(`dist/visit/${r.kind}/${r.slug}/index.html`,'utf8');assert.ok(html.includes(`data-save-journey="${r.save_id||((r.kind==='stays'?'stay':'place')+':'+r.slug)}"`));assert.ok(html.includes(`/destinations/${r.parent}/`));
  for(const section of r.sections)if(section.kind==='sourced_summary'){assert.ok(section.sources.length);for(const id of section.sources){const editorialPath=r.kind==='places'&&r.slug==='barabati'?'barabati-editorial.json':r.kind==='experiences'&&r.slug==='cuttack-netaji'?'netaji-museum-editorial.json':r.kind==='stays'&&r.slug==='cuttack'?'cuttack-stay-editorial.json':null;const sources=editorialPath?Object.fromEntries(JSON.parse(readFileSync('../../kb/research/destinations/'+editorialPath,'utf8')).sources.map(s=>[s.id,s])):data.sources;assert.ok(sources[id]&&r.sources.includes(id));}}
  const p=data.assets[r.photo_ref];assert.ok(html.includes(p.license_url)&&html.includes(p.creator));
 }
});
