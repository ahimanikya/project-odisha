import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const foods=json('../../kb/research/food/collection.json'),entry=foods.pages.find(p=>p.slug==='tala-pitha'),photo=foods.assets[entry.hero],editorial=json('../../kb/research/food/tala-pitha-editorial.json');
const paragraphs=entry.sections.flatMap(s=>s.paragraphs),passages=paragraphs.filter(p=>p.source_ids.length),route='/food/tala-pitha/';
const page=()=>read('dist-coast'+route+'index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const catalog=()=>JSON.parse(read('dist-coast/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
test('Tala pitha exact paragraph/source map and existing image identity',()=>{
 assert.equal(paragraphs.length,2);assert.equal(editorial.sources.length,2);assert.equal(entry.save_id,'food:tala-pitha');assert.equal(entry.sections[0].title,'');
 assert.deepEqual(paragraphs.map(({id,source_ids})=>({id,source_ids})),editorial.passages);
 for(const source of editorial.sources){assert.equal(source.url,foods.sources[source.id].url);assert.equal(source.note_segments.filter(s=>s.href).length,1);}
 assert.equal(createHash('sha256').update(readFileSync('public'+photo.src)).digest('hex'),photo.sha256);assert.equal(photo.license,'CC BY-SA 4.0');
});
test('Tala pitha visible exact prose and author-first notes have two native roundtrip targets',()=>{
 const html=page();assert.ok(html.includes('By Ahimanikya Satapathy'));
 for(const p of paragraphs)assert.equal(html.split(escapeHTML(p.text)).length-1,1,p.id);
 for(const p of passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 assert.equal([...html.matchAll(/data-footnote-ref/g)].length,2);
 for(const source of editorial.sources){assert.equal(html.split(`id="note-${source.id}"`).length-1,1);const body=source.note_segments.map(s=>s.href?`<a href="${escapeHTML(s.href)}">${escapeHTML(s.text)}</a>`:escapeHTML(s.text)).join('');assert.ok(html.replace(/ data-astro-cid-[a-z0-9]+/g,'').includes(body));}
 assert.ok(html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'').includes('id="story-sources"'));
 assert.doesNotMatch(html,/Human editorial review pending|Editorial preview|Prepared with AI assistance/);
});
test('Tala pitha preserves photograph, Save, contribution and expanded reading links',()=>{
 const html=page();assert.match(html,/mag-cover--contain/);for(const k of ['caption','creator','source','license_url','changes'])assert.ok(html.includes(escapeHTML(photo[k])),k);
 assert.match(html,/data-save-journey="food:tala-pitha"/);assert.ok(html.includes('%2Ffood%2Ftala-pitha%2F'));
 const onward=html.match(/<section id="food-further-reading"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);assert.doesNotMatch(onward,/<details/);
 for(const href of [...entry.related.map(l=>l.href),'/journey/'])assert.ok(onward.includes(`href="${href}"`));
});
test('Tala pitha portable HTML and text preserve both paragraphs and concise source list',()=>{
 const all=catalog(),item=all.find(i=>i.id===entry.save_id);assert.equal(item.author,editorial.author);assert.deepEqual(item.practical.map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));assert.equal(item.practical[0].heading,'');assert.deepEqual(item.sources,editorial.sources.map(({id,url})=>({title:id==='food-tala-delite2015'?'Delite, Tala poda pitha (2015).':'Oriyarasoi, Talaa Pitha (2016).',url})));
 const plan={version:1,title:'Tala pitha reading',items:[{id:item.id,day:1,notes:''}]},book=buildTourBook(plan,all),text=buildTextItinerary(plan,all);
 assert.doesNotMatch(book,/<h4>\s*<\/h4>/);assert.ok(!text.includes(': '+paragraphs[0].text));
 for(const p of paragraphs){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1);assert.ok(text.includes(p.text));}
 for(const source of editorial.sources){assert.ok(text.includes(source.url));assert.ok(book.includes(escapeHTML(source.url)));assert.ok(!text.includes(source.note_markdown));}
 assert.equal(item.photo.src,photo.src);assert.ok(text.includes('https://projectodisha.org'+route));
});
test('Tala pitha separate source budgets retain sequence and uncertainty',()=>{
 const expected={ 'food-tala-delite2015':{web:41,note:9,portable:'Delite, Tala poda pitha (2015).',record:16},'food-tala-oriyarasoi2016':{web:43,note:6,portable:'Oriyarasoi, Talaa Pitha (2016).',record:16}};
 for(const source of editorial.sources){const e=expected[source.id],p=paragraphs.filter(p=>p.source_ids.includes(source.id)).map(p=>p.text).join(' '),n=[entry.title,entry.lead,p].join(' ').trim().split(/\s+/).length,note=source.note_segments.map(s=>s.text).join('').trim().split(/\s+/).length;assert.equal(n,e.web);assert.equal(note,e.note);assert.equal(n*2+note+e.portable.split(/\s+/).length+e.record,112);}
 assert.match(paragraphs[0].text,/heats water-extracted palm pulp, then stirs in/);assert.match(paragraphs[0].text,/Fruit ripeness is unstated\./);assert.match(paragraphs[1].text,/starts with ripe fruit/);
});
