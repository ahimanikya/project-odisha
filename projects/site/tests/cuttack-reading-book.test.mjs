import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyJourney,addItem} from '../src/lib/journey.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const html=readFileSync('dist/destinations/cuttack/index.html','utf8');
const data=JSON.parse(html.match(/id="journey-data"[^>]*>(.*?)<\/script>/s)[1]);
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/cuttack-editorial.json','utf8'));
const regions=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
const region=regions.regions.find(r=>r.slug==='cuttack');
test('Cuttack portable reading keeps its evidenced byline, narrative, concise sources and uncertainty',()=>{
 const item=data.catalog.find(x=>x.id===region.id);
 assert.equal(item.author,editorial.author);
 assert.equal(data.catalog.find(x=>x.id==='place:balasore')?.author,'Ahimanikya Satapathy');
 for(const slug of ['mayurbhanj'])assert.equal(data.catalog.find(x=>x.id==='place:'+slug)?.author,undefined);
 const plan=addItem(emptyJourney(),region.id);
 const book=buildTourBook(plan,data.catalog),text=buildTextItinerary(plan,data.catalog);
 assert.ok(book.includes('By '+editorial.author));assert.ok(text.includes('By '+editorial.author));
 for(const section of region.sections)for(const p of section.paragraphs){assert.ok(book.includes('<p>'+escapeHTML(p.text)+'</p>'));assert.ok(text.includes(p.text));}
 for(const source of editorial.sources){assert.ok(book.includes(escapeHTML(source.title)));assert.ok(text.includes(source.url));assert.ok(!book.includes(escapeHTML(source.note)));assert.ok(!text.includes(source.note));}
 assert.match(book,/Editorial preview/);
 assert.match(book,/step-free access have not been inspected/);
 assert.match(book,/https:\/\/projectodisha.org\/about\/editorial-process\//);
 assert.match(text,/https:\/\/projectodisha.org\/about\/editorial-process\//);
 assert.doesNotMatch(book,/prepared with AI assistance|human editorial review pending/);
});
