import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
import * as analytics from '../src/lib/analytics.mjs';
const component=readFileSync(new URL('../src/components/Analytics.astro',import.meta.url),'utf8');
const script=stripTypeScriptTypes(component.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/m,''));
function fixture({saved=null,settings=false,storageFails=false,origin='https://projectodisha.org'}={}){
 const events={},loads=[],writes=[],cleared=[];let reloads=0;
 const node=()=>({hidden:true,textContent:'',handlers:{},addEventListener(k,fn){this.handlers[k]=fn;},focus(){this.focused=true;},blur(){this.focused=false;}});
 const accept=node(),decline=node(),panel=node(),status=node(),preferences=settings?node():null;
 accept.dataset={analytics:'accepted'};decline.dataset={analytics:'declined'};
 panel.querySelectorAll=()=>[accept,decline];panel.querySelector=()=>accept;
 const config={id:'G-ABC1234567',canonical:'https://projectodisha.org/how-to-use/',title:'Privacy',allowedPaths:['/how-to-use/']};
 const nodes={'analytics-config':{textContent:JSON.stringify(config)},'analytics-choice':panel,'analytics-status':status,'analytics-settings':preferences};
 const document={getElementById:id=>nodes[id],createElement:()=>({}),head:{append:s=>loads.push(s)},get cookie(){return '_ga=test; _ga_EXAMPLE=test; unrelated=keep';},set cookie(v){cleared.push(v);}};
 const window={addEventListener:(k,fn)=>{events[k]=fn;}};
 runInNewContext(script,{...analytics,document,window,location:{origin,pathname:'/how-to-use/',reload(){reloads++;}},localStorage:{getItem(){return saved;},setItem(k,v){if(storageFails)throw Error('Blocked');writes.push([k,v]);}}});
 return {panel,status,preferences,accept,decline,loads,writes,cleared,events,window,get reloads(){return reloads;}};
}
test('acceptance dismisses the prompt without a visible success message or preference strip',()=>{
 const f=fixture();assert.equal(f.panel.hidden,false);assert.equal(f.loads.length,0);
 f.accept.handlers.click();assert.equal(f.panel.hidden,true);assert.equal(f.status.hidden,true);assert.equal(f.status.textContent,'');assert.equal(f.loads.length,1);
 assert.deepEqual(f.writes,[[analytics.ANALYTICS_CHOICE_KEY,'accepted']]);
});
test('remembered acceptance or decline keeps the prompt hidden on the next page',()=>{
 for(const saved of ['accepted','declined']){const f=fixture({saved});assert.equal(f.panel.hidden,true);assert.equal(f.status.hidden,true);assert.equal(f.loads.length,saved==='accepted'?1:0);}
});
test('privacy control reopens consent and withdrawal clears analytics cookies',()=>{
 const f=fixture({saved:'accepted',settings:true});assert.equal(f.preferences.hidden,false);
 f.preferences.handlers.click();assert.equal(f.panel.hidden,false);assert.equal(f.accept.focused,true);
 f.decline.handlers.click();assert.equal(f.panel.hidden,true);assert.equal(f.preferences.focused,true);assert.equal(f.status.hidden,true);assert.equal(f.reloads,1);assert.equal(f.window['ga-disable-G-ABC1234567'],true);
 assert.equal(f.cleared.length,6);assert.ok(f.cleared.every(c=>c.startsWith('_ga')));
});
test('first-time decline dismisses without loading the remote tag',()=>{
 const f=fixture();f.decline.handlers.click();assert.equal(f.panel.hidden,true);assert.equal(f.status.hidden,true);assert.equal(f.loads.length,0);assert.equal(f.reloads,0);
});
test('unavailable storage displays only a truthful persistence warning',()=>{
 const f=fixture({storageFails:true});f.accept.handlers.click();assert.equal(f.panel.hidden,true);assert.equal(f.status.hidden,false);assert.match(f.status.textContent,/could not save/);assert.equal(f.writes.length,0);
});
test('local previews remain inactive and cross-tab withdrawal still reloads',()=>{
 const local=fixture({settings:true,origin:'http://127.0.0.1:4374'});assert.equal(local.panel.hidden,true);assert.equal(local.preferences.hidden,true);assert.equal(local.loads.length,0);
 const live=fixture({saved:'accepted'});live.events.storage({key:analytics.ANALYTICS_CHOICE_KEY,newValue:'declined'});assert.equal(live.reloads,1);assert.equal(live.window['ga-disable-G-ABC1234567'],true);
});
