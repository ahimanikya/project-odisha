# Deomali bounded merge review

Reviewer: Drishti, separate task-scoped AI agent. Scope: the uncommitted reconciled tree based on Deomali head `94a110b3` and merge head `001d12cff69244d497cfb9caade5f99c48bfdcd7` (`origin/codex/kagaja-mukha-receipt-20261122`). No canonical changes, Git mutations or publication performed by this reviewer.

**Result: PASS for the bounded reconciliation.** No new blockers. PR 813 merge and Deomali publication remain conditional on PR 814 merging first and on successful required checks for the final reconciled head.

## Preserved foreign work

Compared against the exact Kagaja receipt branch. Every existing work, decision, requirement, review, release and source record is preserved unchanged by ID; Deomali adds only its own work and decision. All pre-existing activity events remain identical by ID, with no duplicate IDs. The three new public routes are present uniquely in both coastal and portable website inventories.

The Kagaja preparation receipt, publication receipt, manuscript, article wrapper and its three incoming-link source files are byte-exact to the receipt branch. Publication receipt SHA-256 remains `aca0fcc29cf55f662cb7568e666d6252e1f5bed806c0b20af5d2287fa1e6e891`. The rollout’s Kagaja completion and checks are unchanged from its owner-reviewed receipt; this merge review does not independently grant that completion or waive its release condition.

The foreign `current_task` is unchanged. Kagaja’s prior `current_article` object is preserved in article pointer history, including the text making scope release effective upon receipt merge. Deomali’s activation condition and receipt explicitly prohibit PR 813 merge/publication before PR 814 merges. The tree has one in-progress rollout article, Deomali. No programme credit is introduced.

## Combined website behavior

The full-page fixed addend is 166: original 163 plus Kagaja, Deomali and the hills index. The discovery fixed addend is 153: the existing 151 plus Deomali and hills. Both exact source-heading plugin paths remain present. These are consistent additions; foreign route or source-heading behavior was not discarded.

All 13 previously reviewed Deomali file hashes still match except the source-heading plugin, whose only additional change preserves the Kagaja exact path. Deomali prose, image metadata/asset, wrapper, previews, navigation and scoped PNG optimizer remain as previously reviewed. Both staged and unstaged diff whitespace checks pass.

The fresh reconciled Astro build completed with 676 generated pages. Independently inspected its output:

- Deomali article fragment remains `3c1745b95523b4b4ba2d6d16b1d112d5fa2e41d5d0410f97f06961735db49142`, identical to the reviewed candidate.
- The corrected absolute Deomali URL now appears in the rendered Koraput research notes.
- Kagaja’s article and visible source heading are present. Its article fragment is `cbb8b6a3f95893ee2734c42bbf5667a242e07e3989370bf24f656fb29c922a6c`, matching the preserved foreign delivery receipt.

## Remaining release gates

The previous successful CI run applies to the pre-reconciliation Deomali head, not automatically to this merged tree. The coordinator must commit the reviewed reconciliation, obtain exact-head required checks, confirm PR 814 is merged, then merge/publish Deomali and verify actual live delivery. This review does not claim those future steps, a new coastal/publication build for the reconciled tree, or completion of the post-Astro Dhaga export. Existing local publication size evidence remains explicitly the earlier build.
