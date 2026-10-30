import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {collectionURL,collectionEmbedURL,enhanceKhokaListening} from '../src/lib/khoka-listening.mjs';
const root=new URL('../../../',import.meta.url);
test('canonical section keeps one collection fallback and the old incoming anchor',()=>{
 const source=fs.readFileSync(new URL('kb/research/people/akshaya-mohanty.md',root),'utf8');
 const section=source.split('## Essential Khoka Bhai listening')[1].split('## Footnotes & Sources')[0];
 assert.deepEqual([...section.matchAll(/\]\((https:\/\/www.youtube.com\/watch[^)]+)\)/g)].map(x=>x[1]),[collectionURL]);
 assert.ok(source.includes('id="listen-and-explore"'));assert.doesNotMatch(section,/Voice, music and words|^- /m);
 const url=new URL(collectionEmbedURL);assert.equal(url.hostname,'www.youtube-nocookie.com');assert.equal(url.searchParams.get('autoplay'),'0');assert.equal(url.searchParams.get('controls'),'1');assert.equal(url.searchParams.get('playsinline'),'1');assert.ok(!url.searchParams.has('start')&&!url.searchParams.has('end'));
});
test('single collection is lazy, dimensioned, explicitly referred, and idempotent',()=>{
 const nodes=new Map();const paragraph={tagName:'P',querySelectorAll:()=>[{href:collectionURL}],before(node){nodes.set(node.id,node);}};
 const heading={textContent:'Essential Khoka Bhai listening',nextElementSibling:paragraph};
 const document={getElementById:id=>nodes.get(id),querySelectorAll:()=>[heading],createElement(tag){return {tag,children:[],append(child){this.children.push(child);}};}};
 const frame=enhanceKhokaListening(document);assert.equal(frame.src,collectionEmbedURL);assert.equal(frame.loading,'lazy');assert.equal(frame.referrerPolicy,'strict-origin-when-cross-origin');assert.equal(frame.allowFullscreen,true);assert.ok(Number(frame.width)>=200&&Number(frame.height)>=200);assert.match(frame.title,/Saregama collection/);assert.doesNotMatch(frame.allow,/autoplay/);
 assert.equal(nodes.size,1);assert.equal(nodes.get('khoka-collection-player').children.length,1);assert.equal(enhanceKhokaListening(document),null);assert.equal(nodes.size,1);
});
test('unrelated headings or missing verified collection links produce no player',()=>{
 assert.equal(enhanceKhokaListening({getElementById:()=>null,querySelectorAll:()=>[]}),null);
 const document={getElementById:()=>null,querySelectorAll:()=>[{textContent:'Essential Khoka Bhai listening',nextElementSibling:{tagName:'P',querySelectorAll:()=>[{href:'https://example.com/'}]}}]};
 assert.equal(enhanceKhokaListening(document),null);
});
