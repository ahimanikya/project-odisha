import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const regions=JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8'));
const voices=JSON.parse(readFileSync('../../kb/research/voices/collection.json','utf8'));
const read=route=>readFileSync(`dist/${route}/index.html`,'utf8').replace(/<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g,'');
const text=html=>html.replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#39;',"'").replace(/\s+/g,' ').trim();
test('city and culture redesign preserves every original narrative paragraph and planning suggestion',()=>{
 for(const region of regions.regions.filter(r=>['bhubaneswar','puri','cuttack'].includes(r.slug))){
  const page=text(read('destinations/'+region.slug));
  for(const content of [region.headline,region.lead,region.orientation,...region.facts.map(f=>f.text),...region.items.flatMap(i=>[i.summary,i.tip]),...region.sections.flatMap(s=>s.paragraphs.map(p=>p.text))])assert.ok(page.includes(text(content)),`${region.slug}: lost ${content}`);
 }
 for(const entry of voices.pages){const page=text(read(entry.path));for(const content of [...entry.sections.flatMap(s=>s.paragraphs.map(p=>p.text)),...entry.cards.map(c=>c.text),...(entry.roster||[])])assert.ok(page.includes(text(content)),`${entry.path}: lost ${content}`);}
});
test('Bhubaneswar archive is saveable at its stable identity and its starter remains unscheduled',()=>{
 const archive=read('stories/bhubaneswar-fresco');
 assert.ok(archive.includes('data-save-journey="experience:bhubaneswar-fresco"'));
 assert.match(archive,/<script type="module" src="\/_astro\//);
 assert.ok(archive.includes('href="/destinations/bhubaneswar/"'));
 assert.ok(archive.includes('present-day mural route'));
 const selected=JSON.parse(readFileSync('../../kb/research/journey-starters.json','utf8')).starters.find(s=>s.id==='bhubaneswar-stone-painted-streets');
 assert.deepEqual(selected.items,['place:bhubaneswar', 'place:mukteswar', 'place:dhauli', 'food:bhubaneswar-dalma', 'stay:bhubaneswar', 'experience:bhubaneswar-fresco']);
 assert.ok(read('journey-starters').includes('id="bhubaneswar-stone-painted-streets"'));
});
test('Mangalajodi activity uses a distinct credited real boat image',()=>{
 const place=read('visit/places/mangalajodi'),activity=read('visit/experiences/mangalajodi-birdwatching');
 assert.ok(activity.includes('/images/destinations/mangalajodi-boat.jpg'));
 assert.ok(!place.includes('/images/destinations/mangalajodi-boat.jpg'));
 for(const value of ['Neerakiran','https://creativecommons.org/licenses/by-sa/4.0/','does not identify a currently available service'])assert.ok(activity.includes(value));
});
