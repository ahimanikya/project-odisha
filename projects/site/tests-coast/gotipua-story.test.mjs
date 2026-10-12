import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const story=JSON.parse(readFileSync(new URL('../../../kb/research/culture/gotipua-website.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist-coast/stories/gotipua/index.html',import.meta.url),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Gotipua preserves full narrative, source scope and further-reading discovery',()=>{
 for(const b of story.blocks)for(const p of b.paragraphs)assert.ok(html.includes(escape(p)),p);
 for(const s of story.sources)assert.ok(html.includes(escape(s.resource)));
 for(const x of ['1924','1926','15 March 2025','not proof of occurrence','not certified'])assert.ok(html.includes(x));
 assert.ok(!html.includes('Earlier research nucleus preserved'));assert.ok(!html.includes('<audio'));assert.ok(!html.includes('sounds-reading-trail'));
 for(const slug of ['sounds-of-odisha','sounds-of-odisha/mardala','sounds-of-odisha/listening-notebook'])assert.ok(html.includes('href="/'+slug+'/"'));
 for(const page of ['sounds-of-odisha','sounds-of-odisha/mardala'])assert.ok(readFileSync(new URL('../dist-coast/'+page+'/index.html',import.meta.url),'utf8').includes('href="/stories/gotipua/"'));
});
