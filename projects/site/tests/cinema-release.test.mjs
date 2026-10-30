import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {cinema,cinemaArticle,picture,cinemaRouteEntries,cinemaNarrative} from '../src/lib/cinema-article.mjs';
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.resolve(site,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('manifest canonical articles preserve notes, captions and source hashes',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'kb/research/culture/cinema-series/manifest.json'),'utf8'));assert.deepEqual(cinema.articles.map(a=>a.slug),manifest.articles.map(a=>a.slug));
 for(const entry of cinema.articles){
  const source=fs.readFileSync(path.join(root,entry.source),'utf8');assert.equal(hash(source),entry.source_sha256,entry.slug);
  const {article,hero,readingLinks,fullHTML}=cinemaArticle(entry);const html=fullHTML;
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,entry.slug+' duplicate anchors');
  for(const [,target]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(target),entry.slug+' '+target);
  assert.equal((html.match(/<figure\b/g)||[]).length,entry.images.length,entry.slug+' figures');
  const heroCaption=html.match(/<figure class="cinema-hero[^"]*"[^>]*>[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>/)?.[1];assert.ok(heroCaption,entry.slug+' visible hero caption');if(entry.hero.kind==='documentary'){assert.ok(entry.hero.credit?.creator);const escaped=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');assert.ok(html.includes(escaped(entry.hero.credit.creator)),entry.slug+' visible creator credit');assert.ok(heroCaption.includes('href="#user-content-fn-cinema-image-1"'),entry.slug+' caption links to credit');assert.ok(!heroCaption.includes('Credit:'),entry.slug+' credit moved to notes');for(const value of [entry.hero.credit.source_url,entry.hero.credit.license_url])assert.ok(html.includes('href="'+escaped(new URL(value).href)+'"'),entry.slug+' linked documentary credit');assert.ok(html.includes(escaped(entry.hero.credit.license)));}else if(entry.hero.kind==='author-portrait'){assert.equal(heroCaption,'Ahimanikya Satapathy.');assert.ok(!html.includes('id="image-credits"'));assert.ok(!entry.hero.credit?.license);}else assert.match(heroCaption,/\billustration\b/i,entry.slug+' clearly labelled illustration');assert.ok(!/AI-generated|Human Natural Editorial|Editorial Natural/.test(html),entry.slug+' production explanation reserved for process page');
  assert.ok(html.includes('Footnotes &amp; Sources')||html.includes('Footnotes & Sources'),entry.slug+' sources');
  assert.ok(html.includes('/contribute/?page='+encodeURIComponent(entry.route)),entry.slug+' update route');
  assert.ok(readingLinks.length,entry.slug+' reading links');assert.equal(hero.file,entry.images.find(i=>i.role==='title').file);
  for(const image of entry.images){assert.ok(html.includes(image.file),entry.slug+' visible image');for(const d of image.derivatives){const bytes=fs.readFileSync(path.join(site,'public',d.file));assert.equal(hash(bytes),d.sha256);}}
 }
});
test('children sections and Watch links promoted exactly once',()=>{for(const [slug,heading,note]of [['odia-cinema','Children, imagination and the screen','children-babula-parliament'],['odia-television','Animation, and the language a child hears','child-idmt']]){const entry=cinema.articles.find(e=>e.slug===slug),source=fs.readFileSync(path.join(root,entry.source),'utf8');assert.equal(source.split('## '+heading).length-1,1);assert.equal(source.split('[^'+note+']:').length-1,1);assert.ok(cinemaArticle(entry).article.html.includes(heading));}});
test('books staged byte-exact and no source-sized hero PNGs deployed',()=>{for(const book of cinema.books){assert.equal(hash(fs.readFileSync(path.join(site,'public',book.file))),book.sha256);const delivery=JSON.parse(fs.readFileSync(path.join(root,'kb/records/cinema-book-disclosure-fix-2026-10-26.json'),'utf8'));const reviewed=Object.values(delivery.outputs).find(output=>path.basename(output.path)===path.basename(book.file));assert.ok(reviewed);assert.equal(book.sha256,reviewed.sha256);}const deployed=fs.readdirSync(path.join(site,'public/assets/cinema'));const drawings=cinemaNarrative.line_art.map(item=>path.basename(item.public_image));assert.deepEqual(deployed.filter(f=>f.endsWith('.png')).sort(),drawings.sort());});
test('player logic source-identical, scoped styling, explicit frame policy',()=>{for(const name of ['app.js','core.js','catalogue.js'])assert.equal(fs.readFileSync(path.join(site,'public/assets/cinema/player',name),'utf8'),fs.readFileSync(path.join(root,'outputs/odia-movie-player',name),'utf8'));const app=fs.readFileSync(path.join(site,'public/assets/cinema/player/app.js'),'utf8');assert.ok(app.includes("frame.referrerPolicy='strict-origin-when-cross-origin'"));assert.ok(!app.includes('innerHTML'));const css=fs.readFileSync(path.join(site,'public/assets/cinema/player/player.css'),'utf8');assert.ok(css.includes('.cinema-player'));const page=fs.readFileSync(path.join(site,'src/pages/cinema/watch.astro'),'utf8');assert.ok(!page.includes('<iframe'));assert.equal((page.match(/is:inline defer/g)||[]).length,3);});

