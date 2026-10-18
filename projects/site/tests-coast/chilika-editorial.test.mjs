import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const e=JSON.parse(readFileSync('../../kb/research/destinations/chilika-editorial.json'));
const html=readFileSync('dist-coast/knowledge/chilika/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('Chilika has exact two-way footnotes, honest limits and distinct creative credits',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="poems-songs"'));
 assert.match(html,/<section id="story-sources"/);
 assert.doesNotMatch(html,/AI assistan(?:t|ce)|human editorial review pending|Editorial draft/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,e.passages.reduce((n,p)=>n+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 assert.equal((html.match(/data-footnote-backref/g)||[]).length,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 for(const s of e.sources)assert.ok(html.includes(`id="note-${s.id}"`));
 for(const text of ['Gopabandhu Das','Pranab Patnaik','Nirmala Mishra','Shantanu Mohapatra','Shibabrata Das','language review pending','unproofread','2023–2024','not a verified report of a shipwreck','direct PDF retrieval failed','sighting is never guaranteed'])assert.ok(html.includes(text),text);
});
test('Chilika preserves five photographs and their licences without implying a Satapada photograph',()=>{
 const s=JSON.parse(readFileSync('../../kb/research/stories/narratives/chilika.json'));
 const d=JSON.parse(readFileSync('../../kb/research/destinations/chilika.json'));
 for(const p of [s.image,...Object.values(d.visuals)]){assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),p.sha256);for(const value of [p.creator,p.license_url,p.src])assert.ok(html.includes(value));}
 for(const id of ['visit-notebook','visit-details','practical-choices'])assert.ok(html.includes(`id="${id}"`));
 assert.match(html,/regional view|specific outing/);
});
