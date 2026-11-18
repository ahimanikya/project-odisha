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
const image=JSON.parse(read('../../kb/research/stories/osakothi-image.json'));
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
test('article and series show the credited performer photograph with intrinsic portrait dimensions',()=>{
 for(const [page,figureClass] of [[html,'osakothi-photograph'],[series,'series-photograph']]){
  const figure=page.match(new RegExp(`<figure class="${figureClass}"[^>]*>([\\s\\S]*?)<\\/figure>`))?.[1];
  assert.ok(figure);
  assert.ok(decode(figure).includes(`alt="${image.alt}"`));
  assert.ok(figure.includes(`src="${image.src}"`));
  assert.ok(figure.includes(`width="${image.width}"`));
  assert.ok(figure.includes(`height="${image.height}"`));
  assert.match(figure,/srcset=/);
  assert.ok(visible(figure).includes('Guru Simanchala Nahaka'));
  assert.ok(visible(figure).includes('5 August 2019'));
  assert.ok(decode(page).includes(`href="${image.source}"`));
  assert.ok(decode(page).includes(`href="${image.license_url}"`));
  assert.ok(visible(page).includes(image.creator));
  assert.ok(visible(page).includes(image.license));
  assert.ok(visible(page).includes('without cropping'));
  assert.ok(page.includes(`content="https://projectodisha.org${image.src}"`));
 }
 assert.match(html,/<img[^>]*fetchpriority="high"/);
 assert.equal(html.split('id="note-osakothi-photograph"').length-1,1);
 assert.ok(html.includes('href="#ref-photograph-osakothi-photograph"'));
 assert.equal(story.sources.length,5);
 const explore=read(dist+'/explore/index.html');
 assert.ok(explore.includes(image.src));
});
