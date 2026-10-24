import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const foods=JSON.parse(read('../../kb/research/food/collection.json'));
const entry=foods.pages.find(p=>p.slug==='poda-pitha'),photo=foods.assets[entry.hero];
const editorial=JSON.parse(read('../../kb/research/food/poda-editorial.json'));
const route='/food/poda-pitha/';
const page=p=>read(`dist-coast${p}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paragraphs=()=>entry.sections.flatMap(s=>s.paragraphs);
const passages=()=>entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
test('Poda source map preserves claim coverage, culinary credits and original photograph',()=>{
 assert.equal(editorial.author,'Ahimanikya Satapathy');assert.equal(entry.save_id,'food:poda-pitha');
 assert.ok(entry.sections.length>=3);assert.equal(new Set(entry.sections.map(s=>s.id)).size,entry.sections.length);
 assert.deepEqual(passages(),editorial.passages.filter(p=>p.source_ids.length));
 const ids=editorial.sources.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set(ids),new Set(passages().flatMap(p=>p.source_ids)));
 for(const source of editorial.sources){assert.ok(foods.sources[source.id]);assert.equal(source.url,foods.sources[source.id].url);assert.ok(source.note.trim());}
 for(const p of paragraphs()){assert.ok(p.text.trim());assert.ok(Array.isArray(p.source_ids));}
 assert.equal(createHash('sha256').update(readFileSync('public'+photo.src)).digest('hex'),photo.sha256);
 assert.equal(photo.sha256,'6cbd3ddf1fbf65fc0eeb846432b955c0bec24a1c9ab94391449fa2984bb247c8');
 assert.equal(photo.date,'2015-06-14');assert.equal(photo.creator,'Udipta876');assert.equal(photo.license,'CC BY-SA 4.0');
});
test('Poda renders complete prose and visible numbered notes with exact returns',()=>{
 const html=page(route);assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf(`id="${entry.sections[0].id}"`));
 for(const section of entry.sections){assert.equal(html.split(`id="${section.id}"`).length-1,1);for(const p of section.paragraphs){assert.ok(html.includes(escape(p.text)));if(p.source_ids.length)assert.ok(html.includes(`data-source-ids="${p.source_ids.join(' ')}"`));}}
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,passages().reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of passages())for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.note)));assert.ok(html.includes(escape(s.url)));}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending|Editorial preview/);
});
test('Poda retains uncropped image rights, all reading links and a visible correction action',()=>{
 const html=page(route);assert.match(html,/mag-cover--contain/);assert.equal([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].filter(m=>m[1]===photo.src).length,1);
 for(const key of ['caption','creator','source','license_url','changes'])assert.ok(html.includes(escape(photo[key])),key);
 assert.ok(html.includes(`width="${photo.width}" height="${photo.height}"`));
 const onward=html.match(/<section id="food-further-reading"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);assert.match(onward,/<h2[^>]*>Further reading<\/h2>/);assert.doesNotMatch(onward,/<details\b/);
 const connections=JSON.parse(read('../../kb/research/related-discoveries.json')).links.filter(l=>l.from===route),scope=JSON.parse(read('editions/coast.json')).routes;
 for(const href of [...entry.related.map(l=>l.href),...connections.map(l=>l.to),'/journey/'].filter(h=>scope.includes(h.split('#')[0])))assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/href="\/contribute\/\?page=%2Ffood%2Fpoda-pitha%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="food:poda-pitha"/);assert.match(html,/name="robots" content="noindex, nofollow"/);
});
test('Poda portable reading keeps each paragraph, concise sources and original image rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id===entry.save_id);
 assert.equal(item.href,route);assert.equal(item.author,editorial.author);assert.equal(item.summary,entry.lead);assert.equal(item.checked,editorial.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.equal(item.photo.src,photo.src);
 const plan={version:1,title:'Poda reading',items:[{id:item.id,day:1,notes:'Ask the maker about the sweetener.'}]},image='data:image/jpeg;base64,'+readFileSync('public'+photo.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[photo.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const p of paragraphs()){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By '+editorial.author));assert.ok(output.includes('https://projectodisha.org'+route));assert.ok(output.includes('Ask the maker about the sweetener.'));for(const s of editorial.sources)assert.ok(!output.includes(s.note));}
 for(const s of editorial.sources){assert.ok(book.includes(`href="${escapeHTML(new URL(s.url).href)}"`));assert.ok(text.includes(new URL(s.url).href));}
 for(const key of ['creator','license_url'])assert.ok(book.includes(escapeHTML(photo[key])));
});
test('Poda opt-in leaves another food article and its portable authorship unchanged',()=>{
 const other=page('/food/ou-khatta/');assert.doesNotMatch(other,/Prepared with AI assistance/);assert.doesNotMatch(other,/class="article-byline"|id="story-sources"|<[^>]+class="[^"]*\bpoda-editorial\b[^"]*"/);
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id==='food:ou-khatta');assert.ok(item);assert.equal(item.author,undefined);assert.ok(item.practical.every(p=>!p.paragraphs));
});

test('Poda preserves the dining integration without inventing available venues',()=>{
 const html=page(route),directory=JSON.parse(read('../../kb/research/food/restaurants.json')),scope=JSON.parse(read('editions/coast.json')).routes;
 const venues=directory.venues.filter(v=>v.dishes.some(d=>d.slug===entry.slug)&&scope.includes(`/food/restaurants/${v.slug}/`));
 const heading=`id="try-${entry.slug}"`;
 if(venues.length){
  const start=html.indexOf(heading),onward=html.indexOf('id="food-further-reading"');assert.ok(start>html.indexOf(`id="${entry.sections.at(-1).id}"`)&&onward>start);
  const dining=html.slice(start,onward);for(const venue of venues)assert.ok(dining.includes(`href="/food/restaurants/${venue.slug}/"`));
 }else assert.ok(!html.includes(heading));
 const template=read('src/pages/food/[slug].astro'),component=read('src/components/PodaPithaArticle.astro');
 assert.match(template,/<PodaPithaArticle[^>]*><WhereToEat dishSlug=\{entry.slug\}\/><\/PodaPithaArticle>/);
 assert.ok(component.indexOf('<slot/>')<component.indexOf('id="food-further-reading"'));
});
