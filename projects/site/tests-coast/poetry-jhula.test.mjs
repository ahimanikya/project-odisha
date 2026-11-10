import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const destination='https://store.projectodisha.org/kabi-jhula-story/';
test('retired Jhula bookmark leads to the Store story without exposing the former survey',()=>{
 const html=readFileSync('dist-coast/odia-poetry-jhula/index.html','utf8');
 assert.match(html,/<html[^>]*lang="en"/);
 assert.match(html,/<meta[^>]*name="robots"[^>]*content="noindex,?\s?nofollow"/);
 assert.ok(html.includes('content="0;url='+destination+'"'));
 assert.ok(html.includes('href="'+destination+'"'));
 assert.match(html,/<main[\s>]/);
 assert.match(html,/name="utkal-design-system"/);
 assert.match(html,/id="journey-data"/);
 assert.match(html,/Read the Kabi Jhula story at Odisha Store/);
 assert.ok(html.includes('rel="canonical" href="https://projectodisha.org/odia-poetry-jhula/"'));
 assert.doesNotMatch(html,/<form|jhula-feedback|data-storage="firebase"|id="design-\d{2}"/);
});
test('main-site discovery and navigation no longer offer the retired Jhula survey',()=>{
 const home=readFileSync('dist-coast/index.html','utf8');
 const explore=readFileSync('dist-coast/explore/index.html','utf8');
 for(const html of [home,explore])assert.doesNotMatch(html,/href="\/odia-poetry-jhula\/"/);
});
