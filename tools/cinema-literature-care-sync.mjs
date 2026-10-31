#!/usr/bin/env node
// Targeted derived-data sync; never stages old PDFs or regenerates image assets.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const args=process.argv.slice(2);let slug,apply=false;
for(let i=0;i<args.length;i++){if(args[i]==='--slug')slug=args[++i];else if(args[i]==='--apply')apply=true;else throw Error('Unknown argument '+args[i]);}
if(!slug||!/^[a-z0-9-]+$/.test(slug))throw Error('Use --slug <one-active-slug> [--apply]');
const dataPath=path.join(root,'projects/site/src/data/cinema.json'),before=fs.readFileSync(dataPath,'utf8'),data=JSON.parse(before);
const entries=data.articles.filter(a=>a.slug===slug);if(entries.length!==1)throw Error('Slug must resolve once');
const current=entries[0],entry=structuredClone(current),sourcePath=path.join(root,entry.source),bytes=fs.readFileSync(sourcePath),source=bytes.toString('utf8');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const front=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!front)throw Error('Missing frontmatter');
const fields={};for(const line of front[1].split('\n')){const m=line.match(/^([a-z_]+):\s*(.*)$/);if(m&&['title','description','series_intro','author','status','research_date','hero_image'].includes(m[1])){try{fields[m[1]]=JSON.parse(m[2]);}catch{throw Error('Expected JSON-style scalar for '+m[1]);}}}
if(fields.hero_image&&path.posix.normalize(path.posix.join(path.posix.dirname(entry.source),fields.hero_image))!==entry.hero.path)throw Error('Hero changed; separate asset integration required');
for(const [,url]of source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)){const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(entry.source),url));if(!entry.images.some(i=>i.source===resolved))throw Error('Unmapped image; separate asset integration required: '+resolved);}
const changed={};for(const key of ['title','description','series_intro','author','status','research_date'])if(key in fields&&entry[key]!==fields[key]){changed[key]={before:entry[key]??null,after:fields[key]};entry[key]=fields[key];}
entry.source_sha256=sha(bytes);
const {cinemaArticle}=await import('../projects/site/src/lib/cinema-article.mjs');
const rendered=cinemaArticle(entry);const html=rendered.fullHTML;
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(ids.length!==new Set(ids).size)throw Error('Duplicate HTML IDs');
for(const [,target]of html.matchAll(/href="#([^"]+)"/g))if(!ids.includes(target))throw Error('Missing fragment '+target);
if(/href="[^\"]*(?:github\.com\/[^\"]*\/blob\/main\/kb\/|(?:^|\/)kb\/research\/)/.test(html))throw Error('Raw KB destination in rendered article');
const figures=(html.match(/<figure\b/g)||[]).length;if(figures!==entry.images.length)throw Error('Original figure count changed');
for(const image of entry.images)if(!html.includes(image.file))throw Error('Missing original image '+image.file);
const output=path.join(root,'outputs/cinema-literature-care-20261030/fragments');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,slug+'.html'),html);
const index=data.articles.findIndex(a=>a.slug===slug);data.articles[index]=entry;
if(apply){if(fs.readFileSync(dataPath,'utf8')!==before||sha(fs.readFileSync(sourcePath))!==entry.source_sha256)throw Error('Concurrent edit; refusing sync');fs.writeFileSync(dataPath,JSON.stringify(data,null,2)+'\n');}
const report={slug,mode:apply?'applied':'dry-run',source:entry.source,old_source_sha256:current.source_sha256,source_sha256:entry.source_sha256,changed_fields:changed,figures,original_image_metadata_unchanged:JSON.stringify(current.images)===JSON.stringify(entry.images),unrelated_metadata_preserved:true,fragment:'outputs/cinema-literature-care-20261030/fragments/'+slug+'.html',fragment_sha256:sha(Buffer.from(html)),note:'HTML fragment validation only, not full Astro layout/browser verification. Root owns canonical manifest and narrative-plan synchronization.'};
fs.writeFileSync(path.join(output,slug+'-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
