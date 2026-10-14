---
type: "Project Architecture"
title: "Utkal · Odisha — a community encyclopedia"
description: "Utkal · Odisha — a community encyclopedia — community encyclopedia direction."
tags: ["encyclopedia", "community", "github", "publishing"]
status: "draft"
generated: {"by": "codex/gpt-6", "at": "2026-09-27T01:29:53-07:00"}
sources: [{"id": "github-forms", "title": "GitHub issue and pull request templates", "resource": "https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates"}, {"id": "github-review-rules", "title": "GitHub protected branches", "resource": "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches"}, {"id": "github-workflow-security", "title": "GitHub Actions secure use", "resource": "https://docs.github.com/en/actions/reference/security/secure-use"}]
---

# Utkal · Odisha — a community encyclopedia

The [detailed product requirements](../product/prd.md) now record audiences, scope, acceptance and growth programmes. Its [preserved versions](../product/versions/index.md) retain historical baselines; the initial PRD is a draft, not a claim of formal approval or implementation.

## Mission

Build a public, community-contributed encyclopedia of Odisha’s places, food, people, skills, history and development. Make its strengths vivid and useful enough that visitors, residents, journalists and government researchers return to it and cite it. Adoption is an ambition, not an achieved endorsement.

The working identity remains **Utkal · Odisha**. GitHub owner: **ahimanikya**, supplied by the user. Suggested repository name: `odisha-encyclopedia`; it has not been created or reserved remotely. The current workspace preserves the existing OKF 0.2 concept paths.

## Three connected experiences

**Discover Odisha.** Browse [nine subject families](../subjects/index.md), from people and history to health, schooling, livelihoods and the environment. Read contextual entries, data explainers, maps and cultural stories, with tourism among the featured collections. Each page explains its subject and offers relevant next reading.

**Understand and cite.** A source panel, definitions, period and geography, estimate status, calculation notes, revision history and downloadable records. A citation identifies the page, stable concept ID, version, source and relevant access date. Original sources remain prominent so researchers can inspect them.

**Contribute.** Git users submit reviewed pull requests; GitHub issue forms remain an optional account-based route.[^github-forms] The agreed launch also includes guest text contributions through Firebase Spark and photos sent to the editorial inbox, optionally through a tested free form relay. Editors publish accepted contributions through Git. These routes are planned, not yet deployed. See the [current technical stack](../technology/technical-stack.md) and [architecture diagrams](../technology/architecture.md).

## The editorial promise

Select stories that reveal Odisha’s strengths. Let independent evidence determine the facts. Preserve important comparison bases, uncertainty and corrections. Commercial relationships and funding must be disclosed. Government information is attributed to its issuing body; the encyclopedia does not imply government endorsement.

Positive coverage and rigorous correction support the same goal: a reputation readers can rely on. A genuine correction is welcome even when it makes a headline less flattering. Clearly label local testimony, folklore, interpretation, announcements and measured outcomes.

## One knowledge source, several public forms

Keep sourced knowledge in the existing Markdown and structured-data records. Public pages, charts, search and download views should be generated from those records and their approved presentation content. Avoid maintaining separate copies of the same statistic across posters and pages.

Preserve concept-path identity, such as `food/chhena-jhili`. Proposed public routes can follow these IDs once the domain and framework are chosen. Renames require aliases and redirects. A record update should reveal the dependent stories and visuals that need attention.

Publication status is separate from OKF lifecycle status and source-check metadata. A stable research method or a machine-checked source extract is not automatically a publication-approved feature. Build the public website from an explicit approved set; keep research leads and unresolved records out of visitor recommendations until suitable for that use.

## Contribution and release flow

**Propose → supply evidence → automated checks → editorial review → merge → approved release → website.**

Automated checks validate structure, references and calculations. Editors assess source quality, meaning, attribution and publication suitability. Named subject reviewers assess specialist claims when needed. GitHub branch rules can require reviews and successful checks before merge; those controls still need remote configuration.[^github-review-rules]

The local scaffold supplies contribution guidance, issue forms, a pull-request template, code ownership and a checks-only workflow. It does not deploy. Contributor checks use read-only permissions and no publishing credentials. Privileged workflows must not run untrusted contribution code.[^github-workflow-security]

## What makes an entry citable

- Stable concept ID and permanent public URL.
- A concise claim linked to the source passage, table or page where possible.
- Clear geography, dates, units, definitions and comparison basis.
- Separate source-check date, editorial-review date and publication date.
- Named contributor and reviewer only when that work actually happened.
- Revision-specific citation and downloadable data for numeric claims.
- Visible corrections, superseded versions and conflicts of interest.

A copied government number is still attributed government data. A local account is labelled testimony until independently corroborated. Our derived figures retain the inputs and calculation. AI assistance is disclosed in provenance and never substitutes for a human review badge.

## Start with complete entries across subjects

The 30 September 2026 direction broadens the encyclopedia beyond a tourism entrance. Expand the existing pages with facts, context, subject classification and explained links. Keep a single canonical record reusable across collections, and separate subject, format, geography, period and evidence state.

The [PRD](../product/prd.md) retains the Painted Streets pilot and adds proposed non-tourism reading cases for health/education and the economy. Tourism, food and heritage entries can progress alongside those subjects. Complete source and citation views and contribution guidance from the beginning; the number of pages alone is not a launch criterion.

The [classification method](../methods/content-classification.md), [visitor roadmap](../visitor-index/expansion-roadmap.md) and [statistics standard](statistics-storytelling.md) support different reading needs. Broader coverage does not imply complete district or community representation.

## Adoption and governance

Track useful contributions, correction turnaround, current source checks and external citations. Count journalistic or government references only when a saved public link demonstrates them. Do not treat a social share, page view or government source citation as an institutional endorsement.

The owner appoints topic editors and publishes funding and editorial-responsibility information. Contributors should be credited with their consent. Representation across districts and languages requires deliberate recruitment later; no outreach is authorised by this document.

## Before opening publicly

The [decision register](../technology/decisions.md) records the agreed Astro, GitHub Pages and Firebase Spark design, with AI and paid private backups deferred. Finalise the repository name and visibility, domain, content/code licences and named editorial maintainers. Confirm rights for contributed writing, images and datasets. Configure branch protection and release review. Build the website and publication selection mechanism, then review a coherent pilot collection. The local repository has no remote and the website has not been built or published.

[^github-forms]: [GitHub issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
[^github-review-rules]: [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
[^github-workflow-security]: [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use)

## Repository integration · 1 October 2026

This imported research describes the source workspace at its recorded dates. Project Odisha already has a repository and a published preview; current authority, implementation and release status are held in [project records](../../records/index.md) and [the operating dashboard](../../registers/DASHBOARD.md). This sync adds research for review; it does not deploy these additions or replace implemented website addenda. The scheduled research queue continues in its existing workspace pending a separate canonical-workflow handover.
