import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const html=read('/visit/places/dhauli/');
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/dhauli-editorial.json'));
test('Dhauli has visible, exact passage notes and preserves historical distinctions',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/<section id="story-sources"/);assert.match(html,/Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/AI assistan(?:t|ce)|human editorial review pending|Editorial draft|odishatourism.gov.in\/content\/tourism/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((sum,p)=>sum+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note]of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/data-footnote-backref/g)||[]).length,refs.length);
 for(const text of ['1970s','third century BCE','Prakrit','Brahmi','Major Rock Edict XIII','absent at Dhauli','Kalsi','Dhammika','not evidence that they always obeyed','remembered story'])assert.ok(html.includes(text),text);
 for(const s of editorial.sources)assert.ok(html.includes(`id="note-${s.id}"`));
});
test('Dhauli keeps both photographs and planning tools without changing other detail bylines',()=>{
 const data=JSON.parse(readFileSync('../../kb/research/destinations/regions.json'));
 for(const key of ['dhauli','dhauli-elephant']){const p=data.assets[key];assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),p.sha256);for(const value of [p.creator,p.license_url,p.src])assert.ok(html.includes(value));}
 for(const id of ['visit-notebook','visit-details','practical-choices','collection-onward','sources-credits'])assert.ok(html.includes(`id="${id}"`));
 assert.ok(html.includes('data-save-journey="place:dhauli"'));
 for(const route of ['/visit/places/barabati/','/visit/places/mukteswar/','/visit/stays/bhubaneswar/']){const other=read(route);assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Drafted with AI assistance; human editorial review pending/);}
});
