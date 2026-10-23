import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
import {sharingImage} from '../src/lib/page-context.mjs';
const source=readFileSync('../../kb/research/culture/odissi-abhinaya.md','utf8'),image='/assets/odissi-abhinaya/abhinaya-reading.svg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/odissi-abhinaya.md',route:'/stories/odissi-abhinaya/',images:{'../media/nayika/abhinaya-reading.svg':image},imageDimensions:{[image]:{width:900,height:1080}},links:{'ashta-nayika.md':'/stories/ashta-nayika/','mardala.md':'/sounds-of-odisha/mardala/'}});
test('abhinaya preserves six notes and reciprocal citations before expanded reading',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,6);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 assert.match(h,/href="\/stories\/ashta-nayika\/"/);assert.match(h,/href="\/sounds-of-odisha\/mardala\/"/);assert.match(h,/\/contribute\/\?page=%2Fstories%2Fodissi-abhinaya%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('original diagram, raster sharing derivative and reciprocal article navigation retain provenance',()=>{
 assert.deepEqual(readFileSync('public'+image),readFileSync('../../kb/research/media/nayika/abhinaya-reading.svg'));
 assert.match(article.html,/<figure><img[^>]*width="900" height="1080"/);assert.match(article.html,/<figcaption>Original explanatory diagram/);
 for(const asset of JSON.parse(readFileSync('public/assets/odissi-abhinaya/provenance.json')).assets)assert.equal(createHash('sha256').update(readFileSync('public/assets/odissi-abhinaya/'+asset.file)).digest('hex'),asset.sha256);
 const png={src:image.replace('.svg','.png'),alt:'Original explanatory diagram',width:900,height:1080};assert.deepEqual(sharingImage(png),png);
 assert.match(readFileSync('src/pages/stories/ashta-nayika.astro','utf8'),/'odissi-abhinaya.md':'\/stories\/odissi-abhinaya\/'/);
});
