import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(`dist-coast${p==='/'?'/index.html':p.endsWith('/')?p+'index.html':p}`,'utf8');
const routes=JSON.parse(readFileSync('editions/coast.json','utf8')).routes;
const attributes=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
test('responsive image choices resolve in the shipped edition with alt, dimensions and sizes',()=>{
 let responsive=0;
 for(const route of routes)for(const tag of read(route).matchAll(/<img\b[^>]*>/g)){
  const a=attributes(tag[0]);if(!a.srcset)continue;responsive++;assert.ok(a.sizes);assert.match(tag[0],/\salt(?:=|\s|>)/);assert.ok(+a.width>0&&+a.height>0);
  for(const candidate of a.srcset.split(', ')){const [path,width]=candidate.split(' ');assert.match(width,/^\d+w$/);assert.ok(existsSync('dist-coast'+path),route+' '+path);}
  if(a.fetchpriority==='high')assert.notEqual(a.loading,'lazy');
 }
 for(const route of ['/', '/knowledge/chilika/', '/knowledge/konark/', '/destinations/bhubaneswar/', '/visit/places/dhauli/', '/people/pratibha-ray/'])assert.match(read(route),/srcset="[^"]+\/images\/responsive\//,route);
 assert.ok(responsive>0);
});
test('image variants preserve proportions and reduce the mobile delivery size',async()=>{
 const report=JSON.parse(readFileSync('.astro/responsive-image-report.json','utf8'));
 let original=0,mobile=0;
 for(const item of report.images){
  original+=item.original_bytes;mobile+=item.variants[0].bytes;
  const source=await sharp('public'+item.src).metadata();
  for(const v of item.variants){const bytes=readFileSync('public'+v.src),hash=createHash('sha256').update(bytes).digest('hex');assert.equal(v.sha256,hash);assert.equal(v.src,`/images/responsive/${hash.slice(0,16)}-${v.width}.webp`);const meta=await sharp(bytes).metadata();assert.equal(meta.width,v.width);assert.equal(meta.height,v.height);assert.ok(meta.width<=source.width);assert.ok(Math.abs(meta.height-meta.width*source.height/source.width)<=1);}
 }
 assert.ok(mobile<original*.5);
});
test('destination contents support the same mobile reading controls as cultural pages',()=>{
 for(const route of ['/knowledge/chilika/','/knowledge/konark/','/destinations/bhubaneswar/','/destinations/puri/']){
  const html=read(route);assert.match(html,/<details class="story-contents-mobile"/);assert.match(html,/<nav class="mag-navigation story-contents-desktop"/);
 }
});
test('every published visitor-detail page uses compact mobile contents with ordered live targets',()=>{
 const details=routes.filter(route=>route.startsWith('/visit/'));
 assert.ok(details.length>0);
 for(const route of details){
  const html=read(route);
  const mobile=html.match(/<details class="story-contents-mobile"[^>]*>([\s\S]*?)<\/details>/);
  assert.ok(mobile,route);
  assert.match(html,/<nav class="mag-navigation story-contents-desktop"/,route);
  const targets=[...mobile[1].matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
  assert.ok(targets.length>=2,route);
  let previous=-1;
  for(const target of targets){const position=html.indexOf('id="'+target+'"');assert.ok(position>previous,route+' '+target);previous=position;}
 }
});
test('practical notes stay in one planning section before onward links and credits',()=>{
 const notes=JSON.parse(readFileSync('../../kb/research/destinations/visit-readiness.json','utf8')).notes;
 const expected=notes.flatMap(n=>n.routes);
 for(const route of routes){
  const html=read(route),matches=[...html.matchAll(/id="current-arrangements"/g)];
  if(route==='/visit/places/mangalajodi/'){
   assert.equal(matches.length,0);
   const start=html.indexOf('id="detail-section-5"'),end=html.indexOf('id="connect-visit"');
   assert.ok(start>0&&end>start);
   const practical=html.slice(start,end);
   for(const phrase of ['Before setting out','lifejackets','boarding','return transport','toilets','have not been confirmed'])assert.ok(practical.includes(phrase),phrase);
   assert.match(html,/<section id="story-sources"/);
   continue;
  }
  if(route==='/visit/places/similipal/'){
   assert.equal(matches.length,0);
   const start=html.indexOf('id="detail-section-4"'),end=html.indexOf('id="connect-visit"');
   assert.ok(start>0&&end>start);
   const practical=html.slice(start,end);
   for(const phrase of ['latest opening notice','entry gate','vehicle step','rough roads','drinking water','carry waste out'])assert.ok(practical.includes(phrase),phrase);
   assert.match(html,/<section id="story-sources"/);
   assert.ok(practical.includes('ref-detail-4-p-0-similipal-guidelines'));
   continue;
  }
  assert.equal(matches.length,expected.includes(route)?1:0,route);
  if(!expected.includes(route))continue;
  const position=matches[0].index;
  assert.ok(html.lastIndexOf('<article class="mag-content"',position)>=0,route);
  const notebook=html.indexOf('id="visit-notebook"');
  if(notebook>=0){assert.ok(notebook<position,route);assert.ok(html.indexOf('</section>',notebook)>position,route);}
  for(const end of ['id="connect-visit"','id="collection-onward"','id="sources-credits"','id="sources"']){
   const next=html.indexOf(end);if(next>=0)assert.ok(position<next,route+' '+end);
  }
  assert.match(html,/Official references checked 2026-10-01/);
  assert.match(html,/individual arrangements have not been confirmed locally/);
 }
 assert.equal(expected.length,9);
});
test('normal publication still excludes search activation and held commercial content',()=>{
 assert.equal(existsSync('dist-coast/sitemap.xml'),false);
 for(const route of routes){assert.match(read(route),/<meta name="robots" content="noindex, nofollow"/);assert.doesNotMatch(read(route),/href="\/store\//);}
});

test('Explore offers responsive photographs while keeping the original SVG script sample',()=>{
 const html=read('/explore/');let raster=0,svg=0;
 for(const match of html.matchAll(/<img\b[^>]*>/g)){
  const a=attributes(match[0]);if(!a.class?.includes('explore-photo'))continue;
  assert.equal(a.loading,'lazy');assert.ok(a.alt);assert.ok(+a.width>0&&+a.height>0);
  if(a.src.endsWith('.svg')){svg++;assert.equal(a.srcset,undefined);assert.ok(existsSync('dist-coast'+a.src));}
  else{raster++;assert.ok(a.srcset,a.src);assert.match(a.sizes,/650px/);assert.ok(existsSync('dist-coast'+a.src),'original fallback retained');}
 }
 assert.ok(raster>0);assert.ok(svg>0);
});
test('next-story photographs use responsive choices and retain their end credit',()=>{
 const chapters=JSON.parse(readFileSync('../../kb/research/destinations/coastal-reading-collection.json','utf8')).chapters;
 for(const chapter of chapters.slice(0,-1)){
  const onward=read(chapter.href).split('id="collection-onward"')[1];assert.ok(onward);
  const tag=onward.match(/<img\b[^>]*>/)[0],a=attributes(tag);
  assert.ok(a.srcset,chapter.href);assert.equal(a.loading,'lazy');assert.match(onward,/Photograph credit/);
 }
});
test('the published edition retains only responsive files referenced by its pages',()=>{
 const used=new Set();
 for(const route of routes)for(const match of read(route).matchAll(/srcset="([^"]+)"/g)){
  for(const candidate of match[1].split(', ')){const src=candidate.split(' ')[0];if(src.startsWith('/images/responsive/'))used.add(src.split('/').at(-1));}
 }
 assert.deepEqual(readdirSync('dist-coast/images/responsive').sort(),[...used].sort());
});
