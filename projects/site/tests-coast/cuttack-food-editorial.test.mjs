import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const page=route=>read(`dist-coast${route}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const html=page('/food/cuttack/');
const guide=JSON.parse(read('../../kb/research/food/cuttack.json'));
const editorial=JSON.parse(read('../../kb/research/food/cuttack-editorial.json'));
const photo=JSON.parse(read('../../kb/research/food/collection.json')).assets[guide.hero];
test('Cuttack food places its byline in the cover and links one factual passage to a visible source and return',()=>{
 const cover=html.match(/<header\b[^>]*class="mag-cover[\s\S]*?<\/header>/)?.[0];
 assert.ok(cover?.includes('By Ahimanikya Satapathy'));
 assert.match(html,/story-contents-mobile/);
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);
 assert.doesNotMatch(html,/Prepared with AI assistance|human editorial review pending|Editorial draft/);
 assert.equal(editorial.sources.length,1);
 assert.deepEqual(editorial.passages,[{id:'dahibara',source_ids:['cuttack-food']}]);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,1);
 for(const [,ref,note] of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/<section id="story-sources"/);
 for(const section of guide.sections){assert.ok(html.includes(escapeHTML(section.text)));assert.ok(html.includes(escapeHTML(section.question)));assert.ok(html.includes(`data-save-journey="${section.save_id}"`));}
 assert.ok(html.includes(escapeHTML(guide.closing)));
 assert.match(html,/href="\/food\/dahibara-aloodum\/"/);
});
test('Cuttack food retains its dated photograph, original bytes and reuse credit',()=>{
 assert.equal(createHash('sha256').update(readFileSync('public'+photo.src)).digest('hex'),photo.sha256);
 for(const value of [photo.src,photo.creator,photo.source,photo.license_url])assert.ok(html.includes(value));
 const hero=html.match(/<figure id="story-image"[\s\S]*?<\/figure>/)?.[0];assert.ok(hero);
 assert.ok(hero.includes(guide.photo_context));
 assert.match(hero,/2011/);
 assert.match(hero,/not a current vendor or menu/);
 const credit=html.match(/<p\b[^>]*><strong\b[^>]*>Photograph\.<\/strong>[\s\S]*?<\/p>/)?.[0];assert.ok(credit);
 assert.ok(credit.includes(editorial.photo_credit_title));
 assert.equal(credit.split(photo.creator).length-1,1);
 for(const value of [photo.source,photo.license_url,photo.license,photo.changes])assert.ok(credit.includes(value));
 assert.ok(!credit.includes(guide.photo_context));
});
test('Cuttack food keeps every onward link collapsed and a public update action visible without changing other meals',()=>{
 const onward=html.match(/<section class="meal-further-reading"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.match(onward,/<details class="utk-disclosure"[^>]*><summary[^>]*>Further reading<\/summary>/);
 assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
 for(const link of guide.onward)assert.ok(onward.includes(`href="${link.href}"`));
 assert.ok(onward.includes('href="/journey/"'));
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Ffood%2Fcuttack%2F"[^>]*>Suggest an update/);
 assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/name="robots" content="noindex, nofollow"/);
 for(const route of ['/food/puri-coast/','/food/bhubaneswar/']){
  const other=page(route);
  assert.match(other,/<section class="visit-connections"/);
  assert.doesNotMatch(other,/class="meal-further-reading"|class="meal-update"/);
  assert.match(other,/By Ahimanikya Satapathy/);
  assert.match(other,/<section id="story-sources"/);
 }
});
test('Saved Cuttack reading preserves the full food story, ordering advice, photo credits and concise sources',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const plan={version:1,title:'A Cuttack meal',items:[{id:'food:cuttack-dahibara',day:1,notes:'Ask about the preparation.'}]};
 const item=catalog.find(item=>item.id==='food:cuttack-dahibara');assert.equal(item.href,'/food/dahibara-aloodum/');
 const image='data:image/webp;base64,'+readFileSync('public'+photo.src).toString('base64');
 const book=buildTourBook(plan,catalog,{illustrated:true,images:{[photo.src]:image}}),text=buildTextItinerary(plan,catalog);
 const fullStory=JSON.parse(read('../../kb/research/food/collection.json')).pages.find(page=>page.slug==='dahibara-aloodum');
 for(const section of fullStory.sections)for(const paragraph of section.paragraphs){assert.ok(book.includes(escapeHTML(paragraph.text)));assert.ok(text.includes(paragraph.text));}
 for(const output of [book,text])assert.ok(output.includes(guide.sources['cuttack-food'].url));
 assert.ok(book.includes(escapeHTML(guide.closing)));assert.ok(text.includes(guide.closing));
 assert.ok(book.includes(escapeHTML(photo.caption)));
 for(const value of [photo.creator,photo.license_url])assert.ok(book.includes(value));
 for(const output of [book,text])assert.ok(!output.includes(editorial.sources[0].note));
 assert.ok(text.includes('Ask about the preparation.'));
});
