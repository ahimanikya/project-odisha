import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const story=JSON.parse(read('../../../kb/research/culture/ghumura-website.json'));
const html=read('../dist-coast/stories/ghumura/index.html');
const escape=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Ghumura publishes the KB narrative and preserves evidence boundaries',()=>{
 const body=read('../../../kb/research/culture/ghumura.md').split('# Ghumura: the drum carried into the dance\n')[1].split('## Footnotes & Sources')[0].replace(/\[\^[^\]]+\]/g,'').trim();
 const paragraphs=body.split(/\n\n/).filter(p=>!p.startsWith('## ')&&!p.startsWith('By '));
 assert.deepEqual(story.blocks.flatMap(b=>b.paragraphs),paragraphs);
 for(const p of paragraphs)assert.ok(html.includes(escape(p)),p);
 for(const s of story.sources)for(const segment of s.footnote_segments){assert.ok(html.includes(escape(segment.text)));if(segment.href)assert.ok(html.includes(escape(segment.href)));}
 for(const phrase of ['pot-shaped drum','eighteen to twenty artists','Dhayananda Panda','not a dated account of its invention'])assert.ok(html.includes(phrase));
 assert.ok(!html.includes('<audio'));assert.ok(!html.includes('sounds-reading-trail'));
});
test('Ghumura is discoverable and retains the public preview boundary',()=>{
 for(const route of story.further_reading.map(link=>link.href))assert.ok(html.includes('href="'+route+'"'));
 for(const page of ['sounds-of-odisha','explore'])assert.ok(read('../dist-coast/'+page+'/index.html').includes('/stories/ghumura/'));
 assert.equal(JSON.parse(read('../../../kb/research/culture/sounds-website.json')).chapters.length,8);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex, (?:no)?follow"/);
 const entries=JSON.parse(read('../../../kb/research/product/sounds-discovery.json')).entries;
 assert.equal(entries.filter(e=>e.href==='/stories/ghumura/').length,1);
 assert.ok(JSON.parse(read('../../../kb/research/discovery-aliases.json')).entries['/stories/ghumura/'].includes('Ghumura dance'));
});
