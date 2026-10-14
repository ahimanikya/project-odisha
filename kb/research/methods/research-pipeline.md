---
type: "Research Runbook"
title: "Sequential research queue and schedule"
description: "Sequential research queue and schedule for the Odisha encyclopedia."
tags: ["research", "pipeline"]
status: "draft"
generated: {"by": "codex/gpt-6", "at": "2026-09-30T20:24:50-07:00"}
human_review_claimed: false
---

# Sequential research queue and schedule

The user authorised this continuing research programme on 30 September 2026. Advance one bounded task at a time without requiring a new prompt. The queue covers all nine subjects; tourism is one collection. Each run may finish its task or save a useful checkpoint. A task is complete only when its stated evidence deliverable exists; a draft, blocked retrieval or planned interview is not a verified outcome.

Schedule created and confirmed active: `utkala-continuing-research`, every six hours in this chat. The first scheduled discovery continuation completed on 30 September 2026; progress and capture limits are recorded in the structured queue.

## Work order

The [structured queue](../references/data/research-queue.json) is authoritative for task status, next steps, retries and evidence outputs. The table below is the setup snapshot; consult the structured queue for later progress.

| Task | Research package | Initial status |
|---|---|---|
| RES-001 | Core publication discovery | completed |
| RES-002 | Remaining monitoring sources | pending |
| RES-003 | Recover priority source tables | pending |
| RES-004 | Tourism series reconciliation | pending |
| RES-005 | Puri craft corridor places and access | pending |
| RES-006 | Puri guides food and stays | pending |
| RES-007 | Puri journey research outline | pending |
| RES-008 | Homestay policy reconciliation | pending |
| RES-009 | Homestay operating outcomes | pending |
| RES-010 | Ecotourism and community livelihoods | pending |
| RES-011 | Food names recipes and variations | pending |
| RES-012 | Handloom techniques makers and sales | pending |
| RES-013 | District coverage matrix | pending |
| RES-014 | Western and southern coverage | pending |
| RES-015 | GSDP and sector time series | pending |
| RES-016 | Investment implementation evidence | pending |
| RES-017 | Trade logistics and production | pending |
| RES-018 | Health education and work outcomes | pending |
| RES-019 | City services and environment | pending |
| RES-020 | Smart cities rare earths and semiconductors | pending |
| RES-021 | Media language and contributor readiness | pending |
| RES-022 | Ten evidence-backed public story drafts | pending |
| RES-023 | Reader questions and navigation evaluation | pending |
| RES-024 | Next research cycle | pending |

## How each run advances

1. Read AGENTS.md, the KB index, research method, gaps, readiness, this runbook, the queue and recent research/weekly reports. Search saved knowledge first. Inspect the working tree and active work before edits; if another process is writing the same files, defer rather than overwrite it. An old in-progress checkpoint by itself is not evidence of a live process.
2. Resume the earliest in-progress task, otherwise choose the earliest eligible pending task. Update its attempt and checkpoint. Work sequentially; do not spawn parallel agents by default. Aim for a focused 20–30 minute batch rather than an open-ended crawl. Stop source retries after two meaningful retrieval approaches in a run; save the exact failure and an alternative route.
3. Browse original publishers. Record source URL, title, publisher, document/table location, period, unit, geography, price basis, estimate/project status, retrieval date and limitations. Add explained links to related concepts. Retain adverse and flat observations, aliases and revision history. Preserve the frozen imported ledger.
4. Save evidence and affected pages together. A listing or a search result does not verify a linked table. Resolve conflicts where possible; otherwise quarantine the claim, record a retry date (normally at least seven days for unchanged failures) and move to independent work. Human review, rights, interviews and operating checks remain pending unless actually established. No outreach is authorised by this schedule.
5. Run reindex and core validation plus all affected dataset validators. Refresh the log, source catalogue, summaries, manifest and portable packages for content changes. The existing packaging helper may be used while present; do not run old creation scripts over maintained records. Save an exact changed-file list and separate local, Git and website outcomes in outputs/community-project/research-runs/.
6. Persist progress, output paths, remaining questions and the next action in the queue. If unfinished, resume at the next scheduled run without asking the user to trigger it. When this cycle is exhausted, derive the next bounded tasks from real coverage gaps. If nothing is actionable, back off and retain evidence of why; do not manufacture work or success.

