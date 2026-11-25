# Live measurement helper review

Samanta, 23 November 2026. Read-only code review; neither helper executed and no network request made. Only this report written. This is not a deployment, live-content or visual-quality acceptance.

Reviewed hashes:

- `compare-live-images.mjs`: `823a1c366ecd2072ac49b7677ffc0e067236a120b085107b0e46ca63dd79ac2b`
- `verify-live.py`: `37d0ba4673f0aa9eeab2b1e6631b3bd491d8f35458885bdab93ec34e4ad44d9b`

## Required guard before relying on measurement completion

The comparison helper does not reject failed/running or incomplete `verification.json`. If the HTTP verifier fails before collecting images, its finally block writes `status: FAIL` with an empty image list. The comparison helper would then skip measurement and label the empty list `all_observed_images_byte_exact`, because JavaScript's `every()` returns true on an empty list. Partial failed input can similarly receive a completion status. The retained raw_status exposes the problem but does not prevent a misleading positive summary.

Add a prerequisite requiring raw status `PASS` or `REVIEW_DIFFERENCES`, the five expected routes, and a nonempty image list containing the exact Kalinga base photo and Ashta JPEG. Otherwise refuse to write a completed measurement. This blocks reliance on the helper's completion label for failed/partial input; it is not evidence that the eventual deployed files are wrong. Disha was notified before execution.

## Pair comparison otherwise fits the task

Paths resolve correctly relative to this output directory. Each actual saved/live and mapped/local file is checked against the HTTP evidence hashes before measurement; responsive filenames are checked against their actual content hash prefixes. Geometry must match. Each differing pair uses the same installed Sharp/libvips decoder and sRGB conversion; maximum, mean-absolute and RMS channel deltas and changed-channel totals are computed over matching raw layouts. ICC/IPTC/XMP/EXIF byte equality is recorded for differing encodings. The raw verification file is hashed again before writing the separate comparison report, and never overwritten.

The helper does not infer an encoding cause or promote small channel differences to visual acceptance. `measurement_complete_visual_review_pending` is appropriate. Byte-exact image status is deliberately scoped to observed images; raw HTML differences remain in the retained verification status.

One interpretation limit: `decoded.identical` compares RGB after removing alpha, not every original channel/profile. Current task concerns photographs and their derivatives; if any comparison input has transparency, either reject that unsupported case or compare alpha too before calling decoded pixels identical. Colourspace conversion also means these metrics describe common-decoder sRGB output, not archival pixel/profile preservation.

## Citation count distinction

`verify-live.py` currently selects all links beginning `#user-content-fn`, which includes both note references and return links. Its total10/resolvable-target assertion is consistent with the present article, but does not independently enforce the split or number of distinct notes.

A bounded read of the already-built local publication page, parsed independently without executing either helper, confirms:

- Five reference links beginning `#user-content-fn-`.
- Four unique note targets; the reopening note is cited twice.
- Five distinct return links beginning `#user-content-fnref-`.
- Every target exists.

Thus “five native citations/five returns” is accurate when citations means reference occurrences; it must not be described as five source notes. Prefer explicit assertions for5references,4distinct note targets and5returns, with both sets resolving. The current exact fragment comparison against the reviewed local article provides an additional constraint, but the helper's count assertion alone is weaker than that invariant.

## Release limits

No live or decoded-difference results were generated in this review. Root should execute only after actual deployment success, retain raw `REVIEW_DIFFERENCES`, and have any differently encoded Ashta/variant images visually reviewed. The guard and clearer citation invariant remain owner changes; this reviewer did not modify either helper or shared records.

## Closure after owner corrections

Re-read Disha's actual corrections before helper execution. Both findings are closed in the following versions:

- `compare-live-images.mjs`: `817036b472e5aaa3fdbf5045fabfe55294a0c296e7afb04654601ea2b16ad006`
- `verify-live.py`: `6cf768e1e0c65ca579a3a924707e61f727a00aec7bbe3bc68722bcc4eeef42e0`

The measurement helper now rejects raw statuses other than PASS/REVIEW_DIFFERENCES; requires exactly five unique expected routes with successful HTTP responses; and requires a nonempty image list containing both required base image URLs with successful status. These guards run before construction/writing of the completed measurement report, closing the failed/partial-input issue.

The live verifier retains its target-resolution assertion and separately checks five reference occurrences, four unique note targets and five distinct return links. This accurately encodes the current article's native-note structure.

No remaining blocker found for this bounded execution. The RGB/alpha interpretation and separate visual-review limitations above remain; this closure approves the corrections as code review only, not any future live measurement or release result. No helpers, published source or shared records were edited by this reviewer, and no network or helper execution occurred.
