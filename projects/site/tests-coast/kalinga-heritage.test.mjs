import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const story=JSON.parse(read('../../kb/research/stories/reading-kalinga-beyond-odisha.json'));
const dist=process.env.KALINGA_TEST_DIST||'dist-coast';
const html=read(dist+'/stories/reading-kalinga-beyond-odisha/index.html');
const hub=read(dist+'/history/index.html');
const coast=JSON.parse(read('editions/coast.json'));
const paragraphs=story.sections.flatMap(s=>s.paragraphs.map((p,i)=>({...p,id:`${s.id}-${i}`})));
test('history article renders its bounded identity claim and source navigation',()=>{
 assert.match(html,/closely matching earlier entry/);
 assert.match(html,/Modern photographs and site-location evidence still need comparison before identifying it securely/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/By Ahimanikya Satapathy/);
 for(const p of paragraphs)for(const id of p.source_ids){
  assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);
  assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);
 }
 for(const s of story.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(s.url));}
 assert.match(html,/Footnotes &amp; Sources/);
 assert.match(html,/Further reading/);assert.match(html,/Continue reading/);
 assert.match(html,/GitHub submissions are public/);
 assert.match(html,/%2Fstories%2Freading-kalinga-beyond-odisha%2F/);
 assert.doesNotMatch(html,/checked visually|AI-generated|AI-assisted/);
});
test('feature is admitted, connected to the public history collection and saveable',()=>{
 for(const route of [story.route,'/history/'])assert.equal(coast.routes.filter(x=>x===route).length,1);
 assert.match(hub,/History and heritage/);assert.ok(hub.includes(`href="${story.route}"`));
 assert.ok(html.includes('href="/history/"'));
 assert.match(html,/data-save-journey="reading:stories\/reading-kalinga-beyond-odisha"/);
 assert.ok(read(dist+'/explore/index.html').includes(`href="${story.route}"`));
 assert.ok(read(dist+'/explore/index.html').includes('href="/history/"'));
});

test('saved reading exports a useful bookmark without duplicating sourced paragraphs',()=>{
 const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(x=>x.id==='reading:stories/reading-kalinga-beyond-odisha');
 assert.ok(item);assert.equal(item.href,story.route);
 const plan={version:1,title:'History reading',items:[{id:item.id,day:1,notes:''}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const output of [book,text]){assert.ok(output.includes(story.title));assert.ok(output.includes('https://projectodisha.org'+story.route));}
 assert.equal(item.practical.length,1);
 assert.equal(item.practical[0].text,'Open the article for its full narrative and source notes.');
});
