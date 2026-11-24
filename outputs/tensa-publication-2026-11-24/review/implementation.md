# Tensa implementation and scope release

Samanta, 24 November 2026. Bounded implementation against the completed Birakishore receipt `38b6216d331d04235c90977553ded55bcdde8d74`. Article and website fields frozen; independent source, quality, rendered and release checks remain separate. No Git mutation, full build, server, network verification or publication performed by this implementation pass.

## Exact scope

1. `kb/research/places/tensa-article.md`: original destination manuscript, Founder byline and four stable native source notes.
2. `projects/site/src/pages/destinations/tensa.astro`: existing landscape article wrapper, full-frame credited photograph, shared preview/sharing image and reading paths.
3. `projects/site/src/data/hill-destinations.ts`: one image import and Tensa guide, appended to the existing collection. All previous fields retained.
4. `projects/site/tools/nimuhi-footnote-heading.mjs`: Tensa manuscript added to the existing visible-footnote heading allowlist.
5. `projects/site/tests/build.test.mjs`: full-page addend 184→185.
6. `projects/site/tests-coast/edition.test.mjs`: discovery addend 166→167.
7. `projects/site/tests-coast/discovery-flow.test.mjs`: both discovery addends 166→167, preserving existing image and illustration regressions.
8. This report.

No shared component or global stylesheet changed. Existing mappings supply incoming image cards on destinations, hills and Explore; no duplicate discovery entry or expanded generic hills metadata was needed. Root owns edition/search/public inventories, responsive-image registration, media and canonical records. Current root-owned inventories contain 1365 routes.

## Frozen public wording and source allocations

Title: **Tensa: Hills, Iron Ore and a Community Camp**.

Description: **Tensa’s forested hills, mining connections and the community history of its nature camp in Sundargarh.** (102 characters.)

Card summary: **Hill country, iron ore and a community-managed nature camp.** Guide title is Tensa; guide region and article eyebrow are Sundargarh. Odia spelling remains blank and aliases empty.

The manuscript is 266 whitespace-delimited words including headings and source notes, after stripping Markdown labels and URLs. It distinguishes the 2021–22 to 2030–31 working-plan proposal, SAIL's FY2023–24 account of the mines, and the camp history recorded in the district's FY2020–21 report. It uses the actual rendered current EcoTour page for restrained walking and visitor advice. The mine establishment year is not presented as the town's founding year. No current tariff, capacity, season, wildlife, trail or availability guarantee is made.

Conservative related-family allocations below charge the complete 35-word title/description/card/region allowance to each textual family, even where that duplicates general identity. Repeated placements reuse identical wording rather than introducing additional derived prose.

| Related source family | Conservative public words | Allocation |
| --- | ---: | --- |
| Bonai working plan + EcoTour Odisha | 163 | Entire opening 44; current camp paragraph 23; current practical advice 29; two relevant headings 8; both source notes 24; metadata allowance 35 |
| Sundargarh FY2020–21 annual report | 166 | Entire opening 44; camp history 51; relevant headings 8; gateway sentence 17; note 11; metadata allowance 35 |
| SAIL FY2023–24 statement | 138 | Entire opening 44; mining heading 4; mining paragraph 42; note 13; metadata allowance 35 |
| Commons photograph | 40 | Alt 13; caption 10; creator 2; licence 3; changes 10; wrapper attribution 2 |

Each family remains below 175 words and the 200-word hard ceiling. No direct quotation is used in the body. Stable note IDs: `sundargarh-annual-report-2020-21-tensa`, `bonai-working-plan-2021-2031-part2`, `sail-btk-environmental-statement-2023-24`, `ecotour-odisha-tensa-20261124`. The current-listing note is dated 24 November 2026. The researcher's earlier indexed-only limitation is superseded only for the claims visible in root's retained rendered capture; no independent fresh browser retrieval is claimed here.

## Photograph and reading paths

Personally inspected the selected actual photograph. Red excavated earth, scattered trees, wooded hills and clouds support the narrow image description; no exact mine operator, pit, camp or viewing position is inferred. The unchanged 2048×1365 JPEG is 292662 bytes, SHA256 `64b6b782a99bf5252d41dcf4a187ac0725c77004c2d708c8c1fcfc655404c56d`.

Root-supplied image metadata is used directly for article, preview and sharing. Visible figure credit links Manjeet bhoi to the Commons file and CC BY-SA 4.0 to its licence, retaining the caption and changes statement. The full-frame hero is eager and high priority with intrinsic dimensions; shared previews retain normal responsive behavior and the disclosed potential crop.

