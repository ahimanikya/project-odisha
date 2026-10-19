import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('dist-coast/destinations/cuttack/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
test('Cuttack gives every visible claim marker an exact return and retains five photographic credits',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="stories"'));
 assert.match(html,/<section id="story-sources"/);
 assert.doesNotMatch(html,/<details id="sources"|Research and original editorial framing/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,12);assert.equal(new Set(refs.map(r=>r[1])).size,12);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 const data=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
 for(const id of ['barabati','cuttack-filigree','cuttack-dahibara','cuttack-netaji','jobra-courtyard'])for(const value of ['src','creator','license_url'])assert.ok(html.includes(data.assets[id][value]));
 assert.match(html,/Material descriptions differ in the source/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
});
