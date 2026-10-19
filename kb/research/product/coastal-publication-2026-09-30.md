---
type: Release record
title: Coastal preview publication — 30 September 2026
---

# The coastal preview is published

Ahimanikya Satapathy replied **“approved”** to the completed PR handoff. That authorises the reviewed candidate for merger and gated preview publication. It does not erase outstanding findings or approve the held research collection as finished editorial content.

[PR #4](https://github.com/ahimanikya/utkal-project/pull/4) merged on 30 September 2026 at 20:56:47 UTC, with exact approved head `7ed21650133e8fab7f1a8a7d63ac5eab1add0f04`. The merge and deployed commit is `dcd506a0b2c85db34428613381492ec53f67f1d1`. The manually approved [publication run](https://github.com/ahimanikya/utkal-project/actions/runs/36776260376) succeeded at 20:58:32 UTC.

The [live site](https://utkalproject.org/) contains the reviewed coastal edition: 16 pages, seven guides, ten journey choices and one starter. Store and held research pages remain outside the deployed edition. Preview labels and noindex remain in place. The preceding PR checks passed 329 tests and 64 page checks, and its hosted artifact matched all 54 frozen coastal files. This release adds no website code beyond that reviewed candidate.

## Live evidence

Odia search for କୋଣାର୍କ returned Konark. Its real photograph and story layout were inspected. A separate synthetic journey accepted Konark, a day assignment and a note. The actual photo-book download included one embedded image and the production guide URL, with the private note excluded from the shareable copy. Contribution links lead to public GitHub Issues; no submission was made. The Store route displayed the coastal 404 page.

A previously visited root URL initially retained the older homepage in the browser. The release query URL served the new coastal homepage, as did the live inner routes. Response headers showed the new deployment timestamp and a ten-minute cache lifetime. The final bare-root browser check also served the new coastal homepage. Both earlier cached and final observations are preserved; propagation resolved during the review.

## Remaining work

- **POD-WORK-080:** native PDF pagination remains unverified. Downloadable HTML books are verified; this does not establish native print results.
- **POD-WORK-095:** HTTPS loads successfully, but GitHub reports a replacement certificate still issuing (`dns_changed`). An attempt to enable automatic HTTPS enforcement returned “The certificate has not finished being issued”. Keep this open until the certificate is ready and enforcement can be verified. No DNS changes were made.
- Editorial drafts retain their review notices. This bounded preview approval does not claim exhaustive fact checking or native Odia review.

The [structured review](../../records/coastal-publication-review.json) links approval, deployment and browser evidence. The prior successful release was `52a6cc5ee31f1542bf203fee23b0328496bd6715`, [run 36510884225](https://github.com/ahimanikya/utkal-project/actions/runs/36510884225), retained as rollback reference; no rollback was performed.

The release-record follow-up also restores the pre-existing `*.pdf binary` Git attribute, inadvertently omitted when review-evidence attributes were added. This affects repository diff handling only, not the deployed artifact.
