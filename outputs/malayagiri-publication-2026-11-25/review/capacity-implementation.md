# Accepted capacity implementation

Samanta, 25 November 2026. Implemented only the candidate accepted by root and Drishti in `capacity-review.json`. Article remains frozen at `138954b7d9cbf7589995927880bf04f10306c32064854aa539f44339b47b8020`.

## Changes

- `projects/site/tools/optimize-publication-jpeg.mjs`: existing Sahi Jatra entry now specifies maximum dimension 2400 at unchanged quality95, 4:4:4 and mozjpeg. The nine-path allowlist is unchanged, as are all other eight entries and default settings.
- Its opt-in sharing branch is guarded to the exact Sahi path and reviewed geometry: source stored4928×3264, orientation8; output stored2400×1590, orientation8. It validates the original displayed OG tags3264×4928 and replaces only those tags with1590×2400. It retains the image URL, source figure attributes, caption transformation, creator/source/licence and surrounding HTML. Other opted-in entries continue using their existing raw-dimension behavior.
- `projects/site/tests/publication-jpeg.test.mjs`: added an actual-source Sahi regression. The existing generic metadata/orientation regression now exercises unchanged-default Mardala instead of Sahi, retaining its prior3072px expectations and unrelated-file/original checks.

The new regression checks the selected settings, orientation/display geometry, density, ICC/IPTC/XMP, source byte preservation, a saving greater than850000bytes versus the previous3072 derivative, and exact HTML equality except the accepted caption and OG-tag changes. Negative cases cover wrong orientation, unrelated sharing image, raw rather than displayed share width and duplicate caption text; each must reject before modifying the target image or HTML.

## Results

Targeted command using installed Node25: `node --test tests/publication-jpeg.test.mjs`.

**9 tests passed; 0 failed.** Duration approximately9.75seconds. All existing delivery-image regressions passed, including Bhagabata, Bhubaneswar, Hindola, Abhisarika, Radha and Taptapani. Scoped `git diff --check` passed.

Source KB and public camera JPEG remain identical at SHA256 `461acabe2ad87b0ce7a4eb0f8906f0bef98765094b0b53874383cde431bc0ec5`. No actual website build output was written by this pass; tests use temporary directories and clean them up. Full/coast/publication builds, exact selected-candidate packaging, rendered Sahi review and actual local/Linux payload gate remain root's work.

The accepted candidate measurement saves875855bytes versus the existing local delivery, with projected118974bytes remaining after the new image package before HTML. That projection is not a final package result.

## Metadata and quality limit

This is a lossy resized delivery photograph, not pixel-identical or archival-equivalent. The complete source frame and original camera file are retained. Drishti established that both the current3072 derivative and accepted2400 derivative already have the same11403-byte MakerNote; the original MakerNote is36022bytes. No further MakerNote loss is introduced relative to current delivery, but there is no assertion that all original EXIF is preserved. Orientation8,300dpi and ICC/IPTC/XMP equality remain validated. Live/Linux encoding differences must be measured and reviewed if observed.

## Released hashes

- Optimizer: `a495f6278652540dffa1771627b1498fe4f556b775da2a61cdeebb4f263a97d5`.
- JPEG regression: `a756a0f555c86553b2d7b5fb1ff00d329215744ab511c7db65bcb659a5e38501`.
- Malayagiri manuscript unchanged: `138954b7d9cbf7589995927880bf04f10306c32064854aa539f44339b47b8020`.

Both code paths and this report released. No Git mutation, full build, server, shared-register edit or publication performed.
