import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=r=>readFileSync('dist'+r+'index.html','utf8');
const regions=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
const details=JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8')).records;
const catalog=JSON.parse(read('/').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
const route='/visit/experiences/kala-bhoomi/';
test('museum photographs keep dimensions, dated context and licensed attribution',async()=>{
 for(const key of ['kala-bhoomi-grounds','kala-bhoomi-chariot-panel']){
  const a=regions.assets[key],b=readFileSync('public'+a.src),m=await sharp(b).metadata();
  assert.equal(m.width,a.width);assert.equal(m.height,a.height);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);
  for(const s of [a.creator,a.source,a.license_url,a.caption])assert.ok(read(route).includes(escapeHTML(s)),s);
 }
});
test('three visitor stories preserve their identities and source context in portable journeys',()=>{
 const ids=['experience:kala-bhoomi','place:dhauli','reading:crafts/pipili-applique'];
 const plan={version:1,title:'Look closely',items:ids.map((id,i)=>({id,day:i+1,notes:'Ask one question.'}))};
 for(const id of ids)assert.ok(catalog.some(x=>x.id===id));
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 for(const slug of ['kala-bhoomi','dhauli']){const r=details.find(x=>x.slug===slug);for(const s of r.sections)for(const p of [s.text,...(s.paragraphs||[])]){assert.ok(book.includes(escapeHTML(p)),p);assert.ok(text.includes(p));}}
 assert.ok(book.includes('accesstoinsight.org/lib/authors/dhammika/wheel386.html'));
 const dhauli=catalog.find(x=>x.id==='place:dhauli');
 assert.ok(dhauli.sources.some(s=>s.url==='https://odishatourism.gov.in/en/places/dhauli-shanti-stupa-dhauli-hills'));
 assert.ok(dhauli.sources.every(s=>!s.url.includes('/content/tourism/')));
 assert.ok(dhauli.sources.every(s=>Object.keys(s).sort().join(',')==='title,url'));
 assert.ok(dhauli.summary.includes('what that promise can prove'));
 assert.ok(book.includes('not a promise that every stitch is hand-sewn'));
 for(const r of ['/destinations/bhubaneswar/','/things-to-do/'])assert.ok(read(r).includes('href="'+route+'"'));
 assert.ok(read('/crafts/pipili-applique/').includes('href="'+route+'"'));
 assert.ok(read('/visit/places/dhauli/').includes('Major Rock Edict XIII'));
 assert.ok(read(route).includes('2019 catalogue'));
});