## Relationship to weekly maintenance

The six-hour research schedule expands and resolves knowledge. The existing weekly editor checks new releases and revisions. Both consult the same source catalogue, reliability register and recent run reports. Reuse a current capture when its scope answers the question; avoid duplicating weekly checks or racing writes. The stored weekly automation is Sundays at 09:00 America/Los_Angeles; the earlier Monday label in the runbook was a documentation error and has been corrected without changing its schedule.

This is local scheduled work and needs the local host/app available; scheduling does not provision an always-on cloud worker. Research authorisation covers local evidence and drafts. Routine validated updates may use an already verified repository and existing deployment under the weekly publication rules; this schedule does not create a new repository, site, paid service or outreach campaign. Record actual outcomes rather than assuming publication.

[Source reliability register](source-reliability.md) · [Research gaps](../about/research-gaps.md) · [Weekly editor](weekly-data-agent.md).

## Expanded scope · 1 October 2026

The user added named people, creations and English editions, sand art and other arts, garment varieties/exports and sweets economics. RES-025 completed the first evidence batch; RES-026–033 provide bounded continuations. The queue now has 33 tasks with revised ordering and preserved task IDs/history. The existing scheduled reader follows the JSON queue automatically; no duplicate automation is required. Next is RES-026. RES-011/012 retain recipe and handloom depth, while new tasks cover markets and creators without duplicating those deliverables.

### Current checkpoint · 1 October 2026

RES-026 is in progress: five author biographies deepened, five English story records plus their anthology added. The task’s eight-biography threshold and original-work chronology requirement are not yet met. Resume its saved next step before RES-027. Container and component records must not inflate book totals.

## Repository integration · 1 October 2026

This imported research describes the source workspace at its recorded dates. Project Odisha already has a repository and a published preview; current authority, implementation and release status are held in [project records](../../records/index.md) and [the operating dashboard](../../registers/DASHBOARD.md). This sync adds research for review; it does not deploy these additions or replace implemented website addenda. The scheduled research queue continues in its existing workspace pending a separate canonical-workflow handover.

## Research reuse audit · 1 October 2026

Read the [research map](research-map.md) and each task’s `reuse_before_research` pointers before browsing. The map includes existing project narratives and source records; only missing, stale or conflicted fields justify repeat research. Task IDs, completion criteria and statuses are preserved.

### Literature continuation · 1 October 2026

RES-026 reused repository-native introductions and deepened three existing biographies and three existing work records. Eight biographies have now been deepened across the two research attempts. The task stays in progress: unresolved original story dates and edition credits prevent the full deliverable. The structured queue records the specific next fields; no duplicate people or book concepts were created.

### Performing-arts continuation · 1 October 2026

RES-026 is deferred to 8 October for unavailable original-journal/title-page evidence; its criteria remain unmet. RES-027 is now in progress with four people and four attributed stage episodes. Continue the saved music task next. The earlier literary in-progress notices describe prior checkpoints, not current priority.

### Music and listening routes · 1 October 2026

RES-027 now links six practitioners and twelve work records, including one soundtrack container. Seven label/distribution recording entries were added in this pass. The task stays in progress to avoid treating the Mamata container and its songs as independent recordings and because representative playback and recording identifiers remain unverified. Continue its explicit next fields before the sport task.

### Performing-arts milestone · 1 October 2026

The bounded RES-027 set now covers **six practitioners and twelve independently scoped works or performances**: four documented stage episodes and eight catalogue recordings. The Mamata soundtrack container is excluded from this count. Two label videos passed a muted-player progression check in the current session. Historical stage records do not thereby acquire surviving video; remaining listening routes, original recording dates, identifiers, biography conflicts and media permissions retain their stated unknowns. This completes the first research set, not an exhaustive discography or editorial approval. Next eligible task: RES-028 sports.

