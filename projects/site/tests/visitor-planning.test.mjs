import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJourney,emptyJourney,togglePreparation,addItem,emptyLibrary,addTrip,duplicateTrip,parseBackup,loadLibrary,LIBRARY_KEY} from '../src/lib/journey.mjs';
import {preparationRows} from '../src/lib/preparation.mjs';
import {buildTourBook} from '../src/lib/tour-book.mjs';
test('older plans retain their shape and checklist changes preserve notes, dates and unknown marks',()=>{
 const old={...addItem(emptyJourney(),'place:chilika'),startDate:'2026-12-01'};old.items[0].notes='A quiet morning';assert.deepEqual(validateJourney(old),old);
 const checked=togglePreparation({...old,checklist:['future-reminder']},'access',true);assert.equal(old.checklist,undefined);assert.deepEqual(checked.items,old.items);assert.equal(checked.startDate,old.startDate);
 assert.deepEqual(togglePreparation(checked,'access',false).checklist,['future-reminder']);assert.ok(preparationRows(checked).find(r=>r.id==='future-reminder').done);
 assert.deepEqual(addItem(checked,'place:konark').checklist,['future-reminder','access']);
});
test('checklists survive collection backups and duplication without leaking edits to other trips',()=>{
 let library=emptyLibrary();library.trips[0].plan=togglePreparation(library.trips[0].plan,'food',true);library=addTrip(library,'second');
 assert.equal(library.trips[1].plan.checklist,undefined);library=duplicateTrip(library,'first','copy');assert.deepEqual(library.trips[2].plan.checklist,['food']);
 library.trips[2].plan=togglePreparation(library.trips[2].plan,'food',false);assert.deepEqual(library.trips[0].plan.checklist,['food']);assert.deepEqual(parseBackup(JSON.stringify(library)),library);
});
test('malformed checklist backups are blocked rather than silently discarding marks',()=>{
 for(const checklist of [true,'access',['access','access'],['<script>'],Array.from({length:41},(_,i)=>'id'+i)]){
  const invalid={...emptyJourney(),checklist};assert.throws(()=>validateJourney(invalid));
  const raw=JSON.stringify({version:2,activeId:'first',trips:[{id:'first',plan:invalid}]});let writes=0;
  const loaded=loadLibrary({getItem:key=>key===LIBRARY_KEY?raw:null,setItem:()=>writes++});assert.equal(loaded.status,'blocked');assert.equal(writes,0);
 }
});
test('both offline editions include marked and unmarked prompts plus retained unknown items',()=>{
 const plan=togglePreparation({...emptyJourney(),checklist:['future-reminder']},'transport',true);
 for(const illustrated of [false,true]){const html=buildTourBook(plan,[],{illustrated});assert.match(html,/Done — Plan the outward and return journeys/);assert.match(html,/To check — Check opening, entry and access arrangements/);assert.match(html,/Done — Saved checklist item: future-reminder/);assert.match(html,/not verified by Project Odisha/);}
});
test('the three planning collections expose valid, unique save targets and property limitations',()=>{
 const journey=readFileSync('dist/journey/index.html','utf8'),ids=new Set([...journey.matchAll(/data-save-journey="([^"]+)"/g)].map(m=>m[1]));
 for(const path of ['food','things-to-do','stay-areas']){const html=readFileSync(`dist/${path}/index.html`,'utf8'),targets=[...html.matchAll(/data-save-journey="([^"]+)"/g)].map(m=>m[1]);assert.ok(targets.length>0);assert.equal(new Set(targets).size,targets.length);for(const id of targets)assert.ok(ids.has(id),id);assert.ok(html.includes('/journey/#preparation'));}
 assert.match(readFileSync('dist/stay-areas/index.html','utf8'),/No property here has been inspected or endorsed/);
});
