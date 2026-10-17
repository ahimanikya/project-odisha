import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync('dist-coast/visit/places/raghurajpur/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/raghurajpur-editorial.json'));
test('Raghurajpur notes connect narrative, process steps and folded notebook to exact return points',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft|odishatourism.gov.in\/content\/tourism/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/data-footnote-backref/g)||[]).length,refs.length);
 for(const id of ['ref-detail-1-step-2-pattachitra-process','ref-notebook-stop-0-pattachitra-process','ref-notebook-access-raghurajpur'])assert.ok(html.includes(`id="${id}"`));
 for(const s of editorial.sources)assert.ok(html.includes(`id="note-${s.id}"`));
 for(const name of ['Ileana Citaristi','Halina Zealey','Biswa Prakash','Chintamani Mohapatra','Balabhadra Sahu','retrospective account'])assert.ok(html.includes(name));
});
test('Raghurajpur preserves three credited photographs and the existing planning tools',()=>{
 const region=JSON.parse(readFileSync('../../kb/research/destinations/regions.json'));
 const crafts=JSON.parse(readFileSync('../../kb/research/culture/craft-stories.json'));
 for(const p of [region.assets['raghurajpur-artisan'],region.assets.raghurajpur,crafts.assets['pattachitra-making']]){
  assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),p.sha256);
  for(const x of [p.creator,p.license_url,p.src])assert.ok(html.includes(x));
 }
 for(const id of ['visit-notebook','visit-details','practical-choices','sources-credits'])assert.ok(html.includes(`id="${id}"`));
 assert.ok(html.includes('data-save-journey="place:raghurajpur"'));
});
