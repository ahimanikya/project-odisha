# Tensa: preliminary release-helper review

Reviewer: Drishti, separate automated review; 24 November2026.

**Core sequencing and checks are sound, with two material verification gaps to close before treating the final helper result as reviewed-artifact acceptance.** The manuscript is still being written; this is code inspection only. I did not execute either helper, start a build, edit helpers or operate a browser.

## Findings requiring finalization

1. **Reviewed-source continuity is not pinned.** verify-local.py compares the three emitted article fragments to one another, but never reads or checks the article manuscript against an immutable final reviewed SHA-256. Equally stale outputs could satisfy equality, and a source change after an earlier build is not detected by this helper. After article review/freeze, record and assert its final manuscript hash before the sequential build and in final verification; keep that expected value fixed through the run and exact-candidate review. Pin the independently reviewed photograph SHA as well, rather than relying solely on a mutable metadata file's current expected value. The reviewed original is `64b6b782a99bf5252d41dcf4a187ac0725c77004c2d708c8c1fcfc655404c56d`. A hash assertion verifies continuity; actual rendered copy review/fresh build remains necessary and is not replaced by it.

2. **Actual image geometry is not decoded.** Current checks compare width/height HTML attributes, responsive width declarations and bytes/hash against the generated responsive report, but do not decode the delivered base or WebPs. Add actual decoder checks for base2048×1365 and variants480×320,960×640,1440×960, matching their srcset descriptors. This closes a measurable geometry gap; the final visual review must still assess clarity and crops.

The provisional citation rule (at least3refs, equal return count, all targets exist) is understood as draft-stage scaffolding. At freeze, assert the actual citation count, unique source-note count and distinct return targets; counting only links cannot detect repeated links to one return ID. Root already identified final counts as a pending freeze step. No specific final count is inferred before the article is complete.

## Confirmed useful coverage

run-checks.py locates the intended root/site, explicitly selects the existing Node25 runtime, runs the13existing build/test/audit/disclosure stages sequentially, records each exit status and stops at failure. Full tests follow the complete full build; coast tests follow its build; publication follows the coastal audits. It never merges or deploys. Its stage logs and results use fixed filenames: if a failure requires retry, retain the original failure evidence before rerunning so historical results are not overwritten. This is an execution requirement, not a claim that any failure has occurred.

verify-local.py requires the complete stage set and zero exits; checks unique HTML IDs, resolving native notes, byline and expanded source/reading/update labels; inspects hero priority/alt/credits/linked source+licence, OG/Twitter, exact image bytes and responsive files; verifies one correctly photographed card on all three incoming routes and credit entries tied to this source; verifies local reading targets and article equality across all three editions. Its expected photo family is coherent with responsive-candidate.json: base292,662 bytes plus16,280/60,272/121,744 bytes = **490,958 projected image bytes**, not a final publication payload.

Both dedicated public outputs are scanned for Kaincha path/prose/filename leaks and same-size exact protected hashes irrespective of extension. All15preparation file hashes, completion-review hash, original preparation receipt, foreign ownership fields and preceding Birakishore receipt are checked. The full internal draft edition is appropriately not treated as the public exclusion target.

Actual final dist-publish bytes are summed against the strict decimal1GB bound. I inspected build-publication.mjs: it already rejects symlink inputs, validates the public HTML route set, preserves dist-coast and applies its actual final size gate. The normal hosting-payload acceptance check and exact hosted Linux capacity remain additional release evidence, not implied by this supplementary verifier.

## Review boundaries

These helpers cannot establish source truth, current mine/camp conditions, licence chain-of-title, readable responsive layout, actual browser interaction, hosted delivery or image visual equivalence. The specified separate source, media, browser and live reviews remain necessary. No article, image derivative, rendered output or publication PASS is given here.

## Inspected hashes

- `run-checks.py`: `107b5c65a8219638e0fc7d332694c071989ed9302a40e935574f2f4d44f6ed72`
- `verify-local.py`: `2b1064ba4e6378390e51846e517f2716a93e4badddfa5e88f7b18f2b51502f66`
- `media/responsive-candidate.json`: `7568b1fbeebffd8653f885200b780a1534b79b85786ede59e40701904e2e97fa`

## Integrated-review closure — 24 November 2026

The original findings above remain historical. Current code now pins the reviewed manuscript contract and original photo SHA, records manuscript continuity at every stage, requires exact 7 references / 4 unique notes / 7 distinct returns, and independently decodes final image dimensions. Static inspection therefore closes both material local-helper gaps; execution remains pending completed artifacts.

I also inspected verify-live.py. An initial incoming-card coverage gap was reported and corrected: current code compares card text, image base/alt and responsive width sets, fetches card variants and verifies their content-addressed filename prefix. The final inspected SHA is `728d82bf4aa93438a7b59f2dc4e31e4076c9fb5209f9f34b4b11a5915a3f08f8`. Decoded live geometry, unequal-byte image review and actual UI observations remain separate delivery obligations. Full static review and exact source hashes are in drishti-review.md. No helper or build was run by this reviewer.
