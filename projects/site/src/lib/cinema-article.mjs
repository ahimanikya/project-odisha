import fs from 'node:fs';
import path from 'node:path';
import {renderReviewedCultureArticle} from './reviewed-culture-article.mjs';
// Astro bundles this module into a different directory; resolve from the build working directory.
const root=[process.cwd(),path.resolve(process.cwd(),'../..')].find(candidate=>fs.existsSync(path.join(candidate,'kb/research/culture/cinema-series/manifest.json')));
if(!root)throw Error('Cinema sources require the repository or site build working directory');
export const cinema=JSON.parse(fs.readFileSync(path.join(root,'projects/site/src/data/cinema.json'),'utf8'));
export const cinemaNarrative=JSON.parse(fs.readFileSync(path.join(root,'kb/research/culture/cinema-series/book-narrative-2026-10-27.json'),'utf8'));
export function cinemaRouteEntries(entries=cinema.articles){return entries.filter(entry=>entry.route===`/cinema/${entry.slug}/`);}
const navigationLabels={'the-question-that-brought-me-here':'Why this book','odia-cinema':'Odia cinema','literature-and-screen':'Literature and cinema','air-cuttack':'AIR Cuttack','odia-television':'Odia television','odia-ott':'Odia OTT','commercial-successes':'Commercial successes','cinema-economics':'Cinema economics','cinema-futures':'The road ahead'};
export function cinemaNavigationLabel(entry){return navigationLabels[entry.slug]||entry.title.split(':')[0].trim();}
// Keep a trailing plain-text word and its citation together. Never cross an
// inline element boundary or wrap a whole paragraph/link to prevent reflow.
export function joinCinemaCitations(html){
 return html.replace(/([^\s<>]+?)(?:&#8288;)?[ \t]*((?:<sup><a\b[^>]*data-footnote-ref[^>]*>\d+<\/a><\/sup>)+)/g,
  '<span class="cinema-citation-tail">$1$2</span>');
}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
// Explicitly reviewed Odia titles and quotations. Script alone does not establish language:
// Sambalpuri Bhukha and unreviewed passages deliberately remain unlabelled here.
const odiaReadings=['ଏକା ହାତରେ ତାଳି ବାଜେ ନାହିଁ','ଲହରୀ','ମମତା','କୁଳନନ୍ଦନ','ଆଇ ଲଭ୍ ୟୁ','ଇସ୍କ ତୁ ହି ତୁ','ମୁଁ ଖାଣ୍ଟି ଓଡ଼ିଆ ଝିଅ','ତୁ ମୋ ଲଭ୍ ଷ୍ଟୋରୀ-୨','ଶ୍ରୀ ଶ୍ରୀ ପତିତପାବନ','ଶେଷ ଶ୍ରାବଣ','ଯାଯାବର','ଏଇ ଆମ ସଂସାର','ସୁନା ହରିଣୀ','ଆମର ଏଠି କିଛି ହେବନି','ଆପଣାର ବା ପ୍ରତିବାସୀ ଜାତି ଓ ସମାଜର କଥା ଜାଣିବାର ଦରକାର କ&#39;ଣ ?','ଆପଣାର ବା ପ୍ରତିବାସୀ ଜାତି ଓ ସମାଜର କଥା ଜାଣିବାର ଦରକାର କ\'ଣ ?','ରେବତୀ ପାଖରେ ବସି ଶୁଣୁଥାଏ।','ଆକାଶବାଣୀ କଟକ','ଛମାଣ ଆଠଗୁଣ୍ଠ','ମାୟା ମିରିଗ','ବୋଉ ବୁଟୁ ଭୂତ','କର୍ମ','ପ୍ରତୀକ୍ଷା','ଦମନ','ରେବତୀ','ଅନନ୍ତା','ଲାବଣ୍ୟ ପ୍ରୀତି','ଆଦିମ ବିଚାର','ସୀତା ବିବାହ','ଶୀତ ରାତି','କା','ସ୍ତ୍ରୀ'];
const odiaPattern=new RegExp(odiaReadings.sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gu');
export function markReviewedOdia(html){
 const elements=[];
 return html.split(/(<[^>]+>)/g).map(token=>{
  if(token.startsWith('<')){
   const tag=token.match(/^<(\/?)([a-z][\w-]*)\b/i);
   if(tag){if(tag[1]){const last=elements.map(e=>e.tag).lastIndexOf(tag[2].toLowerCase());if(last>=0)elements.splice(last);}else if(!/^(?:img|br|hr|input|meta|link|source|wbr)$/i.test(tag[2])&&!token.endsWith('/>'))elements.push({tag:tag[2].toLowerCase(),language:/\blang\s*=/.test(token)});}
   return token;
  }
  if(elements.some(e=>e.language||['script','style','code'].includes(e.tag)))return token;
  return token.replace(odiaPattern,(text,offset,whole)=>{
   // Do not mark a short reviewed word inside another word or an unknown phrase.
   if(/[\u0b00-\u0b7f]/.test(whole[offset-1]||'')||/[\u0b00-\u0b7f]/.test(whole[offset+text.length]||''))return text;
   return `<span lang="or">${text}</span>`;
  });
 }).join('');
}
export function picture(image,alt,priority=false){const set=format=>image.derivatives.filter(d=>d.format===format).map(d=>`${d.file} ${d.width}w`).join(', ');const sizes='(max-width: 784px) calc(100vw - 44px), 740px';return `<picture><img src="${image.file}" srcset="${set('jpeg')}" sizes="${sizes}" alt="${escape(alt)}" width="${image.width}" height="${image.height}" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async"></picture>`;}
const imageLayoutPath=path.join(root,'kb/research/culture/cinema-series/image-layout-2026-10-30.json');
export const cinemaImageLayout=JSON.parse(fs.readFileSync(imageLayoutPath,'utf8')).frames;
const placementKeys=cinema.articles.flatMap(entry=>entry.images.map(image=>`${entry.slug}\n${image.source}`));
const frameKeys=cinemaImageLayout.map(frame=>`${frame.slug}\n${frame.source}`);
if(new Set(frameKeys).size!==frameKeys.length||frameKeys.length!==placementKeys.length||placementKeys.some(key=>!frameKeys.includes(key)))throw Error('Cinema image layout must match every source placement exactly once');
function imageFrame(image,slug){return cinemaImageLayout.find(frame=>frame.slug===slug&&frame.source===image?.source);}
export function figureStyle(image,slug){
 const layout=imageFrame(image,slug)?.web;
 const width=layout?layout.width_px===null?'100%':`${layout.width_px}px`:image.height>=image.width?`${Math.min(image.width,600*image.width/image.height)}px`:'100%';
 const ratio=layout?.ratio||[image.width,image.height];
 if(layout&&(!(layout.width_px===null||Number.isFinite(layout.width_px)&&layout.width_px>0)||!['natural','cover'].includes(layout.fit)||ratio.length!==2||ratio.some(n=>!Number.isFinite(n)||n<=0)||layout.position.length!==2||layout.position.some(n=>!Number.isFinite(n)||n<0||n>100)))throw Error('Invalid cinema image layout '+slug);
 return `--cinema-figure-width:${width};--cinema-image-ratio:${ratio[0]} / ${ratio[1]}`+(layout?.fit==='cover'?`;--cinema-image-fit:cover;--cinema-image-position:${layout.position[0]}% ${layout.position[1]}%`:'');
}
function layoutCredit(credit,image,slug){const note=imageFrame(image,slug)?.credit_note;return credit+(note?' '+escape(note):'');}

function heroCaption(entry){
 const caption=escape(entry.hero.caption||'Editorial illustration; not a film still, historical photograph or reconstruction of a documented scene.');
 if(entry.hero.kind!=='documentary')return caption;
 const credit=entry.hero.credit;
 if(!credit?.creator||!credit.source_url||!credit.license||!credit.license_url)throw Error('Missing documentary hero credit '+entry.slug);
 const href=value=>{const url=new URL(value);if(url.protocol!=='https:')throw Error('Documentary credit requires HTTPS '+entry.slug);return escape(url.href);};
 return `<span class="cinema-image-credit">Credit: ${escape(credit.creator)}. <a href="${href(credit.source_url)}">Source</a> · <a href="${href(credit.license_url)}">${escape(credit.license)}</a>${credit.notes?`. ${escape(credit.notes)}`:''}</span>`;
}
const knownRoutes={'kb/research/culture/prahallad-nataka.md':'/stories/prahlada-nataka/','kb/research/culture/ashta-nayika.md':'/stories/ashta-nayika/','kb/research/culture/odissi-abhinaya.md':'/stories/odissi-abhinaya/','kb/research/culture/champu-and-sakhi.md':'/literature/champu-and-sakhi/'};
// Exact maintenance-copy replacements only. Historical dates and source-note records remain intact.
const catalogueMaintenanceCopy=new Map([
 ['Links checked on 26 October 2026. Playback was not tested; territory, account and payment conditions can change.','Availability may vary by region and subscription.'],
 ['These exploration pages were checked in the retained research on 25 October 2026. Audio playback was not tested.',''],
 ['Archive and song links checked on 26 October 2026; clip playback untested.',''],
 ['Restoration page checked on 26 October 2026; clip playback untested.',''],
 ['Listings checked on 26 October 2026.',''],
 ['Catalogue links checked on 26 October 2026.',''],
 ['Programme links were checked on 25 October 2026; the producer catalogue on 26 October 2026. Playback and current account or regional conditions were not tested.','Availability may vary by region and account conditions.'],
 ['- **Provider catalogue: [AAO NXT](https://aaonxt.com/).** Homepage checked on 26 October 2026; login and subscription options were visible.','- **Provider catalogue: [AAO NXT](https://aaonxt.com/).**'],
 ['- **Provider app listing: [Kanccha Lannka on the App Store](https://apps.apple.com/in/app/kanccha-lannka/id1584598214).** Listing checked on 25 October 2026. Descriptions of titles or subtitles do not guarantee access in every location.','- **Provider app listing: [Kanccha Lannka on the App Store](https://apps.apple.com/in/app/kanccha-lannka/id1584598214).** Descriptions of titles or subtitles do not guarantee access in every location.']
]);
// Cinema-only semantics preserve existing H2 anchors and the shared renderer elsewhere.
export function cinemaReadingSemantics(html){
 const used=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 html=html.replace(/<h3>([\s\S]*?)<\/h3>/g,(_,text)=>{
  const base=text.replace(/<[^>]+>/g,'').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-')||'subsection';
  let id=base,n=2;while(used.has(id))id=base+'-'+n++;used.add(id);
  return `<h3 id="${escape(id)}" tabindex="-1">${text}</h3>`;
 });
 const captions=new Map([
  ['Performer|A contribution to follow',['performer-contributions-caption','Selected performers and their contributions']],
  ['Performer|Reported estimate|Date and scope',['performer-estimates-caption','Reported film counts — dated estimates with differing scopes']]
 ]);
 return html.replace(/<div class="article-table"[^>]*><table>([\s\S]*?)<\/table><\/div>/g,(original,table)=>{
  const headers=[...table.matchAll(/<th>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]*>/g,'').trim()).join('|');
  const caption=captions.get(headers);if(!caption)return original;
  const [id,title]=caption;
  const semantic=table.replace(/<th>/g,'<th scope="col">').replace(/<tbody>([\s\S]*?)<\/tbody>/,(_,body)=>`<tbody>${body.replace(/<tr>\s*<td>([\s\S]*?)<\/td>/g,'<tr><th scope="row">$1</th>')}</tbody>`);
  return `<div class="article-table" role="region" aria-labelledby="${id}" tabindex="0"><table><caption id="${id}">${title}</caption>${semantic}</table></div>`;
 });
}
// Optional literary pauses: original article figures and source credits remain untouched.
export function cinemaLineArt(html,slug,items=cinemaNarrative.line_art||[]){
 const selected=items.filter(item=>item.slug===slug);const seen=new Set();
 for(const item of selected){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)||seen.has(item.id))throw Error('Invalid/duplicate line-art ID');seen.add(item.id);
  if(!['before_heading','after_section'].includes(item.placement)||typeof item.heading!=='string')throw Error('Invalid line-art placement '+item.id);
  if(!/^kb\/media\/cinema-series\/literature-care-20261030\/[a-z0-9-]+\.png$/.test(item.image))throw Error('Invalid line-art source '+item.id);
  const bytes=fs.readFileSync(path.join(root,item.image));
  if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Line art must be PNG');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);if(!width||!height)throw Error('Invalid line-art dimensions');
  const file=item.public_image||'/assets/cinema/'+path.basename(item.image);
  if(!/^\/assets\/cinema\/[a-z0-9-]+\.png$/.test(file))throw Error('Invalid line-art public path');
  if(!fs.readFileSync(path.join(root,'projects/site/public',file)).equals(bytes))throw Error('Line-art public copy differs from original');
  const headings=[...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)];
  const matches=headings.filter(h=>h[1].replace(/<[^>]+>/g,'')===escape(item.heading));
  if(matches.length!==1)throw Error('Missing/ambiguous line-art heading '+item.id);
  const heading=matches[0],next=headings[headings.indexOf(heading)+1];
  const at=item.placement==='before_heading'?heading.index:(next?.index??html.length);
  const pt=Number(item.width_pt??144);if(!Number.isFinite(pt)||pt<48||pt>240)throw Error('Invalid line-art width');
  const display=Math.min(pt*4/3,120*width/height,width);
  const block=`<div class="cinema-line-art" data-line-art="${item.id}" style="--line-art-width:${display}px;--line-art-ratio:${width}/${height}"><img src="${escape(file)}" width="${width}" height="${height}" alt="${escape(item.alt||'')}" loading="lazy" decoding="async">${item.caption?`<p class="cinema-line-art-caption">${escape(item.caption)}</p>`:''}</div>`;
  html=html.slice(0,at)+block+html.slice(at);
 }
 return html;
}
export function cinemaArticle(entry){
 let source=fs.readFileSync(path.join(root,entry.source),'utf8');
 source=source.split('\n').map(line=>catalogueMaintenanceCopy.get(line)??line).join('\n');
 const images={},imageDimensions={},links={};
 const callouts=cinemaNarrative.callouts.filter(c=>c.slug===entry.slug);
 for(const c of callouts){
  const target=`## ${c.before_heading}`;
  if(!source.includes(target))throw Error('Missing callback target '+c.id);
  source=source.replace(target,`CINEMACALLOUTSTART${c.id}\n\n${c.text}\n\nCINEMACALLOUTEND${c.id}\n\n${target}`);
 }
 for(const [,url]of source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)){const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(entry.source),url));const image=entry.images.find(i=>i.source===resolved);if(!image)throw Error('Unmapped cinema image '+url);images[url]=image.file;imageDimensions[image.file]={width:image.width,height:image.height};}
 for(const [,url]of source.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)){if(/^(?:[a-z]+:|#|\/)/i.test(url))continue;const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(entry.source),url));const target=cinema.articles.find(a=>a.source===resolved);if(target)links[url]=target.route;else if(knownRoutes[resolved])links[url]=knownRoutes[resolved];}
 const normalized=/^## Footnotes & Sources\s*$/m.test(source)?source:source.replace(/^(\[\^[^\]]+\]:)/m,'## Footnotes & Sources\n\n$1');
 const article=renderReviewedCultureArticle(normalized,{sourcePath:entry.source,route:entry.route,images,imageDimensions,links});
 if(entry.slug==='commercial-successes'){
  article.html=article.html.replace(/<div class="article-table"[^>]*><table>([\s\S]*?)<\/table><\/div>/g,(_,table)=>{
   const captionId='commercial-comparison-caption';
   const semantic=table.replace(/<thead>([\s\S]*?)<\/thead>/,(_,head)=>`<thead>${head.replace(/<th>/g,'<th scope="col">')}</thead>`).replace(/<tbody>([\s\S]*?)<\/tbody>/,(_,body)=>`<tbody>${body.replace(/<tr>\s*<td>([\s\S]*?)<\/td>/g,'<tr><th scope="row">$1</th>')}</tbody>`);
   return `<div class="article-table cinema-comparison" role="region" aria-labelledby="${captionId}" tabindex="0"><table><caption id="${captionId}">Reported Odia film budgets and collections — dated estimates with differing accounting limits</caption>${semantic}</table></div>`;
  });
 }
 if(entry.slug==='odia-cinema'){
  article.html=article.html.replace(/(<h2 id="national-and-international-recognition">[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2\b|$)/,(_,heading,section)=>heading+section.replace(/<div class="article-table"[^>]*><table>([\s\S]*?)<\/table><\/div>/g,(original,table)=>{
   const headers=[...table.matchAll(/<th>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]*>/g,'').trim());
   if(headers.join('|')!=='Film|Recognition|Award year and edition|Filmmakers to explore')return original;
   const captionId='national-awards-caption';
   const semantic=table.replace(/<thead>([\s\S]*?)<\/thead>/,(_,head)=>`<thead>${head.replace(/<th>/g,'<th scope="col">')}</thead>`).replace(/<tbody>([\s\S]*?)<\/tbody>/,(_,body)=>`<tbody>${body.replace(/<tr>\s*<td>([\s\S]*?)<\/td>/g,'<tr><th scope="row">$1</th>')}</tbody>`);
   return `<div class="article-table cinema-recognition" role="region" aria-labelledby="${captionId}" tabindex="0"><table><caption id="${captionId}">Selected National Film Awards in this series — award years, not release dates</caption>${semantic}</table></div>`;
  }));
 }
 article.html=cinemaReadingSemantics(article.html);
 article.headings=[...article.html.split('<h2 id="further-reading">')[0].matchAll(/<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(([,level,id,title])=>({title:title.replace(/<[^>]+>/g,'').replaceAll('&amp;','&'),href:'#'+id,level:Number(level)})).filter(h=>h.href!=='#footnote-label');
 const hero=entry.images.find(i=>i.role==='title');
 article.html=article.html.replace(new RegExp(`<figure><img[^>]*src="${hero.file.replaceAll('.','\\.')}"[\\s\\S]*?<\\/figure>`),'');
 for(const image of entry.images){const expression=new RegExp(`<img[^>]*src="${image.file.replaceAll('.','\\.')}"[^>]*>`,'g');article.html=article.html.replace(expression,img=>picture(image,img.match(/alt="([^"]*)"/)?.[1]||'',false));}
 const imageCredits=[];
 const proseNoteCount=(article.html.match(/<li id="user-content-fn-[^"]+"/g)||[]).length;
 const creditRef=(credit)=>{
  const index=imageCredits.push(credit),n=proseNoteCount+index;
  return `<sup><a href="#user-content-fn-cinema-image-${index}" id="user-content-fnref-cinema-image-${index}" data-footnote-ref aria-describedby="footnote-label" aria-label="Source note ${n}">${n}</a></sup>`;
 };
 let heroDescription=escape(entry.hero.caption||'Illustration.');
 if(entry.hero.kind==='documentary')heroDescription+=' '+creditRef(layoutCredit(heroCaption(entry),hero,entry.slug));
 if(entry.hero.kind==='supplied-portrait')heroDescription+=' '+creditRef(escape(entry.hero.credit_note));
 article.html=article.html.replace(/<figure>([\s\S]*?)<figcaption>([\s\S]*?)<\/figcaption><\/figure>/g,(whole,image,caption)=>{
  if(!/Photo:|Wikimedia Commons|Digitisation:/.test(caption))return whole;
  const description=caption.split(/(?<=\.)\s/)[0];
  return `<figure>${image}<figcaption>${description} ${creditRef(layoutCredit(caption,entry.images.find(i=>image.includes(`src="${i.file}"`)),entry.slug))}</figcaption></figure>`;
 });
 for(const c of callouts){
  const start=`<p>CINEMACALLOUTSTART${c.id}</p>`,end=`<p>CINEMACALLOUTEND${c.id}</p>`;
  if(!article.html.includes(start)||!article.html.includes(end))throw Error('Callback render failed '+c.id);
  article.html=article.html.replace(start,`<aside class="cinema-callback" aria-labelledby="${c.id}-label"><p class="cinema-callback-label" id="${c.id}-label">${c.kind==='fact'?'A detail to remember':'A thread to follow'}</p>`).replace(end,'</aside>');
 }
 if(imageCredits.length){
  if(!/<section data-footnotes[\s\S]*?<\/ol>/.test(article.html))throw new Error(`Missing source footnote list for image credits: ${entry.slug}`);
  const notes=imageCredits.map((credit,i)=>`<li id="user-content-fn-cinema-image-${i+1}" value="${proseNoteCount+i+1}"><p>${credit} <a href="#user-content-fnref-cinema-image-${i+1}" data-footnote-backref aria-label="Back to reference ${proseNoteCount+i+1}" class="data-footnote-backref">↩</a></p></li>`).join('');
  article.html=article.html.replace(/(<section data-footnotes[\s\S]*?)(<\/ol>)/,(_,body,close)=>body+notes+close);
 }

 article.html=article.html.replace(/<figure>([\s\S]*?)<\/figure>/g,(_,body)=>{
  const src=body.match(/<img[^>]*src="([^"]+)"/)?.[1],image=entry.images.find(i=>i.file===src);
  if(!image)throw Error('Missing figure dimensions '+entry.slug);
  return `<figure style="${figureStyle(image,entry.slug)}">${body}</figure>`;
 });
 article.html=article.html.replace(/<picture>([\s\S]*?)<\/picture>/g,(whole,img)=>{const src=img.match(/src="([^"]+)"/)?.[1];return src?`<a class="cinema-full-image" href="${src}" aria-label="View complete image">${whole}</a>`:whole;});
 const portrait=hero.height>hero.width;
 const heroHTML=joinCinemaCitations(`<figure class="cinema-hero${portrait?' cinema-hero-portrait':''}" style="${figureStyle(hero,entry.slug)}"><a class="cinema-full-image" href="${hero.file}" aria-label="View complete image">${picture(hero,entry.hero.alt,true)}</a><figcaption>${heroDescription}</figcaption></figure>`);
 const next=cinema.articles[cinema.articles.findIndex(a=>a.slug===entry.slug)+1];
 const onward=next?`<nav class="cinema-narrative-continue" aria-label="Continue this reading journey"><a href="${escape(next.route)}" rel="next">Continue reading: ${escape(cinemaNavigationLabel(next))} <span aria-hidden="true">→</span></a></nav>`:`<nav class="cinema-narrative-continue" aria-label="Continue exploring"><a href="/cinema/">Explore all cinema readings <span aria-hidden="true">→</span></a></nav>`;
 article.html=article.html.replace(/(?=<section (?:class="cinema-image-notes"|data-footnotes))/,onward);
 article.html=article.html.replace(/<a\b([^>]*data-footnote-ref[^>]*)>(\d+)<\/a>/g,(_,attrs,n)=>`<a${attrs}${attrs.includes('aria-label=')?'':` aria-label="Source note ${n}"`}>${n}</a>`);
 article.html=article.html.replace(/aria-label="Back to reference (\d+)(?:-(\d+))?"/g,(_,n,occurrence)=>`aria-label="Return to citation ${n}${occurrence?', occurrence '+occurrence:''}"`);
 article.html=article.html.replace(/<li id="(user-content-fn-[^"]+)"/g,'<li id="$1" tabindex="-1"');
 article.html=joinCinemaCitations(article.html);
 article.html=cinemaLineArt(article.html,entry.slug);
 article.html=markReviewedOdia(article.html);
 article.titleHtml=markReviewedOdia(escape(article.title));
 const marker='<h2 id="further-reading">Further reading</h2>';
 if(!article.html.includes(marker))throw Error('Missing further reading '+entry.slug);
 const [body,tail]=article.html.split(marker);const sections=[];let cursor=0;
 for(const match of tail.matchAll(/<ul>([\s\S]*?)<\/ul>/g)){
  const prefix=tail.slice(cursor,match.index),heading=prefix.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
  const readingLinks=[...match[1].matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)].map(([,href,title])=>{const target=cinema.articles.find(a=>a.route===href);return {href:href.replaceAll('&amp;','&'),title:title.replace(/<[^>]*>/g,'').replaceAll('&amp;','&'),...(target?{image:target.card_image||target.images.find(i=>i.role==='title').file,description:target.series_intro,imagePosition:target.card_image_position}:{})};});
  sections.push({before:prefix.replace(heading?.[0]||'',''),heading:heading?.[1]||'Related readings',id:heading?.[0].match(/id="([^"]+)"/)?.[1],links:readingLinks,compactReferences:!readingLinks.some(link=>link.image)});cursor=match.index+match[0].length;
 }
 if(!sections.length)throw Error('Missing further-reading links '+entry.slug);
 let afterReading=tail.slice(cursor);const update=article.html.includes('/contribute/?page=')?'':`<p><strong><a href="/contribute/?page=${encodeURIComponent(entry.route)}">Suggest an update</a></strong>: share a source, film credit or precise correction. GitHub submissions are public; omit private contact details and consent documents.</p>`;afterReading+=update;article.html=markReviewedOdia(heroHTML)+body;
 return {article,readingLinks:sections.flatMap(s=>s.links),readingSections:sections,afterReading,hero,fullHTML:markReviewedOdia(heroHTML)+body+marker+tail+update};
}
