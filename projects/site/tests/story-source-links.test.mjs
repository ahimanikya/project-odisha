import test from 'node:test';
import assert from 'node:assert/strict';
import {bindStorySourceLinks} from '../src/lib/story-source-links.mjs';
function fixture(){
 const callbacks=[],events={};const panel={tagName:'DETAILS',open:false};
 const note={tagName:'LI',parentElement:panel,hasAttribute:()=>true,querySelector:()=>null,focus(){note.focused=true;},scrollIntoView(){note.visible=true;}};
 const doc={getElementById:id=>id==='story-source-one'?note:null,defaultView:{requestAnimationFrame:fn=>callbacks.push(fn)}};
 const link={getAttribute:()=> '#story-source-one',addEventListener:(kind,fn)=>events[kind]=fn};
 bindStorySourceLinks({querySelectorAll:()=>[link]},doc);
 return {panel,note,callbacks,events,link};
}
test('source activation reveals its note then aligns and focuses it after native navigation',()=>{
 const f=fixture();f.events.click({preventDefault:()=>assert.fail('retain native fragment/history')});
 assert.equal(f.panel.open,true);assert.equal(f.note.visible,undefined);
 f.callbacks.shift()();assert.equal(f.note.visible,true);assert.equal(f.note.focused,true);
 f.panel.open=false;f.note.visible=false;f.events.click({});f.callbacks.shift()();
 assert.equal(f.panel.open,true);assert.equal(f.note.visible,true);
});
test('modified clicks and missing source destinations do not interrupt reading',()=>{
 for(const event of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}]){
  const f=fixture();f.events.click(event);assert.equal(f.panel.open,false);assert.equal(f.callbacks.length,0);
 }
 const f=fixture();f.link.getAttribute=()=> '#missing';f.events.click({});assert.equal(f.callbacks.length,0);
});
