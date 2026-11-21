// Additional discovery entries include the Mirgan and Kotpad book collection and Odia Bibhaba personal visit.
const reviewedArticleCount=JSON.parse(readFileSync('src/data/reviewed-culture.json','utf8')).length;
const pioneerCount=JSON.parse(readFileSync('../../kb/research/pioneers/series.json','utf8')).included_profiles.length;
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('published Explore connects topic counts and removable filters while keeping the no-script collection',()=>{
 const html=readFileSync('dist-coast/explore/index.html','utf8');
 const topics=[...html.matchAll(/<a\b[^>]*data-topic="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
 assert.ok(topics.length>1);
 for(const [,topic,content] of topics)assert.match(content,/<span data-topic-count[^>]*>\(\d+\)<\/span>/,topic);
 assert.ok(topics.find(t=>t[1]==='All')[2].includes(`(${154+reviewedArticleCount+2+JSON.parse(readFileSync('src/data/dongariya.json','utf8')).length+1+1+pioneerCount})`));
 for(const key of ['q','topic','region'])assert.match(html,new RegExp('<button[^>]*type="button"[^>]*data-remove-filter="'+key+'"[^>]*hidden'));
 assert.match(html,/<div id="active-filters"[^>]*aria-label="Remove individual filters"[^>]*hidden/);
 assert.match(html,/<noscript>[\s\S]*All entries are shown below/);
 assert.equal([...html.matchAll(/data-entry=/g)].length,154+reviewedArticleCount+2+JSON.parse(readFileSync('src/data/dongariya.json','utf8')).length+1+1+pioneerCount);
 assert.match(html,/id="result-count"[^>]*role="status"[^>]*aria-live="polite"/);
 assert.match(html,/id="clear-filters"/);
 // The controller is actually delivered by the build, not only tested as a module.
 const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).filter(s=>s.startsWith('/_astro/'));
 assert.ok(scripts.some(src=>{const js=readFileSync('dist-coast'+src,'utf8');return js.includes('data-remove-filter')&&js.includes('compositionend')&&js.includes('pushState');}));
});
