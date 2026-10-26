import fs from 'node:fs';
import path from 'node:path';
import {renderReviewedCultureArticle} from './reviewed-culture-article.mjs';
// Astro bundles this module into a different directory; resolve from the build working directory.
const root=[process.cwd(),path.resolve(process.cwd(),'../..')].find(candidate=>fs.existsSync(path.join(candidate,'kb/research/culture/cinema-series/manifest.json')));
if(!root)throw Error('Cinema sources require the repository or site build working directory');
export const cinema=JSON.parse(fs.readFileSync(path.join(root,'projects/site/src/data/cinema.json'),'utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function picture(image,alt,priority=false){const set=format=>image.derivatives.filter(d=>d.format===format).map(d=>`${d.file} ${d.width}w`).join(', ');const sizes='(max-width: 784px) calc(100vw - 44px), 740px';return `<picture><img src="${image.file}" srcset="${set('jpeg')}" sizes="${sizes}" alt="${escape(alt)}" width="${image.width}" height="${image.height}" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async"></picture>`;}
const knownRoutes={'kb/research/culture/prahallad-nataka.md':'/stories/prahlada-nataka/','kb/research/culture/ashta-nayika.md':'/stories/ashta-nayika/','kb/research/culture/odissi-abhinaya.md':'/stories/odissi-abhinaya/','kb/research/culture/champu-and-sakhi.md':'/literature/champu-and-sakhi/'};
export function cinemaArticle(entry){
 const source=fs.readFileSync(path.join(root,entry.source),'utf8'),images={},imageDimensions={},links={};
 for(const [,url]of source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)){const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(entry.source),url));const image=entry.images.find(i=>i.source===resolved);if(!image)throw Error('Unmapped cinema image '+url);images[url]=image.file;imageDimensions[image.file]={width:image.width,height:image.height};}
 for(const [,url]of source.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)){if(/^(?:[a-z]+:|#|\/)/i.test(url))continue;const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(entry.source),url));const target=cinema.articles.find(a=>a.source===resolved);if(target)links[url]=target.route;else if(knownRoutes[resolved])links[url]=knownRoutes[resolved];}
 const normalized=/^## Footnotes & Sources\s*$/m.test(source)?source:source.replace(/^(\[\^[^\]]+\]:)/m,'## Footnotes & Sources\n\n$1');
 const article=renderReviewedCultureArticle(normalized,{sourcePath:entry.source,route:entry.route,images,imageDimensions,links});
 const hero=entry.images.find(i=>i.role==='title');
 article.html=article.html.replace(new RegExp(`<figure><img[^>]*src="${hero.file.replaceAll('.','\\.')}"[\\s\\S]*?<\\/figure>`),'');
 for(const image of entry.images){const expression=new RegExp(`<img[^>]*src="${image.file.replaceAll('.','\\.')}"[^>]*>`,'g');article.html=article.html.replace(expression,img=>picture(image,img.match(/alt="([^"]*)"/)?.[1]||'',false));}
 const heroHTML=`<figure class="cinema-hero">${picture(hero,entry.hero.alt,true)}<figcaption>${escape(entry.hero.caption||'Editorial illustration; not a film still, historical photograph or reconstruction of a documented scene.')}</figcaption></figure>`;
 const marker='<h2 id="further-reading">Further reading</h2>';
 if(!article.html.includes(marker))throw Error('Missing further reading '+entry.slug);
 const [body,tail]=article.html.split(marker);const sections=[];let cursor=0;
 for(const match of tail.matchAll(/<ul>([\s\S]*?)<\/ul>/g)){
  const prefix=tail.slice(cursor,match.index),heading=prefix.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
  const readingLinks=[...match[1].matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)].map(([,href,title])=>{const target=cinema.articles.find(a=>a.route===href);return {href:href.replaceAll('&amp;','&'),title:title.replace(/<[^>]*>/g,'').replaceAll('&amp;','&'),...(target?{image:target.images.find(i=>i.role==='title').file,description:target.series_intro}:{})};});
  sections.push({before:prefix.replace(heading?.[0]||'',''),heading:heading?.[1]||'Related readings',id:heading?.[0].match(/id="([^"]+)"/)?.[1],links:readingLinks,compactReferences:!readingLinks.some(link=>link.image)});cursor=match.index+match[0].length;
 }
 if(!sections.length)throw Error('Missing further-reading links '+entry.slug);
 let afterReading=tail.slice(cursor);const update=article.html.includes('/contribute/?page=')?'':`<p><strong><a href="/contribute/?page=${encodeURIComponent(entry.route)}">Suggest an update</a></strong>: share a source, film credit or precise correction. GitHub submissions are public; omit private contact details and consent documents.</p>`;afterReading+=update;article.html=heroHTML+body;
 return {article,readingLinks:sections.flatMap(s=>s.links),readingSections:sections,afterReading,hero,fullHTML:heroHTML+body+marker+tail+update};
}
