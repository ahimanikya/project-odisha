import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(path, 'utf8');
const route = '/stories/odia-cultural-identity/';
const html = read('dist-coast' + route + 'index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const article = html.match(/<article class="article-reading odia-identity-story"[\s\S]*?<\/article>/)?.[0];
const outsideDisclosures = article?.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '') || '';
const text = article?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ') || '';

test('Identity essay renders one title, credited prose and an accessible reading structure', () => {
  assert.ok(article, 'Essay uses the shared reading layout');
  assert.equal((article.match(/<h1\b/g) || []).length, 1);
  assert.match(article, /By Ahimanikya Satapathy/);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  const description = html.match(/name="description" content="([^"]*)"/)?.[1];
  assert.ok(description && description.length <= 250, 'Supply a concise article-specific search description');
  assert.match(html, /rel="canonical" href="https:\/\/projectodisha.org\/stories\/odia-cultural-identity\/"/);
  assert.doesNotMatch(article, /Prepared with AI assistance|human editorial review pending/);
  assert.equal((article.match(/<img\b/g) || []).length, 7, 'Hero plus six reading-path images');
  const figure = article.match(/<figure class="identity-illustration"[\s\S]*?<\/figure>/)?.[0];
  assert.ok(figure, 'The approved illustration appears in the article');
  assert.match(figure, /src="\/images\/stories\/odia-identity-passing-on-culture.webp"/);
  assert.match(figure, /width="1536" height="1024"/);
  assert.match(figure, /alt="Illustration of an older woman and a child folding leaves around pitha batter together."/);
  assert.match(figure, /Illustration · Culture lives in what we pass on./);
  assert.ok(readFileSync('dist-coast/images/stories/odia-identity-passing-on-culture.webp').length > 0);
  assert.ok(article.indexOf('</header>') < article.indexOf('<figure'), 'Figure follows the article header');
  assert.match(text, /Navaratri/i);
  assert.match(text, /Dashami|Dasami/i);
  assert.match(text, /nine nights/i);
  assert.match(text, /tenth day/i);
  assert.match(text, /Nuakhai/);
  assert.match(text, /Dalkhai/);
});

test('All native source markers reach visible notes and each note returns to the prose', () => {
  assert.match(outsideDisclosures, /Footnotes &amp; Sources|Footnotes & Sources/);
  const notes = outsideDisclosures.match(/<section[^>]*class="footnotes"[\s\S]*?<\/section>/)?.[0];
  assert.ok(notes, 'Sources remain visible outside Further reading');
  const markers = [...article.matchAll(/<a\b(?=[^>]*\bdata-footnote-ref(?:[=\s>]))[^>]*>/g)].map(m => m[0]);
  assert.ok(markers.length >= 5, 'Research essay should have traceable source markers');
  const ids = [...article.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, 'Fragment IDs must be unique');
  for (const marker of markers) {
    const target = marker.match(/href="#([^"]+)"/)?.[1];
    const origin = marker.match(/\bid="([^"]+)"/)?.[1];
    assert.ok(target && notes.includes(`id="${target}"`), `Missing source target: ${target}`);
    assert.ok(origin && notes.includes(`href="#${origin}"`), `Missing return link: ${origin}`);
  }
  assert.match(notes, /href="https?:\/\//);
});

test('Readers can discover the article, see further reading and submit a public correction', () => {
  const scope = JSON.parse(read('editions/coast.json')).routes;
  assert.ok(scope.includes(route));
  assert.ok(read('dist-coast/explore/index.html').includes(`href="${route}"`), 'Article is discoverable');
  const further = article.match(/<section id="identity-further-reading"[\s\S]*?<\/section>/)?.[0];
  assert.ok(further);
  assert.match(further, /<h2[^>]*>Further reading<\/h2>/);
  assert.doesNotMatch(further, /<details\b/);
  for (const path of ['/languages/odia/', '/sounds-of-odisha/dalkhai/', '/textiles/sambalpuri-bandha/', '/culture/osha/nuakhai/']) {
    assert.ok(scope.includes(path), 'Further reading stays in this edition: ' + path);
    assert.ok(further.includes(`href="${path}"`));
    assert.ok(read('dist-coast' + path + 'index.html').length > 0);
  }
  assert.match(outsideDisclosures, /href="\/contribute\/\?page=%2Fstories%2Fodia-cultural-identity%2F"[^>]*>Suggest an update/);
  assert.match(outsideDisclosures, /GitHub submissions are public; omit private contact details and consent documents/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});
