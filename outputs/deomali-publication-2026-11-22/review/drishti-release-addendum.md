# Deomali release addendum

Reviewer: Drishti, separate AI agent. Reviewed head: `a3e4bc22bef0608892312a990b59596b372219d9`. Review scope: bounded portability correction, pre-merge identifier reconciliation, route inventory and final existing local publication artifact. No new article or publication performed by this reviewer.

**Result: PASS.** No new blockers in this scope.

- The last commit changes only the Koraput research profile's incoming Deomali URL to `https://projectodisha.org/destinations/deomali/` and its generated search index. Link text and destination remain the same. This is appropriate for the portable KB validator and does not alter Deomali’s article prose, media or layout.
- Inspected the work, decision and event renumbering to suffix`2026112291`. References in the article receipt, destination-series record, register and event resolve consistently; the old pre-merge suffix`2026112201` is absent from those records. `tools/registers.py --check` passes. The stated motivation—concurrent Kagaja work under PR812—comes from the coordinator’s reconciliation; this addendum verifies the local noncolliding records rather than claiming a separate remote PR audit.
- Current-task contents in team operations are byte-equivalent as parsed JSON to the input-head foreign task. The previous Sagada article pointer is preserved in history. No programme completion credit introduced.
- Portable public route inventory includes `/destinations/deomali/` and `/destinations/hills/`. `tools/check_bundle.py` passes with1906concepts and8592local links.
- Independently reran the strict local payload acceptance:996,618,022regular-file bytes,3569files, zero symlinks/hardlinks/special files; below the unchanged exclusive1,000,000,000-byte gate.
- Independently reran publication disclosure scan:1473pages, zero violations.
- Independently recomputed Deomali’s article fragment hash in full, coast and publication builds: all match`3c1745b95523b4b4ba2d6d16b1d112d5fa2e41d5d0410f97f06961735db49142`.
- All23retained publication PNG outputs match the independently reviewed output hashes. Their combined measured saving is2,944,535bytes; source assets, algorithm and gate remain unchanged.

Limits: the local Koraput-note artifact predates the last relative-to-absolute URL change, as the coordinator explicitly disclosed. It is not evidence that the final URL has been rendered or deployed; exact-head CI and later live verification must cover that correction. The article fragment itself is unchanged and matches the reviewed candidate. This addendum does not claim CI completion, merge, deployment, live operation, human review or field verification.
