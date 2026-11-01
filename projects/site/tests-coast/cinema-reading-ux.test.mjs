import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cinema,cinemaNarrative,cinemaArticle,markReviewedOdia} from '../src/lib/cinema-article.mjs';
const read=route=>readFileSync(new URL('../'+(process.env.CINEMA_UX_DIST||'dist-coast')+route+'index.html',import.meta.url),'utf8');
test('every narrative offers its next reading before sources without losing bottom navigation',()=>{
 for(const [index,entry] of cinema.articles.entries()){
  const {article}=cinemaArticle(entry),html=read(entry.route);
  const next=cinema.articles[index+1];
  const onward=article.html.indexOf('class="cinema-narrative-continue"');
  assert.ok(onward>=0,entry.slug);
  assert.ok(onward<article.html.indexOf('<section data-footnotes'),entry.slug);
  if(article.html.includes('class="cinema-image-notes"'))assert.ok(onward<article.html.indexOf('class="cinema-image-notes"'),entry.slug);
  const central=cinemaNarrative.reading_paths.find(path=>path.primary===true).chapters;
  const routeIndex=central.indexOf(entry.slug);
  const expected=routeIndex<0?(next?.route||'/cinema/'):(cinema.articles.find(a=>a.slug===central[routeIndex+1])?.route||'/cinema/reading-guide/#central-reading-route');
  for(const rendered of [article.html,html]){
   const nav=rendered.match(/<nav class="cinema-narrative-continue"[^>]*>[\s\S]*?<\/nav>/)?.[0];
   assert.ok(nav?.includes('href="'+expected+'"'),entry.slug+' intended onward route');
   assert.ok(nav.includes('aria-label="'+(routeIndex>=0?'Central reading route':'Full collection reading sequence')+'"'),entry.slug+' onward accessible name');
  }
  const sequence=html.match(/<nav class="cinema-sequence"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  assert.ok(sequence?.includes('aria-label="Full collection reading sequence"'),entry.slug);
  for(const [direction,target]of [['prev',cinema.articles[index-1]],['next',next]]){
   if(target)assert.ok(sequence.includes('href="'+target.route+'" rel="'+direction+'"'),entry.slug+' full collection '+direction);
   else assert.ok(!sequence.includes('rel="'+direction+'"'),entry.slug+' boundary');
  }
  assert.ok(html.indexOf('<h1>')<html.indexOf('class="cinema-reading-intro"'),entry.slug);
 }
});
test('native citations keep all unique targets and distinguish repeated returns',()=>{
 for(const entry of cinema.articles){
  const {fullHTML}=cinemaArticle(entry);
  const article={html:fullHTML};
  const ids=[...article.html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,entry.slug);
  for(const [anchor,target] of article.html.matchAll(/<a\b[^>]*href="#([^"]+)"[^>]*data-footnote-(?:ref|backref)[^>]*>/g)){
   assert.ok(ids.includes(target),entry.slug+':'+target);
   assert.match(anchor,/aria-label="(?:Source note|Return to citation) \d+/);
  }
  for(const [,target] of article.html.matchAll(/<li id="(user-content-fn-[^"]+)"/g))assert.ok(article.html.includes('id="'+target+'" tabindex="-1"'));
 }
});
test('language labels identify reviewed Odia without assuming script establishes language',()=>{
 assert.equal(markReviewedOdia('<p>ମାୟା ମିରିଗ / ଭୁଖା</p>'),'<p><span lang="or">ମାୟା ମିରିଗ</span> / ଭୁଖା</p>');
 const explicit='<p lang="other"><span>ଦମନ</span> ପ୍ରତୀକ୍ଷା</p>';
 assert.equal(markReviewedOdia(explicit),explicit);
 assert.equal(markReviewedOdia('<a title="ଦମନ">English</a>'),'<a title="ଦମନ">English</a>');
 assert.equal(markReviewedOdia('<code>ଦମନ</code>'),'<code>ଦମନ</code>');
 for(const title of ['ବୋଉ ବୁଟୁ ଭୂତ','କର୍ମ'])assert.ok(cinemaArticle(cinema.articles.find(e=>e.slug==='commercial-successes')).article.html.includes('<span lang="or">'+title+'</span>'));
 const title=cinemaArticle(cinema.articles.find(e=>e.slug==='daman')).article.titleHtml;
 assert.match(title,/<span lang="or">ଦମନ<\/span>/);
});
test('hub provides every named native part shortcut with valid targets',()=>{
 const html=read('/cinema/'),nav=html.match(/<nav[^>]*aria-label="Parts of the cinema collection"[\s\S]*?<\/nav>/)?.[0];
 assert.ok(nav);assert.equal((nav.match(/href="#/g)||[]).length,cinema.parts.length);assert.equal(new Set(cinema.parts.map(p=>p.id)).size,cinema.parts.length);
 for(const part of cinema.parts){assert.ok(nav.includes('href="#'+part.id+'"'));assert.ok(html.includes('id="'+part.id+'"'));}
});
test('current dated downloads and sizes appear before the cover, prior edition remains explicit',()=>{
 const html=read('/cinema/book/');
 for(const book of cinema.review_books){const linkAt=html.indexOf('href="'+book.file+'"');assert.ok(linkAt>=0,book.edition+' download exists');assert.ok(linkAt<html.indexOf('class="book-cover"'));assert.ok(html.includes(book.pages+' pages'));assert.ok(html.includes((book.bytes/1e6).toFixed(1)+' MB'));}
 const formatDate=date=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
 const current=cinema.review_books[0];assert.notEqual(current.status,'local_review_candidate','production coast remains published');
 assert.ok(html.includes('Available PDF edition · '+formatDate(current.edition_date)));assert.ok(html.includes(current.readings+' readings'));
 for(const date of new Set(cinema.archived_review_books.map(book=>book.edition_date)))assert.ok(html.includes('Earlier published edition · '+formatDate(date)));
 assert.ok(html.includes('Earlier published edition · 26 October 2026'));
 for(const book of cinema.archived_review_books){assert.ok(html.includes('href="'+book.file+'"'));assert.ok(!cinema.review_books.some(current=>current.file===book.file));}
 assert.match(html,/not a printer-specific press-ready PDF/);assert.match(html,/not tagged accessibility editions/);
});