test('cinema delivery preserves responsive JPEGs and release PDF URLs',()=>{
 for(const entry of cinema.articles)for(const image of entry.images){const html=picture(image,'Image',image.role==='title');assert.ok(!html.includes('.webp'));for(const d of image.derivatives.filter(d=>d.format==='jpeg'))assert.ok(html.includes(`${d.file} ${d.width}w`));assert.ok(html.includes('sizes="'));assert.ok(html.includes(`width="${image.width}" height="${image.height}"`));assert.ok(html.includes(image.role==='title'?'fetchpriority="high"':'loading="lazy"'));}
 const book=fs.readFileSync(path.join(site,'src/pages/cinema/book.astro'),'utf8');for(const name of ['odia-cinema-a-living-screen.pdf','odia-cinema-a-living-screen-print.pdf'])assert.ok(book.includes('https://github.com/ahimanikya/project-odisha/releases/download/odia-cinema-book-2026-10-26/'+name));
 const coast=JSON.parse(fs.readFileSync(path.join(site,'editions/coast.json'),'utf8'));for(const book of cinema.review_books||[]){assert.ok(/^https:\/\/github\.com\/ahimanikya\/project-odisha\/releases\/download\/[A-Za-z0-9._-]+\/[^/]+\.pdf$/.test(book.file));assert.ok(!coast.documents.includes('/archive/'+path.basename(book.file)));}
});

