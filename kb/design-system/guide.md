---
type: "Design system guide"
title: "Utkal Design System 0.1.0-rc.4"
status: "local_candidate_for_review"
---

# Utkal Design System 0.1.0-rc.4

**Purpose:** let people recognize a shared Utkal family across knowledge, discovery and future associated projects, while keeping each project's content, governance and purpose clear. Creative direction: Ahimanikya Satapathy. Implementation and original utility icons: current AI assistant. Kabita Live supplied a user-authorized design reference; its identity, magazine artwork, service configuration and team assignments were not imported.

## Layers

```mermaid
flowchart TD
  F[Foundations: colours, type, space, interaction] --> C[Core: buttons, fields, cards, messages, navigation]
  C --> P[Patterns: discovery, sources, reading, journey states]
  P --> A[Project adapters and reviewed page families]
  A --> U[Project Odisha]
  A --> X[Other projects after their own adoption]
```

Tokens and shared styles are framework-independent. The package uses prefixed `--uds-` custom properties and `utk-` component classes. Generic element styling is scoped under `.utk`; there is no global reset. The candidate UTP page adapter is deliberately outside the distributable core because legacy selector changes are application-specific.

## Media and meaning

> A picture makes the text more readable, and a video makes the music more listenable
>
> — Ahimanikya Satapathy

Design media and content together. Choose a photograph, diagram, montage, AI visualization or video for the meaning it communicates: orient, explain, evoke or accompany. AI imagery can explain a subject better than a single available photograph; distinguish that explanatory value from documentary evidence. The [media and meaning foundation](media-and-meaning.md) gives entity examples, page rhythm, music/video guidance and a short media brief. Apply it to the open inner-page refinement, not just hero decoration.

## Foundations

`projects/design-system/tokens.json` is the executable source of truth. The generated `styles/tokens.css` must not be edited independently. The existing public site's earlier definitions remain until it explicitly migrates; they do not become another source for the new package.

| Purpose | Foundation |
|---|---|
| Headings, links, actions | Nila Sagara `#1D4658` |
| Highlights and editorial emphasis | Mankada Pathara `#91462F` |
| Supporting material tones | Sukha Ghasi olive `#74633B`, straw `#C1A263` |
| Surfaces | Canvas `#FBF6EC`, warm panel `#F2E6D0` |
| Text and muted text | `#302E28`, `#706658` |
| Status | Text labels plus success/error support; never colour alone |
| Space | 4, 8, 12, 16, 24, 32, 48, 64 and 96px equivalents expressed in rem |
| Main controls | 3rem minimum target, 4px corner radius, visible 3px focus ring |
| Reading and canvas | 68ch reading measure inside a fluid canvas up to 120rem |

Brand values and material stories remain unchanged. Sukha Ghasi is the dried cow-dung-and-paddy-straw cooking-fuel cake from the Founder's memory. Separate English and Odia wordmarks remain intact. Specimen headlines are demonstrations, not replacements for the established tagline.

## Typography candidate

- **Display:** Cormorant Garamond 500, with a genuine italic for selected English emphasis.
- **Long reading:** Source Serif 4; body prose approximately 1.2rem/1.85, with app-specific refinement after review.
- **Interface:** familiar system sans serif, with an Odia fallback.
- **Odia:** variable Noto Serif Oriya, upright and naturally spaced. Regular weight is available for sustained reading, rather than forcing all text through a bold face.

Only unmodified, locally held SIL OFL distributions are included, with their original author licences. No Google Fonts/CDN dependency. Other scripts need explicit font and language review when introduced. A rendered font does not establish linguistic correctness.

## Component contracts

| Family | Classes / responsibility |
|---|---|
| Layout | `utk-wrap`, `utk-stack`, `utk-row`, `utk-grid`, `utk-section` keep consistent measures and spacing. |
| Identity and navigation | `utk-header`, `utk-brand`, `utk-nav`, `utk-breadcrumb`, `utk-footer`; labelled navigation, current-page state and wrapped phone layouts. |
| Openings and media | `utk-hero`, `utk-media`; use different page patterns rather than one fixed magazine split. Preserve focal points and descriptive captions. |
| Type | `utk-reading`, `utk-eyebrow`, `utk-muted`, `utk-highlight`, with explicit `lang` on script changes. |
| Actions | `utk-button`, secondary and quiet variants. Use real buttons for actions and links for navigation. Label icon-only controls and manage busy/disabled/pressed states in the consuming app. |
| Cards | `utk-card`, `utk-card__body`, `utk-tags`, `utk-tag`, `utk-missing-image`. Match food, place, person and stay-area metadata to the actual entity. |
| Fields | `utk-field`, labelled inputs, help and errors. The app owns validation, focus and submission; CSS alone does not make a form functional. |
| Status and recovery | `utk-message`, error and success variants. Say what happened and how to continue. |
| Sources | `utk-disclosure` for end credits and source notes. Attribution requirements, writer names and documentary/illustrative distinctions remain substantive. |
| Utility icons | Twelve original single-colour symbols: search, save, check, download, print, arrow, external, place, book, menu, close and contribute. Symbols support visible labels and do not establish cultural or historical claims. |

