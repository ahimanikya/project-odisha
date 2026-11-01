import test from 'node:test';
import assert from 'node:assert/strict';
import {cinema,cinemaArticle} from '../src/lib/cinema-article.mjs';
const entry=cinema.articles.find(e=>e.slug==='commercial-successes');
assert.ok(entry,'Commercial-successes is registered for publication');
test('commercial comparison preserves five sourced comparisons, scoped headers and a named keyboard-scroll region',()=>{
 const html=cinemaArticle(entry).fullHTML;
 const table=html.match(/<div class="article-table cinema-comparison"[\s\S]*?<\/table><\/div>/)?.[0];assert.ok(table);
 assert.match(table,/role="region" aria-labelledby="commercial-comparison-caption" tabindex="0"/);
 assert.match(table,/<caption id="commercial-comparison-caption">Reported Odia film budgets and collections/);
 assert.equal((table.match(/<th scope="col">/g)||[]).length,5);
 assert.equal((table.match(/<th scope="row">/g)||[]).length,5);
 for(const film of ['Bou Buttu Bhuta','Jadi','DAMaN','Karma','Pabaar'])assert.ok(table.includes(film),film);
 for(const [,target]of table.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes(`id="${target}"`),target);
 assert.doesNotMatch(html,/Mantra Muugdha|commercial-mantra/); // Rejected research leads stay outside the reader-facing article.
});
test('comparison enhancement leaves other cinema articles unchanged',()=>{
 for(const e of cinema.articles.filter(e=>e.slug!=='commercial-successes'))assert.ok(!cinemaArticle(e).fullHTML.includes('commercial-comparison-caption'),e.slug);
});