### Sports seed completed · 1 October 2026

RES-028 now contains eight selected athletes across hockey, athletics, badminton and chess, with fourteen result/milestone observations. Seven new profiles enhance the existing Dilip Tirkey record. Women and para sport are included; event classes, team results, heat places and historical discipline findings are retained. Next: RES-029 scientists. Direct athletics fetch retries remain dated follow-up work.

When sports-achievements.json changes, run tools/validate_sports.py with the core, creations and classification validators. Its checks enforce event scope and references; passing them is not independent factual review.

### Scientists checkpoint · 1 October 2026

RES-029 is in progress: Swati Nayak and Sanghamitra Pati profiles connect agriculture and health to documented contributions. Existing Mohanty research and project-native Samanta records were consulted first. Two new profiles are not the six-scientist deliverable. Resume RES-029: enhance the project-native Samanta Chandrasekhar record only for unresolved chronology/instrument fields, retain Mohanty’s existing paper, then research two further scientists (candidate leads Prana Krushna Parija and Ajit Kumar Mohanty) to reach six. Verify Nayak publication-level credits and Pati award-issuer entry/full methods; failed routes retry after 2026-10-08. Do not duplicate project-native Samanta JSON.

### User-expanded scientific-history scope · 1 October 2026

RES-029 now follows heritage to the present, with its original six-person completion criterion preserved in scope_history. Added Śatānanda, Parija and Ajit Kumar Mohanty; the timeline also reuses four existing identities. The earliest period remains an explicit attribution gap. No duplicate automation or completed encyclopedic coverage claimed.

### Scientific manuscripts checkpoint · 1 October 2026

RES-029 remains in progress. Four IGNCA Bhāsvatī witnesses and three museum mathematics records enhance the historical lane. The 2008 survey is bibliographically confirmed but full text unavailable. Continue RES-029 with nineteenth/twentieth-century mathematics and science communication (Tribikram Pati and Gokulananda Mahapatra), then contemporary women and additional disciplines. Reuse the saved manuscript checkpoint; original folios/Devīdāsa attribution remain open and failed routes retry after 2026-10-08.

### Modern science checkpoint · 1 October 2026

RES-029 remains in progress after adding mathematics and science writing. Continue RES-029 with contemporary computing, engineering and women researchers whose Odisha connections can be documented. Reuse the nine mapped identities. Keep historical attribution open; resolve Mohapatra birth/award and Pati degree conflicts through original registers, retrying failed routes after 2026-10-08.

### Contemporary creators user addition · 1 October 2026

RES-034 completes a bounded four-person/five-work seed with classified links. It does not complete RES-026, RES-030 or RES-032. Resume RES-029 next; failed NGMA PDF and Aicon exhibition routes may be retried after8October.

### Creative women user extension · 1 October2026

RES-035 completes the bounded requested extension; RES-029 remains active. Resume RES-029 science work. Further personality candidates Rituraj Mohanty, Paramita Satpathy and Pankaj Sethi require reuse checks and original work/recognition evidence before new profiles. Retry failed biography and edition routes after2026-10-08.

### Entrepreneur user extension · 1 October 2026

RES-036 completes the bounded people/enterprise seed. Research audited enterprise milestones and Odisha-specific operations; verify brand/legal-entity relationships and add further founders after reuse checks. RES-029 remains active independently.

### Public-service user extension · 1 October 2026

RES-037 completes the bounded five-person seed. Extend through original debate, parliamentary and appointment records. Resolve quarantined chronology; verify Shaktikanta Das and Nandini Satpathy candidates. RES-029 remains active independently.

### Ruler user extension · 1 October 2026

RES-038 completes the bounded five-person seed. Extend through original Nagari/Hathigumpha editions and independent Gajapati records; verify regional rulers and Bhaumakara queens. RES-029 remains active independently.

