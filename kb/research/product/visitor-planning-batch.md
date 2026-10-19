---
type: implementation-brief
---

# Visitor planning and inner-page foundations

Status: locally implemented and checked; awaiting Founder review. Ahimanikya Satapathy asked to continue the backlog and noted inner-page layout issues. The current assistant implements this bounded local batch; the Founder retains editorial and publication authority.

## Five outcomes

1. Correct observed layout problems in region, detail, food and voice templates without claiming a complete visual redesign.
2. A food entry point connecting the existing sourced food collection and saveable meal ideas.
3. A things-to-do entry point connecting existing experience research.
4. A stay-area entry point that distinguishes area research from inspected properties or bookings.
5. A per-journey preparation checklist, retained through edits, duplication, backup/import, print and offline books.

The first four extend the encyclopedia, food and visitor-usefulness work streams; the checklist extends existing personal tour-book requirements. Use existing research and licensed images, not new unsourced destination claims. No paid service, booking, commercial Store link or public deployment.

## Evidence and acceptance

Balasore’s current stop grid mixes 827-pixel photographic cards with a 421-pixel text card, leaving a large empty gap in the row. Separate visual stops from compact ideas and keep the DOM reading order coherent. Check detail and reading columns at tablet widths as well as large screens.

All collection links, images and save IDs must resolve. Checklist choices belong to each journey, are user-marked rather than verified, and must survive exports without damaging older plans or unknown checklist IDs. Confirm keyboard interaction, responsive layouts, tests and KB checks. Record remaining visual and specialist review explicitly.

## Completed local review

| Item | Preview |
| --- | --- |
| POD-WORK-070 · Inner-page layout foundation fixes | [Open](http://127.0.0.1:4324/destinations/balasore/) |
| POD-WORK-071 · Food and flavour planning collection | [Open](http://127.0.0.1:4324/food/) |
| POD-WORK-072 · Things-to-do planning collection | [Open](http://127.0.0.1:4324/things-to-do/) |
| POD-WORK-073 · Stay-area planning collection | [Open](http://127.0.0.1:4324/stay-areas/) |
| POD-WORK-074 · Personal preparation checklist and exports | [Open](http://127.0.0.1:4324/journey/#preparation) |

67 pages build; 63 website and six design-system tests pass. Nine pages were checked at 360, 769 and 1440 CSS pixels without horizontal overflow. Checklist keyboard, reload, separate-journey and print-content checks used a separate test origin. Existing main-preview journeys were not edited.

[Self-review and limitations](../../records/visitor-planning-review.json) · [Output manifest](../../records/visitor-planning-manifest.json)

## Open layout work

POD-WORK-075 retains the broader inner-page design review. The Founder’s concern remains valid; the fixes here address specific grid, reading-column and portrait-framing problems. A fuller review should agree the hero hierarchy, navigation, prose rhythm, media mix and related-content arrangement across the place, food, language and literary templates. No claim of a finished visual system for every inner page is made.

## Data compatibility

An optional `checklist` array stores up to 40 unique stable IDs inside a version-1 journey, within the existing version-2 collection. Existing plans without the field remain unchanged. Unknown valid IDs survive and are displayed as retained reminders. Malformed arrays reject the import instead of dropping data. Duplication copies marks independently; new trips begin unmarked. JSON backups, print content and both offline book editions include the current checklist. Earlier website versions may drop the new optional field; use the current site when editing these backups.

The three collection pages are derived from existing saveable catalogue entries and associated, credited media. Their claim evidence remains in the linked guides; no new tourism facts or venue recommendations were introduced.

## Foundation for the open visual work

The subsequent [media and meaning direction](../../design-system/media-and-meaning.md), POD-DEC-052, informs POD-WORK-075. Review where images explain the narrative and how real views, diagrams, AI interpretation and audiovisual treatments serve different purposes.
