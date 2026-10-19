---
type: "Product implementation note"
title: "Ten pending website items and review"
status: "local_candidate_for_review"
version: "0.1"
---

# Ten pending website items and review

Founder direction: Ahimanikya Satapathy, “Keep going - do 10 things from our pending list and then review”. The assistant selected this bounded batch from the existing research and product queues. These are implemented local candidates awaiting human editorial review, not a release or approval of the entire PRD.

## Delivered batch

| Work | Local preview path | Result | Queue |
|---|---|---|---|
| POD-WORK-021 · Chandipur detail guide | `/visit/places/chandipur/` | Tides, season, arrival, local questions and two credited real shore photographs. | [research/product/northern-guides.md](../../research/product/northern-guides.md) |
| POD-WORK-022 · Similipal detail guide | `/visit/places/similipal/` | Official gate, permit and seasonal guidance; existing credited Barehipani image. | [research/product/northern-guides.md](../../research/product/northern-guides.md) |
| POD-WORK-023 · Kui language introduction | `/languages/kui/` | Separate language profile, classroom resources and a catalogued short-story lead. | [reference/language-heritage-model.md](../../reference/language-heritage-model.md) |
| POD-WORK-024 · Kuvi language introduction | `/languages/kuvi/` | Separate profile and teaching-resource trail; not conflated with Kui. | [reference/language-heritage-model.md](../../reference/language-heritage-model.md) |
| POD-WORK-025 · Saora / Sora language introduction | `/languages/saora/` | Attributed names, language-family and writing traditions; future community voices identified. | [reference/language-heritage-model.md](../../reference/language-heritage-model.md) |
| POD-WORK-026 · Sarala Das literary introduction | `/people/sarala-das/` | Odia epic retelling and an official Sarala Mahabharata reading catalogue. | [research/culture/odia-literature-and-literary-lives.md](../../research/culture/odia-literature-and-literary-lives.md) |
| POD-WORK-027 · Pratibha Ray literary introduction | `/people/pratibha-ray/` | Real credited portrait, teaching, Jajnaseni, place connections and adaptations. | [research/culture/odia-literature-and-literary-lives.md](../../research/culture/odia-literature-and-literary-lives.md) |
| POD-WORK-028 · Area and access guidance in personal journeys | `/journey/` | Per-item access notes and day-level area comparison; no calculated travel times. | [research/product/destination-and-tour-book.md](../../research/product/destination-and-tour-book.md) |
| POD-WORK-029 · Downloadable offline text tour book | `/journey/` | Standalone HTML containing dates, summaries, notes, access and deduplicated source links. | [research/product/multiple-journeys.md](../../research/product/multiple-journeys.md) |
| POD-WORK-030 · Reader correction draft tool | `/contribute/` | Page-linked correction, additional-knowledge or recollection drafts; local preview, text download and copy controls. No submission endpoint. | [research/product/prd.md](../../research/product/prd.md) |

## Content model and editorial boundaries

The [northern detail records](../destinations/northern-details.json) feed the shared place-page template. Existing Chandipur and Similipal save IDs remain stable; regional cards now open the deeper pages. The [voice collection](../voices/collection.json) adds separate Kui, Kuvi and Saora introductions, plus Sarala Das and Pratibha Ray. All seven pages connect into Explore and the personal journey catalogue, which now has 46 choices.

Language pages use designed text panels rather than fabricated script or community images. Source metadata distinguishes full page inspection, catalogue leads and indexed passages. There are no invented quotations, new poem transcriptions or implied permission to visit communities. The Sarala page's general manuscript photograph is explicitly not identified as a Sarala manuscript. The Pratibha page leaves the conflicting Jajnaseni publication dates unresolved.

Two new real images preserve source, creator, date, licence and SHA-256 hashes in the records: Pratibha Ray by Kannan Shanmugam (CC BY-SA 3.0), and Chandipur by Alankar41 (CC BY-SA 4.0). Similipal reuses its previously credited waterfall photograph. Credits remain available at the end of the page.

## Visitor tools

POD-TB-005 now has a local area/access implementation: each saved choice carries guidance, and each planned day names its areas. Reading suggestions do not become geographical stops. Multiple areas trigger a transfer reminder without inventing travel times or route feasibility.

POD-TB-008 now has a text-only offline candidate. The HTML book retains selected summaries, dates, access notes, checking dates, personal notes, unknown IDs and a deduplicated source appendix. It contains no scripts, external style sheets, images or remote fonts. Text is escaped and outbound URLs are limited to HTTP(S); a restrictive content policy accompanies the file. Reading requires no network; following external links does. This does not complete POD-TB-006's unverified native A4/PDF pagination requirement. Editable JSON backups remain separate, and exports resolve the current catalogue at export time.

The correction tool is a local drafting step toward the existing contribution workflow. The footer selects the originating entry where supported. Readers can preview, copy or download a text draft with a claim and evidence. Nothing is sent or autosaved; no contribution register is activated and no rights permission is presumed. Actual receipt, consent and editorial triage remain future work.

## Review result

The 46-page build and all 36 site tests pass. [Detailed self-review](../../records/ten-item-website-review.json) records browser interactions, source limitations and checks. [Synthetic offline book](../../records/evidence/ten-item-offline-book.html) contains only review data. It is an example, not a verified travel itinerary.

Desktop page and tool checks passed. The browser viewport override did not change the measured width, so compact layouts for this batch remain unverified. Native PDF pagination, physical devices and screen-reader review remain open. Browser download controls were exercised; an independently generated sample from the same helper was inspected, rather than retrieved browser-download bytes. The synthetic test journey was removed, preserving the existing journey.

## Remaining queue

1. Founder review of these ten candidates; native-language/community review of language naming and histories, and literary edition checks.
2. Real-device compact-layout and screen-reader review; native PDF output and long-plan pagination.
3. Inspected local access, food venues and stays, with checked dates and accountable contacts.
4. Consented speaker voices, further biographies, verified songs and precise literary place connections.
5. Decide the contribution delivery and consent workflow before accepting public submissions.

The existing PRD baseline and earlier review records remain historical snapshots. This note records incremental progress without retrospectively changing prior evidence. Founder direction and final authority remain with Ahimanikya Satapathy; implementation and self-review were AI-assisted. No merge, push or deployment was performed.
