import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('../../kb/research/events/arts-literature.json','utf8'));
const html=readFileSync('dist-coast/events/arts-literature/index.html','utf8');
test('calendar preserves provenance, unresolved dates and distinct festival identities',()=>{
 assert.equal(new Set(data.events.map(e=>e.id)).size,data.events.length);
 for(const e of data.events){assert.ok(e.sources.length);for(const s of e.sources)assert.equal(new URL(s.url).protocol,'https:');assert.ok(e.checked_on);assert.ok(html.includes(`id="${e.id}"`));if(e.status==='announced'){assert.match(e.start,/^\d{4}-\d{2}-\d{2}$/);assert.ok(e.end>=e.start);assert.ok(e.end>=data.checked_on);}}
 for(const id of ['koraput-klf','koraput-odia-media','toshali-literature','toshali-crafts'])assert.ok(data.events.some(e=>e.id===id));
 assert.equal(data.events.find(e=>e.id==='kalinga-litfest').status,'reported');
 assert.equal(data.events.find(e=>e.id==='kalinga-book-fair').start,null);
 const book=data.events.find(e=>e.id==='state-book-festival');assert.equal(book.start,'2026-12-04');assert.equal(book.end,'2026-12-14');assert.ok(book.note.includes('16 November 2026'));
});
test('public calendar and discovery link are shipped',()=>{
 assert.ok(html.includes('event-search'));assert.ok(html.includes('event-category'));assert.ok(html.includes('event-city'));assert.ok(html.includes('Past edition'));
 assert.ok(readFileSync('dist-coast/explore/index.html','utf8').includes('/events/arts-literature/'));
 assert.ok(readFileSync('dist-coast/events/index.html','utf8').includes('#state-book-festival'));
});
