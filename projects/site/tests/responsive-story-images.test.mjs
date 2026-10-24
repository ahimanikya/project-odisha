import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import sharp from 'sharp';
const read=p=>readFileSync(p,'utf8');
const variants=JSON.parse(read('.astro/responsive-image-report.json')).images;
const stories=['odia-cultural-identity','rise-children-of-utkal','a-place-to-learn-together'];
const imageTag=(html,src)=>[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes(`src="${src}"`));
const art=['odia-identity-passing-on-culture.webp','rise-practical-beginning-v2.png','learn-neighbourhood-room-v2.png','dalkhai-stage-illustration-v2.png','nuakhai-shared-meal-v2.png'];
test('Recent artwork has smaller real WebP candidates with unchanged proportions',async()=>{
 for(const name of art){
  const src='/images/stories/'+name,entry=variants.find(i=>i.src===src);assert.ok(entry,src);
  assert.ok(entry.variants.some(v=>v.width===480));
  for(const v of entry.variants){
   const meta=await sharp('public'+v.src).metadata();
   assert.equal(meta.width,v.width);assert.equal(meta.height,v.height);assert.equal(meta.format,'webp');
   assert.ok(Math.abs(v.width/v.height-1.5)<.005,'Full artwork aspect ratio is preserved');
   assert.equal(statSync('public'+v.src).size,v.bytes);
  }
  assert.ok(entry.variants.find(v=>v.width===480).bytes<entry.original_bytes*.5,'Thumbnail saves at least half of original bytes');
 }
});
test('Essay heroes expose candidates, accurate reading-column sizes and eager priority',()=>{
 for(let i=0;i<stories.length;i++){
  const html=read(`dist/stories/${stories[i]}/index.html`),tag=imageTag(html,'/images/stories/'+art[i]);
  assert.ok(tag);assert.match(tag,/srcset="[^"]+480w[^\"]+960w/);assert.match(tag,/sizes="[^\"]+695.2px"/);
  assert.match(tag,/loading="eager"/);assert.match(tag,/fetchpriority="high"/);assert.match(tag,/width="1536" height="1024"/);
 }
 const dalkhai=imageTag(read('dist/sounds-of-odisha/dalkhai/index.html'),'/images/stories/dalkhai-stage-illustration-v2.png');
 assert.match(dalkhai,/srcset="/);assert.match(dalkhai,/sizes="[^\"]+900px"/);
});
test('Reading thumbnails stay decorative, lazy, and declare their small displayed size',()=>{
 const html=read('dist/stories/odia-cultural-identity/index.html');
 const cards=[...html.matchAll(/<a\b[^>]*class="reading-path-link[^\"]*"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>m[1]);
 const images=cards.flatMap(card=>[...card.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]));
 assert.ok(images.length>=4);
 for(const tag of images){
  assert.match(tag,/\balt(?:="")?(?=\s|>)/);assert.match(tag,/loading="lazy"/);assert.doesNotMatch(tag,/fetchpriority="high"/);
  assert.match(tag,/srcset="/);assert.match(tag,/sizes="\(max-width: 358px\) calc\(100vw - 2.4rem\), \(max-width: 600px\) 320px, 180px"/);
 }
 const styles=[...html.matchAll(/href="([^\"]+\.css)"/g)].map(m=>read('dist'+m[1])).join('\n')+[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
 assert.match(styles,/\.article-reading-path[^{}]* img\{[^}]*width:180px/,'Compiled component-boundary selector reaches the child img');
 assert.match(styles,/\.article-reading-path[^{}]* img\{[^}]*max-width:320px/);
});
