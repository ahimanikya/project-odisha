import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,mkdirSync,writeFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parseBackup} from '../src/lib/journey.mjs';
import {buildTourBook} from '../src/lib/tour-book.mjs';
const scope=JSON.parse(readFileSync('editions/coast.json','utf8'));
const read=route=>readFileSync('dist-coast'+(route.endsWith('/')?route+'index.html':route),'utf8');
const payload=html=>JSON.parse(html.match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const data=payload(read('/'));
const files=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);
test('only selected pages and their declared client content ship',()=>{
 const actual=files('dist-coast').filter(p=>p.endsWith('.html')&&!(scope.downloads||[]).includes('/'+p.slice('dist-coast/'.length))).map(p=>'/'+p.slice('dist-coast/'.length).replace(/index\.html$/,'')).sort();assert.deepEqual(actual,[...scope.routes].sort());
 for(const route of scope.routes){const html=read(route),d=payload(html);assert.deepEqual(d.catalog.map(i=>i.id).sort(),[...scope.journey_ids].sort());assert.deepEqual(d.starters.map(s=>s.id),scope.starter_ids);assert.ok(html.includes('noindex'));}
 assert.equal((read('/explore/').match(/data-entry=/g)||[]).length,126);
 assert.ok(read('/destinations/bhubaneswar/').includes('fresco-procession'));
 for(const f of files('dist-coast').filter(p=>/\.(html|js)$/.test(p)))for(const held of ['gopinath-mohanty.jpg','href="/store/'])assert.ok(!readFileSync(f,'utf8').includes(held),f+': '+held);
});
test('delivery report hashes every shipped file and excludes unused originals',()=>{
 const report=JSON.parse(readFileSync('.astro/coast-build-report.json','utf8'));assert.equal(report.html_pages,scope.routes.length);
 assert.equal(files('dist-coast').length,report.files.length);
 for(const f of report.files)assert.equal(createHash('sha256').update(readFileSync('dist-coast/'+f.path)).digest('hex'),f.sha256,f.path);
 for(const p of ['images/konark/sun-temple-darshanavenugopal.jpg','assets/coast-illustration-v1.png'])assert.ok(!report.files.some(f=>f.path===p));
 assert.ok(report.files.some(f=>f.path==='fonts/OFL-NotoSansOriya.txt'));
});
test('an earlier journey keeps unavailable IDs, dates and notes in backups and the portable book',()=>{
 const old={version:2,activeId:'old',trips:[{id:'old',plan:{version:1,title:'My earlier visit',startDate:'2026-12-12',items:[{id:'reading:languages/unpublished-example',day:2,notes:'Keep my boat question.'},{id:'place:konark',day:3,notes:'Look closely.'}]}}]};
 const parsed=parseBackup(JSON.stringify(old));assert.deepEqual(parsed,old);
 const book=buildTourBook(parsed.trips[0].plan,data.catalog);assert.ok(book.includes('Unavailable item: reading:languages/unpublished-example'));assert.ok(book.includes('Keep my boat question.'));assert.ok(book.includes('13 Dec 2026'));assert.ok(book.includes('Konark Sun Temple'));assert.ok(!book.includes('/languages/unpublished-example/'));
 assert.deepEqual(JSON.parse(JSON.stringify(parsed)),old);
});
test('failed staged validation preserves the last good output and does not expose excluded pages',()=>{
 const dir=mkdtempSync(join(tmpdir(),'utkal-edition-test-'));
 try{
  for(const p of ['tools','editions','.coast-staging','dist-coast'])mkdirSync(join(dir,p));
  copyFileSync('tools/finalize-edition.py',join(dir,'tools/finalize-edition.py'));
  writeFileSync(join(dir,'editions/coast.json'),JSON.stringify({routes:['/'],journey_ids:[],starter_ids:[]}));
  writeFileSync(join(dir,'dist-coast/index.html'),'Last good candidate');
  writeFileSync(join(dir,'.coast-staging/index.html'),'<meta name="robots" content="noindex"><a href="/held/">Held</a><script id="journey-data" type="application/json">{"catalog":[],"starters":[]}</script>');
  const failed=spawnSync('python3',[join(dir,'tools/finalize-edition.py')],{encoding:'utf8'});assert.notEqual(failed.status,0);assert.match(failed.stderr,/Link outside scope/);assert.equal(readFileSync(join(dir,'dist-coast/index.html'),'utf8'),'Last good candidate');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('heritage guide and downloads stay within their release boundary',()=>{
 const guide=read('/heritage-walks/');assert.equal((guide.match(/data-place=/g)||[]).length,60);
 assert.ok(read('/things-to-do/').includes('href="/heritage-walks/"'));
 assert.ok(!guide.includes('href="/stories/heritage-walks/"'));
 for(const ext of ['html','md','json','csv','zip'])assert.ok(readFileSync('dist-coast/downloads/heritage-walks/odisha-heritage-walks.'+ext).length>0);
 assert.ok(readFileSync('dist-coast/downloads/heritage-walks/odisha-heritage-walks.html','utf8').includes('noindex'));
 const d=JSON.parse(readFileSync('dist-coast/downloads/heritage-walks/odisha-heritage-walks.json'));assert.equal(d.walks.length,60);assert.equal(new Set(d.walks.map(w=>w.id)).size,60);
 assert.ok(guide.includes('Sold out on checked date'));assert.ok(guide.includes('excluding GST'));
});
