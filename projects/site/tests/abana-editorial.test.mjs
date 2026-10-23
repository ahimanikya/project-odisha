import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
import {sharingImage} from '../src/lib/page-context.mjs';
const source=readFileSync('../../kb/research/culture/abana-rasataranga.md','utf8'),image='/assets/abana-rasataranga/abana-script.png';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/abana-rasataranga.md',route:'/literature/abana-rasataranga/',images:{'../media/poetic-craft/abana-script.svg':image},imageDimensions:{[image]:{width:760,height:1040}},links:{'bhanita-and-poet-signatures.md':'/literature/bhanita-and-poet-signatures/','champu-and-sakhi.md':'/literature/champu-and-sakhi/','odissi-abhinaya.md':'/stories/odissi-abhinaya/'}});
test('Abana preserves seven notes and reciprocal citations before expanded reading',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,7);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 assert.match(h,/href="\/literature\/bhanita-and-poet-signatures\/"/);assert.match(h,/\/contribute\/\?page=%2Fliterature%2Fabana-rasataranga%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('original diagram, raster sharing derivative and reciprocal article navigation retain provenance',()=>{
 assert.deepEqual(readFileSync('public/assets/abana-rasataranga/abana-script.svg'),readFileSync('../../kb/research/media/poetic-craft/abana-script.svg'));
 assert.match(article.html,/<figure><img[^>]*width="760" height="1040"/);assert.match(article.html,/<figcaption>Original reading aid/);
 for(const asset of JSON.parse(readFileSync('public/assets/abana-rasataranga/provenance.json')).assets)assert.equal(createHash('sha256').update(readFileSync('public/assets/abana-rasataranga/'+asset.file)).digest('hex'),asset.sha256);
 const png={src:image.replace('.svg','.png'),alt:'Original reading aid',width:760,height:1040};assert.deepEqual(sharingImage(png),png);
 const page=readFileSync('src/pages/literature/abana-rasataranga.astro','utf8');
 assert.match(page,/<ArticleReadingPath id="further-reading"/);
 assert.match(article.html,/role="region" aria-label="Scrollable data table" tabindex="0"/);
 assert.match(page,/image:destinationImages\[href\]/);
 assert.match(page,/<div set:html={afterReading}/);
 const further=article.html.match(/<h2 id="further-reading">Further reading<\/h2>\s*<ul>([\s\S]*?)<\/ul>/);assert.ok(further);
 assert.equal([...further[1].matchAll(/<a href=/g)].length,3);
 const [body,tail]=article.html.split(further[0]);assert.match(body,/class="article-footnotes"/);assert.match(tail,/Suggest an update/);
 for(const path of ['literature/alankara-and-bhanja','literature/bhanita-and-poet-signatures'])assert.match(readFileSync('src/pages/'+path+'.astro','utf8'),/'abana-rasataranga.md':'\/literature\/abana-rasataranga\/'/);
});
