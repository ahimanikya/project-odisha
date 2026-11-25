import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shareDhagaStyles} from '../tools/shared-dhaga-styles.mjs';

const completeSource = readFileSync(new URL('../../odia-dhaga/sayings/POD-DHAGA-001.html', import.meta.url), 'utf8');
const allStyles = [...completeSource.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]);
const source = completeSource.replace(`<style>${allStyles[1]}</style>`, '');
const css = source.match(/<style>([\s\S]*?)<\/style>/)[1];
const page = id => ({path: `dhaga/sayings/pod-dhaga-${id}.html`, html: source});

test('shares only reviewed Dhaga CSS bytes with identical URL bases and cascade position', () => {
 const input = [page('001'), page('002')], original = structuredClone(input);
 const result = shareDhagaStyles(input);
 assert.equal(result.assets.size, 1);
 const [path, body] = [...result.assets][0];
 assert.equal(body, css);
 assert.match(path, /^dhaga\/sayings\/shared-style-[a-f0-9]{64}\.css$/);
 result.pages.forEach((p, i) => {
  assert.equal(p.html, input[i].html.replace(`<style>${css}</style>`, `<link rel="stylesheet" href="/${path}">`));
  for (const [, resource] of css.matchAll(/url\('([^']+)'\)/g)) {
   const before = new URL(resource, 'https://projectodisha.org/' + p.path);
   const after = new URL(resource, 'https://projectodisha.org/' + path);
   assert.equal(before.href, after.href);
   assert.ok(before.pathname.startsWith('/dhaga/assets/'));
  }
 });
 assert.deepEqual(input, original);
 assert.deepEqual(result, shareDhagaStyles(input));
 assert.equal(result.stats.savedBytes, 2 * (Buffer.byteLength(css) + 15 - Buffer.byteLength(`<link rel="stylesheet" href="/${path}">`)) - Buffer.byteLength(css));
 assert.deepEqual(shareDhagaStyles(result.pages).pages, result.pages);
 assert.equal(shareDhagaStyles(result.pages).assets.size, 0);
});

test('holds changed, attributed, differently based, unrelated and body-only styles', () => {
 const variants = [
  {...page('003'), path: 'dhaga/other/pod-dhaga-003.html'},
  {...page('003'), html: source.replace('<head>', '<head><base href="/elsewhere/">')},
  {...page('003'), html: source.replace(`<style>${css}</style>`, `<style media="print">${css}</style>`)},
  {...page('003'), html: source.replace(css, css + '\n')},
  {...page('003'), html: source.replace(`<style>${css}</style>`, '').replace('</body>', `<style>${css}</style></body>`)},
  {...page('003'), html: source.replace(`<style>${css}</style>`, `<!--<style>${css}</style>--><script>const example='<style>${css}</style>';</script>`)},
 ];
 const result = shareDhagaStyles([page('001'), page('002'), ...variants]);
 assert.deepEqual(result.pages.slice(2), variants);
 assert.equal(result.stats.changedPages, 2);
 assert.equal(result.stats.replacedBlocks, 2);
 assert.equal(shareDhagaStyles([page('001')]).assets.size, 0);
});


test('shares both exact styles independently without combining or reordering them', () => {
 const input = ['001', '002'].map(id => ({path: `dhaga/sayings/pod-dhaga-${id}.html`, html: completeSource}));
 const result = shareDhagaStyles(input);
 assert.equal(result.assets.size, 2);
 assert.deepEqual([...result.assets.values()], allStyles);
 assert.equal(result.stats.changedPages, 2);
 assert.equal(result.stats.replacedBlocks, 4);
 for (let i = 0; i < input.length; i++) {
  const restored = result.pages[i].html.replace(/<link rel="stylesheet" href="\/(dhaga\/sayings\/shared-style-[a-f0-9]+\.css)">/g, (_, path) => `<style>${result.assets.get(path)}</style>`);
  assert.equal(restored, input[i].html);
 }
 const before = input.reduce((sum, p) => sum + Buffer.byteLength(p.html), 0);
 const after = result.pages.reduce((sum, p) => sum + Buffer.byteLength(p.html), [...result.assets.values()].reduce((sum, css) => sum + Buffer.byteLength(css), 0));
 assert.equal(result.stats.savedBytes, before - after);
 const uniqueSecondStyle = shareDhagaStyles([input[0], page('002')]);
 assert.equal(uniqueSecondStyle.assets.size, 1);
 assert.ok(uniqueSecondStyle.pages[0].html.includes(`<style>${allStyles[1]}</style>`));
});
