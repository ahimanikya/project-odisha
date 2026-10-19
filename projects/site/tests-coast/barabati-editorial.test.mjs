import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const html=read('/visit/places/barabati/');
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/barabati-editorial.json','utf8'));
const asset=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8')).assets.barabati;
test('Barabati has a credited reading and visible exact source returns without changing adjacent authorship',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/<section id="story-sources"/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.ok(refs.length>0);
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 const other=read('/visit/experiences/cuttack-netaji/');
 assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);
 assert.match(other,/Drafted with AI assistance/);
});
test('Barabati retains documentary photo rights, collapsed onward paths and a visible update action',()=>{
 assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
 for(const value of [asset.src,asset.creator,asset.license_url])assert.ok(html.includes(value));
 const onward=html.match(/<section id="connect-visit"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<details class="utk-disclosure"[^>]*><summary[^>]*>Further reading<\/summary>/);
 assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/visit/experiences/cuttack-filigree/','/food/cuttack/','/destinations/cuttack/','/journey/'])assert.ok(onward.includes(`href="${href}"`));
 const outsideDisclosures=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outsideDisclosures,/href="\/contribute\/\?page=%2Fvisit%2Fplaces%2Fbarabati%2F"[^>]*>Suggest an update/);
 assert.match(outsideDisclosures,/GitHub submissions are public/);
 assert.match(html,/data-save-journey="place:barabati"/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
});
