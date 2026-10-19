---
type: "Product implementation note"
title: "Multiple journeys and optional travel dates"
status: "local_candidate_for_review"
version: "0.2"
---

# Multiple journeys and optional travel dates

Founder direction: Ahimanikya Satapathy, “Whats next in the list, keep going”. Assistant selected the remaining multiple-trip and date portion of POD-TB-004. This is a local implementation candidate, not a release decision.

## Delivered

Up to ten named trips can coexist, each with its own saved choices, notes and optional start date. The selected journey receives saves from other pages; its name is displayed there. Switching preserves other trips. Deleting a trip requires confirmation and keeps at least one trip. Existing limits of 100 ideas, 30 numbered days and 3,000 characters per note apply per trip.

Day headings, selectors and print content derive dates from the first travel day, calculated in UTC. Ideas for later stay undated. Clearing the start date restores day numbers. No end-date constraint or route feasibility is implied.

Export one trip or the whole collection. Importing a single-trip file adds it as a new trip after confirmation. A collection backup replaces all trips only after an explicit warning and confirmation. Unknown item IDs remain visible with their notes.

## Storage and compatibility

The new browser key is `utkal.journeys.v2`: `{version:2,activeId,trips:[{id,plan}]}`. Each plan retains the version-1 shape with optional `startDate` (`YYYY-MM-DD`). On first use, the earlier `utkal.journey.v1` value becomes a trip without modifying or removing that earlier key. The v2 copy is persisted on the first edit/save. Thereafter the v2 collection is authoritative; the old key is a preserved snapshot, not a synchronised second copy. Corrupt v2 data blocks editing instead of silently switching to the old snapshot.

Collection backups are limited to 10 MB and ten trips. Single-trip backups retain the original 1 MB validation through the legacy reader; a maximum valid trip fits within that limit. Browser storage may have lower available quota: failure leaves current in-memory work exportable and shows an unsaved warning. On content pages the fallback exports all current trips. Data and notes remain in the browser or an explicitly downloaded file; no new service, telemetry or payment.

## Verification and remaining work

[Review evidence](../../records/multiple-journeys-review.json). Twenty-eight site tests pass; browser interactions verified creation, isolation, selection, dates, save destination, old-file import and collection restore. Native PDF pagination remains an explicit outstanding check from the first planner batch. Calendar end dates, routing, offline content, photos in the booklet and cross-device sync remain future work.

[Initial prototype and historical limits](culture-journey-prototype.md) · [Tour-book requirements](destination-and-tour-book.md)
