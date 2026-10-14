import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('../../kb/records/pending-reading-room.json','utf8'));
const read=route=>readFileSync('dist-coast'+route+'index.html','utf8');
test('pending research is readable through an explicit public selection with source boundaries',()=>{
 const hub=read('/reading-room/');assert.match(hub,/Osha, stories/);assert.match(read('/explore/'),/href="\/reading-room\/"/);
 assert.equal(new Set(manifest.entries.map(e=>e.route)).size,manifest.entries.length);
 for(const e of manifest.entries){
  assert.match(e.path,/^(culture|statistics|economy|food|people|works|collections|history|handlooms|trade|places|journeys|cities|stories|visitor-index)\//);
  assert.ok(!e.path.includes('..'));assert.ok(existsSync('../../kb/research/'+e.path));
  const html=read(e.route);assert.ok(hub.includes(`href="${e.route}"`));assert.match(html,/Dated evidence and open questions/);assert.match(html,/Specialist review remains open/);assert.match(html,/noindex/);
  assert.ok(!/(?:href|src)="(?:\.\.\/|[^"/]*\.md(?:#|"))/.test(html),e.path);
  assert.ok(!/<script[^>]+src="https?:/.test(html),e.path);
  if(e.sources.length)assert.match(html,/Sources to follow/);
 }
});
