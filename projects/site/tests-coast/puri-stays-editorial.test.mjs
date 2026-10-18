import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
const html=readFileSync('dist-coast/visit/stays/puri-coast/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/puri-stays-editorial.json'));
test('Puri stay comparison keeps visible geography notes and exact folded notebook returns',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft|odishatourism.gov.in\/content\/tourism/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,4);assert.equal(new Set(refs.map(r=>r[1])).size,4);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.equal((html.match(/ data-footnote-backref /g)||[]).length,4);
 assert.ok(html.includes('No named property, room or transfer service has been inspected'));
 for(const area of ['Puri · town and sea','Konark · put the temple first','Ramachandi and the coastal road'])assert.ok(html.includes(area));
});
test('Puri stay comparison retains photo rights, saved identity and concise portable reading',()=>{
 const photo=JSON.parse(readFileSync('../../kb/research/destinations/regions.json')).assets['puri-beach'];
 assert.equal(createHash('sha256').update(readFileSync('public'+photo.src)).digest('hex'),photo.sha256);
 for(const text of [photo.creator,photo.license_url,photo.src,'data-save-journey="stay:puri"'])assert.ok(html.includes(text));
 const home=readFileSync('dist-coast/index.html','utf8');const catalog=JSON.parse(home.match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const entry=catalog.find(x=>x.id==='stay:puri');assert.equal(entry.href,editorial.route);
 const plan={version:1,title:'Stay choices',items:[{id:'stay:puri',day:1,notes:''}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const source of editorial.sources){assert.ok(book.includes(source.url));assert.ok(text.includes(source.url));assert.ok(!text.includes(source.note));}
 for(const phrase of ['Ramachandi and the coastal road','steps or lift','cancellation terms','one base or split the trip'])assert.ok(text.includes(phrase));
});
