import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../dist-coast/sounds-of-odisha/index.html',import.meta.url),'utf8');
const story=JSON.parse(readFileSync(new URL('../../../kb/research/culture/sounds-website.json',import.meta.url),'utf8'));
test('sound collection delivers eight source-backed chapters and honest audio state',()=>{
 assert.equal(story.chapters.length,8);
 for(const c of story.chapters){assert.ok(html.includes(`id="${c.id}"`));assert.ok(html.includes(`href="#${c.id}"`));assert.ok(c.source_ids.length);}
 for(const s of story.sources) assert.ok(html.includes(s.resource.replaceAll('&','&amp;'))||html.includes(s.resource));
 assert.ok(html.includes('Audio recordings are still to come'));
 assert.ok(!html.includes('<audio'));
 assert.ok(html.includes('CC BY-SA 3.0'));
 assert.ok(readFileSync(new URL('../dist-coast/explore/index.html',import.meta.url),'utf8').includes('href="/sounds-of-odisha/"'));
});
