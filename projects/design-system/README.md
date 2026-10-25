# Utkal Design System · 0.1.0-rc.5

Shared colour tokens, scoped CSS components, local fonts and original utility icons for Project Odishas. Implementation candidate; each project adopts a pinned version under its human owner. No automatic deployment or organization-wide adoption.

## Media and meaning

“A picture makes the text more readable, and a video makes the music more listenable.” — Ahimanikya Satapathy

Design the content and its media together. Choose photographs, diagrams, AI-generated illustrations, composites or video to orient, explain, evoke or accompany. A visualization can explain what one photograph cannot; label interpretation clearly and retain real evidence for documentary claims. Interleave visuals where they clarify the narrative, not only in the hero. For music, use coherent visual progression, user-controlled playback and a static/audio alternative. Keep brief depiction labels beside the media and detailed credits at the end. This is a design intention, not a measured engagement claim.

For destination pages, the intended outcome is **worth reading, worth sharing with friends, and worth planning a visit**. Give readers a distinctive reason to go, a supported moment to look forward to, and an achievable planning step. Media and layout should serve that progression.

## Use

Install locally with `npm install ../design-system`, or copy this versioned package with its font licences. Import `@utkal/design-system/styles.css` and wrap the styled area in `class="utk"`. Link the stylesheet at its package location; preserve adjacent font paths when copying. Astro/Vite can resolve the CSS imports and local font assets.

```html
<section class="utk"><div class="utk-wrap utk-stack">
  <h1>Rediscover <em>Utkal.</em></h1>
  <p class="utk-reading">A place. A taste. A story to take with you.</p>
  <button class="utk-button" type="button">Save to my journey</button>
</div></section>
```

Components include buttons, cards, fields, messages, tags, source disclosures, reading blocks, grids and stacks. All selectors for element styling are scoped to `.utk`; no global reset. The prefixed tokens are available outside the scope. Existing projects opt in deliberately.

For icons, import `{icon}` from `@utkal/design-system/icons`. `icon('search')` is decorative beside visible text; `icon('search', {label:'Search'})` is labelled. Give icon-only buttons their own accessible name. No icon conveys a historical assertion.

## Build and review

Node 22+; no dependencies for generation or tests. Run `npm run build`, `npm test`, then `npm run review` after the UTP website build exists. The review generator creates `dist/` with private review pages and copies of the website for local piloting. Serve that folder locally; open `/design-system/`. Never deploy it as the encyclopedia. Only `projects/site/dist` remains the public site artifact.

The gallery saves optional review preferences locally on its own origin and exports JSON. They are recommendations, not recorded publication approval. The four pilots use the same copy and scripts as the source site; storage at the separate review origin does not touch the live site's saved journeys. No CDN, paid service or hosted design tool is needed.

Canonical colours and spacing are in `tokens.json`; `styles/tokens.css` is generated. Change the source, rebuild, inspect and version deliberately. Code compatibility is not visual approval. Shared public components do not include review scripts, layouts or website content.

Created for Ahimanikya Satapathy's Utkal initiative with AI assistance. The system learns from the user-directed Kabita Live design work; no magazine identity or artwork is included. Fonts retain their original project authors and SIL Open Font Licence files in `fonts/`. No broader licence for Utkal identity or artwork is inferred.

## Lessons from the first website adoption

Defaults for links, headings, paragraph margins and images use low specificity. Page adapters retain their image crops and inverse panel colours. Use `.utk-inverse` for a dark surface and `.utk-button--inverse` for a light action on it; an ordinary secondary action is intended for light surfaces. Controls and card children allow intrinsic shrinkage and wrapping. Preserve a readable text measure inside a wide canvas.

UTP imports this sibling package directly at build time; its Git revision pins the source version. The site build regenerates tokens, checks matching versions and includes font licences. Separate repositories should install the exact versioned tarball. Always confirm both CSS-linked fonts and their licences reach the deployment output.

The first adoption includes all 50 website pages, including the standalone photo gallery. Domain-specific photo stages and archive viewers stay in their page adapters. The gallery now displays actual integrated pages; the earlier baseline comparison is historical, not a live toggle. Existing review notes are retained under their version-specific storage keys.

## Story patterns in rc.3

