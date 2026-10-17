import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
const raw=readFileSync('dist-coast/journey-starters/index.html','utf8');
const html=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const data=JSON.parse(raw.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const trail=data.trails.find(t=>t.starter_id==='stone-sea-makers');
test('authored trail has visible numbered notes with exact returns and preserved media rights',()=>{
 assert.equal((html.match(/By Ahimanikya Satapathy/g)||[]).length,1);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,4);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 assert.match(html,/<section id="story-sources"/);assert.doesNotMatch(html,/Human editorial review remains pending|Trail context reviewed online/);
 for(const chapter of trail.chapters){assert.ok(html.includes(chapter.photo.src));assert.ok(html.includes(chapter.photo.creator));assert.ok(html.includes(chapter.photo.license_url));}
 const other=readFileSync('dist-coast/journey-starters/chilika/index.html','utf8');assert.ok(!other.includes('editorial-trail"'));assert.ok(!other.includes('id="note-mukteswar-context"'));
});
test('portable trail keeps chapters and concise sources without internal review notes',()=>{
 const starter=data.starters.find(s=>s.id===trail.starter_id);
 const plan={version:1,title:'Three chapters',storyTrail:trail.starter_id,items:starter.items.map(id=>({id,day:0,notes:''}))};
 const book=buildTourBook(plan,data.catalog,{trails:[trail]}),txt=buildTextItinerary(plan,data.catalog,{trails:[trail]});
 for(const rawOut of [book,txt]){const out=rawOut.replaceAll("&amp;","&");assert.ok(out.includes('By Ahimanikya Satapathy'));for(const c of trail.chapters)assert.ok(out.includes(c.text));for(const s of trail.sources){assert.ok(out.includes(s.url));assert.ok(!out.includes(s.note));}assert.ok(!out.includes(trail.review_scope));assert.ok(out.includes('/journey-starters/#stone-sea-makers'));}
 const legacy=structuredClone(trail);delete legacy.editorial_reading;const old=buildTourBook(plan,data.catalog,{trails:[legacy]});assert.ok(old.includes(legacy.review_scope));
});
