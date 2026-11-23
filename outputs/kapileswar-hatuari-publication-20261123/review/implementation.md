# Kapileswar Hatuari implementation handoff

Prepared by the Samanta task-scoped implementation agent on 23 November 2026. This is an isolated candidate, not a website deployment or human approval. No foreign checkout, shared register, repository ownership record or Git history was modified.

## Destination and reader connections

- Proposed article: `/stories/kapileswar-hatuari/`.
- Correct section: **History and heritage**, `/history/`; added an illustrated incoming reading card in the candidate.
- Discovery entry uses **Places** and region **Dhenkanal**, with Hatuari/Kapileswar/Kapilesvara/Ramiala/temple/heritage aliases.
- Reciprocal related reading links connect the separate Kapilash article without merging temple identities.
- No dedicated Dhenkanal destination page was found in the inspected page inventory, so no invented `/destinations/dhenkanal/` link was added.
- Coast publication route inclusion and visible footnote-heading configuration are included in the patch.

## Files

The `candidate/` directory contains repository-relative new files and proposed versions of five shared files. **Do not copy the shared files wholesale over a newer checkout.** `candidate/integration.patch` contains the exact 53-line unified patch for those files, while `candidate/manifest.json` records their original SHA-256 hashes and inspected base `df1a8ff0cf87edd5bd29bd0bb373470c84748dfb`. Reconcile the active publication slot and newer edits before applying.

The manifest lists all five new repository files, including both public WebP assets, with byte counts and SHA-256 hashes under `new_file_integrity`.

New article Markdown is an exact copy of the coordinator's `article.md` as last read when the preview was rendered. Its `publication_authorized: false` and review-candidate state are deliberately retained. The article source and image metadata are under `candidate/kb/research/places/`; the Astro route is under `candidate/projects/site/src/pages/stories/`.

## Photograph

Original supplied source file: `/Users/ahimanikya/Downloads/Kapileswar_Mahadev_Temple.jpg`, 3456×4608, 4,821,261 bytes. Photographer **Anup525**, Commons date **16 December 2018**, [source](https://commons.wikimedia.org/wiki/File:Kapileswar_Mahadev_Temple.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The creator/licence/date were provided by the coordinator's source inspection. The implementer visually inspected the downloaded original and confirmed that its foreground is a stone-faced embankment, prompting correction of an earlier courtyard description.

Two aspect-preserving WebP delivery images were prepared with the existing sharp package: 864×1152 at quality64, 135,168 bytes; 480×640 at quality65, 42,158 bytes. Total **177,326 bytes**. Both retain the full photograph; no crop, retouching, generative change or content alteration. Original file is untouched. Caption credits creator/source/licence and resizing/compression. Preview-card cropping is disclosed. The original SHA-256 is in the candidate image metadata.

The hero uses an explicit 480/864 `srcset`, width and height, `loading=eager`, and `fetchpriority=high`. It is centred at no more than440CSS pixels. Deliberately not added to the shared automatic variant pipeline, which would duplicate existing derivatives at broader sizes and add avoidable payload near the hosting limit. Existing card component falls back to the864 image; share metadata uses the same credited image.

The image budget alone does **not** establish that the full publication package fits. A complete rebuilt package must be measured against the then-current hosting limit.

## Preview and verification

`preview/index.html` is a standalone reader preview, generated from the exact article using the project's installed Sätteri Markdown renderer and the proposed heading plugin. It links to live Project Odisha section/related/contribution destinations. It is marked noindex. It is not an Astro-rendered full website build.

Actual checks:

- Current Astro Rust compiler0.5.1 transformed the new article route and the proposed history/Kapilash pages with **zero diagnostics**. An initial attempt to use the older `@astrojs/compiler` package failed because this project uses `@astrojs/compiler-rs`; corrected and reran.
- Preview has exactly oneh1; unique HTML IDs; all local fragment targets resolve; nine footnote reference links; visible **Footnotes & Sources**; local hero source exists; eager/high-priority image attributes present.
- Project's `productionLabels()` check found zero production-label matches in the preview. Full disclosure gate is not claimed, because the standalone preview does not contain a copied central process page; it links to the real one.
- Full article and thumbnail dimensions confirmed by sharp output. Total image size177,326bytes.
- Browser visual/keyboard/mobile review: left to coordinator/independent reviewer. No browser performance, screen-reader or cross-engine pass claimed.
- No full Astro website build, regression suite, publication-package measurement, CI, merge or live verification performed. These remain integration gates.

## Guidance applied

Read `/tmp/kapileswar-web-guidance.md`, retrieved by coordinator using the project-mandated guidance tool. Applied `optimize-image-priority`: “Never use `loading=\"lazy\"` on the LCP image.” Applied `html`: “specify `width` and `height` on all `<img>` tags”. Semantic article/header/figure/figcaption/navigation, oneh1, visible numbered references and ordinary anchors require no JavaScript. Unsupported fetch priority safely falls back to browser defaults. No new dependencies or runtime features introduced.

## Remaining integration work

After the coordinator secures the single-article handoff, refresh the base, apply the bounded patch and copy only new article/media files. Reconcile the research/source registry and article rollout through the coordinator's authorized shared-record scope; these were deliberately not edited by the implementer. Run the repository's required full/coast/publication checks, inspect desktop/mobile in the actual site shell, measure the final package and obtain independent review before any authorized release.
