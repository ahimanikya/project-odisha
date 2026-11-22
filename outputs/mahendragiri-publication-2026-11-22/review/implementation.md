# Mahendragiri implementation handoff

Samanta, 22 November 2026. Input head: `dc009e63517ffc99d95a6d5448ca0c10c83f676a`. Separate implementation pass, not independent source/quality approval or publication evidence.

## Manuscript and presentation

- Title: **Mahendragiri: Mountain Shrines and Forest Life**.
- Canonical manuscript: `kb/research/places/mahendragiri-article.md`.
- SHA256: `5d16ae57ffcb73a0015a167771adfeb6d0d15e01f32c2bff68e57cbfadac8d6c`.
- 449 words including section headings and seven visible source notes; frontmatter excluded from this length but included in source budgets below.
- Root's corrections included: verified 1,501-metre elevation; Tourism association with Parashurama rather than an unsupported meditation claim; compact religious-memory transition.
- Protected shrine names, designation date and extent, forest types and dated orchid record use distinct native notes. No rank, construction attribution, biosphere-reserve designation, exact final-road distance, operating services or orchid-sighting guarantee.
- Existing Putsil layout reused: Founder byline, full-frame eager hero, intrinsic dimensions from metadata, native visible source heading, full photograph attribution/source/licence/change statement and explicit Shell sharing image.
- Same original landscape photo supplies destination, hills and Explore cards. Continue reading links Deomali and Mandasaru; Mandasaru retains its visible Illustration label. Further reading and article-specific contribution link remain expanded.

## Conservative source-family budgets

Counts use visible words after removing Markdown syntax and URL destinations. All 40 words of title, description, destination summary, eyebrow and aliases are charged to **every** family below, even where only a small portion derives from it. Repeated rendering of the same data field in article/share/card is the same editorial copy. Entire mixed paragraphs are charged to each relevant family. These are conservative allocations, not a claim that generic visitor advice is copied from sources.

| Family | Allocation | Included passages |
| --- | ---: | --- |
| Gajapati district | 103/200 | Entire opening, location note, 40-word metadata allowance, plus 12 words for new hub/discovery name/location mentions |
| ASI | 175/200 | Entire opening, shrine heading, both shrine paragraphs, ASI note, metadata allowance |
| Biodiversity authorities/notification | 158/200 | Entire opening, forest heading, designation/forest paragraph, both notes, metadata allowance |
| Dash et al./Journal of Threatened Taxa | 171/200 | Forest heading, orchid paragraph, entire following interpretation/advice paragraph, full paper note, metadata allowance |
| Odisha Tourism (both pages together) | 162/200 | Entire Parashurama paragraph, planning heading, both planning paragraphs, both Tourism notes, metadata allowance |

Photograph alt/caption and credit text come from the selected image's provenance and direct visual assessment; no botanical identification is inferred from the photograph. No verbatim research passage is quoted. Stable IDs are the seven footnote identifiers used in the manuscript and Anvesha's dossier.

## Changed files in reserved scope

Article/integration:

- `kb/research/places/mahendragiri-article.md`
- `projects/site/src/pages/destinations/mahendragiri.astro`
- `projects/site/src/data/hill-destinations.ts`
- `projects/site/src/pages/destinations/hills.astro`
- `projects/site/src/data/discovery.ts`
- `projects/site/tools/nimuhi-footnote-heading.mjs`
- `projects/site/tests/build.test.mjs` — full page addend170→171.
- `projects/site/tests-coast/edition.test.mjs` — discovery addend156→157.
- `projects/site/tests-coast/discovery-flow.test.mjs` — two corresponding discovery addends; previous illustration regression preserved.
- This report.

Earlier completed capacity scope, retained:

- `projects/site/tools/optimize-publication-jpeg.mjs`
- `projects/site/tests/publication-jpeg.test.mjs`
- `outputs/mahendragiri-publication-2026-11-22/capacity/findings.md`

The delivery-only conversations JPEG change and real-source regression are detailed in the capacity report. Original public/coastal image, URL, second photograph, sharing image and book links remain unchanged. Measured savings2,613,929 bytes; actual package gate remains required.

## Bounded validation

- Actual installed Astro7 compiler-rs parsed both new article wrapper and changed hills hub successfully.
- Installed esbuild transformed both changed TypeScript data files successfully.
- Actual installed Satteri Markdown processor rendered manuscript with the configured native-footnote plugin: visible Footnotes & Sources heading and all16 citation/return links resolved.
- Scoped `git diff --check`: pass.
- Earlier targeted JPEG regression:4 tests passed,0 failed. No subsequent capacity-code edits.
- First static-check attempt referenced unavailable legacy compiler/TypeScript packages; it made no changes. Repeated successfully using the installed compiler-rs and esbuild dependencies; no package installation or network execution.
- Saved HTML/responsive/card guidance reused. Native semantic figure/figcaption, one h1, intrinsic image sizing, ordinary links and existing responsive layout retained. Rejected unpinned guidance execution was not retried.

No full/coastal/publication build, Git mutation or release action performed in this implementation pass. Root owns edition/route/responsive/search inventories and shared records. Full route/discovery count tests, visual review, source review, actual Linux payload and live delivery remain for the coordinated release.

Implementation scope released to root for separate review; no further edits pending.
