import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const data=JSON.parse(read('../../kb/research/collections/global-town-candidate.json'));
const comparison=JSON.parse(read('../../kb/research/references/data/global-connections.json'));
const photo=JSON.parse(read('../../kb/research/stories/narratives/konark.json')).image;
const html=read('dist/global-connections/index.html');
const section=html.match(/<section id="town-learning"[\s\S]*?<\/section>/)?.[0];
test('town idea is readable without JavaScript and separated from documented city relationships',()=>{
 assert.ok(section);assert.equal(data.status,'proposal');
 assert.match(section,/A proposal to explore/);assert.match(section,/No counterpart, participant or activity has been agreed/);
 assert.match(section,/does not establish an ancient connection or a modern town partnership/);
 assert.equal(comparison.cities.length,6);
 assert.match(html,/One formal relationship verified in this review/);
 assert.doesNotMatch(section,/<form|data-save|Book now|Join now|Apply now/i);
 assert.ok(html.includes('href="#town-learning"'));
});
test('proposed outputs preserve reciprocal benefit and unresolved operating needs',()=>{
 for(const output of data.outputs){assert.ok(section.includes(output.title));assert.ok(section.includes(output.text));}
 assert.match(section,/Local interest, language review, permissions, time and costs/);
 assert.ok(section.includes(`href="${data.reading.href}"`));
 assert.ok(existsSync(`dist${data.reading.href}index.html`));
});
test('photo credit and source destinations remain attached to the public proposal',()=>{
 assert.ok(section.includes(photo.src));assert.ok(section.includes(photo.alt));assert.match(section,/loading="lazy"/);
 for(const value of [photo.creator,photo.license_url,photo.source,photo.changes])assert.ok(html.includes(value));
 const sources=html.match(/<section id="story-sources"[\s\S]*?<\/section>/)?.[0];assert.ok(sources);
 for(const source of data.sources){assert.ok(section.includes(`href="#${source.id}"`));assert.ok(sources.includes(`id="${source.id}"`));assert.ok(sources.includes(source.resource));}
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
});
