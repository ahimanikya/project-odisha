import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const site = join(root, 'projects/site');
const collection = JSON.parse(readFileSync(join(root, 'kb/research/stories/independent-features/collection.json'), 'utf8'));
const page = route => readFileSync(join(site, 'dist-coast', route.slice(1), 'index.html'), 'utf8');
const decoded = text => text.replaceAll('&amp;', '&').replaceAll('&#x26;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const hrefs = html => [...html.matchAll(/\bhref="([^"]+)"/g)].map(match => decoded(match[1]));
const ids = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const metadata = source => Object.fromEntries(source.slice(4, source.indexOf('\n---\n', 4)).split('\n').filter(Boolean).map(line => {
  const colon = line.indexOf(':');
  return [line.slice(0, colon), JSON.parse(line.slice(colon + 1).trim())];
}));

test('independent features have 27 distinct canonical articles in six stable categories', () => {
  assert.equal(collection.articles.length, 27);
  assert.equal(new Set(collection.articles.map(article => article.href)).size, 27);
  assert.equal(new Set(collection.articles.map(article => article.source_path)).size, 27);
  assert.equal(collection.categories.length, 6);
  const categories = new Map(collection.categories.map(category => [category.id, category.title]));
  const externalSources = new Set();
  for (const article of collection.articles) {
    assert.equal(categories.get(article.subject), article.category);
    const source = readFileSync(join(root, article.source_path), 'utf8');
    const meta = metadata(source);
    assert.equal(meta.title, article.title);
    assert.equal(meta.public_route, article.href);
    assert.ok(meta.sources.length >= 2);
    for (const source of meta.sources) externalSources.add(source.resource);
    const body = source.slice(source.indexOf('\n---\n', 4) + 5);
    assert.doesNotMatch(body, /pure[_\s-]?odisha|!\[[^\]]*\]\(/i);
  }
  assert.equal(externalSources.size, 94);
});

test('every published feature retains all citations with working reference and return targets', () => {
  for (const entry of collection.articles) {
    const html = page(entry.href);
    const article = html.match(/<article\b[^>]*independent-feature[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(article, entry.href);
    assert.equal((article.match(/<h1\b/g) || []).length, 1, entry.href);
    assert.ok(decoded(article).includes(entry.title), entry.href);
    assert.ok(article.includes('By Ahimanikya Satapathy'), entry.href);
    assert.match(article, /<section\b[^>]*data-footnotes/, entry.href);
    assert.match(article, /<h2\b[^>]*>Footnotes &amp; Sources<\/h2>/, entry.href);
    assert.doesNotMatch(article, /<details\b|pure[_\s-]?odisha|AI-generated|AI-assisted/i, entry.href);
    const meta = metadata(readFileSync(join(root, entry.source_path), 'utf8'));
    const links = hrefs(article);
    for (const source of meta.sources) assert.ok(links.includes(source.resource), `${entry.href}: ${source.resource}`);
    const targets = ids(article);
    assert.equal(targets.length, new Set(targets).size, `${entry.href}: duplicate target`);
    const references = [...article.matchAll(/<a\b[^>]*data-footnote-(?:ref|backref)[^>]*>/g)];
    assert.ok(references.length >= meta.sources.length * 2, entry.href);
    for (const [anchor] of references) {
      const href = anchor.match(/href="#([^"]+)"/)?.[1];
      assert.ok(href && targets.includes(href), `${entry.href}: ${anchor}`);
    }
    assert.ok(links.includes(collection.href + '#' + entry.subject), entry.href);
    for (const related of entry.related) assert.ok(links.includes(related.href), `${entry.href}: missing related reading`);
    assert.ok(links.includes('/contribute/?page=' + encodeURIComponent(entry.href)), entry.href);
  }
});

test('the collection exposes each article once under its category and keeps category anchors reachable', () => {
  const html = page(collection.href);
  const sections = [...html.matchAll(/<section\b[^>]*class="category"[^>]*aria-labelledby="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
  assert.equal(sections.length, collection.categories.length);
  const categoryLinks = hrefs(html);
  for (const category of collection.categories) {
    assert.ok(categoryLinks.includes('#' + category.id));
    const section = sections.find(match => match[1] === category.id)?.[2];
    assert.ok(section);
    assert.match(section, /<ul\b[^>]*class="feature-list"[^>]*role="list"/);
    const links = hrefs(section);
    assert.deepEqual(links, collection.articles.filter(article => article.subject === category.id).map(article => article.href));
  }
});

test('Explore exposes all 27 features and their public categories', () => {
  const html = page('/explore/');
  const links = hrefs(html);
  for (const entry of collection.articles) assert.ok(links.includes(entry.href), entry.href);
  assert.ok(links.includes(collection.href));
  const publicCategories = {food: 'Food', arts: 'Living culture', places: 'Places', nature: 'Nature and environment', history: 'History and heritage', economy: 'Economy, livelihoods and infrastructure'};
  const cards = [...html.matchAll(/<article\b[^>]*data-entry="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  for (const entry of collection.articles) {
    const card = cards.find(match => hrefs(match[2]).includes(entry.href));
    assert.ok(card, entry.href);
    assert.equal(JSON.parse(decoded(card[1])).category, publicCategories[entry.subject], entry.href);
  }
  for (const category of Object.values(publicCategories)) assert.ok(decoded(html).includes(category), category);
});
