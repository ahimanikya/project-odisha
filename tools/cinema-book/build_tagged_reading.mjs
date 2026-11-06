// A separate semantic reading proof; preserve the existing typeset print edition.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {cinema,cinemaArticle,cinemaNarrative} from '../../projects/site/src/lib/cinema-article.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'/Users/ahimanikya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const tmp=path.join(root,'tmp/pdfs/tagged-20261101');
const reportDir=path.join(root,'outputs/cinema-tagged-reading-20261101');fs.mkdirSync(reportDir,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');fs.mkdirSync(tmp,{recursive:true});
const entries=Object.fromEntries(cinema.articles.map(a=>[a.slug,a]));
const chapter=(slug)=>{const entry=entries[slug],{article,fullHTML}=cinemaArticle(entry);let content=fullHTML;
 // Preserve native figure/figcaption, table and reviewed language semantics.
 content=content.replace(/<nav class="cinema-narrative-continue"[\s\S]*?<\/nav>/g,'');
 // Scope every fragment, reference and ARIA relationship to its chapter.
 content=content.replace(/\bid="([^"]+)"/g,(_,id)=>`id="${slug}--${id}"`).replace(/\bhref="#([^"]+)"/g,(_,id)=>`href="#${slug}--${id}"`).replace(/\b(aria-labelledby|aria-describedby)="([^"]+)"/g,(_,attr,ids)=>`${attr}="${ids.split(' ').map(id=>slug+'--'+id).join(' ')}"`);
 content=content.replace(/<(\/?)(h[2-4])\b/g,(_,slash,h)=>`<${slash}h${Number(h[1])+2}`);
 content=content.replace(/\s(?:srcset|sizes|loading|fetchpriority|decoding)="[^"]*"/g,'').replace(/\bsrc="(\/[^\"]+)"/g,(_,src)=>`src="${pathToFileURL(path.join(root,'projects/site/public',src)).href}"`);
 return `<section class="chapter" data-slug="${slug}" id="ch-${slug}"><h3>${article.titleHtml||escape(article.title)}</h3>${content}</section>`;
};
const contents=cinema.parts.map((p,i)=>`<li><a href="#part-${i+1}">${escape(p.title)}</a><ol>${p.chapters.map(s=>`<li><a href="#ch-${s}">${escape(entries[s].title)}</a></li>`).join('')}</ol></li>`).join('');
let body=cinema.parts.map((p,i)=>`<section class="part" id="part-${i+1}"><h2>${escape(p.title)}</h2>${p.intro?`<p>${escape(p.intro)}</p>`:''}${p.chapters.map(chapter).join('')}</section>`).join('');
for(const entry of cinema.articles){body=body.replaceAll(`href="${entry.route}"`,`href="#ch-${entry.slug}"`);}
body=body.replace(/href="(\/[^\"]+)"/g,(_,url)=>`href="https://projectodisha.org${url}"`);
const font=name=>pathToFileURL(path.join(root,'tools/cinema-book/fonts',name)).href;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Odia Cinema: A Living Screen — reading proof · 1 November 2026</title><style>
@font-face{font-family:Book;src:url('${font('SourceSerif4-Regular.ttf')}')}@font-face{font-family:Book;src:url('${font('SourceSerif4-Bold.ttf')}');font-weight:700}@font-face{font-family:Book;src:url('${font('SourceSerif4-It.ttf')}');font-style:italic}@font-face{font-family:Odia;src:url('${font('NotoSerifOriya-Regular.ttf')}')}
@page{size:A4;margin:20mm 20mm 22mm}body{font:11.5pt/1.55 Book,Odia,serif;color:#202720;margin:0}h1{font-size:29pt}h2{font-size:23pt}h3{font-size:19pt}h4{font-size:14pt}h5{font-size:12pt}h1,h2,h3,h4,h5,h6{line-height:1.25;break-after:avoid;break-inside:avoid}p{orphans:3;widows:3;margin:0 0 11pt}.part,.contents{break-before:page}.chapter{margin-top:24pt}.part>.chapter:first-of-type{margin-top:0}.title-page{min-height:230mm}a{color:#6f3028;text-decoration:underline}.cinema-hero{break-inside:avoid;margin:16pt 0}img{display:block;max-width:100%;height:auto;max-height:95mm;object-fit:contain;margin:auto}figure{break-inside:avoid;margin:14pt auto;max-width:100%;width:fit-content}figure img{width:auto;max-width:100%;height:auto;max-height:95mm;object-fit:contain}figcaption{font-size:9pt;margin-top:6pt;max-width:135mm}.cinema-line-art,.cinema-tail-art{max-width:65mm}.cinema-line-art img,.cinema-tail-art img{max-height:40mm}li{margin-bottom:6pt}table{border-collapse:collapse;font-size:9pt;width:100%;table-layout:fixed}th,td{border-bottom:1px solid #ccc;padding:7pt;vertical-align:top;overflow-wrap:anywhere}caption{text-align:left;font-weight:bold;margin-bottom:8pt}thead{display:table-header-group}tr{break-inside:avoid}.cinema-callback{border-left:3pt solid #a66b49;padding:10pt 14pt;margin:18pt 0}.cinema-callback-label{font-weight:bold}[data-footnotes]{font-size:9.5pt;line-height:1.4;overflow-wrap:anywhere}[data-footnotes] li{margin-bottom:4pt}[data-footnotes] p{margin-bottom:3pt}.cinema-table-scroll{overflow:visible}.cinema-citation-tail{white-space:normal}sup{font-size:8pt}[lang=or]{font-family:Odia,serif}
</style></head><body><header class="title-page"><h1>Odia Cinema: A Living Screen</h1><p>Ahimanikya Satapathy</p><p>Stories, people and the possibilities ahead.</p><p>Reading proof · 1 November 2026</p><p>This reading edition gathers ${cinema.articles.length} articles in ${cinema.parts.length} parts.</p><p><a href="https://projectodisha.org/cinema/">Project Odisha · Cinema</a></p></header><nav class="contents" aria-label="Contents"><h2>Contents</h2><ol>${contents}</ol></nav><main>${body}</main></body></html>`;
const file=path.join(tmp,'reading.html');fs.writeFileSync(file,html);
const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{const page=await browser.newPage();await page.route('http://**/*',r=>r.abort());await page.route('https://**/*',r=>r.abort());await page.goto(pathToFileURL(file).href);await page.evaluate(()=>document.fonts.ready);
 const transformation=await page.evaluate(({omissions,routes})=>{
  const removed=[],relatedReadingOmissions=[];
  for(const item of omissions){
   const chapter=document.querySelector(`[data-slug="${item.slug}"]`);
   const headings=[...chapter.querySelectorAll('h4,h5,h6')].filter(h=>h.textContent.trim()===item.heading);
   if(headings.length!==1)throw Error('Omission must match once: '+item.slug);
   const heading=headings[0],level=Number(heading.tagName.slice(1));let node=heading;const texts=[];
   while(node){if(node!==heading&&((/^H[1-6]$/.test(node.tagName)&&Number(node.tagName.slice(1))<=level)||[...node.querySelectorAll('h1,h2,h3,h4,h5,h6')].some(h=>Number(h.tagName.slice(1))<=level)))break;const next=node.nextElementSibling;texts.push(node.textContent);node.remove();node=next;}
   document.getElementById(item.slug+'--'+item.preceding_anchor)?.remove();removed.push({slug:item.slug,heading:item.heading,text:texts.join('\n')});
  }
  // Match the visual book's omission of website-only related-reading endings.
  for(const chapter of document.querySelectorAll('section.chapter')){
   const headings=[...chapter.querySelectorAll('h4')].filter(h=>h.textContent.trim()==='Further reading');
   if(headings.length>1)throw Error('Duplicate Further reading heading: '+chapter.dataset.slug);
   if(!headings.length)continue;
   let node=headings[0];const texts=[];let links=0;
   while(node){const next=node.nextElementSibling;
    if(node.matches('[data-footnotes]')||node.querySelector('[data-footnotes]'))throw Error('Related-reading omission would remove source notes');
    // A cited prose paragraph after the related links remains: its note and return are substantive.
    if(node.querySelector('[data-footnote-ref]')){node=next;continue;}
    texts.push(node.textContent);links+=node.querySelectorAll('a[href]').length;node.remove();node=next;
   }
   relatedReadingOmissions.push({slug:chapter.dataset.slug,heading:'Further reading',links,text:texts.join('\n')});
  }
  for(const node of document.querySelectorAll('.cinema-tail-art,.cinema-line-art')){if(node.tagName!=='FIGURE'){const figure=document.createElement('figure');for(const attr of node.attributes)figure.setAttribute(attr.name,attr.value);while(node.firstChild)figure.append(node.firstChild);node.replaceWith(figure);}}
  for(const node of document.querySelectorAll('figure .cinema-line-art-caption')){const caption=document.createElement('figcaption');caption.className=node.className;while(node.firstChild)caption.append(node.firstChild);node.replaceWith(caption);}
  document.querySelectorAll('iframe,script,.cinema-short-route,.cinema-narrative-continue').forEach(n=>n.remove());
  for(const paragraph of document.querySelectorAll('.chapter p')){if(paragraph.querySelector('a')?.textContent.trim()==='Suggest an update')paragraph.remove();}
  // Route-plus-fragment links point to the corresponding scoped destination.
  for(const a of document.querySelectorAll('a[href]')){
   const value=a.getAttribute('href');if(value.startsWith('#'))continue;
   try{const u=new URL(value,'https://projectodisha.org');if(u.origin==='https://projectodisha.org'&&routes[u.pathname])a.setAttribute('href',u.hash?'#'+routes[u.pathname]+'--'+decodeURIComponent(u.hash.slice(1)):'#ch-'+routes[u.pathname]);}catch{}
  }
  return {removed,relatedReadingOmissions};
 },{omissions:cinemaNarrative.book_section_omissions||[],routes:Object.fromEntries(cinema.articles.map(a=>[a.route,a.slug]))});
 const check=await page.evaluate(()=>{
  const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
  const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>({level:Number(h.tagName[1]),text:h.textContent}));
  return {images:[...document.images].map(i=>({alt:i.getAttribute('alt'),loaded:i.complete&&i.naturalWidth>0,src:i.src,figure:!!i.closest('figure'),caption:!!i.closest('figure')?.querySelector('figcaption'),lineArt:!!i.closest('.cinema-line-art,.cinema-tail-art')})),duplicateIds:[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))],brokenFragments:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),odiaPassages:[...document.querySelectorAll('[lang=or]')].map(n=>({text:n.textContent,id:n.closest('[id]')?.id})),tables:[...document.querySelectorAll('table')].map(t=>({caption:!!t.caption,headers:[...t.querySelectorAll('th')].map(h=>h.scope)})),headings,headingSkips:headings.filter((h,i)=>i&&h.level>headings[i-1].level+1),chapters:document.querySelectorAll('section.chapter').length,parts:document.querySelectorAll('section.part').length,webControls:document.querySelectorAll('iframe,.cinema-narrative-continue,.cinema-short-route').length};
 });
 fs.writeFileSync(path.join(reportDir,'source-check.json'),JSON.stringify(check,null,2));
 if(check.images.some(i=>!i.loaded||i.alt===null||!i.figure||(!i.caption&&!i.lineArt))||check.duplicateIds.length||check.brokenFragments.length||check.headingSkips.length||check.tables.some(t=>!t.caption||t.headers.some(s=>!['row','col','rowgroup','colgroup'].includes(s)))||check.chapters!==cinema.articles.length||check.parts!==cinema.parts.length||check.webControls)throw Error('Source validation failed; see source-check.json');
 fs.writeFileSync(file,await page.content());
 const output=path.join(root,'output/pdf/odia-cinema-tagged-reading-proof-2026-11-01.pdf');await page.pdf({path:output,tagged:true,outline:true,preferCSSPageSize:true,printBackground:true});
 const assets=[...new Set(check.images.map(i=>fileURLToPath(i.src)))].map(p=>({path:path.relative(root,p),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size}));
 const fonts=['SourceSerif4-Regular.ttf','SourceSerif4-Bold.ttf','SourceSerif4-It.ttf','NotoSerifOriya-Regular.ttf','NotoSerifOriya-OFL.txt'].map(name=>{const p=path.join(root,'tools/cinema-book/fonts',name);return {path:path.relative(root,p),sha256:hash(fs.readFileSync(p))};});
 const report={output,sha256:hash(fs.readFileSync(output)),bytes:fs.statSync(output).size,browser:browser.version(),check,parts:cinema.parts,omissions:transformation.removed.map(o=>({...o,sha256:hash(o.text)})),related_reading_omissions:transformation.relatedReadingOmissions.map(o=>({...o,sha256:hash(o.text)})),assets,fonts,chapters:cinema.articles.map(a=>({slug:a.slug,source:a.source,sha256:hash(fs.readFileSync(path.join(root,a.source)))})),status:'draft_requires_PDF_structure_visual_and_assistive_technology_review',limitations:['HTML checks are not PDF semantic conformance.','No PDF/UA certification.','No guarantee lang=or survived conversion; inspect decoded marked content and inherited PDF language.','No manual screen-reader or full reading-order validation.','Separate A4 reading proof; published visual editions unchanged.'],publication:false};
 fs.writeFileSync(path.join(reportDir,'build.json'),JSON.stringify(report,null,2)+'\n');console.log(output);

}finally{await browser.close();}
