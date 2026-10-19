---
type: Website quality review
title: Coastal launch-quality follow-up — 30 September 2026
---

# Make the published preview easier to maintain and use

Ahimanikya Satapathy’s **“go”** authorised the recommended first three follow-ups: reconcile the backlog, verify printed tour books where the browser permits it, and strengthen the seven live guides. This candidate is separate from the already published POD-REL-006. It does not expand the release to Chilika, Store or other held pages.

[Draft PR #5](https://github.com/ahimanikya/utkal-project/pull/5) · [Open the local candidate](http://127.0.0.1:4354/knowledge/konark/#visit-notebook) · [Structured review](../../records/launch-quality-review.json)

## Backlog reconciliation

The [comparison record](../../records/evidence/launch-quality-2026-09-30/backlog-reconciliation.json) preserves each changed task’s previous state. Nineteen functional tasks now correctly say completed/published under the existing approval and release, including multiple journeys, portable books, filtering, contributions, duplication, undo and day planning. This records existing delivery; it creates no new release.

Four guide records—Bhubaneswar, Puri, Dhauli and Raghurajpur—now show **published** readiness while remaining **awaiting review** for fuller editorial acceptance. Fifteen broader tasks explicitly identify their published coastal subset while retaining the remaining scope. Other held content is unchanged. Native printing remains POD-WORK-080. The seven-guide editorial and local-arrangement queue is consolidated in POD-WORK-097.

## Seven more useful planning passages

The existing Before you go sections carry brief source-supported context followed by practical editorial advice. No new panel or competing navigation was added. References remain in the page-end disclosure and now accompany the corresponding saved ideas in both HTML and plain-text books. A reference check date is not a promise about current services.

| Guide | Improvement | Still to establish |
| --- | --- | --- |
| Bhubaneswar | Begin with one old-town site and arrange its access and return pickup separately. | Site-specific entry, facilities and accessible approach. |
| Dhauli | Distinguish the modern pagoda from older history; check an actual show date before making evening plans. | Current show operation, access and facilities. |
| Konark | ASI’s sunrise-to-sunset guidance replaces a generic entry reminder; check tickets, museum and festival separately. | Current ticket transaction, museum/festival programme and access. |
| Puri | Seasonal starting point with a prompt to check temple rules before queueing. | Entry eligibility, belongings rules, crowd and shore conditions. |
| Raghurajpur | Approximate distance used only for orientation; arrange the maker visit, permission and return. | Named host, demonstration terms, access and facilities. |
| Coastal food | Ask what is available, ingredients, portion and price; distinguish Mahaprasad from a restaurant plan. | Inspected kitchen, menu, dietary suitability and devotional arrangements. |
| Coastal bases | Choose the setting, then confirm the property’s exact location, access, meals and transport. | Any named property, rooms, facilities or booking terms. |

Primary pages inspected on 30 September 2026: [Bhubaneswar](https://odishatourism.gov.in/content/tourism/en/discover/major-cities/bhubaneswar.html), [Dhauligiri](https://odishatourism.gov.in/content/tourism/en/discover/attractions/buddhist-sites/dhauligiri.html), [ASI Konark](https://asi.nic.in/pages/WorldHeritageKonarak), [Puri](https://www.incredibleindia.gov.in/en/odisha/puri), [Raghurajpur](https://odishatourism.gov.in/content/tourism/en/discover/attractions/arts-crafts/raghurajpur.html) and [Ramachandi’s setting](https://www.incredibleindia.gov.in/en/odisha/bhubaneswar/experience-the-natural-beauty-of-bhubaneswar). The [source-check record](../../records/evidence/launch-quality-2026-09-30/source-checks.json) preserves rejected inferences and remaining gaps. Official tourism pages are not treated as field inspections or guaranteed schedules.

## Print correction and remaining verification

Both journey printing and standalone books forced A4 in their styles. They now use the paper selected in the print dialog, retaining 18 mm margins, heading-break controls and image constraints. This is a style correction, **not proof of native A4 or Letter pagination**.

The in-app print request again exposed no print interface. Chrome use was requested because the browser skill requires an explicit choice before switching; no switch or bypass occurred. POD-WORK-080 stays open pending a supported browser. The [six-case print matrix](../../records/evidence/launch-quality-2026-09-30/print-matrix.json) records every case as not tested. Use the current [text sample](../../records/evidence/launch-quality-2026-09-30/text-book.html), [photo sample](../../records/evidence/launch-quality-2026-09-30/photo-book.html) and [synthetic journey](../../records/evidence/launch-quality-2026-09-30/synthetic-journey.json). These are generated test fixtures, not actual browser downloads or PDFs.

For each A4 and Letter case, save all pages at 100% scale, record actual margins and header/footer settings, then inspect long-note end markers, Odia glyphs, heading separation, uncut photographs and the source appendix. The native journey view must also be checked using only the synthetic plan in a separate journey. Do not replace existing personal journeys.

## Verification and release boundary

315 site tests, ten coastal tests and 64 page checks passed. The new integration regression checks ensure planning citations survive both portable formats for all seven guides. Browser inspection confirmed the updated Konark paragraph, source disclosure and a readable 360px layout. Full builds retain 72 research pages; the coastal artifact remains 16 pages. Shared design-system source was not changed.

No deployment occurred. Human editorial acceptance, current local-service checks, native PDFs and the earlier certificate-enforcement follow-up remain visible. The approval of this work authorises preparation, not a new publication decision.

## Publication follow-up · Founder approved

The Founder replied “approved” after the draft PR handoff. PR #5 merged at `27c85cd25d393f7d8c9dc3dab2ac7878aa95a9a3`; [Pages run 36781616965](https://github.com/ahimanikya/utkal-project/actions/runs/36781616965) succeeded. All seven updated planning passages were checked on the live site. Actual HTML and text book downloads contained the new planning reference and public-site entry link; the HTML used automatic paper sizing. Native PDF pagination remains unverified. Earlier candidate notices above describe the preparation stage and are preserved as history.

[Publication and smoke-test evidence](../../records/launch-quality-publication.json). The deployed coastal scope and editorial-preview status are unchanged.
