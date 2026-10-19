---
type: "Design-system proposal"
title: "Utkal Design System — adapting lessons from Kabita Live"
status: "proposed_for_founder_review"
version: "0.1"
---

# Utkal Design System — adaptation proposal

The Founder suggested learning from the design system built in Kabita Live. This proposal follows a read-only study of its canonical design guide, brand tokens, component candidates, review catalogue and implemented stylesheet. [Source paths and hashes](../records/kabita-design-study.json) preserve the inspected revision. The shared creative direction comes from Ahimanikya Satapathy; this comparison and Utkal adaptation proposal were prepared by the current AI assistant.

**Recommendation:** adopt the system's separation of identity, design rules, reusable components and human review. Give Utkal its own visual and interaction choices. This is a proposal, not an applied redesign or a transferred approval.

## What the reference actually establishes

Kabita Live has five locked foundation groups and thirteen pending component groups. Its approved single-colour icon treatment is distinct from approval of every icon's placement. The spacing scale and several interaction variants remain candidates. Its documentation also retains an unresolved enlarged-header concern at 200% text size. None of these reference approvals, tests or unresolved choices establish Utkal approval or accessibility compliance.

## Reuse and adaptation map

| Area | Kabita Live lesson | Proposed Utkal adaptation |
|---|---|---|
| Foundations | Named colours assigned to semantic roles | Preserve Utkal's values and origin stories; use one authoritative token source for the guide and website. |
| Typography | Separate display, sustained reading and interface fonts; script-aware shaping | Compare Source Serif 4 for prose and Cormorant Garamond for selected display headings against Utkal's current Georgia. Keep the approved wordmarks intact. Add a regular/variable Noto Serif Oriya reading specimen before changing Odia defaults. |
| Spacing | Explicit shared scale with component examples | Trial 4/8/12/16/24/32/48/64px; allow documented large-screen section spacing and optical exceptions. Avoid an indiscriminate global CSS replacement. |
| Actions | Coherent hover, focus, pressed, disabled and feedback states | Sea-coloured primary action, quiet secondary links; distinguish save, saved, export-in-progress and failed export with words and state, not colour alone. |
| Cards | Consistent metadata hierarchy | Separate cards for places, food, people, language, experience and stay area, sharing typography, image and spacing rules. Stay areas must not imply verified hotels. |
| Page openings | Art and title have clear roles | Wide photographic destination hero; balanced food story; respectful portrait/literary layout; practical planner header. Do not impose the magazine's 60/40 text/art ratio everywhere. |
| Reading | Adjustable type and preserved poetry structure | Consider reading-size controls for long articles; use poem sizes only for verse. Test longer notes, citations, Odia text and 200% enlargement. Night reading is a later option after the light system is coherent. |
| Imagery | Preserve focal points, rights and originals | Real place/food photographs first; intentional portrait crops and missing-image states. Keep illustrations clearly distinguishable from documentary views and travel evidence. |
| Icons | Quiet single-colour utility symbols, separate editorial motifs | Trial a coherent utility family for save, search, print, download, map and contribution. Define Utkal cultural motifs separately; retain the book-and-boat identity. No icon assets copied by this study. |
| Credits | Quiet colophon plus content-specific attribution | Keep sources and asset credits accessible at the page end. Keep writer/translator names near works and a short depiction label wherever removing it would mislead. Respect asset-specific credit placement; exported books carry their own credits. |
| Review desk | Live specimens, alternatives, visible decision status and exportable records | Build an internal Utkal review gallery, separate from public site output, with current/proposed views and real Utkal examples. Browser choices are review notes until recorded and applied through the existing human decision process. |

## Utkal foundations to preserve

| Role | Existing Utkal value |
|---|---|
| Nila Sagara · headings, links and actions | `#1D4658` |
| Mankada Pathara · highlights and editorial accents | `#91462F` |
| Sukha Ghasi · olive and straw support | `#74633B` / `#C1A263` |
| Warm surfaces | `#FBF6EC` / `#F2E6D0` |
| Reading ink | `#302E28` |

The three colour stories, the separate English/Odia logo versions, and “Rediscover Utkal. Reimagine Odisha.” remain the identity baseline. Kabita Live's similar colour names have different numeric values and must not silently replace these. Sukha Ghasi retains the Founder's dried cow-dung-and-paddy-straw fuel-cake meaning.

## First pilot and acceptance

1. **Foundations and specimens:** central token candidate, English/Odia type comparison, spacing, controls, filters, source disclosure, status and empty/error states. Show both Utkal's current treatment and the proposed direction.
2. **Three complete examples:** Chilika for a photographic destination and practical information; Gopinath Mohanty for literature and long reading; My Odisha Journey for forms, saved state and export. Include a food card and contribution field specimen in the gallery.
3. **Review then migrate:** the Founder chooses the specific treatment. Record decisions in the KB; apply selected components first, migrate the other page families, then rebuild and repeat the release review.

Check at 360/390px phones, tablet and wide desktop widths, plus 200% text enlargement. Verify keyboard focus and recovery, natural Odia shaping and line height, long names, multiline controls, image crop behaviour and text contrast. Confirm existing search URLs, saved IDs, local journeys, backups, print styles and end credits keep working. A fluent human should review script rendering and language. Existing tests are regression evidence, not a design approval or complete accessibility certification.

## Boundaries and release impact

No website code or source assets changed during this study. No Kabita Live masthead, signature, artwork, editorial content, private service configuration, persona assignment or browser-local approval was imported. The previous release candidate remains available but is not published; this proposal is a separate design decision. If adopted and applied, it creates a changed candidate that needs a fresh release review and manifest.

Odisha Blueprint may later carry the generic design-review procedure as a reusable template. Utkal's colours, content and components belong to its project implementation; no Blueprint-wide change is proposed for automatic application here.
