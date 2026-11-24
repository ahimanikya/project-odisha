# Malayagiri implementation handoff

Samanta, 25 November 2026. Input `0929dad2ae5e4fd6d950a8f8bd2aaf99c5a3a628`, completed Jhoti receipt. Article implementation and bounded capacity proposal are separate; no capacity code change is claimed in this initial handoff. No build, Git mutation, server or publication executed.

## Article scope and public wording

The eight reserved paths are the new `kb/research/places/malayagiri-article.md`, new `projects/site/src/pages/destinations/malayagiri.astro`, modified `projects/site/src/data/hill-destinations.ts`, modified `projects/site/tools/nimuhi-footnote-heading.mjs`, existing `projects/site/tests/build.test.mjs`, `projects/site/tests-coast/edition.test.mjs`, `projects/site/tests-coast/discovery-flow.test.mjs`, and this report.

Title: **Malayagiri: Hills, Forest and Khuludi’s Waterfall**.

Description: **Malayagiri’s wooded range in Angul, a dated tree survey and Khuludi waterfall near Pallahara.** (93 characters.)

Card summary: **Angul’s mountain landscape, a forest study and Khuludi waterfall.** Guide title is Malayagiri; eyebrow and guide region are Angul. The source-supported spelling Malyagiri is the only alias; Odia spelling remains blank. These fields total 33 words, charged in full to each textual source family conservatively.

The manuscript is 185 words including headings and three compact notes. Its short length is deliberate: it covers district identity and height, terrain and soils, a dated sample of forest, a concrete contextual photograph and broad access orientation without padding. The 1,187-metre claim is explicitly district-scoped. The 57 species belong to 60 plots covering 2.4 hectares surveyed during 2007–09. On Anvesha's source-review recommendation, sal is identified as the dominant species in that sample, following the original abstract; the broader phrase about highest ecological importance was removed before final freeze.

| Related family | Conservative words | Allocation |
| --- | ---: | --- |
| Angul district/government | 134 | Entire opening 33; Khuludi heading 4; practical paragraph 24; both notes 13; metadata 33; whole caption 10 and photo observation 17 |
| Sahu, Dhal and Mohanty 2012 | 160 | Entire opening 33; forest heading 3; two paragraphs 70; note 21; metadata 33 |
| Photograph/Commons | 62 | Photo observation 17; heading 4; alt 14; caption 10; creator 1; licence 3; changes 11; wrapper attribution 2 |

Counts remove Markdown markers and URLs and use whitespace; exact repeated placements add no new wording. Each family stays below 175 and the absolute 200-word ceiling. No quoted source prose is used. Source IDs retain the dossier's three identities: `angul-malayagiri-about-20261125`, `angul-khuludi-visitor-page-20261125`, `sahu-dhal-mohanty-2012-malyagiri-trees`.

Evidence limitations remain explicit internally: district originals were read through original-publisher indexed text after direct access failed; the original research paper was read through its author-deposited text, without a visually inspected PDF. This implementation does not upgrade either method to direct rendered inspection or a field visit. No current buses, route condition, trail, season, bathing suitability, summit depiction or sanctuary status is claimed.

## Presentation and image

Reused the Saptasajya landscape wrapper and existing shared components, with full-frame figure, intrinsic dimensions, eager/high-priority hero, native source links, Founder byline, expanded notes and visible reading paths. No shared component/global CSS redesign or extra client script. Existing hill-guide mappings supply cards on destinations, hills and Explore; sharing metadata uses the same image object.

Personally inspected the supplied 1280×853 image: water flows around dark rocks, with leafy branches beside and above the falls. Caption and alt remain root-owned metadata. The date and Khuludi identity follow the creator's provenance, while the connection to Malayagiri uses district evidence. The photograph is not a summit view. Visible attribution retains Rajani3737, linked Commons source, CC BY-SA 3.0, and the resizing/compression/preview-crop notice. Full source photograph remains preserved by root.

Continue reading uses Saptasajya and Gandhamardan with their own images and existing summaries, as separate readings rather than an itinerary. Further reading links the hills collection. Suggest an update retains the article-specific URL and public-submission notice.

## Checks completed and remaining

- Installed Astro parser accepted the wrapper; esbuild parsed the modified hill data.
- Satteri with the existing heading plugin rendered five reference occurrences to three distinct notes, with five distinct return targets. All ten links resolve; IDs are unique and Footnotes & Sources is visible. The source-review correction changes no references.
- Sharp independently confirmed 1280×853 and the exact 302034-byte photo hash `802d46f8f57ba698ae2caff261c8e8628c5dd8060f01ed7e514659798aa3d4fb`; all required image fields exist.
- New and related routes are included in root's coast inventory. Description length is within 50–250 characters.
- Scoped `git diff --check` passed for the five modified tracked files.

Counts reflect the actual post-Jhoti baseline: full addend 187→188; coast discovery 168→169 in all three existing assertions. Root owns edition/search/responsive/portable registration and shared records. Jhoti/Kaincha protected preparation and foreign Kala Bhoomi ownership were not edited. Full/coast/publication tests, artifact equality, actual payload, rendered review and hosted/live checks remain root's sequential release work.

## Capacity proposal, not implementation

Separate `capacity-proposal.json` measures one already allowlisted Sahi Jatra image at 2400px/quality95: 875855 bytes saved versus the current local 3072px derivative, leaving a projected 118974 bytes after the 804004-byte Malayagiri image package but before HTML. Source originals and current full/coast assets remain untouched. Candidate and full-frame/detail comparison images are review outputs only. Root/Drishti acceptance and actual package gates remain necessary.

The proposed JPEG is lossy. Independent review identified MakerNote reduction from 36022 to 11403 bytes, beyond dimension-field changes; there is no claim of all EXIF preservation. Original camera JPEG is byte-exact. Orientation8 and 300dpi remain; ICC/IPTC/XMP equality checks pass (all absent). A specifically scoped orientation-aware sharing correction is needed if this proposal is implemented; raw JPEG and displayed portrait dimensions differ. No other path or optimization gate is proposed for change.

## Frozen article hashes

| File | SHA256 |
| --- | --- |
| Manuscript | `138954b7d9cbf7589995927880bf04f10306c32064854aa539f44339b47b8020` |
| Malayagiri Astro wrapper | `c532856f37fabb710ba4839686255a56311e6f2bc84512b7fcff5f68e4f103d9` |
| Hill destination data | `ad78539b95a7488cf185ecddb44faf4ea23c3643083b127a5b14014da1061e68` |
| Footnote-heading tool | `9497240bfa65020891afc5ac0e70ad9d07541b38a462ed1716482ceb30a72464` |
| Full build test | `4ad9387df236d2473459ed837025f762304217181b59d07e51b5149d540c7fb6` |
| Coast edition test | `526fcc990e81f069e39ce9cd4c754b355e338bd9cd0e405e349537033390f44b` |
| Coast discovery-flow test | `2b18d47f4e331183594a0b39d573aec297703c7ada4718396d4159761058e3d7` |

Installed modern-web instructions and prior actual cached HTML/figure/resource-priority, responsive-design and card guidance were read/reused for these unchanged patterns. No fresh retrieval claimed; the prior rejected unpinned CLI was not rerun. Native links, complete image geometry and semantic figures require no new browser feature or fallback.

Article scope released for independent review. Capacity implementation awaits a separate explicit reservation and acceptance.
