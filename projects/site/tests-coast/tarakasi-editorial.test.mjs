import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const route='/visit/experiences/cuttack-filigree/';
const html=read(route);
const editorial=JSON.parse(readFileSync('../../kb/research/destinations/tarakasi-editorial.json','utf8'));
const record=JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8')).records.find(r=>r.slug==='cuttack-filigree');
const assets=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8')).assets;
test('Tarakasi has a credited reading with visible notes and exact passage returns',()=>{
 assert.ok(html.indexOf('By Ahimanikya Satapathy')>=0);
 assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf('id="detail-section-1"'));
 assert.match(html,/<section id="story-sources"/);
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/Drafted with AI assistance|human editorial review pending|Editorial draft/);
 assert.equal(editorial.sources.length,3);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,4);
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));
 assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 for(const passage of editorial.passages){
  const match=passage.id.match(/^detail-(\d+)(?:-p-(\d+))?$/);assert.ok(match);
  const section=record.sections[Number(match[1])];assert.ok(section);
  assert.ok(match[2]===undefined?section.text:section.paragraphs?.[Number(match[2])]);
  for(const id of passage.source_ids)assert.ok(section.sources.includes(id));
 }
 const outsideDisclosures=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outsideDisclosures,/<section id="story-sources"/);
});
test('Tarakasi preserves all documentary images, rights, material uncertainty and the explanatory drawing',()=>{
 for(const id of [record.photo_ref,...record.gallery]){
  const asset=assets[id];
  assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
  for(const value of [asset.src,asset.creator,asset.license_url,asset.source])assert.ok(html.includes(value),`${id}: ${value}`);
 }
 const hero=html.match(/<figure id="story-image"[\s\S]*?<\/figure>/)?.[0];assert.ok(hero);
 assert.ok(hero.includes(record.photo_context));
 assert.match(hero,/source descriptions differ on the metal; this image illustrates form, not verified purity/);
 assert.match(html,/aria-labelledby="filigree-title filigree-desc"/);
 assert.match(html,/Simplified forms, not a traditional design or a making sequence/);
});
test('Tarakasi keeps collapsed further reading, a visible update and journey save without changing neighbouring routes',()=>{
 const collection=JSON.parse(readFileSync('../../kb/research/destinations/coastal-reading-collection.json','utf8'));
 assert.ok(!collection.chapters.some(chapter=>chapter.href===route));
 const onward=html.match(/<section id="connect-visit"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<details class="utk-disclosure"[^>]*><summary[^>]*>Further reading<\/summary>/);
 assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const href of ['/crafts/','/visit/places/barabati/','/food/cuttack/','/destinations/cuttack/','/journey/'])assert.ok(onward.includes(`href="${href}"`));
 const outsideDisclosures=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outsideDisclosures,/href="\/contribute\/\?page=%2Fvisit%2Fexperiences%2Fcuttack-filigree%2F"[^>]*>Suggest an update/);
 assert.match(outsideDisclosures,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="experience:cuttack-filigree"/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 const other=read('/visit/experiences/jobra-maritime-museum/');
 assert.doesNotMatch(other,/class="article-byline"|id="story-sources"/);
 assert.doesNotMatch(other,/Drafted with AI assistance/);
 const barabati=read('/visit/places/barabati/');
 assert.match(barabati,/href="\/contribute\/\?page=%2Fvisit%2Fplaces%2Fbarabati%2F"[^>]*>Suggest an update/);
});
