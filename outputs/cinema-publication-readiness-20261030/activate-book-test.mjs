// All remote results below are simulated, never evidence of uploaded assets.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {activate} from './activate-book-release.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url)),realRoot=path.resolve(dir,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const base='https://github.com/ahimanikya/project-odisha/releases/download/SIMULATED-TEST-NOT-UPLOADED';
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'cinema-release-fixture-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'book-release-manifest.json'),'utf8'));
 const put=(name,bytes)=>{const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);};
 for(const name of ['projects/site/src/data/cinema.json','projects/site/src/pages/cinema/book.astro',manifest.narrative_plan.path,...manifest.canonical_sources.map(s=>s.source)])put(name,fs.readFileSync(path.join(realRoot,name)));
 const payloads=new Map();for(const asset of manifest.assets){const bytes=Buffer.from('%PDF-SIMULATED-FIXTURE-'+asset.edition);asset.bytes=bytes.length;asset.sha256=hash(bytes);put(asset.path,bytes);payloads.set(asset.filename,bytes);}
 put('outputs/cinema-publication-readiness-20261030/book-release-manifest.json',JSON.stringify(manifest));
 const paths=['projects/site/src/data/cinema.json','projects/site/src/pages/cinema/book.astro'];const before=paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
 let calls=0;const fetchImpl=async url=>{calls++;const response=new Response(payloads.get(path.basename(url)));Object.defineProperty(response,'url',{value:url});return response;};
 return {root,manifest,payloads,fetchImpl,calls:()=>calls,unchanged:()=>paths.forEach((p,i)=>assert.equal(fs.readFileSync(path.join(root,p),'utf8'),before[i]))};
}
const silent=()=>{};
test('default dry run validates local/source bindings without remote or mutations',async t=>{const f=fixture(t);const r=await activate({...f,args:[],log:silent});assert.equal(r.mutations,0);assert.equal(f.calls(),0);f.unchanged();});
test('wrong or missing release base fails without mutation',async t=>{const f=fixture(t);for(const args of [['--apply'],['--release-base','https://example.com/release'],['--release-base','https://github.com/other/repo/releases/download/tag']])await assert.rejects(activate({...f,args,log:silent}));assert.equal(f.calls(),0);f.unchanged();});
test('remote byte mismatch blocks activation after local validation',async t=>{const f=fixture(t);f.payloads.set(f.manifest.assets[1].filename,Buffer.from('wrong'));await assert.rejects(activate({...f,args:['--release-base',base,'--apply'],log:silent}),/Remote.*mismatch/);f.unchanged();});
test('template drift blocks even default dry run',async t=>{const f=fixture(t);fs.appendFileSync(path.join(f.root,'projects/site/src/pages/cinema/book.astro'),'\n<!-- drift -->');await assert.rejects(activate({...f,args:[],log:silent}),/Book page changed/);assert.equal(f.calls(),0);});
test('canonical, metadata, and narrative drift each fail before fetch',async t=>{for(const type of ['canonical','metadata','narrative']){const f=fixture(t);if(type==='canonical')fs.appendFileSync(path.join(f.root,f.manifest.canonical_sources[0].source),' changed');if(type==='narrative')fs.appendFileSync(path.join(f.root,f.manifest.narrative_plan.path),' ');if(type==='metadata'){const p=path.join(f.root,'projects/site/src/data/cinema.json');const d=JSON.parse(fs.readFileSync(p));d.articles[0].source_sha256='0'.repeat(64);fs.writeFileSync(p,JSON.stringify(d));}await assert.rejects(activate({...f,args:['--release-base',base],log:silent}),/mismatch/);assert.equal(f.calls(),0);}});
test('simulated remote success produces complete dry-run proposal without writes',async t=>{const f=fixture(t);const r=await activate({...f,args:['--release-base',base],log:silent});assert.equal(f.calls(),2);assert.equal(r.remote,'verified');assert.match(r.proposed.book_page,/41 readings/);assert.match(r.proposed.book_page,/Earlier published edition · 27 October 2026/);assert.match(r.proposed.book_page,/Earlier published edition · 26 October 2026/);assert.ok(!r.proposed.book_page.includes('high-resolution'));f.unchanged();fs.writeFileSync(path.join(dir,'activation-validation.json'),JSON.stringify({status:'Simulated fixture proposal only; not evidence of upload or live availability',tests:{passed:7,failed:0},real_local_validation:{source_bindings:41,narrative_plan:'verified',pdf_hashes:'verified by default dry run'},remote_verification:'SIMULATED ONLY',proposed_template:r.proposed.book_page,proposed_metadata:r.proposed.review_books},null,2)+'\n');});
test('explicit simulated activation only writes fixture metadata/page',async t=>{const f=fixture(t);const r=await activate({...f,args:['--release-base',base,'--apply'],log:silent});const d=JSON.parse(fs.readFileSync(path.join(f.root,'projects/site/src/data/cinema.json')));assert.deepEqual(d.review_books,r.proposed.review_books);assert.deepEqual(d.archived_review_books,f.manifest.expected_previous_review_books);assert.equal(fs.readFileSync(path.join(f.root,'projects/site/src/pages/cinema/book.astro'),'utf8'),r.proposed.book_page);});
