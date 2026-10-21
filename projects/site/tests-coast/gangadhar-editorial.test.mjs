import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const collection=JSON.parse(read('../../kb/research/voices/collection.json'));
const entry=collection.pages.find(p=>p.path==='people/gangadhar-meher');
const editorial=JSON.parse(read('../../kb/research/voices/gangadhar-editorial.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Gangadhar source map covers all factual passages and preserves the honest typographic panel',()=>{
 const passages=entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
 assert.deepEqual(editorial.passages,passages);
 assert.equal(entry.sections.reduce((n,s)=>n+s.paragraphs.length,0),9);assert.equal(editorial.sources.length,5);
 const paragraphs=entry.sections.flatMap(s=>s.paragraphs);
 assert.ok(paragraphs.some(p=>p.text.includes('Harekrishna Meher')&&p.text.includes('Canto IV')));
 assert.ok(paragraphs.some(p=>p.text.includes('Tamasa')&&p.text.includes('waves')));
 assert.ok(paragraphs.some(p=>p.text.includes('Anukampa')));
 assert.ok(paragraphs.some(p=>p.text.includes('2009')&&p.text.includes('2001')&&p.text.includes('Madhusudan Pati')&&p.text.includes('collective credit')));
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,editorial.sources.length);
 assert.deepEqual(new Set(editorial.sources.map(s=>s.id)),new Set(passages.flatMap(p=>p.source_ids)));
 assert.ok(entry.cards.every(c=>c.source_ids.length===0));
 assert.equal(entry.hero_asset,null);assert.match(entry.identity_note,/not a portrait or quotation/);assert.ok(entry.identity_panel.includes('Gangadhar Meher'));
});
test('Gangadhar has complete narrative, Founder byline and visible source notes with exact passage returns',()=>{
 const html=page('/people/gangadhar-meher/');
 assert.ok(html.includes('By Ahimanikya Satapathy'));assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf(`id="${entry.sections[0].id}"`));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 for(const p of entry.sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(escape(p.text)),p.text);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of editorial.passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);assert.ok(html.includes(`href="#note-${id}"`));}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.url)));assert.ok(html.includes(escape(s.note)));assert.ok(!html.includes(escape(s.inspection)));}
 assert.match(html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,''),/<section id="story-sources"/);
 assert.doesNotMatch(html,/Research and presentation prepared with AI assistance|awaiting Founder and language or literary review|Sources for this passage:/);
});
test('Gangadhar preserves reading paths, typographic panel and save identity with collapsed onward reading and visible update',()=>{
 const html=page('/people/gangadhar-meher/');
 assert.ok(html.includes(escape(entry.identity_note)));for(const line of entry.identity_panel)assert.ok(html.includes(escape(line)));
 const cover=html.match(/<header[^>]*class="mag-cover[^"]*"[^>]*>[\s\S]*?<\/header>/)?.[0];assert.ok(cover);assert.doesNotMatch(cover,/<img\b/);assert.ok(!html.includes('Images and reuse'));
 assert.match(html,/data-save-journey="reading:people\/gangadhar-meher"/);
 for(const c of entry.cards)assert.ok(html.includes(`href="${c.href}"`));for(const l of entry.external_links)assert.ok(html.includes(`href="${escape(l.href)}"`));
 const onward=html.match(/<section class="culture-onward-disclosure"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/literature/reading-journey/','/literature/','/people/bhima-bhoi/','/people/sarala-das/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Fpeople%2Fgangadhar-meher%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 const other=page('/languages/saora/');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Editorial preview/);
 for(const route of ['/languages/','/languages/odia/','/literature/','/people/fakir-mohan-senapati/','/literature/six-acres-and-a-third/','/people/sarala-das/','/people/pratibha-ray/','/people/bhima-bhoi/','/people/gopinath-mohanty/']){const previous=page(route);assert.ok(previous.includes('By Ahimanikya Satapathy'));assert.ok(previous.includes('id="story-sources"'));}
});
test('Gangadhar portable reading keeps every narrative paragraph once, byline, short sources without an invented portrait',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='reading:people/gangadhar-meher');assert.ok(item);
 assert.equal(item.author,editorial.author);assert.equal(item.checked,entry.checked_on||collection.checked_on);
 assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 assert.equal(item.photo,undefined);
 const plan={version:1,title:'Reading Gangadhar Meher',items:[{id:item.id,day:0,notes:'Keep my edition note.'}]};
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{}}),text=buildTextItinerary(plan,catalog);
 for(const p of entry.sections.flatMap(s=>s.paragraphs)){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1,p.text);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));assert.ok(output.includes('https://projectodisha.org/people/gangadhar-meher/'));assert.ok(output.includes('Keep my edition note.'));for(const source of editorial.sources){assert.ok(!output.includes(source.note));assert.ok(!output.includes(source.inspection));}}
 for(const source of editorial.sources){const url=new URL(source.url).href;assert.ok(book.includes(`href="${escapeHTML(url)}"`),source.id);assert.ok(text.includes(url),source.id);}
 assert.doesNotMatch(book,/<img\b/);
});
