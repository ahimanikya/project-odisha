// Separate local review output; publication continues to use dist-coast.
import {readFile,writeFile,mkdir,rm,lstat} from 'node:fs/promises';
import {copyPublicationTree} from './storage-copy.mjs';
import {fileURLToPath} from 'node:url';
import {validateSearchSelection,candidateRobots,searchSitemap,candidateCrawlers} from '../src/lib/search-launch.mjs';
const site=new URL('../',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,site),'utf8'));
const scope=await read('editions/coast.json'),selection=await read('editions/search-candidate.json');
const routes=validateSearchSelection(selection,scope.routes),pages=[];
for(const route of scope.routes){
 const path=route==='/'?'index.html':route.slice(1)+(route.endsWith('/')?'index.html':'');
 const html=await readFile(new URL('dist-coast/'+path,site),'utf8');
 pages.push({path,html:candidateRobots(html,routes.includes(route))});
}
const output=new URL('.search-review/',site);
try{if((await lstat(output)).isSymbolicLink())throw Error('Refusing a symlink review output');}catch(e){if(e.code!=='ENOENT')throw e;}
await rm(output,{recursive:true,force:true});
await copyPublicationTree(new URL('dist-coast/',site),output,{allowNonMacFullCopy:process.platform==='linux'});
for(const page of pages)await writeFile(new URL(page.path,output),page.html);
await writeFile(new URL('sitemap.xml',output),searchSitemap(routes));await writeFile(new URL('robots.txt',output),candidateCrawlers);
await mkdir(new URL('.astro/',site),{recursive:true});
await writeFile(new URL('.astro/search-launch-review.json',site),JSON.stringify({status:'local_proposal_not_published',output:fileURLToPath(output),indexable:routes,held:selection.pages.filter(p=>p.decision==='hold').map(p=>p.route),excluded:selection.pages.filter(p=>p.decision==='exclude').map(p=>p.route),no_production_changes:true},null,2)+'\n');
console.log(`Prepared separate search review: ${routes.length} proposed pages. dist-coast and publication workflow remain unchanged.`);
