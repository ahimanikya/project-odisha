---
type: "Design pattern"
title: "Decorative line-art fillers"
status: "founder_adopted"
---

# Decorative line-art fillers

Adopted by the Founder on 25 October 2026 for pages and book-style PDF generation. This is a shared design-system pattern, first proven in the illustrated Dhaga book. Use the existing twig, grass and vine drawings as quiet tailpieces at a reading pause or in generous unused space.

## Purpose and restraint

Decoration gives a page a gentle ending and balances open space. It does not explain the subject, replace a missing illustration, imply historical provenance or add evidence. Whitespace remains useful: leave small gaps empty. Use a single restrained motif at a chosen pause, not a compulsory ornament after every paragraph or on every page. Rotate the three motifs without turning them into a dense repeating pattern.

Keep the complete drawing and its aspect ratio. Do not stretch, crop, mirror or recolour the reviewed originals automatically. Their white backgrounds suit light paper surfaces; omit them on incompatible backgrounds until a separately reviewed transparent or dark-surface treatment exists. These are contemporary botanical drawings, not certified plant diagrams, sacred symbols or recovered traditional artwork.

## Book and PDF placement

Lay out the complete text, meaningful illustrations, headings, footnotes and page furniture first. Measure the remaining space; add the tailpiece only if it fits. Decoration must not move text, reduce type size, change pagination or cover anything. Exclude title, contents and source-credit pages by default; other profiles may explicitly choose a suitable end-of-section placement after review.

The proven two-column Dhaga profile uses these values in PDF points (72 points = 1 inch):

| Constraint | Proven default |
| --- | --- |
| Placement | Page-centred below both columns' occupied content |
| Minimum shared remaining gap | 180 pt |
| Minimum separation from content | 24 pt |
| Maximum artwork box | 160 pt wide × 110 pt high |
| Minimum rendered artwork height | 45 pt; omit below this |
| Clearance above frame bottom | At least 24 pt |
| Maximum frequency | One per reading page |
| Text reflow or type shrink for decoration | Never |

These are a named book profile, not universal dimensions for every trim size. For single-column books or different paper sizes, measure the usable frame and reserve the footer/safe margins before selecting an explicit profile. Omit the ornament if any constraint fails. Prefer fewer good placements over filling every blank area.

Render the final PDF and inspect every changed page for overlap, clipping, script glyphs, footer clearance and natural visual balance. Keep placement measurements in the packing report. The 159-entry Dhaga edition has 41 placements across 80 reading pages; that is evidence of selective placement, not a target density.

## Reading pages

For a web or document page, use a motif at a deliberate section ending in normal content flow. Do not calculate fake page-sized gaps or position artwork over text. Keep it modest, allow surrounding breathing room and omit it where a narrow layout becomes crowded. It must never hide prose or create sideways scrolling.

Treat the image as decorative: empty alternative text on web pages, no link or focus target, and no redundant spoken caption. If a PDF generator supports tagging, mark it as an artifact; do not claim the current Dhaga PDF has tagged accessibility merely because the pattern recommends it. Any meaningful explanatory image still requires its own description and evidence. No animation is needed.

This adoption supplies reusable assets and a placement policy. It does not silently add ornamentation to all existing pages. Each page or generator adopts it explicitly and verifies its own output.

## Shared assets, rights and maintenance

The portable asset manifest and placement policy live in `projects/design-system/ornaments/` at the repository root, packaged with the design-system library. Reuse those versioned files for new adopters. The existing Dhaga edition keeps its original asset paths and byte-identical images; future migration is a separate tested change.

Retain creator, CC BY-SA 4.0 rights, original prompts, image hashes and review provenance in the manifest and appropriate shared credits. Production disclosure follows the site's shared editorial-process policy; do not add production labels to every ornament or its alt text. New motifs or altered drawings require a separate visual review and new versioned assets. Never overwrite a reviewed asset in place.

Evidence: [original filler delivery, PR 553](https://github.com/ahimanikya/project-odisha/pull/553), [expanded book](../records/odia-dhaga-expansion-2026-10-25.json). Actual merge and local receipt evidence governs release status when an older record retains a pending field.
