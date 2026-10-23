import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
import {sharingImage} from '../src/lib/page-context.mjs';
const source=readFileSync('../../kb/research/culture/sakhi-nata-and-sakhi-pila.md','utf8'),image='/assets/sakhi-nata-and-sakhi-pila/mardala.jpg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/sakhi-nata-and-sakhi-pila.md',route:'/stories/sakhi-nata-and-sakhi-pila/',images:{'../media/sakhi-nata/mardala.jpg':image},imageDimensions:{[image]:{width:2716,height:3024}},links:{'bhanita-and-poet-signatures.md':'/literature/bhanita-and-poet-signatures/','champu-and-sakhi.md':'/literature/champu-and-sakhi/','odissi-abhinaya.md':'/stories/odissi-abhinaya/'}});
test('Sakhi Nata preserves seven notes and reciprocal citations before expanded reading',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,7);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 assert.match(h,/href="\/literature\/champu-and-sakhi\/"/);assert.match(h,/\/contribute\/\?page=%2Fstories%2Fsakhi-nata-and-sakhi-pila%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('instrument photograph, sharing image and reciprocal article navigation retain provenance',()=>{
 assert.deepEqual(readFileSync('public'+image),readFileSync('../../kb/research/media/sakhi-nata/mardala.jpg'));
 assert.match(article.html,/<figure><img[^>]*width="2716" height="3024"/);assert.match(article.html,/<figcaption>Mardala used in Sakhi Nata/);
 const provenance=JSON.parse(readFileSync('public/assets/sakhi-nata-and-sakhi-pila/provenance.json'));assert.equal(createHash('sha256').update(readFileSync('public'+image)).digest('hex'),provenance.sha256);assert.equal(provenance.license,'CC BY-SA 4.0');
 const photo={src:image,alt:'Mardala instrument photograph',width:2716,height:3024};assert.deepEqual(sharingImage(photo),photo);
 const page=readFileSync('src/pages/stories/sakhi-nata-and-sakhi-pila.astro','utf8');
 assert.match(page,/<ArticleReadingPath id="further-reading"/);
 assert.match(page,/image:destinationImages\[href\]/);
 assert.match(article.html,/creativecommons.org\/licenses\/by-sa\/4.0/);
 assert.match(article.html,/not a particular troupe’s performance/);
 assert.match(page,/<div set:html={afterReading}/);
 const further=article.html.match(/<h2 id="further-reading">Further reading<\/h2>\s*<ul>([\s\S]*?)<\/ul>/);assert.ok(further);
 assert.equal([...further[1].matchAll(/<a href=/g)].length,5);
 const [body,tail]=article.html.split(further[0]);assert.match(body,/class="article-footnotes"/);assert.match(tail,/Suggest an update/);
 for(const path of ['stories/prahlada-nataka','stories/jhulana-in-odisha'])assert.match(readFileSync('src/pages/'+path+'.astro','utf8'),/'sakhi-nata-and-sakhi-pila.md':'\/stories\/sakhi-nata-and-sakhi-pila\/'/);
});
