import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/stories/when-the-goddess-comes-to-the-wall.json'));
const dist=process.env.OSAKOTHI_TEST_DIST||'dist';
const html=read(dist+story.route+'index.html');
const series=read(dist+story.series.href+'index.html');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const visible=s=>decode(s.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g,'').replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
const paragraphs=story.sections.flatMap(section=>section.paragraphs.map((p,i)=>({...p,id:`${section.id}-${i}`})));
test('Osakothi preserves reviewed prose and navigable source notes',()=>{
 const rendered=[...html.matchAll(/<p\b[^>]*data-source-ids(?:="[^"]*")?[^>]*>([\s\S]*?)<\/p>/g)].map(m=>visible(m[1]));
 assert.deepEqual(rendered,paragraphs.map(p=>p.text.replace(/\s+/g,' ').trim()));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/By Ahimanikya Satapathy/);
 for(const p of paragraphs)for(const id of p.source_ids){
  assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);
  assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);
 }
 for(const source of story.sources){
  assert.equal(html.split(`id="note-${source.id}"`).length-1,1);
  assert.ok(decode(html).includes(`href="${source.url}"`));
 }
 assert.match(html,/Footnotes &amp; Sources/);
 assert.match(html,/Suggest an update/);
});
test('Osakothi and the series are discoverable with reciprocal navigation',()=>{
 assert.ok(html.includes(`href="${story.series.href}"`));
 assert.ok(series.includes(`href="${story.route}"`));
 assert.equal((series.match(/<h1\b/g)||[]).length,1);
 const coast=JSON.parse(read('editions/coast.json'));
 const explore=read(dist+'/explore/index.html');
 for(const route of [story.route,story.series.href]){
  assert.equal(coast.routes.filter(r=>r===route).length,1);
  assert.ok(explore.includes(`href="${route}"`));
 }
});
test('saved reading includes the complete narrative and all five source links',()=>{
 const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const entry=catalog.find(item=>item.id==='reading:stories/when-the-goddess-comes-to-the-wall');
 assert.ok(entry);
 assert.equal(entry.summary,paragraphs[0].text);
 assert.deepEqual(entry.practical.flatMap(section=>section.paragraphs),paragraphs.slice(1).map(p=>p.text));
 assert.deepEqual(entry.sources,story.sources.map(({title,url})=>({title,url})));
 assert.ok(html.includes('data-save-journey="'+entry.id+'"'));
});
