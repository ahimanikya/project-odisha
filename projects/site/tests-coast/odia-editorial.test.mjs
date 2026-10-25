import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {selection,districtRows,count} from '../src/lib/language-atlas.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const collection=JSON.parse(read('../../kb/research/voices/collection.json'));
const entry=collection.pages.find(p=>p.path==='languages/odia');
const editorial=JSON.parse(read('../../kb/research/voices/odia-editorial.json'));
const atlas=JSON.parse(read('../../kb/research/voices/population-2011.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Odia maps its sourced reading and population separately and preserves both image hashes',()=>{
 const passages=entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
 passages.push({id:'population',source_ids:['c16-odisha-2011']});
 assert.deepEqual(editorial.passages,passages);
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,editorial.sources.length);
 for(const p of passages)for(const id of p.source_ids)assert.ok(editorial.sources.some(s=>s.id===id));
 assert.ok(entry.cards.every(c=>c.source_ids.length===0));
 for(const id of ['manuscript','fakir']){const a=collection.assets[id];assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);}
});
test('Odia has a byline and visible exact footnote returns for the complete narrative',()=>{
 const html=page('/languages/odia/').replaceAll('&#39;',"'");
 assert.ok(html.includes('By Ahimanikya Satapathy'));assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf(`id="${entry.sections[0].id}"`));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);assert.ok(!html.includes('href="#language-counts"'));
 assert.doesNotMatch(html,/Research and presentation prepared with AI assistance|awaiting Founder and language or literary review|Sources for this passage:/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note]of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 for(const p of entry.sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(escape(p.text)),p.text);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 for(const source of editorial.sources){assert.ok(html.includes(escape(source.url)));assert.ok(html.includes(escape(source.note)));}
});
test('Odia population retains the individual entry, original counts, districts, year and source',()=>{
 const html=page('/languages/odia/');
 const inset=html.match(/<section id="population"[\s\S]*?<\/section>/)?.[0];assert.ok(inset);
 const profile=atlas.profiles.odia,value=selection(atlas,profile.code);
 for(const text of [count(value.persons),value.share,`Recorded as ${value.label.label}`,'Census 2011',`Sheet1, row ${value.sourceRow}`,profile.note])assert.ok(inset.includes(escape(text)),text);
 for(const d of districtRows(atlas,profile.code).filter(r=>r.persons>0).slice(0,3))assert.ok(inset.includes(`${d.name} (${count(d.persons)})`));
 assert.ok(inset.includes(`href="/languages/atlas/?language=${profile.code}"`));assert.ok(inset.includes(atlas.sources.c16.url));
 assert.ok(inset.includes('id="ref-population-c16-odisha-2011"'));
 const other=page('/languages/sambalpuri/');assert.ok(other.includes('ref-population-c16-odisha-2011'));assert.ok(other.includes('language=015058'));assert.match(other,/Footnotes &amp; Sources/);
});
test('Odia preserves images, onward links, save identity and visible update privacy without changing the hub',()=>{
 const html=page('/languages/odia/');
 for(const id of ['manuscript','fakir'])for(const key of ['src','creator','license_url','source'])assert.ok(html.includes(collection.assets[id][key]),`${id}:${key}`);
 const onward=html.match(/<section class="culture-onward-disclosure"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/literature/reading-journey/','/languages/','/people/fakir-mohan-senapati/','/literature/','/destinations/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Flanguages%2Fodia%2F"[^>]*>Suggest an update/);
 assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="reading:languages\/odia"/);assert.match(html,/name="robots" content="noindex, nofollow"/);
 const hub=page('/languages/');assert.ok(hub.includes('By Ahimanikya Satapathy'));assert.ok(hub.includes('id="story-sources"'));assert.ok(hub.includes('href="#language-counts"'));
});
test('Odia portable reading contains complete paragraphs once, short sources, website link and manuscript rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='reading:languages/odia');assert.ok(item);
 assert.equal(item.author,editorial.author);assert.equal(item.checked,entry.checked_on||collection.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 const plan={version:1,title:'Reading Odia',items:[{id:item.id,day:0,notes:'Keep my edition note.'}]};
 const asset=collection.assets.manuscript;
 const image='data:image/webp;base64,'+readFileSync('public'+asset.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[asset.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const p of entry.sections.flatMap(s=>s.paragraphs)){
  const paragraph=`<p>${escapeHTML(p.text)}</p>`;assert.equal(book.split(paragraph).length-1,1,p.text);assert.ok(text.includes(p.text));
 }
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));assert.ok(output.includes('https://projectodisha.org/languages/odia/'));for(const source of editorial.sources)assert.ok(!output.includes(source.note));}
 // URL serialization percent-encodes the Odia Wikisource path in both download formats.
 for(const source of editorial.sources){const url=new URL(source.url).href;assert.ok(book.includes(`href="${escapeHTML(url)}"`),source.id);assert.ok(text.includes(url),source.id);}
 for(const value of [asset.creator,asset.license_url,asset.caption])assert.ok(book.includes(escapeHTML(value)));
 assert.ok(text.includes('Keep my edition note.'));
});
