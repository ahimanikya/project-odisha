---
type: Product increment
title: Next 210 — visit notebooks and personal day planning
---

# Give the visit room to become your own

The Founder authorized this continuation with “pickup next 200+ items”. This batch contains **210 tracked acceptance items: 40 implementation items, 35 original editorial fields, 70 content-contract checks, 35 regression cases, 24 responsive inspections and six integration checks**. That is 75 product/content tasks and 135 checks, not 210 new features or 210 pre-existing register tickets.

[Open the current coastal candidate](http://127.0.0.1:4349/) · [Compare the new sections](http://127.0.0.1:4349/__review/) · [210-item ledger](../../records/next-210.json) · [Self-review](../../records/next-210-review.json).

## Seven small notebooks inside the stories

Bhubaneswar, Dhauli, Konark, Puri, Raghurajpur, coastal meals and coastal stay areas now each have five original editorial prompts: notice, connect with care, prepare, pair with another story, and remember. The heading and two immediate prompts stay visible. A disclosure holds the secondary prompts, so the narrative still flows into its existing onward section. Each notebook has a stable `#visit-notebook` link and uses the existing saved identity.

The coastal food notebook explicitly attaches to “Understand Mahaprasad”; individual dishes remain separately saveable. The stay notebook asks the reader to verify an actual property rather than implying that a regional area guide has inspected rooms. These are invitations and questions, not invented quotations, eyewitness reports, operating hours or verified routes. No new photograph, permission, paid service or factual fieldwork is claimed. End-of-page credit identifies the prompts as original Project Odisha editorial work prepared with AI assistance under Ahimanikya Satapathy’s direction.

All five prompts travel into HTML books, plain-text itineraries and print with the linked idea. The KB record remains the canonical source: [visit notebooks](../destinations/visit-notebooks.json). Automated checks validate the seven routes, saved IDs, onward links, rendered sections and export text. Those checks establish delivery consistency, not cultural authority or human acceptance.

## A day can be a pause

A journey can now contain a named day and private notes without any selected stop. Arrange whole days adds the first free day from 1–30. Each day can have an 80-character title and 2,000-character note. Titles and notes participate in local saved search, including a day with no ideas.

Move a group of ideas to another day, or back to Ideas for later. Existing destination ideas stay ahead of the moved group. Item notes travel with their ideas; day titles and notes stay with their original day. Shift planned days moves both ideas and day metadata by a whole number while keeping the trip start date unchanged. It refuses an operation outside days 1–30 before changing anything.

Undo records the latest day arrangement within the current journey. It restores only if the current plan still matches the result of that operation; it will not erase intervening edits. A separate Copy idea action keeps the source and makes an independent copy under Ideas for later in another journey. Duplicate or full destinations reject the operation without a partial change. Existing move behavior remains available.

Day titles and notes are private writing. Turning off personal notes omits them, together with item notes, from HTML, text and print copies. Saved originals and editable JSON backups remain complete. A zero-stop day can be exported. A newer copy written by another tab disables the day-editing controls while recovery exports remain available.

## Compatibility and scope

Current code accepts older v1 journeys and v2 collections unchanged and preserves optional `dayNotes` in current backups, duplication and library validation. The optional metadata extension does not create accounts, automatic sync or a new storage service. Earlier client versions can discard fields they do not understand: use the current site when importing a new backup. This limitation is stated in the usage guide and [day-note model](../../models/day-notes.md).

This increment develops UTP-TB-003 through 008 locally. HTML/text export and note privacy have automated and browser evidence; **native PDF pagination is still UTP-WORK-080**. No map, live route optimization, reservation or inspected property is implied. Store, wider content clearance, AI chat, Firebase and analytics remain separately scoped.

## What was checked

Both editions build: 72 pages in the full draft and 16 in the coastal delivery. **205 full-site tests and 10 coastal tests pass.** The 105 added tests comprise the 70 content contracts and 35 planner regressions. Existing route acceptance checks pass 64/64. Browser geometry and loaded-image checks pass across six pages at four widths, including 360 and 1600 pixels. Representative phone and desktop screenshots were visually inspected; this is not a complete accessibility or physical-device audit.

Real browser interactions checked day creation and reload, grouped moves, shift and undo, refusal to undo over a newer note, copying, note-free print content, note-only exports, local day-note search and stale-tab protection. Tests verify generated bytes and hostile imported text. Actual downloaded file bytes, the file-picker import flow and the native empty-day confirmation were not all inspected end to end this turn.

The audit tool had a hard-coded output path to the first batch. Its first run in this batch refreshed that older `page-acceptance.json`. The earlier manifest hash has deliberately not been rewritten; that file is no longer the original artifact. The [correction record](../../records/evidence/next-210-2026-09-30/evidence-correction.json) identifies the affected path and hashes. The tool now defaults to disposable build output and requires an explicit destination for archived evidence. This batch has its own audit file.

The same AI assistant implemented and reviewed the work. Everything remains a local candidate with the existing editorial limitations and Founder authority intact. No push, merge, deployment, outreach or public submission occurred.

## Review the experience

Open Konark’s visit notebook, then My journey. Try a separate starter, add a quiet day, write a private note and move a few ideas. Compare Shift with Move; try Undo after making a newer edit. Turn off personal notes before sharing a book. The comparison page opens the relevant section at the selected layout width.

Next, consolidate the actual editorial acceptance of the coastal collection and finish the native PDF check rather than treating additional automated passes as either approval. The larger research collection remains preserved for later expansion.
