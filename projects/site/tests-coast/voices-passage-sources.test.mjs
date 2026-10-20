import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {voiceSources} from '../src/lib/voices-sources.mjs';
const collection=JSON.parse(readFileSync('../../kb/research/voices/collection.json','utf8'));
const edition=JSON.parse(readFileSync('editions/coast.json','utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const original of collection.pages.filter(p=>edition.routes.includes('/'+p.path+'/')))test(`${original.path}: every passage reaches its own qualified source notes`,()=>{
 const entry=structuredClone(original);
 const held=entry.cards.filter(c=>!edition.routes.includes(c.href.split('#')[0]));
 entry.cards=entry.cards.filter(c=>edition.routes.includes(c.href.split('#')[0]));
 if(entry.path==='languages')entry.roster=[...held.map(c=>c.title),...(entry.roster||[])];
 const sources=voiceSources(entry,collection.sources);
 const html=readFileSync('dist-coast/'+entry.path+'/index.html','utf8').replaceAll('&#39;',"'");
 if(['languages','languages/odia','literature','people/fakir-mohan-senapati','literature/six-acres-and-a-third','people/sarala-das','people/pratibha-ray','people/bhima-bhoi','people/gopinath-mohanty'].includes(entry.path)){
  const editorial=JSON.parse(readFileSync('../../kb/research/voices/'+({'languages/odia':'odia','people/fakir-mohan-senapati':'fakir','literature/six-acres-and-a-third':'six-acres','people/sarala-das':'sarala','people/pratibha-ray':'pratibha','people/bhima-bhoi':'bhima','people/gopinath-mohanty':'gopinath'}[entry.path]||entry.path)+'-editorial.json','utf8'));
  assert.match(html,/<section id="story-sources"/);
  for(const passage of editorial.passages)for(const id of passage.source_ids){
   const ref=`ref-${passage.id}-${id}`;
   assert.equal(html.split(`id="${ref}"`).length-1,1);
   assert.equal(html.split(`href="#${ref}"`).length-1,1);
   assert.ok(html.includes(`href="#note-${id}"`));
  }
  for(const source of editorial.sources){assert.equal(html.split(`id="note-${source.id}"`).length-1,1);assert.ok(html.includes(escape(source.url)));assert.ok(html.includes(escape(source.note)));}
  assert.doesNotMatch(html,/<details[^>]*id="sources"|Research and presentation prepared with AI assistance/);
  assert.ok(html.includes('Images and reuse'));
  return;
 }
 for(const section of entry.sections){
  const body=html.match(new RegExp('<section id="'+section.id+'"[^>]*>([\\s\\S]*?)</section>'))?.[1];assert.ok(body,section.id);
  const passages=[...body.matchAll(/<p data-source-ids(?:="([^"]*)")?[^>]*>([\s\S]*?)<\/p>([\s\S]*?)(?=<p data-source-ids|$)/g)];
  assert.equal(passages.length,section.paragraphs.length);
  section.paragraphs.forEach((p,i)=>{
   assert.equal(passages[i][1]||'',p.source_ids.join(' '));assert.equal(passages[i][2],escape(p.text));
   const links=[...passages[i][3].matchAll(/href="#voice-source-([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>Source (\d+)<\/a>/g)];
   assert.deepEqual(links.map(m=>m[1]),p.source_ids);
   for(const link of links){
    const source=sources.find(s=>s.id===link[1]);assert.equal(Number(link[3]),sources.indexOf(source)+1);
    assert.equal(link[2],escape(`Source ${link[3]}: ${source.title}`));
   }
  });
 }
 const notes=html.match(/<details[^>]*id="sources"[^>]*>([\s\S]*?)<\/details>/)?.[1];assert.ok(notes);assert.match(notes,/<ol\b/);
 for(const source of sources){
  assert.equal(html.split(`id="voice-source-${source.id}"`).length-1,1);
  const note=notes.match(new RegExp('<li id="voice-source-'+source.id+'"[^>]*tabindex="-1"[^>]*>([\\s\\S]*?)</li>'))?.[1];assert.ok(note);
  assert.ok(note.includes(escape(source.url)));assert.ok(note.includes(escape(source.review||source.inspection)));
 }
 assert.ok(notes.includes('Images and reuse'));assert.ok(notes.includes('AI assistance'));
});
