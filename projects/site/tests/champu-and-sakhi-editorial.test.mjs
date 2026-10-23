import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
const source=readFileSync('../../kb/research/culture/champu-and-sakhi.md','utf8'),image='/assets/champu-and-sakhi/radha-confidante-met.jpg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/champu-and-sakhi.md',route:'/literature/champu-and-sakhi/',images:{'../media/nayika/radha-confidante-met.jpg':image},imageDimensions:{[image]:{width:3923,height:2569}},links:{'ashta-nayika.md':'/stories/ashta-nayika/','odissi-abhinaya.md':'/stories/odissi-abhinaya/'}});
test('Champu preserves eleven visible source notes, exact passage returns and literary context',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,11);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 for(const route of ['/stories/ashta-nayika/','/stories/odissi-abhinaya/'])assert.ok(h.includes(`href="${route}"`));
 assert.match(h,/\/contribute\/\?page=%2Fliterature%2Fchampu-and-sakhi%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('museum painting retains full object, provenance and reciprocal reading links',()=>{
 const bytes=readFileSync('public'+image);assert.deepEqual(bytes,readFileSync('../../kb/research/media/nayika/radha-confidante-met.jpg'));
 const provenance=JSON.parse(readFileSync('public/assets/champu-and-sakhi/provenance.json')).assets[0];assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.sha256);
 assert.match(article.html,/<figure><img[^>]*width="3923" height="2569"/);assert.match(article.html,/<figcaption>[\s\S]*public domain/);assert.match(article.html,/not an illustration of Kishorachandrananda Champu/);
 for(const name of ['ashta-nayika','odissi-abhinaya'])assert.match(readFileSync('src/pages/stories/'+name+'.astro','utf8'),/'champu-and-sakhi.md':'\/literature\/champu-and-sakhi\/'/);
 const page=readFileSync('src/pages/literature/champu-and-sakhi.astro','utf8');assert.match(page,/shareImage=\{image\}/);assert.match(page,/href="\/literature\/"/);
});
