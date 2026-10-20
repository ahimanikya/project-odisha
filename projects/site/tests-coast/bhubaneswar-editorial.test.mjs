import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const data=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/bhubaneswar-editorial.json','utf8'));
const region=data.regions.find(r=>r.slug==='bhubaneswar');
const html=readFileSync('dist-coast/destinations/bhubaneswar/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('Bhubaneswar has a credited opening and visible, reversible passage notes',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="stories"'));
 assert.match(html,/<section id="story-sources"/);assert.match(html,/Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/<details[^>]*id="sources"/);
 assert.doesNotMatch(html,/odishatourism.gov.in\/content\/tourism/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,20);assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/data-footnote-backref/g)||[]).length,refs.length);
 for(const s of editorial.sources){assert.ok(html.includes(`id="note-${s.id}"`));assert.ok(html.includes(s.url.replaceAll('&','&amp;'))||html.includes(s.url));}
 for(const s of region.sections)for(const p of s.paragraphs)assert.ok(html.includes(p.text));
 for(const text of ['February 2009','2019 catalogue','1970s','not a route of murals known to survive','no live service or fare quote'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Research and original editorial framing|a camera is a guest|AI assistan(?:t|ce)|Research and narrative prepared with AI/);
});
test('destination editorial opt-in keeps planning tools and does not assign other city bylines',()=>{
 for(const id of ['choose-your-stops','make-it-yours','before-you-go','visit-notebook','local-languages','at-a-glance'])assert.ok(html.includes(`id="${id}"`));
 for(const i of region.items)assert.ok(html.includes(`data-save-journey="${i.id}"`));
 const balasore=readFileSync('dist-coast/destinations/balasore/index.html','utf8');assert.match(balasore,/By Ahimanikya Satapathy/);assert.match(balasore,/<section id="story-sources"/);
 const mayurbhanj=readFileSync('dist-coast/destinations/mayurbhanj/index.html','utf8');assert.match(mayurbhanj,/By Ahimanikya Satapathy/);assert.match(mayurbhanj,/<section id="story-sources"/);
 const other=readFileSync('dist-coast/languages/santali/index.html','utf8');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Editorial preview/);
});
test('Bhubaneswar keeps all five documentary photos and their individual credits',()=>{
 const hashes={mukteswar:'6e2a7594a24b50485a3302443420d9efbabcd81b03aefe836457c3308c28a6f5','mukteswar-torana':'5e99da2e97be858ad291816baa401fa8a57cb6ff8f4d3deb69b00bd3da0be556',dhauli:'f9721a5a64cf25f9fcc1a01ef9dfca841b668f0f744cf69c6b17d56f87f61792','fresco-procession':'ce9e025d492adf02d471fae4c3656a00cacd0a71b25566dffbd6425a9cc2c671','kala-bhoomi-grounds':'04818eccbf38f0b7d4b782dcd1ccd5518a175ebbe43f6d9ae5f8f6d197fe84be'};
 for(const [id,hash] of Object.entries(hashes)){const p=data.assets[id];assert.equal(createHash('sha256').update(readFileSync('public'+p.src)).digest('hex'),hash);for(const value of [p.src,p.creator,p.license_url])assert.ok(html.includes(value),value);}
});
