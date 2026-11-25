import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const site = join(root, 'projects/site');
const collection = JSON.parse(readFileSync(join(root, 'kb/research/stories/independent-features/collection.json'), 'utf8'));
const images = JSON.parse(readFileSync(join(root, 'kb/research/stories/independent-features/images.json'), 'utf8'));
const preview = image => image.small_src && image.small_width && image.small_height ? {...image, src: image.small_src, width: image.small_width, height: image.small_height} : image;
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
    const links = [...section.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].flatMap(match => hrefs(match[1]));
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


test('all 27 article images have local raster assets, dimensions and independent rights metadata', async () => {
  assert.deepEqual(Object.keys(images).sort(), collection.articles.map(article => article.slug).sort());
  for (const entry of collection.articles) {
    const image = images[entry.slug];
    for (const key of ['src', 'alt', 'caption', 'title', 'creator', 'source', 'license', 'changes', 'kind']) assert.ok(typeof image[key] === 'string' && image[key].trim(), `${entry.slug}: ${key}`);
    assert.doesNotMatch(JSON.stringify(image), /pure[_\s-]?odisha|instagram\.com/i, entry.slug);
    if (image.source.startsWith('/')) {
      assert.match(image.source, /^\/(?!\/)/, `${entry.slug}: local source`);
      assert.equal(image.license_url, null, `${entry.slug}: local original source`);
    }
    assert.equal(new URL(image.source, 'https://projectodisha.org').protocol, 'https:', `${entry.slug}: source`);
    if (image.license === 'Original Project Odisha artwork; no third-party licence applies') {
      assert.equal(image.license_url, null, entry.slug);
    } else {
      assert.ok(typeof image.license_url === 'string' && image.license_url, `${entry.slug}: external licence URL`);
      assert.equal(new URL(image.license_url).protocol, 'https:', `${entry.slug}: license_url`);
    }
    for (const variant of [image, preview(image)]) {
      assert.match(variant.src, /^\/(?:assets|images)\/[a-zA-Z0-9/_.-]+\.(?:png|jpe?g|webp)$/i, entry.slug);
      assert.ok(!variant.src.includes('..'), entry.slug);
      const bytes = readFileSync(join(site, 'public', variant.src.slice(1)));
      const actual = await sharp(bytes).metadata();
      assert.ok(['png', 'jpeg', 'webp'].includes(actual.format), `${entry.slug}: raster format`);
      assert.equal(actual.width, variant.width, `${entry.slug}: width`);
      assert.equal(actual.height, variant.height, `${entry.slug}: height`);
    }
  }
});

test('article, collection, Explore and social previews retain the reviewed images and credits', () => {
  const collectionHTML = page(collection.href), exploreHTML = page('/explore/');
  const creditList = exploreHTML.match(/<details\b[^>]*class="explore-credits[^"]*"[^>]*>([\s\S]*?)<\/details>/)?.[1] || '';
  const creditRows = [...creditList.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(match => match[1]);
  const cards = [...exploreHTML.matchAll(/<article\b[^>]*data-entry="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  for (const entry of collection.articles) {
    const image = images[entry.slug], small = preview(image), html = page(entry.href);
    const figure = html.match(/<figure\b[^>]*class="feature-image"[^>]*>([\s\S]*?)<\/figure>/)?.[1];
    assert.ok(figure, entry.slug);
    assert.ok(figure.includes(`src="${image.src}"`), entry.slug);
    assert.ok(decoded(figure).includes(image.alt), entry.slug);
    assert.match(figure, /loading="eager"/, entry.slug);
    assert.match(figure, /fetchpriority="high"/, entry.slug);
    assert.ok(figure.includes(`width="${image.width}"`) && figure.includes(`height="${image.height}"`), entry.slug);
    for (const value of [image.caption, image.title, image.creator, image.license, image.changes]) assert.ok(decoded(figure).includes(value), `${entry.slug}: missing credit text`);
    for (const value of [image.source, image.license_url].filter(Boolean)) assert.ok(hrefs(figure).includes(value), `${entry.slug}: missing credit link`);
    assert.ok(decoded(figure).includes(`>${image.title}</a>`), `${entry.slug}: source image title`);
    if (image.license_url === null) assert.doesNotMatch(figure, /<a[^>]*>Original Project Odisha artwork/, entry.slug);
    const og = html.match(/<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1];
    const twitter = html.match(/<meta\b[^>]*name="twitter:image"[^>]*content="([^"]+)"/)?.[1];
    assert.equal(og, 'https://projectodisha.org' + image.src, entry.slug);
    assert.equal(twitter, og, entry.slug);
    const previewItem = [...collectionHTML.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].find(match => hrefs(match[1]).includes(entry.href))?.[1];
    assert.ok(previewItem?.includes(`src="${small.src}"`), entry.slug);
    assert.match(previewItem, /loading="lazy"/, entry.slug);
    assert.ok(decoded(previewItem).includes(`>${image.title}</a>`), `${entry.slug}: preview source title`);
    const previewCaption = previewItem.match(/<p\b[^>]*class="feature-image-caption"[^>]*>([\s\S]*?)<\/p>/)?.[1];
    assert.equal(decoded(previewCaption || ''), image.caption, `${entry.slug}: visible collection image context`);
    const credit = creditRows.find(row => hrefs(row).includes(image.source) &&
      [image.title, image.caption, image.creator, image.license, image.changes].every(value => decoded(row).includes(value)));
    assert.ok(credit, `${entry.slug}: complete Explore image attribution and context`);
    assert.ok(decoded(credit).includes(`>${image.title}</a>`), `${entry.slug}: Explore source title`);
    if (image.license_url) assert.ok(hrefs(credit).includes(image.license_url), `${entry.slug}: Explore licence link`);
    for (const value of [image.source, image.license_url].filter(Boolean)) assert.ok(hrefs(previewItem).includes(value), entry.slug);
    const card = cards.find(match => hrefs(match[2]).includes(entry.href))?.[2];
    assert.ok(card?.includes(`src="${small.src}"`), entry.slug);
    assert.match(card, /<img\b[^>]*class="[^"]*\bexplore-contain\b/, `${entry.slug}: full Explore framing`);
    if (image.small_src && image.small_width) {
      const srcset = `${image.small_src} ${image.small_width}w, ${image.src} ${image.width}w`;
      assert.ok(card.includes(`srcset="${srcset}"`), `${entry.slug}: responsive Explore choices`);
      assert.ok(previewItem.includes(`srcset="${srcset}"`), `${entry.slug}: responsive collection choices`);
      assert.match(card, /sizes="[^"]*650px/, `${entry.slug}: Explore display sizes`);
    }
    for (const value of [image.source, image.license_url].filter(Boolean)) assert.ok(hrefs(exploreHTML).includes(value), entry.slug);
  }
});
