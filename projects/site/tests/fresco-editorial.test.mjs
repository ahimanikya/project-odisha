import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const e=JSON.parse(readFileSync('../../kb/collections/bhubaneswar-fresco/editorial.json','utf8'));
const html=readFileSync('dist/stories/bhubaneswar-fresco/index.html','utf8');
test('Fresco reading has static numbered notes, exact returns and a visible eight-photo selection',()=>{
 assert.match(html,/By Ahimanikya Satapathy/);
 assert.match(html,/<section id="story-sources"/);
 assert.ok(html.indexOf('id="story-selection"')<html.indexOf('id="archive-browser"'));
 assert.ok(!html.match(/<details><summary id="selection-title"/));
 for(const p of e.passages)for(const id of p.source_ids)for(const token of [`id="ref-${p.id}-${id}"`,`href="#ref-${p.id}-${id}"`,`id="note-${id}"`])assert.ok(html.includes(token),token);
 assert.equal((html.match(/ data-footnote-ref /g)||[]).length,e.passages.length);
 for(const s of e.sources)assert.ok(html.includes(s.url));
 assert.match(html,/revealReference/);assert.match(html,/details.open=true/);
 for(const file of e.selected_order)assert.ok(html.includes(`photos/${file}`));
 assert.match(html,/not a verified painting technique/);
 assert.match(html,/Our Editorial Process/);
});
