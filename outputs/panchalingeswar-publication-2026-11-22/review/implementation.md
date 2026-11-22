# Panchalingeswar implementation handoff

Samanta, 22 November 2026. Input head `54bcd323606f80c9fef47ae3bf65d313a31068ed`; task POD-EDIT-PANCHALINGESWAR-20261122. Implementation evidence only; source approval, independent visual review and publication remain separate.

## Manuscript and source scope

**Panchalingeswar: A Shrine in Flowing Water** is 210 words including headings and three native source notes. SHA256 of `kb/research/places/panchalingeswar-article.md`: `27b98e2a29a1b1cbaed9a6302c0c3e884fa37468a4cb112dd6228d9f8d88478d`.

The draft identifies the Devagiri/Nilagiri hill shrine, the five lingas beneath flowing water, documented touch worship, stair ascent, recommended season and broad Balasore rail/road approach. It gives no invented founding history, origin legend, festival, present opening hours, fee, safe-water or step-free-access promise. It describes worship without telling readers to enter or reach into the stream. The inaccessible Endowment Commission lead is not cited or used. Exact step count is omitted in favour of the supported stair ascent. Root’s final prose tightening removes collection framing and the unnecessary photograph caveat, and states the stair approach directly. All three references remain unchanged.

Conservative allocations include all 45 words of title, description, card summary, eyebrow and aliases for each research family, even where only part derives from it. Markdown formatting and URL destinations are excluded; reused rendering of the same field does not introduce different editorial copy.

| Family | Allocation | Coverage |
| --- | ---: | --- |
| Balasore district / overlapping Endowment description | 98/200 | Entire opening, district note, metadata allowance and six words of hub/location allowance; no Endowment-derived claim used |
| Odisha Tourism + OTDC | 181/200 | Both relevant headings, worship paragraph, all three planning paragraphs, both Tourism/OTDC notes and metadata allowance |
| Photograph and provenance | 100/200 allowance | 27-word direct photo observation and current caption, alt, creator/licence/change words plus wrapper attribution; no claim that the five lingas are individually visible |

No research-source quotation. The three footnote IDs match the direct district, Tourism and OTDC groups in Anvesha’s dossier.

## Article and discovery presentation

Reused Jirang’s existing Shell, ArticleByline, ResponsiveImage and ArticleReadingPath pattern. Founder byline, one h1, native source heading and return links, expanded Continue reading/Further reading, and the article-specific update link are retained. Continue reading links the existing Balasore guide and Mahendragiri. The Balasore card reuses its own Chandipur sunset photograph through `destinationGuides`; the hill collection remains under Further reading.

The new hero is a semantic figure with caption. Its width is capped at 30rem and centred; the entire portrait remains visible with automatic height and intrinsic dimensions. Its `sizes` matches the narrow-screen width and 30rem cap. It loads eagerly with high fetch priority. No shared component or regional article rewrite is required.

Root’s final metadata file `kb/research/destinations/panchalingeswar-image.json` supplies `/images/destinations/panchalingeswar-shrine.jpg`, 838×1117. I inspected the full original: water between large decorated rocks, marigold garlands, red-and-gold cloth and visible roots. No capture date, five visible lingas or current condition is inferred. The article visibly credits Subhashish Panigrahi, the Commons source and CC BY-SA 3.0, with resized-copy/preview terms. Original public JPEG is unchanged. The same image feeds article sharing metadata and cards on hills, destinations and Explore through existing data mapping.

## Exact changed files

1. `kb/research/places/panchalingeswar-article.md`
2. `projects/site/src/pages/destinations/panchalingeswar.astro`
3. `projects/site/src/data/hill-destinations.ts`
4. `projects/site/src/pages/destinations/hills.astro`
5. `projects/site/src/data/discovery.ts`
6. `projects/site/tools/nimuhi-footnote-heading.mjs`
7. `projects/site/tests/build.test.mjs` — existing addend 174→175.
8. `projects/site/tests-coast/edition.test.mjs` — existing discovery addend 159→160.
9. `projects/site/tests-coast/discovery-flow.test.mjs` — both existing addends 159→160; previous illustration regression preserved.
10. This report.

Root owns image files/provenance, edition inclusion, unpublished horn-craft export exclusions and shared records. None was edited here. Expected route increment is 1354→1355. No optimizer or other-article changes.

## Bounded checks

- Installed Astro compiler-rs parsed the new article wrapper and changed hills hub successfully.
- Installed esbuild transformed both changed TypeScript data files successfully.
- Installed Satteri with the configured footnote plugin rendered the manuscript: visible Footnotes & Sources and all eight citation/return targets resolve.
- Metadata/source existence and actual Sharp dimensions match 838×1117.
- Scoped `git diff --check` passed.
- Required entry/editorial documents and saved applicable HTML, responsive-design and card guidance were reread. Retained native links/figure, constrained full-frame media and explicit sizing. The previously rejected unpinned CLI execution was not retried.

No full build, server, browser, Git mutation or publication performed. Final mobile/desktop layout, rendered card mapping and exact edition route counts remain for the coordinated build and separate review. Root must verify all emitted image variants and actual package bytes against the stated 1,786,908-byte Linux headroom. The unpublished horn draft and source image remain outside this implementation scope; root’s output-exclusion verification must cover their prose and media.

All ten implementation files released to root. No further edits pending.
