import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cinema,cinemaArticle} from '../src/lib/cinema-article.mjs';
const read=route=>readFileSync(new URL('../'+(process.env.CINEMA_UX_DIST||'dist-coast')+route+'index.html',import.meta.url),'utf8');
test('all cinema figures preserve native dimensions and source associations with natural figure geometry',()=>{
 let placements=0;
 for(const entry of cinema.articles){
  const {article}=cinemaArticle(entry),figures=[...article.html.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g)];
  placements+=figures.length;
  for(const [,attributes,figure]of figures){
   assert.match(figure,/<picture><img/);assert.match(figure,/<figcaption>/);
   const src=figure.match(/<img[^>]*src="([^"]+)"/)[1];const image=entry.images.find(i=>i.file===src);assert.ok(image,entry.slug);
   assert.ok(figure.includes(`width="${image.width}" height="${image.height}"`));
   const expected=image.height>=image.width?`${Math.min(image.width,600*image.width/image.height)}px`:'100%';
   assert.ok(attributes.includes(`--cinema-figure-width:${expected}`),entry.slug);
   assert.ok(attributes.includes(`--cinema-image-ratio:${image.width} / ${image.height}`),entry.slug);
   if(image.height>=image.width)assert.ok(Math.min(image.width,600*image.width/image.height)/image.width*image.height<=600.0001);
  }
  const html=read(entry.route);assert.match(html,/cinema-reader/);
  for(const block of html.matchAll(/<section\b[^>]*class="([^"]*article-reading-path[^"]*)"/g)){assert.match(block[1],/uniform-images/);assert.doesNotMatch(block[1],/contain-images/);};
 }
 assert.equal(placements,cinema.articles.reduce((count,entry)=>count+entry.images.length,0));
});
test('cinema cards use cropped preview frames while article images retain full sources',()=>{
 const hub=read('/cinema/');
 for(const block of hub.matchAll(/<section\b[^>]*class="([^"]*article-reading-path[^"]*)"/g)){assert.match(block[1],/uniform-images/);assert.doesNotMatch(block[1],/contain-images/);};
 assert.doesNotMatch(read('/literature/'),/contain-images/);
});
