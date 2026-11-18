import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const series=JSON.parse(read('../../kb/research/pioneers/series.json'));
const dist=process.env.PIONEERS_TEST_DIST||'dist';
const route=slug=>`${series.route}${slug}/`;
const landing=read(dist+series.route+'index.html');
const admitted=series.order.filter(entry=>series.included_profiles.includes(entry.slug));
const decode=text=>text.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const visible=html=>decode(html.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g,'').replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
test('Pioneers preserves requested order without links to forthcoming profiles',()=>{
 assert.deepEqual(series.order.map(entry=>entry.slug),['bc-mohanty','charles-fabri','nilamani-senapati','sudhira-das','bira-kishore-ray','sanjukta-panigrahi']);
 let last=-1;
 for(const entry of series.order){
  const position=landing.indexOf(entry.name);assert.ok(position>last);last=position;
  assert.equal(landing.includes(`href="${route(entry.slug)}"`),series.included_profiles.includes(entry.slug));
  if(!series.included_profiles.includes(entry.slug))assert.equal(existsSync(dist+route(entry.slug)+'index.html'),false);
 }
 assert.equal((landing.match(/<h1\b/g)||[]).length,1);
});
for(const [index,entry] of admitted.entries()){
 const profile=JSON.parse(read(`../../kb/research/pioneers/${entry.slug}.json`));
 const html=read(dist+route(entry.slug)+'index.html');
 const paragraphs=profile.sections.flatMap(section=>section.paragraphs.map((paragraph,index)=>({...paragraph,id:`${section.id}-${index}`})));
 test(`${entry.slug} retains sourced paragraphs, byline and footnote return links`,()=>{
  const rendered=[...html.matchAll(/<p\b[^>]*data-source-ids(?:="[^"]*")?[^>]*>([\s\S]*?)<\/p>/g)].map(match=>visible(match[1]));
  assert.deepEqual(rendered,paragraphs.map(paragraph=>paragraph.text.replace(/\s+/g,' ').trim()));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/By Ahimanikya Satapathy/);
  for(const paragraph of paragraphs)for(const id of paragraph.source_ids){
   assert.equal(html.split(`id="ref-${paragraph.id}-${id}"`).length-1,1);
   assert.equal(html.split(`href="#ref-${paragraph.id}-${id}"`).length-1,1);
  }
  for(const source of profile.sources){
   assert.equal(html.split(`id="note-${source.id}"`).length-1,1);
   assert.ok(decode(html).includes(`href="${source.url}"`));
  }
  assert.match(html,/Footnotes &amp; Sources/);
  assert.match(html,/Suggest an update/);
 });
 test(`${entry.slug} sequence leads only to admitted neighbouring profiles`,()=>{
  const sequence=html.match(/<nav[^>]*aria-label="Pioneers reading sequence"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
  const links=[...sequence.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(links,[index>0?route(admitted[index-1].slug):null,index<admitted.length-1?route(admitted[index+1].slug):null].filter(Boolean));
  assert.ok(html.includes(`href="${series.route}"`));
 });
 test(`${entry.slug} is discoverable and saved with complete narrative and sources`,()=>{
  const scope=JSON.parse(read('editions/coast.json'));
  assert.equal(scope.routes.filter(value=>value===route(entry.slug)).length,1);
  assert.ok(read(dist+'/explore/index.html').includes(`href="${route(entry.slug)}"`));
  const catalog=JSON.parse(read(dist+'/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
  const item=catalog.find(item=>item.id===`reading:pioneers/${entry.slug}`);
  assert.ok(item);assert.equal(item.summary,paragraphs[0].text);
  assert.deepEqual(item.practical.flatMap(section=>section.paragraphs),paragraphs.slice(1).map(paragraph=>paragraph.text));
  assert.deepEqual(item.sources,profile.sources.map(({title,url})=>({title,url})));
 });
}
test('Mohanty uses the approved original illustration and connected textile readings',()=>{
 if(!series.included_profiles.includes('bc-mohanty'))return;
 const html=read(dist+route('bc-mohanty')+'index.html');
 const image=JSON.parse(read('../../kb/research/pioneers/bc-mohanty-image.json'));
 assert.ok(html.includes(`src="${image.src}"`));
 assert.ok(decode(html).includes(`alt="${image.alt}"`));
 assert.ok(html.includes(`width="${image.width}"`));assert.ok(html.includes(`height="${image.height}"`));
 assert.ok(visible(html).includes(image.caption));
 assert.ok(visible(landing).includes(image.caption));
 assert.ok(html.includes(`content="https://projectodisha.org${image.src}"`));
 assert.ok(html.includes('href="/textiles/khandua/"'));
 assert.ok(html.includes('href="/textiles/sambalpuri-bandha/"'));
});
