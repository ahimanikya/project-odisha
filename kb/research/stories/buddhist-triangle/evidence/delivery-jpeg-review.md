---
type: "Research evidence"
---

# Bounded publication JPEG review

26 October 2026. Drishti, separate code review. Scope: `projects/site/tools/optimize-publication-jpeg.mjs`, its focused tests, and its call from `build-publication.mjs`. No shared repository files edited.

## Assessment

No fundamental blocker found in the bounded delivery transformation. Only two explicit photo paths are eligible. The publication builder copies the coastal build first and calls the optimizer on `dist-publish`; repository and coastal sources remain intact. The maximum 3072-pixel bounding box preserves aspect ratio without enlargement or cropping. Quality-95 JPEG recompression is **lossy**, not a lossless packaging operation; the public caption correctly describes resizing/compression.

The implementation retains metadata, validates orientation and dimensions, compares ICC/IPTC/XMP payloads, requires an expected source link and one unique original-credit phrase before writing, and changes that phrase to an accurate delivery-modification notice. Creator/source/licence markup is otherwise retained. Final artifact bytes still pass the unchanged decimal-1-GB gate.

## Checks performed

Ran the focused `tests/publication-jpeg.test.mjs` using the bundled Node runtime: **2 tests passed**. Covered fixed scope, resizing, orientation, XMP/ICC/density preservation, immutable original and unrelated files, output digest difference and caption update. The system's older Node did not support `--test`; no conclusion was drawn from that unavailable runtime.

## Follow-ups communicated

1. Report status was hardcoded `resized-and-compressed` even when a file is only recompressed. Change it according to `changedDimensions`, matching the already-correct caption logic.
2. The pre-copy `nonOptimizableBytes` calculation currently excludes only eligible PNGs. It can conservatively reject a future input that these JPEG savings would otherwise rescue. This is a false-rejection limitation, not a bypass of the final budget. Exclude the fixed eligible JPEGs or document the conservative intent.
3. A negative test for missing/ambiguous expected credits would strengthen the regression guard. Existing code validates credits before either image or page write for that item.

Actual full-build success, final byte savings and final derivative visual comparison were not available in this review and remain coordinator verification. This receipt does not claim deployment or a passing full CI run.
