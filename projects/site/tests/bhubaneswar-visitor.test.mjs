import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const regions=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/bhubaneswar-editorial.json','utf8'));
const bhub=regions.regions.find(r=>r.slug==='bhubaneswar');
const page=readFileSync('dist/destinations/bhubaneswar/index.html','utf8');
const detail=readFileSync('dist/visit/places/dhauli/index.html','utf8');
test('Bhubaneswar visitor advice has dated evidence and survives the rendered page',()=>{
 for(const note of bhub.visitor_notes){assert.ok(page.includes(note.heading));assert.ok(page.includes(note.text));if(note.kind==='sourced_summary')assert.ok(note.source_ids.length);for(const id of note.source_ids){assert.ok(regions.sources[id].checked_on);assert.ok(page.includes(editorial.sources.find(s=>s.id===id).url));}}
 assert.ok(page.includes('/food/'));
});
test('new city photographs retain their identity, byte hashes and reuse conditions',()=>{
 for(const [key,html] of [['mukteswar-torana',page],['dhauli-elephant',detail]]){const a=regions.assets[key];assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);for(const value of [a.src,a.creator,a.license_url])assert.ok(html.includes(value),value);}
 assert.equal((detail.match(/<img[^>]+dhauli-elephant/g)||[]).length,1);
 assert.ok(detail.indexOf('dhauli-elephant.jpg')<detail.indexOf('id="connect-visit"'));
});