Core CSS includes reduced-motion and forced-colour handling. Baseline print styles are included; app-specific A4 pagination remains a separate verification task. Disabled controls are excluded from normal-text contrast claims.

## Review gallery and pilots

The local gallery has ten groups: identity, type, media and meaning, rhythm, actions, discovery, forms, feedback, sources and pilots. It includes current/proposed typography, functional sample save state, combined search/category filtering, empty-state recovery, validation focus, review notes and JSON export. It never submits a contribution or applies a project decision.

Four complete copies of actual UTP pages demonstrate the candidate: **Chilika**, **Chhena Poda**, **Gopinath Mohanty** and **My Odisha Journey**. The first three demonstrate subject-specific storytelling; journey planning remains a functional reference. At the separate local review origin, saved journeys are separate from the live/4324 site. Links inside a pilot lead to the copied baseline pages unless they explicitly open another pilot.

A tablet overflow in Chilika's minimum-height photo stage was found and corrected in the candidate adapter. The public-site baseline was not altered by this work. This fix belongs in the later UTP migration.

## State of completion

This version is a reusable implementation and visual candidate. The Founder authorized building the system; that is not blanket acceptance of every typography, radius or layout choice. Review preferences are browser-local notes and exports, not automatic source edits or formal publication approval. [Verification and limits](../records/design-system-review.json) remain part of the handoff.

## Lessons carried into the shared system

Use low-specificity defaults for basic elements so real applications can preserve their photo geometry and readable text on coloured panels. Add the explicit inverse button variant on a dark surface. Keep card children and form controls shrinkable, and let labels wrap. Do not use a fixed aspect ratio with a conflicting minimum height: the Chilika tablet stage needed a local correction.

A migration inventory must include standalone pages, generated viewers and dynamically created controls, not only the main page layout. Review previews should use actual application output once adopted. Keep fonts and licence files together in both the reusable package and the website export.

See the [first adoption record](utp-adoption.md) for observed findings and verification limits.


## Lessons from the next twenty pages

- Reuse the place and voice templates, but supply honest context for every visual. A village landscape is not a workshop photograph; a typographic name panel is not a portrait or script specimen.
- A recovery action should name what it restores and return focus to the recovered item. Undo restores the removed idea only, preserving edits made elsewhere.
- Sorting, region and topic filters should share one URL state. Preserve meaningful Odia marks when normalising text.
- Use a compact day overview as navigation, without implying a feasible route or travel-time estimate.
- Keep data operations in the consuming app; the library supplies readable fields, states and actions. No new shared token was needed for this batch.

## Lessons from connected discovery

Use one photographic card pattern for a directory and its homepage preview; maintain the same photo context and accessible credits in both. Show a starter’s actual contents before its save action. A successful action must reflect a successful storage write: prepare a candidate separately, retain the prior collection on failure and offer a recoverable download. Reading connections must not imply a travel route. These are application composition and behaviour lessons; shared tokens remain at 0.1.0-rc.2.

## Lessons from visitor planning

Group photo-led and text-only cards into separate, coherent rows rather than leaving short cards stranded beside tall ones. Preserve reading order in the markup, not CSS-only reordering. Protect full portraits when a card becomes wide. Wide pages can hold photographs generously while prose keeps a readable measure; stack side columns before tablet text becomes cramped. Optional planning states need a visible meaning and honest persistence feedback. These application refinements retain the 0.1.0-rc.2 shared foundations; a broader inner-page visual review remains open.

## Lessons from the story reference pilots

