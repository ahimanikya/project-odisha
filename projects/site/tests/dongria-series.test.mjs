import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const articles=JSON.parse(readFileSync('src/data/dongariya.json','utf8'));
const read=path=>readFileSync(path,'utf8');
const scope=JSON.parse(read('editions/coast.json'));
const notes={ 'dongariya-life':6,kapadaganda:21,'ornaments-in-use':5,niyamgiri:9,'seed-keeping':5,'forest-foods':5,'harvest-to-market':6,'homes-and-repair':7,'learning-and-belonging':7,'kuvi-and-jatapu-script':12,'songs-and-singers':8,'kotpad-and-kapadaganda':4 };
test('Dongria series exposes twelve sourced articles and connected index in the active edition',()=>{
 assert.equal(articles.length,12);
 const index=read('dist/stories/dongariya/index.html');
 for(const a of articles){
  const route=`/stories/dongariya/${a.slug}/`;
  assert.ok(scope.routes.includes(route));assert.ok(index.includes(`href="${route}"`));
  const html=read('dist'+route+'index.html');
  assert.ok(html.includes('https://projectodisha.org'+route));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('Footnotes &amp; Sources')||html.includes('Footnotes & Sources'));
  assert.equal((read(`src/content/dongariya/${a.slug}.md`).match(/^\[\^\d+\]:/gm)||[]).length,notes[a.slug]);
  assert.ok(html.includes('Suggest an update'));assert.ok(html.includes('Continue reading'));
 }
});
test('Dongria illustration and photographic provenance travel with optimized assets',()=>{
 for(const a of articles){
  assert.ok(existsSync('public'+a.image));assert.ok(a.image.endsWith('.webp'));
  const html=read(`dist/stories/dongariya/${a.slug}/index.html`);
  assert.ok(html.includes('width:85%')||html.includes('width: 85%'));
  assert.doesNotMatch(html,/\/Users\/|GUNDERI_SHAWL|AI-generated|AI-assisted/);
  if(a.source){assert.ok(html.includes(a.license_url));assert.ok(html.includes('Resized; composition unchanged.'));}
 }
});
test('Niyamgiri series distinguishes and retains the existing legal overview',()=>{
 const html=read('dist/stories/dongariya/niyamgiri/index.html');
 assert.ok(html.includes('Niyamgiri: cultivation and village decisions'));
 assert.ok(html.includes('/reading-room/economy/niyamgiri-rights-and-mining/'));
 assert.ok(existsSync('dist/reading-room/economy/niyamgiri-rights-and-mining/index.html'));
});
