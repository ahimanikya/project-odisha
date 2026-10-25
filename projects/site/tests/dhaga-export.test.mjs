import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
const root=process.env.DHAGA_TEST_ROOT||'dist';
const data=JSON.parse(readFileSync('../odia-dhaga/collection.json'));
const read=p=>readFileSync(root+'/dhaga/'+p,'utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
test('public Dhaga export preserves every accepted entry and its source links without internal research',()=>{
 assert.equal(readdirSync(root+'/dhaga/sayings').length,data.entries.length);
 for(const e of data.entries){const h=read('sayings/'+e.id.toLowerCase()+'.html');assert.ok(h.includes(esc(e.odia)),e.id);assert.ok(h.includes(esc(e.explanation)),e.id);assert.ok(h.includes('noindex'));assert.ok(h.includes('/dhaga/sources.html'));assert.doesNotMatch(h,/href="[^\"]*(?:README|source127|evidence\/)/);for(const w of e.witnesses){const s=data.sources.find(s=>s.id===w.source_id);assert.ok(h.includes(esc(s.url)),e.id+': witness');}}
 const all=readdirSync(root+'/dhaga');assert.ok(!all.includes('collection.json'));assert.ok(!all.includes('evidence'));assert.ok(!all.includes('source127.html'));
});
test('book navigation uses lowercase public URLs, a pinned exact PDF and retained rights',()=>{
 assert.match(read('reader.html'),/id\.toLowerCase\(\)/);assert.match(read('index.html'),/raw\.githubusercontent\.com\/ahimanikya\/project-odisha\/9ef70063/);assert.match(read('sources.html'),/SCERT/);assert.match(read('sources.html'),/NotoSerifOriya-OFL.txt/);assert.match(read('index.html'),/lang="or"/);assert.match(read('index.html'),/Skip to Dhaga/);
});
