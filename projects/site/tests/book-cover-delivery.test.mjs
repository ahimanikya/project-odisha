import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const site=fileURLToPath(new URL('../',import.meta.url));
const covers=['/assets/cultural-book/front-cover.png','/assets/cultural-book/back-cover.png','/assets/book-covers/culture-spine.png','/assets/dongria-book/cover-960w.webp','/assets/book-covers/dongria-back.png','/images/mirgan-kotpad/front-cover.png','/images/mirgan-kotpad/back-cover.png','/assets/cinema/a-living-screen-cover-20261027.jpg','/assets/book-covers/cinema-back.png','/dhaga/assets/dhaga-cultural-cover-v2.webp'];
function finalize({downloads=covers,links=covers,missing=[]}={}){
 const dir=mkdtempSync(join(tmpdir(),'book-cover-delivery-'));
 try{
  for(const sub of ['tools','editions','.coast-staging'])mkdirSync(join(dir,sub),{recursive:true});
  copyFileSync(join(site,'tools/finalize-edition.py'),join(dir,'tools/finalize-edition.py'));
  writeFileSync(join(dir,'editions/coast.json'),JSON.stringify({routes:['/'],journey_ids:[],starter_ids:[],downloads}));
  writeFileSync(join(dir,'.coast-staging/index.html'),`<!doctype html><meta name="robots" content="noindex"><script id="journey-data" type="application/json">{"catalog":[],"starters":[]}</script>${links.map(a=>`<a href="${a}">View cover larger</a>`).join('')}`);
  for(const asset of links.filter(a=>!missing.includes(a))){const path=join(dir,'.coast-staging',asset);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,'fixture');}
  const result=spawnSync('python3',[join(dir,'tools/finalize-edition.py')],{encoding:'utf8'});
  assert.ifError(result.error);
  return {status:result.status,error:result.stderr,retained:covers.filter(a=>existsSync(join(dir,'dist-coast',a)))};
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test('all ten registered cover views pass delivery validation and remain in output',()=>{
 const config=JSON.parse(readFileSync(join(site,'editions/coast.json'),'utf8'));
 for(const cover of covers)assert.ok(config.downloads.includes(cover),cover);
 const result=finalize();assert.equal(result.status,0,result.error);assert.deepEqual(result.retained,covers);
});
test('an existing but unlisted cover cannot bypass the edition link boundary',()=>{
 const result=finalize({downloads:[],links:[covers[0]]});assert.notEqual(result.status,0);assert.match(result.error,/Link outside scope/);
});
test('registered covers must exist and arbitrary image registrations remain disallowed',()=>{
 let result=finalize({missing:[covers[0]]});assert.notEqual(result.status,0);assert.match(result.error,/Missing asset/);
 result=finalize({downloads:['/assets/book-covers/unapproved.png'],links:[]});assert.notEqual(result.status,0);assert.match(result.error,/Invalid edition configuration: downloads/);
});
