import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('../../kb/research/culture/maniabandha.json','utf8'));
const html=readFileSync('dist-coast/stories/maniabandha/index.html','utf8');
const article=html.match(/<article class="article-reading">([\s\S]*?)<\/article>/)[1];
const plain=s=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
test('Maniabandha retains complete narrative, material limits and numbered source returns',()=>{
 for(const p of data.passages){assert.ok(plain(article).includes(p.text),'Missing paragraph '+p.id);for(const id of p.source_ids){assert.ok(article.includes(`id="ref-${p.id}-${id}"`));assert.ok(article.includes(`href="#note-${id}"`));assert.ok(article.includes(`href="#ref-${p.id}-${id}"`));}}
 assert.equal(data.sources.length,11);
 assert.match(article,/examination stage/);assert.match(article,/does not establish a new or continuing Maniabandha-specific course/);assert.match(article,/should not be read as evidence that a completed centre is open/);
 assert.match(article,/By Ahimanikya Satapathy/);assert.match(article,/Footnotes &amp; Sources/);assert.match(article,/Suggest an update/);assert.doesNotMatch(article,/Adyasha|facebook\.com|\/Users\//i);
});
test('Maniabandha artwork has responsive delivery and is labelled as illustration',()=>{assert.match(article,/srcset="[^"]+\.webp/);assert.match(article,/fetchpriority="high"/);assert.match(article,/not a photograph of Maniabandha/);assert.doesNotMatch(article,/AI-generated/i);});
test('Maniabandha is discoverable and its portable reading is complete',()=>{
 for(const route of ['crafts','textiles','destinations/cuttack'])assert.ok(readFileSync('dist-coast/'+route+'/index.html','utf8').includes('href="/stories/maniabandha/"'),route);
 const catalog=JSON.parse(html.match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id===data.save_id);assert.ok(item);for(const p of data.passages)assert.ok(item.practical.some(v=>v.text===p.text));assert.equal(item.sources.length,11);
});
