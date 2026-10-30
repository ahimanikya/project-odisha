import test from 'node:test';
import assert from 'node:assert/strict';
import {cinema,cinemaArticle,cinemaReadingSemantics,markReviewedOdia,joinCinemaCitations,cinemaImageTrial,figureStyle} from '../src/lib/cinema-article.mjs';

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

 test('citation tails keep a plain final word with adjacent native references without crossing inline tags',()=>{
 const ref='<sup><a href="#user-content-fn-one" data-footnote-ref aria-label="Source 1">1</a></sup>';
 assert.equal(joinCinemaCitations('the Foundation.'+ref), 'the <span class="cinema-citation-tail">Foundation.'+ref+'</span>');
 assert.equal(joinCinemaCitations('Foundation.'+ref+ref), '<span class="cinema-citation-tail">Foundation.'+ref+ref+'</span>');
 for(const tag of ['em','a'])assert.equal(joinCinemaCitations(`<${tag}>Foundation</${tag}>`+ref), `<${tag}>Foundation</${tag}>`+ref);
 const html=cinemaArticle(cinema.articles.find(a=>a.slug==='literature-and-screen')).fullHTML;
 assert.match(html,/<span class="cinema-citation-tail">Foundation\.<sup>/);
 assert.doesNotMatch(html,/&#8288;/);
 });

test('image trial targets exact source and slug, retains complete-image links and bounded frames',()=>{
 assert.equal(cinemaImageTrial.length,7);assert.equal(new Set(cinemaImageTrial.map(f=>f.slug)).size,5);
 for(const entry of cinema.articles){
  const html=cinemaArticle(entry).fullHTML;
  for(const image of entry.images){
   const frame=cinemaImageTrial.find(f=>f.slug===entry.slug&&f.source===image.source);
   if(!frame){assert.equal(figureStyle(image,entry.slug),figureStyle(image,'outside-trial'));continue;}
   assert.ok(html.includes(figureStyle(image,entry.slug)),entry.slug+' configured frame');
   assert.ok(html.includes(`href="${image.file}" aria-label="View complete image"`));
   const figure=[...html.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].find(m=>m[0].includes(`src="${image.file}"`))?.[0];
   assert.ok(figure?.includes('<figcaption>'),'caption inside sized frame');
   if(frame.web.fit==='cover')assert.ok(html.includes('Display crop.'));
   else assert.ok(!figure.includes('--cinema-image-fit:cover'));
  }
 }
 const parbati=cinemaArticle(cinema.articles.find(e=>e.slug==='parbati-ghose')).fullHTML;
 assert.ok(parbati.includes('--cinema-figure-width:172px'));
 assert.ok(parbati.includes('--cinema-figure-width:420px'));
});
