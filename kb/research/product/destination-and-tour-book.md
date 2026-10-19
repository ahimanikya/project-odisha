---
type: "Product requirements addendum"
title: "Destination discovery and personal tour book"
status: "draft_for_founder_review"
version: "0.1"
---

# Destination discovery and personal tour book

**Addendum v0.1 · 29 September 2026 UTC.** Direction: Ahimanikya Satapathy. Drafted with AI assistance. Supplements [PRD v0.1.0](prd.md); preserves its historical baseline and existing 40-requirement register. The identifiers below belong to this addendum and are not claims that the baseline was already approved or implemented.

## Problem and intended experience

A traveller can enjoy a story yet still not know which part of a destination to visit, what to eat, where to stay or how choices fit into a journey. Utkal should help people research Odisha, collect their own choices and carry a useful tour book. Cultural connections and practical decisions belong together.

**Discover → save places, experiences, food and stays → arrange days → add personal notes → print or save a portable book → return and revise.** A saved plan is personal research, not a reservation or a guarantee that its route is feasible.

## Scope, phases and acceptance

| ID | Requirement | Phase | Acceptance evidence |
| --- | --- | --- | --- |
| POD-TB-001 | Destination content contains areas, key experiences, food, stay bases, season and relevant cultural works, linked to evidence. | Now: pilot | Chilika renders from KB data with stable IDs and all source references resolved. Other places need separate research. |
| POD-TB-002 | Main reading flow stays uncluttered; detailed source and rights credit appears in an accessible end section. | Now: pilot | Keyboard expansion works, sources map to sections, media and translation credits remain retrievable. |
| POD-TB-003 | Save/remove a place, experience, dish or verified stay in a personal collection without creating an account. | Next candidate | Choices survive reload on the same browser; duplicates are prevented; storage failure has a clear fallback; deleting browser data is explained. |
| POD-TB-004 | Create multiple named trips and arrange selected items by day, with notes and optional dates. | Next candidate | Add/remove/reorder works by keyboard and pointer; changes persist; unscheduled ideas remain separate from planned days. |
| POD-TB-005 | Show area and known access information while assembling a day; distinguish unknown times from verified estimates. | Next candidate | No fabricated route duration. Day can remain explicitly unvalidated; regional separation is visible without claiming route optimization. |
| POD-TB-006 | Export a tour book suitable for carrying or printing. | Next candidate | Browser print/PDF produces readable A4 pages with trip title, daily choices, addresses/coordinates when verified, user's notes, checking date and a compact credits appendix. Long plans paginate without truncation. |
| POD-TB-007 | Export/import the underlying plan as a portable file. | Next candidate | Round-trip preserves IDs, ordering and notes; validate format/version/size; render imported text safely; show unknown/deleted items instead of silently losing them. |
| POD-TB-008 | Take usable selected content offline. | Later | Exported book retains necessary text without network access. Offline HTML/images only after rights, file size and cache behavior are tested; external maps/music remain links. |
| POD-TB-009 | Maintain verified food venues and individual stays with editorial independence. | Later, research dependent | Property/venue has source, checked date, access information and honest status; paid association is disclosed and cannot buy a recommendation. |
| POD-TB-010 | Offer optional cross-device sync or controlled sharing. | Later | Explicit user choice; define privacy, deletion, access and cost before selecting a backend. Public links do not expose private notes by default. |

## Model before database

| Entity | Minimum useful fields and relationships |
| --- | --- |
| Place | Stable ID, names/script, geography/areas, coordinates if verified, season, access, narrative reference, review/source metadata. |
| Experience | Stable ID, place/area IDs, activity, interests, why do it, duration/price/access evidence when available. |
| Food | Stable ID, place association, ingredients/preparation where known, diet/allergen knowledge, venue references separately. Unknown is not allergen-free. |
| Stay | Stable ID for an actual property, place/area, type, verified address/contact/access, check date, editorial/commercial relationship. Base areas remain a different entity type. |
| Cultural work | Stable ID, poem/song/film type, author/performer/composer roles, connection type, language, rights and source, optional legal external listening/reading link. |
| Source/asset | Stable ID, URL, creator, evidence locator, inspection scope, licence and modifications, checking date, alt/depiction metadata. |
| Personal trip | Local ID, title, dates optional, ordered days and saved-item references, user notes, data version, creation/update times. |
| Saved item snapshot | Entity ID/type, content version, selected summary and source/credit references, saved time; distinguish snapshot from newer published knowledge. |

