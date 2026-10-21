import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const foods=JSON.parse(read('../../kb/research/food/collection.json'));
const entry=foods.pages.find(p=>p.slug==='balasore'),photo=foods.assets[entry.hero];
const editorial=JSON.parse(read('../../kb/research/food/chandipur-meal-editorial.json'));
const route='/food/balasore/';
const page=p=>read(`dist-coast${p}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paragraphs=()=>entry.sections.flatMap(s=>s.paragraphs);
const passages=()=>entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
test('Chandipur meal source map preserves claim coverage, culinary credits and original photograph',()=>{
 assert.equal(editorial.author,'Ahimanikya Satapathy');assert.equal(entry.save_id,'food:chandipur-seafood');
 for(const id of ['place','try'])assert.ok(entry.sections.some(s=>s.id===id),id);
 assert.deepEqual(passages(),editorial.passages.filter(p=>p.source_ids.length));
 assert.ok(paragraphs().length>0);assert.ok(passages().length>0);
 const prose=paragraphs().map(p=>p.text).join(' ');for(const phrase of ['Jitu Mishra','October 2019','Balaramgadi','Budhabalanga','hilsa','pomfret','auction','It does not trace the seafood served by a particular restaurant.','portion and price'])assert.ok(prose.includes(phrase),phrase);
 assert.deepEqual(passages().map(p=>p.id),['place-0','harbour-0']);
 const ids=editorial.sources.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set(ids),new Set(passages().flatMap(p=>p.source_ids)));
 for(const source of editorial.sources){assert.ok(foods.sources[source.id]);assert.equal(source.url,foods.sources[source.id].url);assert.ok(source.note.trim());}
 for(const p of paragraphs()){assert.ok(p.text.trim());assert.ok(Array.isArray(p.source_ids));}
 assert.equal(createHash('sha256').update(readFileSync('public'+photo.src)).digest('hex'),photo.sha256);
 assert.equal(photo.sha256,'cd0d20634950b20af1301665a667e5baff2a670344b1c8d399f99f9302eea2e1');
 assert.equal(photo.creator,'Nihar.race');assert.equal(photo.photographed_on,'2012-02-26');assert.match(photo.caption,/not a restaurant or dish photograph/);assert.equal(photo.license,'CC BY-SA 4.0');
});
test('Chandipur meal renders complete prose and visible numbered notes with exact returns',()=>{
 const html=page(route);assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="place"'));
 for(const section of entry.sections){assert.equal(html.split(`id="${section.id}"`).length-1,1);for(const p of section.paragraphs){assert.ok(html.includes(escape(p.text)));if(p.source_ids.length)assert.ok(html.includes(`data-source-ids="${p.source_ids.join(' ')}"`));}}
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,passages().reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of passages())for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.note)));assert.ok(html.includes(escape(s.url)));}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending|Editorial preview/);
});
test('Chandipur meal retains uncropped image rights, all reading links and a visible correction action',()=>{
 const html=page(route);assert.match(html,/mag-cover--contain/);assert.equal([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].filter(m=>m[1]===photo.src).length,1);
 for(const key of ['caption','creator','source','license_url','changes'])assert.ok(html.includes(escape(photo[key])),key);
 assert.ok(html.includes(`width="${photo.width}" height="${photo.height}"`));
 const onward=html.match(/<section id="food-further-reading"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 const connections=JSON.parse(read('../../kb/research/related-discoveries.json')).links.filter(l=>l.from===route),scope=JSON.parse(read('editions/coast.json')).routes;
 for(const href of [...entry.related.map(l=>l.href),...connections.map(l=>l.to),'/journey/'].filter(h=>scope.includes(h.split('#')[0])))assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/href="\/contribute\/\?page=%2Ffood%2Fbalasore%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="food:chandipur-seafood"/);assert.match(html,/name="robots" content="noindex, nofollow"/);
});
test('Chandipur meal portable reading keeps each paragraph, concise sources and original image rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id===entry.save_id);
 assert.equal(item.href,route);assert.equal(item.author,editorial.author);assert.equal(item.summary,entry.lead);assert.equal(item.checked,editorial.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.equal(item.photo.src,photo.src);
 const plan={version:1,title:'Chandipur meal reading',items:[{id:item.id,day:1,notes:'Ask about the preparation and portion.'}]},image='data:image/jpeg;base64,'+readFileSync('public'+photo.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[photo.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const p of paragraphs()){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By '+editorial.author));assert.ok(output.includes('https://projectodisha.org'+route));assert.ok(output.includes('Ask about the preparation and portion.'));for(const s of editorial.sources)assert.ok(!output.includes(s.note));}
 for(const s of editorial.sources){assert.ok(book.includes(`href="${escapeHTML(new URL(s.url).href)}"`));assert.ok(text.includes(new URL(s.url).href));}
 for(const key of ['creator','license_url','caption'])assert.ok(book.includes(escapeHTML(photo[key])));
});
test('Chandipur meal opt-in leaves another food article and its portable authorship unchanged',()=>{
 const other=page('/food/poda-pitha/');assert.match(other,/Prepared with AI assistance; human editorial review pending/);assert.doesNotMatch(other,/class="article-byline"|id="story-sources"|<[^>]+class="[^"]*\bchandipur-meal-editorial\b[^"]*"/);
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id==='food:poda-pitha');assert.ok(item);assert.equal(item.author,undefined);assert.ok(item.practical.every(p=>!p.paragraphs));
});

test('Chandipur meal retains the Balasore dining-directory link before onward reading and preserves reviewed foods',()=>{
 const html=page(route),start=html.indexOf('id="dining-balasore"'),end=html.indexOf('id="food-further-reading"');
 assert.equal(html.split('id="dining-balasore"').length-1,1);assert.ok(start>html.indexOf('id="try"')&&end>start);
 const dining=html.slice(start,end);assert.ok(dining.includes('Find a table in Balasore'));assert.ok(dining.includes('href="/food/where-to-eat/#balasore"'));
 assert.ok(dining.includes('Explore local restaurants and visit their own websites to plan a meal.'));
 const directory=JSON.parse(read('../../kb/research/food/restaurants.json')),scope=JSON.parse(read('editions/coast.json')).routes;
 const venues=directory.venues.filter(v=>v.dishes.some(d=>d.slug===entry.slug)&&scope.includes(`/food/restaurants/${v.slug}/`));assert.equal(html.split('id="try-balasore"').length-1,venues.length?1:0);
 for(const venue of venues)assert.ok(html.includes(`href="/food/restaurants/${venue.slug}/"`));
 const chhena=page('/food/chhena-poda/');assert.match(chhena,/By Ahimanikya Satapathy/);assert.equal(chhena.split('id="try-chhena-poda"').length-1,1);assert.ok(chhena.includes('href="/food/restaurants/atithi-devo-bhaba/"'));
 assert.match(page('/food/mudhi-mansa/'),/By Ahimanikya Satapathy/);
});
