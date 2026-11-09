import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const ed=JSON.parse(read('../../kb/research/collections/global-connections-editorial.json'));
const html=read('dist/global-connections/index.html');
const unescape=s=>s.replaceAll('&#39;',"'").replaceAll('&#x27;',"'").replaceAll('&amp;','&');
const text=unescape(html.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ');
test('new attributed account is exact, once, and distinct from proposals',()=>{
 for(const p of ed.paragraphs) assert.equal(text.split(p.text).length-1,1);
 assert.equal(text.split(ed.notes[0].text).length-1,1);
 assert.ok(text.includes(ed.byline)); assert.ok(!text.includes(ed.bibliography.text));
 assert.ok(html.includes('id="shared-activity"'));assert.ok(html.includes('id="event-title"'));
 assert.ok(html.indexOf('id="our-starting-point"')<html.indexOf('id="shared-activity"'));
 assert.ok(html.indexOf('id="shared-activity"')<html.indexOf('id="india"'));
});
test('visible event note has native forward and return links without a partial download',()=>{
 for(const value of ['href="#note-purab-14"','id="note-purab-14"','href="#ref-purab-14"','id="ref-purab-14"','Footnotes &amp; Sources'])assert.ok(html.includes(value));
 assert.match(html,/id="note-purab-14"[^>]*tabindex="-1"/);
 const note=html.slice(html.indexOf('<section id="story-sources"'),html.indexOf('</section>',html.indexOf('<section id="story-sources"')));
 assert.ok(note.includes(ed.notes[0].url));assert.ok(!note.includes('<details'));
 assert.doesNotMatch(read('src/pages/global-connections.astro'),/SaveButton|data-save|download=/);
 assert.ok(!read('src/data/journey-catalog.ts').includes('global-purab-cgisf2024'));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
});

test('all fourteen sources are visible with sequential labels and citation-only returns',()=>{
 const sources=html.slice(html.indexOf('<section id="story-sources"'),html.indexOf('</section>',html.indexOf('<section id="story-sources"')));
 assert.ok(sources);assert.doesNotMatch(sources,/<details/);assert.ok(sources.includes('<ol start="12"'));assert.ok(sources.includes('<ol start="14"'));
 assert.ok(html.includes('id="further-reading-title"'));assert.ok(html.includes('Further reading'));
 const refs=[...html.matchAll(/<a[^>]*href="#([^"]+)"[^>]*data-footnote-backref[^>]*>/g)];
 for(const ref of refs)assert.ok(html.includes(`id="${ref[1]}"`));
 for(const id of ['global-cupertino-council','global-sci']){const li=sources.match(new RegExp(`<li id="${id}"[\\s\\S]*?</li>`))?.[0];assert.ok(li);assert.ok(!li.includes('data-footnote-backref'));}
});
