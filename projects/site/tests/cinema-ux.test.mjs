import test from 'node:test';
import assert from 'node:assert/strict';
import {cinema,cinemaNarrative,cinemaArticle,cinemaOnward,cinemaTailArt,cinemaLabelHtml,cinemaLinkTitle,cinemaPreviewNote} from '../src/lib/cinema-article.mjs';

test('central route continues through all ten destinations without changing full collection order',()=>{
 const primary=cinemaNarrative.reading_paths.find(p=>p.primary);
 assert.equal(primary.chapters.length,10);
 for(const [i,slug] of primary.chapters.entries()){
  const entry=cinema.articles.find(a=>a.slug===slug),onward=cinemaOnward(entry);
  assert.equal(onward.href,i<9?cinema.articles.find(a=>a.slug===primary.chapters[i+1]).route:'/cinema/reading-guide/#central-reading-route');
  assert.equal(onward.aria,'Central reading route');
  assert.ok(cinemaArticle(entry).article.html.includes(onward.href));
 }
 for(const [i,entry] of cinema.articles.entries())if(!primary.chapters.includes(entry.slug)){
  assert.equal(cinemaOnward(entry).href,cinema.articles[i+1]?.route||'/cinema/');
  assert.equal(cinemaOnward(entry).aria,'Full collection reading sequence');
 }
});
test('only the headingless introduction opts out of the narrative contents disclosure',()=>{
 assert.deepEqual(cinema.articles.filter(entry=>cinemaArticle(entry).article.hideContents).map(a=>a.slug),['the-question-that-brought-me-here']);
});
test('approved ending drawings appear exactly once before viewing links or onward navigation, preserving figures and credit notes',()=>{
 for(const entry of cinema.articles){
  const {article}=cinemaArticle(entry),html=article.html,item=cinemaNarrative.book_tail_vignettes.find(v=>v.slug===entry.slug);
  assert.equal((html.match(/cinema-ending-art/g)||[]).length,item?1:0,entry.slug);
  assert.equal((html.match(/<figure\b/g)||[]).length,entry.images.length,entry.slug);
  if(item){
   const art=html.indexOf('cinema-ending-art'),watch=html.search(/<h2\b[^>]*>Watch(?: and explore| an official introduction)<\/h2>/);
   const onward=html.indexOf('<nav class="cinema-narrative-continue"');
   if(item.web_placement==='before-continue'){
    if(watch>=0)assert.ok(watch<art,'Ending drawing follows viewing section');
    if(entry.slug==='pratikshya')assert.ok(html.lastIndexOf('href="/cinema/cinema-economics/',art)>=0,'Economics link precedes drawing');
    assert.match(html.slice(art,onward), /<\/div>$/,'Drawing immediately precedes Continue');
   }else {assert.equal(item.web_placement,'before-watch');assert.ok(art<watch,'Configured drawing precedes Watch');}
   assert.ok(art<onward);
   assert.ok(html.includes(item.alt));assert.ok(html.includes(item.caption));
   assert.throws(()=>cinemaTailArt(html,entry.slug,[{...item,web_placement:'elsewhere'}]),/Invalid ending drawing placement/);
   assert.throws(()=>cinemaTailArt(html,entry.slug,[{...item,image:'kb/media/cinema-series/unapproved/example.png'}]),/Invalid ending drawing source/);
  }
 }
});

test('shared-story closes the final invitation before onward navigation',()=>{
 const entry=cinema.articles.find(a=>a.slug==='cinema-futures');
 const item=cinemaNarrative.line_art.find(a=>a.id==='shared-story');
 assert.equal(item.placement,'after_section');
 const html=cinemaArticle(entry).article.html;
 const heading=html.indexOf('id="begin-with-the-next-encounter"');
 const art=html.indexOf('data-line-art="shared-story"');
 const onward=html.indexOf('<nav class="cinema-narrative-continue"');
 assert.ok(heading>=0&&heading<art&&art<onward);
 assert.ok(html.slice(heading,art).includes('</p>'),'Closing invitation precedes drawing');
 assert.match(html.slice(art,onward), /<\/div>$/,'No navigation is included in the narrative section');
});

test('reviewed Odia titles retain language while cinema links escape content and attach only the final word to arrows',()=>{
 for(const title of ['ଅମଡ଼ା ବାଟ','ମାଟିର ମଣିଷ','ଶ୍ରୀଜଗନ୍ନାଥ'])assert.equal(cinemaLabelHtml(title),`<span lang="or">${title}</span>`);
 assert.equal(cinemaLabelHtml('ଭୂଖା'),'ଭୂଖା','Sambalpuri is not inferred to be Odia from script');
 const link=cinemaLinkTitle('ମାଟିର ମଣିଷ (Matira Manisha)');
 assert.match(link,/<span lang="or">ମାଟିର ମଣିଷ<\/span>/);
 assert.match(link,/white-space:nowrap">Manisha\) <span aria-hidden="true">→/);
 assert.ok(!cinemaLinkTitle('<img src=x onerror=alert(1)>').includes('<img'));
});
test('only the two reviewed imagined actor scenes receive concise preview labels',()=>{
 assert.deepEqual(cinema.articles.filter(a=>cinemaPreviewNote(a)).map(a=>[a.slug,cinemaPreviewNote(a)]),[['uttam-mohanty','Imagined rehearsal'],['aparajita-mohanty','Imagined script discussion']]);
 const overview=cinemaArticle(cinema.articles.find(a=>a.slug==='odia-cinema'));
 for(const slug of ['uttam-mohanty','aparajita-mohanty']){
  const entry=cinema.articles.find(a=>a.slug===slug),link=overview.readingLinks.find(a=>a.href===entry.route);
  if(link)assert.equal(link.imageNote,cinemaPreviewNote(entry));
 }
});
