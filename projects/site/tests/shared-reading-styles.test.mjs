import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {shareReadingStyles} from '../tools/shared-reading-styles.mjs';

const css = '.reading[data-astro-cid-test]{color:navy;padding:1rem}/*ଓଡ଼ିଆ*/'.repeat(90);
const page = (name, styles = `<style>${css}</style>`) => ({
 path: `reading-room/${name}/index.html`,
 html: `<!doctype html><html><head><style>.before{color:red}</style>${styles}<style>.after{color:blue}</style></head><body><main data-astro-cid-test>Content and sources remain.</main></body></html>`
});

test('shares exact CSS bytes once, preserving style order, scopes, HTML and input', () => {
 const input = [page('one'), page('two')], original = structuredClone(input);
 const result = shareReadingStyles(input);
 assert.deepEqual(input, original);
 assert.deepEqual(result, shareReadingStyles(input));
 assert.equal(result.assets.size, 1);
 const [path, body] = [...result.assets][0];
 assert.equal(body, css);
 assert.equal(path, `assets/reading-style-${createHash('sha256').update(css).digest('hex')}.css`);
 for (let i = 0; i < input.length; i++) {
  assert.equal(result.pages[i].html, input[i].html.replace(`<style>${css}</style>`, `<link rel="stylesheet" href="/${path}">`));
 }
 assert.equal(result.stats.changedPages, 2);
 assert.equal(result.stats.replacedBlocks, 2);
 assert.equal(result.stats.sharedStyles, 1);
 const before = input.reduce((n, p) => n + Buffer.byteLength(p.html), 0);
 const after = result.pages.reduce((n, p) => n + Buffer.byteLength(p.html), Buffer.byteLength(body));
 assert.equal(result.stats.savedBytes, before - after);
 assert.ok(result.stats.savedBytes > 0);
 const again = shareReadingStyles(result.pages);
 assert.deepEqual(again.pages, result.pages);
 assert.equal(again.assets.size, 0);
});

test('leaves small, unique, attributed, URL-bearing, imported and escaped CSS unchanged', () => {
 const excluded = [
  '<style>.small{color:red}</style>',
  `<style media="print">${css}</style>`, `<style nonce="safe">${css}</style>`,
  `<style >${css}</style>`,
  ...['url(../image.png)', 'URL("/image.png")', 'url(https://example.com/a)', 'url(#filter)', '@import "theme.css";', '@charset "utf-8";', 'u\\72l(relative.png)'].map(token => `<style>${css}/* ${token} */</style>`)
 ];
 for (const style of excluded) {
  const input = [page('one', style), page('two', style)];
  const result = shareReadingStyles(input);
  assert.deepEqual(result.pages, input);
  assert.equal(result.assets.size, 0);
  assert.equal(result.stats.savedBytes, 0);
 }
 assert.equal(shareReadingStyles([page('only')]).assets.size, 0);
});

test('limits sharing to reading-room head styles and preserves unrelated styles', () => {
 const outside = {...page('outside'), path: 'stories/odisha/one/index.html'};
 const bodyOnly = page('body', '');
 bodyOnly.html = bodyOnly.html.replace('</body>', `<style>${css}</style></body>`);
 const inert = page('inert', `<!--<style>${css}</style>--><script>const example='<style>${css}</style>';</script><template><style>${css}</style></template>`);
 const attributed = page('attributes', `<style id="keep">${css}</style>`);
 const traversal = {...page('bad'), path: 'reading-room/../outside/index.html'};
 const preserved = [outside, bodyOnly, inert, attributed, traversal];
 const input = [page('one'), page('two'), ...preserved];
 const result = shareReadingStyles(input);
 assert.deepEqual(result.pages.slice(2), preserved);
 assert.equal(result.stats.changedPages, 2);
 assert.equal(result.assets.size, 1);
 assert.equal(shareReadingStyles([page('one'), outside]).assets.size, 0);
});

test('distinct qualifying styles retain their own exact content and order', () => {
 const other = css.replaceAll('navy', 'green');
 const input = [page('one', `<style>${css}</style><style>${other}</style>`), page('two', `<style>${other}</style><style>${css}</style>`)];
 const result = shareReadingStyles(input);
 assert.equal(result.assets.size, 2);
 const restore = html => html.replace(/<link rel="stylesheet" href="\/([^\"]+)">/g, (_, path) => `<style>${result.assets.get(path)}</style>`);
 result.pages.forEach((p, i) => assert.equal(restore(p.html), input[i].html));
 assert.equal(result.stats.replacedBlocks, 4);
});

test('festival stories share exact head CSS and preserve the reading-room threshold', () => {
 const css = '.story{margin:1em;padding:2em}'.repeat(45);
 const header = '<article class="article-reading"><header><a href="/stories/the-year-that-feeds-us/">Series</a></header></article>';
 const html = '<head><style>'+css+'</style></head><body>'+header+'</body>';
 const stories = ['ratha-yatra', 'snana-purnima'].map(slug => ({path:'stories/'+slug+'/index.html',html}));
 const outside = [{path:'stories/other/index.html',html:html.replace(header,'')}, {path:'reading-room/one/index.html',html}];
 const result = shareReadingStyles([...stories,...outside]);
 assert.equal(result.assets.size, 1);
 const [[path, body]] = result.assets;
 assert.equal(body, css);
 for (const story of result.pages.slice(0,2)) assert.equal(story.html.replace('<link rel="stylesheet" href="/'+path+'">','<style>'+body+'</style>'), html);
 assert.deepEqual(result.pages.slice(2), outside);
});
