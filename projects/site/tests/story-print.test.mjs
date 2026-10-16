import test from 'node:test';
import assert from 'node:assert/strict';
import {bindStoryPrint} from '../src/lib/story-print.mjs';
function fixture(open=false,tagName='DETAILS'){
 const notes={open,tagName},unrelated={open:false},events={};
 const doc={getElementById:id=>id==='story-sources'?notes:null};
 const win={addEventListener:(name,fn)=>{events[name]=fn;}};
 bindStoryPrint(doc,win);return {notes,unrelated,events};
}
test('printing exposes closed evidence and restores it after printing or cancellation',()=>{
 const {notes,unrelated,events}=fixture();
 events.beforeprint();assert.equal(notes.open,true);assert.equal(unrelated.open,false);
 events.afterprint();assert.equal(notes.open,false);
 events.beforeprint();assert.equal(notes.open,true);events.afterprint();assert.equal(notes.open,false);
});
test('pre-opened evidence stays open and repeated beforeprint does not replace original state',()=>{
 for(const original of [false,true]){
  const {notes,events}=fixture(original);
  events.beforeprint();events.beforeprint();assert.equal(notes.open,true);
  events.afterprint();assert.equal(notes.open,original);events.afterprint();assert.equal(notes.open,original);
 }
});
test('ordinary pages and a non-disclosure source region install no print handlers',()=>{
 const win={addEventListener:()=>assert.fail('unrelated page must be untouched')};
 bindStoryPrint({getElementById:()=>null},win);
 bindStoryPrint({getElementById:()=>({tagName:'SECTION'})},win);
});
