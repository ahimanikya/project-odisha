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

test('reading-room search exposes accessible controls and safe result sharing without hiding fallback notes',()=>{
 const hub=read('/reading-room/');
 assert.match(hub,/id="reading-query"[^>]*name="q"[^>]*maxlength="200"/);
 assert.match(hub,/id="reading-group"[^>]*name="collection"/);
 assert.match(hub,/<button type="submit"[^>]*>Search<\/button>/);
 assert.match(hub,/id="reading-count"[^>]*tabindex="-1"[^>]*role="status"/);
 assert.match(hub,/Share these results/);assert.match(hub,/Your search words and selected filters are included/);
 assert.match(hub,/<noscript>[\s\S]*All notes are listed above/);
 assert.equal((hub.match(/data-reading-entry/g)||[]).length,manifest.entries.length);
 assert.ok(!/<article[^>]*data-reading-entry[^>]* hidden/.test(hub));
});
