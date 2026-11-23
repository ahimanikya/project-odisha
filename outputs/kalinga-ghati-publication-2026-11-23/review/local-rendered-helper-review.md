# Kalinga Ghati: local rendered and verification-helper review

Reviewer: Drishti, separate automated review; 23 November 2026.

**Rendered assessment: PASS within the nine supplied views. Helper assessment: sound core checks, with one required public-exclusion coverage correction pending at this snapshot. This is not final package, hosted CI, publication or live approval.**

## Rendered evidence inspected

I individually inspected all nine listed screenshots. The selected habitat panel is clear and full-frame in the desktop and mobile article. The desktop opening view shows the complete photograph but does not fully frame its caption; the separate desktop body view and mobile opening view show the full eight-author credit, linked source/licence and extraction/resizing disclosure. The image is presented as forest habitat, not as a road panorama or a named photographer's work.

The mobile sources view shows the heading and all four readable source notes. The desktop notes/reading-path view begins at notes 3–4; the mobile notes/reading-path view begins with note 4. Those partial views support readability and adjacent reading-card layout, not a claim that each contains the complete source list. Belghar retains its own Illustration label, while Kalinga is correctly a photograph.

The mobile hills screenshot shows the complete Kalinga card and recognizable photograph. The corrected desktop Explore screenshot shows the complete filtered card, action and credits disclosure. The mobile Explore image, title and summary are visible, but its entry action reaches the bottom edge; I do not call that screenshot a complete-card view. No visible overlap or horizontal clipping of the article text was found. This is a screenshot assessment, not an independent DOM overflow measurement.

Excluded as evidence: the initial footer-only local-mobile-hills.jpg and the earlier clipped local-desktop-explore.jpg. Root's actual native citation 3/4 clicks, keyboard return and incoming hill-card click are attributed to root. I did not operate the browser or independently repeat those interactions.

## Helper review

Read verify-local.py and verify-live.py in full, without executing them while the publication package was still being assembled. The local helper verifies all required build stages, exact manuscript and source images, native note targets, credits, article equivalence across editions, responsive variants, all three incoming cards, reading targets, actual decoded geometry, the bounded Ashta delivery caption/share change, preservation of its originals, all 15 Kaincha preparation files, foreign ownership and the strict decimal 1 GB payload limit. Encoding differences remain explicit REVIEW_DIFFERENCES rather than being silently accepted.

Required correction communicated to root: the inspected exclusion loop scans only dist-publish. Apply the same Kaincha route/prose/filename/exact-hash scan separately to dist-coast, since both are dedicated public outputs. Also exclude the retained internal full two-panel habitat original by exact bytes/hash in both; only panel A is the public photograph. Full internal dist need not be treated as a public exclusion target.

The live helper maps corresponding image bases and identical responsive width keys, permits only observed filename substitutions, and retains raw fragments and image differences. It fetches actual image URLs from both articles and incoming cards, checks decoded geometry and source/credit continuity, and does not erase encoding differences after normalization. It is suitable for the later delivery stage. Independent delivery review should additionally verify actual responsive filename hash prefixes and descriptor widths; those are not asserted directly by this inspected helper. It has not been run by this reviewer, and no live result is implied.

## Historical failure and current logs

Closed the earlier historical-log-pointer finding: build-results-initial.json now correctly points its failed full-tests stage to full-tests-initial.log. The initial stale count/allowlist failures remain retained, not waived. I read the completed current log summaries: full 824/824 tests, coast 599/599 tests, coast acceptance 5444/5444. These do not imply completion of the still-running publication optimizer, final exclusion scan or strict payload gate.

## Remaining gates

Reinspect the bounded exclusion correction, then execute the final local verifier only after every package stage completes; inspect the actual emitted Ashta JPEG, unique caption/share changes and final package views. Final package continuity, exact committed review, hosted Linux CI/capacity, deployment and fresh live delivery review remain pending. No human, field, cross-browser or physical-device review is claimed.

## Reviewed snapshot hashes

- `verify-local.py`: `aa57f3bb443f2338cf055e2f0a0202404b353ceab0e99181a93dce68099132a5`
- `verify-live.py`: `37d0ba4673f0aa9eeab2b1e6631b3bd491d8f35458885bdab93ec34e4ad44d9b`
- `build-results-initial.json`: `37514ace0eeaa3c9e146e4ac2782c946042f6577c7e0d2b0ca4385f23c4e6ab1`
- `screenshots/local-desktop-article.jpg`: `7db9bdb31b3ecdfca7eb3007c8a529dba147b02ddb7f306dc92413b3cc9d4241`
- `screenshots/local-desktop-sources.jpg`: `e118055ed92a74f78d18cc1f0f1de29a0051d6ce30290553347fff2e380fc923`
- `screenshots/local-desktop-notes-reading.jpg`: `5add1163855d2ea960f291c6e16eaf007a8add41c5960b3da7db0db3d5c99685`
- `screenshots/local-mobile-article.jpg`: `9df506fdbf1f86481eddcfa258921d700235f07069158450e9136f6fb164d14c`
- `screenshots/local-mobile-sources.jpg`: `cbf8006cbc2430209f4659587113f282432fd205934cc39bf2936ed8475939df`
- `screenshots/local-mobile-notes-reading.jpg`: `974db3767af0e90b682463c5ed8f8bf86fa0977efc6c3662befa74fd8ffc587d`
- `screenshots/local-mobile-hills-card.jpg`: `a14410de265d8798bb57fcc3f3dd07c99430b0d3095259b0942a2b8cd5883837`
- `screenshots/local-mobile-explore.jpg`: `0fef8ad9a21d2d4637518f35db7a2482729f0af0a1f6b60c1da464d410614daf`
- `screenshots/local-desktop-explore-card.jpg`: `4251c7cc28a7bc330298fcb4b534f776e9457bb876b10fac4407f6ce51cf2f39`

## Final-package closure

The required exclusion correction is now closed. Updated verify-local.py SHA `209e42b44967093af12e819df72dd0731f818dc63ac538e394d02fc046742976` scans both dist-coast and dist-publish for Kaincha path/prose/exact hashes and the retained full two-panel original. Independent read-only execution passed 203 checks after selecting the installed Node 25 runtime. Actual exclusions are empty. Final local package, three additional screenshots and remaining hosted/live limits are documented in final-package-review.md. The earlier pending assessment above is preserved as history.