test('further reading preserves all source links and enriches destination articles',()=>{
 for(const entry of cinema.articles){const out=cinemaArticle(entry);const tail=out.fullHTML.split('<h2 id="further-reading">Further reading</h2>')[1];const expected=[...tail.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).sort();const retained=out.readingSections.flatMap(s=>[...s.before.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).concat(s.links.map(l=>l.href))).concat([...out.afterReading.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'))).sort();assert.deepEqual(retained,expected,entry.slug+' reading links');for(const section of out.readingSections){for(const link of section.links){const target=cinema.articles.find(a=>a.route===link.href);if(target){assert.equal(link.description,target.series_intro);assert.equal(link.image,target.card_image||target.images.find(i=>i.role==='title').file);}}}for(const [,id]of tail.matchAll(/<h3 id="([^"]+)"/g))assert.ok(out.readingSections.some(s=>s.id===id),entry.slug+' heading anchor');}
 const page=fs.readFileSync(path.join(site,'src/components/CinemaReading.astro'),'utf8');assert.ok(page.includes('headingLevel={3} compact'));assert.ok(page.includes('class="cinema-sequence"'));assert.ok(page.includes('class="cinema-utilities"'));assert.ok(!page.includes('All eleven'));
});

test('people route overrides are excluded from cinema slug emission',()=>{const sample=[{slug:'gourahari-das',route:'/people/gourahari-das/'},{slug:'nirad-mohapatra',route:'/people/nirad-mohapatra/'},{slug:'pratikshya',route:'/cinema/pratikshya/'}];assert.deepEqual(cinemaRouteEntries(sample),[sample[2]]);assert.ok(cinemaRouteEntries().every(e=>e.route===`/cinema/${e.slug}/`));const prep=fs.readFileSync(path.join(site,'tools/prepare-cinema.mjs'),'utf8');assert.ok(prep.includes("route:entry.route||'/cinema/'+entry.slug+'/'"));const route=fs.readFileSync(path.join(site,'src/pages/cinema/[slug].astro'),'utf8');assert.ok(route.includes('cinemaRouteEntries()'));assert.ok(route.includes('<CinemaReading entry={entry}/>'));const book=fs.readFileSync(path.join(site,'src/pages/cinema/book.astro'),'utf8');assert.ok(book.includes('Available PDF edition · '));assert.ok(book.includes('Earlier published edition · 26 October 2026'));assert.ok(book.includes('{cinema.articles.length} readings'));assert.ok(book.includes('fourteen-chapter edition of 26 October 2026'));});

test('Gourahari is a people companion with an accurately labelled hero',()=>{const entry=cinema.articles.find(a=>a.slug==='gourahari-das');assert.ok(entry);assert.equal(entry.route,'/people/gourahari-das/');assert.ok(!cinemaRouteEntries().includes(entry));if(entry.hero.kind!=='documentary'){assert.match(entry.hero.caption,/illustration/i);}const page=fs.readFileSync(path.join(site,'src/pages/people/gourahari-das.astro'),'utf8');assert.ok(page.includes("article.route==='/people/gourahari-das/'"));assert.ok(page.includes('<CinemaReading entry={entry}/>'));});

test('Nirad people profile reuses the licensed uncropped documentary photograph',()=>{const entry=cinema.articles.find(a=>a.slug==='nirad-mohapatra');assert.equal(entry.route,'/people/nirad-mohapatra/');assert.ok(!cinemaRouteEntries().includes(entry));const photo=entry.images.find(i=>i.role===(entry.hero.kind==='documentary'?'title':'documentary-1'));assert.equal(photo.source,'kb/research/media/cinema-series/nirad-mohapatra-raj-sampad.jpg');assert.equal(photo.original_sha256,hash(fs.readFileSync(path.join(root,photo.source))));const out=cinemaArticle(entry);assert.equal((out.fullHTML.match(/<figure\b/g)||[]).length,entry.hero.kind==='documentary'?1:2);for(const credit of ['Raj Sampad','CC BY-SA 4.0'])assert.ok(out.fullHTML.includes(credit));const page=fs.readFileSync(path.join(site,'src/pages/people/nirad-mohapatra.astro'),'utf8');assert.ok(page.includes('<CinemaReading entry={entry}/>'));});

test('Sabyasachi people profile preserves the existing licensed portrait and its credit',()=>{const entry=cinema.articles.find(a=>a.slug==='sabyasachi-mohapatra');assert.equal(entry.route,'/people/sabyasachi-mohapatra/');assert.ok(!cinemaRouteEntries().includes(entry));if(entry.hero.kind!=='documentary'){assert.match(entry.hero.caption,/illustration/i);}const photo=entry.images.find(i=>i.role===(entry.hero.kind==='documentary'?'title':'documentary-1'));assert.equal(photo.source,'kb/research/media/odia-cinema/sabyasachi-mohapatra.jpg');assert.equal(photo.original_sha256,hash(fs.readFileSync(path.join(root,photo.source))));const html=cinemaArticle(entry).fullHTML;for(const credit of ['Subhashish Panigrahi','MKar','CC BY-SA 4.0'])assert.ok(html.includes(credit));assert.equal((html.match(/<figure\b/g)||[]).length,entry.hero.kind==='documentary'?1:2);assert.ok(fs.readFileSync(path.join(site,'src/pages/people/sabyasachi-mohapatra.astro'),'utf8').includes('<CinemaReading entry={entry}/>'));});


test('documentary hero promotes an existing body photograph once with escaped linked credits',()=>{
 const entry=structuredClone(cinema.articles.find(a=>a.slug==='nirad-mohapatra'));
 const photo=entry.images.find(i=>i.role==='documentary-1')||entry.images.find(i=>i.role==='title');
 entry.images=[{...photo,role:'title'}];
 entry.hero={kind:'documentary',alt:'Nirad portrait',caption:'Full portrait <not markup>',credit:{creator:'Photographer & archive',source_url:'https://commons.wikimedia.org/wiki/File:Portrait.jpg?a=1&b=2',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',notes:'Uncropped <original>'}};
 const html=cinemaArticle(entry).fullHTML;
 assert.equal((html.match(/<figure\b/g)||[]).length,1);
 for(const expected of ['Full portrait &lt;not markup&gt;','Photographer &amp; archive','Uncropped &lt;original&gt;','a=1&amp;b=2','>Source</a>','>CC BY-SA 4.0</a>'])assert.ok(html.replace(/<span class="cinema-citation-tail">([\s\S]*?)<\/span>/g,'$1').includes(expected),expected);
 assert.ok(!html.includes('<not markup>'));
 entry.hero.credit.source_url='javascript:alert(1)';assert.throws(()=>cinemaArticle(entry),/requires HTTPS/);
 const naturalWidth=Math.min(photo.width,600*photo.width/photo.height);assert.ok(html.includes(`--cinema-figure-width:${naturalWidth}px`));assert.equal(naturalWidth/photo.width*photo.height,600);
});


test('active article photographs and title artwork do not repeat across readings',()=>{
 const placements=new Map(),titles=new Map();
 for(const entry of cinema.articles){
  const title=entry.images.filter(image=>image.role==='title');assert.equal(title.length,1,entry.slug+' has one title image');
  assert.equal(entry.hero.path,title[0].source,entry.slug+' hero source binding');
  for(const image of entry.images){
   const digest=hash(fs.readFileSync(path.join(root,image.source)));
   assert.equal(image.original_sha256,digest,entry.slug+' original image hash');
   const owner=entry.slug+':'+image.role;
   assert.ok(!placements.has(digest),`${owner} repeats ${placements.get(digest)} (${image.source})`);
   placements.set(digest,owner);
   if(image.role==='title'){
    assert.ok(!titles.has(digest),`${entry.slug} repeats title from ${titles.get(digest)}`);
    titles.set(digest,entry.slug);
   }
  }
 }
 // Reading cards intentionally reuse a destination's title image; they are not article placements.
 for(const slug of ['bhukha','maya-miriga']){
  const entry=cinema.articles.find(a=>a.slug===slug);assert.equal(entry.images.length,1,slug+' retains only its own title image');
  assert.equal((cinemaArticle(entry).article.html.match(/<figure\b/g)||[]).length,1,slug+' has no repeated body portrait');
 }
 const overview=cinema.articles.find(a=>a.slug==='odia-cinema');
 assert.equal(overview.images.length,2,'overview retains its title and the approved archival photograph');
 const archival=overview.images.find(image=>image.role==='documentary');
 assert.equal(archival.source,'kb/research/media/cinema-series/archive/pranab-bijay-mihir-behind-scenes-1989.jpg');
 assert.equal(archival.original_sha256,'7a9fb4f8dd0547a8c8f30c3d2e4390d6e5aef6950735051b88bcb16ee9457a57');
 assert.equal((cinemaArticle(overview).article.html.match(/<figure\b/g)||[]).length,2,'overview renders the archival photograph once');
 const daman=cinema.articles.find(a=>a.slug==='daman');
 assert.ok(daman.images.some(image=>image.source==='kb/research/media/cinema-series/daman/babushaan-mohanty-2018-closeup.jpg'),'DAMaN retains its Babushaan photograph');
});

test('public cinema readings do not expose internal KB file links',()=>{
 const isInternalKB=href=>{
  let decoded=href.replaceAll('&amp;','&');
  try{decoded=decodeURIComponent(decoded);}catch{}
  // Inspect only the destination path: contribution links may name a KB file in their query.
  let url;try{url=new URL(decoded,'https://projectodisha.org');}catch{return false;}
  const pathname=url.pathname;
  return /(?:^|\/)kb(?:\/|$)/i.test(pathname)
   || (/^(?:www\.)?github\.com$/i.test(url.hostname)&&/\/blob\/main\/kb(?:\/|$)/i.test(pathname));
 };
 const violations=[];
 for(const entry of cinema.articles){
  const rendered=cinemaArticle(entry);
  const hrefs=[...rendered.fullHTML.matchAll(/\bhref="([^"]+)"/g)].map(match=>match[1]);
  for(const href of new Set(hrefs.concat(rendered.readingLinks.map(link=>link.href))))
   if(isInternalKB(href))violations.push(entry.slug+': '+href);
 }
 assert.deepEqual(violations,[],'Internal KB destinations must be replaced by reader-facing links');
});


test('new stories grouping connects both films with their makers exactly once',()=>{
 const part=cinema.parts.find(p=>p.id==='new-search-for-stories');assert.ok(part);assert.ok(part.intro);assert.deepEqual(part.chapters,['gourahari-das','pratikshya','anupam-patnaik','daman','vishal-mourya','debi-prasad-lenka','deependra-samal']);
 for(const slug of ['gourahari-das','pratikshya','anupam-patnaik','daman','vishal-mourya','debi-prasad-lenka','deependra-samal']){
  assert.equal(part.chapters.filter(s=>s===slug).length,1,slug+' in new stories group');
  assert.equal(cinema.parts.flatMap(p=>p.chapters).filter(s=>s===slug).length,1,slug+' not duplicated between groups');
  assert.ok(cinema.articles.some(a=>a.slug===slug));
 }
});
test('overview national awards preserve column relationships, row citations and separate international prose',()=>{
 const entry=cinema.articles.find(a=>a.slug==='odia-cinema'),html=cinemaArticle(entry).fullHTML;
 const region=html.match(/<div class="article-table cinema-recognition"([^>]*)><table>([\s\S]*?)<\/table><\/div>/);
 assert.ok(region);assert.ok(region[1].includes('tabindex="0"'));assert.ok(region[1].includes('role="region"'));assert.ok(region[1].includes('aria-labelledby="national-awards-caption"'));
 assert.ok(region[2].includes('<caption id="national-awards-caption">Selected National Film Awards in this series — award years, not release dates</caption>'));
 assert.deepEqual([...region[2].matchAll(/<th scope="col">([\s\S]*?)<\/th>/g)].map(m=>m[1]),['Film','Recognition','Award year and edition','Filmmakers to explore']);
 const rows=[...region[2].matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].flatMap(m=>[...m[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r=>r[1]));assert.equal(rows.length,7);
 assert.ok(region[2].includes("Lahari"));
 for(const row of rows){assert.ok(row.includes('scope="row"'));assert.ok(/data-footnote-ref|href="#fn/.test(row),'award row retains source citation');}
 assert.equal((html.match(/id="national-awards-caption"/g)||[]).length,1);
 for(const other of cinema.articles.filter(a=>a.slug!=='odia-cinema'))assert.ok(!cinemaArticle(other).fullHTML.includes('national-awards-caption'),other.slug+' table remains unchanged');
});


test('reading order is coherent across parts, callbacks preserve citations, image credits return to figures',()=>{
 assert.deepEqual(cinema.parts.flatMap(p=>p.chapters),cinema.articles.map(a=>a.slug));
 for(const c of cinemaNarrative.callouts){
  const html=cinemaArticle(cinema.articles.find(a=>a.slug===c.slug)).fullHTML;
  assert.ok(html.includes(`<aside class="cinema-callback" aria-labelledby="${c.id}-label">`));
  assert.ok(!html.includes('CINEMACALLOUT'));
  for(const [,note]of c.text.matchAll(/\[\^([^\]]+)\]/g))assert.ok(html.includes(`href="#user-content-fn-${note}"`));
 }
 for(const item of [...cinemaNarrative.people_guide,...cinemaNarrative.timeline]){
  const html=cinemaArticle(cinema.articles.find(a=>a.slug===item.slug)).fullHTML;
  assert.ok(html.includes(`id="user-content-fn-${item.source_note_id}"`),item.label||item.text);
 }
});

test('author introduction leads to literature and preserves the expanded collection',()=>{
 const first=cinema.articles[0];assert.equal(first.slug,'the-question-that-brought-me-here');assert.equal(cinema.articles[1].slug,'literature-and-screen');assert.equal(cinema.parts[2].chapters[0],'odia-cinema');assert.equal(cinema.parts.length,7);assert.equal(cinema.parts[0].chapters[0],first.slug);assert.equal(first.hero.kind,'author-portrait');assert.equal(first.images[0].original_sha256,hash(fs.readFileSync(path.join(root,first.hero.path))));
 const out=cinemaArticle(first);assert.ok(out.article.html.includes('How could I help put money in writers’ pockets?'));assert.ok(out.readingLinks.some(link=>link.href==='/cinema/odia-cinema/'));assert.ok(!out.fullHTML.includes('Portrait supplied by Ahimanikya Satapathy; watercolor treatment.'));assert.ok(!out.fullHTML.includes('Image credit'));assert.ok(first.hero.alt.includes('watercolor-treated'));
});

test('current review books match the reviewed release manifest and retain both archives',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'outputs/cinema-publication-readiness-20261030/book-release-manifest.json'),'utf8'));
 assert.equal(manifest.edition_date,'2026-10-30');assert.equal(manifest.readings,41);
 assert.equal(cinema.review_books.length,2);const releaseBases=new Set();
 for(const b of cinema.review_books){
  const reviewed=manifest.assets.find(a=>a.edition===b.edition);assert.ok(reviewed,b.edition);
  for(const key of ['sha256','bytes','pages'])assert.equal(b[key],reviewed[key],b.edition+' '+key);
  const url=new URL(b.file);assert.equal(url.origin,'https://github.com');assert.equal(url.search,'');assert.equal(url.hash,'');
  assert.match(url.pathname,/^\/ahimanikya\/project-odisha\/releases\/download\/[A-Za-z0-9._-]+\/[^/]+\.pdf$/);
  assert.equal(path.posix.basename(url.pathname),reviewed.filename);releaseBases.add(path.posix.dirname(url.pathname));
 }
 assert.equal(releaseBases.size,1);
 const page=fs.readFileSync(path.join(site,'src/pages/cinema/book.astro'),'utf8');
 assert.ok(page.includes('Available PDF edition · 30 October 2026'));assert.ok(page.includes('41 readings'));
 for(const date of ['27 October 2026','26 October 2026'])assert.ok(page.includes('Earlier published edition · '+date));
 for(const archived of manifest.expected_previous_review_books){
  assert.ok(page.includes('href="'+archived.file+'"'));assert.ok(!cinema.review_books.some(b=>b.file===archived.file));
  assert.deepEqual(cinema.archived_review_books.find(b=>b.file===archived.file),archived);
 }
 for(const name of ['odia-cinema-a-living-screen.pdf','odia-cinema-a-living-screen-print.pdf'])assert.ok(page.includes('https://github.com/ahimanikya/project-odisha/releases/download/odia-cinema-book-2026-10-26/'+name));
 assert.ok(page.includes('cinema.review_books.map'));assert.ok(page.includes('not a printer-specific press-ready PDF'));assert.ok(page.includes('not tagged accessibility editions'));
});

test('image attributions continue the regular source-note sequence with matching native returns',()=>{
 let total=0;
 for(const entry of cinema.articles){
  const html=cinemaArticle(entry).fullHTML;
  assert.ok(!html.includes('id="image-credits"'));assert.ok(!html.includes('cinema-image-notes'));
  const section=html.match(/<section data-footnotes[\s\S]*?<\/section>/)?.[0];assert.ok(section);
  const sourceIds=[...section.matchAll(/<li id="user-content-fn-([^"]+)"/g)].map(m=>m[1]);
  for(const [,index,attrs,n]of html.matchAll(/<a href="#user-content-fn-cinema-image-(\d+)"([^>]*)>(\d+)<\/a>/g)){
   total++;assert.ok(attrs.includes(`aria-label="Source note ${n}"`));
   assert.equal(sourceIds.indexOf(`cinema-image-${index}`)+1,Number(n));
   assert.ok(section.includes(`href="#user-content-fnref-cinema-image-${index}"`));
   assert.ok(section.includes(`aria-label="Return to citation ${n}"`));
  }
  assert.equal(new Set(sourceIds).size,sourceIds.length);
  for(const [,caption]of html.matchAll(/<figcaption>([\s\S]*?)<\/figcaption>/g))assert.ok(!/>\s*(?:Photo credit|Image credit)\s*</.test(caption));
 }
 assert.equal(total,19,'all required image attributions retained in regular notes');
});

test('overview keeps performer profiles, dated scoped counts and music ahead of cross-language recognition',()=>{
 const out=cinemaArticle(cinema.articles.find(a=>a.slug==='odia-cinema'));
 const html=out.fullHTML;
 for(const name of ['Bijay Mohanty: performance and teaching','Uttam Mohanty: a remembered encounter','Aparajita Mohanty: acting, producing and learning from another woman'])assert.ok(html.includes(name));
 assert.ok(html.indexOf('The people audiences returned to')<html.indexOf('The songs people carried home'));
 assert.ok(html.indexOf('The songs people carried home')<html.indexOf('Actors whose journeys crossed languages'));
 const table=[...html.matchAll(/<table>([\s\S]*?)<\/table>/g)].map(m=>m[1]).find(t=>t.includes('Reported estimate'));
 assert.ok(table);assert.equal((table.match(/<tbody>[\s\S]*<\/tbody>/)?.[0].match(/<tr>/g)||[]).length,9);
 assert.ok(table.replace(/<[^>]+>/g,'').includes('language breakdown unspecified'));
 assert.ok(table.includes('Hindi film Naya Zahar named'));
 for(const note of ['performer-bijay','performer-aparajita-production','count-siddhanta','music-chitta-collaboration'])assert.ok(html.includes(`id="user-content-fn-${note}"`));
});


test('publication scope includes every current cinema reading and complete image',()=>{
 const coast=JSON.parse(fs.readFileSync(path.join(site,'editions/coast.json'),'utf8'));
 const search=JSON.parse(fs.readFileSync(path.join(site,'editions/search-candidate.json'),'utf8'));
 for(const entry of cinema.articles){
  assert.equal(coast.routes.filter(route=>route===entry.route).length,1,entry.slug+' publication route');
  const decisions=search.pages.filter(page=>page.route===entry.route);
  assert.equal(decisions.length,1,entry.slug+' explicit search decision');
  assert.equal(decisions[0].decision,'hold',entry.slug+' remains outside approved search launch');
  for(const image of entry.images){
   assert.equal(coast.downloads.filter(file=>file===image.file).length,1,entry.slug+' complete image download');
   assert.ok(fs.existsSync(path.join(site,'public',image.file)),entry.slug+' complete image exists');
  }
 }
});

 test('purposeful line drawings appear once without replacing article images',()=>{
 const ids=new Set();for(const item of cinemaNarrative.line_art){assert.ok(!ids.has(item.id));ids.add(item.id);const entry=cinema.articles.find(a=>a.slug===item.slug);const html=cinemaArticle(entry).fullHTML;assert.equal(html.split('data-line-art="'+item.id+'"').length-1,1);assert.equal((html.match(/<figure\b/g)||[]).length,entry.images.length);assert.equal(hash(fs.readFileSync(path.join(root,item.image))),hash(fs.readFileSync(path.join(site,'public',item.public_image))));}
});
