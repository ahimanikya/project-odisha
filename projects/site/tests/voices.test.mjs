import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const data=JSON.parse(readFileSync('../../kb/research/voices/collection.json','utf8'));
test('language and literary pages retain claim sources, real assets and reuse credit',()=>{
  for(const page of data.pages){
    const html=readFileSync(`dist/${page.path}/index.html`,'utf8');
    assert.ok(html.includes(page.title));
    if(['languages','languages/odia'].includes(page.path)){assert.ok(html.includes('By Ahimanikya Satapathy'));assert.match(html,/<section id="story-sources"/);}else assert.ok(html.includes('Editorial preview'));
    for(const section of page.sections)for(const p of section.paragraphs){
      assert.ok(['sourced_summary','editorial_invitation','asset_description'].includes(p.kind));
      if(p.kind==='sourced_summary')assert.ok(p.source_ids.length,`${page.path}: unsupported factual paragraph`);
      for(const id of p.source_ids){assert.ok(data.sources[id]);assert.ok(html.includes(data.sources[id].url.replaceAll('&','&amp;')));}
    }
    for(const id of [page.hero_asset,...page.cards.map(c=>c.asset)].filter(Boolean)){
      const asset=data.assets[id];assert.ok(asset.alt&&asset.creator&&asset.license_url);
      assert.ok(html.includes(asset.license_url));assert.ok(html.includes(asset.creator));
      assert.equal(createHash('sha256').update(readFileSync('public'+asset.src)).digest('hex'),asset.sha256);
    }
  }
});
test('new collection pages are discoverable without presenting unwritten profiles as links',()=>{
  const explore=readFileSync('dist/explore/index.html','utf8');
  const home=readFileSync('dist/index.html','utf8');
  for(const p of data.pages)assert.ok(explore.includes(`href="/${p.path}/"`));
  for(const hub of ['languages','literature'])assert.ok(home.includes(`href="/${hub}/"`));
  for(const p of data.pages.filter(p=>p.roster)){
    const html=readFileSync(`dist/${p.path}/index.html`,'utf8');
    for(const name of p.roster)assert.match(html,new RegExp(`<li[^>]*>${name}</li>`));
  }
});
