import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(path,'utf8');
const collection=JSON.parse(read('../../kb/research/voices/collection.json'));
const entry=collection.pages.find(p=>p.path==='literature');
const editorial=JSON.parse(read('../../kb/research/voices/literature-editorial.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paths=['/people/fakir-mohan-senapati/','/literature/six-acres-and-a-third/','/people/sarala-das/','/people/pratibha-ray/','/people/bhima-bhoi/','/people/gopinath-mohanty/','/people/gangadhar-meher/'];
const assets=[...new Set([entry.hero_asset,...entry.cards.map(c=>c.asset)].filter(Boolean))];
test('Literature source map covers three factual passages and retains seven doors and documentary image hashes',()=>{
 const passages=[...entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))),...entry.cards.map((c,i)=>({id:`card-${i}`,source_ids:c.source_ids})),{id:'roster',source_ids:entry.roster_sources}].filter(p=>p.source_ids.length);
 assert.deepEqual(editorial.passages,passages);assert.equal(editorial.passages.length,3);assert.equal(editorial.sources.length,3);
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,3);
 for(const p of passages)for(const id of p.source_ids)assert.ok(editorial.sources.some(s=>s.id===id));
 assert.deepEqual(entry.cards.map(c=>c.href),paths);
 assert.ok(entry.cards.every(c=>c.source_ids.length===0),'Reading invitations need no repeated citations; future factual cards must enter the passage map.');
 for(const id of assets){const a=collection.assets[id];assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);}
});
test('Literature begins with complete narrative before the seven reading doors and has exact visible note returns',()=>{
 const html=page('/literature/');
 assert.ok(html.includes('By Ahimanikya Satapathy'));
 const first=html.indexOf(`id="${entry.sections[0].id}"`),last=html.indexOf(`id="${entry.sections.at(-1).id}"`),cards=html.indexOf('id="reading-doors"');
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<first);assert.ok(first<last&&last<cards);
 assert.ok(html.indexOf(`href="#${entry.sections[0].id}"`)<html.indexOf('href="#reading-doors"'));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 for(const p of entry.sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(escape(p.text)),p.text);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,3);assert.equal(new Set(refs.map(r=>r[1])).size,3);
 for(const passage of editorial.passages)for(const id of passage.source_ids){const ref=`ref-${passage.id}-${id}`;assert.equal(html.split(`id="${ref}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);assert.equal(html.split(`id="note-${id}"`).length-1,1);}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 for(const s of editorial.sources){assert.ok(html.includes(escape(s.url)));assert.ok(html.includes(escape(s.note)));}
 assert.doesNotMatch(html,/Research and presentation prepared with AI assistance|awaiting Founder and language or literary review|Sources for this passage:/);
});
test('Literature preserves image context, rights once per source, seven links and unlinked future writers without a hub download',()=>{
 const html=page('/literature/');
 const doors=html.match(/<section id="reading-doors"[\s\S]*?<\/section>/)?.[0];assert.ok(doors);assert.equal((doors.match(/<article\b/g)||[]).length,7);
 for(const card of entry.cards){assert.ok(doors.includes(`href="${card.href}"`));assert.ok(doors.includes(escape(card.text)));if(card.image_note)assert.ok(doors.includes(escape(card.image_note)));}
 for(const name of entry.roster)assert.match(html,new RegExp(`<li[^>]*>${name}</li>`));
 const credits=html.match(/<div id="language-image-credits"[\s\S]*?<\/div>/)?.[0];assert.ok(credits);
 for(const id of assets){const a=collection.assets[id];assert.ok(html.includes(a.src));for(const key of ['creator','license_url','source','changes'])assert.ok(credits.includes(escape(a[key])),`${id}:${key}`);assert.equal(credits.split(`href="${escape(a.source)}"`).length-1,1);}
 assert.doesNotMatch(html,/data-save-journey="reading:literature"/);
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;assert.ok(!catalog.some(i=>i.href==='/literature/'));
 assert.match(html,/name="robots" content="noindex, nofollow"/);
});
test('Literature keeps collapsed onward reading and visible update privacy with other profiles untouched',()=>{
 const html=page('/literature/');
 const onward=html.match(/<section class="culture-onward-disclosure"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/literature/reading-journey/','/languages/odia/','/languages/','/destinations/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Fliterature%2F"[^>]*>Suggest an update/);assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 const other=page('/people/fakir-mohan-senapati/');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Editorial preview/);
 for(const route of ['/languages/','/languages/odia/']){const existing=page(route);assert.ok(existing.includes('By Ahimanikya Satapathy'));assert.ok(existing.includes('id="story-sources"'));}
});
