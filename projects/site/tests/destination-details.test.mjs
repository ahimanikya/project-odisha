import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const records=JSON.parse(readFileSync('../../kb/research/destinations/details.json','utf8')).records;
const read=path=>readFileSync(`dist/${path}/index.html`,'utf8');
test('detail pages link place, experience and stay research with pictures and evidence',()=>{
 const routes=[...records,...JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8')).records,...JSON.parse(readFileSync('../../kb/research/destinations/northern-details.json','utf8')).records].map(r=>`${r.kind}/${r.slug}`);
 assert.equal(new Set(routes).size,routes.length);
 for(const r of records){
  const html=read(`visit/${r.kind}/${r.slug}`);
  if((r.kind==='experiences'&&r.slug==='mangalajodi-birdwatching')||(r.kind==='places'&&['mangalajodi','kalijai','satapada'].includes(r.slug))){assert.match(html,/By Ahimanikya Satapathy/);assert.match(html,/<section id="story-sources"/);}else assert.ok(html.includes('Editorial draft'));
  assert.match(html, /<figure[^>]*id="story-image"[^>]*><img[^>]+src="[^"]+"[^>]+alt="[^"]+"/);
  assert.ok(html.includes('id="sources-credits"'));
  assert.ok(html.includes(`/knowledge/${r.parent}/`));
  assert.ok(html.includes('creativecommons.org/licenses/'));
  assert.ok(r.sources.length>0);
  for(const link of r.related){const rootLink=link.startsWith('knowledge/')||link.startsWith('food/'); const route=(rootLink?'':'visit/')+link; assert.ok(rootLink||routes.includes(link)); assert.ok(read(route).includes('<main')); assert.ok(html.includes(`href="/${route}/"`));}
  if(r.kind==='stays'){assert.equal(r.entity_type,'base_area');assert.ok(html.includes('not a reviewed property'));assert.ok(html.includes('does not show a room'));}
 }
});
test('both destination journeys have manual controls, honest depiction and labelled optional audio',()=>{
 for(const slug of ['chilika','konark']){
  const html=read('knowledge/'+slug);
  assert.ok(html.includes('Photo sequence, not 360° footage'));
  assert.ok(html.includes('Sound off'));
  assert.ok(html.includes('data-controls hidden')||html.includes('hidden data-controls'));
  assert.ok(!html.includes('autoplay'));
  assert.equal((html.match(/<article[^>]*data-scene/g)||[]).length,4);
  assert.ok(html.includes('id="places-within"'));
  const d=JSON.parse(readFileSync(`../../kb/research/destinations/${slug}.json`,'utf8'));
  for(const item of [...d.experiences,...d.bases])assert.ok(html.includes(`href="${item.detail_href}"`));
 }
});
