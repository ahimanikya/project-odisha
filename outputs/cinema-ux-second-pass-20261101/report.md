# Odia cinema reading experience second review

The collection needs a small, focused polish pass. The clearest problems are uneven bilingual heading spacing, a fragmented digital-book ending, and an incorrect Contents running heading. Some illustrated profiles also need a clearer distinction between an imagined scene and a likeness of the person.

This review covers the current local collection of 50 readings and the 252-page digital and 278-page print proofs dated 1 November 2026. It records recommendations; articles, images, website code and PDFs have not been changed or published.

## Fix first

### Bring Odia and English headings into the same rhythm

On the mobile Pratikshya page, the Odia title inherits a 76-pixel line height while the English heading uses 46 pixels. The three-line heading becomes 168 pixels tall instead of its nominal 138, leaving a conspicuous gap after the first line. Give heading text a shared line rhythm while preserving clearance for Odia glyphs. Check other bilingual headings after the change; do not flatten the more generous body-text spacing.

Evidence: `pratikshya-mobile-heading.png`, `browser-measurements.json`; web finding TYPE02, now visually confirmed.

### Rejoin the digital book ending

Digital page 188 contains a single six-line paragraph before the illustration and final invitation on page 189. Reflow this local ending so the argument does not pause on an almost empty leaf. Keep the meaningful drawing and the existing body size. Adding filler art would conceal the layout problem rather than resolve it.

The print closing on pages 189–190 is coherent and can retain its breathing room. This is not a request to fill every page.

Evidence: book finding B01; digital pages 188–189 and print pages 189–190.

### Correct the Contents running heading

Pages 4–7 in both editions still carry “Follow the central question” above the Contents. Use “Contents”, or omit the running heading on those pages.

Evidence: book finding B02; page 4 inspected full size in both editions, remaining Contents pages at contact-sheet scale.

### Complete the verified language labels

Some known Odia film titles, including Amada Bata and Matira Manisha in the literature article and Sri Jagannath in the AIR Cuttack article, inherit the English page language. This can affect pronunciation by reading software and the intended font treatment. Add language markup to verified Odia strings and generated reading links. Do not assume every text written in Odia script is the Odia language; preserve Sambalpuri distinctions.

Evidence: web finding TYPE01. This is a confirmed markup gap, not a claim that all readers currently hear incorrect pronunciation.

## Clarify image representation

**Uttam Mohanty and Aparajita Mohanty:** the realistic rehearsal and script-discussion illustrations show anonymous performers, not documented likenesses or events. The article captions already identify illustrations. The profile cards omit those captions, so a quick reader could still associate the figures with the named actors. A short “imagined rehearsal” or “imagined script discussion” caption would improve the articles; a verified, reusable portrait would be a stronger future profile-card choice if one becomes available. No newly cleared portrait was found or obtained in this audit.

**Basanta Kumari Patnaik:** the book-sewing image works as a publishing metaphor. Her publishing partnership does not establish that she personally bound books. Keep the image generic; “An imagined bookbinding scene” would be enough if the caption changes. The existing biography does not need correction on this basis.

**Across the collection:** warmly lit desks, papers and windows recur. These are different images, not duplicate files. Future replacements should vary the activity, viewpoint and setting, especially where two neighbouring readings feel alike. Wholesale regeneration is unnecessary.

**Bhukha:** a small signature-like mark appears at the lower-left of the drum illustration. Remove it if the artwork is revised, without inventing an artist credit or treating the mark as a proven rights problem.

Evidence: image findings IMG01–IMG04 and the six image contact sheets. These are interpretation risks or aesthetic refinements, not confirmed false historical depictions.

## Smaller reading refinements

- Keep a reading-link arrow attached to the last word of its title. At 390 pixels, a few long related-reading and hub titles leave the arrow alone on a new line. Preserve wrapping of the title itself.
- Consider moving Nirad Mohapatra’s whole introductory paragraph to the next digital page; currently two lines follow the large portrait on page 88 and the sentence continues on page 89. Keep the approved large portrait unless its size is separately reconsidered.
- Review a few sparse “Watch and explore” end pages locally. Retain useful viewing links and access conditions; do not shrink typography across the book to save isolated pages.
- In the printed source directory, keep each source label with the beginning of its URL. Long encoded URLs are intact but awkward to transcribe. A stable online source index could help a later print edition.

## Keep what is working

The corrected Learning Cinema Together image contains paper scripts, not a laptop. No confirmed historical mismatch or exact duplicate original image was found in the reviewed placements. The 56 original image placements have distinct hashes; six additional line-art motifs were also reviewed.

The sampled narrow-screen layouts do not overflow. Body text and numeric references remain readable; the citation-spacing concern did not produce a demonstrated collision. The Further reading divider is coherent, so it is an optional stylistic choice rather than a defect. Sampled captions align with their images, and archive objects retain their complete boundaries. Preserve those decisions.

## Scope and evidence

All 50 readings plus the hub, reading guide and book landing page received a structural review. Browser checks sampled widths of 320, 390 and 1280 pixels. Both books were scanned at contact-sheet scale, with 14 pages inspected full size in this pass and 11 same-artifact full-size checks reused from the preceding review. Eight selected image originals received full-size inspection alongside the complete contact-sheet review.

This is not a physical print proof, a new rights-owner verification, a complete historical re-research, or a human reader study. Enlarged-text and assistive-technology testing were not performed in this pass. PDF tagging and reading order remain a previously recorded open task.

Detailed evidence is in `web-review.json`, `image-review.json`, `book-review.json` and `browser-measurements.json`. PDF hashes are recorded in the book review. Recommended order: heading/language fixes, book pagination and running headings, then selective image-caption and link-wrap refinements.
