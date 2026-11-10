import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('../../kb/research/destinations/jobra-editorial.json','utf8'));
const record=JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8')).records.find(r=>r.slug==='jobra-maritime-museum');
const html=readFileSync('dist-coast/visit/experiences/jobra-maritime-museum/index.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
test('Jobra keeps six original sections and adds one scoped native archival reading',()=>{
 assert.equal(record.sections.length,6);
 for(let i=0;i<6;i++){assert.ok(html.includes('id="detail-section-'+(i+1)+'"'));assert.ok(html.includes(escape(record.sections[i].text)));}
 assert.ok(html.indexOf('id="jobra-archival-reading"')>html.indexOf('id="detail-section-6"'));
 for(const p of data.paragraphs)assert.equal(html.split(escape(p.text)).length-1,1);
 assert.match(html,/By Ahimanikya Satapathy/);assert.match(html,/id="jobra-ref-1" href="#jobra-note-1"/);assert.match(html,/href="#jobra-ref-1" data-footnote-backref/);
 assert.match(html,/<section class="end-credits" id="sources-credits"/);assert.doesNotMatch(html,/<details[^>]*id="sources-credits"/);
 assert.match(html,/Further reading/);assert.match(html,/Suggest an update/);assert.match(html,/data-save-journey="experience:jobra-maritime-museum"/);
 assert.doesNotMatch(html,/Human editorial review pending|Editorial draft/);
});
