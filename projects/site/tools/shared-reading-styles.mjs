import {createHash} from 'node:crypto';

const readingPage = path => /^reading-room\/[^?#]+\.html$/.test(path) &&
 !path.split('/').some(part => part === '.' || part === '..');
// Built HTML only: ignore comments/scripts/templates, and keep body styles inline.
const headNodes = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<template\b[^>]*>[\s\S]*?<\/template>|<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
function mapHeadStyles(html, transform) {
 return html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i, (_, open, head, close) =>
  open + head.replace(headNodes, (match, attributes, css) =>
   css === undefined ? match : transform(match, attributes, css)) + close);
}
function shareable(attributes, css) {
 // Conservatively exclude all URLs/imports/escapes, including absolute URLs.
 // External CSS must not acquire a different URL base or encoding semantics.
 return attributes === '' && Buffer.byteLength(css) >= 4096 &&
  !/url\s*\(|@import\b|@charset\b|\\/i.test(css);
}

// Share only exact duplicate large reading-room head styles, without rewriting CSS.
export function shareReadingStyles(pages) {
 const candidates = new Map();
 for (const page of pages) {
  if (!readingPage(page.path)) continue;
  mapHeadStyles(page.html, (match, attributes, css) => {
   if (shareable(attributes, css)) candidates.set(css, (candidates.get(css) || 0) + 1);
   return match;
  });
 }
 const assets = new Map(), links = new Map();
 for (const [css, count] of candidates) {
  if (count < 2) continue;
  const digest = createHash('sha256').update(css).digest('hex');
  const path = `assets/reading-style-${digest}.css`;
  const link = `<link rel="stylesheet" href="/${path}">`;
  if (count * (Buffer.byteLength(css) + 15 - Buffer.byteLength(link)) <= Buffer.byteLength(css)) continue;
  assets.set(path, css);
  links.set(css, link);
 }
 let replacedBlocks = 0, changedPages = 0, htmlBytesSaved = 0;
 const output = pages.map(page => {
  if (!readingPage(page.path)) return {...page};
  const html = mapHeadStyles(page.html, (match, attributes, css) => {
   if (attributes !== '' || !links.has(css)) return match;
   replacedBlocks++;
   return links.get(css);
  });
  if (html !== page.html) changedPages++;
  htmlBytesSaved += Buffer.byteLength(page.html) - Buffer.byteLength(html);
  return {...page, html};
 });
 const assetBytes = [...assets.values()].reduce((sum, css) => sum + Buffer.byteLength(css), 0);
 return {pages: output, assets, stats: {sharedStyles: assets.size, replacedBlocks, changedPages, savedBytes: htmlBytesSaved - assetBytes}};
}
