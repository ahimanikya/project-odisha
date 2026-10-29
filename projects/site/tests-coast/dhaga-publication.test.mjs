import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('Dhaga collection points to its existing series introduction without changing book source',()=>{
 const article=readFileSync('dist-coast/stories/odia-dhaga/index.html','utf8'),index=readFileSync('dist-coast/dhaga/index.html','utf8');
 assert.match(article,/Dhaga Series · Introduction/);assert.match(article,/The Poetry We Speak: Why Odia Dhaga Matter/);assert.match(article,/By Ahimanikya Satapathy/);assert.match(article,/href="\/dhaga\/"[^>]*>Open Words We Carry/);
 const link='<a href="/stories/odia-dhaga/">Read the introduction: The Poetry We Speak →</a>';assert.equal(index.split(link).length-1,1);assert.ok(index.indexOf(link)<index.indexOf('<img class="book-cover"'));assert.ok(!readFileSync('../odia-dhaga/index.html','utf8').includes(link));
});
