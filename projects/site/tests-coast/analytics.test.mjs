import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validMeasurementId} from '../src/lib/analytics.mjs';
const scope=JSON.parse(readFileSync('editions/coast.json','utf8'));
const routes=scope.routes;
const standalone=new Set(scope.standalone_routes||[]);
test('coastal analytics configuration is explicit and never eagerly loads the remote tag',()=>{
 const id=process.env.PUBLIC_GA_MEASUREMENT_ID||'';
 for(const route of routes){
  const html=readFileSync('dist-coast'+(route.endsWith('/')?route+'index.html':route),'utf8');
  assert.doesNotMatch(html,/<script\b[^>]*\bsrc=["']https?:\/\//i);
  const raw=html.match(/<script[^>]*id="analytics-config"[^>]*>([\s\S]*?)<\/script>/);
  if(standalone.has(route)){
   assert.equal(raw,null,route+': standalone collection must not configure analytics');
   assert.doesNotMatch(html,/analytics-config|analytics-choice|analytics-settings|googletagmanager|google-analytics|\bgtag\s*\(/i,route);
   continue;
  }
  if(!validMeasurementId(id)){assert.equal(raw,null);continue;}
  assert.ok(raw,route);
  const config=JSON.parse(raw[1]);
  assert.equal(config.id,id);assert.deepEqual(config.allowedPaths,routes);
  assert.equal(new URL(config.canonical).origin,'https://projectodisha.org');
  assert.equal(new URL(config.canonical).search,'');
  assert.match(html,/id="analytics-choice"[^>]*hidden/);
  assert.doesNotMatch(html,/Optional cookies (?:accepted|declined)\./);
  assert.doesNotMatch(html,/class="wrap analytics-settings"/);
  assert.match(html,/href="\/how-to-use\/#privacy"/);
  if(route==='/how-to-use/')assert.match(html,/<button[^>]*id="analytics-settings"[^>]*hidden[^>]*>Cookie preferences<\/button>/);
  else assert.doesNotMatch(html,/id="analytics-settings"/);
 }
});
