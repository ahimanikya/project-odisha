import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const config=JSON.parse(read('../../kb/research/product/sounds-reading-paths.json'));
const entries=JSON.parse(read('../../kb/research/product/sounds-discovery.json')).entries;
const html=read('dist-coast/sounds-of-odisha/index.html');
const section=html.match(/<details[^>]*id="reading-paths"[^>]*>([\s\S]*?)<\/details>/)?.[1];
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');
test('reading paths connect every published sound story once with canonical titles and real destinations',()=>{
 assert.ok(section);assert.equal(config.paths.length,4);
 const ids=config.paths.flatMap(p=>p.stories);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual([...ids].sort(),entries.filter(e=>!['collection','notebook'].includes(e.id)).map(e=>e.id).sort());
 const links=[...section.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert.equal(links.length,18);
 for(const id of ids){const entry=entries.find(e=>e.id===id),story=JSON.parse(read('../../kb/'+entry.source));assert.ok(links.includes(entry.href));assert.ok(decode(section).includes(story.title));assert.ok(existsSync('dist-coast'+entry.href+'index.html'));}
 for(const group of config.paths){assert.ok(section.includes('id="reading-path-'+group.id+'"'));assert.ok(section.includes(group.question));}
});
test('path chooser is native, compact by default and retains the full collection and existing navigation',()=>{
 assert.match(section,/<summary[^>]*>Choose a reading path/);assert.doesNotMatch(html,/<details[^>]*id="reading-paths"[^>]*\bopen(?:\s|=|>)/);
 assert.ok(decode(section).includes(config.note));assert.ok(html.indexOf('id="reading-paths"')<html.indexOf('id="huluhuli"'));
 const story=JSON.parse(read('../../kb/research/culture/sounds-website.json'));assert.equal(story.chapters.length,8);
 for(const chapter of story.chapters)for(const p of chapter.paragraphs)assert.ok(decode(html).includes(p));
 assert.ok(html.includes('id="further-reading"'));assert.ok(html.includes('/sounds-of-odisha/listening-notebook/'));assert.ok(html.includes('no current performance or booking is promised'));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
