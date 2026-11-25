# Jirang–Chandragiri implementation handoff

Samanta, 22 November 2026. Input head `39da6cb89f49558148676b7162f7aab04a644c2e`; task POD-EDIT-JIRANG-CHANDRAGIRI-20261122. Implementation evidence only, not independent factual approval or publication.

## Final manuscript

**Jirang–Chandragiri: A Monastery in Odisha’s Hills**, 345 words including section headings and four native source notes. Manuscript SHA256: `6bbbc602670f2a156cfe3d969adcd3e014cfbf4cff9a8009a13385ac151d7563`.

The article distinguishes Phuntsokling’s 1963 establishment from the monastery’s 2010 inauguration; links Rigon Thupten Mindrolling and Padmasambhava Mahavihara to the Ripa tradition; gives the central hall figures from the institutional source; and keeps regional travel and visitor conduct concise. Source-supported livelihood details do not promise visitor access to workshops or private life. No superlative, invented visit, exact gate distance, current prayer timetable, fee, room or service guarantee is introduced. Root’s requested removal of the human-scale sentence and redundant photo sentence is complete.

Conservative source-family allocations include all 49 words of public title, description, card summary, eyebrow and alias text for every research family, even where only a portion derives from that family. Counts strip Markdown formatting and URL destinations; repeated rendering of the same field is the same editorial copy.

| Family | Allocation | Coverage |
| --- | ---: | --- |
| Settlement history: CTRC + Dalai Lama’s Office | 194/200 | Entire mixed opening, settlement heading, both settlement paragraphs, combined note, metadata allowance and the six-word observation that the settlement was already decades old |
| Ripa institutional family | 160/200 | Entire mixed opening, monastery heading, hall/institution paragraph, combined Ripa note and metadata allowance |
| Gajapati district | 133/200 | Entire mixed opening, inauguration paragraph, district note, metadata allowance and six-word hub/location allowance |
| Odisha Tourism | 130/200 | Planning heading, both visit paragraphs, note and metadata allowance |
| Photograph/provenance | 90/200 allowance | 26-word direct photo observation plus current caption, alt, creator/licence and change text, including wrapper attribution words |

No direct research-source quotation. The four native identifiers map to Anvesha’s primary-source dossier. The Office corroboration belongs to the settlement allocation, not an extra budget.

## Presentation and media

The Taptapani wrapper is reused with the existing Shell, ArticleByline, ResponsiveImage and ArticleReadingPath components. Founder byline, one h1, readable article column, full-frame eager hero with intrinsic dimensions, visible native Footnotes & Sources, expanded reading paths and article-specific contribution link are retained. Continue reading connects Taptapani and Mahendragiri.

The final metadata import is `kb/research/destinations/jirang-chandragiri-image.json`. The root-selected 1200×757 public WebP at `/images/destinations/jirang-monastery.webp` is used in the article, destination/hills/Explore cards and explicit Shell sharing metadata. I inspected that full derivative: blue window frames, gilded roof ornaments and entrance steps are visibly supported. No interior statue or religious identity is inferred from this exterior photograph. Caption and attribution visibly identify Shrimaanyashraj, the Commons source, CC BY-SA 4.0 and resizing/compression/preview-crop changes. Source rights and façade identity require the separate review already assigned by root.

All three incoming hubs reuse `hillDestinationGuides`; no shared card or Explore component changed. Odia display name remains blank rather than inventing a spelling.

## Exact changed files

1. `kb/research/places/jirang-chandragiri-article.md`
2. `projects/site/src/pages/destinations/jirang-chandragiri.astro`
3. `projects/site/src/data/hill-destinations.ts`
4. `projects/site/src/pages/destinations/hills.astro`
5. `projects/site/src/data/discovery.ts`
6. `projects/site/tools/nimuhi-footnote-heading.mjs`
7. `projects/site/tests/build.test.mjs` — existing full-route addend 173→174.
8. `projects/site/tests-coast/edition.test.mjs` — existing discovery addend 158→159.
9. `projects/site/tests-coast/discovery-flow.test.mjs` — two existing addends 158→159; earlier illustration regression retained.
10. This report.

Root’s actual coastal inventory now contains 1,354 routes. Binchana is a completed published article on the current base; this implementation does not restore its earlier draft-only boundary. Shared records, route/search/responsive inventories, image assets and the selected Mentis optimizer change are root-owned and were not edited by this implementation pass.

## Bounded verification and remaining gates

- Installed Astro compiler-rs parsed the new destination wrapper and modified hills page successfully.
- Installed esbuild transformed both changed TypeScript data files successfully.
- Installed Satteri with the configured footnote plugin rendered the manuscript with a visible source heading; all 14 citation/return links resolved. Subsequent prose tightening removed only two ordinary sentences and preserved every citation.
- Final image metadata fields and referenced public image existence checked.
- Scoped `git diff --check` passed after final prose tightening.
- Saved HTML/responsive/card guidance reused with the existing semantic figure/figcaption, image dimensions and native links. Prior rejected unpinned execution was not retried. Root separately checked current MDN image guidance.

No new permanent test mirrors this simple route/template reuse. Existing full/coastal route, image, source and discovery checks must run against the rebuilt output. No full build, server, Git mutation or publication was performed here.

Root measured the selected original-derived WebP plus all three responsive widths at 715,678 bytes: the 1,440px configuration clamps to an additional 1,200px variant. Earlier two-variant estimates are superseded. The actual local and Linux publication gates remain necessary after root’s separately reviewed Mentis delivery change. No budget weakening, source deletion or book alteration is proposed.

Source review, separate integrated/visual review, actual package capacity and live delivery remain with the coordinated release. All ten implementation files released; no further edits pending.
