// Additional discovery entries include the Mirgan and Kotpad book collection and Odia Bibhaba personal visit.
const reviewedArticleCount=JSON.parse(readFileSync('src/data/reviewed-culture.json','utf8')).length;
const pioneerCount=JSON.parse(readFileSync('../../kb/research/pioneers/series.json','utf8')).included_profiles.length;
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Mandasaru illustration is identified in the article, destination and Explore cards without losing photograph credits',()=>{
 const image=JSON.parse(readFileSync('../../kb/research/destinations/mandasaru-image.json','utf8'));
 const article=readFileSync('dist-coast/destinations/mandasaru/index.html','utf8');
 assert.match(article,/<figcaption[^>]*>[\s\S]*?Illustration: Project Odisha\.[\s\S]*?<\/figcaption>/);
 assert.ok(article.includes(image.alt));
 assert.ok(article.includes(`https://projectodisha.org${image.src}`));
 assert.ok(!article.includes('Photograph by Project Odisha'));
 for(const route of ['destinations','destinations/hills','explore']){
  const html=readFileSync(`dist-coast/${route}/index.html`,'utf8');
  const card=[...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(m=>m[0]).find(block=>block.includes('href="/destinations/mandasaru/"'));
  assert.ok(card,route);
  assert.match(card,/>Illustration<\/(?:p|figcaption)>/);
  assert.ok(card.includes(image.src));
  const credits=html.match(/<details\b[^>]*class="[^"]*(?:destination|explore)-credits[^"]*"[^>]*>([\s\S]*?)<\/details>/)?.[1];
  assert.ok(credits,route);
  assert.match(credits,route==='explore'?/Collection image credits/:/Images &amp; credits/);
  assert.ok(!/href="(?:undefined|null|)"/.test(credits));
  assert.ok(!/<a\b[^>]*>\s*<\/a>/.test(credits),`${route}: empty credit link`);
  for(const slug of ['deomali','daringbadi','putsil']){
   const photo=JSON.parse(readFileSync(`../../kb/research/destinations/${slug}-image.json`,'utf8'));
   assert.ok(credits.includes(photo.creator),`${route}: ${slug} creator`);
   assert.ok(credits.includes(photo.source),`${route}: ${slug} source`);
   assert.ok(credits.includes(photo.license_url),`${route}: ${slug} licence`);
  }
 }
});

test('published Explore connects topic counts and removable filters while keeping the no-script collection',()=>{
 const html=readFileSync('dist-coast/explore/index.html','utf8');
 const topics=[...html.matchAll(/<a\b[^>]*data-topic="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
 assert.ok(topics.length>1);
 for(const [,topic,content] of topics)assert.match(content,/<span data-topic-count[^>]*>\(\d+\)<\/span>/,topic);
 assert.ok(topics.find(t=>t[1]==='All')[2].includes(`(${157+reviewedArticleCount+2+JSON.parse(readFileSync('src/data/dongariya.json','utf8')).length+1+1+pioneerCount})`));
 for(const key of ['q','topic','region'])assert.match(html,new RegExp('<button[^>]*type="button"[^>]*data-remove-filter="'+key+'"[^>]*hidden'));
 assert.match(html,/<div id="active-filters"[^>]*aria-label="Remove individual filters"[^>]*hidden/);
 assert.match(html,/<noscript>[\s\S]*All entries are shown below/);
 assert.equal([...html.matchAll(/data-entry=/g)].length,157+reviewedArticleCount+2+JSON.parse(readFileSync('src/data/dongariya.json','utf8')).length+1+1+pioneerCount);
 assert.match(html,/id="result-count"[^>]*role="status"[^>]*aria-live="polite"/);
 assert.match(html,/id="clear-filters"/);
 // The controller is actually delivered by the build, not only tested as a module.
 const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).filter(s=>s.startsWith('/_astro/'));
 assert.ok(scripts.some(src=>{const js=readFileSync('dist-coast'+src,'utf8');return js.includes('data-remove-filter')&&js.includes('compositionend')&&js.includes('pushState');}));
});
