import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const story=JSON.parse(read('../../kb/research/communities/kansari.json'));
const route='/communities/kansari/';
const html=read('dist-coast'+route+'index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escaped=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const timeline=story.timeline||[];
const passages=[...story.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids,text:p.text}))),...timeline.map((p,i)=>({id:`timeline-${i}`,source_ids:p.source_ids,text:p.text}))];
test('Kansari renders canonical prose, author and mapped visible footnotes',()=>{
 assert.equal(story.author,'Ahimanikya Satapathy');assert.match(html,/By Ahimanikya Satapathy/);
 assert.ok(html.includes(escaped(story.title)));assert.ok(html.includes(escaped(story.lead)));
 const description=story.description||story.lead;assert.ok(description.length<=250,'Search description stays within publication limit');assert.ok(html.includes(`name="description" content="${escaped(description)}"`));
 const ids=story.sources.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set(passages.flatMap(p=>p.source_ids)),new Set(ids));
 for(const section of story.sections){assert.equal(html.split(`id="${section.id}"`).length-1,1);assert.ok(section.paragraphs.length);}
 for(const p of passages){assert.ok(html.includes(escaped(p.text)));for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}}
 for(const s of story.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escaped(s.note)));assert.ok(html.includes(escaped(s.url)));}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending/);
});
test('Kansari preserves reading navigation, public correction and search boundaries',()=>{
 const scope=JSON.parse(read('editions/coast.json')).routes;assert.ok(scope.includes(route));
 assert.ok(story.further_reading?.length,'Provide at least one relevant reading path');
 const onward=html.match(/<section id="kansari-further-reading"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const link of story.further_reading){assert.ok(scope.includes(link.href.split('#')[0]),link.href);assert.ok(onward.includes(`href="${escaped(link.href)}"`));}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/href="\/contribute\/\?page=%2Fcommunities%2Fkansari%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 assert.ok(read('dist-coast/explore/index.html').includes(`href="${route}"`),'Kansari must be discoverable');
});
test('Kansari timeline, when present, retains its sourced sequence without invented imagery',()=>{
 for(const event of timeline){assert.ok(event.source_ids.length);assert.ok(html.includes(escaped(event.date)));assert.ok(html.includes(escaped(event.title)));}
 const article=html.match(/<article class="article-reading kansari-story"[\s\S]*?<\/article>/)?.[0];assert.ok(article);
 if(story.figure){
 const figure=story.figure;assert.ok(story.sections.some(s=>s.id===figure.after_section));
 assert.equal((article.match(/<img\b/g)||[]).length,1);
 for(const value of [figure.caption,figure.creator,figure.license,figure.changes])assert.ok(article.includes(escaped(value)));
 for(const url of [figure.source,figure.license_url])assert.ok(article.includes(`href="${escaped(url)}"`));
 assert.ok(article.includes(`src="${escaped(figure.src)}"`));assert.ok(article.includes(`alt="${escaped(figure.alt)}"`));
 assert.ok(readFileSync('public'+figure.src).length>0);
 }else assert.doesNotMatch(article,/<img\b/);
});

test('Kansari portable reading keeps full paragraphs, author and concise sources',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id==='reading:kansari');
 assert.ok(item);assert.equal(item.href,route);assert.equal(item.author,story.author);assert.equal(item.checked,story.checked_on);assert.equal(item.summary,story.lead);
 assert.deepEqual(item.sources,story.sources.map(({title,url})=>({title,url})));assert.deepEqual(item.practical.map(p=>p.paragraphs),story.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.match(html,/data-save-journey="reading:kansari"/);
 const plan={version:1,title:'Kansari reading',items:[{id:item.id,day:1,notes:'Read the work and community distinction.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const p of story.sections.flatMap(s=>s.paragraphs)){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By '+story.author));assert.ok(output.includes('https://projectodisha.org'+route));assert.ok(output.includes('Read the work and community distinction.'));for(const source of story.sources)assert.ok(!output.includes(source.note));}
 for(const source of story.sources){assert.ok(book.includes(`href="${escapeHTML(new URL(source.url).href)}"`));assert.ok(text.includes(new URL(source.url).href));}
});
