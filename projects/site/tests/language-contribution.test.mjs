import test from 'node:test';
import assert from 'node:assert/strict';
import {languageContributionURL} from '../src/lib/language-contribution.mjs';
test('language proposals remain editable GitHub drafts with explicit public and consent context',()=>{
 for(const name of ['', 'Saora / Sora','A&B #1 · ଓଡ଼ିଆ']){
  const url=new URL(languageContributionURL(name));assert.equal(url.origin,'https://github.com');assert.equal(url.pathname,'/ahimanikya/project-odisha/issues/new');assert.equal(url.searchParams.get('title'),'[Language] '+(name||'Contribution proposal'));
  const body=url.searchParams.get('body');assert.ok(body.startsWith('Language / preferred name: '+name));
  for(const text of ['transcript','translator credit','rights holders','consent documents','Who can review','Founder approval','public only when you submit'])assert.ok(body.includes(text),text);
  assert.equal([...url.searchParams].length,2);
 }
});
