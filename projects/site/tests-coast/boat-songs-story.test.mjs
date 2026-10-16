import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const story=JSON.parse(read('../../../kb/research/culture/boat-songs-website.json'));
const html=read('../dist-coast/stories/boat-songs/index.html');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Boat songs publishes the KB narrative and preserves evidence boundaries',()=>{
 const body=read('../../../kb/research/culture/boat-songs.md').split('# Boat songs of Odisha\n')[1].split('[Continue with the Sounds')[0].replace(/\[\^[^\]]+\]/g,'').trim();
 const paragraphs=body.split(/\n\n/).filter(p=>!p.startsWith('## '));
 assert.deepEqual(story.blocks.flatMap(b=>b.paragraphs),paragraphs);
 for(const p of paragraphs)assert.ok(html.includes(escape(p)),p);
 for(const s of story.sources){assert.ok(html.includes(escape(s.resource)));assert.ok(html.includes(escape(s.locator)));}
 for(const phrase of ['The verse printed immediately afterwards is a ploughman’s song','not a dated account of how the performance began','contemporary adaptation with identifiable makers','do not establish one birthplace'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('Read the source:'));
 assert.ok(html.includes('Read alongside:'));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('sounds-reading-trail'));
});
test('Boat songs is discoverable and retains the public preview boundary',()=>{
 for(const route of ['/sounds-of-odisha/','/stories/chilika-listening/','/sounds-of-odisha/listening-notebook/'])assert.ok(html.includes('href="'+route+'"'));
 for(const page of ['sounds-of-odisha','explore'])assert.ok(read('../dist-coast/'+page+'/index.html').includes('/stories/boat-songs/'));
 assert.equal(JSON.parse(read('../../../kb/research/culture/sounds-website.json')).chapters.length,8);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
 const entries=JSON.parse(read('../../../kb/research/product/sounds-discovery.json')).entries;
 assert.equal(entries.filter(e=>e.href==='/stories/boat-songs/').length,1);
 assert.ok(JSON.parse(read('../../../kb/research/discovery-aliases.json')).entries['/stories/boat-songs/'].includes('Nauria geeta'));
});
