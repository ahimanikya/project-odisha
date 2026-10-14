import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const study=JSON.parse(readFileSync('../../kb/research/references/data/osha-culture.json','utf8'));
const foods=JSON.parse(readFileSync('../../kb/research/food/collection.json','utf8'));
const read=route=>readFileSync('dist'+route+'index.html','utf8');
test('observance articles retain narrative status, source anchors and visitor uncertainty',()=>{
 for(const page of study.pages){
  const html=read(page.route);
  assert.ok(html.includes(page.name));
  assert.match(html,/No serving place or invitation to private worship is verified/);
  assert.match(html,/human editorial and Odia review pending/);
  if(page.coverage_status==='research_note')assert.match(html,/history and local narrative incomplete/);
  for(const id of page.source_ids)assert.ok(html.includes(`id="source-${id}"`),page.slug+': '+id);
 }
});
test('food associations lead only to available preparation pages',()=>{
 let links=0;
 for(const page of study.pages)for(const path of page.related_food_paths){
  const slug=path.split('/')[1].replace(/\.md$/,'');
  if(foods.pages.some(p=>p.slug===slug)){assert.ok(read(page.route).includes(`href="/food/${slug}/"`),page.slug+': '+slug);links++;}
 }
 assert.ok(links>0,'at least one independently published preparation is linked');
 assert.ok(read('/culture/osha/prathamastami/').includes('href="/food/enduri-pitha/"'));
});

test('seasonal food evidence keeps historical, undated and planned services distinct',()=>{
 const html=read('/culture/osha/finding-seasonal-food/');
 for(const label of ['A reported service in the past','An account without a year','A plan for distribution','No current serving offer is verified'])assert.ok(html.includes(label),label);
 for(const id of ['SFO-001','SFO-002','SFO-003'])assert.ok(html.includes(`data-evidence-id="${id}"`));
 assert.ok(html.includes('14–16 June 2021, as reported'));
 assert.ok(html.includes('14–16 June printed without a year'));
 assert.ok(html.includes('29 July 2026, as announced'));
 for(const id of ['food-raja-otdc2021','food-otdc-raja-undated','osha-guru-rkm2026'])assert.ok(html.includes(`id="source-${id}"`));
 for(const slug of ['raja-parba','guru-purnima-brata'])assert.ok(read('/culture/osha/'+slug+'/').includes('href="/culture/osha/finding-seasonal-food/"'));
 assert.ok(read('/culture/osha/').includes('href="/culture/osha/raja-parba/"'));
});
