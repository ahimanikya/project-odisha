import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/puri-editorial.json','utf8'));
const data=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
const region=data.regions.find(r=>r.slug==='puri');
const html=readFileSync('dist-coast/destinations/puri/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('Puri has visible passage notes with unique forward and return destinations',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="stories"'));
 assert.match(html,/<section id="story-sources"/);assert.match(html,/Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/<details[^>]*id="sources"|odishatourism.gov.in\/content\/tourism|drafted with AI|created and revised with AI assistance/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.ok(refs.length>=20);assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/data-footnote-backref/g)||[]).length,refs.length);
 for(const s of editorial.sources){assert.ok(html.includes(`id="note-${s.id}"`));assert.ok(refs.some(r=>r[2]===`note-${s.id}`));assert.ok(html.includes(s.url));}
 for(const section of region.sections)for(const p of section.paragraphs)assert.ok(html.includes(p.text));
 for(const text of ['earthen pots over wood fires','who made it','October–February','extends the season to March','Current rules and waiting times are not confirmed','inconsistent railway widget'])assert.ok(html.includes(text),text);
 for(const id of ['choose-your-stops','make-it-yours','before-you-go','visit-notebook','local-languages','at-a-glance'])assert.ok(html.includes(`id="${id}"`));
 for(const item of region.items.filter(i=>JSON.parse(readFileSync('editions/coast.json','utf8')).journey_ids.includes(i.id)))assert.ok(html.includes(`data-save-journey="${item.id}"`));
});
test('Puri preserves its documentary photographs and leaves unreviewed cities outside the opt-in',()=>{
 for(const id of ['puri-beach','raghurajpur-artisan']){const p=data.assets[id];assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),p.sha256);for(const v of [p.src,p.creator,p.license_url])assert.ok(html.includes(v));}
 assert.match(html,/Her name is not supplied in the source/);
 const balasore=readFileSync('dist-coast/destinations/balasore/index.html','utf8');assert.match(balasore,/By Ahimanikya Satapathy/);assert.match(balasore,/<section id="story-sources"/);
 const mayurbhanj=readFileSync('dist-coast/destinations/mayurbhanj/index.html','utf8');assert.match(mayurbhanj,/By Ahimanikya Satapathy/);assert.match(mayurbhanj,/<section id="story-sources"/);
 const other=readFileSync('dist-coast/languages/desia/index.html','utf8');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Editorial preview/);
});