### Computing checkpoint · 1 October 2026

RES-029 remains in progress. Continue with a bounded women-in-computing or engineering contribution, searching existing identities first. Lalit Mohan Patnaik and his 1994 paper are now saved: do not repeat discovery. Retrieve original paper/award page after 2026-10-08; preserve historical gaps and previous conflict retries.

### Initial science timeline completed · 1 October 2026

Proceed to RES-008 homestay policy reconciliation, reusing its saved source and project pointers. RES-029 initial cross-era timeline exists; preserve science gaps for RES-024 next-cycle planning and retry unavailable sources after2026-10-08.

### Homestay continuation · 1 October 2026

RES-008 blocked on original amendments/allocation, retry 8 October. Independent RES-009 started: public outcome evidence map saved, nine measures remain unknown. Continue RES-009 through district/departmental aggregate reporting; do not convert the 61-GP area snapshot into accommodation supply.

## Current community-tourism checkpoint · 1 October 2026

RES-009 deferred to 8 October for primary operational/register evidence; conflicting event counts held. RES-010 is in progress with the state programme series saved. Continue division-level Debrigarh income and employment evidence next. PR #24 scope is closed to unrelated additions; new research uses a focused follow-on review. No merge or deployment is implied.

## Debrigarh checkpoint · 1 October 2026

RES-010 saved historical primary revenue and national recognition, but modern accounts and employment denominators remain blocked until 8 October. Next eligible task is RES-011 food preparation and variations. No task completion or current-income verification claimed.

## Food preparation checkpoint · 1 October 2026

RES-011 now has fourteen attributed entry extensions and a technique collection. Resume the saved gaps in regional variants and original Rasabali evidence; do not repeat the recovered Magji journal or existing tourism descriptions. Completion remains false. This food batch uses its own review branch; community-tourism PR #33 is unchanged.

## Food primary-source follow-up · 1 October 2026

RES-011 continues with seven existing foods enhanced. Original Rasabali and CRRI passages are now reusable; next bounded work is chatu/ou attributed local preparation. RES-031 points to the held Rasabali economic claims. Continue the existing food review branch/PR35; no new review stack or website deployment.

## Poda story extension · 1 October 2026

User requested the barbecue/poda connection. RES-011 preserves original criteria and now links the bounded collection/story extension. Chatu home account recovered; Ou remains next. Existing PR35 is the review destination.

### Food preparation milestone · 1 October 2026

RES-011’s fourteen-entry evidence deliverable is complete within its defined scope, including the explicit pending local/Odia review. Ou khatta now has directly retrieved contributor preparations. Retain source conflicts and finer locality/poda follow-ups; next eligible task is RES-031, Rasagola and sweets economics. Do not infer sales or exports from recipes, vendor counts or online availability.

## Everyday food extension · 1 October 2026

RES-039 saves five new food entries and a connected collection, reusing chatu patrapoda and pakhala. Six attributed sources cover preservation, ripe palm fruit, rice-water terminology and a dried-fish producer case. The user clarified tala khaja as seed produce; seed stage and local name equivalence remain unresolved. RES-039 stays in progress. No tested recipe, local interview, health claim, statewide market total or export measurement is asserted. The dated map is extended, not an exhaustive semantic audit.

## Pala research checkpoint · 1 October 2026

User-requested RES-040 adds Pala as an arts/everyday-life topic, six source records and structured performance/archive evidence. Existing source and repository-native searches found no Pala identity. The 2012 review preserves named women performers and separates Pala from Daskathia. Foundation pages share provenance; the award biography has a likely derivative foundation version. Two government PDFs remain indexed-only, retry 8 October. Origin chronology, local roles, biographies, recordings/rights and livelihoods need further evidence; no current troupe or audience totals asserted.

## KISS records and account vintages · 2 October2026 UTC

RES-047 checkpoint saved and deferred to9October for primary evidence gaps. RES-040 and RES-048 also have future retries. Continue RES-049 Yogini/Tantric source research next, searching its reuse pointers first.

