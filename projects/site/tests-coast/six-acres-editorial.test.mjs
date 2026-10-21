import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const collection=JSON.parse(read('../../kb/research/voices/collection.json'));
const entry=collection.pages.find(p=>p.path==='literature/six-acres-and-a-third');
const editorial=JSON.parse(read('../../kb/research/voices/six-acres-editorial.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Six Acres source map covers all factual passages and preserves the documentary bust hash',()=>{
 const passages=entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
 assert.deepEqual(editorial.passages,passages);
 assert.equal(entry.sections.reduce((n,s)=>n+s.paragraphs.length,0),12);
 assert.ok(editorial.sources.some(s=>s.id==='fakir-novel-court'));
 assert.ok(entry.sections.flatMap(s=>s.paragraphs).some(p=>p.text.includes('1902')&&p.text.includes('1905')));
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,editorial.sources.length);
 assert.deepEqual(new Set(editorial.sources.map(s=>s.id)),new Set(passages.flatMap(p=>p.source_ids)));
 assert.ok(entry.cards.every(c=>c.source_ids.length===0));
 const a=collection.assets.fakir;assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);
 assert.equal(a.kind,'photograph');assert.match(a.caption,/commemorative bust/);
});
test('Six Acres has complete narrative, Founder byline and visible source notes with exact passage returns',()=>{
 const html=page('/literature/six-acres-and-a-third/');
 assert.ok(html.includes('By Ahimanikya Satapathy'));assert.ok(html.includes('Fakir Mohan Senapati'));assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf(`id="${entry.sections[0].id}"`));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 for(const p of entry.sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(escape(p.text)),p.text);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of editorial.passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);assert.ok(html.includes(`href="#note-${id}"`));}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.url)));assert.ok(html.includes(escape(s.note)));assert.ok(!html.includes(escape(s.inspection)));}
 assert.match(html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,''),/<section id="story-sources"/);
 assert.doesNotMatch(html,/Research and presentation prepared with AI assistance|awaiting Founder and language or literary review|Sources for this passage:/);
});
test('Six Acres preserves reading paths, documentary credit and save identity with collapsed onward reading and visible update',()=>{
 const html=page('/literature/six-acres-and-a-third/');
 assert.ok(html.includes(escape(entry.hero_caption)));
 const a=collection.assets.fakir;for(const key of ['src','source','creator','license_url','caption','changes'])assert.ok(html.includes(escape(a[key])),key);
 assert.match(html,/data-save-journey="reading:literature\/six-acres-and-a-third"/);
 for(const c of entry.cards)assert.ok(html.includes(`href="${c.href}"`));for(const l of entry.external_links)assert.ok(html.includes(`href="${escape(l.href)}"`));
 const onward=html.match(/<section class="culture-onward-disclosure"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/people/fakir-mohan-senapati/','/literature/','/languages/','/destinations/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Fliterature%2Fsix-acres-and-a-third%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 const other=page('/languages/sambalpuri/');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Editorial preview/);
 for(const route of ['/languages/','/languages/odia/','/literature/','/people/fakir-mohan-senapati/']){const previous=page(route);assert.ok(previous.includes('By Ahimanikya Satapathy'));assert.ok(previous.includes('id="story-sources"'));}
});
test('Six Acres portable reading keeps every narrative paragraph once, byline, short sources and bust rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='reading:literature/six-acres-and-a-third');assert.ok(item);
 assert.equal(item.author,editorial.author);assert.equal(item.checked,entry.checked_on||collection.checked_on);
 assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 const a=collection.assets.fakir,image='data:image/webp;base64,'+readFileSync('public'+a.src).toString('base64');
 const plan={version:1,title:'Reading Six Acres',items:[{id:item.id,day:0,notes:'Keep my edition note.'}]};
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[a.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const p of entry.sections.flatMap(s=>s.paragraphs)){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1,p.text);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));assert.ok(output.includes('https://projectodisha.org/literature/six-acres-and-a-third/'));assert.ok(output.includes('Keep my edition note.'));for(const source of editorial.sources){assert.ok(!output.includes(source.note));assert.ok(!output.includes(source.inspection));}}
 for(const source of editorial.sources){const url=new URL(source.url).href;assert.ok(book.includes(`href="${escapeHTML(url)}"`),source.id);assert.ok(text.includes(url),source.id);}
 for(const key of ['creator','license_url'])assert.ok(book.includes(escapeHTML(a[key])));
 assert.ok(book.includes('Bust commemorating Fakir Mohan Senapati; not a book cover.'));
});
