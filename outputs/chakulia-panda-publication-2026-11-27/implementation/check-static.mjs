import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {renderReviewedCultureArticle} from '../../../projects/site/src/lib/reviewed-culture-article.mjs';
const root=new URL('../../../',import.meta.url),read=p=>readFileSync(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex');
const require=createRequire(new URL('projects/site/package.json',root));const sharp=require('sharp');const {transform}=require('@astrojs/compiler-rs');
const files=['projects/site/src/pages/sounds-of-odisha/chakulia-panda.astro','projects/site/src/pages/sounds-of-odisha/pala.astro','projects/site/src/pages/sounds-of-odisha/daskathia.astro','projects/site/src/pages/literature/index.astro'];
const compiled=[];
for(const p of files){const r=await transform(read(p).toString(),{filename:p});assert.equal(r.diagnostics.filter(d=>d.severity===1).length,0,p);compiled.push({path:p,sha256:hash(read(p)),diagnostics:r.diagnostics});}
const manuscript='kb/research/culture/chakulia-panda.md',source=read(manuscript).toString(),route='/sounds-of-odisha/chakulia-panda/',image='/images/chakulia-panda/chakulia-panda-1200.webp';
assert.equal(source,execFileSync('git',['show','HEAD:'+manuscript],{cwd:root,encoding:'utf8'}));
const original=read('kb/media/chakulia-panda/chakulia-panda-original.jpg'),base=read('projects/site/public'+image);
assert.equal(hash(base),hash(read('kb/media/chakulia-panda/chakulia-panda-1200.webp')));
assert.equal(hash(original),'e92404828524fd4580ac44e1608176888006fa9d620cf30fca97b76af18274ed');
const html=renderReviewedCultureArticle(source,{sourcePath:manuscript,route,images:{'../../media/chakulia-panda/chakulia-panda-1200.webp':image},imageDimensions:{[image]:{width:1200,height:943}}}).html;
const refs=[...html.matchAll(/<a\b[^>]*data-footnote-ref\b[^>]*>(\d+)<\/a>/g)];assert.deepEqual(refs.map(x=>Number(x[1])),[1,2,3,4,5]);
assert.equal((html.match(/<a\b[^>]*data-footnote-backref=/g)||[]).length,5);assert.equal((html.match(/<li id="user-content-fn-/g)||[]).length,5);
assert.match(html,/<figcaption>[\s\S]*?href="#user-content-fn-5"[\s\S]*?>2<\/a>/);
assert.equal((html.match(/Footnotes &amp; Sources/g)||[]).length,1);
const cfg=JSON.parse(read('projects/site/editions/responsive-images.json'));
const variants=[];
for(const width of [...new Set(cfg.widths.map(w=>Math.min(w,1200)))]){const {data,info}=await sharp(base).rotate().resize({width,withoutEnlargement:true}).webp({quality:cfg.quality,effort:5}).toBuffer({resolveWithObject:true});variants.push({width:info.width,height:info.height,bytes:data.length,sha256:hash(data),src:`/images/responsive/${hash(data).slice(0,16)}-${info.width}.webp`});}
const contract={route,manuscript,manuscript_sha256:hash(read(manuscript)),original_path:'kb/media/chakulia-panda/chakulia-panda-original.jpg',original_sha256:hash(original),base_image:image,base_sha256:hash(base),base_bytes:base.length,width:1200,height:943,title:JSON.parse(source.match(/^title: (.*)$/m)[1]),description:JSON.parse(source.match(/^description: (.*)$/m)[1]),author:'Ahimanikya Satapathy',expected_article_html:html,incoming:['/sounds-of-odisha/pala/','/sounds-of-odisha/daskathia/','/literature/'],compiled,variants,projected_media_total:base.length+variants.reduce((s,v)=>s+v.bytes,0)};
writeFileSync(new URL('contract.json',import.meta.url),JSON.stringify(contract,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',compiled:compiled.length,refs:5,notes:5,returns:5,source_unchanged:true,variants,projected_media_total:contract.projected_media_total},null,2));
