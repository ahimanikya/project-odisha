# Mahendragiri capacity diagnosis

Samanta; 22 November 2026. Input head `dc009e63517ffc99d95a6d5448ca0c10c83f676a`. Initial capacity-only assessment for Mahendragiri; the subsequently authorized narrow implementation is recorded below. No source asset, website template, public book, register, Git state or publication changed. The six earlier PNG additions are already applied and are not proposed again.

## Minimal recommendation

Extend the existing delivery-only JPEG allowlist by **one exact path**: `assets/bhubaneswar-week/conversations.jpg`. Use the optimizer's existing settings: maximum dimension3072, JPEG quality95,4:4:4chromasubsampling, mozjpeg, metadata retained, no crop. This is a lossy delivery derivative, not a claim of pixel-identical compression. Source and coastal originals remain unchanged; the same public URL continues serving a JPEG. Existing responsive variants are generated from the unchanged original and need no changes.

The source appears in `stories/bhubaneswar-week.astro` at a maximum420CSSpixels wide. The3072-high derivative is1728pixels wide, exceeding4×that normal display width. The photo is credited as supplied by Ahimanikya Satapathy. It is not the article's sharing hero; the existing illustration remains that hero.

| Candidate | Current bytes | Measured derivative bytes | Saved bytes | Dimensions |
| --- | ---: | ---: | ---: | --- |
| `assets/bhubaneswar-week/conversations.jpg` — recommended | 4,296,333 | 1,682,404 | 2,613,929 | 3213×5712 →1728×3072 |
| `assets/bhubaneswar-week/mentis-films.jpg` — measured reserve only | 3,737,818 | 1,279,563 | 2,458,255 | 5712×3213 →3072×1728 |

Against the actual Linux publication baseline999,928,292bytes, the single recommended transformation projects997,314,363bytes, leaving **2,685,637bytes** before Mahendragiri additions and the small caption-size change. The selected149,320-byte Mahendragiri source image plus its pending responsive variants should fit comfortably within that allowance, subject to the actual rebuilt Linux payload. No need to transform the reserve photograph for this article.

## Quality and preservation evidence

Both comparisons were generated from current `projects/site/public/assets/bhubaneswar-week/` originals, using the installed Sharp library. At each source's normal CSS display width, I visually compared original on the left with the proposed delivery derivative on the right:420pixels for conversations and695pixels for Mentis. I also compared a face/background-detail crop at the candidate's native pixel scale against the original resized to exactly that scale. No conspicuous blocking, colour shift, lost facial features, changed framing or damaged text edges was visible in these bounded comparisons. This is a separate engineering visual inspection, not a human photographic-quality approval or an exhaustive inspection at every zoom level.

ICC, IPTC and XMP byte equality and orientation equality passed for both candidates. Full-frame aspect ratio was retained exactly. JPEG compression adds measured differences: conversations RGB RMSE1.7242/255, PSNR43.3989dB; Mentis RMSE1.5457/255, PSNR44.3480dB. Metrics compare decoded derivatives with a same-size resized reference and do not measure downsampling loss or substitute for visual review.

Temporary evidence (not publication assets):

- `/private/tmp/mahendragiri-capacity/conversations-display-comparison.png`
- `/private/tmp/mahendragiri-capacity/conversations-detail-comparison.png`
- `/private/tmp/mahendragiri-capacity/conversations-3072-q95.jpg`
- `/private/tmp/mahendragiri-capacity/mentis-films-display-comparison.png`
- `/private/tmp/mahendragiri-capacity/mentis-films-detail-comparison.png`
- `/private/tmp/mahendragiri-capacity/mentis-films-3072-q95.jpg`
- `/private/tmp/mahendragiri-capacity/measurements.json`

Source/candidate SHA-256:

- Conversations source: `4f7a569ad73f87f31291c606008133e64521cf19fe21d65fa8a96c7dcbe32780`
- Conversations candidate: `b83bb3c340449eebfa5c35ba16a4441c143df185239659cbb9d786c7b0b947ed`
- Mentis source: `798bc7eb53ac2fe76b29305d8c6d979952b32aa673156d7112291c94d11c1734`
- Mentis candidate: `49d0b2418bff5216afe5dd907acd7fcb0ff79b452a01bea97e702a29cf832d6d`

## Requested implementation scope, if selected

Only two code files are necessary:

1. `projects/site/tools/optimize-publication-jpeg.mjs`: add the one exact path and its existing-format caption configuration. Use `/assets/bhubaneswar-week/conversations.jpg` as the page-presence guard. The unique phrase should be the complete current caption, `A moment from a week of conversations. Photograph supplied by Ahimanikya Satapathy.` Replace it with the same caption followed by `Full frame, resized and compressed for web delivery.` Do not use the shared shorter supplied-by phrase: it occurs twice on this page. No generic optimizer change or new settings are necessary.
2. `projects/site/tests/publication-jpeg.test.mjs`: extend the exact scope assertion and add a real-source regression verifying source/unrelated-file preservation, full frame/orientation/profile metadata, expected bounded dimensions, meaningful savings, exact caption preservation plus appended delivery notice, and unchanged second-photo caption. The source page's sharing image is a different illustration, so its sharing metadata must remain unchanged.

No book content, download URL, source JPEG, responsive-source configuration, author credit, article prose, public gate, or unrelated image should change. The existing width/height attributes preserve the same aspect ratio, following the current delivery optimizer's established behavior.

## Required follow-through

Coordinator and independent reviewer should inspect the selected comparison and reconstructed article at desktop/mobile sizes before release. Run the bounded JPEG tests, normal full/coastal/publication checks, all disclosure gates and the unchanged decimal1GB payload gate. Verify the actual Linux JPEG optimization report because local encoding sizes are not a guarantee of Linux output. Re-hash the source and coastal original after the build, preserve the supplied-by credit, verify the original public asset URL and article remain reachable, and retain all public book/download checks. No separate technical publication is proposed; this bounded capacity adjustment belongs to the authorized Mahendragiri release if selected.

## Selected implementation and bounded regression

Disha selected the single conversations photograph and expanded the reservation to the two proposed code files. Implemented only its exact allowlist entry and caption configuration, using unchanged global3072/q95/4:4:4settings. The original creator credit is retained verbatim, and only a full-frame delivery note is appended to its unique complete caption. The algorithm, gates, other images, source files, website template and sharing image are unchanged.

The exact allowlist assertion now contains four images. A real-source regression covers the conversations photograph, its public output path, unchanged Mentis image and caption, unchanged sharing metadata, exact1728×3072full-frame geometry, orientation/density/ICC/IPTC/XMP preservation, retained EXIF presence, more than2MBactual savings and unchanged original source files. The three pre-existing JPEG tests also passed.

Validation: `node --test tests/publication-jpeg.test.mjs` on Node25.8.1: **4passed,0failed**, approximately1.1seconds. Scoped `git diff --check`:pass. Test fixtures and derivatives were temporary; no full/coastal/publication build or Git operation ran. Initial implementation scope released to Disha for integration and independent review.
