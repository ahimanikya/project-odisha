import {readFileSync,writeFileSync} from 'node:fs';
const guide=JSON.parse(readFileSync(new URL('../../../kb/research/culture/listening-notebook.json',import.meta.url),'utf8'));
const paths=JSON.parse(readFileSync(new URL('../../../kb/research/product/sounds-reading-paths.json',import.meta.url),'utf8'));
const entries=new Map(guide.entries.map(entry=>[entry.id,entry]));
const lines=[guide.title,'Project Odisha · Sounds of Odisha','https://projectodisha.org/sounds-of-odisha/listening-notebook/','',guide.limitations,'','ONE ENCOUNTER'];
for(const field of guide.fields)lines.push(field+':','________________________________________','');
lines.push('READING PATHS','',paths.note,'');
for(const path of paths.paths){
 lines.push(path.title.toUpperCase(),path.question,'');
 for(const id of path.stories){
  const entry=entries.get(id);
  if(!entry)throw new Error('Missing listening question: '+id);
  lines.push(entry.name,entry.question,'https://projectodisha.org'+entry.route,'');
 }
}
lines.push('Follow the host’s directions. Ask separately before recording and sharing.','Keep private contact details and permission documents out of public submissions.','');
const output=lines.join('\n');
const destination=new URL('../public/assets/odisha-listening-notebook.txt',import.meta.url);
if(process.argv.includes('--check')){
 if(readFileSync(destination,'utf8')!==output)throw new Error('Notebook download is stale. Run node tools/build-listening-notebook.mjs.');
}else writeFileSync(destination,output);
