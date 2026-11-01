# Odia cinema reading experience audit

The collection has a calm visual style, readable text and useful source links. The main improvements are clearer entry and onward navigation, better book pagination, and a few purposeful closing drawings. Preserve the full portraits and the space around the writing.

This audit covers the current local preview at http://127.0.0.1:8772/, the structure of all 50 reading pages, and selected pages of the 1 November digital and print books. It does not describe a new public release. Article, design and book changes remain proposals.

## Fix first

| Finding | Evidence and effect | Recommended change |
| --- | --- | --- |
| Two almost empty book pages | Digital pages 32 and 49 each contain only two continuation lines, starting mid-sentence. These interrupt Manglu Charan Biswal and the music chapter. | Reflow the final paragraphs onto the preceding page through bounded spacing changes. Do not use drawings to disguise stranded lines. Check pages 77 and 98 next: their short closing sections are coherent but disproportionately isolated. |
| The short journey loses continuity | Six of the ten-reading route’s onward links follow the full collection instead. For example, Basanta leads to Kalindi rather than Akshaya; Pratikshya leads to Anupam rather than DAMaN. Links work, but the chosen route is not carried forward. | Add an explicitly labelled next step for the central journey. Keep access to the full collection separately labelled, without requiring stored browser state. Test all nine transitions. |
| The introduction has a nearly empty contents menu | Opening “In this article” reveals only “Footnotes & Sources.” It occupies a prominent row before the portrait and prose. | Suppress the contents menu when there are no narrative sections. Preserve the essay’s continuous form and its numbered references. |
| Digital PDF accessibility remains unfinished | Both current books have valid bookmarks, title, author and document language, but no semantic tagging tree. | Create a genuinely tagged digital edition with heading structure, reading order, figure alternatives and Odia language spans; test it with assistive technology. Bookmarks alone do not supply this structure. Keep the HTML reading alternative available. [W3C guidance](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF3) explains the role of tags and reading-order verification. |

## Make the first step easier

On the 320-pixel-wide hub, “Start reading” begins about 1,222 pixels below the page top. It follows the introduction, seven part links and a large image. The shorter-route link begins around 1,658 pixels down.

Place “Start reading” and “Follow the central question · 10 readings” directly below the short introduction. Keep the seven part shortcuts and all 50 reading cards for exploration. Give the short route its own stable heading link and use its existing concise labels. The current route is already listed first in the guide; it needs a clearer entrance, not another duplicate guide.

In the book, four contents pages precede the useful ten-reading invitation on page 7. Bring a small signpost to that route forward, or place the route before the complete contents. Preserve the full contents and working page links.

## Portrait and closing artwork

Your complete portrait is already on page 8 in both current books; the introduction begins on page 9. In a conventionally bound print book this is a left-hand portrait facing a right-hand opening. I recommend keeping that treatment. It is an intentional opening, not a pagination fault.

For a digital edition, a smaller uncropped portrait sharing a page with the title and opening paragraph is an option, but your preference for the full image is a good reason to retain the separate page. Do not fill the lower portrait-page space with unrelated decoration.

Use a closing drawing where the image carries the story forward:

| Reading | Existing drawing | Proposed web placement |
| --- | --- | --- |
| Maya Miriga | A household threshold | After the close-reading passage and before “Watch and explore.” It carries the question about the house and the space around the seated figure. |
| Pratikshya | Two chairs and a folder | After the last narrative paragraph, before “Continue reading.” It returns to waiting, work and household security. |
| Bhukha | Publicity sheets beside a screen | At the narrative ending, before viewing links and “Continue.” It connects performers’ livelihoods with the work of finding an audience. |
| Literature and cinema | A book opening towards a screen | Optionally move its current interior drawing to the end. Use it once. |
| Cinema futures | Hands sharing story work | Optionally move the existing drawing below the final invitation to the shared table. Use it once. |

