import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const data=JSON.parse(read('../../kb/research/destinations/regions.json'));
const region=data.regions.find(r=>r.slug==='mayurbhanj');
const editorial=JSON.parse(read('../../kb/research/destinations/mayurbhanj-editorial.json'));
const page=route=>read(`dist-coast${route}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const passages=()=>[
 ...region.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))),
 ...region.items.map(i=>({id:i.id.replaceAll(':','-'),source_ids:i.source_ids})),
 ...(region.visitor_notes||[]).map((p,i)=>({id:`visitor-${i}`,source_ids:p.source_ids})),
 ...region.facts.map((p,i)=>({id:`fact-${i}`,source_ids:p.source_ids}))
].filter(p=>p.source_ids.length);
test('Mayurbhanj source map covers its prose, stops and facts while preserving documentary files',()=>{
 assert.deepEqual(editorial.passages,passages());assert.deepEqual(editorial.notebook_passages,[]);
 assert.deepEqual(new Set(editorial.sources.map(s=>s.id)),new Set(passages().flatMap(p=>p.source_ids)));
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,editorial.sources.length);
 assert.equal(region.sections.reduce((n,s)=>n+s.paragraphs.length,0),10);assert.equal(editorial.sources.length,8);
 const prose=region.sections.flatMap(s=>s.paragraphs).map(p=>p.text).join(' ');for(const detail of ['Budhabalang','orchids','Natraj','Pritha Ghosh','Saroj Mohanti','Bidu Chandan','Kherwal Bir','mutton','chicken','prohibit drones'])assert.ok(prose.includes(detail),detail);
 assert.deepEqual(region.visitor_notes,[]);assert.ok(region.facts.every(f=>f.source_ids.length===0));assert.ok(!editorial.sources.some(s=>['similipal','similipal-closure','baripada'].includes(s.id)));
 const batteryWords=region.sections.flatMap(s=>s.paragraphs).filter(p=>p.source_ids.includes('dance-battery2024')).map(p=>p.text).concat(editorial.sources.find(s=>s.id==='dance-battery2024').note).join(' ').split(/\s+/).length;assert.ok(batteryWords<200);
 for(const id of ['barehipani','mayurbhanj-chhau','mudhi-mansa','script']){const a=data.assets[id];assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);assert.equal(a.kind,id==='script'?'script':'photograph');}
 assert.equal(region.id,'place:mayurbhanj');assert.equal(region.hero,'barehipani');
});
test('Mayurbhanj renders full narrative, Founder byline and visible numbered notes with exact returns',()=>{
 const html=page('/destinations/mayurbhanj/');assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="stories"'));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 for(const s of region.sections){if(s.id!=='before-you-go'){assert.ok(html.indexOf(`id="${s.id}"`)<html.indexOf('id="choose-your-stops"'));assert.ok(html.includes(`href="#${s.id}"`));}for(const p of s.paragraphs)assert.ok(html.includes(escape(p.text)),s.id);}
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,passages().reduce((n,p)=>n+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of passages())for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.url)));assert.ok(html.includes(escape(s.note)));if(s.inspection)assert.ok(!html.includes(escape(s.inspection)));}
 assert.match(html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,''),/<section id="story-sources"/);
 assert.doesNotMatch(html,/<details[^>]*id="sources"|Research and original editorial framing|Editorial preview · Reference check/);
});
test('Mayurbhanj preserves photos, saved ideas and onward paths with a visible private-information warning',()=>{
 const html=page('/destinations/mayurbhanj/');
 for(const id of ['barehipani','mayurbhanj-chhau','mudhi-mansa','script']){const a=data.assets[id];for(const k of ['src','caption','creator','source','license_url','changes'])assert.ok(html.includes(escape(a[k])),`${id}:${k}`);}
 assert.match(html,/mag-cover--contain/);assert.match(html,/region-contain/);
 for(const id of [region.id,...region.items.map(i=>i.id==='reading:mayurbhanj-ol-chiki'?'reading:languages/santali':i.id)])assert.ok(html.includes(`data-save-journey="${id}"`),id);
 assert.ok(html.includes('id="reading-mayurbhanj-ol-chiki"'));assert.ok(html.includes('href="/languages/santali/"'));assert.ok(!html.includes('data-save-journey="reading:mayurbhanj-ol-chiki"'));
 const scope=JSON.parse(read('editions/coast.json'));assert.ok(scope.routes.includes('/languages/santali/'));assert.ok(scope.journey_ids.includes('reading:languages/santali'));assert.ok(!scope.journey_ids.includes('reading:mayurbhanj-ol-chiki'));
 const onward=html.match(/<details class="mag-disclosure region-mayurbhanj-onward"[\s\S]*?<\/details>/)?.[0];assert.ok(onward);assert.match(onward,/<summary>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/journey/','/destinations/balasore/',region.journey_starter.href])assert.ok(onward.includes(`href="${href}"`));
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/href="\/contribute\/\?page=%2Fdestinations%2Fmayurbhanj%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 const other=page('/languages/kuvi/');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Editorial preview/);
 for(const route of ['/destinations/cuttack/','/destinations/puri/','/destinations/bhubaneswar/','/destinations/balasore/']){const previous=page(route);assert.ok(previous.includes('By Ahimanikya Satapathy'));assert.ok(previous.includes('id="story-sources"'));}
});
test('Mayurbhanj portable reading keeps complete paragraphs, short sources and documentary rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id===region.id);
 assert.equal(item.author,editorial.author);assert.equal(item.checked,region.checked_on||data.checked_on);
 assert.deepEqual(item.practical.slice(0,region.sections.length).map(p=>p.paragraphs),region.sections.map(s=>s.paragraphs.map(p=>p.text)));
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 assert.deepEqual(item.practical.slice(region.sections.length),region.visitor_notes||[]);
 const a=data.assets.barehipani,image='data:image/jpeg;base64,'+readFileSync('public'+a.src).toString('base64');
 const plan={version:1,title:'Mayurbhanj reading',items:[{id:item.id,day:0,notes:'Keep my forest and reading questions.'}]};
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[a.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const s of region.sections)for(const p of s.paragraphs){assert.equal(book.split(`<p>${escapeHTML(p.text)}</p>`).length-1,1);assert.ok(text.includes(p.text));}
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));assert.ok(output.includes('https://projectodisha.org/destinations/mayurbhanj/'));assert.ok(output.includes('Keep my forest and reading questions.'));for(const s of editorial.sources){assert.ok(!output.includes(s.note));if(s.inspection)assert.ok(!output.includes(s.inspection));}}
 for(const s of editorial.sources){const url=new URL(s.url).href;assert.ok(book.includes(`href="${escapeHTML(url)}"`));assert.ok(text.includes(url));}
 for(const p of region.visitor_notes||[]){assert.ok(book.includes(escapeHTML(p.text)));assert.ok(text.includes(p.text));}
 for(const k of ['caption','creator','license_url'])assert.ok(book.includes(escapeHTML(a[k])));
});
