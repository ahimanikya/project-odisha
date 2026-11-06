import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {cinema,cinemaArticle} from '../../projects/site/src/lib/cinema-article.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const html=fs.readFileSync(root+'tmp/pdfs/tagged-20261101/reading.html','utf8');
const build=JSON.parse(fs.readFileSync(root+'outputs/cinema-tagged-reading-20261101/build.json'));
test('proof retains every original source-note destination across all readings',()=>{
 for(const entry of cinema.articles){
  const ids=[...cinemaArticle(entry).fullHTML.matchAll(/id="(user-content-fn-[^"]+)"/g)].map(m=>m[1]);
  for(const id of ids)assert.ok(html.includes(`id="${entry.slug}--${id}"`),entry.slug+' '+id);
 }
});
test('proof preserves declared source semantics and only requested listening omission',()=>{
 assert.equal(build.check.chapters,50);assert.equal(build.check.parts,7);
 assert.deepEqual(build.check.brokenFragments,[]);assert.deepEqual(build.check.headingSkips,[]);
 assert.deepEqual(build.omissions.map(o=>[o.slug,o.heading]),[['akshaya-mohanty','Essential Khoka Bhai listening']]);
 assert.ok(!html.includes('Essential Khoka Bhai listening'));assert.ok(!html.includes('<iframe'));
 assert.ok(!html.includes('Suggest an update'));
 assert.equal((html.match(/<figure\b/g)||[]).length,build.check.images.length);
 assert.ok(build.check.odiaPassages.length>0);
 for(const table of build.check.tables){assert.ok(table.caption);assert.ok(table.headers.every(h=>['col','row','colgroup','rowgroup'].includes(h)));}
});

test('website related-reading endings are omitted without removing chapter prose links or contents',()=>{
 assert.ok(build.related_reading_omissions.length>0);
 assert.equal(new Set(build.related_reading_omissions.map(o=>o.slug)).size,build.related_reading_omissions.length);
 assert.ok(!/<h4[^>]*>Further reading<\/h4>/.test(html));
 for(const entry of cinema.articles)assert.ok(html.includes(`href="#ch-${entry.slug}"`),entry.slug+' contents destination');
 assert.ok(html.includes('class="contents"'));
 assert.ok(html.includes('href="#ch-cinema-economics"'));
});
