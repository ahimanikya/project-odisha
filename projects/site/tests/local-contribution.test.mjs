import test from 'node:test';
import assert from 'node:assert/strict';
import {localContributionPrompts,localContributionURL} from '../src/lib/local-contribution.mjs';
test('local contribution routes preserve page context and open drafts, not issue submissions',()=>{
 for(const kind of Object.keys(localContributionPrompts)){
  const url=new URL(localContributionURL(kind,'/destinations/puri/'),'https://projectodisha.org');
  assert.equal(url.pathname,'/contribute/');assert.equal(url.searchParams.get('local'),kind);assert.equal(url.searchParams.get('page'),'/destinations/puri/');assert.equal(url.hash,'#correction-draft');
  assert.ok(localContributionPrompts[kind].questions.length>=4);
 }
 assert.throws(()=>localContributionURL('unknown'));
 const url=new URL(localContributionURL('maker','/food/?other=x&local=bad'),'https://projectodisha.org');assert.equal(url.searchParams.get('local'),'maker');assert.equal(url.searchParams.get('page'),'/food/?other=x&local=bad');
});
import {readFileSync} from 'node:fs';
import {renderVerificationPack} from '../src/lib/verification-pack.mjs';
test('downloadable field pack retains blank claim records, date/scope and public sharing boundaries',()=>{
 const pack=JSON.parse(readFileSync('../../kb/research/destinations/stone-sea-local-verification.json'));
 assert.equal(pack.contacts_made,false);assert.equal(pack.guides.length,3);
 const out=renderVerificationPack(pack);assert.equal(out,readFileSync('public/assets/stone-sea-local-verification.txt','utf8'));
 for(const guide of pack.guides)for(const question of guide.questions)assert.ok(out.includes(question));
 for(const field of pack.record_fields)assert.equal(out.split(field).length-1,3);
 assert.ok(out.includes('No submission, contact, appointment or publication'));
});
test('built contribution entry points have working fragments and preserve public draft review',()=>{
 const form=readFileSync('dist/contribute/index.html','utf8');assert.ok(form.includes('id="correction-draft"'));
 assert.ok(form.includes('id="local-contribution-prompts"'));assert.ok(form.includes('GitHub submissions are public'));
 const trail=readFileSync('dist/journey-starters/index.html','utf8');assert.ok(trail.includes('href="/assets/stone-sea-local-verification.txt"'));
 for(const kind of ['maker','access','food'])assert.ok(trail.includes('local='+kind));
});
