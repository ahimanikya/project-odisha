import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const stage=process.env.VIDEO_DELIVERY_STAGE||'dist';
assert.ok(['source','dist','dist-coast','dist-publish'].includes(stage));
const manifest=JSON.parse(readFileSync('../characters/video-delivery.json','utf8'));
const coast=JSON.parse(readFileSync('editions/coast.json','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const urls=new Set(manifest.assets.map(a=>a.release_url));

test('video release mapping retains all14 exact originals and excludes only MP4 payload declarations',()=>{
 assert.equal(manifest.schema,'project-odisha-video-delivery-v1');assert.equal(manifest.assets.length,14);
 assert.equal(new Set(manifest.assets.map(a=>a.asset_basename)).size,14);
 let total=0;
 for(const a of manifest.assets){
  assert.equal(a.source_path,'projects/site/public'+a.site_path);
  assert.equal(a.release_url,`https://github.com/ahimanikya/project-odisha/releases/download/${manifest.release_tag}/${a.asset_basename}`);
  const bytes=readFileSync('../../'+a.source_path);assert.equal(bytes.length,a.bytes);assert.equal(hash(bytes),a.sha256);total+=bytes.length;
  assert.ok(!coast.downloads.includes(a.site_path),a.site_path+' not in published payload');
 }
 assert.equal(total,108625580);assert.equal(total,manifest.total_bytes);
});

test('39 source pages change only99 MP4 attributes; original posters, captions, controls and all prose stay exact',()=>{
 assert.equal(manifest.pages.length,39);let total=0,source=0,links=0;
 for(const p of manifest.pages){
  let next=0;const html=readFileSync('../../'+p.source_path,'utf8');
  const restored=html.replace(/\b(src|href)="([^"]+)"/g,(whole,attribute,url)=>{
   if(!urls.has(url))return whole;
   const expected=p.replacements[next++];assert.ok(expected,p.source_path+' unexpected media URL');
   assert.equal(attribute,expected.attribute);assert.equal(url,expected.release_url);
   if(attribute==='src')source++;else links++;
   return `${attribute}="${expected.original_value}"`;
  });
  assert.equal(next,p.replaced_attributes);assert.equal(next,p.replacements.length);total+=next;
  assert.equal(hash(restored),p.original_sha256,p.source_path+' non-delivery content unchanged');
 }
 assert.equal(total,99);assert.equal(source,72);assert.equal(links,27);
});

test(`built players retain release URLs and local posters/captions (${stage})`,{skip:stage==='source'},()=>{
 for(const p of manifest.pages){
  const html=readFileSync(stage+p.site_path,'utf8');let count=0;
  for(const [,attribute,value] of html.matchAll(/\b(src|href|poster)="([^"]+)"/g)){
   if(urls.has(value)){count++;continue;}
   const u=new URL(value.replaceAll('&amp;','&'),'https://projectodisha.org'+p.site_path);
   if(u.origin==='https://projectodisha.org'&&u.pathname.endsWith('.mp4'))assert.fail(p.site_path+' stale local video '+value);
   if(attribute==='poster'||(attribute==='src'&&u.pathname.endsWith('.vtt'))){
    assert.equal(u.origin,'https://projectodisha.org');assert.ok(existsSync(stage+decodeURIComponent(u.pathname)),p.site_path+' missing '+value);
   }
  }
  assert.equal(count,p.replaced_attributes,p.site_path+' release references');
 }
 if(stage!=='dist'){
  const videos=[];function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(/\.mp4$/i.test(e.name))videos.push(p);}}walk(stage);
  assert.deepEqual(videos,[],'Coast/publication omits media binaries; originals remain in source');
 }
});
