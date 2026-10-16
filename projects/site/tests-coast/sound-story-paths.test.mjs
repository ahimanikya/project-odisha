import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const paths=JSON.parse(read('../../kb/research/product/sounds-reading-paths.json'));
const entries=JSON.parse(read('../../kb/research/product/sounds-discovery.json')).entries.filter(e=>!['collection','notebook'].includes(e.id));
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const entry of entries)test(entry.id+' can continue through all reading paths with accurate current context',()=>{
 const html=read('dist-coast'+entry.href+'index.html');
 const chooser=html.match(/<details class="sound-reading-paths" id="reading-paths"[^>]*>([\s\S]*?)<\/details>/)?.[1];
 assert.ok(chooser);assert.ok(chooser.includes('Continue your reading path'));
 assert.doesNotMatch(html,/<details class="sound-reading-paths"[^>]*\bopen(?:\s|=|>)/);
 const links=[...chooser.matchAll(/<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
 assert.deepEqual(links.map(m=>m[1]).sort(),entries.map(e=>e.href).sort());
 const current=links.filter(m=>m[2].includes('aria-current="page"'));assert.equal(current.length,1);assert.equal(current[0][1],entry.href);assert.ok(current[0][3].includes('You are here'));
 const group=paths.paths.find(p=>p.stories.includes(entry.id));
 const sections=[...chooser.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/g)].map(m=>m[1]);
 assert.equal(sections.filter(s=>s.includes('Your current path')).length,1);
 assert.ok(sections[0].includes('Your current path'),'Current path should appear first');
 assert.ok(sections.find(s=>s.includes('Your current path')).includes('id="reading-path-'+group.id+'"'));
 for(const target of entries){const source=JSON.parse(read('../../kb/'+target.source));assert.ok(chooser.includes(escape(source.title)));assert.ok(existsSync('dist-coast'+target.href+'index.html'));}
 const story=JSON.parse(read('../../kb/'+entry.source));
 for(const block of story.blocks)for(const paragraph of block.paragraphs)assert.ok(html.includes(escape(paragraph)));
 for(const source of story.sources)assert.ok(html.includes(escape(source.resource)));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
