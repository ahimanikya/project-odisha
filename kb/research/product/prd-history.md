---
type: "Product Decision History"
title: "PRD history and product decisions"
description: "Version history and chronological decision context without invented earlier PRD approvals."
tags: ["utkala", "product", "requirements", "history"]
status: "draft"
generated: {"by": "codex/gpt-6", "at": "2026-09-27T16:31:36-07:00"}
instruction_basis: "User requested a detailed PRD for historical reference; product decisions consolidated from the Odisha Tourism conversation through 27 September 2026."
document_version: "0.1.0"
approval_status: "draft_not_formally_approved"
implementation_status: "not_deployed"
sources: [{"id": "architecture", "title": "Agreed technical stack", "resource": "../technology/technical-stack.md"}, {"id": "decisions", "title": "Architecture decision register", "resource": "../technology/decisions.md"}, {"id": "editorial", "title": "Community encyclopedia direction", "resource": "../about/community-encyclopedia.md"}]
---

# PRD history and product decisions

## Revision register

| Version | Date | State | Changes | Decision basis |
| --- | --- | --- | --- | --- |
| [0.1.0](versions/prd-0.1.0.md) | 27 September 2026 | Preserved draft baseline; not formally approved | First detailed PRD: vision, audiences, subject coverage, journeys, 40 stable requirements, acceptance, metrics, risks and growth gates | User requested historical PRD maintenance after agreeing the initial architecture |

This is the first formal PRD version. Earlier conversation choices are reconstructed below as decision history, not invented prior PRD releases. Their order follows the discussion; exact message times, approvals and release dates are not invented. All occurred within the recorded 27 September 2026 planning sequence.

## Decisions leading to the baseline

| Order | Direction or proposal | Later disposition | Product consequence |
| --- | --- | --- | --- |
| 1 | Build a Git-backed Utkala · Odisha encyclopedia using existing content, photos and design work | Retained user objective | One durable public collection with website and Git contribution routes |
| 2 | Define audiences, information architecture and outcomes | Retained planning direction | Broad coverage with tourism/food/craft/story entrances and source inspection |
| 3 | Add KB-grounded conversational AI, internships, institutional relationships and analytics | Mixed scope | Analytics remains launch work; AI later deferred; internships and relationships remain programmes to arrange |
| 4 | Develop lineage/migration and global heritage connections | Retained future product scope | Evidence-qualified atlas; opt-in family records only after appropriate intake readiness |
| 5 | Consider object storage or a self-managed backend while avoiding complex cloud infrastructure | Superseded implementation proposals | Portable Git knowledge remained the core; no such provider was deployed |
| 6 | Consider Firebase and agree public read-only knowledge in Git, dynamic user data separately | Retained user direction | Spark for appropriate identity/private text features; public data does not depend on Firestore |
| 7 | Recommend Firebase Hosting, Blaze uploads/functions and Gemini | Partly superseded assistant proposal | Framework choice retained; hosting, upload method and paid feature scope changed below |
| 8 | Defer paid private backups and AI unless a suitable free alternative exists; use a custom domain with GitHub Pages | Retained explicit user direction | Static free hosting, search-first launch, no paid AI/backup launch requirement |
| 9 | Receive photo contributions by email or a free upload-to-email form and publish accepted photos manually through Git | Retained explicit user direction | No launch dependency on Firebase Storage or Cloud Functions; relay remains untested |
| 10 | Start with Spark and revisit Blaze for a specific justified need | User accepted this recommendation | No billing-enabled Firebase requirement for the launch design |
| 11 | Document stack, growth plan and diagrams in OKF | Completed documentation task | Technology concepts, current/future diagrams and architecture decisions are saved |
| 12 | Maintain a detailed PRD for history and references | Current documentation instruction | Versioned PRD, frozen baseline, requirements register and maintenance checks |

The initial $10–30/month assistant estimate applied to the broader AI/backup/managed-service design. It is historical context, not an approved launch budget. Current service target is $0 within free limits, excluding domain renewal and existing tools/labour. No pricing research is refreshed by this PRD update.

## Next change entry template

For a material change, append: version/date; added/changed/retired requirement IDs; previous and new behaviour; reason and evidence; explicit user/owner decision reference or “proposal”; effect on launch scope, cost, privacy and operations; open questions; related ADRs; snapshot paths/checksums; implementation/release reference when one exists. Never fabricate a commit, deployment or approval.

Keep prior entries intact. If an entry itself needs correction, append a dated correction explaining what was wrong. Use an erratum/new version for frozen baseline errors rather than editing history silently.

[Current PRD](prd.md) · [Maintenance procedure](prd-maintenance.md) · [Version register](../references/data/prd-version-register.json)


## 30 September 2026 UTC · Twenty-item implementation batch

Founder accepted the local visual baseline and requested sequential delivery of twenty next items (UTP-DEC-049). [The bounded batch](next-twenty.md) extends existing destination, language, literature, discovery and tour-book requirements. No retroactive change to the preserved PRD baseline or claim of scholarly/publication approval. All twenty are implemented locally; source, behaviour and review evidence are linked from the batch.

## 30 September 2026 UTC · Connect discovery to personal planning

UTP-DEC-050 records continuation authority. [Five locally implemented improvements](discovery-connections.md) extend existing discovery and journey requirements without changing the preserved PRD baseline. Real-photo entry points, Odia city aliases and separate editable starters turn the growing collection into connected visitor paths. No new service cost or publication.

## 30 September 2026 UTC · Visitor planning and inner-page foundations

UTP-DEC-051 records continuation and the Founder’s unresolved layout concern. [This batch](visitor-planning-batch.md) adds collection entry points and per-journey checklists within existing discovery/tour-book scope. It corrects specific layout issues and keeps broader refinement open. No change to the frozen PRD baseline, publication state or service cost.

## 30 September 2026 — v0.2.0: broader subject coverage

The user asked to expand pages with facts, relate and classify content, and clarified that everything is not around tourism. The encyclopedia now has nine subject hubs and contextual statistical pages. This user direction governs coverage; the exact menu, classification fields and acceptance details below remain implementation proposals.

- Added DISC-005; changed DISC-001, DISC-004, CONT-001 and CONT-005. No IDs retired.
- Previous: tourism, food and craft led the menu; related reading required links. New: subject navigation spans the whole encyclopedia; related links explain their purpose; non-tourism health/education and economy cases demonstrate breadth.
- The Painted Streets pilot and existing technology decisions remain. There is no new cost, privacy or service dependency. Public website acceptance remains untested and all feature states remain not implemented.
- Local KB organisation is completed separately from website implementation. Named editorial review and public selection remain outstanding.
- [Narrative snapshot](versions/prd-0.2.0.md) and [requirements snapshot](../references/data/product-requirements-0.2.0.json); checksums in the [version register](../references/data/prd-version-register.json). No Git commit or deployment is claimed.

## 0.2.1 · 1 October 2026 · Name correction

The user corrected the name to **Utkal**. [Preserved correction snapshot](versions/prd-0.2.1.md). This is a wording correction; prior versions, requirement IDs and approval states are preserved.

## Version 0.3.0 · 2 October 2026

User requested actionable business research by locality/district, covering facts, regulations, land, people and downloadable starter plans. Added ENT-001–004. The programme spans sectors and serves local and outside entrepreneurs; pilot order and acceptance details are implementation proposals. Prior IDs and snapshots are unchanged. Reuse existing destination and tour-book mechanisms after review. No paid backend, private-data collection, outreach, lender endorsement or website release. Source/market gaps and local review remain open. [Current programme](district-business-opportunities.md).