Version 0.1.0-rc.3 adds reusable invitations, reading routes and visual pauses while preserving the palette and typography. Place, food and person stories have distinct outcomes. Preserve complete historical portraits, interleave images with relevant passages, and let wide-screen imagery coexist with bounded prose. The [story pattern guide](story-patterns.md) records the contracts, media boundaries and remaining rollout.

## Composition before components

The Founder found the first reference pages jumpy and disorganised. Reusable patterns are optional tools, not a sequence to assemble by default. Use one opening, one reading navigation and a clear subject-to-story-to-action progression. Keep a stable reading axis, avoid repeated imagery and introductions, and make supplementary media optional. Assess a continuous reading experience in addition to individual component and responsive checks. The three local references have been simplified accordingly; the shared package remains rc.3.

## Magazine family in rc.4

The selected visual magazine direction now provides shared cover, chapter navigation, reading rows and warm chapter styles. Four local references compare a lagoon, a heritage destination, a food and a writer. Mobile navigation uses a native disclosure and the cover places its photograph before the actions. [Review checkpoint and remaining rollout](magazine-family-review.md). Earlier rc.3 statements above record the previous stage.

## Planning hub application · 1 October 2026

The four-hub candidate applies existing tokens and cards through a shared site component; it does not introduce a new core package version. One compact planning navigation connects destinations, food, experiences, stay areas and starters. Group idea cards by area, keep jump links stable and let a single pictured card use the available width. A desktop opening must explicitly escape inherited narrow reading widths; keep reading text measured inside the wider canvas.

Use a contextual photograph to invite exploration, preserve full-frame performance imagery when requested, and label landscape images used for stay-area research. Keep rights and source detail in the closing disclosure. Do not add a second generic related-content ending to a hub. Keyboard paths and real saved-journey continuity are acceptance checks alongside responsive screenshots. Evidence: [planning hub review](../records/planning-hubs-review.json).

## Language collection application · 1 October 2026

A language directory is a set of reading choices. Use a relevant manuscript or accurately captioned script specimen where rights permit, and a typographic panel where documentary imagery is absent. Do not invent a community portrait to fill a card. Cards connect language, place and reading intent without treating districts as exclusive language boundaries.

The reading shelf keeps the original resource link, edition, publisher and compilers together. The three-column visual names languages compared by the booklet; it is not a newly translated vocabulary table. Use one closing contribution invitation and keep detailed evidence in the existing end disclosure. Preserve source links and practical prompts in portable reading books. These are site-level applications of existing tokens, not a new shared package release. Evidence: [language review](../records/living-languages-review.json).

## Visitor experience application

A reader needs both a position in the collection and a way into the story. Use one compact breadcrumb before the opening; retain existing regional context instead of adding a second breadcrumb. On phones, a native contents disclosure can keep longer chapter lists out of the opening. Its link order must follow the article, and navigation must work without JavaScript.

Related reading should explain why two entries belong together. Reuse the curated connection and keep one ending rather than adding another generic card block. A connection into a language or food story is not a travel itinerary or a statement about every community member.

Sharing is another view of the page. Prefer its actual credited photograph, preserve contextual captions and descriptive metadata, and retain a clearly labelled brand fallback for subjects without suitable imagery. Metadata-only images must survive the publication export. Test complete visitor paths and downloaded artifacts alongside screenshots. These are applications of the existing foundations; no new core package version is introduced. [Visitor experience review](../reference/visitor-experience-review.md).


## Launch-readiness pilot · October 2026

The UTP pilot now reuses responsive image delivery across covers, cards and destination photographs. Keep the original photograph, alt text and source/credit records; generate aspect-preserving WebP sizes at build time. Describe the rendered width through `sizes`, prioritize the opening image and lazy-load supporting images. A smaller encoded file is a delivery improvement, not proof of faster real-device rendering or unchanged perceived quality. Original images remain available to sharing metadata and portable books.

Mobile contents should use a native disclosure. Escape closes it and returns focus to its summary. Choosing a chapter closes it, moves focus to the chapter heading and preserves native fragment navigation; modified clicks retain browser behaviour. Apply the same pattern to place and regional guides as to cultural stories. Retain the shared reduced-motion, forced-colour and visible-focus styles.

The launch candidate checks 14 token foreground/background pairs at normal-text contrast, but this is not a screen-reader or rendered-page accessibility certification. Browser security-policy verification blocked visual testing for this batch. Physical-device, screen-reader, zoom and visual composition checks remain open. See the [launch review](../records/public-launch-readiness-review.json).
