---
type: Operating guide
title: Project recordkeeping
---

# Project recordkeeping

Start at the bundle index and read the charter, working agreement, applicable team/role records and current work. The canonical identity and record-directory setting are in `utkal.config.json` at the repository root, outside the KB. Blueprint uses `maintenance/` for its creator's actual maintenance work and `registers/` for blank instance seeds. Project Odisha (POD) uses `registers/` for its actual project work. Use POD for current and new IDs, including programme and queue entries. Existing IDs have migrated with their suffixes preserved. Resolve old UTP references through the exact alias map; do not create duplicate records or rewrite captured evidence. Current and legacy namespace metadata are declared in configuration and canonical registers.

Current state is in the applicable `records.json`; activity is append-only `activity.jsonl`. Record significant evolution in the history ledger where present. Run `python3 tools/registers.py` from the repository root to regenerate, then `--check`. Run `python3 tools/check_bundle.py` for portable knowledge checks.

No human reports to AI. Definition, assignment, authorization and access are distinct. Continue within actual human authorization; preserve decision quotes and historical evidence. A role label or passing test grants no authority. The currently named personas in Blueprint are templates, not an appointed operating team.

Archived earlier instructions are preserved as history, not the current path guide.

For the Project Odisha instance, read [current assignments](../team/assignments.json) and [team operating loop](../team/operations.json). The Founder activated separate collaborating agents in POD-DEC-2026101901. Delegate the current article’s research to Anvesha, implementation to Samanta, and separate quality review to Drishti; Disha coordinates and alone writes shared records and publishes. Preserve explicit file scopes, one active article and actual runtime handoffs. Blueprint template identities remain definitions outside this Project Odisha assignment.
