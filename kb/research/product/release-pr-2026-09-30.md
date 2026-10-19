---
type: Release preparation
title: Coastal edition draft pull request
---

# Coastal edition draft pull request

The Founder authorised preparation of the release PR with “go”, following the proposal to consolidate the candidate while keeping merger and publication for separate human approval. Existing [draft PR #4](https://github.com/ahimanikya/utkal-project/pull/4) is the review home. This increment preserves its earlier commits and adds the accumulated, previously local work.

## What reviewers are deciding

The deployable candidate has seven connected guides within 16 pages: Bhubaneswar, Dhauli, Konark, Puri, Raghurajpur, coastal food and coastal bases. Visitors can discover, read, save ideas locally, arrange dated days, keep private notes and reminders, back up their collection, and carry selected days as HTML or text books.

The repository change is broader than that delivery. It includes the shared design system, the 72-page full draft, language and literary research, media prototypes, historic review evidence and the operating records accumulated during this conversation. Keeping that work in Git preserves provenance; it does not make the held pages part of the coastal website or grant editorial acceptance. All changed paths were checked against the existing work. No Store files are changed, and Store remains excluded from the coastal output.

Review in this order:

1. Read the [launch-readiness review](launch-readiness-2026-09-30.md), including native PDF and editorial boundaries.
2. Inspect the edition allowlist and finalisation tool under `projects/site/editions/` and `projects/site/tools/`. The coastal output contains only selected routes and required assets; tests reject out-of-scope links and protect the prior output on a failed build.
3. Review the shared design system, story components, journey state/backup handling, privacy choices and portable-book output. The corresponding product records describe the accepted direction and remaining limits.
4. Read provenance alongside any cultural or photographic judgment. The research/source archive is broader than the release; an automated pass is not scholarly review or permission clearance.
5. Inspect the workflow changes. Pull requests validate and retain a review artifact. Publication stays manual, on main, by the Founder account with explicit approval. No PR event deploys the website.

## Verification and release boundary

The preceding frozen candidate passed 313 site tests, 10 coastal tests and 64 page checks. Four actual downloads were inspected, including embedded photographs and private-note exclusion. Native PDF pagination remains POD-WORK-080. Fixed-width browser checks do not establish physical-device or screen-reader coverage.

The new PR workflow independently repeats the builds, site/coastal tests, shared design-system tests, KB checks and authority-model regressions in a clean hosted checkout. It stores a 14-day coastal review artifact after those checks pass. The artifact is a review download, not a deployed site. Its availability and CI result must be observed before being reported as passing.

A fresh checkout of the staged source passed 313 site tests, 10 coastal tests, six design-system tests and 64 page checks. Its 54 coastal files match the frozen candidate byte-for-byte. The first attempt exposed a missing generated review gallery; the workflow now builds that prerequisite explicitly, and both the failure and successful rerun are preserved. The design-system download index was also corrected to distinguish historical rc.2 from current rc.5 source.

The [preparation record](../../records/release-pr-review.json) carries the actual local/remote results. The [launch manifest](../../records/evidence/launch-readiness-2026-09-30/candidate-manifest.json) identifies the frozen local website. Repository-only documentation and CI changes do not grant new approval to that candidate.

Founder editorial acceptance, native PDF checking and an explicit publication decision remain ahead. The source keeps preview labels and noindex. This work neither merges the PR nor runs the publication workflow.

## Handoff result

[Draft PR #4](https://github.com/ahimanikya/utkal-project/pull/4) is updated as **Prepare coastal preview with journey planning and gated publication**. Product commit `1a81ada827907c4d537931b0673d1fd39943ac99` passed [hosted validation](https://github.com/ahimanikya/utkal-project/actions/runs/36775022636). The downloaded GitHub artifact matches all 54 frozen coastal files byte-for-byte; it expires on 14 October 2026. A subsequent record-only commit preserves this evidence and receives its own check.

The first upload returned HTTP 400 without advancing the remote branch. A per-command HTTP/1.1 and larger-buffer retry succeeded. No force push or global Git configuration change was used. Captured logs and third-party font licences retain their original bytes; GitHub collapses generated evidence in the diff to make source review easier.