Continue reading points to Gandhamardan and Kalinga Ghati, with each article's own image and summary. These are separate readings, not a suggested road circuit. Further reading links the hill collection. Native byline, visible Footnotes & Sources and Suggest an update remain present.

## Bounded checks completed

- Installed Astro parser accepted the new wrapper; installed esbuild parsed the modified TypeScript.
- Markdown rendered with the existing footnote-heading plugin: 7 reference occurrences, 4 distinct notes and 7 distinct return targets; all 14 links resolve. Footnotes & Sources is visible.
- Sharp independently confirmed original JPEG dimensions and the original-file hash. Required metadata fields are populated.
- Related destination/collection routes are included in the coast inventory and their image assets exist. The description meets the 50–250-character bound.
- Scoped `git diff --check` passed for the five modified tracked files. The new manuscript/wrapper are separately covered by the parsers above.

No full suite or built-artifact result is claimed. Root will run sequential full/coast/publication builds and audits, exact cross-edition fragment and image verification, rendered review, actual payload gate, hosted checks and live verification. The previous Linux package leaves 1049187 bytes; the supplied image and three variants are projected at 490958 bytes before HTML. Actual package fit is still required.

## Read-only release-helper review

Read `verify-local.py`, `run-checks.py` and `verify-live.py`; did not execute them or make network requests. No blocking wrong assumption found in these versions. Local verification checks source and independently decoded variant geometry (2048×1365; 480×320, 960×640, 1440×960), the reviewed manuscript contract, all 13 required stages, native references and distinct returns, three incoming previews/credits, exact three-edition article fragments, source/variant hashes, search and preparation boundaries, and the strict package limit. The live helper retains raw byte differences as REVIEW_DIFFERENCES and normalizes only observed corresponding responsive URLs by image and width before comparing the article fragment.

The final reviewed contract must contain this frozen manuscript hash, 7 references, 4 unique notes and 7 returns. Helpers do not establish visual equivalence of platform-dependent image encodings, independent source correctness, or preservation of every predecessor's rendered fragment; those remain separate reviews. Current helper hashes:

- `verify-local.py`: `2b1064ba4e6378390e51846e517f2716a93e4badddfa5e88f7b18f2b51502f66`
- `run-checks.py`: `107b5c65a8219638e0fc7d332694c071989ed9302a40e935574f2f4d44f6ed72`
- `verify-live.py`: `119a5194895b3f2da8afcb4ce1a09d2d77c6758f5a173468ddc89d81ae25edae`

Kaincha's draft, source image and protected preparation files remain source-only. The site uses explicit reading-room and page/edition selectors rather than an automatic whole-KB export. This implementation adds no Kaincha selector or asset. Root's local helper covers exact protected-file hashes and delivered path/body exclusions. Kala Bhoomi ownership and preceding receipts were outside the writable scope.

## Frozen implementation hashes

| Path | SHA256 |
| --- | --- |
| `kb/research/places/tensa-article.md` | `cc225a6ef26ae07e04138b8f07c84efb0053e3d3ad068f6eedf262f220303c17` |
| `projects/site/src/pages/destinations/tensa.astro` | `75f70c750670e57775d745150176ab9b824a25388bb9e52e7027536083299356` |
| `projects/site/src/data/hill-destinations.ts` | `6d28acd44bcd11b5333336362bc5e0a6145f9084cdd240f588d448eda4c8bf36` |
| `projects/site/tools/nimuhi-footnote-heading.mjs` | `eb7200abe45bdb500ec762f640bc7ebbe3cddc712a36a9435c903cf374c51c3d` |
| `projects/site/tests/build.test.mjs` | `318c39160f2a3c0e13caffdb1f5e06b79b0f46bbc8184b3a77233c180c6eb7e9` |
| `projects/site/tests-coast/edition.test.mjs` | `10169803acd7d18c370743fee78372331d727d51bcff4e27347835d8360e908c` |
| `projects/site/tests-coast/discovery-flow.test.mjs` | `be6fbec2ec40723e2bc72d73db3c91189e5bd7f1fd7c8321e4ce65157fa82117` |

Reused the actual previously retrieved `/private/tmp/deomali-web-guidance.md` HTML/media semantics, resource priority, responsive-design and card guidance. No fresh lookup claimed; the earlier rejected unpinned network CLI was not retried. No new browser feature introduced.

All eight reserved files released for independent review. No further edits planned without a bounded review request.
