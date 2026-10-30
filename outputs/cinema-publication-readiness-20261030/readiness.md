# Odia Cinema publication readiness

The expanded collection is ready for the release workflow. This is a locally verified candidate: no new files have been uploaded, merged or deployed in this pass.

The candidate contains 41 readings in seven parts and uses 47 distinct article images. Following the requested Cinema Futures revision, the reviewed digital book has 235 pages; the printable reading edition has 260. Both now contain practical recommendations without a timed pilot or project-style checklist. The exact current assets are in `book-release-manifest.json`.

## Issues corrected

- The publication selection omitted 13 readings that were already visible in the full preview. All 41 readings, the corresponding full-image links and the existing search policy now agree.
- The cinema workspace was behind 45 newer changes on the main branch. The release candidate preserves those changes, including the newer Dhaga collection and shared website improvements.
- Three publication tests still expected an earlier collection. They now check the current parts and image placements and the correctly labelled available book edition.
- Four articles were missing from the editorial work list. Ten local-review statuses did not match its status model, and five source bindings were stale. These are reconciled without claiming publication or human approval.
- The next book-download page is prepared with separate edition labels and preserved archive links. A safeguard verifies the exact PDFs, all 41 chapter sources and the narrative plan before it can switch the downloads. It also verifies the uploaded files before applying the change.

## Verification

The earlier broad checks below remain the baseline. The latest wording revision passed 26 focused cinema tests, seven focused publication tests, seven book-activation fixtures, rendered checks on all41readings and the disclosure gates. Independent review covered the revised prose and affected book pages. No new full-series factual audit is claimed.

| Check | Result |
| --- | --- |
| Full website tests | 653 passed |
| Selected-publication tests | 535 passed |
| Book activation safeguards | Seven isolated-fixture tests passed; no real upload assumed |
| Cinema pages in the publication artifact | All 41 present |
| Local links and fragments independently inspected | 3,776 resolved |
| Cinema image assets independently inspected | 179 resolved; 47 distinct originals retained |
| Publication artifact | 615,607,238 bytes, below the 1,000,000,000-byte limit |
| Search selection | Existing 11 indexable routes unchanged |
| Knowledge bundle, route inventory, catalogue and work list | Passed after reconciliation |
| Browser spot check | New writer page, source-note return and next article worked; no overflow at 390px |

The targeted source check revisited 12 important reader destinations. Seven returned matching content; five access failures remain unverified rather than being classified as broken. ShemarooMe’s *Ankur* page describes a 17-minute item and remains a synopsis source, not a verified complete-film link.

## Release handoff

Continue from `cinema-publication-ready-20261030`, based on main revision `6d9469e92edb4c8d2001325c38b51b9dda3525d3`. The earlier cinema workspace remains preserved. If main advances again, reconcile its changes before publishing.

1. Commit the reviewed source payload and complete the required pull-request checks.
2. Upload the two exact PDFs identified in `book-release-manifest.json` as a new book release, retaining earlier editions.
3. Supply the actual release URL to `activate-book-release.mjs` for a dry run. Review its proposed changes, then apply them. The script refuses mismatched files, changed sources and unverified downloads.
4. Rebuild and validate the changed book page and publication artifact, then complete the approved merge and deployment workflow.
5. Verify the live 41-reading collection, both actual PDF downloads, image links and representative reading paths. Save the release receipt before marking delivery complete.

The current local book page still truthfully links to the published 27 October edition. It is deliberately not relabelled as the new 41-reading book before the new files exist at their real download URLs.

## Limits retained

The prior deep review records the remaining historical and commercial-evidence limits. A few dates, editions and archive gaps remain unresolved; reported box-office figures are not audited profit figures. These limits remain beside the relevant claims or in their source notes.

The PDFs are reading editions, not printer-specific press files or tagged accessibility editions. Some historical imagery is low resolution. Physical print proofing and a native Odia proofreading pass remain separate from these local technical checks.

No publication, human approval, private interview, exhaustive playback verification or new programme completion is claimed.
