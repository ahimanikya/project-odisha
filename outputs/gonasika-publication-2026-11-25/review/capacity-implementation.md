# Bounded Mardala capacity implementation — 25 November 2026

Root and separate Drishti approved the measured candidate before this change. Only `projects/site/tools/optimize-publication-jpeg.mjs` and `projects/site/tests/publication-jpeg.test.mjs` changed. No asset/source bytes changed.

The existing Mardala entry now uses maximum_dimension1728, quality95, and existing updateShareDimensions:true. Global settings, nine-path allowlist, other eight entries and optimizer algorithm are unchanged. The existing same-URL credit guard replaces only its modification phrase; source/creator/licence and the instrument-versus-troupe qualification remain. Existing OG guards change2716×3024 to1552×1728. Full source frame retained; the original itself clips part of the instrument, so no whole-instrument claim is made.

## Measurements and preservation

- Source7129541B,2716×3024, SHA256 `4bea00407654109672b7ba747ec9a1ae842974931642233a1c59ca6cebbba420`.
- Prior delivery2223058B; reviewed candidate1088597B,1552×1728, SHA256 `4f1ad44a4a9bcecd14d47410e58571120935b7a93928e301dd656cbccbb3b8a1`.
- Incremental measured saving1134461B. Prior Linux headroom92097B plus saving minus new photo package1126280B projects100278B before new HTML. Actual root local/hosted gates still required.
- IPTC and XMP byte-identical; ICC absent in both; orientation1/density72 retained. Independent reviewer found EXIF changes limited to ExifImageWidth/Height. No all-EXIF-byte-equality or lossless-pixel claim. Source remains exact in repository; full/coast preservation must also be rechecked after root builds.
- Full-frame/detail comparisons were reviewed separately before acceptance. Source-frame detail retained at article display scale; resampling is lossy. Cross-platform JPEG byte differences require measurement/visual review, not an assumed hash match.

## Regression evidence

Executed installed Node25 `node --test tests/publication-jpeg.test.mjs`:9tests passed,0failed. Existing Mardala synthetic test upgraded to the actual source: checks1728/q95 settings,1552×1728 geometry, metadata, original and unrelated file preservation, >1100000B saving against prior transform, exact caption/OG-only HTML difference, and preserved credit/qualification. Wrong source credit, duplicated caption, wrong OG width and unrelated sharing image each reject without image/HTML mutation. Other eight tests remain passing, including Sahi orientation8 and all previously reviewed assets. No full build run.

`git diff --check` passed before reports. All code files released for independent/root review.

```
bc0149a7d346cb316d4e9307e38819cef9b44296ab3030d7200b8e35ef2becd1  projects/site/tools/optimize-publication-jpeg.mjs
6b5a9b07df52dba8935e12615514583c747f935e64fd845a01c9f1645a6422dc  projects/site/tests/publication-jpeg.test.mjs
```
