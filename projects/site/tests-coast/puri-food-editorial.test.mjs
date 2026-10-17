import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync('dist-coast/food/puri-coast/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const editorial=JSON.parse(readFileSync('../../kb/research/food/puri-coast-editorial.json'));
test('Puri food notes distinguish ritual testimony and GI record, with exact notebook returns',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="maha-prasad"'));
 assert.match(html,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft|odishatourism.gov.in\/content\/tourism/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/ data-footnote-backref /g)||[]).length,refs.length);
 for(const text of ['Bhitarachha Sebaka','not been independently checked','29 July 2019','who first made rasagola'])assert.ok(html.includes(text));
});
test('Puri food preserves its licensed photograph and saves for five dishes',()=>{
 const p=JSON.parse(readFileSync('../../kb/research/food/collection.json')).assets['chhena-poda'];
 assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),p.sha256);
 for(const x of [p.creator,p.license_url,p.src])assert.ok(html.includes(x));
 for(const id of ['food:puri-mahaprasad','food:odisha-rasagola','food:konark-machha-besara','food:konark-chingudi','food:konark-chhena-poda'])assert.ok(html.includes(`data-save-journey="${id}"`));
 for(const id of ['visit-notebook','visit-details'])assert.ok(html.includes(`id="${id}"`));
});
