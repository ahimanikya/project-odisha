import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=p=>readFileSync(p,'utf8');
const page=read('dist/visit/places/mukteswar/index.html');
const e=JSON.parse(read('../../kb/research/destinations/mukteswar-editorial.json'));
const r=JSON.parse(read('../../kb/research/destinations/central-details.json')).records.find(x=>x.slug==='mukteswar');
test('Mukteswar distinguishes architectural forms and modern festival history, with exact visible source returns',()=>{
 assert.match(page,/By Ahimanikya Satapathy/);assert.match(page,/<section id="story-sources"/);
 assert.doesNotMatch(page,/Drafted with AI assistance|human editorial review pending/);
 for(const p of e.passages)for(const id of p.source_ids){for(const value of [`id="ref-${p.id}-${id}"`,`href="#ref-${p.id}-${id}"`,`id="note-${id}"`])assert.equal(page.split(value).length-1,1);}
 assert.equal((page.match(/data-footnote-ref/g)||[]).length,6);
 for(const phrase of ['jagamohana','rekha and pidha','1984','cannot establish an unbroken history','not a World Heritage inscription'])assert.ok(page.includes(phrase));
 assert.match(read('dist/visit/stays/similipal-gateways/index.html'),/Drafted with AI assistance/);
 assert.match(page,/data-save-journey="place:mukteswar"/);
});
test('Mukteswar portable reading keeps all explanation, concise sources and both documentary image rights',()=>{
 const catalog=JSON.parse(read('dist/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'Mukteswar',items:[{id:'place:mukteswar',day:1,notes:'Compare the two roof forms.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const s of r.sections)for(const p of [s.text,...s.paragraphs]){assert.ok(page.includes(escapeHTML(p)));assert.ok(book.includes(escapeHTML(p)));assert.ok(text.includes(p));}
 for(const s of e.sources)for(const output of [book,text]){assert.ok(output.includes(s.url));assert.ok(!output.includes(s.note));}
 assert.ok(text.includes('Compare the two roof forms.'));
 const assets=JSON.parse(read('../../kb/research/destinations/regions.json')).assets;
 for(const key of ['mukteswar-torana','mukteswar']){const a=assets[key];for(const value of [a.creator,a.license_url])assert.ok(page.includes(value));assert.equal(createHash('sha256').update(readFileSync('public'+a.src)).digest('hex'),a.sha256);}
});
