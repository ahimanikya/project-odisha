import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selection,districtRows,count} from '../src/lib/language-atlas.mjs';
import {buildTourBook,buildTextItinerary,escapeHTML} from '../src/lib/tour-book.mjs';
const read=path=>readFileSync(path,'utf8');
const collection=JSON.parse(read('../../kb/research/voices/collection.json'));
const entry=collection.pages.find(p=>p.path==='languages/desia');
const editorial=JSON.parse(read('../../kb/research/voices/desia-editorial.json'));
const atlas=JSON.parse(read('../../kb/research/voices/population-2011.json'));
const page=path=>read(`dist-coast${path}index.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
test('Desia maps its sourced reading and population separately and preserves the honest typographic identity',()=>{
 const passages=entry.sections.flatMap(s=>s.paragraphs.map((p,i)=>({id:`${s.id}-${i}`,source_ids:p.source_ids}))).filter(p=>p.source_ids.length);
 passages.push({id:'population',source_ids:['c16-odisha-2011']});
 assert.deepEqual(editorial.passages,passages);
 assert.equal(new Set(editorial.sources.map(s=>s.id)).size,editorial.sources.length);
 for(const p of passages)for(const id of p.source_ids)assert.ok(editorial.sources.some(s=>s.id===id));
 assert.ok(entry.cards.every(c=>c.source_ids.length===0));
 assert.equal(entry.hero_asset,null);assert.ok(entry.identity_panel.length>0);
 for(const id of ['language','learning','performance'])assert.ok(entry.sections.some(s=>s.id===id),id);
});
test('Desia has a byline and visible exact footnote returns for the complete narrative',()=>{
 const html=page('/languages/desia/').replaceAll('&#39;',"'");
 assert.ok(html.includes('By Ahimanikya Satapathy'));assert.ok(html.indexOf('By Ahimanikya Satapathy')<html.indexOf(`id="${entry.sections[0].id}"`));
 assert.match(html,/href="#story-sources"[^>]*>Footnotes &amp; Sources/);assert.ok(!html.includes('href="#language-counts"'));
 assert.doesNotMatch(html,/Research and presentation prepared with AI assistance|awaiting Founder and language or literary review|Sources for this passage:/);
 const refs=[...html.matchAll(/id="(ref-[^"]+)" href="#(note-[^"]+)"/g)];
 assert.equal(refs.length,editorial.passages.reduce((n,p)=>n+p.source_ids.length,0));assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);
 for(const [,ref,note]of refs){assert.equal(html.split(`id="${note}"`).length-1,1);assert.equal(html.split(`href="#${ref}"`).length-1,1);}
 for(const p of entry.sections.flatMap(s=>s.paragraphs))assert.ok(html.includes(escape(p.text)),p.text);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');assert.match(outside,/<section id="story-sources"/);
 for(const source of editorial.sources){assert.ok(html.includes(escape(source.url)));assert.ok(html.includes(escape(source.note)));}
});
test('Desia population retains the individual entry, original counts, districts, year and source',()=>{
 const html=page('/languages/desia/');
 const inset=html.match(/<section id="population"[\s\S]*?<\/section>/)?.[0];assert.ok(inset);
 const profile=atlas.profiles.desia,value=selection(atlas,profile.code);
 for(const text of [count(value.persons),value.share,`Recorded as ${value.label.label}`,'Census 2011',`Sheet1, row ${value.sourceRow}`,profile.note].filter(Boolean))assert.ok(inset.includes(escape(text)),text);
 for(const d of districtRows(atlas,profile.code).filter(r=>r.persons>0).slice(0,3))assert.ok(inset.includes(`${d.name} (${count(d.persons)})`));
 assert.ok(inset.includes(`href="/languages/atlas/?language=${profile.code}"`));assert.ok(inset.includes(atlas.sources.c16.url));
 assert.ok(inset.includes('id="ref-population-c16-odisha-2011"'));
 const other=page('/languages/sambalpuri/');assert.ok(other.includes('ref-population-c16-odisha-2011'));assert.ok(other.includes('language=015058'));assert.match(other,/Footnotes &amp; Sources/);
 const odia=page('/languages/odia/');assert.ok(odia.includes('ref-population-c16-odisha-2011'));assert.ok(odia.includes('By Ahimanikya Satapathy'));
});
test('Desia preserves the typographic cover, onward links, save identity and visible update privacy without changing the hub',()=>{
 const html=page('/languages/desia/');
 const cover=html.match(/<header[^>]*class="mag-cover[^"]*"[\s\S]*?<\/header>/)?.[0];assert.ok(cover);
 assert.match(cover,/class="culture-identity"/);assert.doesNotMatch(cover,/<img\b/);
 for(const value of [...entry.identity_panel,entry.identity_note])assert.ok(cover.includes(escape(value)),value);
 const onward=html.match(/<section class="culture-onward"[\s\S]*?<\/section>/)?.[0];assert.ok(onward);
 assert.doesNotMatch(onward,/<details\b/);assert.match(onward,/aria-label="Continue reading"/);
 for(const href of ['/languages/','/literature/','/destinations/','/journey/'])assert.ok(onward.includes(`href="${href}"`),href);
 const outside=html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g,'');
 assert.match(outside,/href="\/contribute\/\?page=%2Flanguages%2Fdesia%2F"[^>]*>Suggest an update/);
 assert.match(outside,/GitHub submissions are public; omit private contact details and consent documents/);
 assert.match(html,/data-save-journey="reading:languages\/desia"/);assert.match(html,/name="robots" content="noindex, nofollow"/);
 const hub=page('/languages/');assert.ok(hub.includes('By Ahimanikya Satapathy'));assert.ok(hub.includes('id="story-sources"'));assert.ok(hub.includes('href="#language-counts"'));
});
test('Desia portable reading contains complete paragraphs once, short sources, website link and personal notes',()=>{
 const catalog=JSON.parse(read('dist-coast/index.html').match(/id="journey-data"[^>]*>([\s\S]*?)<\/script>/)[1]).catalog;
 const item=catalog.find(i=>i.id==='reading:languages/desia');assert.ok(item);
 assert.equal(item.author,editorial.author);assert.equal(item.checked,entry.checked_on||collection.checked_on);
 assert.deepEqual(item.sources,editorial.sources.map(({title,url})=>({title,url})));
 assert.deepEqual(item.practical.slice(0,entry.sections.length).map(p=>p.paragraphs),entry.sections.map(s=>s.paragraphs.map(p=>p.text)));
 const population=item.practical.at(-1);assert.ok(population.heading.includes('Census 2011'));const value=selection(atlas,atlas.profiles.desia.code);assert.ok(population.paragraphs.join(' ').includes(count(value.persons)));assert.ok(population.paragraphs.join(' ').includes(value.share));
 const plan={version:1,title:'Reading Desia',items:[{id:item.id,day:0,notes:'Keep my edition note.'}]};
 const book=buildTourBook(plan,catalog),text=buildTextItinerary(plan,catalog);
 assert.equal(item.photo,undefined,'Existing text-only portable reading is retained; no invented image mapping');
 for(const p of entry.sections.flatMap(s=>s.paragraphs)){
  const paragraph=`<p>${escapeHTML(p.text)}</p>`;assert.equal(book.split(paragraph).length-1,1,p.text);assert.ok(text.includes(p.text));
 }
 for(const output of [book,text]){assert.ok(output.includes('By Ahimanikya Satapathy'));assert.ok(output.includes('https://projectodisha.org/languages/desia/'));for(const source of editorial.sources)assert.ok(!output.includes(source.note));}
 // Compare normalized source URLs in both download formats.
 for(const source of editorial.sources){const url=new URL(source.url).href;assert.ok(book.includes(`href="${escapeHTML(url)}"`),source.id);assert.ok(text.includes(url),source.id);}

 assert.ok(text.includes('Keep my edition note.'));
 const sibling=catalog.find(i=>i.id==='reading:languages/sambalpuri');assert.equal(sibling.author,'Ahimanikya Satapathy');const original=collection.pages.find(p=>p.path==='languages/sambalpuri');assert.deepEqual(sibling.practical.slice(0,original.sections.length).map(s=>s.paragraphs),original.sections.map(s=>s.paragraphs.map(p=>p.text)));
});


test('an actual unreviewed fixture retains source attribution without acquiring a Founder byline',async()=>{
 const {createServer}=await import('vite');
 const {getViteConfig}=await import('astro/config');
 const {experimental_AstroContainer}=await import('astro/container');
 const config=await getViteConfig({server:{middlewareMode:true,hmr:false,ws:false},logLevel:'silent'},{root:process.cwd()})({mode:'test',command:'build'});
 const server=await createServer(config);
 try{
  const {default:Component}=await server.ssrLoadModule('/src/components/CultureMagazine.astro');
  const fixture=structuredClone(entry);fixture.path='test-only/unreviewed';fixture.title='Unreviewed test fixture';fixture.language_contribution=false;
  const container=await experimental_AstroContainer.create();
  const html=await container.renderToString(Component,{props:{entry:fixture}});
  assert.doesNotMatch(html,/class="article-byline"|id="story-sources"/);
  assert.match(html,/Editorial preview/);assert.match(html,/id="sources"/);
  for(const paragraph of fixture.sections.flatMap(s=>s.paragraphs))for(const id of paragraph.source_ids)assert.ok(html.includes(escape(collection.sources[id].url)));
 }finally{await server.close();}
});
