import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const route='/visit/places/chandipur/';
const record=JSON.parse(read('../../kb/research/destinations/northern-details.json')).records.find(r=>r.slug==='chandipur');
const regions=JSON.parse(read('../../kb/research/destinations/regions.json'));
const editorial=JSON.parse(read('../../kb/research/destinations/chandipur-editorial.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paragraphs=()=>record.sections.flatMap(s=>[s.text,...(s.paragraphs||[])]);
test('Chandipur source map identifies factual passages and preserves both documentary originals',()=>{
 assert.equal(editorial.route,route);assert.equal(editorial.practical_in_article,true);assert.deepEqual(editorial.notebook_passages,[]);
 assert.deepEqual(editorial.sources.map(s=>s.id),record.sources);
 assert.equal(record.sections.length,6);assert.equal(paragraphs().length,9);assert.equal(editorial.sources.length,2);assert.deepEqual(editorial.passages.map(p=>p.id),['detail-0','detail-1','detail-2','detail-4']);
 const prose=paragraphs().join(' ');for(const detail of ['slopes gently','thin film of water','ripples','trails and burrows','October–March','Baleshwar'])assert.ok(prose.includes(detail),detail);
 const science=editorial.sources.find(s=>s.id==='chandipur-sedimentation2023'),derived=record.sections.filter(s=>s.sources.includes(science.id)).map(s=>s.text).concat(science.title,science.note).join(' ').split(/\s+/).length;assert.ok(derived<=200);
 assert.ok(!editorial.sources.some(s=>s.id==='chandipur'));
 assert.deepEqual(new Set(editorial.sources.map(s=>s.id)),new Set(editorial.passages.flatMap(p=>p.source_ids)));
 for(const p of editorial.passages){const section=record.sections[Number(p.id.split('-')[1])];assert.ok(section);assert.ok(p.source_ids.length);if(!p.id.includes('-p-'))assert.deepEqual(p.source_ids,section.sources);else assert.ok(section.paragraphs[Number(p.id.split('-p-')[1])]);for(const id of p.source_ids)assert.ok(editorial.sources.some(s=>s.id===id));}
 for(const id of [record.photo_ref,...record.gallery]){const a=regions.assets[id];assert.equal(a.kind,'photograph');assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);}
});
test('Chandipur has complete readable narrative and visible source notes with exact passage returns',()=>{
 const html=page(route);assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 for(const p of paragraphs())assert.ok(html.includes(escape(p)),p);
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const p of editorial.passages)for(const id of p.source_ids){assert.equal(html.split(`id="ref-${p.id}-${id}"`).length-1,1);assert.equal(html.split(`href="#ref-${p.id}-${id}"`).length-1,1);}
 for(const s of editorial.sources){assert.equal(html.split(`id="note-${s.id}"`).length-1,1);assert.ok(html.includes(escape(s.url)));assert.ok(html.includes(escape(s.note)));if(s.inspection)assert.ok(!html.includes(escape(s.inspection)));}
 assert.match(html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,''),/<section id="story-sources"/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft|id="current-arrangements"|id="visit-notebook"/);
});
test('Chandipur retains its image context, rights, saved identity and reading paths without promoting adjacent guides',()=>{
 const html=page(route);assert.ok(html.includes(escape(record.photo_context)));
 for(const id of [record.photo_ref,...record.gallery]){const a=regions.assets[id];assert.equal([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].filter(m=>m[1]===a.src).length,1,`${id} appears once`);for(const k of ['src','source','creator','license_url','changes'])assert.ok(html.includes(escape(a[k])),`${id}:${k}`);}
 const hero=html.match(/<figure id="story-image"[\s\S]*?<\/figure>/)?.[0];assert.ok(hero);const a=regions.assets[record.photo_ref];assert.ok(hero.includes(`width="${a.width}" height="${a.height}"`));
 const onward=html.match(/<section id="connect-visit"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/destinations/balasore/','/visit/stays/balasore-coast/','/food/balasore/','/destinations/mayurbhanj/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/href="\/contribute\/\?page=%2Fvisit%2Fplaces%2Fchandipur%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="place:chandipur"/);assert.match(html,/name="robots" content="noindex, nofollow"/);
 const other=page('/visit/experiences/jobra-maritime-museum/');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Drafted with AI assistance/);
 for(const path of ['/visit/places/barabati/','/visit/experiences/cuttack-netaji/','/visit/stays/cuttack/'])assert.match(page(path),/By Ahimanikya Satapathy/);
});
test('Chandipur portable reading retains every paragraph, concise sources and panorama rights',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog,item=catalog.find(i=>i.id==='place:chandipur');
 assert.equal(item.href,route);assert.equal(item.author,editorial.author);assert.equal(item.summary,record.lead);assert.equal(item.checked,record.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));assert.deepEqual(item.practical.map(p=>p.paragraphs),record.sections.map(s=>[s.text,...(s.paragraphs||[])]));
 const a=regions.assets['chandipur-panorama'];assert.equal(item.photo.src,a.src);
 const image='data:image/jpeg;base64,'+readFileSync('public'+a.src).toString('base64'),plan={version:1,title:'Chandipur reading',items:[{id:item.id,day:1,notes:'Ask about the return route.'}]};
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[a.src]:image}}),text=buildTextItinerary(plan,catalog);
 for(const p of paragraphs()){assert.equal(book.split(`<p>${escapeHTML(p)}</p>`).length-1,1);assert.ok(text.includes(p));}
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));assert.ok(output.includes('https://projectodisha.org'+route));assert.ok(output.includes('Ask about the return route.'));for(const s of editorial.sources){assert.ok(!output.includes(s.note));if(s.inspection)assert.ok(!output.includes(s.inspection));}}
 for(const s of editorial.sources){const url=new URL(s.url).href;assert.ok(book.includes(`href="${escapeHTML(url)}"`));assert.ok(text.includes(url));}
 for(const k of ['caption','creator','license_url'])assert.ok(book.includes(escapeHTML(a[k])));
});
