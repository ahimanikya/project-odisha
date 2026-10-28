import test from 'node:test';
import assert from 'node:assert/strict';
import {productionLabels} from '../tools/check-public-disclosures.mjs';
test('detects production labels in captions, accessible descriptions and previews',()=>{
 for(const html of ['<p>AI-generated image</p>','<figcaption>Photograph without AI modification</figcaption>','<img alt="Photograph without AI modification">','<img alt="AI-created artwork">','<meta content="Prepared with AI assistance">','<p>Drafted <em>with</em> AI assistance</p>','<p>AI&#45;assisted research</p>'])assert.ok(productionLabels(html).length,html);
});
test('preserves factual AI topics, provenance questions, credits and internal code',()=>{
 for(const html of ['<p>AI research in Odisha</p>','<label>Editing, including any AI generation</label>','<p>Illustration adapted from a photograph · CC BY-SA 4.0</p>','<script>{"internal":"AI-generated"}</script><!-- AI-assisted -->'])assert.deepEqual(productionLabels(html),[]);
});
