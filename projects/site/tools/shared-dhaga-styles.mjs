import {createHash} from 'node:crypto';

// Two reviewed, unchanged stylesheets shared by the standalone saying pages.
const reviewed = new Map([
 ['ed9664a556f438148d9f53935a213d6af58f4873521102c0ae8984d3fb79c0a3', 6028],
 ['44d51bdc0254d5f42e74e997c22b36c823cb26b8aa5cc8d8b7e52ac19b684e08', 1419]
]);
const origin = 'https://projectodisha.org/';
const nodes = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<template\b[^>]*>[\s\S]*?<\/template>|<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
function transform(page, replace) {
 if (!/^dhaga\/sayings\/pod-dhaga-\d{3}\.html$/.test(page.path)) return page.html;
 // A base element changes the inline stylesheet base. Hold such pages unchanged.
 if (/<base\b/i.test(page.html)) return page.html;
 const documentURL = new URL(page.path, origin);
 return page.html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i, (_, open, head, close) =>
  open + head.replace(nodes, (whole, attributes, css) => {
   if (attributes !== '' || css === undefined) return whole;
   const digest = createHash('sha256').update(css).digest('hex');
   if (reviewed.get(digest) !== Buffer.byteLength(css)) return whole;
   const assetPath = `dhaga/sayings/shared-style-${digest}.css`, stylesheetURL = new URL(assetPath, origin);
   if (new URL('.', documentURL).href !== new URL('.', stylesheetURL).href) throw Error('Dhaga CSS base mismatch');
   for (const [, resource] of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
    if (new URL(resource, documentURL).href !== new URL(resource, stylesheetURL).href) throw Error('Dhaga CSS resource base mismatch');
   }
   return replace(whole, css, assetPath);
  }) + close);
}

export function shareDhagaStyles(pages) {
 const candidates = new Map(), assets = new Map();
 for (const page of pages) transform(page, (whole, css, path) => {
  const candidate = candidates.get(path) || {css, count: 0};
  candidate.count++;
  candidates.set(path, candidate);
  return whole;
 });
 for (const [path, {css, count}] of candidates) if (count >= 2) assets.set(path, css);
 let changedPages = 0, replacedBlocks = 0;
 let savedBytes = -[...assets.values()].reduce((total, css) => total + Buffer.byteLength(css), 0);
 const output = pages.map(page => {
  const html = transform(page, (whole, _css, path) => {
   if (!assets.has(path)) return whole;
   replacedBlocks++;
   return `<link rel="stylesheet" href="/${path}">`;
  });
  if (html !== page.html) changedPages++;
  savedBytes += Buffer.byteLength(page.html) - Buffer.byteLength(html);
  return {...page, html};
 });
 return {pages: output, assets, stats: {changedPages, replacedBlocks, savedBytes}};
}
