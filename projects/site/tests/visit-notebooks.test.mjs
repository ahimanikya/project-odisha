import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,escapeHTML} from '../src/lib/tour-book.mjs';
const data=JSON.parse(readFileSync('../../kb/research/destinations/visit-notebooks.json','utf8'));
const scope=JSON.parse(readFileSync('editions/coast.json','utf8'));
const read=route=>readFileSync('dist'+route+'index.html','utf8');
const catalog=JSON.parse(read('/').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
let n=76;
for(const note of data.notebooks){
 const html=read(note.route),entry=catalog.find(e=>e.id===note.save_id),visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const checks={
  unique_route:()=>assert.equal(data.notebooks.filter(x=>x.route===note.route).length,1),
  allowed_route:()=>assert.ok(scope.routes.includes(note.route)),
  save_identity:()=>{assert.ok(entry);assert.ok(scope.journey_ids.includes(note.save_id));assert.equal(entry.href.split('#')[0],note.route);},
  notice_copy:()=>{assert.ok(note.notice.length>=50&&note.notice.length<=400);assert.equal(note.kind,'original_editorial_prompt');assert.ok(visible.includes(escapeHTML(note.notice)));},
  connect_copy:()=>{assert.ok(note.connect.length>=50&&note.connect.length<=400);assert.ok(visible.includes(escapeHTML(note.connect)));assert.ok(!/[“”]/.test(note.connect));},
  prepare_copy:()=>{assert.ok(note.prepare.length>=50&&note.prepare.length<=400);assert.ok(visible.includes(escapeHTML(note.prepare)));assert.ok(!/guaranteed|always safe|verified route/i.test(note.prepare));},
  pair_target:()=>{assert.ok(scope.routes.includes(note.pair.href));assert.ok(note.pair.text.length>=50);assert.ok(read(note.pair.href).includes('<main'));},
  remember_copy:()=>{assert.ok(note.remember.length>=40&&note.remember.length<=400);assert.ok(visible.includes(escapeHTML(note.remember)));},
  rendered_notebook:()=>{assert.equal((visible.match(/id="visit-notebook"/g)||[]).length,1);assert.ok(visible.includes('aria-labelledby="visit-notebook-heading"'));assert.ok(visible.includes(note.editorial_notes_in_article?'Footnotes &amp; Sources':'Visit notebook notes'));assert.ok(visible.includes('data-save-journey="'+note.save_id+'"'));},
  exported_notebook:()=>{const book=buildTourBook({version:1,title:'Notebook',items:[{id:note.save_id,day:1,notes:''}]},catalog);for(const field of ['notice','connect','prepare','remember'])assert.ok(book.includes(escapeHTML(note[field])),field);assert.ok(book.includes(escapeHTML(note.pair.text)));}
 };
 for(const [name,fn]of Object.entries(checks))test(`N210-${n++} ${note.route} ${name}`,fn);
}
assert.equal(n,76+data.notebooks.length*10);
