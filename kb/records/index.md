# Evidence and delivery records

Utkal Project was renamed Project Odisha on 14 October 2026. Historical names, URLs, approval quotes and evidence remain as originally recorded. Current website: https://projectodisha.org/. Current repository: https://github.com/ahimanikya/project-odisha.

Start with the [current register dashboard](../registers/DASHBOARD.md) and the [active 500-item programme](autonomous-500-program.json). This directory contains dated evidence, including old candidates and failed checks. Its historical list below is a reading aid, not a complete or current release queue.

## Find the right evidence

| Question | Where to look |
| --- | --- |
| What should happen next? | [Current work and handovers](../registers/DASHBOARD.md), with authoritative status and references in [records.json](../registers/records.json) |
| What has shipped? | [Publication and application history](../registers/DASHBOARD.md#publication-and-application-history); follow the relevant release's evidence paths in the canonical register |
| Why is an autonomous item counted complete? | Its individual entry in the [programme](autonomous-500-program.json), linked review and delivery receipt |
| What was tested, and who reviewed it? | The referenced review record: scope, actual reviewer, independence, checks and limitations; a passing check is not a human approval |
| What still needs confirmation? | [Visitor-review queue](visitor-review-queue.json), current work-item blockers and [Founder TODO](../specs/founder-todo.md) |
| What happened earlier? | [Project history](../history/LEDGER.md), [append-only activity](../registers/activity.jsonl) and the original dated evidence below |

## Read a delivery chain

A review records what was examined. A merged PR records a Git change. For a website release, the publication receipt then identifies the deployment and the actual live checks. Documentation-only deliveries instead state why no website deployment was needed. Do not infer deployment from a merge, or field confirmation from a publication.

For an example of website delivery, read the [maritime story review](maritime-memory-review-2026-10-09.json) alongside its [publication receipt](maritime-memory-publication-2026-10-09.json). For a repository-only delivery, compare the [completion-validator review](autonomous-integrity-review-2026-10-09.json) and [merged tooling receipt](autonomous-integrity-merged-2026-10-09.json). These are dated examples, not automatically the latest work.

Preserve original failed checks and older statuses. Later evidence can resolve a finding without rewriting the earlier account. Search eligibility, Google processing, editorial review and local operating conditions remain distinct; see the [current delivery guide](../index.md#current-delivery-and-open-work).

## Historical evidence entrances

- [application-result.json](application-result.json)
- [batch-approval.json](batch-approval.json)
- [evidence/](evidence/)
- [jml-first-assignments.json](jml-first-assignments.json)
- [register-adoption.json](register-adoption.json)
- [register-checks.json](register-checks.json)
- [research-import-checks.json](research-import-checks.json)
- [research-import-manifest.json](research-import-manifest.json)
- [research-import.md](research-import.md)

- [Brand asset provenance and prompts](brand-foundation-assets.json)

- [Website verification](website-brand-checks.json)

- [First website release](website-first-release.json)

- [Mobile and accessibility review](mobile-accessibility-review.json)

- [First collection source-check evidence](first-collection-editorial-review.json)

- [Storytelling prototype and image provenance](storytelling-prototype.json)

- [Ten-item website batch self-review](ten-item-website-review.json)

- [Visitor polish and public contributions self-review](visitor-polish-review.json)

- [Release readiness self-review](release-readiness-review.json)
- [Local release candidate manifest](release-candidate-manifest.json)

- [Kabita Live design-system reference study](kabita-design-study.json)

- [Design-system implementation and review](design-system-review.json)
- [Design-system font distributions](design-system-fonts.json)

- [Design system website adoption review](design-system-adoption-review.json)
- [Current design system website manifest](design-system-adoption-manifest.json)

- [Twenty-item batch review](next-twenty-review.json) · [Current output manifest](next-twenty-manifest.json) · [Photo sources](next-twenty-photo-sources.json)

- [Discovery connections self-review](discovery-connections-review.json)
- [Discovery connections output manifest](discovery-connections-manifest.json)

- [Visitor planning self-review](visitor-planning-review.json)
- [Visitor planning output manifest](visitor-planning-manifest.json)

- [Founder’s media and meaning direction](media-foundation-direction.json)

- [Reference-page browser visual audit](visual-audit-2026-09-30.json) — failed; repair required.

- [Visual-audit repair verification](visual-repair-2026-09-30.json).

- [Stories into journeys: integrated review](visitor-flow-review.json) — local candidate; native PDF pagination remains open.

- [Cities and cultural voices integrated review](city-culture-review.json).

- [Bhubaneswar visitor verification](bhubaneswar-visitor-review.json) · [Exact output manifest](bhubaneswar-release-candidate.json).

- [Consolidated release self-review](release-review.json) · [Exact website output](release-review-manifest.json).

- [Current editorial readiness self-review](editorial-readiness-review.json) · [Exact full draft output](editorial-readiness-manifest.json).

- [Five-story flow self-review](coastal-reading-flow-review.json) · [Current full draft output](coastal-reading-flow-manifest.json).

- [Coastal launch preview self-review](coastal-launch-preview-review.json) · [delivery inventory](evidence/coastal-launch-preview-2026-09-30/build-report.json)

- [Overnight 200-item ledger](overnight-200.json) · [self-review](overnight-200-review.json) · [browser evidence](evidence/overnight-200-2026-09-30/browser-functional.json).

- [Next 210-item ledger](next-210.json) · [self-review](next-210-review.json) · [evidence correction](evidence/next-210-2026-09-30/evidence-correction.json).

- [Preparation batch ledger](ready-216.json) · [self-review](ready-216-review.json) · [browser verification](evidence/ready-216-2026-09-30/browser-functional.json).

- [Coastal launch-readiness review](launch-readiness-review.json)

- [Coastal draft PR review](release-pr-review.json)

- [Coastal preview publication · 30 September 2026](coastal-publication-review.json)

- [Launch-quality follow-up · delivery, guide evidence and print](launch-quality-review.json)

- [Launch-quality publication and live verification](launch-quality-publication.json)

- [Coastal practical follow-up review](practical-followup-review.json)

- [Practical update publication and live checks](practical-publication.json)

- [Actual downloads and feedback self-review](download-followup-review.json)

- [Download-feedback publication and live verification](download-publication.json)

- [Contribution draft care review](contribution-draft-care-review.json)

- [Contribution publication and HTTPS repair](contribution-publication.json)

- [Konark visitor essentials review](konark-visitor-essentials-review.json)

- [Konark visitor essentials publication](konark-publication.json) — approved PR #9, live books and retained HTTPS checks.

- [Puri visitor essentials review](puri-visitor-essentials-review.json) — sources, layout review and actual books.

- [Puri visitor essentials publication](puri-publication.json) — approved PR #10, live books and retained HTTPS checks.

- [Raghurajpur maker guide review](raghurajpur-maker-guide-review.json) — sources, responsive sequence and actual journey books.

- [Raghurajpur publication](raghurajpur-publication.json) — approved PR #11, live making sequence and journey books.

- [Dhauli layers guide review](dhauli-layers-guide-review.json) — source distinctions and actual journey books.

- [Dhauli publication](dhauli-publication.json) — approved PR #12, live story and journey books.

- [Visitor readiness, native print and analytics self-review](visitor-readiness-review.json).

- [Visitor-readiness approval and merge](visitor-readiness-merge.json) — deployment confirmation pending.

- [Visitor-readiness publication and live consent checks](visitor-readiness-publication.json).

- [Simple cookie message review](cookie-message-review.json).

- [Simple cookie message publication](cookie-message-publication.json).

- [Cuttack collection review](cuttack-release-review.json) — six connected guides, photographed subjects and a city journey.

- [Odia literature collection review](odia-literature-release-review.json) — language, six literary lives, reading prompts and offline books.

- [Research sync — 1 October 2026](research-sync-2026-10-01.md)

- [Research sync approval and merge](research-sync-merge.json)

- [Research reuse audit](research-reuse-audit-2026-10-01.json)

- [Literature research continuation](literature-research-continuation-2026-10-01.json) — existing biographies and edition gaps, research-only checkpoint.

- [Performing arts first batch](performing-arts-first-batch-2026-10-01.json) — four people, four credited theatre episodes and literature evidence gaps.

- [Music listening research](music-listening-research-2026-10-01.json) — Sunanda Patnaik, Prafulla Kar and seven credited recording records.

- [Performing-arts milestone](performing-arts-milestone-2026-10-01.json) — Six practitioners and twelve credited works, with two scoped browser access checks.

- [Sports research](sports-achievements-2026-10-01.json) — Eight athletes across four sports, with fourteen scoped results and milestones.

- [Scientists checkpoint](scientists-first-batch-2026-10-01.json) — Swati Nayak and Sanghamitra Pati, credited contributions and evidence limits; RES-029 remains in progress.

- [Scientific heritage checkpoint](science-heritage-2026-10-01.json) — Heritage-to-present timeline, three new contributors and three works; RES-029 remains in progress.

- [Utkal name correction](utkal-name-correction-2026-10-01.json) — user-confirmed spelling, maintained references and preserved history.

- [Scientific manuscript checkpoint](science-manuscripts-2026-10-01.json) — Four Bhāsvatī catalogue witnesses and three museum mathematics records; RES-029 remains in progress.

- [Modern science checkpoint](science-modern-2026-10-01.json) — Mathematics and Odia science communication: two contributors, three works and five conflicts; RES-029 remains in progress.

- [Contemporary creators](contemporary-creators-2026-10-01.json) — Four people, five works and related reading; explicit user addition RES-034 complete.

- [Women across creative fields](creative-women-2026-10-01.json) — Four additional people, five credited works/performance records and related reading; RES-035 complete.

- [Entrepreneurs and business leaders](entrepreneurs-2026-10-01.json) — Four new people, existing Bagchi profile enhanced and four linked enterprise identities; RES-036 complete.

- [Public servants and lawmakers](public-service-2026-10-01.json) — Five people, a credited English translation and classified national contributions; RES-037 complete.

- [Utkal rulers and royal legacies](rulers-2026-10-01.json) — Five ruler profiles, scoped historical evidence and reused monument records; RES-038 complete.

- [Computing research checkpoint](science-computing-2026-10-01.json) — One computing researcher and coauthored paper; RES-029 remains in progress.

- [Computing and space research completion](science-women-2026-10-01.json) — Two people and three credited works; initial RES-029 timeline complete, gaps retained.

- [Homestay evidence checkpoint](homestay-policy-2026-10-01.json) — Public portal geography captured; policy amendments unresolved, operational outcomes still unknown.

- [Community tourism research checkpoint](community-tourism-2026-10-01.json) — Primary ecotourism series recovered; homestay provisional-registration conflict held.

- [Debrigarh primary-source checkpoint](debrigarh-primary-2026-10-01.json) — Historical JICA revenue, official community recognition and unresolved modern revenue scope.

- [Food preparation checkpoint](food-preparations-2026-10-01.json) — Fourteen existing food entries, attributed variants and original Magji specification.

- [Food preparation checkpoint](food-primary-followup-2026-10-01.json) — Seven existing entries enhanced; original/corrected Rasabali records and the 2015 rice-food book.

- [Fire-cooking research and story](poda-story-2026-10-01.json) — Nine linked poda foods, method boundaries and a source-backed campaign draft.

- [Campaign wording selection](fire-tagline-2026-10-01.json) — user-selected tag, subtitle and draft copy updates.

- [Odisha Roots feature review](odisha-roots-features-review.json) · [Approved publication](odisha-roots-features-publication.json)

- [Visitor discovery and research review](visitor-research-review.json) · [Research PR integration findings](research-pr-review.json) · [Current review queue](visitor-review-queue.json)

- [Visitor discovery publication](visitor-research-publication.json) — approved PR 34, live homepage and connected reading checks.

- [Research integration candidate](research-integration-review.json) · [Next illustrated story briefs](next-story-batch.json) · [Operating-rule proposal history](research-integration-rule-proposals.json)

- [Editorial 500 delivery record](editorial-500-review.json) · [Frozen selection](editorial-workbench-selection.json) · [Generated assessments](editorial-workbench.json) · [Pitha photo provenance](pitha-image-provenance.json)

- [Pitha stories and editorial workbench applied](editorial-500-publication.json) — PR 38, live delivery and retained review gaps.

- [Six coastal guides: practical choices and portable books](coastal-practical-review.json) — candidate checks and remaining local verification.

- [Six coastal practical guides published](coastal-practical-publication.json) — PR #51, deployment and live delivery evidence.
