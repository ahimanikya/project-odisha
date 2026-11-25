# Olasuni implementation handoff

Status: implementation frozen for separate source and quality review; no full builds, Git changes or publication performed by Samanta.

## Scope

- `kb/research/places/olasuni-article.md` — SHA256 `bd3c87392a277df871de542cafc3d180636c7156e4d5264fd4f12c0252dee1a9`
- `projects/site/src/pages/destinations/olasuni.astro` — SHA256 `3ebe35d4936f78314bc26299c0508b453ab37fc9b49fdeda6bab1e32fd2055d0`
- `projects/site/src/data/hill-destinations.ts` — SHA256 `e0d572b85cd8ec9cc702035b8c1a3062a4976e053a7ed5e02b03548cc8b17fc0`
- `projects/site/tools/nimuhi-footnote-heading.mjs` — SHA256 `ffd79a8d1499ae99be75961df851d5ebbf457f065002e0b0e61cdcb0826ca91b`
- `projects/site/editions/coast.json` — SHA256 `9725536c1213010836659aaaa9447be276eea168f953d0587ac8745bb60c7707`
- `projects/site/editions/search-candidate.json` — SHA256 `1b2560281523e5de025b787f551a0be78924b718b51a9764964b1a41edc2e068`
- `projects/site/editions/responsive-images.json` — SHA256 `5d91f34819b229876f0d93d0d03982ef1ad7e546cf2ec85abd0f2f3e89e29f45`
- `kb/reference/public-website-routes.json` — SHA256 `c749370b26041bd83fbaed83290d0c48bab3fffe83053b8a3cc2742507c4b1a2`
- `projects/site/tests/build.test.mjs` — SHA256 `d5fd52617842a821e2c96c3d4a09e43d065e93420a1cfe2a468e7fa4b415e133`
- `projects/site/tests-coast/edition.test.mjs` — SHA256 `5ba7ab1e9e90850af9b6ea8c82ca113a9e76eab39c10aa3248f52a4d2771bfe4`
- `projects/site/tests-coast/discovery-flow.test.mjs` — SHA256 `8cca087a3dc8a5a3cfb5ff6925f8e4d99a9be7dea2ae42400d26b3fbd07a181e`
- `projects/site/tools/optimize-publication-jpeg.mjs` — SHA256 `fde67fb09ebc4587369c3a275c5aa22880254601ea36f7edc7440072310fe35f`
- `projects/site/tests/publication-jpeg.test.mjs` — SHA256 `9f6812f614c57294400d443ce86859484f50da4bf2f1a8db037b195731d0bfa5`

## Article and public wording

The manuscript body is byte-identical to the reviewed research draft; the APFS clone-aware copier created the independent manuscript and Barunei wrapper working copies. Only Founder/publication frontmatter was added. Author: Ahimanikya Satapathy; subjects places/history/culture; type Destination article; status publication_candidate; human_review_claimed false; publication_authorized true.

Title: “Olasuni: A Hill, a Saint and a Living Fair”. Description: “Olasuni’s hill landscape, Arakshita Das’s memorial and the craft traditions of its annual gathering.” Preview: “A pilgrimage hill above the plains near Lalitagiri.” Guide title Olasuni; region/eyebrow Jajpur; Odia and aliases empty. Those fields feed the existing Hills, Destinations and Explore previews. No new statements were added to the prose.

The unchanged existing reading-path fields are Kapilash: A Hill Shrine and an Older Temple’s Trace and Saptasajya: A Shrine Among Wooded Hills, each using its own guide summary/image. Further reading retains the generic Hills and highland escapes link. The existing Suggest an update path now identifies Olasuni.

The root-owned image JSON supplies the full-frame 1440×644 image, alt, January2026 caption, Nathularog credit, CC0 source/licence and resize/preview disclosure. It is reused for the article, previews and sharing; no photograph/place identity was inferred beyond the source. Hero retains intrinsic dimensions, eager/high-priority loading and existing responsive sizes.

Conservative allocation from the research ledger (opening/headings/all proposed metadata charged to every family), plus two extra guide/region words: ASI158, Tourism109, Committee183, TOI180, EcoTour139. These are handoff allocations, not an independent source signoff. Shared byline, navigation and unrelated existing reading descriptions are not derived from those five sources. Photograph caption/alt/credit/changes are a separate Commons family. Anvesha is independently auditing all actual public fields.

## Bounded validation

- PASS: actual Astro compiler-rs and esbuild TypeScript parsing.
- PASS: native Markdown rendering has seven citation links, five notes and seven return links; all fragment targets exist and IDs are unique. Existing page CSS exposes the source heading.
- PASS: manuscript body equals the proposal after frontmatter removal; selected public image dimensions match JSON.
- PASS: coast and portable inventories each contain1376 unique routes; Olasuni appears exactly once, its search candidate remains hold, and responsive source is registered once.
- Full page-count addend195→196; coast discovery175→176 in the three existing assertions. Full/coast builds and artifact checks remain parent-owned and were not run.
- PASS: ten existing publication-JPEG regression tests, including unchanged conversations q90 bytes, source preservation, both complete frames, credits, caption guards and unchanged sharing metadata.
- PASS: git diff --check.

Initial inline verification attempts were corrected without source changes: the installed Astro7 compiler is compiler-rs, not the older compiler package; the first return-link regex also counted the CSS class token. Final checks count actual anchor attributes. Neither initial failure indicated an article defect.

## Approved delivery adjustment

Only the already-allowlisted Mentis photo now overrides settings to3072px/q86. The global q95 default and other nine entries are unchanged. The existing caption already discloses resizing/compression. The meaningful regression checks greater than600000 bytes saved against the previous Mentis q95 output, equal EXIF to that prior derivative, matching source ICC/IPTC/XMP, original source bytes retained, unchanged first-photo q90 bytes and both credit/sharing guards.

Measured selected candidate:665030 bytes,3072×1728, SHA256573cf630eedded2e1616f72d39a60013775fa7c1c5804a816470e9a91bf3f63c. Prior derivative1279563 bytes; saving614533 bytes. Source3737818 bytes retained unchanged. EXIF differs from original solely as already measured in the prior delivery pipeline; no claim that all original metadata or decoded pixels remain identical. Lossy quality was separately accepted by root and Drishti. Actual Linux package capacity still requires its own build measurement.

## Guidance and boundaries

Installed modern-web instructions and root’s actual MDN img/web.dev responsive-images fallback were read; the rejected unpinned CLI was not rerun or bypassed. Existing semantic figure/native link/responsive-image patterns were reused. Storage sharing instructions were followed for both existing-file copies. No shared record, research map, protected preparation file, media asset, article outside Olasuni, global CSS or export selector was edited. Kula/internal exclusions remain intact for parent validation.
