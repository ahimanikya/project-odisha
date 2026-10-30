import test from 'node:test';
import assert from 'node:assert/strict';
import {cinema,cinemaArticle,cinemaReadingSemantics,markReviewedOdia} from '../src/lib/cinema-article.mjs';

test('cinema subsection anchors preserve existing destinations and avoid collisions',()=>{
 const html=cinemaReadingSemantics('<h2 id="voices">Voices</h2><h3>Voices</h3><h3>Voices</h3><h3 id="retained">Old link</h3>');
 assert.match(html,/<h2 id="voices">/);assert.match(html,/<h3 id="voices-2" tabindex="-1">/);assert.match(html,/<h3 id="voices-3"/);assert.match(html,/<h3 id="retained">/);
 assert.equal(cinemaReadingSemantics(html),html);
});
test('all cinema tables have captions and native scoped headers; subsection contents resolve',()=>{
 let tables=0,subsections=0;
 for(const entry of cinema.articles){
  const {article,fullHTML}=cinemaArticle(entry);
  assert.ok(!article.headings.some(h=>h.href==='#footnote-label'), 'Shared reading component adds the single notes link');
  const ids=[...fullHTML.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,entry.slug+' duplicate IDs');
  for(const h of article.headings){assert.ok(ids.includes(h.href.slice(1)),entry.slug+' '+h.href);if(h.level===3)subsections++;}
  for(const [,table] of fullHTML.matchAll(/<table>([\s\S]*?)<\/table>/g)){
   tables++;assert.match(table,/<caption id="[^"]+">[^<]+<\/caption>/);assert.doesNotMatch(table,/<th>/);assert.match(table,/<th scope="col">/);assert.match(table,/<th scope="row">/);
  }
  for(const [,label] of fullHTML.matchAll(/<a[^>]*data-footnote-ref[^>]*>([\s\S]*?)<\/a>/g))assert.match(label,/^\d+$/);
 }
 assert.ok(tables>=4);assert.ok(subsections>0);
});
test('language tagging uses verified phrases, respects existing language, and leaves Sambalpuri unclassified',()=>{
 assert.equal(markReviewedOdia('ମମତା / ଭୂଖା'),'<span lang="or">ମମତା</span> / ଭୂଖା');
 assert.equal(markReviewedOdia('<span lang="or">ମମତା</span>'),'<span lang="or">ମମତା</span>');
 assert.equal(markReviewedOdia('<code>ମମତା</code>'),'<code>ମମତା</code>');
});
