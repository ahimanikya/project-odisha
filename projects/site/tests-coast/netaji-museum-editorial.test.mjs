import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const page=route=>read(`dist-coast${route}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const route='/visit/experiences/cuttack-netaji/';
const editorial=JSON.parse(read('../../kb/research/destinations/netaji-museum-editorial.json'));
const record=JSON.parse(read('../../kb/research/destinations/central-details.json')).records.find(r=>r.slug==='cuttack-netaji');
const regions=JSON.parse(read('../../kb/research/destinations/regions.json'));
const asset=regions.assets[record.photo_ref];
test('Netaji source map ties the three factual passages to two inspected sources and preserves the documentary image',()=>{
 assert.equal(editorial.route,route);
 assert.equal(editorial.sources.length,2);
 assert.deepEqual(editorial.passages.map(p=>p.id),['detail-0','detail-1','detail-2']);
 assert.equal(editorial.passages.reduce((n,p)=>n+p.source_ids.length,0),4);
 assert.deepEqual(editorial.sources.map(s=>s.id),record.sources);
 for(const passage of editorial.passages){
  const section=record.sections[Number(passage.id.split('-')[1])];
  assert.equal(section.kind,'sourced_summary');
  assert.deepEqual(passage.source_ids,section.sources);
  for(const id of passage.source_ids)assert.ok(editorial.sources.some(source=>source.id===id));
 }
 assert.equal(editorial.practical_in_article,true);
 assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
});
test('Netaji has a Founder byline, visible numbered notes and one return per passage reference',()=>{
 const html=page(route);
 assert.ok(html.includes('By Ahimanikya Satapathy'));
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,4);
 assert.equal(new Set(refs.map(r=>r[1])).size,4);
 assert.equal(new Set(refs.map(r=>r[2])).size,2);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/<section id="story-sources"/);
 for(const section of record.sections)for(const paragraph of [section.text,...(section.paragraphs||[])])assert.ok(html.includes(escapeHTML(paragraph)),section.heading);
 assert.doesNotMatch(html,/id="current-arrangements"|id="visit-notebook"/);
 assert.ok(html.includes('Current hours, fees and a step-free route have not been verified'));
});
test('Netaji keeps the documentary photograph, rights and historical context',()=>{
 const html=page(route);
 for(const value of [asset.src,asset.creator,asset.source,asset.license_url])assert.ok(html.includes(value),value);
 const hero=html.match(/<figure id="story-image"[\s\S]*?<\/figure>/)?.[0];assert.ok(hero);
 assert.ok(hero.includes(record.photo_context));
 assert.match(hero,/width="1600" height="1200"/);
});
test('Netaji keeps further reading collapsed, update guidance visible and adjacent route behavior unchanged',()=>{
 const html=page(route);
 const onward=html.match(/<section id="connect-visit"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<details class="utk-disclosure"[^>]*><summary[^>]*>Further reading<\/summary>/);
 assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/people/subhas-chandra-bose/','/visit/places/barabati/','/food/cuttack/','/visit/stays/cuttack/','/destinations/cuttack/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Fvisit%2Fexperiences%2Fcuttack-netaji%2F"[^>]*>Suggest an update/);
 assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="experience:cuttack-netaji"/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 const other=page('/visit/experiences/jobra-maritime-museum/');
 assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);
 assert.doesNotMatch(other,/Drafted with AI assistance/);
 for(const href of ['/visit/places/barabati/','/visit/experiences/cuttack-filigree/'])assert.match(page(href),/By Ahimanikya Satapathy/);
});
test('Netaji portable reading retains every paragraph, author, original check date and concise sources',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='experience:cuttack-netaji');assert.ok(item);
 assert.equal(item.href,route);assert.equal(item.author,editorial.author);assert.equal(item.summary,record.lead);
 assert.equal(item.checked,regions.regions.find(r=>r.slug==='cuttack').checked_on||regions.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 assert.deepEqual(item.practical.map(s=>s.paragraphs),record.sections.map(s=>[s.text,...(s.paragraphs||[])]));
 const plan={version:1,title:'A Cuttack museum visit',items:[{id:item.id,day:1,notes:'Read the exhibit label.'}]};
 const image='data:image/webp;base64,'+readFileSync('public'+asset.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[asset.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const section of record.sections)for(const paragraph of [section.text,...(section.paragraphs||[])]){
  assert.ok(book.includes(`<p>${escapeHTML(paragraph)}</p>`),section.heading);
  assert.ok(text.includes(paragraph),section.heading);
 }
 for(const output of [book,text]){
  assert.ok(output.includes('By Ahimanikya Satapathy'));
  for(const source of editorial.sources){assert.ok(output.includes(source.url));assert.ok(!output.includes(source.note));}
 }
 for(const value of [asset.creator,asset.license_url])assert.ok(book.includes(value));
 assert.ok(text.includes('Read the exhibit label.'));
});
