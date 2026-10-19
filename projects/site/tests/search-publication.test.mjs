import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,mkdtemp,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {publicationPlan,publicationPage,publicationCrawlerFiles} from '../src/lib/search-publication.mjs';
import {buildPublication} from '../tools/build-publication.mjs';
const selection=JSON.parse(await readFile('editions/search-candidate.json'));
const scope=JSON.parse(await readFile('editions/coast.json'));
const checkedInPolicy=JSON.parse(await readFile('editions/search-publication.json'));
const policy={...checkedInPolicy,mode:'preview',approval:null};
// Synthetic authority record, used only in memory and temporary test fixtures.
const decision={id:'UTP-DEC-999',status:'approved',actor:{kind:'human',name:'Ahimanikya Satapathy'},search_routes:policy.routes};
const html='<head><meta name="robots" content="noindex, nofollow"></head><body>Retain the story</body>';
test('checked-in publication policy resolves its migrated Founder approval for the existing eleven routes',async()=>{
 const {decisions}=JSON.parse(await readFile(new URL('../../../kb/registers/records.json',import.meta.url)));
 const approval=decisions.find(d=>d.id===checkedInPolicy.approval);
 assert.equal(checkedInPolicy.approval,'POD-DEC-150');
 assert.ok(approval,'The checked-in approval must exist in the canonical register');
 const plan=publicationPlan(checkedInPolicy,selection,scope.routes,decisions);
 assert.equal(plan.mode,'limited');
 assert.equal(plan.indexable.length,11);
 assert.deepEqual(plan.indexable,checkedInPolicy.routes);
 assert.deepEqual(plan.indexable,approval.search_routes);
 assert.throws(()=>publicationPlan(checkedInPolicy,selection,scope.routes,decisions.filter(d=>d.id!==checkedInPolicy.approval)),/explicit Founder decision/);
});
test('search activation requires the exact route set and a matching human decision',()=>{
 assert.equal(publicationPlan(policy,selection,scope.routes).mode,'preview');
 assert.equal(publicationPlan({...policy,mode:'limited',approval:decision.id},selection,scope.routes,[decision]).indexable.length,11);
 for(const mutate of [p=>p.mode='enabled',p=>p.routes.push('/journey/'),p=>p.routes.pop(),p=>p.routes[1]=p.routes[0],p=>{p.mode='limited';p.approval=null;}]){const p=structuredClone(policy);mutate(p);assert.throws(()=>publicationPlan(p,selection,scope.routes));}
 for(const mutate of [d=>d.status='proposed',d=>d.actor.kind='ai_assistant',d=>d.actor.name='Another person',d=>d.search_routes.pop()]){const d=structuredClone(decision);mutate(d);assert.throws(()=>publicationPlan({...policy,mode:'limited',approval:d.id},selection,scope.routes,[d]));}
});
test('preview, limited launch and withdrawal keep the correct crawler boundaries',()=>{
 const preview=publicationPlan(policy,selection,scope.routes);assert.equal(publicationPage(html,'/',preview),html);assert.match(publicationCrawlerFiles(preview).robots,/Disallow: \//);assert.equal(publicationCrawlerFiles(preview).sitemap,null);
 const limited=publicationPlan({...policy,mode:'limited',approval:decision.id},selection,scope.routes,[decision]);
 assert.match(publicationPage(html,'/',limited),/content="index, follow"/);assert.match(publicationPage(html,'/journey/',limited),/content="noindex, follow"/);assert.match(publicationCrawlerFiles(limited).robots,/Sitemap:/);
 const withdrawn=publicationPlan({...policy,mode:'withdrawn',approval:decision.id},selection,scope.routes,[decision]);assert.match(publicationPage(html,'/',withdrawn),/content="noindex, follow"/);assert.match(publicationCrawlerFiles(withdrawn).robots,/Allow: \//);assert.equal(publicationCrawlerFiles(withdrawn).sitemap,null);
 assert.throws(()=>publicationPage('<head></head>','/',preview));
});
test('publication assembly preserves source and media, removes stale sitemap and rejects stray HTML or symlinks',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'utkal-search-test-')),site=pathToFileURL(join(dir,'projects/site/'));
 try{
  for(const p of ['projects/site/editions','projects/site/verification','projects/site/dist-coast/journey','kb/registers'])await mkdir(join(dir,p),{recursive:true});
  const write=(p,d)=>writeFile(new URL(p,site),typeof d==='string'?d:JSON.stringify(d));
  const sel={status:'proposed_not_approved',origin:selection.origin,pages:[{route:'/',decision:'proposed',reason:'Test home'},{route:'/journey/',decision:'exclude',reason:'Test utility'}]};
  const verificationName='googleeb3b0703307157d1.html';
  const verification=`google-site-verification: ${verificationName}`;
  await write('verification/'+verificationName,verification);
  const config={version:1,mode:'limited',routes:['/'],approval:decision.id};
  await write('editions/coast.json',{routes:['/','/journey/']});await write('editions/search-candidate.json',sel);await write('editions/search-publication.json',config);await write('../../kb/registers/records.json',{decisions:[{...decision,search_routes:['/']}]});
  await write('dist-coast/index.html',html);await write('dist-coast/journey/index.html',html);await write('dist-coast/photo.webp','media-bytes');
  await buildPublication(site);assert.match(await readFile(new URL('dist-publish/index.html',site),'utf8'),/content="index, follow"/);assert.match(await readFile(new URL('dist-publish/journey/index.html',site),'utf8'),/content="noindex, follow"/);assert.equal(await readFile(new URL('dist-coast/index.html',site),'utf8'),html);assert.equal(await readFile(new URL('dist-publish/photo.webp',site),'utf8'),'media-bytes');
  assert.equal(await readFile(new URL('dist-publish/'+verificationName,site),'utf8'),verification);
  assert.ok(!(await readFile(new URL('dist-publish/sitemap.xml',site),'utf8')).includes(verificationName));
  await write('verification/'+verificationName,'<script>Unexpected HTML</script>');await assert.rejects(buildPublication(site),/Unexpected Google verification content/);
  await write('verification/'+verificationName,verification);
  await write('editions/search-publication.json',{...config,mode:'withdrawn'});await buildPublication(site);await assert.rejects(readFile(new URL('dist-publish/sitemap.xml',site)),{code:'ENOENT'});assert.match(await readFile(new URL('dist-publish/robots.txt',site),'utf8'),/Allow: \//);
  await write('dist-coast/stray.html',html);await assert.rejects(buildPublication(site),/Unexpected HTML/);await rm(new URL('dist-coast/stray.html',site));
  await symlink(new URL('dist-coast/photo.webp',site),new URL('dist-coast/alias.webp',site));await assert.rejects(buildPublication(site),/symlinks/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
