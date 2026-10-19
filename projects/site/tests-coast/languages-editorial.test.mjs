import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(path,'utf8');
const collection=JSON.parse(read('../../kb/research/voices/collection.json'));
const entry=collection.pages.find(p=>p.path==='languages');
const editorial=JSON.parse(read('../../kb/research/voices/languages-editorial.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const slugs=['odia','santali','kui','kuvi','saora','ho','juang','koya','sambalpuri','desia'];
test('Languages source map covers every sourced paragraph, card, atlas passage and roster with retained image hashes',()=>{
 const passages=[...entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))),...entry.cards.map((c,i)=>({id:`card-${i}`,source_ids:c.source_ids})),...entry.atlas_paragraphs.map((p,i)=>({id:`atlas-${i}`,source_ids:p.source_ids})),{id:'roster',source_ids:entry.roster_sources}].filter(p=>p.source_ids.length);
 assert.deepEqual(editorial.passages,passages);assert.equal(editorial.sources.length,3);
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,3);
 for(const p of passages)for(const id of p.source_ids)assert.ok(editorial.sources.some(s=>s.id===id));
 assert.deepEqual(entry.cards.map(c=>c.href),slugs.map(s=>`/languages/${s}/`));
 assert.ok(entry.cards.every(c=>c.source_ids.length===0),'Directory cards are reading invitations; factual cards need an explicit source map.');
 for(const id of ['manuscript','script']){const asset=collection.assets[id];assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);}
});
test('Languages has visible numbered notes with exact returns and no production boilerplate',()=>{
 const html=page('/languages/').replaceAll('&#39;',"'");
 assert.ok(html.includes('By Ahimanikya Satapathy'));assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="reading-doors"'));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/Research and presentation prepared with AI assistance|awaiting Founder and language or literary review|Sources for this passage:/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];assert.equal(refs.length,4);assert.equal(new Set(refs.map(r=>r[1])).size,4);
 for(const [,ref,note]of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 for(const p of [...entry.sections.flatMap(s=>s.paragraphs),...entry.atlas_paragraphs])assert.ok(html.includes(escape(p.text)),p.text);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 for(const source of editorial.sources){assert.ok(html.includes(escape(source.url)));assert.ok(html.includes(escape(source.note)));}
});
test('Languages preserves ten profiles, two images, roster and population paths without creating a hub download',()=>{
 const html=page('/languages/');
 for(const slug of slugs)assert.ok(html.includes(`href="/languages/${slug}/"`),slug);
 assert.equal((html.match(/class="language-directory-card/g)||[]).length,10);
 for(const name of entry.roster)assert.match(html,new RegExp(`<li[^>]*>${name}</li>`));
 for(const slug of ['gondi','kisan','sadri'])assert.ok(!html.includes(`href="/languages/${slug}/"`));
 for(const path of ['/languages/atlas/','/languages/districts/','/languages/multilingual-odisha/'])assert.ok(html.includes(`href="${path}"`));
 for(const id of ['manuscript','script'])for(const value of ['src','creator','license_url','source'])assert.ok(html.includes(collection.assets[id][value]),`${id}:${value}`);
 assert.ok(html.includes('The image spells the script’s name, Ol Chiki.'));
 assert.doesNotMatch(html,/data-save-journey="reading:languages"/);
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 assert.ok(!catalog.some(i=>i.href==='/languages/'));
 assert.match(html,/name="robots" content="noindex, nofollow"/);
});
test('Languages preserves collapsed onward links and public contribution privacy, leaving profiles unchanged',()=>{
 const html=page('/languages/');
 const onward=html.match(/<section class="culture-onward-disclosure"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/literature/','/destinations/'])assert.ok(onward.includes(`href="${href}"`));
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Flanguages%2F"[^>]*>Suggest an update/);
 assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/submitted issues are public/);assert.match(html,/Recordings need permission and a transcript before publication/);
 const other=page('/languages/santali/').replaceAll('&amp;','&');assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);assert.match(other,/Sources, image credits & editorial notes/);assert.match(other,/Editorial preview/);
});
