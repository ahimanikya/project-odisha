import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const guide=JSON.parse(readFileSync(new URL('../../../kb/research/culture/listening-notebook.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist-coast/sounds-of-odisha/listening-notebook/index.html',import.meta.url),'utf8');
const text=readFileSync(new URL('../dist-coast/assets/odisha-listening-notebook.txt',import.meta.url),'utf8');
const escaped=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('notebook preserves all guidance and eight usable reading routes without collecting notes',()=>{
 for(const s of guide.sections)for(const p of s.paragraphs)assert.ok(html.includes(escaped(p)),p);
 assert.equal(guide.entries.length,8);
 for(const e of guide.entries){assert.ok(html.includes('href="'+e.route+'"'));assert.ok(text.includes('https://projectodisha.org'+e.route));assert.ok(text.includes(e.question));assert.ok(existsSync(new URL('../dist-coast'+e.route+'index.html',import.meta.url)));}
 for(const f of guide.fields){assert.ok(html.includes(escaped(f)));assert.ok(text.includes(f+':'));}
 assert.ok(html.includes('download'));assert.ok(!html.includes('<textarea'));assert.ok(!html.includes('<audio'));assert.ok(!html.includes('<form'));
 assert.ok(html.includes('This page does not collect your notes.'));
 assert.ok(readFileSync(new URL('../dist-coast/sounds-of-odisha/index.html',import.meta.url),'utf8').includes('href="/sounds-of-odisha/listening-notebook/"'));
});
