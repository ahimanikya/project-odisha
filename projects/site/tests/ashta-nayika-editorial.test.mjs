import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
const source=readFileSync('../../kb/research/culture/ashta-nayika.md','utf8');
const image='/assets/ashta-nayika/abhisarika-met.jpg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/ashta-nayika.md',route:'/stories/ashta-nayika/',images:{'../media/nayika/abhisarika-met.jpg':image},imageDimensions:{[image]:{width:2907,height:4000}}});
test('Ashta Nayika preserves ten notes, exact passage returns and expanded reading',()=>{
 const h=article.html;
 assert.equal(article.author,'Ahimanikya Satapathy');
 const definitions=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(definitions.length,10);
 for(const [,id]of definitions)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 const refs=[...h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)];assert.ok(refs.length>=10);
 for(const [tag]of refs){const target=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${target}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));
 assert.doesNotMatch(h,/<details/);assert.match(h,/\/contribute\/\?page=%2Fstories%2Fashta-nayika%2F/);
 assert.equal((h.match(/role="region" aria-label="Scrollable data table" tabindex="0"/g)||[]).length,2);
 for(const name of ['Vasakasajja','Virahotkanthita','Svadhinabhartrika','Kalahantarita','Khandita','Vipralabdha','Proshitabhartrika','Abhisarika'])assert.ok(h.includes(name));
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('painting remains unchanged with provenance, caption, dimensions and share metadata',()=>{
 const bytes=readFileSync('public'+image),canonical=readFileSync('../../kb/research/media/nayika/abhisarika-met.jpg');assert.deepEqual(bytes,canonical);
 const provenance=JSON.parse(readFileSync('public/assets/ashta-nayika/provenance.json','utf8')).assets[0];assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.sha256);
 assert.match(article.html,/<figure><img[^>]*width="2907" height="4000"/);assert.match(article.html,/<figcaption>[\s\S]*public domain/);assert.match(article.html,/not an Odissi costume or choreographic prescription/);
 const page=readFileSync('src/pages/stories/ashta-nayika.astro','utf8');assert.match(page,/shareImage=\{image\}/);
 for(const route of ['/stories/odissi-music/','/stories/prahlada-nataka/','/sounds-of-odisha/'])assert.ok(page.includes(route));
});
