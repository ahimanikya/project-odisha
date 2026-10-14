import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const kb='../../kb/collections/bhubaneswar-fresco/';
const rows=JSON.parse(readFileSync(kb+'catalog.json','utf8'));
const manifest=JSON.parse(readFileSync(kb+'import.json','utf8'));
test('Fresco integration preserves every imported image and thumbnail byte',()=>{
 assert.equal(rows.length,166);assert.equal(manifest.assets.length,332);
 for(const asset of manifest.assets){const bytes=readFileSync('dist/stories/bhubaneswar-fresco/'+asset.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);}
});
test('Fresco catalogue keeps valid photo identities, credited art and story selection',()=>{
 assert.equal(new Set(rows.map(r=>r.slug)).size,166);
 assert.equal(rows.filter(r=>r.featured).length,8);
 assert.equal(rows.filter(r=>r.status==='included').length,161);
 assert.equal(rows.filter(r=>r.status==='alternate').length,5);
 for(const row of rows){assert.equal(row.photographer,'Ahimanikya Satapathy');assert.ok(['included','alternate'].includes(row.status));assert.ok(!/event/i.test(row.category));if(row.preferred)assert.ok(rows.some(x=>x.file===row.preferred));}
 const html=readFileSync('dist/stories/bhubaneswar-fresco/index.html','utf8');
 assert.ok(!html.includes('__CATALOG__'));assert.ok(!html.includes('__CONNECTIONS__'));
 assert.ok(!/contribution-dialog|reviewer-secret/.test(html));
 // Public museum references may contain /api/; only same-site application endpoints are forbidden.
 for(const match of html.matchAll(/(?:href|src|action)="([^"]+)"/g)){
  const url=new URL(match[1],'https://projectodisha.org');
  if(url.origin==='https://projectodisha.org')assert.ok(!url.pathname.startsWith('/api/'));
 }
 assert.match(html,/Mural artists.*not yet/i);
});
