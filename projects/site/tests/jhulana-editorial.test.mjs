import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
import {sharingImage} from '../src/lib/page-context.mjs';
const source=readFileSync('../../kb/research/culture/jhulana-in-odisha.md','utf8'),image='/assets/jhulana-in-odisha/hindola-raga.jpg';
const article=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/jhulana-in-odisha.md',route:'/stories/jhulana-in-odisha/',images:{'../media/jhulana/hindola-raga.jpg':image},imageDimensions:{[image]:{width:2519,height:3400}},links:{'bhanita-and-poet-signatures.md':'/literature/bhanita-and-poet-signatures/','champu-and-sakhi.md':'/literature/champu-and-sakhi/','odissi-abhinaya.md':'/stories/odissi-abhinaya/'}});
test('Jhulana preserves six notes and reciprocal citations before expanded reading',()=>{
 const h=article.html,defs=[...source.matchAll(/^\[\^([^\]]+)\]:/gm)];assert.equal(defs.length,6);assert.equal(article.author,'Ahimanikya Satapathy');
 for(const [,id]of defs)assert.equal(h.split(`id="user-content-fn-${id.toLowerCase()}"`).length-1,1);
 for(const [tag]of h.matchAll(/<a\b[^>]*data-footnote-ref[^>]*>/g)){const dest=tag.match(/href="#([^"]+)"/)[1],origin=tag.match(/\bid="([^"]+)"/)[1];assert.ok(h.includes(`id="${dest}"`));assert.ok(h.includes(`href="#${origin}"`));}
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));assert.doesNotMatch(h,/<details/);
 assert.match(h,/href="\/literature\/champu-and-sakhi\/"/);assert.match(h,/href="\/literature\/bhanita-and-poet-signatures\/"/);assert.match(h,/\/contribute\/\?page=%2Fstories%2Fjhulana-in-odisha%2F/);
 for(const [,url]of source.matchAll(/\]\((https:\/\/www.instagram.com\/[^)]+)\)/g))assert.ok(h.includes(url));
});
test('museum painting, sharing image and reciprocal article navigation retain provenance',()=>{
 assert.deepEqual(readFileSync('public'+image),readFileSync('../../kb/research/media/jhulana/hindola-raga.jpg'));
 assert.match(article.html,/<figure><img[^>]*width="2519" height="3400"/);assert.match(article.html,/<figcaption>Hindola Raga/);
 const provenance=JSON.parse(readFileSync('public/assets/jhulana-in-odisha/provenance.json'));assert.equal(createHash('sha256').update(readFileSync('public'+image)).digest('hex'),provenance.sha256);assert.equal(provenance.license,'CC0');
 const photo={src:image,alt:'Hindola Raga comparative painting',width:2519,height:3400};assert.deepEqual(sharingImage(photo),photo);
 const page=readFileSync('src/pages/stories/jhulana-in-odisha.astro','utf8');
 assert.match(page,/<ArticleReadingPath id="further-reading"/);
 assert.match(page,/<div set:html={afterReading}/);
 const further=article.html.match(/<h2 id="further-reading">Further reading<\/h2>\s*<ul>([\s\S]*?)<\/ul>/);assert.ok(further);
 assert.equal([...further[1].matchAll(/<a href=/g)].length,3);
 const [body,tail]=article.html.split(further[0]);assert.match(body,/class="article-footnotes"/);assert.match(tail,/Suggest an update/);
 for(const path of ['literature/champu-and-sakhi','stories/odissi-abhinaya'])assert.match(readFileSync('src/pages/'+path+'.astro','utf8'),/'jhulana-in-odisha.md':'\/stories\/jhulana-in-odisha\/'/);
});
