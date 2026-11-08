import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const articles=JSON.parse(readFileSync('src/data/dongariya.json','utf8'));
const read=path=>readFileSync(path,'utf8');
const scope=JSON.parse(read('editions/coast.json'));
const notes={ 'dongariya-life':6,kapadaganda:21,'ornaments-in-use':5,niyamgiri:9,'seed-keeping':5,'forest-foods':5,'harvest-to-market':6,'homes-and-repair':7,'learning-and-belonging':7,'kuvi-and-jatapu-script':16,'songs-and-singers':8,'kotpad-and-kapadaganda':4 };
test('Dongria series exposes twelve sourced articles and connected index in the active edition',()=>{
 assert.equal(articles.length,12);
 const index=read('dist/stories/dongria/index.html');
 for(const a of articles){
  const route=`/stories/dongria/${a.routeSlug || a.slug}/`;
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
  const html=read(`dist/stories/dongria/${a.routeSlug || a.slug}/index.html`);
  assert.ok(html.includes('width:100%')||html.includes('width: 100%'));
  assert.doesNotMatch(html,/width:\s*85%/);
  assert.ok(html.includes('calc(100vw - 2.8rem), 724px'));
  assert.doesNotMatch(html,/\/Users\/|GUNDERI_SHAWL|AI-generated|AI-assisted/);
  if(a.kind==='photograph'||a.kind==='film poster'){assert.ok(html.includes(a.license_url));assert.ok(html.includes('Resized; composition unchanged.')||html.includes('Colour and tone adjusted for print; composition unchanged.'));}
  if(a.kind==='interpretive illustration'){
   assert.ok(a.image.startsWith('/assets/dongria-book/20261107-'));
   assert.ok(html.includes('interpretive illustration')||html.includes('interpretive architectural detail'));
   assert.ok(html.includes(a.reference_url));
   if(a.reference_license){
    assert.equal(a.license,'CC BY-SA 4.0');
    assert.ok(html.includes(a.license_url));
    assert.ok(html.includes('photograph by '+a.reference_creator));
    assert.ok(html.includes('Imagined composition; portrait adaptation for this edition.'));
   }else{
    assert.equal(a.slug,'homes-and-repair');
    assert.ok(html.includes('2016'));
    assert.ok(html.includes('not a documented building or a universal present-day form'));
   }
  }
 }
});
test('Niyamgiri series distinguishes and retains the existing legal overview',()=>{
 const html=read('dist/stories/dongria/niyamgiri/index.html');
 assert.ok(html.includes('Niyamgiri: cultivation and village decisions'));
 assert.ok(html.includes('/reading-room/economy/niyamgiri-rights-and-mining/'));
 assert.ok(existsSync('dist/reading-room/economy/niyamgiri-rights-and-mining/index.html'));
});

test('Dongria series index uses a full-column clothing illustration with credit and sharing image',()=>{
 const html=read('dist/stories/dongria/index.html');
 for(const width of [480,800,1200]){
  const src=`/assets/dongariya/00-index-clothing-${width}w.webp`;
  assert.ok(existsSync('public'+src));assert.ok(html.includes(src));
 }
 assert.ok(html.includes('Illustration of two women wearing embroidered Dongria wraps against green hills.'));
 assert.ok(html.includes('Dongria dress and embroidered wraps'));
 assert.ok(html.includes('interpretive illustration'));
 assert.ok(html.includes('photograph by Debanutosh'));
 assert.ok(html.includes('https://creativecommons.org/licenses/by-sa/4.0/'));
 assert.match(html,/<meta[^>]*property="og:image"[^>]*content="https:\/\/projectodisha.org\/assets\/dongariya\/00-index-clothing-1200w.webp"/);
 assert.doesNotMatch(html,/width:\s*85%|AI-generated|AI-assisted/);
});

test('Dongria canonical routes replace unshared spelling variants without redirects',()=>{
 assert.equal(existsSync('dist/stories/dongariya/index.html'),false);
 assert.equal(existsSync('dist/stories/dongria/dongariya-life/index.html'),false);
 assert.ok(existsSync('dist/stories/dongria/dongria-life/index.html'));
 assert.equal(scope.routes.some(route=>route.startsWith('/stories/dongariya/')),false);
 for(const a of articles){
  const route=`/stories/dongria/${a.routeSlug || a.slug}/`;
  const html=read('dist'+route+'index.html');
  assert.ok(html.includes(`https://projectodisha.org${route}`));
  assert.doesNotMatch(html,/href="(?:https:\/\/projectodisha\.org)?\/stories\/dongariya\//);
  assert.doesNotMatch(a.title,/Dongariya|Dongaria/);
 }
 const sources=read('src/content/dongariya/kapadaganda.md');
 assert.ok(sources.includes('Embroidery and Work for Dongariya Kondh Women'));
 assert.ok(sources.includes('“Dongaria Kondh textiles,”'));
});
