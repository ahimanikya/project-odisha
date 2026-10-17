import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const notebooks=JSON.parse(readFileSync('../../kb/research/destinations/visit-notebooks.json','utf8')).notebooks;
const home=readFileSync('dist/index.html','utf8');
const catalog=JSON.parse(home.match(/<script[^>]*id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
test('planning references survive page rendering and both portable formats for all notebook guides',()=>{
 for(const note of notebooks){
  const html=readFileSync('dist'+note.route+'index.html','utf8');
  const plan={version:1,title:'Reference check',items:[{id:note.save_id,day:1,notes:''}]};
  const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
  assert.ok(note.planning_review.remaining.length>0);
  for(const source of note.planning_sources){
   assert.ok(html.includes(escapeHTML(source.url)),note.route+' page source');
   if(note.editorial_notes_in_article){assert.match(source.checked_on,/^\d{4}-\d{2}-\d{2}$/);assert.ok(html.includes('Footnotes &amp; Sources'));}else assert.ok(html.includes('Planning reference checked '+source.checked_on));
   assert.ok(book.includes(escapeHTML(source.url)),note.route+' HTML source');
   assert.ok(text.includes(source.url),note.route+' text source');
  }
  for(const stop of note.planning_stops||[]){
   assert.ok(note.planning_sources.some(source=>source.url===stop.source_url),'each visit stop has an inspected source');
   for(const field of ['heading','text']){
    assert.ok(html.includes(escapeHTML(stop[field])),'page retains visit-stop context');
    assert.ok(book.includes(escapeHTML(stop[field])),'HTML book retains visit-stop context');
    assert.ok(text.includes(stop[field]),'text book retains visit-stop context');
   }
  }
  assert.ok(book.includes(escapeHTML(note.prepare)));
  assert.ok(text.includes(note.prepare));
  assert.ok(html.includes(escapeHTML(note.planning_help.text)));
  assert.ok(html.includes(`href="${note.planning_help.url}"`));
  assert.ok(book.includes(escapeHTML(note.planning_help.text)));
  assert.ok(text.includes(note.planning_help.text));
  assert.ok(note.planning_sources.some(source=>source.url===note.planning_help.url));
 }
});
test('portable print style lets the user choose A4 or Letter and preserves long Odia notes',()=>{
 const note=('A slow day in Odisha. '.repeat(100))+' ଓଡ଼ିଶା END-OF-NOTE';
 const book=buildTourBook({version:1,title:'Print check',items:[{id:'place:konark',day:1,notes:note}]},catalog);
 assert.match(book,/@page\{size:auto;margin:18mm\}/);
 assert.match(readFileSync('src/pages/journey.astro','utf8'),/@page\{size:auto;margin:18mm\}/);
 assert.ok(book.includes(escapeHTML(note)));
 assert.match(book,/break-after:avoid/);
 assert.match(book,/break-inside:avoid/);
});

test('six coastal guides retain practical decisions, reading links and qualifications in both portable formats',()=>{
 const notes=notebooks.filter(note=>note.practical_choices);
 const scope=JSON.parse(readFileSync('editions/coast.json','utf8'));
 assert.equal(notes.length,6);
 for(const note of notes){
  assert.deepEqual(note.practical_choices.items.map(i=>i.key),['arrival','access','food','stay']);
  const html=readFileSync('dist'+note.route+'index.html','utf8');
  const plan={version:1,title:'Practical visit',items:[{id:note.save_id,day:1,notes:''}]};
  const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
  assert.ok(html.includes('id="practical-choices"'));
  for(const output of [html,book])assert.ok(output.includes(escapeHTML(note.practical_choices.note)));
  assert.ok(text.includes(note.practical_choices.note));
  for(const choice of note.practical_choices.items){
   assert.ok(['source_context_with_editorial_advice','editorial_planning_suggestion'].includes(choice.basis));
   for(const url of choice.source_urls)assert.ok(note.planning_sources.some(s=>s.url===url),url);
   for(const output of [html,book])assert.ok(output.includes(escapeHTML(choice.text)),note.route+' practical text');
   assert.ok(text.includes(choice.text));
   for(const link of choice.links){
    if(link.href.startsWith('/'))assert.ok(scope.routes.includes(link.href),link.href+' must remain available');
    assert.ok(html.includes('href="'+escapeHTML(link.href)+'"'));
    const url=new URL(link.href,'https://projectodisha.org').href;
    assert.ok(book.includes('href="'+escapeHTML(url)+'"'));
    assert.ok(text.includes(url));
   }
  }
 }
});

test('portable practical links escape labels and reject executable URLs',()=>{
 const note=structuredClone(notebooks.find(n=>n.practical_choices));
 note.practical_choices.items[0].links=[{label:'<img src=x onerror=alert(1)>',href:'javascript:alert(1)'},{label:'A & B',href:'/knowledge/chilika/'}];
 const entry={...catalog.find(x=>x.id===note.save_id),visitNotebook:note};
 const plan={version:1,title:'Links',items:[{id:entry.id,day:1,notes:''}]};
 const html=buildTourBook(plan,[entry]),text=buildTextItinerary(plan,[entry]);
 assert.ok(!html.includes('javascript:'));assert.ok(!text.includes('javascript:'));assert.ok(!html.includes('<img src=x'));
 assert.ok(html.includes('>A &amp; B</a>'));assert.ok(text.includes('A & B — https://projectodisha.org/knowledge/chilika/'));
});
