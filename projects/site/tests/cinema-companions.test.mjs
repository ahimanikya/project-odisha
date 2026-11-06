import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {cinema,cinemaCompanions,cinemaArticle,cinemaOnward,markReviewedOdia,cinemaNarrative} from '../src/lib/cinema-article.mjs';
const root=path.resolve(process.cwd(),'../..');
const entry=cinema.articles.find(a=>a.slug==='bibhuti-pattanaik');
test('Bibhuti joins the main website and book after Kanhu while retaining the Maya connection',()=>{
 assert.ok(entry);assert.equal(cinema.articles.length,52);
 assert.equal(cinema.articles[cinema.articles.indexOf(entry)-1].slug,'kanhu-charan-mohanty');
 assert.deepEqual(entry.related_from,['maya-miriga']);
 const parts=JSON.parse(fs.readFileSync(path.join(root,'kb/research/culture/cinema-series/manifest.json'))).parts;
 assert.ok(parts.flatMap(p=>p.chapters).includes(entry.slug));assert.ok(cinemaNarrative.book_order.includes(entry.slug));
 assert.equal(cinemaOnward(entry).href,'/people/manglu-charan-biswal/');
});
test('Bibhuti rendering preserves numeric photo attribution, sources, native geometry and public reading links',()=>{
 const {article,fullHTML}=cinemaArticle(entry);
 assert.equal(article.title,entry.title);
 assert.match(fullHTML,/Subhashish Panigrahi/);
 assert.match(fullHTML,/https:\/\/creativecommons.org\/licenses\/by-sa\/4.0\//);
 assert.match(fullHTML,/id="user-content-fn-cinema-image-1"[^>]*value="8"/);
 assert.doesNotMatch(fullHTML,/>Photo credit<|<h2[^>]*>Image credits/);
 assert.doesNotMatch(fullHTML,/href="[^"]*(?:kb\/research|\.md(?:#|"))/);
 assert.match(fullHTML,/href="\/people\/basanta-kumari-patnaik\/"/);
 assert.match(fullHTML,/href="\/cinema\/maya-miriga\/"/);
 assert.match(fullHTML,/--cinema-figure-width:100%/);
 assert.match(markReviewedOdia('ବଧୂ ନିରୁପମା'),/lang="or"/);
});
test('Bibhuti image has a unique original and intact responsive source bindings',()=>{
 const hero=entry.images[0];
 const h=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 assert.equal(h(path.join(root,entry.source)),entry.source_sha256);
 assert.equal(h(path.join(root,hero.source)),hero.original_sha256);
 assert.ok(!cinema.articles.filter(a=>a.slug!==entry.slug).flatMap(a=>a.images).some(i=>i.original_sha256===hero.original_sha256));
 for(const image of hero.derivatives){assert.equal(h(path.join(process.cwd(),'public',image.file)),image.sha256);assert.ok(image.width<=4928);}
 assert.equal(entry.hero.credit.license,'CC BY-SA 4.0');
});


const solila=cinema.articles.find(a=>a.slug==='solila-parida');
test('Solila joins the main website and book after Nandita while retaining the literature connection',()=>{
 assert.ok(solila);assert.equal(solila.companion,false);
 assert.equal(cinema.articles.length,52);
 assert.equal(cinema.articles[cinema.articles.indexOf(solila)-1].slug,'nandita-das');
 const parts=JSON.parse(fs.readFileSync(path.join(root,'kb/research/culture/cinema-series/manifest.json'))).parts;
 assert.ok(parts.flatMap(p=>p.chapters).includes(solila.slug));assert.ok(cinemaNarrative.book_order.includes(solila.slug));
 assert.deepEqual(solila.related_from,['literature-and-screen']);
 assert.equal(solila.related_heading,'The producer behind the film');
 assert.equal(entry.related_heading||'The writer behind the story','The writer behind the story');
 assert.equal(cinemaOnward(solila).href,'/people/pramod-pati/');
 const component=fs.readFileSync(path.join(process.cwd(),'src/components/CinemaReading.astro'),'utf8');
 assert.match(component,/heading:relatedCompanions\[0\]\.related_heading\s*\|\|\s*'The writer behind the story'/);
});
test('Solila preserves native portrait geometry, truthful unverified credit and resolving numeric notes',()=>{
 const {fullHTML}=cinemaArticle(solila);
 assert.match(fullHTML,/--cinema-figure-width:100%/);
 assert.match(fullHTML,/--cinema-image-ratio:452 \/ 438/);
 assert.match(fullHTML,/id="user-content-fn-cinema-image-1"[^>]*value="10"/);
 assert.match(fullHTML,/Photograph via OdishaBytes; photographer uncredited/);
 assert.equal(solila.hero.credit.rights_status,'unverified');
 assert.equal(solila.hero.credit.license,undefined);assert.equal(solila.hero.credit.license_url,undefined);
 assert.doesNotMatch(fullHTML,/>Photo credit<|<h2[^>]*>Image credits/);
 assert.doesNotMatch(fullHTML,/href="[^"]*(?:kb\/research|\.md(?:#|"))/);
 const ids=[...fullHTML.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const [,target]of fullHTML.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(target),`Missing ${target}`);
 assert.match(fullHTML,/href="\/cinema\/literature-and-screen\/"/);
});
test('Solila canonical source and native-size responsive portrait remain hash-bound',()=>{
 const h=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 assert.equal(h(path.join(root,solila.source)),solila.source_sha256);
 const hero=solila.images.find(i=>i.role==='title');
 assert.equal(h(path.join(root,hero.source)),hero.original_sha256);
 assert.deepEqual([hero.width,hero.height],[452,438]);
 assert.ok(!cinema.articles.filter(a=>a.slug!==solila.slug).flatMap(a=>a.images).some(i=>i.original_sha256===hero.original_sha256));
 for(const image of hero.derivatives){
  assert.equal(h(path.join(process.cwd(),'public',image.file)),image.sha256);
  assert.ok(image.width<=452&&image.height<=438);
 }
});

const nayak=cinemaCompanions.find(a=>a.slug==='jatindra-k-nayak');
test('Nayak joins Basanta as a translator companion without changing the book sequence',()=>{
 assert.ok(nayak);assert.equal(cinema.articles.length,52);
 assert.ok(!cinema.articles.some(a=>a.slug===nayak.slug));
 const parts=JSON.parse(fs.readFileSync(path.join(root,'kb/research/culture/cinema-series/manifest.json'))).parts;
 assert.ok(!parts.flatMap(p=>p.chapters).includes(nayak.slug));
 assert.deepEqual(nayak.related_from,['basanta-kumari-patnaik']);
 assert.equal(nayak.related_heading,'The translator beside the story');
 assert.equal(cinemaOnward(nayak).href,'/people/basanta-kumari-patnaik/');
 const {fullHTML}=cinemaArticle(nayak);
 assert.match(fullHTML,/id="user-content-fn-cinema-image-1"[^>]*value="6"/);
 assert.match(fullHTML,/Subhashish Panigrahi/);
 assert.match(fullHTML,/href="\/assets\/cinema\/jatindra-k-nayak-portrait-1023w.jpg"/);
 assert.doesNotMatch(fullHTML,/href="[^"]*(?:kb\/research|\.md(?:#|"))/);
 const ids=[...fullHTML.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const [,target]of fullHTML.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(target),`Missing ${target}`);
 const coast=JSON.parse(fs.readFileSync(path.join(process.cwd(),'editions/coast.json')));
 assert.ok(coast.routes.includes(nayak.route));assert.ok(coast.downloads.includes(nayak.images[0].file));
});
test('Nayak portrait and text retain exact source bindings without upscaled assets',()=>{
 const h=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 assert.equal(h(path.join(root,nayak.source)),nayak.source_sha256);
 const hero=nayak.images[0];assert.equal(h(path.join(root,hero.source)),hero.original_sha256);
 assert.equal(nayak.hero.credit.license,'CC BY-SA 4.0');
 assert.equal(nayak.card_image_position,'50% 35%');
 for(const image of hero.derivatives){assert.equal(h(path.join(process.cwd(),'public',image.file)),image.sha256);assert.ok(image.width<=1023&&image.height<=1160);}
});