The first three already work in the books: digital pages 89, 95 and 147, and print pages 88, 93 and 146. They are not currently present at the web article endings.

Keep these drawings modest in height, uncropped, and attached to their own stories. Retain accurate alternatives and any required compact credit. They are symbolic drawings, not film frames or reconstructed historical events. Avoid an extra full-screen obstacle before the next reading, or an art-only book page created merely to consume white space.

The personal introduction can end on the author’s closing reflection and question without a drawing. If it receives one later, commission a distinct image rooted in that journey rather than borrow the book-to-screen image from another article. The collection hub does not need a closing illustration.

## Simplify the ending

The immediate “Continue reading” link already appears before the notes; keep that. Lower down, “Further reading,” “Related readings,” Previous/Next and four collection utilities compete for attention.

Use a clear hierarchy: narrative ending, optional small drawing, one clear next reading, numbered sources, then a quiet group of related readings and collection links. Remove the redundant “Related readings” subheading where it simply repeats “Further reading.” Retain Previous on the left and Next on the right.

The print source notes retain digital “Return” labels. Replace those with useful printed page references or omit the action label in print only. Keep the clickable returns in the digital edition.

## Book access and edition clarity

The local book page correctly labels its downloads as the published 31 October edition: 254 digital pages and 282 print pages. The newer local drafts have 254 and 280 pages and contain subsequent revisions. This is not a broken download.

For author review, clearly distinguish the current draft from the public edition. Update public downloads only with a verified release. Move printing instructions closer to the current print download and collapse older editions under an archive disclosure; the current page puts several older editions before those instructions.

## What is working

- Structural checks across 50 reading pages found 573 citation markers and 573 return links, with no duplicate IDs or broken footnote targets. All 102 notes cited more than once have matching return links.
- On a 390-pixel screen, the introduction’s second citation returned to that exact occurrence, with focus restored. Citation targets measured 24 by 24 pixels.
- The 320-pixel hub and commercial article stayed within the viewport. The budget table contained its horizontal overflow in a named keyboard-focusable region; the right arrow moved it and the focus outline was visible.
- All four audited tables have captions and row/column scopes. The narrow-table approach is consistent with the table exception in [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- The author portrait loads completely, with its caption aligned below it. The two book editions retain the full image.
- Bookmarks resolve in both PDFs. Existing selected closing drawings fit without forcing a new leaf.

## Proposed sequence and acceptance

1. Repair the two orphaned book endings and inspect the neighbouring pages.
2. Make the central route explicit and continuous; move its entrance nearer the top.
3. Suppress empty narrative menus and simplify redundant ending labels.
4. Add the three existing story-specific web endings, then judge their size at desktop, 390 and 320 pixels.
5. Adjust print-only note labels and book-download organization.
6. Complete a separate tagged-PDF pass and assistive-technology review.

After implementation, verify every route transition, citation return, keyboard focus, artwork fit and PDF page reference. Preserve the full images, compact credits and all valid source records. Rebuild only after actual changes, then inspect the affected pages.

This is an editorial and technical audit with selected browser and PDF checks, not a reader study or a full accessibility certification. No screen-reader session, physical binding proof, field performance measurement or cross-browser suite was performed. The stale alternate dist-coast build was excluded from final findings; the serving dist matched the current prose.

## Evidence

- [Technical inventory and route differences](technical-findings.json)
- [Editorial placement review](editorial-findings.json)
- [Book review with exact file hashes and inspected pages](book-findings.json)
- [Desktop introduction menu](intro-menu-desktop.png)
- [Desktop narrative ending](intro-ending-desktop.png)
- [Mobile introduction](intro-mobile.png)
- [Mobile reading route](reading-path-mobile.png)
- [Narrow-screen hub](hub-mobile-320.png)
- [Keyboard table access](commercial-table-keyboard.png)

Modern Web Guidance: the accessibility guide informed the audit of headings, navigation, focus, language and image alternatives. No website implementation was changed.
