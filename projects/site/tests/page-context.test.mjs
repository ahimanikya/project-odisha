import test from 'node:test';
import assert from 'node:assert/strict';
import {pageContext,sharingImage} from '../src/lib/page-context.mjs';
test('reading and travel breadcrumbs point to the right collection without self-links',()=>{
 for(const [path,parent] of [['/crafts/pattachitra/','/crafts/'],['/textiles/khandua/','/textiles/'],['/knowledge/kotpad/','/textiles/'],['/people/subhas-chandra-bose/','/destinations/cuttack/'],['/languages/kui/','/languages/'],['/people/bhima-bhoi/','/literature/'],['/food/chhena-poda/','/food/'],['/knowledge/chilika/','/destinations/']]){
  const trail=pageContext(path,'Title');assert.equal(trail[1].href,parent);assert.equal(trail.at(-1).current,true);assert.equal(trail.filter(i=>i.href===path).length,1);
 }
 for(const slug of ['nirad-mohapatra','sabyasachi-mohapatra','ak-bir','gour-prasad-ghose']){
  const trail=pageContext(`/people/${slug}/`,'Filmmaker');
  assert.deepEqual(trail[1],{href:'/cinema/',label:'Odia cinema'});
  assert.equal(trail.at(-1).current,true);
 }
 assert.deepEqual(pageContext('/people/gourahari-das/','Gourahari Das')[1],{href:'/literature/',label:'Odia literature'});
 assert.equal(pageContext('/languages/','Languages').length,2);
 assert.deepEqual(pageContext('/visit/stays/balasore-coast/','Stay'),[]); // Existing regional breadcrumb remains in charge.
});
test('share previews keep subject provenance and use an honest fallback for missing portraits or script SVGs',()=>{
 const image={src:'/images/place.jpg',alt:'Documented place',width:800,height:600,creator:'Creator'};
 assert.equal(sharingImage(image),image);
 for(const value of [null,{}, {...image,src:'/images/script.svg'}, {...image,src:'https://other.test/img.jpg'}]){
  const fallback=sharingImage(value);assert.match(fallback.alt,/not a documentary view/);assert.ok(fallback.width>0);
 }
});
