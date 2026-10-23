import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
import {sharingImage} from '../src/lib/page-context.mjs';
const source=readFileSync('../../kb/research/culture/balakati-metalcraft.md','utf8'),image='/assets/balakati-metalcraft/process-overview.svg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/balakati-metalcraft.md',route:'/crafts/balakati-metalcraft/',images:{'../media/balakati/process-overview.svg':image},imageDimensions:{[image]:{width:720,height:1100}},links:{'mardala.md':'/sounds-of-odisha/mardala/','ghanta-ghanti.md':'/sounds-of-odisha/ghanta-ghanti/','sakhi-nata-and-sakhi-pila.md':'/stories/sakhi-nata-and-sakhi-pila/','sounds-of-odisha.md':'/sounds-of-odisha/'}});
test('Balakati preserves four notes and reciprocal citations before expanded reading',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,4);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 assert.match(h,/href="\/sounds-of-odisha\/ghanta-ghanti\/"/);assert.match(h,/\/contribute\/\?page=%2Fcrafts%2Fbalakati-metalcraft%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('original diagram, raster sharing derivative and reciprocal article navigation retain provenance',()=>{
 assert.deepEqual(readFileSync('public'+image),readFileSync('../../kb/research/media/balakati/process-overview.svg'));
 assert.match(article.html,/<figure><img[^>]*width="720" height="1100"/);assert.match(article.html,/<figcaption>[\s\S]*not a workshop instruction sheet/);
 for(const asset of JSON.parse(readFileSync('public/assets/balakati-metalcraft/provenance.json')).assets)assert.equal(createHash('sha256').update(readFileSync('public/assets/balakati-metalcraft/'+asset.file)).digest('hex'),asset.sha256);
 const png={src:image.replace('.svg','.png'),alt:'Original reading aid',width:720,height:1100};assert.deepEqual(sharingImage(png),png);
 const page=readFileSync('src/pages/crafts/balakati-metalcraft.astro','utf8');
 assert.match(page,/<ArticleReadingPath id="further-reading"/);
 assert.match(page,/<div set:html={afterReading}/);
 const further=article.html.match(/<h2 id="further-reading">Further reading<\/h2>\s*<ul>([\s\S]*?)<\/ul>/);assert.ok(further);
 assert.equal([...further[1].matchAll(/<a href=/g)].length,4);
 const [body,tail]=article.html.split(further[0]);assert.match(body,/class="article-footnotes"/);assert.match(tail,/Suggest an update/);
 assert.match(page,/image:destinationImages\[href\]/);
});
