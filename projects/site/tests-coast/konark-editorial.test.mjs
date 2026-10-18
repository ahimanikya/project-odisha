import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const html=read('/knowledge/konark/');
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/konark-editorial.json'));
test('Konark connects visible notes to exact passages including folded notebook content',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="history"'));
 assert.match(html,/<section id="story-sources"/);assert.match(html,/Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/AI assistan(?:t|ce)|human editorial review pending|Editorial draft|Photograph dated \./);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((sum,p)=>sum+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note]of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/data-footnote-backref/g)||[]).length,refs.length);
 for(const s of editorial.sources)assert.ok(html.includes(`id="note-${s.id}"`));
 for(const text of ['Snigdha Acharya','Gopabandhu Das','not a record of the temple','audience hall','inconsistent horse counts','not a confirmed programme or booking','Museum opening and accessible routes remain unconfirmed'])assert.ok(html.includes(text),text);
});
test('Konark keeps documentary photographs, date context, journey controls and isolates the editorial opt-in',()=>{
 const d=JSON.parse(readFileSync('../../kb/research/destinations/konark.json'));
 const s=JSON.parse(readFileSync('../../kb/research/stories/narratives/konark.json'));
 for(const p of [s.image,...Object.values(d.visuals)]){assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),p.sha256);for(const v of [p.creator,p.license_url,p.src])assert.ok(html.includes(v));}
 assert.ok(html.includes('photographed in New Delhi, 2025'));
 for(const id of ['visit-notebook','visit-details','practical-choices','collection-onward'])assert.ok(html.includes(`id="${id}"`));
 assert.ok(html.includes('data-save-journey="place:konark"'));
 const other=read('/knowledge/chilika/');assert.match(other,/By Ahimanikya Satapathy/);assert.match(other,/id="note-gopabandhu-poem"/);assert.doesNotMatch(other,/id="note-konark"/);
 const main=html.match(/<main[\s\S]*?<\/main>/)[0];assert.doesNotMatch(main,/odishatourism.gov.in\/content\/tourism/);
});
