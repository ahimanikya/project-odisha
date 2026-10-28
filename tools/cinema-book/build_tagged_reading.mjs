// A separate semantic reading proof; preserve the existing typeset print edition.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {cinema,cinemaArticle} from '../../projects/site/src/lib/cinema-article.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'/Users/ahimanikya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const tmp=path.join(root,'tmp/pdfs/tagged');fs.mkdirSync(tmp,{recursive:true});
const entries=Object.fromEntries(cinema.articles.map(a=>[a.slug,a]));
const chapter=(slug)=>{const entry=entries[slug],{article,fullHTML}=cinemaArticle(entry);let content=fullHTML;
 content=content.replace(/<figure\b/g,'<div').replaceAll('</figure>','</div>').replaceAll('<figcaption>','<p class="image-caption">').replaceAll('</figcaption>','</p>');
 content=content.replace(/<nav class="cinema-narrative-continue"[\s\S]*?<\/nav>/g,'');
 // Scope every fragment, reference and ARIA relationship to its chapter.
 content=content.replace(/\bid="([^"]+)"/g,(_,id)=>`id="${slug}--${id}"`).replace(/\bhref="#([^"]+)"/g,(_,id)=>`href="#${slug}--${id}"`).replace(/\b(aria-labelledby|aria-describedby)="([^"]+)"/g,(_,attr,ids)=>`${attr}="${ids.split(' ').map(id=>slug+'--'+id).join(' ')}"`);
 content=content.replace(/<(\/?)(h[2-4])\b/g,(_,slash,h)=>`<${slash}h${Number(h[1])+2}`);
 content=content.replace(/\s(?:srcset|sizes|loading|fetchpriority|decoding)="[^"]*"/g,'').replace(/\bsrc="(\/[^\"]+)"/g,(_,src)=>`src="${pathToFileURL(path.join(root,'projects/site/public',src)).href}"`);
 return `<section class="chapter" id="ch-${slug}"><h3>${article.titleHtml||escape(article.title)}</h3>${content}</section>`;
};
const contents=cinema.parts.map((p,i)=>`<li><a href="#part-${i+1}">${escape(p.title)}</a><ol>${p.chapters.map(s=>`<li><a href="#ch-${s}">${escape(entries[s].title)}</a></li>`).join('')}</ol></li>`).join('');
let body=cinema.parts.map((p,i)=>`<section class="part" id="part-${i+1}"><h2>${escape(p.title)}</h2>${p.intro?`<p>${escape(p.intro)}</p>`:''}${p.chapters.map(chapter).join('')}</section>`).join('');
for(const entry of cinema.articles){body=body.replaceAll(`href="${entry.route}"`,`href="#ch-${entry.slug}"`);}
body=body.replace(/href="(\/[^\"]+)"/g,(_,url)=>`href="https://projectodisha.org${url}"`);
const font=name=>pathToFileURL(path.join(root,'tools/cinema-book/fonts',name)).href;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Odia Cinema: A Living Screen — tagged reading proof</title><style>
@font-face{font-family:Book;src:url('${font('SourceSerif4-Regular.ttf')}')}@font-face{font-family:Book;src:url('${font('SourceSerif4-Bold.ttf')}');font-weight:700}@font-face{font-family:Book;src:url('${font('SourceSerif4-It.ttf')}');font-style:italic}@font-face{font-family:Odia;src:url('${pathToFileURL(path.join(root,'tmp/pdfs/fonts/NotoSerifOriya-Regular.ttf')).href}')}
@page{size:A4;margin:20mm 20mm 22mm}body{font:11.5pt/1.55 Book,Odia,serif;color:#202720;margin:0}h1{font-size:29pt}h2{font-size:23pt}h3{font-size:19pt}h4{font-size:14pt}h5{font-size:12pt}h1,h2,h3,h4,h5,h6{line-height:1.25;break-after:avoid}p{orphans:3;widows:3;margin:0 0 11pt}.part,.chapter,.contents{break-before:page}.part>.chapter:first-of-type{break-before:auto}.title-page{min-height:230mm}a{color:#6f3028;text-decoration:underline}.cinema-hero{break-inside:avoid;margin:16pt 0}img{display:block;max-width:100%;height:auto;max-height:95mm;object-fit:contain;margin:auto}.image-caption{font-size:9pt;margin-top:6pt}li{margin-bottom:6pt}table{border-collapse:collapse;font-size:9pt;width:100%;table-layout:fixed}th,td{border-bottom:1px solid #ccc;padding:7pt;vertical-align:top;overflow-wrap:anywhere}caption{text-align:left;font-weight:bold;margin-bottom:8pt}thead{display:table-header-group}tr{break-inside:avoid}.cinema-callback{border-left:3pt solid #a66b49;padding:10pt 14pt;margin:18pt 0}.cinema-callback-label{font-weight:bold}.footnotes,.cinema-image-notes{font-size:9.5pt;overflow-wrap:anywhere}sup{font-size:8pt}[lang=or]{font-family:Odia,serif}
</style></head><body><header class="title-page"><h1>Odia Cinema: A Living Screen</h1><p>Ahimanikya Satapathy</p><p>Stories, people and the possibilities ahead.</p><p>Tagged reading proof · 27 October 2026</p><p>This companion gathers the full twenty-eight website readings in their five-part sequence. The typeset digital and print books remain separate editions. Structure and assistive-technology review are in progress.</p><p><a href="https://projectodisha.org/cinema/">Project Odisha · Cinema</a></p></header><nav class="contents" aria-label="Contents"><h2>Contents</h2><ol>${contents}</ol></nav><main>${body}</main></body></html>`;
const file=path.join(tmp,'reading.html');fs.writeFileSync(file,html);
const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{const page=await browser.newPage();await page.route('http://**/*',r=>r.abort());await page.route('https://**/*',r=>r.abort());await page.goto(pathToFileURL(file).href);await page.evaluate(()=>document.fonts.ready);
 const check=await page.evaluate(()=>({images:[...document.images].map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0})),duplicateIds:[...new Set([...document.querySelectorAll('[id]')].map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i))],brokenFragments:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),odiaPassages:document.querySelectorAll('[lang=or]').length}));
 if(check.images.some(i=>!i.loaded)||check.duplicateIds.length||check.brokenFragments.length)throw Error(JSON.stringify(check));
 const output=path.join(root,'output/pdf/odia-cinema-tagged-reading-proof-2026-10-27.pdf');await page.pdf({path:output,tagged:true,outline:true,preferCSSPageSize:true,printBackground:true});
 fs.writeFileSync(path.join(tmp,'build.json'),JSON.stringify({output,sha256:createHash('sha256').update(fs.readFileSync(output)).digest('hex'),browser:browser.version(),check,chapters:cinema.articles.map(a=>({slug:a.slug,source:a.source,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,a.source))).digest('hex')})),status:'draft_requires_structure_and_visual_review',publication:false},null,2)+'\n');console.log(output);
}finally{await browser.close();}
