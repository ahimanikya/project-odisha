import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const page=route=>read(`dist-coast${route}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const route='/visit/stays/cuttack/';
const editorial=JSON.parse(read('../../kb/research/destinations/cuttack-stay-editorial.json'));
const record=JSON.parse(read('../../kb/research/destinations/central-details.json')).records.find(r=>r.kind==='stays'&&r.slug==='cuttack');
const regions=JSON.parse(read('../../kb/research/destinations/regions.json'));
const asset=regions.assets[record.photo_ref];
test('Cuttack stay source map cites transport context without assigning evidence to editorial choices',()=>{
 assert.equal(editorial.route,route);
 assert.equal(editorial.sources.length,1);
 assert.deepEqual(editorial.passages,[{id:'detail-1',source_ids:['cuttack-how-to-reach']}]);
 assert.deepEqual(record.sections[1].sources,editorial.passages[0].source_ids);
 assert.equal(record.sections[0].options.length,3);
 for(const option of record.sections[0].options)for(const field of ['area','fit','transport','check'])assert.ok(typeof option[field]==='string'&&option[field].trim(),`Missing option ${field}`);
 for(const index of [0,2]){assert.equal(record.sections[index].kind,'editorial_guidance');assert.deepEqual(record.sections[index].sources,[]);}
 assert.equal(editorial.practical_in_article,true);
 assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
});
test('Cuttack stay reading preserves all three comparisons with one visible source and exact return',()=>{
 const html=page(route);
 assert.ok(html.includes('By Ahimanikya Satapathy'));
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,1);
 const [,ref,note]=refs[0];assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);
 for(const section of record.sections){
  for(const paragraph of [section.text,...(section.paragraphs||[])])assert.ok(html.includes(escapeHTML(paragraph)),section.heading);
  for(const option of section.options||[])for(const value of Object.values(option))assert.ok(html.includes(escapeHTML(value)),value);
 }
 assert.doesNotMatch(html,/id="current-arrangements"|id="visit-notebook"/);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
});
test('Cuttack stay retains a contextual photograph and concise rights, onward reading, updates and save identity',()=>{
 const html=page(route);
 const hero=html.match(/<figure id="story-image"[\s\S]*?<\/figure>/)?.[0];assert.ok(hero);
 assert.ok(hero.includes(record.photo_context));assert.match(hero,/width="1600" height="899"/);
 const credit=html.match(/<div id="sources-credits"[\s\S]*?<\/div>/)?.[0];assert.ok(credit);
 assert.equal(credit.split(asset.creator).length-1,1);
 for(const value of [asset.source,asset.license_url,asset.changes])assert.ok(credit.includes(value));
 assert.ok(credit.includes('Barabati gateway, Cuttack (2016)'));
 const onward=html.match(/<section id="connect-visit"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<details class="utk-disclosure"[^>]*><summary[^>]*>Further reading<\/summary>/);
 assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/destinations/bhubaneswar/','/destinations/cuttack/','/visit/experiences/cuttack-netaji/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Fvisit%2Fstays%2Fcuttack%2F"[^>]*>Suggest an update/);
 assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="stay:cuttack"/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 const other=page('/visit/stays/balasore-coast/');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Drafted with AI assistance/);
});
test('Cuttack stay portable reading preserves author, paragraph breaks, all option guidance and concise sources',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='stay:cuttack');assert.ok(item);
 assert.equal(item.href,route);assert.equal(item.author,editorial.author);assert.equal(item.summary,record.lead);
 assert.equal(item.checked,regions.regions.find(r=>r.slug==='cuttack').checked_on||regions.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 assert.equal(item.practical.length,record.sections.length+3);
 for(const section of record.sections)assert.deepEqual(item.practical.find(p=>p.heading===section.heading).paragraphs,[section.text,...(section.paragraphs||[])]);
 const plan={version:1,title:'A Cuttack base',items:[{id:item.id,day:1,notes:'Confirm the entrance.'}]};
 const image='data:image/jpeg;base64,'+readFileSync('public'+asset.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[asset.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const section of record.sections){
  for(const paragraph of [section.text,...(section.paragraphs||[])]){assert.ok(book.includes(`<p>${escapeHTML(paragraph)}</p>`),section.heading);assert.ok(text.includes(paragraph),section.heading);}
  for(const option of section.options||[])for(const value of Object.values(option)){assert.ok(book.includes(escapeHTML(value)));assert.ok(text.includes(value));}
 }
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));for(const source of editorial.sources){assert.ok(output.includes(source.url));assert.ok(!output.includes(source.note));}}
 for(const value of [asset.creator,asset.license_url])assert.ok(book.includes(value));
 assert.ok(text.includes('Confirm the entrance.'));
});
