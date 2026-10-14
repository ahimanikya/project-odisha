import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {normaliseInterest,matchingTrails,mountTrailFinder} from '../src/lib/trail-finder.mjs';
const comparison=JSON.parse(readFileSync('../../kb/research/trail-comparison.json'));
const page=readFileSync('dist/journey-starters/index.html','utf8');
const data=JSON.parse(page.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
function fixture(query=''){
 const buttons=[{id:'all',label:'All interests'},...comparison.interests].map(i=>({dataset:{trailInterest:i.id},textContent:i.label,disabled:true,attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this[k]=fn;}}));
 const cards=comparison.trails.map(t=>({id:t.id,dataset:{interests:t.interests.join(' ')},hidden:false}));
 const status={textContent:''};
 const root={querySelectorAll:q=>q==='[data-trail-interest]'?buttons:cards,querySelector:()=>status};
 const handlers={},stack=[];
 const env={location:{href:'https://projectodisha.org/journey-starters/'+query},history:{pushState(_state,_title,url){stack.push(env.location.href);env.location.href=url;}},addEventListener(k,fn){handlers[k]=fn;}};
 Object.defineProperty(env,'localStorage',{get(){throw Error('Trail browsing must not access personal journeys');}});
 return {buttons,cards,status,env,root,click:id=>buttons.find(b=>b.dataset.trailInterest===id).click(),back(){env.location.href=stack.pop();handlers.popstate();},visible:()=>cards.filter(c=>!c.hidden).map(c=>c.id)};
}
test('five linked comparisons precede the long story, retain provenance and work without scripting',()=>{
 assert.equal(comparison.trails.length,5);
 assert.ok(page.indexOf('id="find-your-trail"')<page.indexOf('id="stone-sea-makers"'));
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 const ids=[...page.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 const finder=page.slice(page.indexOf('id="find-your-trail"'),page.indexOf('id="stone-sea-makers"'));
 assert.equal((finder.match(/<article[^>]*data-trail-card/g)||[]).length,5);
 assert.ok(!/<article[^>]*\shidden(?:\s|>)/.test(finder));
 for(const choice of comparison.trails){
  assert.ok(existsSync('../../kb/research/'+choice.basis));
  const trail=data.trails.find(t=>t.starter_id===choice.trail_id);assert.ok(trail);
  assert.ok(finder.includes('href="'+trail.href+'"'));
  const [route,fragment]=trail.href.split('#');const target=readFileSync('dist'+route+'index.html','utf8');
  if(fragment)assert.ok(target.includes('id="'+fragment+'"'));
  assert.ok(target.includes('data-journey-starter="'+trail.starter_id+'"'));
  const photo=trail.chapters[0].photo;assert.ok(existsSync('dist'+photo.src));assert.ok(page.includes(photo.creator));assert.ok(page.includes(photo.license_url));
  for(const key of ['start','travel','season','arrange'])assert.ok(finder.includes(choice[key]));
 }
 // The comparison does not duplicate starter buttons or their status IDs.
 assert.equal((page.match(/data-journey-starter="stone-sea-makers"/g)||[]).length,1);
});
test('interests choose meaningful existing stories without changing their order or source data',()=>{
 const before=structuredClone(comparison.trails);
 assert.deepEqual(matchingTrails(comparison.trails,'crafts').map(t=>t.id),['stone-sea-makers','cuttack']);
 assert.deepEqual(matchingTrails(comparison.trails,'literature').map(t=>t.id),['balasore']);
 assert.deepEqual(matchingTrails(comparison.trails,'nature').map(t=>t.id),['chilika','balasore','mayurbhanj']);
 assert.equal(matchingTrails(comparison.trails,'food').length,5);
 assert.deepEqual(comparison.trails,before);
});
test('shared interest URLs, reset and Back synchronise results and pressed controls without touching journeys',()=>{
 const f=fixture('?interest=literature&keep=1#find-your-trail');mountTrailFinder(f.root,f.env);
 assert.deepEqual(f.visible(),['balasore']);assert.ok(f.buttons.every(b=>!b.disabled));assert.equal(f.status.textContent,'1 of 5 trails · Literature');
 f.click('crafts');assert.deepEqual(f.visible(),['stone-sea-makers','cuttack']);assert.ok(f.env.location.href.includes('keep=1'));assert.ok(f.env.location.href.endsWith('#find-your-trail'));
 assert.equal(f.buttons.find(b=>b.dataset.trailInterest==='crafts').attributes['aria-pressed'],'true');
 f.back();assert.deepEqual(f.visible(),['balasore']);assert.equal(f.buttons.find(b=>b.dataset.trailInterest==='literature').attributes['aria-pressed'],'true');
 f.click('all');assert.equal(f.visible().length,5);assert.ok(!f.env.location.href.includes('interest='));
});
test('unknown interests show all trails and blocked history still permits local filtering',()=>{
 assert.equal(normaliseInterest('<script>',comparison.interests.map(i=>i.id)),'all');
 const f=fixture('?interest=unknown');mountTrailFinder(f.root,f.env);assert.equal(f.visible().length,5);
 f.env.history.pushState=()=>{throw Error('history denied');};f.click('nature');assert.deepEqual(f.visible(),['chilika','balasore','mayurbhanj']);assert.equal(f.status.textContent,'3 of 5 trails · Nature');
 f.click('all');assert.equal(f.visible().length,5);
});
