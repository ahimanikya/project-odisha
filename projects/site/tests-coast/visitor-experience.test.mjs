import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(`dist-coast${p}index.html`,'utf8');
test('food, language and literary pages have a single contextual return path',()=>{
 for(const [path,parent] of [['/people/subhas-chandra-bose/','/destinations/cuttack/'],['/food/chhena-poda/','/food/'],['/languages/kui/','/languages/'],['/people/pratibha-ray/','/literature/']]){
  const html=read(path);const breadcrumbs=html.match(/<nav[^>]*aria-label="Breadcrumb"[^>]*>(.*?)<\/nav>/g)||[];
  assert.equal(breadcrumbs.length,1);assert.ok(breadcrumbs[0].includes(`href="${parent}"`));assert.ok(breadcrumbs[0].includes('aria-current="page"'));
 }
 assert.equal((read('/visit/stays/balasore-coast/').match(/aria-label="Breadcrumb"/g)||[]).length,1);
});
test('social images are retained in the deployable edition and match documented subjects',()=>{
 for(const path of ['/food/odisha-rasagola/','/people/subhas-chandra-bose/','/food/chhena-poda/','/destinations/mayurbhanj/','/languages/odia/','/people/fakir-mohan-senapati/']){
  const html=read(path),image=html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.ok(!image.includes('coast-illustration'));assert.ok(existsSync('dist-coast'+new URL(image).pathname));assert.ok(html.includes('src="'+new URL(image).pathname+'"'));
 }
 assert.ok(read('/languages/kui/').includes('not a documentary view of this subject'));
});
test('cultural contents follow reading order and onward links respect publication scope',()=>{
 const html=read('/languages/');const nav=html.match(/<nav[^>]*story-contents-desktop[^>]*>(.*?)<\/nav>/)[1];
 assert.ok(nav.indexOf('#more-voices')<nav.indexOf('#share-a-voice'));
 for(const path of ['/languages/kui/','/literature/','/people/pratibha-ray/']){
  const page=read(path);assert.ok(page.includes('story-contents-mobile'));assert.ok(page.includes('href="/destinations/"'));assert.ok(!page.includes('href="/store/'));
 }
});

import {mkdtempSync,mkdirSync,writeFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('edition pruning retains a metadata-only sharing asset and still removes unrelated files',()=>{
 const dir=mkdtempSync(join(tmpdir(),'utkal-sharing-'));
 try{
  for(const p of ['tools','editions','.coast-staging','.coast-staging/images'])mkdirSync(join(dir,p));
  copyFileSync('tools/finalize-edition.py',join(dir,'tools/finalize-edition.py'));
  writeFileSync(join(dir,'editions/coast.json'),JSON.stringify({routes:['/'],journey_ids:[],starter_ids:[]}));
  writeFileSync(join(dir,'.coast-staging/index.html'),'<meta name="robots" content="noindex"><meta property="og:image" content="https://projectodisha.org/images/share.jpg"><script id="journey-data" type="application/json">{"catalog":[],"starters":[]}</script>');
  writeFileSync(join(dir,'.coast-staging/images/share.jpg'),'sharing test fixture');writeFileSync(join(dir,'.coast-staging/images/held.jpg'),'held fixture');
  const result=spawnSync('python3',[join(dir,'tools/finalize-edition.py')],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.ok(existsSync(join(dir,'dist-coast/images/share.jpg')));assert.ok(!existsSync(join(dir,'dist-coast/images/held.jpg')));
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('six coastal practical guides and their reading links survive edition pruning',()=>{
 const notes=JSON.parse(readFileSync('../../kb/research/destinations/visit-notebooks.json','utf8')).notebooks.filter(n=>n.practical_choices);
 assert.equal(notes.length,6);
 for(const note of notes){
  const html=read(note.route);
  assert.equal((html.match(/id="practical-choices"/g)||[]).length,1);
  for(const choice of note.practical_choices.items)for(const link of choice.links){
   assert.ok(html.includes('href="'+link.href+'"'),note.route+' '+link.href);
   if(link.href.startsWith('/'))assert.ok(existsSync('dist-coast'+link.href+'index.html'));
  }
 }
});

test('guide contents lead directly to one notebook while optional detail stays in the page',()=>{
 const notes=JSON.parse(readFileSync('../../kb/research/destinations/visit-notebooks.json','utf8')).notebooks;
 for(const note of notes){
  const html=read(note.route);
  assert.equal((html.match(/id="visit-notebook"/g)||[]).length,1,note.route);
  const panel=html.match(/<details[^>]*id="visit-details"[^>]*>([\s\S]*?)<\/details>/);
  assert.ok(panel,note.route);assert.doesNotMatch(panel[0].split('>')[0],/\sopen(?:\s|=|$)/);
  for(const stop of note.planning_stops||[])assert.ok(panel[1].includes(stop.heading),note.route+' '+stop.heading);
  if(note.practical_choices){
   for(const pattern of [/<nav[^>]*story-contents-desktop[^>]*>([\s\S]*?)<\/nav>/,/<details[^>]*story-contents-mobile[^>]*>([\s\S]*?)<\/details>/]){
    const contents=html.match(pattern);assert.ok(contents,note.route);assert.ok(contents[1].includes('href="#visit-notebook"'),note.route);
   }
   assert.ok(html.indexOf('id="practical-choices"')<html.indexOf('id="visit-details"'),note.route);
  }
 }
});
