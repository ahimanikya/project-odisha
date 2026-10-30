import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
const root=process.env.DHAGA_TEST_ROOT||'dist';
const data=JSON.parse(readFileSync('../odia-dhaga/collection.json'));
const read=p=>readFileSync(root+'/dhaga/'+p,'utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
test('public Dhaga export preserves every accepted entry and its source links without internal research',()=>{
 assert.equal(readdirSync(root+'/dhaga/sayings').length,data.entries.length);
 for(const e of data.entries){const h=read('sayings/'+e.id.toLowerCase()+'.html');assert.equal((h.match(/class="browse"/g)||[]).length,1,e.id);assert.ok(h.includes('href="#browse-top-'+e.id+'"'));assert.equal((h.match(new RegExp('id="browse-top-'+e.id+'"','g'))||[]).length,1);if(e.id!=='POD-DHAGA-001')assert.equal((h.match(/rel="prev"/g)||[]).length,2);if(e.id!==data.entries.at(-1).id)assert.equal((h.match(/rel="next"/g)||[]).length,2);assert.ok(h.includes(esc(e.odia)),e.id);assert.ok(h.includes(esc(e.explanation)),e.id);assert.ok(h.includes('noindex'));assert.ok(h.includes('/dhaga/sources.html'));assert.doesNotMatch(h,/href="[^\"]*(?:README|source127|evidence\/)/);for(const w of e.witnesses){const s=data.sources.find(s=>s.id===w.source_id);assert.ok(h.includes(esc(s.url)),e.id+': witness');}}
 const nav=read('sayings/pod-dhaga-048.html');assert.equal((nav.match(/class="browse"/g)||[]).length,1);assert.match(nav,/href="#browse-top-POD-DHAGA-048">Browse Dhaga ↑/);assert.equal((nav.match(/rel="next"/g)||[]).length,2);
 const all=readdirSync(root+'/dhaga');assert.ok(!all.includes('collection.json'));assert.ok(!all.includes('evidence'));assert.ok(!all.includes('source127.html'));
});
test('book navigation uses lowercase public URLs, a pinned exact PDF and retained rights',()=>{
 assert.match(read('reader.html'),/id\.toLowerCase\(\)/);assert.match(read('index.html'),/raw\.githubusercontent\.com\/ahimanikya\/project-odisha\/[a-f0-9]{40}/);assert.match(read('sources.html'),/SCERT/);assert.match(read('sources.html'),/NotoSerifOriya-OFL.txt/);assert.match(read('index.html'),/lang="or"/);assert.match(read('index.html'),/Skip to Dhaga/);
});

test('colour cover and exact book metadata match the illustrated edition',()=>{
 const packing=JSON.parse(readFileSync('../odia-dhaga/packing-report.json'));
 const h=read('index.html');
 const cover=data.cover.src.replace(/\.[^.]+$/,'.webp');
 assert.ok(h.includes('class="book-cover" src="'+cover+'"'));
 const coverTag=h.match(/<img class="book-cover"[^>]+>/)?.[0];assert.ok(coverTag);assert.doesNotMatch(coverTag,/loading="lazy"/);
 assert.match(h,/fetchpriority="high"/);
 assert.ok(h.includes(`Download PDF book (${packing.pdf.pages} pages, ~${Math.round(packing.pdf.bytes/1024/1024)} MB)`));
 assert.ok(h.includes('og:image" content="https://projectodisha.org/dhaga/'+cover));
 for(const section of data.book_intro?.sections||[])for(const paragraph of section.paragraphs){assert.ok(h.includes(esc(paragraph.odia)));assert.ok(h.includes(esc(paragraph.english)));for(const sid of paragraph.source_ids)assert.ok(h.includes('id="intro-source-'+sid+'"'));}
});


test('public source credits retain exact revisions and distinct quotation rights without research logs',async()=>{
 const {publicSourceCredit}=await import('../tools/export-dhaga.mjs');
 const wiki=data.sources.find(s=>s.url.includes('oldid='));const credit=publicSourceCredit(wiki);
 assert.ok(credit.includes(new URL(wiki.url).searchParams.get('oldid')));assert.ok(credit.includes('creativecommons.org/licenses/by-sa/4.0/'));assert.ok(credit.includes(esc(wiki.title)));assert.ok(!credit.includes(esc(wiki.access)));
 const scert=data.sources.find(s=>s.id.includes('scert'));assert.match(publicSourceCredit(scert),/2024, p.139/);assert.match(publicSourceCredit(scert),/not openly licensed/);
});
test('all public book pages use shared chrome with one main, preserved controls and no build endpoint',()=>{
 const paths=['index.html','reader.html','sources.html',...data.entries.map(e=>'sayings/'+e.id.toLowerCase()+'.html')];
 for(const path of paths){const h=read(path);assert.equal((h.match(/data-dhaga-header/g)||[]).length,1,path);assert.equal((h.match(/data-dhaga-footer/g)||[]).length,1,path);assert.equal((h.match(/<main\b/g)||[]).length,1,path);assert.match(h,/class="mobile-navigation"/);assert.match(h,/aria-label="About Project Odisha"/);assert.match(h,/aria-label="Website help"/);assert.match(h,/data-page-share/);assert.match(h,/site-chrome.css/);assert.doesNotMatch(h,/__DHAGA_PATH__|internal\/dhaga-chrome/);const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,path);}
 assert.throws(()=>readFileSync(root+'/internal/dhaga-chrome/index.html'));
});

test('new dictionary readings retain full bilingual explanations and context-only source qualifications',()=>{
 for(const e of data.entries.filter(e=>Number(e.id.slice(-3))>=202)){
  const h=read('sayings/'+e.id.toLowerCase()+'.html');
  for(const key of ['literal_meaning','explanation','meaning_odia','usage_example','cultural_context','narrative_credit'])assert.ok((key==='narrative_credit'?h.replace(/<[^>]*>/g,''):h).includes(esc(e[key])),e.id+': '+key);
 }
 const entry=data.entries.find(e=>e.id==='POD-DHAGA-202');
 const context=entry.witnesses.find(w=>w.source_id==='dhaga-rudrakshya-meal-context');
 assert.ok(context&&!context.wording,'Literary context must not become a proverb attestation');
 const h=read('sayings/pod-dhaga-202.html');assert.ok(h.includes(esc(context.note)));
 assert.ok(read('sources.html').includes(esc(data.sources.find(s=>s.id===context.source_id).url)));
});
