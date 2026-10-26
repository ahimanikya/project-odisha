import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsPage,createAnalytics,validMeasurementId} from '../src/lib/analytics.mjs';
const input={origin:'https://projectodisha.org',pathname:'/journey/',canonical:'https://projectodisha.org/journey/',title:'My Odisha Journey · Project Odisha',allowedPaths:['/journey/']};
test('analytics accepts only explicit production routes and clean canonical metadata',()=>{
 assert.equal(validMeasurementId('G-ABC1234567'),true);
 for(const id of ['',undefined,'G-../../secret','G-<script>'])assert.equal(validMeasurementId(id),false);
 assert.equal(analyticsPage({...input,origin:'http://127.0.0.1:4362'}),null);
 assert.equal(analyticsPage({...input,pathname:'/store/'}),null);
 for(const suffix of ['?note=private','#my-secret'])assert.equal(analyticsPage({...input,canonical:input.canonical+suffix}),null);
 const page=analyticsPage({...input,search:'?private-note=secret',hash:'#private'});
 assert.deepEqual(page,{page_location:input.canonical,page_title:input.title,page_referrer:'',ignore_referrer:true});
});
test('page-local configuration rejects other routes and error-page fallbacks',()=>{
 assert.equal(analyticsPage({...input,allowedPaths:[]}),null);
 assert.equal(analyticsPage({...input,pathname:'/how-to-use/',canonical:'https://projectodisha.org/how-to-use/'}),null);
 assert.equal(analyticsPage({...input,canonical:'https://projectodisha.org/how-to-use/'}),null);
 assert.equal(analyticsPage({...input,pathname:'/404.html',canonical:'https://projectodisha.org/404.html',allowedPaths:['/404.html']}),null);
 assert.equal(analyticsPage({...input,pathname:'/missing-page/',canonical:'https://projectodisha.org/404.html',allowedPaths:[]}),null);
});
test('no tag or events before consent, one page view, withdrawal disables immediately',()=>{
 const events=[],loads=[],disabled=[];
 const a=createAnalytics({id:'G-ABC1234567',page:analyticsPage(input),gtag:(...args)=>events.push(args),loadTag:id=>loads.push(id),setDisabled:v=>disabled.push(v)});
 assert.equal(events.length,0);assert.equal(loads.length,0);
 a.decline();assert.equal(events.length,0);assert.equal(loads.length,0);
 a.accept();a.accept();assert.equal(loads.length,1);assert.equal(events.filter(e=>e[0]==='event').length,1);
 assert.equal(events.find(e=>e[0]==='config')[2].send_page_view,false);
 assert.equal(events.find(e=>e[0]==='config')[2].allow_google_signals,false);
 a.decline();assert.equal(a.active,false);assert.equal(disabled.at(-1),true);
 a.accept();assert.equal(loads.length,1);assert.equal(events.filter(e=>e[0]==='event').length,1);
});
test('misconfiguration cannot start analytics even after acceptance',()=>{
 for(const [id,page] of [['',analyticsPage(input)],['G-ABC1234567',null]]){
  const fail=()=>assert.fail('No effect permitted');
  createAnalytics({id,page,gtag:fail,loadTag:fail,setDisabled:fail}).accept();
 }
});
