# Gandhamardan — early media and capacity review

Drishti, 23 November 2026. Separate AI review; no human, specialist or field approval claimed. Scope: actual image selection and four measured lossless candidates, with the first two proposed for implementation. Article, rendered page, final capacity and release remain pending.

## Result

**PASS for the selected photograph and the measured first-two capacity proposal, subject to later implementation/output checks.** No media blocker. Recommend the minimum first two exact PNG additions initially; the third and fourth are proven contingency candidates, not authorization for an automatic larger allowlist.

Read current entry/assignment/operations and Gandhamardan handoff, adopted charter/agreement and current ledger; reused the current article editorial standard. Gandhamardan is sole active article. Sola is an unpublished preparation preserved on inherited head `af57ee13b805874a8afa32e55936fefbcd4091c3`; its later reserved publication slot does not authorize export in this release. Foreign Kala Bhoomi ownership and zero programme credit remain constraints.

## Photograph suitability and provenance

Independently opened all three original photographs and all three corresponding 960px WebPs individually. The selected reflection composition is the strongest: forested ridges, shoreline and reflected shape remain legible at 960px and should work at normal reading-column size. Its original softness and pale sky are visible, but neither obscures the main subject. This is an adequate authentic documentary landscape for article and preview use, not a claim of exceptional detail or present-day photographic coverage. Do not enlarge beyond its reviewed delivery dimensions. The alternate valley view is hazier and the higher-resolution alternative is dominated by sky and deep shadow; extra pixels do not make those alternatives clearer editorial leads. Adding them would contribute little here.

The selected image and derivative retain the original date stamp and complete 4:3 frame. No conspicuous conversion artifact or changed scene content was observed. Keep the full frame in the article; a disclosed card crop may differ but requires rendered inspection so the ridges remain recognizable. Date-stamp retention in the article avoids silently altering the historical source.

Freshly read [Commons: Gandhamardan Mountains](https://commons.wikimedia.org/wiki/File:Gandhamardan_Mountains.jpg), revision1267164668. Its own-work attribution names **Amitabh Patra**, dated **17 July 2010**, under **CC BY-SA3.0 Unported**. The creator identifies the western end viewed from the northern Paikmal region; the caption follows that description. Supplied coordinates are source metadata, not independently verified geolocation. The public caption correctly identifies July2010 rather than present conditions. Source, licence, creator and conversion/preview terms in gandhamardan-image.json are appropriate.

Independent original measurements: **229,995 bytes;1600×1200;SHA1 `91198acbacda003495c46af45247adb839ea91db`**, matching Commons; SHA-256 `66b1322eb6bebea2d700112ce3069b7e3743e052071e70cdcbf97de5e07d8f4b`. Independently reproduced the exact full-frame width960 WebP at quality85/effort6: **69,818 bytes;960×720;SHA-256 `196b5c460458931c323e2c6ce3f68df80b68d7bf013d0afe7bd212db99612782`**. The public file equals that inspected derivative byte for byte. No retouching or colour manipulation is present in the reproducible recipe.

## Independent lossless proof

Read the actual existing optimize-publication-png.mjs mechanism. Recomputed all four proposed outputs in memory using its losslessPNG function, compared them with the scratch candidates, independently decoded before/after to RGBA with geometry, and compared the complete ordered bytes of every non-IDAT chunk. Each candidate exactly reproduced; all decoded pixels, geometry, IHDR and ancillary/non-IDAT chunks match. Every source also matches inherited Git bytes, the current coastal file and the prior publication file. No source or output file was modified in this review.

| Exact delivery path | Source bytes | Candidate bytes | Saving | RGBA / geometry / non-IDAT / reproduction |
| --- | ---: | ---: | ---: | --- |
| assets/cinema/lipika-film-letter.png | 959,887 | 850,767 | 109,120 | All exact |
| assets/cinema/pramod-paper-movement.png | 601,976 | 573,227 | 28,749 | All exact |
| assets/cinema/shared-story-table-20261030.png | 361,541 | 340,127 | 21,414 | All exact |
| assets/cinema/literature-page-to-screen-20261030.png | 703,411 | 692,740 | 10,671 | All exact |

The independently measured source and candidate SHA-256 values match every value in capacity-findings.json. First-two total saving is **137,869 bytes**; all-four measured saving is169,954bytes. The mechanism preserves original non-image chunks while replacing image data only if smaller, rejects a changed IHDR, and verifies final decoded equality. Its extra DEFLATE check preserves the re-encoded stream's inflated scanlines; it does not imply that original and re-encoded PNG filter streams are identical. Pixel and non-IDAT equality are the relevant original-to-output guarantees here.

Use only the first two exact paths and matching existing allowlist regression initially. Keep the algorithm, file format, URL, source/coastal copies and unrelated allowlist entries unchanged. Later review must confirm the actual bounded code diff, focused regression, emitted hashes and working affected routes. The capacity estimate does not justify deleting content, expanding broad asset folders or degrading other images.

## Capacity and remaining gates

Verified arithmetic: inherited Linux headroom55,557 + first-two saving137,869 − projected new image/variants147,220 = **46,206 bytes before page/index growth**. With an estimated30,000-byte article overhead the remainder would be16,206bytes; neither estimate is a final acceptance. The 147,220-byte media total was supplied by root and awaits emitted verification. A third candidate should be selected only if measured need requires it, followed by explicit bounded implementation review. This report proves its lossless properties but does not mark that additional scope implemented or necessary.

Required later: manuscript/source originality and budget review; actual image credit/preview/share wiring; rendered desktop/mobile inspection; all-source preservation and Sola export exclusion; final local and Linux byte gates; exact committed review, CI, deployment and live delivery. No article or publication PASS is claimed at this stage.
