import test from 'node:test';
import assert from 'node:assert/strict';
import {bindReadingRoom,readReadingQuery,readingQuery} from '../src/lib/reading-room-search.mjs';
import {pageShareURL} from '../src/lib/page-share.mjs';
function element(props={}){const events={};return {value:'',hidden:false,textContent:'',focused:false,addEventListener:(n,f)=>events[n]=f,emit(n,extra={}){const e={preventDefault(){this.prevented=true},...extra};events[n]?.(e);return e;},focus(){this.focused=true},...props};}
function fixture(search=''){
 const input=element(),group=element({options:['','Places','Trade'].map(value=>({value}))});
 const cards=[{search:'Chilika ଚିଲିକା lagoon',group:'Places'},{search:'Ports and trade Odisha',group:'Trade'},{search:'Koraput landscape',group:'Places'}].map(dataset=>element({dataset}));
 const nodes={'#reading-search':element(),'#reading-query':input,'#reading-group':group,'#reading-count':element(),'#reading-empty':element()};
 const history=['/reading-room/'+search],events={};let i=0;
 const win={location:new URL(history[0],'https://example.test'),addEventListener:(n,f)=>events[n]=f};
 win.history={state:{keep:'other state'},pushState(s,t,url){assert.equal(s.keep,'other state');history.splice(++i);history.push(url);win.location=new URL(url,win.location);},replaceState(s,t,url){assert.equal(s.keep,'other state');history[i]=url;win.location=new URL(url,win.location);}};
 bindReadingRoom({querySelector:q=>nodes[q],querySelectorAll:()=>cards},win);
 return {input,group,nodes,cards,history,win,visible:()=>cards.filter(c=>!c.hidden).map(c=>c.dataset.search),back(){if(i){win.location=new URL(history[--i],win.location);events.popstate();}},forward(){if(i<history.length-1){win.location=new URL(history[++i],win.location);events.popstate();}}};
}
test('reading-room deep links restore combined filters, count and empty result',()=>{
 const f=fixture('?q=Ports&collection=Trade');assert.deepEqual(f.visible(),['Ports and trade Odisha']);assert.equal(f.input.value,'Ports');assert.equal(f.group.value,'Trade');assert.match(f.nodes['#reading-count'].textContent,/1 research note · “Ports” · Trade/);
 const empty=fixture('?q=Ports&collection=Places');assert.equal(empty.visible().length,0);assert.equal(empty.nodes['#reading-empty'].hidden,false);
});
test('typing is reversible as one history step; collection, reset and Back/Forward restore controls',()=>{
 const f=fixture();for(const value of ['P','Po','Ports']){f.input.value=value;f.input.emit('input');}assert.equal(f.history.length,2);
 f.group.value='Trade';f.group.emit('change');assert.equal(f.history.length,3);
 f.nodes['#reading-search'].emit('reset');assert.equal(f.visible().length,3);assert.ok(f.input.focused);
 f.back();assert.equal(f.input.value,'Ports');assert.equal(f.group.value,'Trade');assert.equal(f.visible().length,1);
 f.back();assert.equal(f.group.value,'');f.back();assert.equal(f.input.value,'');f.forward();assert.equal(f.input.value,'Ports');
});
test('composition, keyboard submission and a new search preserve intentional history',()=>{
 const f=fixture();f.input.emit('compositionstart');f.input.value='ଚି';f.input.emit('input',{isComposing:true});f.nodes['#reading-search'].emit('submit');assert.equal(f.history.length,1);assert.equal(f.visible().length,3);
 f.input.value='ଚିଲିକା';f.input.emit('compositionend');f.input.emit('input');assert.equal(f.visible().length,1);assert.equal(f.history.length,2);
 f.nodes['#reading-search'].emit('submit');assert.ok(f.nodes['#reading-count'].focused);f.input.value='Koraput';f.input.emit('input');assert.equal(f.history.length,3);f.back();assert.equal(f.input.value,'ଚିଲିକା');
});
test('unknown collections fall back; URL text is bounded, encoded and rendered as text',()=>{
 const f=fixture('?collection=unknown&q='+encodeURIComponent('<img onerror=bad>'+('x'.repeat(250))));assert.equal(f.group.value,'');assert.equal(f.input.value.length,200);assert.equal(f.visible().length,0);assert.match(f.nodes['#reading-count'].textContent,/<img onerror=bad>/);
 const s={q:' ଚିଲିକା & boats ',collection:'Places'};assert.deepEqual(readReadingQuery(readingQuery(s,['Places']),['Places']),{q:s.q.trim(),collection:'Places'});
});
test('shared reading results use current rendered controls and exclude unrelated URL data',()=>{
 const location=new URL('https://projectodisha.org/reading-room/?q=stale&notes=private#draft');
 const url=new URL(pageShareURL(location,{q:' Ports & trade ',collection:'Trade'},{collections:['Places','Trade']}));
 assert.deepEqual([...url.searchParams],[['q','Ports & trade'],['collection','Trade']]);assert.equal(url.hash,'');
 const f=fixture(url.search);assert.equal(f.group.value,'Trade');assert.equal(f.input.value,'Ports & trade');
 assert.equal(pageShareURL(location,{collection:'invalid'},{collections:['Trade']}),'https://projectodisha.org/reading-room/');
});
