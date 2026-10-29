import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {shareJourneyData} from '../tools/shared-journey-data.mjs';
test('publication shares exact complete payload with deterministic parser-blocking delivery',()=>{
 const json=JSON.stringify({catalog:[{id:'reading:one',paragraphs:['ଓଡ଼ିଆ','</script><script>danger</script>','A & B']}],starters:[],trails:[{id:'x'}]}).replaceAll('<','\\u003c');
 const html=`<script type="application/json" id="journey-data">${json}</script><script type="module" src="/journey.js"></script>`;
 const input=[{path:'one.html',html},{path:'two.html',html}];const result=shareJourneyData(input);
 assert.equal(result.assets.size,1);assert.deepEqual(result,shareJourneyData(input));assert.equal(input[0].html,html);
 const [path,body]=[...result.assets][0];assert.match(path,/^assets\/journey-data-[a-f0-9]{64}\.js$/);
 assert.ok(result.pages[0].html.indexOf(path)<result.pages[0].html.indexOf('type="module"'));assert.ok(!result.pages[0].html.includes('async'));assert.ok(!result.pages[0].html.includes('defer'));
 const node={textContent:''};vm.runInNewContext(body,{document:{getElementById:id=>{assert.equal(id,'journey-data');return node;}}});assert.equal(node.textContent,json);assert.deepEqual(JSON.parse(node.textContent),JSON.parse(json));assert.ok(!body.includes('</script>'));
});
test('pages without journey data remain byte identical; invalid payload fails assembly',()=>{const page={path:'plain.html',html:'<main>Unchanged</main>'};assert.deepEqual(shareJourneyData([page]).pages,[page]);assert.equal(shareJourneyData([page]).assets.size,0);assert.throws(()=>shareJourneyData([{html:'<script id="journey-data">{}</script>'}]),/Invalid publication/);});
