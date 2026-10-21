import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
import {emptyLibrary,addItem,parseBackup} from '../src/lib/journey.mjs';
const slugs=['santali','kui','kuvi','saora','ho','juang','koya'];
const read=route=>readFileSync(`dist-coast${route}index.html`,'utf8');
const data=JSON.parse(read('/').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const voices=JSON.parse(readFileSync('../../kb/research/voices/collection.json','utf8'));
test('all seven introductions have a real learning resource and a public contribution draft',()=>{
 const hub=read('/languages/');
 for(const slug of slugs){
  const href=`/languages/${slug}/`,html=read(href),entry=voices.pages.find(p=>p.path===`languages/${slug}`);
  assert.ok(hub.includes(`href="${href}"`));assert.ok(html.includes(`data-save-journey="reading:languages/${slug}"`));
  const r=entry.learning_resource;assert.ok(html.includes(`href="${r.href}"`));assert.ok(voices.sources[r.source_id]);
  assert.ok(html.includes('November 2018'));assert.ok(html.includes('submitted issues are public'));assert.ok(html.includes('id="share-a-voice"'));
  assert.ok(!/<(?:audio|iframe)\b/.test(html));
  if(['santali','kui','kuvi','saora','ho'].includes(slug)){
   const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
   assert.match(outside,/<section id="story-sources"/);
   assert.match(outside,/data-footnote-ref/);assert.match(outside,/data-footnote-backref/);
   const onward=html.match(/<section class="culture-onward-disclosure"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
   assert.match(onward,/<summary[^>]*>Further reading<\/summary>/);assert.doesNotMatch(onward,/<details[^>]*\bopen\b/);
  }else assert.ok(html.replaceAll('&amp;','&').includes('Sources, image credits & editorial notes'));
 }
 for(const slug of ['gondi','kisan','sadri']){assert.ok(!existsSync(`dist-coast/languages/${slug}/index.html`));assert.ok(!hub.includes(`href="/languages/${slug}/"`));}
});
test('new reading items preserve sources, prompts, earlier notes and Odia text through portable books',()=>{
 const library=emptyLibrary();library.trips[0].plan=addItem(library.trips[0].plan,'place:chilika');library.trips[0].plan.items[0].notes='Keep my lake question';library.trips[0].plan.startDate='2026-12-12';
 for(const slug of slugs)library.trips[0].plan=addItem(library.trips[0].plan,`reading:languages/${slug}`);
 library.trips[0].plan.items[1].notes='ମୋ ଯାତ୍ରା · ask about this edition';
 const restored=parseBackup(JSON.stringify(library));assert.deepEqual(restored,library);
 const html=buildTourBook(restored.trips[0].plan,data.catalog),text=buildTextItinerary(restored.trips[0].plan,data.catalog);
 for(const slug of slugs){
  const items=data.catalog.filter(i=>i.id===`reading:languages/${slug}`);assert.equal(items.length,1);const item=items[0];const entry=voices.pages.find(p=>p.path===`languages/${slug}`);assert.equal(item.checked,entry.checked_on||voices.checked_on);assert.ok(item.practical.length>=3);
  for(const n of item.practical)for(const paragraph of n.paragraphs||[n.text]){assert.ok(html.includes(escapeHTML(paragraph)));assert.ok(text.includes(paragraph));}
  for(const s of item.sources){assert.ok(html.includes(escapeHTML(s.url)));assert.ok(text.includes(s.url));}
 }
 for(const phrase of ['Keep my lake question','ମୋ ଯାତ୍ରା','ask about this edition']){assert.ok(html.includes(phrase));assert.ok(text.includes(phrase));}
});
test('place and literature connections state their evidence without implying visits or complete books',()=>{
 const santali=read('/languages/santali/'),kui=read('/languages/kui/');
 for(const phrase of ['21 May 2022','Damayanti Beshra','Nalha','Gobinda Chandra Majhi','PDF page 145'])assert.ok(santali.includes(phrase),phrase);
 assert.ok(read('/destinations/mayurbhanj/').includes('href="/languages/santali/"'));
 assert.ok(kui.includes('9 March 2024'));assert.ok(kui.includes('Srikant Mallick'));
 assert.ok(!read('/languages/koya/').includes('mango-eating'));
 const contribute=read('/contribute/');assert.ok(contribute.includes('id="language-contributions"'));assert.ok(contribute.includes('Nothing is submitted until'));
});
