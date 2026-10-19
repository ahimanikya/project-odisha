---
type: "Product implementation note"
title: "Connected culture and My Odisha Journey prototype"
status: "local_candidate_for_review"
version: "0.1"
---

# Connected culture and My Odisha Journey

Direction and final authority: Ahimanikya Satapathy. The Founder accepted the proposed next step with “Go ahead”: connect cultural stories, then prepare the tour-book prototype. This records local implementation, not publication approval.

## What this batch delivers

- Three illustrated reading trails: Chilika and poetry; Balasore and Fakir Mohan; Mayurbhanj, Santali and Ol Chiki. Short sourced milestone sections enrich the writer and language introductions. These are reading connections, not verified travel routes or complete destination guides.
- One editable personal journey in a browser: name, up to 100 saved ideas, day 1–30 or “Ideas for later”, notes of up to 3,000 characters per item, reordering within a day and removal.
- Save controls on destination, detail, food and language/literature profiles; planner discovery covers 28 selected places, experiences, foods, stay areas and reading ideas. No individual stay is represented as reviewed.
- Versioned JSON file backup and explicit replacement import, capped at 1 MB. Unknown item IDs retain their notes. Invalid or inaccessible saved data is not silently overwritten. Quota failure exposes unsaved status and a file-download fallback. Another tab’s write blocks stale editing until reload or explicit restart.
- A text-only browser print layout with ordered days, choices, summaries, notes, checking dates and a source appendix. A4 pagination and native PDF output still need manual review because the embedded browser cannot print to PDF.

## Data and privacy

Public knowledge stays in the existing KB destination and voice records. [Culture trails](../voices/culture-trails.json) are new canonical editorial data. The website derives a deliberately selected catalogue in `projects/site/src/data/journey-catalog.ts`; it does not publish the whole KB.

Personal data is saved under `utkal.journey.v1` in browser local storage. The file schema is `{version:1,title,items:[{id,day,notes}]}`. Names and notes are rendered as text, never HTML. No personal plan, account, analytics event, API request or notes are sent to a service or Git. Export is user initiated. Clearing browser data deletes the saved copy. Browser origins are separate: a localhost plan does not automatically migrate to the public domain; file export/import can transfer it.

This first version resolves saved IDs against the current catalogue at print time, rather than storing dated content snapshots. Missing IDs remain visible. Imported external URLs or unknown properties are discarded. Multiple trips, dates, images in the booklet, offline caching, route optimisation and cross-device sync remain future work.

## Acceptance against the tour-book addendum

| Requirement | Current result |
| --- | --- |
| POD-TB-003 | Save/remove and reload confirmed; storage adapter failure tests and recovery UI included. Stay areas remain distinct from properties. |
| POD-TB-004 | Partial: one named journey, days, notes and keyboard reorder; multiple trips and dates deferred. |
| POD-TB-005 | Areas shown, no invented journey times; route feasibility explicitly unvalidated. |
| POD-TB-006 | Print layout implemented and print-media state checked. Actual PDF pagination remains unverified. |
| POD-TB-007 | Versioned backup, validated import with replacement confirmation, unknown IDs retained; parser round-trip and browser file import checked. |
| POD-TB-008–010 | Offline website, verified venues and optional sync remain deferred. |

[Verification and limitations](../../records/culture-journey-review.json) · [Original tour-book requirements](destination-and-tour-book.md) · [Languages and literary lives](../voices/index.md)

## Subsequent increment

[Multiple journeys and optional travel dates](multiple-journeys.md) supersedes the single-trip limitation in this historical first-version record. Publication and native PDF validation remain separate.
