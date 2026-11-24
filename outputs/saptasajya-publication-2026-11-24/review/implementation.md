# Saptasajya implementation

Samanta, 24 November 2026. Input `7d26d22bf03d1a5bf308c9a936aca2c5c4795e3e`, the returned Jhoti preparation after Tensa's completed receipt. Bounded implementation only; no publication, independent review or human review claimed. Article and website files frozen for separate source and quality review.

## Changed files

1. `kb/research/places/saptasajya-article.md`: original 202-word narrative including headings and two source notes, Founder byline and stable native references.
2. `projects/site/src/pages/destinations/saptasajya.astro`: existing Tensa landscape wrapper with the actual Saptasajya image, visible credits, sharing image and reading paths.
3. `projects/site/src/data/hill-destinations.ts`: one image import, Saptasajya guide and collection inclusion; previous fields unchanged.
4. `projects/site/tools/nimuhi-footnote-heading.mjs`: only the new manuscript added to the existing allowlist.
5. `projects/site/tests/build.test.mjs`: full-page addend 185→186.
6. `projects/site/tests-coast/edition.test.mjs`: discovery addend 167→168.
7. `projects/site/tests-coast/discovery-flow.test.mjs`: both discovery addends 167→168, existing regressions retained.
8. This report.

No shared component, global CSS, hills-page prose or discovery mapping changed. Existing mappings supply the three incoming cards on `/destinations/`, `/destinations/hills/` and `/explore/`. Root owns editions, responsive configuration, portable/search inventories, shared records, export boundaries and media. Jhoti and Kaincha preparation and foreign ownership remain outside this write scope.

## Public text and conservative allocations

Title: **Saptasajya: A Shrine Among Wooded Hills**.

Description: **A Raghunath shrine, local legend and a tree survey illuminate Saptasajya’s hills near Dhenkanal.** (96 characters.)

Card: **A hill shrine, local legend and a wooded landscape.** Guide title is Saptasajya; article eyebrow and guide region are Dhenkanal. Odia spelling is blank; no aliases invented. These fields total 32 words. The complete allowance is conservatively charged to each textual family; identical repeated placements introduce no additional wording.

| Source family | Words | Allocation |
| --- | ---: | --- |
| Dhenkanal district English + Odia | 143 | Opening 26; pilgrimage heading 3 and paragraph 33; planning heading 3 and paragraph 29; source note 17; all metadata 32 |
| Sahu and colleagues, Taiwania 2019 | 149 | Entire opening 26; forest heading 4 and paragraph 66; source note 21; all metadata 32 |
| Commons photograph | 48 | Alt 17; caption 9; creator 1; licence 3; changes 16; wrapper attribution 2 |

All families remain below the requested 175-word target and 200-word hard limit. Counts use whitespace after removing Markdown link URLs/markers; hyphenated words remain single tokens. No direct quotation appears in the prose. Native IDs are `dhenkanal-saptasajya-tourist-page-20261124` and `sahu-2019-saptasajya-tree-diversity`.

The Pandava association is explicitly a legend. Rani Ratnaprava Devi is an attributed builder without an invented construction year. The ecological paragraph names Sahu, dates fieldwork and limits 48 species to the 0.3-hectare sample across three elevation bands. The sal/mango statement is limited to those samples; independent source review was asked specifically to check this wording against Table 1. The October–March recommendation is attributed to the Odia district guidance. No summit elevation, current amenity, timetable, fee, opening hours or water-quality claim is added. The concise length is deliberate, with no padding to reach an arbitrary target.

## Image and reading paths

Personally viewed the supplied full-frame image: rounded green hills, foreground vegetation and reddish earth beneath a pale cloudy sky. The metadata's narrow description matches the visible content. The photograph is not presented as a shrine, summit view or current condition. Creator attribution supports the north-view/date caption; no independent viewpoint geolocation is claimed.

The 1280×960 public WebP is 162900 bytes, SHA256 `7ec87dc4bc579349d3264c7891b6f17356016c588a131147d720766442e75fa1`. The root-preserved 3264×2448 original remains outside the public display asset. Article, cards and sharing use the same supplied metadata. Visible figure credit links Devopam to the Commons file and CC BY-SA 4.0 to its licence; full-frame resizing and potential preview crops remain disclosed. Only the hero is eager/high-priority, with explicit intrinsic dimensions and existing responsive sizes.

Continue reading uses Kapilash and Kapileswar at Hatuari with their own existing images and accurate titles. Hatuari is described as a separate temple; no itinerary is implied. Further reading links the hill collection. Founder byline, expanded Footnotes & Sources, reading paths and article-specific Suggest an update are retained.

## Checks and limits

- Installed Astro parser accepted the new wrapper; esbuild parsed the modified TypeScript.
- Existing Satteri processor and heading plugin rendered four references to two distinct notes, with four distinct returns. All eight links resolve; IDs are unique and Footnotes & Sources is visible.
- Sharp independently confirmed the public image's 1280×960 geometry and hash; required image fields are present.
- New route and related Kapilash, Hatuari and hills routes are in the root-owned coast inventory. The description meets the 50–250-character rule.
- Scoped `git diff --check` passed for the five modified tracked files.

No build, server, Git mutation, hosted/live check or network retrieval executed in this implementation pass. Root runs sequential full/coast/publication checks, actual capacity measurement, protected-preparation exclusion checks, rendered review and publication gates. Previous Linux headroom is 529893 bytes; the 162900-byte display image alone does not establish that all responsive variants and HTML fit.

Read the installed modern-web instructions and reused actual cached `/private/tmp/deomali-web-guidance.md` HTML/media semantics, image resource priority, responsive typography and native-link card guidance. The existing figure/figcaption, responsive dimensions, eager hero and native reading links implement those applicable rules. No fresh retrieval or newer browser feature claimed; the earlier rejected unpinned CLI execution was not retried.

## Frozen hashes

| Path | SHA256 |
| --- | --- |
| Manuscript | `c3e46b85973db3ab035b35ae5ca3eb6f812d2da293d77ceee5432f5ff1b3a935` |
| Saptasajya Astro wrapper | `f0f03cb81d72b45acac2f7e91606232070fafdaf2489ec7fa1c40591123324ec` |
| Hill destination data | `ffae876677cfc7aa7bf6a9c92016c0ccd4ebd65afbf95e65ba59d7ed031ec6f9` |
| Footnote-heading tool | `76a8b2354633cced641bc7aef72a6bdc2c0aa0fc03bf2603c96e356c18c7da24` |
| Full build test | `7b9f52d0ed4d1656732521a25abf17de4e8c17a43e9a3e46895d2efaf6e20b65` |
| Coast edition test | `6fc1360466b9a65b2773d4d5cfd0dcbcda4dcb449cccac101f384f379e48e01c` |
| Coast discovery-flow test | `25eaab79041fbedc45f5ec4c099d777d6086502f790984971273ef4a5d940cf1` |

All eight files released for independent review. Any requested correction requires a bounded return of scope; no further edits planned.
