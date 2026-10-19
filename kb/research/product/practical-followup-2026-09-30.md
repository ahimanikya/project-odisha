---
type: Website quality review
title: Practical coastal follow-up — 30 September 2026
---

# Give the visitor somewhere useful to ask

The Founder’s “go” authorised the next practical-information and launch follow-up. Seven existing notebooks now link to the working Odisha Tourism tourist-office directory, with a question appropriate to the guide. The passages and directory reference travel in HTML and text books. Source attribution stays in the page-end disclosure. No contact details are copied into a stale local directory.

[Draft PR #6](https://github.com/ahimanikya/utkal-project/pull/6) · [Local Puri preview](http://127.0.0.1:4354/destinations/puri/#visit-notebook) · [Review evidence](../../records/practical-followup-review.json)

Puri’s preparation passage now identifies Puri railway station using the [district government’s temple page](https://puri.odisha.gov.in/en/tourism/tourist-places/shree-jagannath-temple). It does not claim a checked train service or transfer. The earlier conflicting Incredible India transport widget remains excluded. The official site’s “Visitor Information Centers” navigation link rendered a 404; the separate [tourist-office directory](https://odishatourism.gov.in/content/tourism/en/dot/visitors-information/tourist-offices.html) worked and lists Bhubaneswar, Konark and Puri. No listed contact was called.

## Local verification becomes specific work

The [seven-guide queue](../destinations/coastal-verification-queue.json) keeps every local confirmation and editorial acceptance empty until evidence exists. Each guide identifies a suitable confirmation role and the evidence to capture. An office listing is a starting point, not a guarantee of a response or referral.

| Guide | Evidence needed next |
| --- | --- |
| Bhubaneswar | A chosen site’s entry eligibility, approach, steps, breaks, toilets and return pickup. |
| Dhauli | Show operation for a named date, booking/cancellation and actual approach. |
| Konark | Monument and museum arrangements separately; festival programme for the intended year. |
| Puri | Temple administration’s current rules, actual transport and shore guidance on the day. |
| Raghurajpur | A consenting maker, appointment, fee, photography agreement and facilities. |
| Food | A named kitchen or host, dated menu and ingredients; devotional context kept distinct. |
| Stays | Specific property and room, access, price and cancellation; proprietor claims distinguished from inspection. |

Record when, who, what exactly was confirmed, supporting evidence and permission to publish. Conflicting answers stay visible. This preparation does not complete POD-WORK-097 or claim field verification.

## Hosting finding

The [DNS and HTTPS record](../../records/evidence/practical-followup-2026-09-30/https-diagnostics.json) shows the four documented GitHub IPv4 addresses, www pointing at ahimanikya.github.io, and no apex AAAA or CAA records. HTTPS succeeds with certificate verification; HTTP still returns 200 rather than a redirect. GitHub reports dns_changed and rejected the enforcement request because issuance is unfinished. Its health endpoint returned an empty object, which provides no further diagnosis.

[GitHub documents](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) removing and re-adding the custom domain to restart provisioning. That potentially disruptive repair was not performed during this content pass. Preserve the current DNS and Pages settings and plan a short maintenance window before resetting the domain if issuance remains stuck. POD-WORK-095 stays blocked; no automatic polling is scheduled.

## Verification and limits

315 site tests, 10 coastal tests and 64 page checks passed. The existing integration test now also checks visitor-help text and its source in each page and both book formats. Desktop and 360px iframe views were inspected. The coastal release remains 16 pages, with preview notices and the same publication boundary.

Native PDF pagination remains unverified (POD-WORK-080). The in-app browser previously exposed no print dialog; the requested Chrome choice is still pending. No new print attempt or browser workaround was made. This candidate needs Founder review before publication; Store and other held pages remain excluded.

## Publication follow-up · Founder approved

The Founder replied “approved”. PR #6 merged at `e55be1ef25158158fe4f43fa73f722c20126f5c2`; [Pages run 36784303118](https://github.com/ahimanikya/utkal-project/actions/runs/36784303118) succeeded. Live rendered checks passed for all seven updated guides. A separate synthetic Puri journey was saved; the browser reported an offline-book download, but fresh files were not found in the expected folder, so actual-file inspection remains open as POD-WORK-099. Existing automated HTML/text integration checks passed. Earlier candidate notices describe preparation and are preserved as history.

[Publication and smoke evidence](../../records/practical-publication.json). Native PDF, HTTPS enforcement and local-service checks remain separately tracked.

Download follow-up: POD-WORK-099 was resolved by inspecting actual current HTML and text files after a fresh page load. [Evidence and feedback candidate](download-followup-2026-09-30.md). The earlier unverified smoke result above remains an accurate historical record.
