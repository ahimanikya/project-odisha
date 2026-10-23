import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderReviewedCultureArticle} from '../src/lib/reviewed-culture-article.mjs';
const source=readFileSync('../../kb/research/culture/prahallad-nataka.md','utf8');
const rendered=renderReviewedCultureArticle(source,{sourcePath:'kb/research/culture/prahallad-nataka.md',route:'/stories/prahlada-nataka/',images:{'../media/prahallad/crafts-museum.jpg':'/assets/prahallad-nataka/crafts-museum.jpg'},links:{'pala.md':'/sounds-of-odisha/pala/','daskathia.md':'/sounds-of-odisha/daskathia/','mardala.md':'/sounds-of-odisha/mardala/'}});
test('reviewed source renders complete notes before expanded onward reading',()=>{
 const h=rendered.html;
 assert.equal(rendered.author,'Ahimanikya Satapathy');
 for(const [,id]of source.matchAll(/^\[\^([^\]]+)\]:/gm))assert.ok(h.includes(`id="user-content-fn-${id.toLowerCase()}"`),id);
 for(const [,href]of h.matchAll(/href="#([^"]+)"/g))assert.ok(h.includes(`id="${href}"`),href);
 assert.equal((h.match(/data-footnote-ref\b/g)||[]).length,15);
 assert.ok(h.indexOf('class="article-footnotes"')<h.indexOf('id="further-reading"'));
 assert.ok(!h.includes('<details'));
 assert.match(h,/<figure><img[^>]+crafts-museum.jpg/);
 assert.match(h,/<figcaption>.*Government of Odisha/s);
 assert.match(h,/creativecommons.org\/licenses\/by\/4.0/);
 assert.match(h,/\/contribute\/\?page=%2Fstories%2Fprahlada-nataka%2F/);
 for(const [,href]of h.matchAll(/href="([^"]+\.md)"/g))assert.ok(href.startsWith('https://github.com/ahimanikya/project-odisha/blob/main/'));
 assert.ok(existsSync('public/assets/prahallad-nataka/provenance.json'));
});
test('only selected route opts in and Sounds reading remains available',()=>{
 const page=readFileSync('src/pages/stories/prahlada-nataka.astro','utf8');
 assert.match(page,/<SoundReadingPaths current="prahlada-nataka" expanded/);
 assert.match(page,/\/stories\/danda-nata\//);assert.match(page,/\/sounds-of-odisha\/listening-notebook\//);
 assert.match(readFileSync('src/components/SoundReadingPaths.astro','utf8'),/expanded=false/);
});
