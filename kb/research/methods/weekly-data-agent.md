---
type: "Automation Runbook"
title: "Utkal weekly data editor"
description: "Weekly primary-source monitoring, revision preservation, validation and conditional publication workflow."
tags: ["automation", "freshness", "data", "publishing"]
status: "stable"
generated: {"by": "codex/gpt-6", "at": "2026-09-27T01:46:31-07:00"}
---

# Utkal weekly data editor

The user authorised weekly unattended data collection and updates to the Git repository and website on 27 September 2026. A recurring agent, `utkala-weekly-data-editor`, is active in this task for Sundays at 09:00 America/Los_Angeles. This is a local scheduled agent, not a separately provisioned always-on cloud service.

## What to monitor

The [machine-readable watchlist](../references/data/weekly-watchlist.json) retains the original nine tracks: tourism, GSDP, sector growth, exports, Paradip cargo, domestic/foreign investment, smart-city completion, rare earths and semiconductors. It includes saved primary-source URLs and target records. The statistical expansion adds eight monitoring groups: banking, public finances, people and learning, land and livelihoods, services and environment, mobility and digital access, innovation and startups, and the visitor economy and crafts. The watchlist therefore has 17 tracks. Source capture details remain in the catalogue; adding a URL to this list is not itself a new verification.

Follow each publisher to its latest release. A fixed historical PDF is a baseline, not a feed. Weekly checks do not imply weekly publication: many series are annual, quarterly or event-based. Do not manufacture intervening observations. Fees, opening hours, daily AQI, liveability rankings and future event dates still require separately defined measures and authoritative sources. Annual city PM10 and historical event/facility counts are included with their explicit dates.

## Each run

1. Read the KB and its methodology. Record the working tree's initial state and avoid overlapping edits. Do not stage existing user work. If another update is active, defer rather than race it.
2. Read each source and search its original publisher for newer releases. Record `changed`, `unchanged`, `unavailable` or `conflicted`. An inaccessible page cannot establish that a value is unchanged.
3. For every new observation, record a stable ID, measure, value, unit, geography, reporting period, price/base-year basis where relevant, estimate/project status, source URL and page/table location, publication date if known, and retrieval time. Keep quoted evidence short.
4. Append observations and explicit revisions. Record which earlier observation is superseded and why; never silently overwrite a historical vintage. Preserve the frozen 71-record imported evidence ledger. Retain decreases and flat results as well as growth.
5. Update affected concepts and supported story cards together, retaining periods, units and meaningful comparisons. Flag source disagreement or changed scope in the research gaps. Do not publish a conflicting value merely because it is more favourable.
6. Rebuild search and run the checks listed in the project README, including statistics, homestays, classification and PRD-history validation. Recalculate affected derived values; structural validation alone does not establish source truth. Refresh the log, catalogue, summary, manifest and portable exports after substantive updates.
7. Save a run report in `outputs/community-project/weekly-runs/` with checked sources, before/after values, affected paths, validation results and separate local/Git/deployment outcomes. A run with no new data needs a run report, not artificial edits to fact pages.

## Publication

The user has authorised routine autonomous updates. At setup, there is no remote and no deployed website. Continue local research until the actual repository and deployment are configured; do not repeatedly report the same unchanged setup blocker.

Once connected, verify the repository identity against the intended owner `ahimanikya` and the project's recorded destination. Respect the established branch and CI policy. Commit only changes attributable to this run; use a review branch if the established policy requires it. Never force-push, bypass protection or automatically adopt unrelated uncommitted changes. If there is no initial project commit, finish project onboarding separately before attempting an isolated data-update commit.

Run the configured site build and deployment workflow only after validation. Confirm both deployment success and the published content/revision before marking the website updated. A successful local edit or Git push is not a verified website release. Keep a failed deployment distinct from successful research and preserve the last working published site. No automatic new repository, domain, paid service or first website launch is delegated by this recurring runbook.

## Reporting and maintenance

Notify for meaningful changes, completed publication, new failures or required action. Stay quiet for unchanged data and unchanged known blockers. Record what actually ran, including partial failures. The schedule is active but no successful unattended research run or public update is claimed by its creation. The local host and app must be available for local execution; move to a separately configured hosted runner if independent uptime becomes a requirement.

Use [publication readiness](../about/website-readiness.md) to track setup. Historical and cultural material remains governed by the [research method](../about/research-method.md), not automatically rewritten every week.

## Homestay monitoring addition · 30 September 2026

Homestays are included in the existing visitor-economy track. Use the [research register](../references/data/homestay-research.json) and [topic page](../statistics/homestays.md). Preserve unknown outcomes as null; archive each new dated total and source, without replacing the 2025 scheme or registry baseline. Seek primary amendment and Cycle-1 PDFs, comparable operating/property counts, room-night demand and payments. Market listings, registry stock and targets must not form one growth series. Do not collect individual guest identity data.

## Coordination with continuing research

Consult the [sequential research queue](research-pipeline.md), [source reliability register](source-reliability.md) and recent research-run reports before fetching or editing shared records. Research expands coverage; this weekly run checks revisions. Avoid overlapping writes, reuse current captures only within their recorded scope, and preserve failed prior runs even when a later retrieval succeeds. The Sunday schedule label above was corrected from the saved automation configuration on 30 September 2026; the schedule itself was not changed.

## Repository integration · 1 October 2026

This imported research describes the source workspace at its recorded dates. Project Odisha already has a repository and a published preview; current authority, implementation and release status are held in [project records](../../records/index.md) and [the operating dashboard](../../registers/DASHBOARD.md). This sync adds research for review; it does not deploy these additions or replace implemented website addenda. The scheduled research queue continues in its existing workspace pending a separate canonical-workflow handover.
