import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
const root=process.env.DHAGA_TEST_ROOT||'dist';
const data=JSON.parse(readFileSync('../odia-dhaga/collection.json'));
const read=p=>readFileSync(root+'/dhaga/'+p,'utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
test('public Dhaga export preserves every accepted entry and its source links without internal research',()=>{
 assert.equal(readdirSync(root+'/dhaga/sayings').length,data.entries.length);
 for(const e of data.entries){const h=read('sayings/'+e.id.toLowerCase()+'.html');assert.equal((h.match(/class="browse"/g)||[]).length,1,e.id);assert.ok(h.includes('href="#browse-top-'+e.id+'"'));assert.equal((h.match(new RegExp('id="browse-top-'+e.id+'"','g'))||[]).length,1);if(e.id!=='POD-DHAGA-001')assert.equal((h.match(/rel="prev"/g)||[]).length,2);if(e.id!=='POD-DHAGA-159')assert.equal((h.match(/rel="next"/g)||[]).length,2);assert.ok(h.includes(esc(e.odia)),e.id);assert.ok(h.includes(esc(e.explanation)),e.id);assert.ok(h.includes('noindex'));assert.ok(h.includes('/dhaga/sources.html'));assert.doesNotMatch(h,/href="[^\"]*(?:README|source127|evidence\/)/);for(const w of e.witnesses){const s=data.sources.find(s=>s.id===w.source_id);assert.ok(h.includes(esc(s.url)),e.id+': witness');}}
 const nav=read('sayings/pod-dhaga-048.html');assert.equal((nav.match(/class="browse"/g)||[]).length,1);assert.match(nav,/href="#browse-top-POD-DHAGA-048">Browse Dhaga ↑/);assert.equal((nav.match(/rel="next"/g)||[]).length,2);
 const all=readdirSync(root+'/dhaga');assert.ok(!all.includes('collection.json'));assert.ok(!all.includes('evidence'));assert.ok(!all.includes('source127.html'));
});
test('book navigation uses lowercase public URLs, a pinned exact PDF and retained rights',()=>{
 assert.match(read('reader.html'),/id\.toLowerCase\(\)/);assert.match(read('index.html'),/raw\.githubusercontent\.com\/ahimanikya\/project-odisha\/[a-f0-9]{40}/);assert.match(read('sources.html'),/SCERT/);assert.match(read('sources.html'),/NotoSerifOriya-OFL.txt/);assert.match(read('index.html'),/lang="or"/);assert.match(read('index.html'),/Skip to Dhaga/);
});

test('colour cover and exact book metadata match the illustrated edition',()=>{
 const packing=JSON.parse(readFileSync('../odia-dhaga/packing-report.json'));
 const h=read('index.html');
 assert.match(h,/class="book-cover"[^>]*src="assets\/lemon-heritage-v1\.webp"/);
 assert.match(h,/fetchpriority="high"/);
 assert.ok(h.includes(`Download PDF book (${packing.pdf.pages} pages, ~${Math.round(packing.pdf.bytes/1024/1024)} MB)`));
 assert.match(h,/og:image" content="https:\/\/projectodisha.org\/dhaga\/assets\/lemon-heritage-v1\.webp/);
});
