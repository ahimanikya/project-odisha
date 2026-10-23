import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
import {sharingImage} from '../src/lib/page-context.mjs';
const source=readFileSync('../../kb/research/culture/odissi-tala-and-changing-cycles.md','utf8'),image='/assets/odissi-tala-and-changing-cycles/tala-counts.svg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/odissi-tala-and-changing-cycles.md',route:'/sounds-of-odisha/odissi-tala-and-changing-cycles/',images:{'../media/rhythm/tala-counts.svg':image},imageDimensions:{[image]:{width:920,height:980}},links:{'champu-and-sakhi.md':'/literature/champu-and-sakhi/','odissi-abhinaya.md':'/stories/odissi-abhinaya/'}});
test('Odissi tala preserves nine notes and reciprocal citations before expanded reading',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,9);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 assert.match(h,/href="\/literature\/champu-and-sakhi\/"/);assert.match(h,/\/contribute\/\?page=%2Fsounds-of-odisha%2Fodissi-tala-and-changing-cycles%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('original diagram, raster sharing derivative and reciprocal article navigation retain provenance',()=>{
 assert.deepEqual(readFileSync('public'+image),readFileSync('../../kb/research/media/rhythm/tala-counts.svg'));
 assert.match(article.html,/<figure><img[^>]*width="920" height="980"/);assert.match(article.html,/<figcaption>Original counting aid/);
 for(const asset of JSON.parse(readFileSync('public/assets/odissi-tala-and-changing-cycles/provenance.json')).assets)assert.equal(createHash('sha256').update(readFileSync('public/assets/odissi-tala-and-changing-cycles/'+asset.file)).digest('hex'),asset.sha256);
 const png={src:image.replace('.svg','.png'),alt:'Original reading aid',width:920,height:980};assert.deepEqual(sharingImage(png),png);
 const page=readFileSync('src/pages/sounds-of-odisha/odissi-tala-and-changing-cycles.astro','utf8');
 assert.match(page,/<ArticleReadingPath id="further-reading"/);
 assert.match(page,/<div set:html={afterReading}/);
 const further=article.html.match(/<h2 id="further-reading">Further reading<\/h2>\s*<ul>([\s\S]*?)<\/ul>/);assert.ok(further);
 assert.equal([...further[1].matchAll(/<a href=/g)].length,4);
 const [body,tail]=article.html.split(further[0]);assert.match(body,/class="article-footnotes"/);assert.match(tail,/Suggest an update/);
 for(const path of ['stories/jhulana-in-odisha','stories/sakhi-nata-and-sakhi-pila'])assert.match(readFileSync('src/pages/'+path+'.astro','utf8'),/'odissi-tala-and-changing-cycles.md':'\/sounds-of-odisha\/odissi-tala-and-changing-cycles\/'/);
});
