---
type: Release review
title: Coastal launch readiness and portable-book verification
---

# Coastal launch readiness

The Founder’s “go” authorised the proposed launch-readiness batch: actual books, the visitor journey, accessibility and mobile checks, editorial gaps, and one reviewable release candidate. This is local preparation, not publication approval.

[Open the combined review](http://127.0.0.1:4353/__review/) · [Self-review](../../records/launch-readiness-review.json) · [Frozen candidate manifest](../../records/evidence/launch-readiness-2026-09-30/candidate-manifest.json).

The candidate contains seven connected guides within 16 website pages: Bhubaneswar, Dhauli, Konark, Puri, Raghurajpur, coastal food and coastal bases. It includes the current journey planner and the prior preparation work. The full 72-page draft remains separate. Utkal Store is absent from this release.

## What this review established

The browser journey started with an Odia search for କୋଣାର୍କ, opened Konark, saved it, followed the story to Puri, saved Puri, and arranged the two places over two dated days. The actual browser downloads were copied unchanged and hashed: a text-only HTML book, an illustrated HTML book, a plain-text itinerary and an HTML copy with private writing excluded. These contain synthetic review notes only.

The long note and its Odia end marker survive in private copies. The shareable copy excludes both private item notes while retaining chosen places and dates. Both photographs are embedded in the illustrated file; no scripts or remote image dependencies are present. Creator, source, licence and transformation notes appear in its credit appendix. The sample books’ online links point to the local preview from which they were downloaded; they are not production links.

[Download verification](../../records/evidence/launch-readiness-2026-09-30/download-verification.json) records exact bytes and hashes. The [actual photo book](../../records/evidence/launch-readiness-2026-09-30/downloaded-photo-book.html) and [shareable copy](../../records/evidence/launch-readiness-2026-09-30/downloaded-shareable-book.html) are retained for inspection.

Book layout checks passed at 360 and 1600 pixels: no horizontal overflow and no broken embedded images. The shared copy was also checked at 360 pixels. The phone photograph and text remain readable. These are desktop browser frames at fixed widths, not physical-device tests. Long full-page screenshots have stitching artefacts; the separate visible-viewport phone capture is the reliable visual reference.

Keyboard checks verified the skip link reaching a visibly focused main region and Space toggling the day-arrangement disclosure without losing focus. This is a focused check, not an accessibility certification or screen-reader audit.

Print exposed no native dialog in the in-app browser. Computer Use refused access to the Codex app; no bypass was attempted. The button previously gave no new feedback when printing silently did nothing. It now announces a print request beside the controls and explains the download fallback, without claiming that a PDF was saved. This change was rebuilt and checked in the browser.

## Seven-guide editorial review

Source checks below were repeated on 30 September 2026. They verify the specified passages only, not every claim, translation or service. Existing image records remain historical evidence; only the two additional Commons checks below were refreshed in this batch.

| Guide | Evidence checked now | Remaining editorial or practical boundary |
| --- | --- | --- |
| Bhubaneswar | [Odisha Tourism](https://odishatourism.gov.in/content/tourism/en/discover/major-cities/bhubaneswar.html) describes its religious heritage and credits Otto Königsberger for the modern city. | Founder to accept the city narrative and names. Current access, facilities and transport have not been inspected. |
| Dhauli | [Odisha Tourism](https://odishatourism.gov.in/content/tourism/en/discover/attractions/buddhist-sites/dhauligiri.html) dates the stupa to 1972 and presents the red-river account as legend. | Retain the separation between the modern monument, older landscape and remembered story. No current show or access promise. |
| Konark | [UNESCO](https://whc.unesco.org/en/list/246) supports the thirteenth-century temple and chariot conception. | Its introductory text says six horses while the detailed synthesis says seven. Do not add an unqualified count from this source alone. The current narrative avoids that count. Festival programmes require a fresh date-specific check. |
| Puri | [Odisha Tourism](https://odishatourism.gov.in/content/tourism/en/discover/major-cities/puri.html) connects the city with Jagannath traditions and the shore; [Incredible India](https://www.incredibleindia.gov.in/en/odisha/puri) recommends October–February. | Seasonal guidance is not a weather or crowd guarantee. Founder to accept devotional framing; entry and photography rules require current local confirmation. |
| Raghurajpur | [Odisha Tourism](https://odishatourism.gov.in/content/tourism/en/discover/attractions/arts-crafts/raghurajpur.html) supports its Pattachitra and performing-arts context. | Workshop access, fees, artist identification and permission to photograph are not established by a tourism page. |
| Coastal food | [The Taste of Odisha](https://odishatourism.gov.in/content/tourism/en/the-taste-of-odisha.html) identifies Mahaprasad with the offering at Puri; [Incredible India](https://www.incredibleindia.gov.in/en/odisha/puri) names the three featured dishes. | The guide distinguishes devotional food from restaurant dining. No kitchen inspection, live menu or allergen guarantee. Human review of terminology remains. |
| Coastal bases | [Incredible India’s Ramachandi passage](https://www.incredibleindia.gov.in/en/odisha/bhubaneswar/experience-the-natural-beauty-of-bhubaneswar) supports the river-and-sea setting. | The saved stay summary is original comparison advice, so its empty source list is not a missing factual citation. The detailed page cites its factual setting. No named property or quietness claim has been verified. |

The [Chhena Poda photograph](https://commons.wikimedia.org/wiki/File:Chhena_Poda-Puri-Odisha-IMG_1323.jpg) records Subhransuphotography, 19 November 2022, CC BY-SA 4.0. The [Konark wheel photograph](https://commons.wikimedia.org/wiki/File:Konark_Sun_temple_during_sunset_09.jpg) records Darshanavenugopal, 14 December 2018, CC BY-SA 4.0. Both match the existing local metadata. This is a provenance check, not a blanket rights clearance of the whole site.

The broader Chilika poem/translation, Gopinath portrait provenance, mural reuse and language-community review remain open in their existing records. They are outside this coastal candidate and have not been silently approved or deleted.

## Evidence and remaining gate

Both builds succeed: 72 full-draft pages and 16 coastal pages. The current output passes 313 full-site tests, 10 coastal tests and 64 page-acceptance checks. The frozen candidate contains 54 files, totalling 7,098,515 bytes. Every file was compared with the build manifest. The review-server verifier also rejected changed, missing and extra files in a disposable copy. Four final homepage/journey layout checks at 360 and 1600 pixels passed. The review desk and synthetic books are served separately and are not in the deployable directory.

The same AI assistant implemented and reviewed this work. Human acceptance is pending. No commit, push, merge, deployment, public issue, outreach or paid service occurred. No new persona assignment or authority is implied.

**POD-WORK-080 stays open:** save the populated journey print view and both HTML book editions to native PDF in a supported browser. Inspect A4 and Letter output, every page, long-note end markers, Odia rendering, uncut photographs, headings and the source appendix. Record browser, paper size, margins, scaling and any clipping. The HTML checks do not substitute for this.

## Release sequence

1. Review this candidate’s seven guides and the complete discover → save → arrange → carry experience. Record specific Founder acceptance and any corrections.
2. Complete the native PDF check above. Retain the documented screen-reader and physical-device limits; address any observed defects.
3. Decide whether this is a public preview or a fully edited launch. The current candidate retains editorial-preview labels and noindex. Removing them would require a deliberate follow-up change and fresh review.
4. Review the repository diff, which includes earlier uncommitted batches. Create a reviewable commit/PR for accepted work; preserve unrelated changes. Record the release commit and keep the previously deployed approved revision available for rollback.
5. Rebuild the approved commit and compare its coastal scope and content with this manifest. Build differences require examination; do not assume the local working tree is the merged release. Only the existing Founder-only manual workflow may publish the approved coastal output.
6. After publication, check the custom domain, HTTPS, discovery, photos, saved journey, book links and contribution destination. If a serious regression appears, restore the previously approved revision through the same release process. Record the result and release evidence.

The combined review is the next human checkpoint. Earlier batch evidence remains unchanged; current verification is stored in its own evidence directory.
