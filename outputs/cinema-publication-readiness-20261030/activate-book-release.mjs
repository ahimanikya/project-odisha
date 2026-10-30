#!/usr/bin/env node
// No upload, Git, build or PDF mutation. Default is verification-only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
export async function activate({root=path.resolve(dir,'../..'),args=process.argv.slice(2),fetchImpl=fetch,log=console.log}={}) {
const manifest=JSON.parse(fs.readFileSync(path.join(root,'outputs/cinema-publication-readiness-20261030/book-release-manifest.json'),'utf8'));
let apply=false,base;
for(let i=0;i<args.length;i++){if(args[i]==='--apply')apply=true;else if(args[i]==='--release-base')base=args[++i];else throw Error('Unknown argument: '+args[i]);}
const digest=data=>crypto.createHash('sha256').update(data).digest('hex');
function verify(bytes,sha,asset,where){if(bytes!==asset.bytes||sha!==asset.sha256)throw Error(`${where} mismatch: ${asset.filename}`);}
for(const a of manifest.assets){const b=fs.readFileSync(path.join(root,a.path));verify(b.length,digest(b),a,'Local PDF');}
const dataPath=path.join(root,'projects/site/src/data/cinema.json'),pagePath=path.join(root,'projects/site/src/pages/cinema/book.astro');
const dataBefore=fs.readFileSync(dataPath,'utf8'),pageBefore=fs.readFileSync(pagePath,'utf8'),data=JSON.parse(dataBefore);
if(manifest.canonical_sources.length!==manifest.readings||data.articles.length!==manifest.readings)throw Error('Reviewed reading count changed');
if(new Set(manifest.canonical_sources.map(s=>s.slug)).size!==manifest.readings)throw Error('Duplicate reviewed source binding');
for(const [i,binding] of manifest.canonical_sources.entries()){
 const current=data.articles[i];
 if(current.slug!==binding.slug||current.source!==binding.source||current.source_sha256!==binding.source_sha256)throw Error('Metadata source binding mismatch: '+binding.slug);
 if(digest(fs.readFileSync(path.join(root,binding.source)))!==binding.source_sha256)throw Error('Canonical source mismatch: '+binding.slug);
}
if(digest(fs.readFileSync(path.join(root,manifest.narrative_plan.path)))!==manifest.narrative_plan.sha256)throw Error('Narrative plan mismatch');
if(JSON.stringify(data.review_books)!==JSON.stringify(manifest.expected_previous_review_books))throw Error('Current book metadata changed; review manifest baseline before activation');
if(digest(pageBefore)!==manifest.expected_book_page_sha256)throw Error('Book page changed; review manifest baseline before activation');

if(!base){if(apply)throw Error('--apply requires --release-base');const result={mode:'dry-run',local:'verified',sources:'41 reviewed bindings and narrative plan verified',remote:'not checked; supply actual --release-base',mutations:0,assets:manifest.assets};log(JSON.stringify(result,null,2));return result;}
const u=new URL(base);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password||u.search||u.hash||!/^\/ahimanikya\/project-odisha\/releases\/download\/[A-Za-z0-9._-]+\/?$/.test(u.pathname))throw Error('Expected exact Project Odisha GitHub release download base');
base=u.href.replace(/\/$/,'');
for(const a of manifest.assets){
 const response=await fetchImpl(base+'/'+a.filename,{signal:AbortSignal.timeout(180000)});
 if(!response.ok)throw Error(`Remote ${a.filename}: HTTP ${response.status}`);
 const final=new URL(response.url);if(final.protocol!=='https:'||!['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(final.hostname))throw Error('Unexpected download redirect');
 const h=crypto.createHash('sha256');let size=0;
 for await(const chunk of response.body){size+=chunk.length;if(size>a.bytes)throw Error('Remote asset exceeds expected size');h.update(chunk);}
 verify(size,h.digest('hex'),a,'Remote PDF');
}
const previous=manifest.expected_previous_review_books;
data.review_books=manifest.assets.map(a=>({edition:a.edition,file:base+'/'+a.filename,bytes:a.bytes,sha256:a.sha256,pages:a.pages,status:'reviewed_release_asset'}));
data.archived_review_books=[...(data.archived_review_books||[]),...previous];
function replaceOnce(text,from,to){if(text.split(from).length!==2)throw Error('Book page template drift: '+from);return text.replace(from,to);}
let page=replaceOnce(pageBefore,'Available PDF edition · 27 October 2026','Available PDF edition · 30 October 2026');
page=replaceOnce(page,'These downloads contain the 28 readings in the 27 October edition. The online collection has since expanded; newer chapters are being prepared for the next book edition.','These downloads contain the 41 readings in the 30 October review edition, with linked sources and image credits.');
page=page.replaceAll('Mirrored margins, printed source URLs and high-resolution images.','Mirrored margins, printed source URLs and credited images.').replaceAll('106 pages, mirrored margins, printed source URLs and high-resolution images.','106 pages, mirrored margins, printed source URLs and credited images.');
page=replaceOnce(page,"'Digital reading edition':'Printable reading edition'","'Digital reading edition · 30 October 2026':'Printable reading edition · 30 October 2026'");
const archive='<h2>Earlier published edition · 27 October 2026</h2><p>The 28-reading edition remains available as an archive.</p><ul>'+previous.map(b=>`<li><a href="${b.file}">${b.edition==='digital'?'Digital':'Printable'} reading edition · 27 October 2026 — PDF, ${(b.bytes/1000000).toFixed(1)} MB</a>. ${b.pages} pages.</li>`).join('')+'</ul>\n  ';
page=replaceOnce(page,'<h2>Earlier published edition · 26 October 2026</h2>',archive+'<h2>Earlier published edition · 26 October 2026</h2>');
page=page.replace('Digital reading edition — PDF, {mb(cinema.books[0].bytes)}','Digital reading edition · 26 October 2026 — PDF, {mb(cinema.books[0].bytes)}').replace('Printable reading edition — PDF download, {mb(cinema.books[1].bytes)}','Printable reading edition · 26 October 2026 — PDF download, {mb(cinema.books[1].bytes)}');
page=replaceOnce(page,'Cover of the expanded review edition, 27 October 2026.','Cover of Odia Cinema: A Living Screen.');
page=replaceOnce(page,'Downloadable PDF edition dated 27 October 2026; the earlier published edition remains available above.','Downloadable PDF edition dated 30 October 2026; earlier published editions remain available above.');
const dataAfter=JSON.stringify(data,null,2)+'\n';
const result={mode:apply?'apply':'dry-run',local:'verified',sources:'41 reviewed bindings and narrative plan verified',remote:'verified',release_base:base,proposed:{review_books:data.review_books,archived_review_books:data.archived_review_books,book_page:page}};
log(JSON.stringify(result,null,2));
if(apply){
 // Detect concurrent changes after network verification; roll back first write if second fails.
 if(fs.readFileSync(dataPath,'utf8')!==dataBefore||fs.readFileSync(pagePath,'utf8')!==pageBefore)throw Error('Concurrent edit; refusing activation');
 for(const binding of manifest.canonical_sources)if(digest(fs.readFileSync(path.join(root,binding.source)))!==binding.source_sha256)throw Error('Concurrent canonical edit; refusing activation');
 if(digest(fs.readFileSync(path.join(root,manifest.narrative_plan.path)))!==manifest.narrative_plan.sha256)throw Error('Concurrent narrative edit; refusing activation');
 fs.writeFileSync(dataPath,dataAfter);
 try{fs.writeFileSync(pagePath,page);}catch(error){fs.writeFileSync(dataPath,dataBefore);throw error;}
}

return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await activate();
