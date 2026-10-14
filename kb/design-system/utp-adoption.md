---
type: "Design system adoption record"
title: "Project Odisha design system adoption and lessons"
status: "local_applied_candidate_for_review"
---

# Project Odisha design system adoption and lessons

The Founder asked to apply the design system and improve it from what we learn. Project Odisha now consumes **0.1.0-rc.2** across its 50 local website pages. The selected sea, stone and hearth colours, original logos and source photographs remain intact. Display and reading typography, Odia support, actions, fields, navigation and cards now share a common foundation.

## What changed

The main shell imports the reusable package, while UTP adapters preserve page-specific layouts. Samanta Chandrasekhar's earlier standalone profile now uses the common shell. The Fresco archive keeps its existing viewer, catalogue and keyboard interaction, with shared tokens and typefaces applied through its own adapter. The photo collection's original and thumbnail bytes remain unchanged. Two obsolete contribution notices now lead readers to the existing public GitHub contribution route.

The local review gallery uses real integrated pages rather than another stylesheet layered on a baseline. Its versioned notes remain preferences, not publication decisions. Version 0.1.0-rc.1 and its evidence remain available for history.

## What real pages taught us

| Observation | Response | Home |
| --- | --- | --- |
| Generic link and image rules can override a dark panel or intentional crop | Lower-specificity element defaults and inherited link colour | Shared library |
| Secondary actions disappear against a sea-colour photo panel | Explicit light action and inverse-surface variants | Shared library, exercised in Photo Journey |
| A photo stage combines a minimum height with a wide aspect ratio | Release the aspect ratio at tablet sizes and constrain intrinsic width | UTP destination adapter |
| Generated journey controls bypass static markup | Apply shared action and field classes as controls are created | UTP application |
| Two standalone pages bypass the main shell | Inventory every built route and assert its system version | UTP integration checks |
| Bundling fonts does not automatically publish their licence files | Copy licences and verify their bytes in the site export | UTP build |

## Review evidence and limits

The [self-review record](../records/design-system-adoption-review.json) contains exact checks and evidence. Search, an empty result, saving Chilika, retaining a note and day after reload, correction validation focus, gallery next/close/focus restoration and inverse photo controls were exercised locally. Journey checks used a separate local origin so existing visitor plans were not touched. Automated tests cover data migration, corrupted storage, offline books, links, citations, asset provenance and Store exclusion.

This is implementation self-review. Fluent Odia review, physical devices, screen readers and native A4/PDF pagination remain outstanding. Enlarged-root-text checks do not prove full browser zoom or enlargement of every legacy pixel-sized label. No public deployment, real GitHub submission or other-project adoption was performed.

## Next gate

The Founder reviews the integrated website and gallery. A public release must use the [new output manifest](../records/design-system-adoption-manifest.json); previous output approval cannot be inferred. Other projects can adopt the portable package under their own ownership and review process.
