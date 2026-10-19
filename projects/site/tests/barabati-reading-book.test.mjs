import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyJourney,addItem} from '../src/lib/journey.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const html=readFileSync('dist/visit/places/barabati/index.html','utf8');
const data=JSON.parse(html.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/barabati-editorial.json','utf8'));
const record=JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8')).records.find(r=>r.kind==='places'&&r.slug==='barabati');
test('Barabati portable reading preserves its author, complete paragraphs, sources and photograph credit',()=>{
 const item=data.catalog.find(x=>x.id==='place:barabati');assert.ok(item);
 assert.equal(item.author,editorial.author);assert.equal(item.summary,record.lead);
 assert.equal(data.catalog.find(x=>x.href==='/visit/stays/balasore-coast/').author,undefined);
 const plan=addItem(emptyJourney(),item.id);
 const book=buildTourBook(plan,data.catalog,{illustrated:true,images:{[item.photo.src]:'data:image/png;base64,AAAA'}}),text=buildTextItinerary(plan,data.catalog);
 assert.ok(book.includes('By '+editorial.author));assert.ok(text.includes('By '+editorial.author));
 for(const section of record.sections)for(const p of [section.text,...(section.paragraphs||[])]){assert.ok(book.includes('<p>'+escapeHTML(p)+'</p>'));assert.ok(text.includes(p));}
 for(const source of editorial.sources){assert.ok(book.includes(escapeHTML(source.title)));assert.ok(text.includes(source.url));assert.ok(!book.includes(escapeHTML(source.note)));assert.ok(!text.includes(source.note));}
 assert.ok(book.includes(item.photo.creator));assert.ok(book.includes(item.photo.license_url));
 assert.ok(book.includes('https://projectodisha.org/visit/places/barabati/'));
 assert.doesNotMatch(book,/prepared with AI assistance|human editorial review pending/);
});