No personal trip data belongs in the public Git repository. Public editorial knowledge continues to be reviewed files in Git. Stable entity IDs allow page changes without losing saved choices. The current Chilika record seeds IDs; the actual trip storage schema and migration code have not been implemented.

## Low-budget technical direction

Retain Astro and static hosting. Add a small client-side planner only when the next phase is approved. A small text-only plan can begin with browser local storage behind a versioned storage adapter; evaluate IndexedDB if size or offline assets justify it. Handle unavailable storage, quota errors and older schema versions. Provide file export/import from the first save phase so browser storage is not the only copy.

Use browser print-to-PDF initially; no server-side PDF service or paid mapping API is necessary for the first booklet. Print selected, already licensed images only with the required credit. Test actual output before promising it is useful offline. Map links can point to verified coordinates; route optimization, live traffic and booking integrations are later decisions.

Accounts, Firebase, AI itinerary generation and payment/booking systems are not prerequisites. No paid service or analytics collection is authorized by this addendum. Optional future analytics should measure useful actions (save, arrange, export) without recording personal notes or full itineraries, after the existing analytics decision and privacy design are completed.

## Freshness and validation

Evergreen culture, seasonal observations and volatile travel data need different checks. Record a date per claim or item where useful, not a blanket claim that every detail is current. At export, include a generation date and the underlying checking dates. Recheck opening times, transport schedules, prices and stay availability before publishing those specifics; otherwise say unknown and link to the operator.

Acceptance testing for the future planner must cover reload, empty collections, duplicate saves, missing entities, older schemas, blocked/quota-limited storage, malicious imported text, deleting trips, keyboard reordering, mobile use, and long-book print pagination. A saved choice must never be represented as a booking. No invented accessibility assurance.

## Current delivery and next review

Delivered in this candidate: POD-TB-001 and POD-TB-002 as a Chilika prototype plus the reusable [destination model](../../reference/destination-model.md). Not implemented: saving, arranging, export, offline caching, accounts or booking. Validate the model with a heritage site and a city/food destination before scaling. Founder review decides the next implementation batch; publication remains a separate human gate.

## Direction endorsement

The Founder endorsed the [culture-first travel recommendation](culture-first-travel-direction.md), including Chilika and Konark as pilots followed by saved choices and a printable tour book. This clarifies the delivery direction; the detailed requirements above retain their own review and implementation states.

## Prototype implementation update · 29 September 2026

The Founder authorised the connected-stories and tour-book next step with “Go ahead”. The [local prototype implementation](culture-journey-prototype.md) now covers saving, day assignment, notes, backup import/export and a browser print layout. The original phase table above is preserved; the implementation note records partial acceptance, unverified native PDF pagination and deferred requirements. This update is not public-release approval.

## Multiple-journey increment

POD-TB-004 now has multiple named journeys, optional start dates and dated day headings in the local candidate. [Implementation and compatibility](multiple-journeys.md) records the exact scope and remaining limits.

## Day planning and visit notebooks · 30 September 2026

[Next 210 delivery](next-210.md) extends local POD-TB-003–008 with private day titles/notes, note-only days, bounded group moves/shifts, guarded undo, copy between trips, and seven editorial visit notebooks carried into books. Current backups preserve day metadata; earlier clients may discard it. HTML and text output are verified separately from native PDF pagination, which remains POD-WORK-080. Earlier scope and phase tables above are historical baseline statements.

## Personal preparation and portable days

The [preparation increment](ready-216.md) adds private reminders, guide-specific questions, single-day portable copies and explicit backup-merge choices to the local tour-book implementation. Backups preserve optional reminder data in current clients. Earlier baseline scope remains historical; native PDF and human editorial acceptance remain separate.
