import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const guide=JSON.parse(readFileSync(new URL('../../../kb/research/culture/listening-notebook.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist-coast/sounds-of-odisha/listening-notebook/index.html',import.meta.url),'utf8');
const text=readFileSync(new URL('../dist-coast/assets/odisha-listening-notebook.txt',import.meta.url),'utf8');
const escaped=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('notebook preserves all guidance and every published story route without collecting notes',()=>{
 for(const s of guide.sections)for(const p of s.paragraphs)assert.ok(html.includes(escaped(p)),p);
 const discovery=JSON.parse(readFileSync(new URL('../../../kb/research/product/sounds-discovery.json',import.meta.url),'utf8'));
 const stories=discovery.entries.filter(e=>e.href.startsWith('/stories/')||e.href.startsWith('/sounds-of-odisha/')&&!['/sounds-of-odisha/','/sounds-of-odisha/listening-notebook/'].includes(e.href));
 assert.equal(new Set(guide.entries.map(e=>e.id)).size,guide.entries.length);
 assert.deepEqual(guide.entries.map(e=>e.route).sort(),stories.map(e=>e.href).sort());
 for(const entry of guide.entries)assert.ok(existsSync(new URL('../../../kb/'+entry.kb_article,import.meta.url)));
 for(const e of guide.entries){assert.ok(html.includes('href="'+e.route+'"'));assert.ok(text.includes('https://projectodisha.org'+e.route));assert.ok(text.includes(e.question));assert.ok(existsSync(new URL('../dist-coast'+e.route+'index.html',import.meta.url)));}
 for(const f of guide.fields){assert.ok(html.includes(escaped(f)));assert.ok(text.includes(f+':'));}
 assert.ok(html.includes('download'));assert.ok(!html.includes('<textarea'));assert.ok(!html.includes('<audio'));assert.ok(!html.includes('<form'));
 assert.ok(html.includes('This page does not collect your notes.'));
 assert.ok(readFileSync(new URL('../dist-coast/sounds-of-odisha/index.html',import.meta.url),'utf8').includes('href="/sounds-of-odisha/listening-notebook/"'));
});

test('four question groups are complete, addressable and synchronized with the download',async()=>{
 const paths=JSON.parse(readFileSync(new URL('../../../kb/research/product/sounds-reading-paths.json',import.meta.url),'utf8'));
 assert.deepEqual(paths.paths.flatMap(p=>p.stories).sort(),guide.entries.map(e=>e.id).sort());
 for(const path of paths.paths){
  assert.ok(html.includes('href="#questions-'+path.id+'"'));
  assert.ok(html.includes('id="questions-'+path.id+'" tabindex="-1"'));
  assert.ok(text.includes(path.title.toUpperCase()));
 }
 const {execFileSync}=await import('node:child_process');
 execFileSync(process.execPath,[fileURLToPath(new URL('../tools/build-listening-notebook.mjs',import.meta.url)),'--check']);
});
