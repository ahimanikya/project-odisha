import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const html=read('dist-coast/sounds-of-odisha/index.html');
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const entries=JSON.parse(read('../../kb/research/product/sounds-discovery.json')).entries.filter(e=>e.href.startsWith('/stories/'));
test('Sounds collection exposes every further-reading story with its canonical introduction',()=>{
 const section=html.match(/<section[^>]*id="further-reading"[^>]*>([\s\S]*?)<\/section>/)?.[1];assert.ok(section);
 const cards=[...section.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1]);assert.equal(cards.length,entries.length);assert.equal(cards.length,12);
 const links=cards.map(c=>c.match(/href="([^"]+)"/)[1]);assert.deepEqual(links,entries.map(e=>e.href));assert.equal(new Set(links).size,links.length);
 for(const entry of entries){const source=JSON.parse(read('../../kb/'+entry.source));const card=cards.find(c=>c.includes('href="'+entry.href+'"'));assert.ok(decode(card).includes(source.title));assert.ok(decode(card).includes(source.lead));assert.ok(existsSync('dist-coast'+entry.href+'index.html'));}
 assert.ok(html.indexOf('href="#further-reading"')<html.indexOf('id="huluhuli"'));assert.equal((html.match(/id="further-reading"/g)||[]).length,1);
 assert.ok(section.includes('/explore/?q=Sounds%20of%20Odisha'));assert.ok(!html.includes('Further reading:'));
 const story=JSON.parse(read('../../kb/research/culture/sounds-website.json'));assert.equal(story.chapters.length,8);
 for(const chapter of story.chapters){for(const p of chapter.paragraphs)assert.ok(decode(html).includes(p));assert.ok(html.includes('href="/sounds-of-odisha/'+chapter.id+'/"'));}
 assert.ok(html.includes('no current performance or booking is promised'));assert.ok(!html.includes('<audio'));
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
});
