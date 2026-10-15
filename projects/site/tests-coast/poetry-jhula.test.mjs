import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
test('Jhula ships twelve sets and all original bag image resources with a survey handoff',()=>{
 const html=readFileSync('dist-coast/odia-poetry-jhula/index.html','utf8');
 assert.equal([...html.matchAll(/id="design-\d{2}"/g)].length,12);
 const images=[...html.matchAll(/<image\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(images.length,24);
 for(const path of images)assert.ok(existsSync('dist-coast'+path),path);
 assert.match(html,/https:\/\/odia-kabira-jhula\.aquera-1216\.chatgpt\.site\/#vote/);
 assert.match(html,/90 cm along the exposed strap/);
 assert.doesNotMatch(html,/>[^<]*(?:Kabira|Kabi’s Kit)[^<]*</);
 assert.match(html,/noindex/);
});
