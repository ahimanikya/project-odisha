import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createStarterTrip} from '../src/lib/journey-starters.mjs';
import {emptyLibrary,addItem} from '../src/lib/journey.mjs';
import {buildTourBook,escapeHTML} from '../src/lib/tour-book.mjs';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8');
const data=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
test('Cuttack starter preserves the previous plan and exports useful visit details',()=>{
 const old=emptyLibrary();old.trips[0].plan=addItem(old.trips[0].plan,'place:chilika');old.trips[0].plan.items[0].notes='Keep my lake question';old.trips[0].plan.startDate='2026-12-12';
 const before=structuredClone(old),starter=data.starters.find(s=>s.id==='cuttack-silver-stories');
 const next=createStarterTrip(old,'cuttack-review',starter,data.catalog.map(i=>i.id));
 assert.deepEqual(old,before);assert.deepEqual(next.trips[0],before.trips[0]);assert.equal(next.trips[1].plan.items.length,6);
 const book=buildTourBook(next.trips[1].plan,data.catalog);
 for(const text of ['Near your planned Cuttack visits','Widen the Cuttack search','Keep a Bhubaneswar base','material and weight','opening day']){
  assert.ok(book.includes(text),text);
 }
 for(const id of starter.items){const item=data.catalog.find(i=>i.id===id);assert.ok(item);assert.ok(read(item.href.split('#')[0]).includes(`data-save-journey="${id}"`));}
});
test('reading starter and every literary idea retain reading prompts and source links offline',()=>{
 const starter=data.starters.find(s=>s.id==='odia-reading'),next=createStarterTrip(emptyLibrary(),'reading-review',starter,data.catalog.map(i=>i.id));
 const gangadhar=JSON.parse(readFileSync('../../kb/research/voices/collection.json','utf8')).pages.find(p=>p.path==='people/gangadhar-meher');
 const saved=next.trips[1].plan.items.find(i=>i.id==='reading:people/gangadhar-meher');assert.ok(saved);saved.notes='Compare my canto and edition.';
 const book=buildTourBook(next.trips[1].plan,data.catalog);
 for(const section of gangadhar.sections)for(const paragraph of section.paragraphs)assert.ok(book.includes(`<p>${escapeHTML(paragraph.text)}</p>`),section.id);
 assert.ok(book.includes('Keep the translation in view'));assert.ok(book.includes('Harekrishna Meher'));assert.ok(book.includes('Madhusudan Pati'));
 assert.ok(book.includes('Compare my canto and edition.'));assert.ok(book.includes('Gangadhar Meher'));assert.ok(book.includes('sahitya-akademi.gov.in'));
 const reading=data.catalog.filter(i=>i.kind==='Reading');assert.equal(reading.length,48);assert.ok(reading.some(i=>i.id==='reading:stories/maritime-memory'));
 for(const idea of reading){assert.ok(idea.practical.length>=2,idea.id);assert.ok(idea.sources.length);}
});
test('language hub preserves diversity without linking to unreleased profiles',()=>{
 const hub=read('/languages/');for(const name of ['Santali','Kui','Kuvi','Saora','Ho','Juang','Koya','Sambalpuri','Kosali','Desia'])assert.ok(hub.includes(name),name);
 assert.ok(hub.includes('href="/languages/odia/"'));assert.ok(hub.includes('href="/languages/juang/"'));
 assert.ok(existsSync('dist-coast/languages/juang/index.html'));
 assert.ok(!hub.includes('href="/languages/gondi/"'));
});
test('Cuttack photos retain exact credits and historical portraits stay out of delivery',()=>{
 const assets=JSON.parse(readFileSync('../../kb/records/cuttack-image-provenance.json')).assets;
 const city=read('/destinations/cuttack/');for(const a of Object.values(assets)){assert.ok(city.includes(a.license_url));assert.ok(city.includes(a.creator));assert.equal(createHash('sha256').update(readFileSync('dist-coast'+a.src)).digest('hex'),a.sha256);}
 const gopinath=read('/people/gopinath-mohanty/');assert.ok(gopinath.includes('contextual writing image'));assert.ok(!gopinath.includes('gopinath-mohanty.jpg'));
 assert.ok(!existsSync('dist-coast/assets/language-literature/gopinath-mohanty.jpg'));
 assert.ok(read('/food/cuttack/').includes('Dahibara-aludam, Cuttack'));
});
