# Tensa: bounded implementation plan

Samanta, 24 November 2026. Base `38b6216d331d04235c90977553ded55bcdde8d74`, the completed Birakishore Das receipt. Read current Tensa claim, project entry/editorial guidance, latest ledger and actual destination implementation. Planning only: this is the sole file written. No article facts, media rights, independent review or publication readiness claimed.

## Minimal implementation scope after research/media handoff

1. `kb/research/places/tensa-article.md`: original concise destination narrative, Founder byline metadata, stable native source IDs and compact visible notes. Leave40–50words per relevant source family for image/preview fields; all derived fields together remain≤200words per family. No title, description, region, Odia spelling or visitor facts fixed before Anvesha's findings.
2. `projects/site/src/pages/destinations/tensa.astro`: reuse the current Kalinga Ghati landscape wrapper and existing Shell, ArticleByline, ResponsiveImage, ArticleReadingPath and reading stylesheet. If the chosen image is portrait, use the restrained Panchalingeswar/Kapilash width pattern instead. Set actual image dimensions only after metadata exists.
3. `projects/site/src/data/hill-destinations.ts`: one reviewed image import, `tensaGuide` and inclusion in the existing filtered list. Keep summary/aliases compact and sourced; blank Odia field unless verified. Preserve every existing guide field.
4. `projects/site/tools/nimuhi-footnote-heading.mjs`: add only `/places/tensa-article.md` to the existing heading allowlist.
5. `projects/site/tests/build.test.mjs`: current full-page addend184→185.
6. `projects/site/tests-coast/edition.test.mjs`: current discovery addend166→167.
7. `projects/site/tests-coast/discovery-flow.test.mjs`: both discovery addends166→167; preserve existing illustration/photograph-credit checks.
8. `outputs/tensa-publication-2026-11-24/review/implementation.md`: actual changed paths, manuscript/file hashes, public wording and family allocations, checks and limitations.

These are proposed future reservations, not edits already authorized by this planning task. Root may own the three count updates as in the preceding release.

No shared component or global CSS change is needed. `src/data/discovery.ts` already maps all hill guides, so no duplicate entry or new description is necessary. Do not lengthen the validated generic hills metadata or rewrite existing hills lead merely to append another name.

## Images, incoming previews and reading paths

Root supplies `kb/research/destinations/tensa-image.json` and a reviewed display asset under `projects/site/public/images/destinations/`, preserving original evidence outside public display assets. Article, card and Shell sharing image must use that same metadata. Display full frame in the article; disclose actual resizing/cropping, preserve creator/source/licence links, and do not infer a photographer when provenance identifies only rights holders. No placeholders or fabricated image fields.

The existing mapping creates exactly three incoming cards automatically:

- `/destinations/` through `src/data/destination-directory.ts` and DestinationCards.
- `/destinations/hills/` through hillDestinationGuides and DestinationCards.
- `/explore/` through the discovery map.

Existing eager/high-priority hero and lazy previews are appropriate. Illustrations, if later explicitly approved, must retain existing `kind: illustration` behavior and reading-card labels; a documentary photograph must not inherit those labels.

Choose new-page reading links after the subject is established. Existing Gandhamardan and Kalinga Ghati articles have usable images and can provide clearly separate hill/forest readings without implying a travel circuit. The scoped northern search found a Sundargarh district-language route and Rourkela steel-chain reading-room entry, but no suitable own-image destination mapping was established; do not invent a Rourkela/Tensa itinerary or borrow an unrelated image. Hills collection remains a valid further-reading link. Prior article fragments need no reciprocal edits.

## Root-owned route and export requirements

Add `/destinations/tensa/` to:

- `projects/site/editions/coast.json` routes.
- `kb/reference/public-website-routes.json` routes.
- `projects/site/editions/search-candidate.json` with the existing destination-series hold reason.

Current coast and portable inventories each contain1364routes; one new article gives1365. Preserve the limited search approval in `editions/search-publication.json`; public access is not expanded indexing authority. Add only the exact reviewed display asset to `editions/responsive-images.json`. Current widths480/960/1440 clamp to source width: a1200pxsource yields three variants480/960/1200, all of which count toward capacity.

There is no automatic whole-KB article export or inferred `publication_authorized` filter to edit. Reading-room pages use explicit `kb/records/pending-reading-room.json` entries through `src/lib/reading-room.mjs`; `tools/select-content.mjs` selects only five legacy notes. Tensa needs its dedicated page, not a duplicate reading-room entry. `tools/finalize-edition.py` selects coast routes and reachable assets, and `tools/build-publication.mjs` copies the validated coastal package. Preserve Kaincha's internal draft/photo and prior preparation evidence, keeping them absent from public route/assets/export selectors.

Root owns article/research-map/register/rollout records and regeneration, media, inventory changes, Git and publication. Preserve foreign Kala Bhoomi `current_task`/`handoff_home`, Birakishore and all earlier receipts/fragments. No new deletion or optimization is proposed.

## Checks and capacity

Before release: parse the new Astro and modified TypeScript; render native Markdown with the heading plugin; verify separate reference/return counts and distinct note targets; inspect the selected actual image and intrinsic dimensions; count all text/source families; check description50–250characters; verify credit/source/licence and sharing image; confirm three incoming cards and all related image/route targets.

Root then runs sequential full/coast/publication builds and existing suites, coast/discovery/search audits and disclosure checks. Verify the exact article fragment across three editions, actual responsive source/variant hashes, prior article-fragment preservation and all protected preparation hashes. Scan delivered output for Kaincha draft body, route, manuscript/photo filenames and exact original-file hashes. Carry raw responsive encoding differences into live review, mapping URLs only by observed matching image/width; never silently normalize other HTML.

Prior hosted payload998950813bytes leaves1049187bytes. Count the chosen display asset, every generated responsive variant and new HTML/preview overhead. A photograph fitting its individual budget does not establish package fit. Actual local and Linux publication output must remain strictly below1000000000bytes; no unrelated optimization or weakened gate is authorized by this plan.

## Guidance basis and limits

Read the repository's modern-web skill and reused the actually retrieved `/private/tmp/deomali-web-guidance.md` HTML semantics/figure/resource-priority, responsive-design and card guidance. No fresh retrieval claimed. The historical automatic-review rejection of executing an unpinned network CLI was not retried or bypassed. Existing baseline semantic links, figure/figcaption, intrinsic image geometry and responsive variants need no new platform feature or fallback. Rendered desktop/mobile, keyboard, independent source/media review and actual live verification remain future checks.

Plan scope released. Wait for the completed research and rights-cleared image handoff before drafting or site edits.
