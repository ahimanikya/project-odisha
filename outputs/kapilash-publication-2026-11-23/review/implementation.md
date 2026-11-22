# Kapilash implementation handoff

Samanta, 23 November 2026. Input head `6be88b16a06bb32e85e9b13adaa5b201aaa8da5a`; task POD-EDIT-KAPILASH-20261123. Implementation evidence, not independent source approval or publication.

## Final article and evidence boundaries

**Kapilash: A Hill Shrine and an Older Temple’s Trace**, 314 words including section headings and four native source notes. Manuscript SHA256: `f3c0abeeb054c399b22cec5df853dfdaa2bdaf4cdfbff69b3b0e4e1325c11ace`.

The article gives Chandrasekhar’s hill-pilgrimage setting, explicitly legendary Kailash association, Mahashivaratri context, a compact explanation of Sircar’s detached-kalasa study, the qualified 1246/Narasimhadeva I reading and the ASI protection of the ensemble and ancient steps. It distinguishes the inferred earlier building from the present temple. It makes no promise that the detached object is currently displayed or accessible. No elevation, exact stair count, current opening hours, fees, guaranteed road access or unrelated cave/wildlife claim.

The practical paragraph was consolidated following root’s review: travellers are asked to confirm road restrictions and their final walking approach, particularly for assistance or a step-free route. It promises neither. The article is deliberately shorter than the suggested range rather than padded.

## Conservative source-family budgets

All 46 words of public title, description, destination summary, eyebrow and aliases are charged to each research family, even where only part derives from it. Counts strip Markdown syntax and URL destinations. Repeated rendering of a field reuses the same editorial copy. Mixed passages are counted in full where indicated.

| Family | Allocation | Included material |
| --- | ---: | --- |
| Dhenkanal district | 134/200 | Entire opening, pilgrimage heading and paragraph, district note, metadata allowance and six-word hub/location allowance |
| Odisha Tourism and mirrors | 151/200 | Entire opening, planning heading, both planning paragraphs, Tourism note and metadata allowance |
| ASI archaeology: Sircar + protected list | 171/200 | History heading, whole 77-word kalasa paragraph, 18-word protection sentence, both 13-word notes and metadata allowance |
| Photograph/provenance | 100/200 allowance | 29-word direct observation plus all current caption, alt, creator, licence, changes and wrapper attribution words |

Sircar’s interpretation remains explicitly attributed and qualified. The two ASI publications share one allocation. No research passage is quoted beyond the short bibliographic article title; all source families remain within the 25-word verbatim ceiling. Four native note IDs match Anvesha’s dossier.

## Presentation and reading paths

Reused the Panchalingeswar wrapper and existing Shell, ArticleByline, ResponsiveImage and ArticleReadingPath components. The portrait is centred and capped at 30rem, with automatic height, full-frame display, explicit intrinsic dimensions and matching responsive sizes. The hero is eager/high-priority. Founder byline, one h1, visible Footnotes & Sources, expanded reading paths and article-specific contribution link remain intact.

The root-selected `/images/destinations/kapilash-temple.webp` is 960×1280 and 267374 bytes. I inspected the complete derivative: white towers and smaller carved shrines, red bases, courtyard and palms support the short visual paragraph. The wrapper imports exact Anup525/Commons/CC BY-SA 4.0 credits and resizing/preview terms from `kb/research/destinations/kapilash-image.json`. The dated photograph does not establish present conditions. The larger original remains root-owned outside public output. The same selected image serves article sharing metadata and incoming hills/destinations/Explore cards.

Continue reading connects Panchalingeswar and the existing **Mahima Dharma and the Poetry of Bhima Bhoi** chapter. The latter is explicitly presented as a separate religious tradition and uses its own Joranda photograph from `cultural-book.json`; no Mahima facts are transferred to Kapilash. Further reading links the hills collection. No additional image copy or shared component is introduced.

## Exact changed files

1. `kb/research/places/kapilash-article.md`
2. `projects/site/src/pages/destinations/kapilash.astro`
3. `projects/site/src/data/hill-destinations.ts`
4. `projects/site/src/pages/destinations/hills.astro`
5. `projects/site/src/data/discovery.ts`
6. `projects/site/tools/nimuhi-footnote-heading.mjs`
7. `projects/site/tests/build.test.mjs` — existing full-build addend 176→177.
8. `projects/site/tests-coast/edition.test.mjs` — discovery addend 160→161.
9. `projects/site/tests-coast/discovery-flow.test.mjs` — both discovery addends 160→161; earlier image/illustration regression unchanged.
10. This report.

Root’s coastal inventory currently contains 1357 routes. The horn-craft article is already published on this base; no stale draft exclusion is added. Root owns media, edition/search/portable inventories, shared records, publishing and the actual capacity gate.

## Bounded verification

- Installed Astro compiler-rs parsed the new wrapper and changed hills page successfully.
- Installed esbuild transformed both changed TypeScript data files successfully.
- Installed Satteri with the configured native-footnote plugin rendered the manuscript with the visible source heading and all 12 citation/return targets resolving. Final practical-wording consolidation preserved every citation.
- Actual Sharp dimensions match the 960×1280 image metadata; public file and required credit fields exist.
- All three outgoing reading routes are in the coastal inventory; the exact existing Joranda image file exists.
- Scoped `git diff --check` passed after final wording change.
- Current entry/editorial/role records and modern-web skill were read; applicable saved HTML, responsive and card guidance reused. The guidance’s “specify width and height on all img tags” and high-priority hero principles remain implemented through existing components. The previously rejected unpinned CLI was not retried.

No full build, server, browser, Git mutation, source-media edit or shared-record change performed. Separate source and visual review, full/coastal tests and actual local/Linux publication-byte gates remain required. Root’s estimated image-plus-two-variant budget is 592826 bytes against 676426 bytes of initial Linux headroom; the estimated 83600-byte remainder does not establish that HTML/index growth or platform encodings fit. The actual package must decide.

All ten implementation files are frozen and released to root; no further edits pending.
