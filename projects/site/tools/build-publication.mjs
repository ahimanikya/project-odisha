import {shareJourneyData} from './shared-journey-data.mjs';
// Assemble a deployable artifact from the tested coastal build. Never mutate it.
import {readFile,writeFile,cp,rm,lstat,readdir,mkdir} from 'node:fs/promises';
import {deliveryJPEGs,optimizePublicationJPEGs} from './optimize-publication-jpeg.mjs';
import {eligiblePNG,optimizePublicationPNGs} from './optimize-publication-png.mjs';
import {fileURLToPath} from 'node:url';
import {publicationPlan,publicationPage,publicationCrawlerFiles} from '../src/lib/search-publication.mjs';
export const eligiblePublicationOptimization=path=>eligiblePNG(path)||deliveryJPEGs.includes(path);
export function projectedNonOptimizableBytes(sizes,replacements){
 let total=0;
 for(const [path,size] of sizes)if(!replacements.has(path)&&!eligiblePublicationOptimization(path))total+=size;
 for(const size of replacements.values())total+=size;
 return total;
}
export async function buildPublication(site){
 const read=async path=>JSON.parse(await readFile(new URL(path,site),'utf8'));
 const scope=await read('editions/coast.json'),selection=await read('editions/search-candidate.json'),policy=await read('editions/search-publication.json'),records=await read('../../kb/registers/records.json');
 const plan=publicationPlan(policy,selection,scope.routes,records.decisions);
 // This one ownership-verification response is not an editorial page or sitemap entry.
 const verificationName='googleeb3b0703307157d1.html';
 const verificationSource=new URL('verification/'+verificationName,site);
 if(!(await lstat(verificationSource)).isFile()||(await lstat(verificationSource)).isSymbolicLink())throw Error('Verification source must be a regular file');
 const verification=await readFile(verificationSource);
 if(verification.toString()!==`google-site-verification: ${verificationName}`)throw Error('Unexpected Google verification content');
 const input=new URL('dist-coast/',site),output=new URL('dist-publish/',site);
 const files=[];
 async function walk(dir,prefix=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   if(entry.isSymbolicLink())throw Error('Publication input must not contain symlinks');
   const path=prefix+entry.name;
   if(entry.isDirectory())await walk(new URL(entry.name+'/',dir),path+'/');else files.push(path);
  }
 }
 if((await lstat(input)).isSymbolicLink())throw Error('Publication input must not be a symlink');
 await walk(input);
 const paths=scope.routes.map(route=>route==='/'?'index.html':route.slice(1)+(route.endsWith('/')?'index.html':''));
 if(JSON.stringify(files.filter(f=>f.endsWith('.html')&&!(scope.downloads||[]).includes('/'+f)).sort())!==JSON.stringify([...paths].sort()))throw Error('Unexpected HTML outside the public edition');
 const sizes=new Map(await Promise.all(files.map(async path=>[path,(await lstat(new URL(path,input))).size])));
 const routePaths=new Set(paths);
 // Only validated route HTML is replaceable. Refuse huge inputs before reading or copying.
 const floor=[...sizes].filter(([path])=>!routePaths.has(path)&&!eligiblePublicationOptimization(path)).reduce((sum,[,size])=>sum+size,0);
 if(floor>=1_000_000_000)throw Error(`Publication artifact exceeds the 1 GB budget: ${floor} fixed non-optimizable bytes`);
 for(const path of paths)if(sizes.get(path)>=1_000_000_000)throw Error(`Publication HTML exceeds the 1 GB budget: ${path}`);
 const inlinePages=await Promise.all(paths.map(async(path,i)=>({path,html:publicationPage(await readFile(new URL(path,input),'utf8'),scope.routes[i],plan)})));
 const {pages,assets:journeyAssets}=shareJourneyData(inlinePages);
 const controls=publicationCrawlerFiles(plan);
 const replacements=new Map(pages.map(page=>[page.path,Buffer.byteLength(page.html)]));
 for(const [path,body] of journeyAssets)replacements.set(path,Buffer.byteLength(body));
 replacements.set('robots.txt',Buffer.byteLength(controls.robots));
 replacements.set('sitemap.xml',controls.sitemap?Buffer.byteLength(controls.sitemap):0);
 replacements.set(verificationName,verification.length);
 const projectedBytes=projectedNonOptimizableBytes(sizes,replacements);
 if(projectedBytes>=1_000_000_000)throw Error(`Publication artifact exceeds the 1 GB budget: ${projectedBytes} projected non-optimizable bytes`);
 try{if((await lstat(output)).isSymbolicLink())throw Error('Publication output must not be a symlink');}catch(e){if(e.code!=='ENOENT')throw e;}
 await rm(output,{recursive:true,force:true});await cp(input,output,{recursive:true});
 for(const page of pages)await writeFile(new URL(page.path,output),page.html);
 await mkdir(new URL('assets/',output),{recursive:true});
 for(const [path,body] of journeyAssets)await writeFile(new URL(path,output),body);
 await writeFile(new URL('robots.txt',output),controls.robots);
 await rm(new URL('sitemap.xml',output),{force:true});
 if(controls.sitemap)await writeFile(new URL('sitemap.xml',output),controls.sitemap);
 await writeFile(new URL(verificationName,output),verification);
 await mkdir(new URL('.astro/',site),{recursive:true});
 const optimization=await optimizePublicationPNGs(output);
 await writeFile(new URL('.astro/publication-png-optimization.json',site),JSON.stringify(optimization,null,2)+'\n');
 const jpegOptimization=await optimizePublicationJPEGs(output);
 await writeFile(new URL('.astro/publication-jpeg-optimization.json',site),JSON.stringify(jpegOptimization,null,2)+'\n');
 let publicationBytes=0;
 async function total(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await total(url);else publicationBytes+=(await lstat(url)).size;}}
 await total(output);
 // Keep the conservative decimal-GB gate on the actual final publication artifact.
 if(publicationBytes>=1_000_000_000)throw Error(`Publication artifact exceeds the 1 GB budget: ${publicationBytes} bytes`);

 await writeFile(new URL('.astro/publication-plan.json',site),JSON.stringify({...plan,public_pages:pages.length,output:fileURLToPath(output)},null,2)+'\n');
 return plan;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const plan=await buildPublication(new URL('../',import.meta.url));console.log(`Publication mode: ${plan.mode}; ${plan.indexable.length} indexable pages. dist-coast unchanged.`);
}
