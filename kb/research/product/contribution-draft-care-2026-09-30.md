---
type: Website quality review
title: Contribution draft care — 30 September 2026
---

# Keep the reader’s draft safe

The Founder’s “go” authorised the next bounded website improvement. Downloading a contribution draft previously cleared the leave-page warning as soon as a download was requested. The browser cannot prove disk delivery at that point.

The candidate keeps the reminder until the reader confirms a kept copy or a current clipboard copy succeeds. Further edits restore protection; delayed clipboard completion cannot clear protection for newer text. A failed download leaves the draft available. The new-subject field and character counter now hide together. Editing continues to remove previously prepared GitHub links and previews.

318 site tests, 10 coastal tests and 64 page checks passed. A real synthetic text file was downloaded and inspected. Validation, keyboard confirmation, focus return, new-subject display and issue-link invalidation were checked in the in-app browser. No issue was opened or posted. Several pointer activations produced no visible change; keyboard activation completed the checks. The cause is not established. Native leave-page dialog and actual clipboard delivery remain unverified; revision transitions have unit coverage.

[Structured review](../../records/contribution-draft-care-review.json) · [Browser and file evidence](../../records/evidence/contribution-draft-care-2026-09-30/browser-checks.json)

## HTTPS question

At the Founder’s request, a fresh read-only check found valid HTTPS serving, HTTP returning 200 without a redirect, and GitHub reporting `dns_changed` with enforcement disabled. DNS matched GitHub Pages requirements. GitHub documents removing and re-adding the custom domain to restart provisioning. That reset has not been performed because it briefly disconnects the live domain. The underlying reason for the stuck issuance state is not exposed by GitHub.

[Recorded hosting state](../../records/evidence/contribution-draft-care-2026-09-30/hosting-status.json). POD-WORK-095 remains blocked. Native PDF and local-service verification remain open separately. This contribution candidate is not deployed.

[Draft PR #8](https://github.com/ahimanikya/utkal-project/pull/8) · [Local contribution preview](http://127.0.0.1:4354/contribute/)

## Publication and domain repair · Founder approved

The Founder approved PR #8 and explicitly authorised a lasting HTTPS repair. The reviewed revision merged at `ac58ec0a1b907ebcd57781be8cb66550103f059b`; [Pages deployment](https://github.com/ahimanikya/utkal-project/actions/runs/36788697308) succeeded. A live synthetic contribution downloaded correctly, and acknowledging the kept copy returned focus to Download draft.

The custom domain was removed and immediately restored at 22:59 UTC to restart certificate provisioning. GitHub confirms valid DNS and HTTPS eligibility for apex and www, but issuance remains pending and www currently fails certificate-name verification. Enabling enforcement was rejected until issuance completes. The earlier approval restriction on resetting the domain is superseded by this explicit approval.

[Publication evidence](../../records/contribution-publication.json). Hosting repair remains separately tracked under POD-WORK-095; no browser redirect workaround or new hosting service was introduced.

### HTTPS repair completed

At 23:10 UTC, a new approved certificate covered both `utkalproject.org` and `www.utkalproject.org`. Persistent GitHub Pages HTTPS enforcement was enabled. Both HTTP names and HTTPS www return a direct permanent 301 to canonical HTTPS; inner-page paths and query strings remain intact. Every tested redirect ended in a verified HTTPS 200 response. POD-WORK-095 is complete. Earlier pending observations above remain as the sequence of the repair.

[Redirect responses](../../records/evidence/contribution-publication-2026-09-30/redirect-checks.json) · [Final Pages settings](../../records/evidence/contribution-publication-2026-09-30/pages-final.json). Keep the verified domain and DNS configuration stable; GitHub manages ongoing certificate renewal.