## Yogini heritage · 2 October 2026 UTC

RES-049 bounded two-site/context deliverable complete, with unresolved dates, patronage, counts and practice preserved. Next eligible task is RES-050 Mahima Dharma and Bhima Bhoi; inspect native literary reuse pointers before browsing.

## Mahima Dharma and English reading · 2 October2026 UTC

RES-050 bounded deliverable completed with biographical uncertainty retained. Next eligible pending task: RES-031 Rasagola and sweets economics. Preserve future retries for earlier blocked tasks.

## Sweets economics checkpoint · 2 October 2026 UTC

RES-031 checkpoint saved and remains the next eligible continuation. Deepen Nimapada Jhili and Old Town Korakhai, then original Magji histories and Rasabali accounts. Unavailable SDG/Industries captures deferred to9October; no need to wait on them before independent work within this task.

## Sweet makers and town commerce · 2 October 2026 UTC

RES-031 continues with Magji original histories and Rasabali dated producer accounts. Jhili and Korakhai checkpoint saved; reuse before browsing. Retry dates remain attached to inaccessible or method-limited evidence. No need to repeat current maker searches next run.

## Sweet histories and market evidence · 2 October 2026 UTC

RES-031 remains in progress with retry 9 October for original books and unavailable support/enterprise documents. Its useful local checkpoint is preserved. Next independent eligible task: RES-012 handloom techniques, makers and sales; use existing textile/source records before browsing.

## Handloom market checkpoint · 2 October 2026 UTC

RES-012 checkpoint: six-tradition coverage matrix, three product specifications and institutional market story. Resume missing technique/maker fields next run; sales document subtask retry 9 October. Completion criteria not yet met.

## Handloom techniques and makers · 2 October 2026 UTC

RES-012 remains in progress after technique/awardee checkpoint. Next: cooperative/registered-user and Berhampuri construction evidence; failed RTI, IHB directory and original Habaspuri report retry 9 October. Saved financial retry unchanged.

## Handloom cooperatives and creations · 2 October 2026 UTC

RES-012 checkpoint saved with 9 October retry for remaining financial/original-document gaps. Earliest eligible independent pending task is RES-052. No further same-source handloom discovery needed before the dated retry.

## Mining-to-manufacturing checkpoint · 2 October 2026 UTC

Resume RES-052 next with chromite-to-ferrochrome, using saved IMFA history before original annual-report research. Rourkela/NALCO checkpoint is useful but three-chain employment/supplier completion criteria remain unmet.

## Chromite chain checkpoint · 2 October 2026 UTC

Use IMFA statutory-compliance listings for Therubali, Choudwar, Kalinganagar and mine-level employment/output; seek plant payroll/contract and Odisha supplier evidence. Reuse mining-imfa-ar2026 before fetching; no repeat of annual report. Then RSP plant employment and NALCO plant-local gaps. Keep completed acquisition separate from post-report commissioning checks.

## Plant records and scope reconciliation · 2 October 2026 UTC

Continue independent RES-052 Rourkela and NALCO plant-workforce evidence using saved annual/compliance reports before browsing. IMFA mine reconciliation subtask retries 9 October; exact gap: Sukinda annual273802 versus template269075 tonnes, Mahagiri general versus ROM and local workforce subtotals. Use original returns/corrections if available; do not repeat the four saved plant/mine documents or promote held values.

## Industrial employment checkpoint ·2October2026 UTC

RES-052 checkpoint deferred to9October. Seek original current unit workforce returns and historical NALCO question711 (28November2011) via Parliament archive; old route returned HTML. Reuse saved2015 RSP answer and NALCO apprenticeship passage. Next independent task RES-053 mining revenues and DMF outcomes; search existing public-finance/DMF observations before browsing.

## Mining and community services · 2026-10-02

RES-053 selected by the Founder. Receipts/sample/case checkpoint saved; full audit reading, current operation and community outcomes remain in progress. No contact or public website publication in this batch.
