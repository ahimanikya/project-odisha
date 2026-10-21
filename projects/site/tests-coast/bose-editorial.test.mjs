import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const entry=JSON.parse(read('../../kb/research/people/subhas-chandra-bose.json')),photo=entry.assets[entry.hero];
const editorial=JSON.parse(read('../../kb/research/people/bose-editorial.json'));
const route='/people/subhas-chandra-bose/';
const page=p=>read(`dist-coast${p}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paragraphs=()=>entry.sections.flatMap(s=>s.paragraphs);
const passages=()=>entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
test('Bose source map preserves claim coverage, author attribution and original photographs',()=>{
 assert.equal(editorial.author,'Ahimanikya Satapathy');assert.equal(entry.save_id,'reading:people/subhas-chandra-bose');
 for(const id of ['home','first-school','ravenshaw','read','visit'])assert.ok(entry.sections.some(s=>s.id===id),id);
 assert.deepEqual(passages(),editorial.passages.filter(p=>p.source_ids.length));
 const prose=paragraphs().map(p=>p.text).join(' ');for(const phrase of ['English brought him recognition; Bengali exposed a gap','letters after the headmaster left','unsure of its ethical effect','preface dated 23 January 1948','remembered, not diary entries','does not identify every object as an original or a reproduction'])assert.ok(prose.includes(phrase),phrase);
 const ids=editorial.sources.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set(ids),new Set(passages().flatMap(p=>p.source_ids)));
 for(const source of editorial.sources){assert.ok(entry.sources[source.id]);assert.equal(source.url,entry.sources[source.id].url);assert.ok(source.note.trim());}
 for(const p of paragraphs()){assert.ok(p.text.trim());assert.ok(Array.isArray(p.source_ids));}
 for(const asset of Object.values(entry.assets))assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
 assert.equal(entry.assets.school.creator,'Kamalakanta777');assert.equal(entry.assets.school.license,'CC BY-SA 3.0');
 assert.equal(photo.creator,'Subhashish Panigrahi');assert.equal(photo.license,'CC BY-SA 4.0');
});
test('Bose renders complete prose and visible numbered notes with exact returns',()=>{
 const html=page(route);assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="home"'));
 for(const section of entry.sections){assert.equal(html.split(`id="${section.id}"`).length-1,1);for(const p of section.paragraphs){assert.ok(html.includes(escape(p.text)));if(p.source_ids.length)assert.ok(html.includes(`data-source-ids="${p.source_ids.join(' ')}"`));}}
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,passages().reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of passages())for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.note)));assert.ok(html.includes(escape(s.url)));}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending|Editorial preview/);
});
test('Bose retains uncropped image rights, all reading links and a visible correction action',()=>{
 const html=page(route),breadcrumbs=[...html.matchAll(/<nav[^>]*aria-label="Breadcrumb"[^>]*>[\s\S]*?<\/nav>/g)];assert.equal(breadcrumbs.length,1);for(const marker of ['href="/explore/"','href="/destinations/cuttack/"','aria-current="page"','Subhas Chandra Bose'])assert.ok(breadcrumbs[0][0].includes(marker),marker);assert.match(html,/mag-cover--contain/);assert.equal([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].filter(m=>m[1]===photo.src).length,1);
 for(const key of ['caption','creator','source','license_url','changes'])assert.ok(html.includes(escape(photo[key])),key);
 assert.ok(html.includes(`width="${photo.width}" height="${photo.height}"`));
 const onward=html.match(/<section id="bose-further-reading"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 const scope=JSON.parse(read('editions/coast.json')).routes;
 for(const href of [...entry.related.map(l=>l.href),'/journey/'].filter(h=>scope.includes(h.split('#')[0])))assert.ok(onward.includes(`href="${href}"`),href);
 const school=entry.assets.school,section=html.match(/<section id="ravenshaw"[\s\S]*?<\/section>/)?.[0];assert.ok(section);assert.ok(section.includes(`src="${school.src}"`));assert.ok(section.includes(escape(school.caption)));
 assert.ok(section.indexOf('class="chapter-photo"')<section.indexOf(escape(entry.sections.find(s=>s.id==='ravenshaw').paragraphs[0].text)));
 for(const asset of Object.values(entry.assets))for(const key of ['creator','source','license_url','changes'])assert.ok(html.includes(escape(asset[key])),key);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/href="\/contribute\/\?page=%2Fpeople%2Fsubhas-chandra-bose%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="reading:people\/subhas-chandra-bose"/);assert.match(html,/name="robots" content="noindex, nofollow"/);
});
test('Bose portable reading keeps each paragraph, concise sources and original image rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id===entry.save_id);
 assert.equal(item.href,route);assert.equal(item.author,editorial.author);assert.equal(item.summary,entry.lead);assert.equal(item.checked,editorial.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.equal(item.photo.src,photo.src);
 const plan={version:1,title:'Bose childhood reading',items:[{id:item.id,day:1,notes:'Keep a question about the classroom.'}]},image='data:image/jpeg;base64,'+readFileSync('public'+photo.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[photo.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const p of paragraphs()){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By '+editorial.author));assert.ok(output.includes('https://projectodisha.org'+route));assert.ok(output.includes('Keep a question about the classroom.'));for(const s of editorial.sources)assert.ok(!output.includes(s.note));}
 for(const s of editorial.sources){assert.ok(book.includes(`href="${escapeHTML(new URL(s.url).href)}"`));assert.ok(text.includes(new URL(s.url).href));}
 for(const key of ['creator','license_url'])assert.ok(book.includes(escapeHTML(photo[key])));
});
test('Bose opt-in leaves another food article and its portable authorship unchanged',()=>{
 const other=page('/food/enduri-pitha/');assert.match(other,/Prepared with AI assistance; human editorial review pending/);assert.doesNotMatch(other,/class="article-byline"|id="story-sources"|<[^>]+class="[^"]*\bbose-editorial\b[^"]*"/);
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id==='food:enduri-pitha');assert.ok(item);assert.equal(item.author,undefined);assert.ok(item.practical.every(p=>!p.paragraphs));
});

