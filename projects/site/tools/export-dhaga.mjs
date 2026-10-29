// Deterministic public adapter: never export the research directory wholesale.
import {readFile,writeFile,mkdir,rm,copyFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,basename} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const site=fileURLToPath(new URL('../',import.meta.url)),book=resolve(site,'../odia-dhaga');
export const pdfURL='https://raw.githubusercontent.com/ahimanikya/project-odisha/e5e6c9a36b5ff2f3db141dab4d37dcded06c9e04/projects/odia-dhaga/odia-dhaga-book.pdf';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function publicSourceCredit(source){
 const url=new URL(source.url),revision=url.searchParams.get('oldid');
 const title='<a href="'+esc(source.url)+'">'+esc(source.title)+'</a>';
 if(url.hostname.endsWith('wiktionary.org')||url.hostname==='incubator.wikimedia.org'){
  const contributors=url.hostname.endsWith('wiktionary.org')?'Odia Wiktionary contributors':'Wikimedia Incubator contributors';
  return title+'<p>'+contributors+(revision?' · Revision '+esc(revision):'')+' · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA4.0</a>.</p>';
 }
 if(url.hostname.endsWith('wikisource.org'))return title+'<p>'+esc(source.creator||'Odia Wikisource contributors')+(revision?' · Revision '+esc(revision):'')+' · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p><p>'+esc(source.rights)+'</p>';
 if(source.id.includes('scert'))return title+'<p>SCERT Odisha, 2024, p.139. Three brief quotations retain separate source rights; this source is not openly licensed. Dhaga pages identify each quotation and its locator.</p>';
 if(source.id.includes('1893'))return title+'<p>'+esc(source.citation||'Gobinda Rath, publisher; Victoria Press, Cuttack, 1893.')+'</p><p>Historical witness, not a certified first origin. Transcription and reuse remain qualified; individual Dhaga give the passage locators.</p>';
 return title+(source.citation?'<p>'+esc(source.citation)+'</p>':'')+'<p>'+esc(source.rights)+'</p>';
}
export async function exportDhaga(destination){
 const data=JSON.parse(await readFile(resolve(book,'collection.json'),'utf8')),out=resolve(destination,'dhaga');
 const chromePath=resolve(destination,'internal/dhaga-chrome/index.html');
 const chrome=await readFile(chromePath,'utf8');
 const header=chrome.match(/(<div data-dhaga-header[^>]*>[\s\S]*?)<div data-dhaga-footer/)?.[1];
 const footer=chrome.match(/(<div data-dhaga-footer[^>]*>[\s\S]*?)<\/body>/)?.[1];
 if(!header||!footer)throw Error('Shared Dhaga chrome build contract missing');
 const chromeHead=[...(chrome.match(/<link[^>]+rel="stylesheet"[^>]*>/g)||[]),'<link rel="stylesheet" href="/dhaga/assets/site-chrome.css">',...(chrome.match(/<script[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g)||[])].join('');

 await rm(out,{recursive:true,force:true});await mkdir(resolve(out,'sayings'),{recursive:true});await mkdir(resolve(out,'assets'),{recursive:true});
 await writeFile(resolve(out,'assets/site-chrome.css'),(chrome.match(/<style[^>]*>[\s\S]*?<\/style>/g)||[]).map(s=>s.replace(/^<style[^>]*>|<\/style>$/g,'')).join('\n'));
 const pdfBytes=await readFile(resolve(book,'odia-dhaga-book.pdf'));
 const pdf=JSON.parse(await readFile(resolve(book,'packing-report.json'),'utf8')).pdf;
 if(!pdf||!Number.isInteger(pdf.pages)||pdf.pages<1||pdf.bytes!==pdfBytes.length||pdf.sha256!==createHash('sha256').update(pdfBytes).digest('hex'))throw Error('Dhaga PDF metadata does not match the finished book');
 const pdfLabel=`Download PDF book (${pdf.pages} pages, ~${Math.round(pdf.bytes/1024/1024)} MB)`;
 const coverSrc=data.cover?.src;
 if(!coverSrc)throw Error('Dhaga cover metadata is required');
 const assets=new Map(),dimensions=new Map();
 for(const e of [...data.entries,{graphic:{src:coverSrc}}]){
  if(!/^assets\/[a-zA-Z0-9_-]+\.(png|webp|svg)$/.test(e.graphic.src))throw Error('Unsafe Dhaga art path');
  const src=resolve(book,e.graphic.src),name=basename(e.graphic.src).replace(/\.[^.]+$/,'.webp');
  // New densely hatched illustrations use compact web copies; print originals stay intact.
  const compact=/^POD-DHAGA-17[4-9]$/.test(e.id||'');
  if(!assets.has(e.graphic.src)){const info=await sharp(src).resize({width:compact?320:640,withoutEnlargement:true}).webp({quality:compact?40:60,effort:6}).toFile(resolve(out,'assets',name));assets.set(e.graphic.src,'assets/'+name);dimensions.set('assets/'+name,info);}
 }
 const fonts=['NotoSerifOriya-Variable.woff2','SourceSerif4-Variable.woff2'];
 const licences=['NotoSerifOriya-OFL.txt','SourceSerif4-OFL.txt'];
 for(const name of [...fonts,...licences])await copyFile(resolve(book,'assets',name),resolve(out,'assets',name));
 function adapt(html,route){
  html=html.replace(/<meta name="robots"[^>]*>/g,'');
  html=html.replace(/<meta (?:name|property)="(?:description|og:[^"]+|twitter:[^"]+|referrer)"[^>]*>/g,'');
  const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'Odia Dhaga';
  const description='Read illustrated Odia Dhaga with English and Odia meanings, usage, source witnesses and rights, and download the complete book.';
  const social='<meta name="description" content="'+description+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+description+'"><meta property="og:url" content="https://projectodisha.org'+route+'"><meta property="og:image" content="https://projectodisha.org/dhaga/assets/'+basename(assets.get(coverSrc))+'"><meta property="og:image:alt" content="'+esc(data.cover.alt)+'"><meta property="og:image:width" content="'+dimensions.get(assets.get(coverSrc)).width+'"><meta property="og:image:height" content="'+dimensions.get(assets.get(coverSrc)).height+'"><meta name="twitter:card" content="summary_large_image"><meta name="referrer" content="strict-origin-when-cross-origin">';
  const meta=social+'<meta name="robots" content="noindex, nofollow"><link rel="canonical" href="https://projectodisha.org'+route+'">'+fonts.map(f=>'<link rel="preload" href="/dhaga/assets/'+f+'" as="font" type="font/woff2" crossorigin>').join('');
  if(!html.includes('<head>'))html=html.replace('<html lang="en">','<html lang="en"><head>').replace('<body>','</head><body>');
  html=html.replace(/<main(?: id="sources" tabindex="-1")?>/,'<main id="main" tabindex="-1">').replace('href="#sources"','href="#main"');
  if(!html.includes('href="#main"'))html=html.replace(/<body>/,'<body><a class="skip" href="#main">Skip to main content</a>');
  html=html.replace(/(?:\.\.\/)?index\.html/g,'/dhaga/').replace(/(?:\.\.\/)?reader\.html/g,'/dhaga/reader.html');
  html=html.replace(/(?:sayings\/)?POD-DHAGA-(\d+)\.html/g,(_,n)=>'/dhaga/sayings/pod-dhaga-'+n+'.html');
  // Keep one complete native browse list; bottom navigation links back to it.
  html=html.replace(/<details class="browse" id="browse-bottom-(POD-DHAGA-\d+)">[\s\S]*?<\/details>/g,(_,id)=>'<a href="#browse-top-'+id+'">Browse Dhaga ↑</a>');
  // The reader redirect builds its URL dynamically from stable uppercase IDs.
  html=html.replace(/["']sayings\/["']\s*\+\s*id\s*\+\s*["']\.html["']/g,"'/dhaga/sayings/'+id.toLowerCase()+'.html'");
  html=html.replace(/<a href="(?:\.\.\/)?(?:README\.md|source127\.html)"[^>]*>[\s\S]*?<\/a>/g,'');
  html=html.replace(/odia-dhaga-book\.pdf/g,pdfURL).replace(/ download>Download book/g,'>'+pdfLabel);
  for(const [src,dst] of assets)html=html.replaceAll(src,dst);
  html=html.replace(/<img ([^>]*?)src="((?:\.\.\/)?assets\/[^"]+)"([^>]*)>/g,(match,before,path,after)=>{const info=dimensions.get(path.replace(/^\.\.\//,''));return info?'<img '+before.replace(/\s*(?:width|height)="[^"]*"/g,'')+'src="'+path+'" width="'+info.width+'" height="'+info.height+'"'+after.replace(/\s*(?:width|height)="[^"]*"/g,'')+'>':match;});
  html=html.replace('Read locally, share carefully.','Read and share with care.');
  if(route==='/dhaga/'){
   if(!html.includes('<img class="book-cover"'))throw Error('Dhaga collection cover anchor missing');
   html=html.replace('<img class="book-cover"','<p><a href="/stories/odia-dhaga/">Read the introduction: The Poetry We Speak →</a></p><p><a href="/stories/essential-odia-dhaga/">Essential Odia Dhaga: 25 Sayings to Carry With You →</a></p><img class="book-cover"');
  }
  const links='<nav aria-label="Project Odisha and book sources"><a href="/explore/">Explore Project Odisha</a> · <a href="/dhaga/sources.html">Sources &amp; rights</a> · <a href="/about/editorial-process/">Our editorial process</a></nav>';
  html=html.replace(/<footer>/,'<footer>'+links);
  if(!html.includes('<footer>'))html=html.replace('</body>','<footer>'+links+'</footer></body>');
  html=html.replace(/ ·\s* ·/g,' ·').replace(/ ·\s*<\/nav>/g,'</nav>');
  html=html.replace(/<body([^>]*)>/,(_,attrs)=>'<body id="page-top"'+attrs+'>'+header);
  html=html.replace('</body>',footer.replaceAll('page=__DHAGA_PATH__','page='+encodeURIComponent(route)).replaceAll('__DHAGA_PATH__',esc(route))+'</body>');
  html=html.replace(/<title>/,chromeHead+meta+'<title>');
  return html;
 }
 const routes=['/dhaga/','/dhaga/reader.html','/dhaga/sources.html'];
 for(const file of ['index.html','reader.html'])await writeFile(resolve(out,file),adapt(await readFile(resolve(book,file),'utf8'),file==='index.html'?'/dhaga/':'/dhaga/reader.html'));
 for(const e of data.entries){const name=e.id.toLowerCase()+'.html',route='/dhaga/sayings/'+name;routes.push(route);await writeFile(resolve(out,'sayings',name),adapt(await readFile(resolve(book,'sayings',e.id+'.html'),'utf8'),route));}
 const used=new Set(data.entries.flatMap(e=>[...e.witnesses,...(e.variants||[])].map(w=>w.source_id)));
 for(const section of data.book_intro?.sections||[])for(const paragraph of section.paragraphs)for(const sid of paragraph.source_ids||[])used.add(sid);
 const sourceHTML='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dhaga · Sources and rights</title><style>body{font:1.1rem/1.7 Georgia,serif;max-width:72ch;margin:auto;padding:2rem;background:#fffaf0;color:#29251e}a{color:#784025}li{margin:1.5rem 0;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #784025;outline-offset:4px}</style></head><body><a href="#sources">Skip to sources</a><header><a href="/dhaga/">← Book contents</a><h1>Sources &amp; rights</h1></header><main id="sources" tabindex="-1"><p>Original Project Odisha commentary and illustrations are available under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA4.0</a>. Wikimedia wording and variants are adapted with original Project Odisha translations, explanations and examples; the attributed share-alike terms are retained. Three short SCERT quotations retain separate source rights; they are not openly licensed or relicensed here. Each Dhaga gives its witnesses, locators and limitations.</p><ul>'+data.sources.filter(s=>used.has(s.id)).map(s=>'<li>'+publicSourceCredit(s)+'</li>').join('')+'</ul><h2>Font licences</h2><ul>'+licences.map(n=>'<li><a href="assets/'+n+'">'+esc(n.replace('-OFL.txt',''))+' · SIL Open Font Licence</a></li>').join('')+'</ul></main><footer></footer></body></html>';
 await writeFile(resolve(out,'sources.html'),adapt(sourceHTML,'/dhaga/sources.html'));
 const files=await import('node:fs/promises').then(async fs=>{const all=[];async function walk(dir){for(const n of await fs.readdir(dir,{withFileTypes:true})){const p=resolve(dir,n.name);if(n.isDirectory())await walk(p);else all.push(p);}}await walk(out);return all;});
 await rm(resolve(destination,'internal/dhaga-chrome'),{recursive:true,force:true});
 const bytes=(await Promise.all(files.map(async p=>(await stat(p)).size))).reduce((a,b)=>a+b,0);
 if(bytes>18_000_000)throw Error('Dhaga web export exceeds18MB budget: '+bytes);
 const report={entries:data.entries.length,routes,downloads:licences.map(n=>'/dhaga/assets/'+n),standalone_routes:routes,pdf_url:pdfURL,pdf_pages:pdf.pages,pdf_bytes:pdf.bytes,pdf_sha256:createHash('sha256').update(await readFile(resolve(book,'odia-dhaga-book.pdf'))).digest('hex'),bytes,files:files.length};
 await mkdir(resolve(site,'.astro'),{recursive:true});await writeFile(resolve(site,'.astro/dhaga-export.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const out=process.env.PUBLIC_UTKAL_EDITION==='coast'?'.coast-staging':'dist';console.log(await exportDhaga(resolve(site,out)));}
