import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {timingTokens,matchesNavigation} from '../src/lib/osha-navigation.mjs';
const navigation=JSON.parse(readFileSync('../../kb/research/references/data/osha-seasonal-navigation.json','utf8'));
const row=id=>navigation.rows.find(r=>r.profile_id===id);
const select=(timing,query='')=>navigation.rows.filter(r=>matchesNavigation(r.name+' '+r.food_terms_verbatim.join(' '),timingTokens(r),query,timing));
test('month filters preserve spans and exclude competing or comparative month claims',()=>{
 for(const month of ['bhadraba','ashwina'])assert.ok(select('month:'+month).some(r=>r.profile_id==='OSHA-029'));
 assert.equal(select('').filter(r=>r.profile_id==='OSHA-029').length,1);
 for(const month of ['baisakha','jyestha'])assert.ok(!select('month:'+month).some(r=>r.profile_id==='OSHA-023'));
 assert.ok(!select('month:sravana').some(r=>r.profile_id==='OSHA-038'));
 assert.ok(!select('month:ashadha').some(r=>r.profile_id==='OSHA-053'));
 assert.deepEqual(select('solar').map(r=>r.profile_id),['OSHA-053']);
});
test('recurrence needs explicit evidence and can coexist with unresolved month descriptions',()=>{
 assert.deepEqual(select('recurring').map(r=>r.profile_id),['OSHA-003','OSHA-021','OSHA-028','OSHA-031','OSHA-048']);
 assert.ok(select('unresolved').some(r=>r.profile_id==='OSHA-003'));
 assert.ok(select('unresolved').some(r=>r.profile_id==='OSHA-039'));
 assert.ok(!timingTokens(row('OSHA-039')).includes('recurring'));
});
test('combined searches return honest empty results and clearing both filters restores the collection',()=>{
 assert.equal(select('month:pausa','Enduri').length,0);
 assert.deepEqual(select('month:margasira','  ENDURI  ').map(r=>r.profile_id),['OSHA-010']);
 assert.equal(select('','a word absent from all observances').length,0);
 assert.equal(select('').length,53);
});
test('rendered cards preserve identity, food-role notes and timing explanations',()=>{
 const html=readFileSync('dist/culture/osha/index.html','utf8');
 assert.equal((html.match(/class="osha-card"/g)||[]).length,53);
 for(const r of navigation.rows){
  const card=html.match(new RegExp(`<article[^>]*data-profile-id="${r.profile_id}"[\\s\\S]*?</article>`))?.[0];
  assert.ok(card,r.profile_id);assert.ok(card.includes('data-timings="'+timingTokens(r).join(' ')+'"'),r.profile_id);
  assert.ok(card.includes(r.food_role_note.replaceAll('&','&amp;')),r.profile_id+' food role');
  assert.ok(card.includes(r.calendar_note.replaceAll('&','&amp;')),r.profile_id+' calendar note');
 }
 assert.ok(html.includes('Month or identity unresolved'));
 assert.ok(html.includes('Solar transition'));
});