Use `utk-story-invitation` for an editorial reason to care and one relevant action; `utk-story-trail` for a short ordered reading route; `utk-story-pause` for an observation inside the narrative; and `utk-story-prose` for bounded long reading. These patterns use the existing palette and type, stack for narrow screens, and need no JavaScript. Keep media context, research, interpretation labels and factual claims in the consuming project. The local gallery includes place, food, literary profile and journey examples.

## Composition before components

The Founder found the first reference pages jumpy and disorganised. Reusable patterns are optional tools, not a sequence to assemble by default. Use one opening, one reading navigation and a clear subject-to-story-to-action progression. Keep a stable reading axis, avoid repeated imagery and introductions, and make supplementary media optional. Assess a continuous reading experience in addition to individual component and responsive checks. The three local references have been simplified accordingly; the shared package remains rc.3.

## Magazine family in rc.4

Direction A now has reusable, scoped composition styles in `styles/magazine.css`. Wrap pages in `utk-magazine`; opt into `utk-magazine--food` or `utk-magazine--person` for subject-specific image and title treatment. The cover, chapter navigation, bounded reading sections, warm chapter and visit notes share a visual rhythm. UTP's Astro components bind the styles to its content; the package contains no Odisha claims or journey logic.

Keep DOM order as title → photograph → actions → story. Desktop places the photograph alongside the title and actions; phones retain the same reading order. Portraits preserve all people in the source image. Do not manufacture quotations, imagery, dates or book covers to fill optional slots. Use stable content identifiers, not array positions, for featured entries.

The review gallery includes Chilika, Konark, Chhena Poda and Gopinath Mohanty, plus the unchanged journey composition. This is the review checkpoint before a wider rollout. Version-specific review preferences do not inherit approval from rc.3.

## Delivery lessons from the release review

Keep source artwork intact and create smaller delivery assets. Supply intrinsic image dimensions to reserve space before loading; preserve full-frame context where cropping would misrepresent the subject. Review a real content-to-journey flow alongside individual components. A screen-rendered book is not proof of native PDF pagination. These implementation lessons were recorded during the rc.4 review; rc.5 changes font delivery as described below.

## Font delivery in rc.5

The full variable fonts now ship as WOFF2, with original TTFs and OFL licences preserved. No glyph or language subsetting was performed. The conversion check compares character maps, glyph order, variable axes, shaping tables and names after decompression. Recreate files with `tools/media/compress-fonts.py` from the repository root using FontTools with WOFF support; this is an asset-maintenance operation, not a new build dependency. The site and review gallery consume the shared version.

## Lessons from the coastal visitor-flow review

Keep the story, practical choices and optional depth in a deliberate reading order. Give the visit notebook a direct contents link and keep current-arrangement notes inside that planning section. Show a short invitation and preparation paragraph first; use labelled native disclosures for longer guidance without dropping it from the portable book. This is a composition lesson, not a new mandatory component sequence.

Check keyboard focus in a real browser: when a contents menu closes, native fragment navigation must land on a focusable destination, not reset to the document body. For uncropped photographs, retain an explicit aspect-ratio fallback before loading as well as intrinsic width and height. Review actual viewport widths and scroll to load lazy images before calling an image broken. The six-guide audit covered 390, 1440 and 1920 CSS pixels; physical-device and screen-reader review remain separate. Shared package version stays rc.5; implementation is in UTP's adapters.

## Lessons from the cultural reading-flow review

A subject name and an editorial subtitle need different visual weight. Maker stories use a compact subject heading, an earth-coloured story subtitle and reading-size introductory text. Keep the full editorial title in metadata and discovery; never shorten it by silently discarding the story. Preserve the entire photographed artwork or textile, and provide its category breadcrumb, including stories whose canonical URL sits outside that category. Food, language and literary pages keep their existing subject-specific layouts. This is a bounded UTP review lesson; wider adoption and human review remain separate.

## Optional botanical tailpieces

Three reviewed decorative assets are available through [the ornament manifest](ornaments/manifest.json), with exact prompts, provenance and CC BY-SA4.0 credits. Follow the opt-in [PDF and web placement policy](ornaments/policy.json). Package exports are `@utkal/design-system/ornaments`, `@utkal/design-system/ornaments/policy` and `@utkal/design-system/ornaments/assets/*`. These assets add no styles or automatic placement; each consuming page or book verifies its own layout.
