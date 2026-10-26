const reviewedArticleCount=JSON.parse(readFileSync('src/data/reviewed-culture.json','utf8')).length;
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
const scope=JSON.parse(readFileSync('editions/coast.json','utf8'));
const standalonePages=new Set((scope.standalone_routes||[]).map(route=>route.slice(1)+(route.endsWith('/')?'index.html':'')));
const root=resolve('dist');
const files=readdirSync(root,{recursive:true}).filter(f=>statSync(join(root,f)).isFile());
const pages=files.filter(f=>f.endsWith('.html'));
const read=f=>readFileSync(join(root,f),'utf8');
test('all built local links, assets and fragment targets resolve',()=>{
  const details=JSON.parse(readFileSync('../../kb/research/destinations/details.json','utf8'));
  const voices=JSON.parse(readFileSync('../../kb/research/voices/collection.json','utf8'));
  assert.equal(pages.length,standalonePages.size+138+JSON.parse(readFileSync('src/data/cinema.json','utf8')).articles.length+3+reviewedArticleCount+JSON.parse(readFileSync('../../kb/research/food/restaurants.json','utf8')).venues.length+JSON.parse(readFileSync('../../kb/records/pending-reading-room.json','utf8')).entries.length+JSON.parse(readFileSync('../../kb/research/references/data/osha-culture.json','utf8')).pages.length+JSON.parse(readFileSync('../../kb/research/destinations/flexible-visit-plans.json','utf8')).plans.length+JSON.parse(readFileSync('../../kb/research/culture/craft-stories.json','utf8')).pages.length+JSON.parse(readFileSync('../../kb/research/destinations/central-details.json','utf8')).records.length+details.records.length+JSON.parse(readFileSync('../../kb/research/destinations/northern-details.json','utf8')).records.length+JSON.parse(readFileSync('../../kb/research/food/collection.json','utf8')).pages.length+voices.pages.length+JSON.parse(readFileSync('../../kb/research/destinations/regions.json','utf8')).regions.length);
  for(const file of pages){
    const html=read(file);
    for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      if(!raw||raw.includes('${')||/^(https?:|mailto:|tel:|data:|\/\/)/.test(raw))continue;
      const url=new URL(raw.replaceAll('&amp;','&'),'https://preview.invalid/'+file);
      let path=decodeURIComponent(url.pathname).replace(/^\//,'');
      if(!path||path.endsWith('/'))path+='index.html';
      assert.ok(existsSync(join(root,path)),`${file}: missing ${path}`);
      if(url.hash&&path.endsWith('.html')){
        const id=decodeURIComponent(url.hash.slice(1));
        assert.ok(read(path).includes(`id="${id}"`),`${file}: missing fragment ${id}`);
      }
    }
  }
});
test('the preview exports only selected research and preserves citations and draft state',()=>{
  const notes=JSON.parse(readFileSync('src/data/selected.json','utf8'));
  assert.deepEqual(notes.map(x=>x.slug),['chilika','konark','kotpad','pakhala','boita-bandana']);
  for(const note of notes){
    const html=read('knowledge/'+note.slug+'/index.html');
    assert.match(html,['konark','chilika'].includes(note.slug)?/By Ahimanikya Satapathy/:note.slug==='kotpad'?/Specialist language and maker review remain open/:/Editorial draft/);
    assert.ok(note.text.length>40);
    for(const source of note.sources){assert.match(source.resource,/^https:\/\//);const url=note.slug==='chilika'?JSON.parse(readFileSync('../../kb/research/destinations/chilika-editorial.json')).sources.find(s=>s.id===source.id).url:source.resource;assert.ok(html.includes(url.replaceAll('&','&amp;'))||html.includes(url));}
  }
  assert.ok(!files.some(f=>/^(kb|registers|history|research)\//.test(f)));
  assert.ok(!files.includes('utkal.config.json'));
});
test('preview stays unindexed and ships no remote scripts or live submission endpoint',()=>{
  for(const file of pages){
    const html=read(file);
    assert.match(html,/<meta name="robots" content="noindex, nofollow"/);
    assert.ok(!/<script[^>]+src="https?:/.test(html),file);
    assert.ok(!/id="analytics-config"|firebaseio/.test(html),file);
  }
  assert.ok(!/<form\b/.test(read('contribute/index.html')));
  assert.match(read('robots.txt'),/Disallow: \//);
});
test('brand assets, original fonts and their licences are included',()=>{
  for(const path of ['assets/book-boat-v1.png','assets/coast-illustration-v1.png','fonts/NotoSerifOriya-Bold.ttf','fonts/NotoSansOriya-Bold.ttf','fonts/OFL.txt','fonts/OFL-NotoSansOriya.txt'])assert.ok(existsSync(join(root,path)),path);
  const html=read('brand-review/index.html');
  assert.ok(html.includes('ମାଙ୍କଡ଼ା ପଥର')&&html.includes('ପ୍ରୋଜେକ୍ଟ ଓଡ଼ିଶା'));
  assert.ok(!html.includes('Kankada'));
});

test('main website excludes the unpublished Store collection and links',()=>{
  assert.ok(!files.some(f=>/^(utkal-store|store|artwork)\//.test(f)));
  for(const file of pages) assert.ok(!/Utkal Store|utkal-store|localhost:4323|127\.0\.0\.1:4323/i.test(read(file)),file);
});

// A successful page build must also carry its shared design version and usable fonts.
test('every website page uses the same design system and retains font distribution licences',()=>{
 const pkg=JSON.parse(readFileSync('../design-system/package.json','utf8'));
 for(const file of pages.filter(f=>f!=="downloads/heritage-walks/odisha-heritage-walks.html"&&!standalonePages.has(f)))assert.ok(read(file).includes(`name="utkal-design-system" content="${pkg.version}"`),file);
 for(const file of [...standalonePages].filter(file=>file.startsWith('characters/')))assert.ok(read(file).includes('href="/characters/assets/typography.css"'),file);
 assert.match(read('characters/assets/typography.css'),/font-family:var\(--character-type\)!important/);
 assert.ok(read('characters/assets/fonts/baloo-bhaina-2-OFL.txt').includes('SIL OPEN FONT LICENSE'));
 for(const name of ['CormorantGaramond-OFL.txt','SourceSerif4-OFL.txt','NotoSerifOriya-OFL.txt'])assert.equal(read('fonts/utkal/'+name),readFileSync('../design-system/fonts/'+name,'utf8'));
 const cssFiles=files.filter(f=>f.endsWith('.css'));
 let fonts=0;
 for(const file of cssFiles)for(const [,url] of read(file).matchAll(/url\(["']?([^\)"']+)["']?\)/g)){
  if(!/\.(ttf|woff2)$/.test(url))continue;
  const target=url.startsWith('/')?join(root,url.slice(1)):resolve(root,dirname(file),url);
  assert.ok(existsSync(target),file+': missing font '+url);fonts++;
 }
 assert.ok(fonts>=5,'local display, reading and Odia fonts are delivered');
});
