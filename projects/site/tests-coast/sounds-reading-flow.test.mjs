import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const collection=JSON.parse(readFileSync(new URL('../../../kb/research/culture/sounds-website.json',import.meta.url),'utf8'));
const route=c=>'/sounds-of-odisha/'+c.id+'/';
test('eight stories form a bounded reading trail with current chapter and notebook ending',()=>{
 for(const [i,c] of collection.chapters.entries()){
 const html=readFileSync(new URL('../dist-coast'+route(c)+'index.html',import.meta.url),'utf8');
 const nav=html.match(/<nav class="sounds-reading-trail"[\s\S]*?<\/nav>/)?.[0];assert.ok(nav,c.id);
 assert.ok(nav.includes('Story '+(i+1)+' of 8'));
 const previous=i?route(collection.chapters[i-1]):'/sounds-of-odisha/';const next=i<7?route(collection.chapters[i+1]):'/sounds-of-odisha/listening-notebook/';
 assert.ok(nav.includes('rel="prev" href="'+previous+'"'));assert.ok(nav.includes('href="'+next+'"'));
 if(i<7)assert.ok(nav.includes('rel="next" href="'+next+'"'));else assert.ok(nav.includes('Your listening notebook'));
 assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);assert.ok(nav.includes('href="'+route(c)+'" aria-current="page"'));
 for(const target of collection.chapters){assert.ok(nav.includes('href="'+route(target)+'"'));assert.ok(existsSync(new URL('../dist-coast'+route(target)+'index.html',import.meta.url)));}
 assert.ok(!html.includes('Continue the listening journey →'));assert.ok(html.includes('Sources'));
 }
});
