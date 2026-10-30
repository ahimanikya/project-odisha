# Odia cinema · fresh reading audit

27 October 2026 · Findings only; changes not applied

The latest additions improve the human connections. The remaining problems are discoverability, uneven framing and interruption of the narrative. The existing technical passes remain valid within their scope; they did not establish that every new heading was linkable or every new title had language markup.

## CIN-AUD-01 · Make named performer sections discoverable

**Priority: high.** Bijay, Uttam and Aparajita are plain H3 headings without IDs; renderer only anchors H2. Book contents only names the companion survey; new performer/music detail falls after the closing future chapter.

**Recommended change:** Add stable H3 anchors and selected section-menu/hub shortcuts. Add named performer/music contents entries and people-guide pointers. Editorial option: promote a concise performers-and-music chapter into the main narrative before the new-generation section, leaving counts in reference material.

**Check:** Each named profile has a working link; performers and songs can be reached from hub/book contents without searching the full survey.

**Where:** projects/site/src/lib/reviewed-culture-article.mjs:30; kb/research/culture/odia-cinema.md:119; digital pages132–137; print136–142; kb/research/culture/cinema-series/book-narrative-2026-10-27.json: people_guide.

## CIN-AUD-02 · Put the measurement beside each film count

**Priority: high.** Mahasweta's Almost40 counts lead-film credits, while other rows report broader film totals. Jayiram's source mixes reporter film count and recalled comic roles. Source qualifications are accurate but easier to overlook than the numbers.

**Recommended change:** Write Almost40 lead-film credits in the estimate cell; separate lead-only and film/role-ambiguous rows from broader film totals or mark the unit directly beside every number. Retain dates and avoid ranking incomparable data.

**Check:** A reader scanning numbers alone cannot reasonably mistake lead roles for total appearances or treat dated reports as current rankings.

**Where:** kb/research/culture/odia-cinema.md:153.

## CIN-AUD-03 · Keep statistics from interrupting the human narrative

**Priority: high.** Three performer capsules lead into five contribution rows and nine count rows before the music story. The overview narrative is approximately5750words. The book count panels occupy several pages between stories and songs.

**Recommended change:** Keep the strongest performer and music stories together; move the count reference after the narrative or into a clearly named reference section with its own shortcut. Preserve all evidence.

**Check:** Readers can follow people to music to newer films without crossing the count reference.

**Where:** kb/research/culture/odia-cinema.md:137; digital133–136; print138–141.

## CIN-AUD-04 · Restore continuation before the sources

**Priority: high.** On the inspected390px viewport, Footnotes begins around34572px and Next reading around47306px. Working source links do not solve that long traversal.

**Recommended change:** Add a compact next-reading link at the narrative end before source/credit sections; retain expanded sources and bottom navigation.

**Check:** Next reading is available immediately after the story on desktop and mobile.

**Where:** projects/site/src/components/CinemaReading.astro; current overview mobile DOM.

## CIN-AUD-05 · Complete accessibility semantics for the new content

**Priority: high.** New verified Odia titles are absent from the reviewed language allowlist; the two performer tables both have generic Scrollable data table names and lack explicit scoped row/column header associations.

**Recommended change:** Add reviewed Odia title language spans; give contribution and count tables distinct accessible captions/names and appropriate scoped headers. Preserve keyboard-contained scrolling.

**Check:** Verified titles expose lang=or; assistive technology can distinguish both tables and associate each figure with performer and unit.

**Where:** projects/site/src/lib/cinema-article.mjs:13; projects/site/src/lib/reviewed-culture-article.mjs:27.

## CIN-AUD-06 · Avoid narrowing major performers through headings or statistics

**Priority: medium.** Mahasweta's leading career sits under Comedy, character work. Siddhanta appears only as a count, without a meaningful work example.

**Recommended change:** Rename the wider selection Other performers and collaborations, keeping comedy as a distinct contribution. Add one sourced Siddhanta performance/collaboration example so the count is connected to work.

**Check:** Leading, character and comic careers receive accurate framing; no actor exists in the overview only as a statistic.

**Where:** kb/research/culture/odia-cinema.md:137; kb/research/culture/odia-cinema.md:163.

## CIN-AUD-07 · Strengthen the missing generational bridge

**Priority: medium.** Prasanta Nanda is absent from the overview despite the Sesa Srabana discussion; Sarat Pujari already has a concrete Mangaraj credit in the Parbati essay. Tandra Ray remains an unresearched expansion lead.

**Recommended change:** Prioritise sourced work-based connections for Prasanta Nanda, Sarat Pujari and Tandra Ray. Continue standalone Bijay/Uttam/Aparajita pages with distinct rights-cleared portraits; do not pad the story with an unbounded names list.

**Check:** Each addition explains a specific contribution and links to a film or collaboration; absent counts stay unknown.

**Where:** kb/research/culture/odia-cinema.md:143; kb/research/culture/cinema-series/parbati-ghose.md:54; performer evidence packet.

## CIN-AUD-08 · Clarify the two numeric note systems without verbose captions

**Priority: medium.** Caption superscript13 goes to image credit13; prose13 goes to a chapter source. Both use the requested numbers-only visible form, but print readers lack the web accessible labels.

**Recommended change:** Add one short reading-key explanation for caption numbers versus prose numbers, with page pointers in print. Keep caption markers numeric only; do not restore Photo credit labels.

**Check:** Reader can locate the right note system with no repeated caption boilerplate.

**Where:** digital128/175; output/pdf/build_book.py.

## CIN-AUD-09 · Trim editorial scaffolding and repeated closing invitations

**Priority: medium.** Capsules retain phrases such as useful starting points and belong beside acting in this account. Cinema Futures repeats organise a licensed screening/help a colleague learn in closing paragraphs94 and98.

**Recommended change:** Let verified teaching, mentorship, audience and song-making memories lead. Remove generic explanations of editorial intent and retain one stronger forward-looking closing invitation. Preserve attributed testimony; invent no scenes.

**Check:** Concrete people and work carry the transition, with fewer repetitive instructions to the reader.

**Where:** kb/research/culture/odia-cinema.md:121; kb/research/culture/odia-cinema.md:129; kb/research/culture/cinema-series/cinema-futures.md:94.

## CIN-AUD-10 · Reconcile audit receipts and remaining bilingual gaps

**Priority: medium.** Book-build receipt still says final PDF review pending and retains an older introduction-only edit scope despite current final PASS. LoveMaster and playAmariBhagaban remain English-only because original Odia spelling was not verified.

**Recommended change:** Bind receipt to the actual final independent review and accurate change scope, preserving prior events. Verify the remaining title spellings before adding Odia; don't guess.

**Check:** Current receipts agree with exact reviewed hashes; bilingual status honestly distinguishes completed and unresolved titles.

**Where:** output/pdf/book-build-data-2026-10-27.json:3319; output/pdf/book-build-data-2026-10-27.json:3324; kb/research/culture/odia-cinema.md:123; kb/research/culture/odia-cinema.md:133.

## What passed

- No newly verified numerical or award error in checked new claims; does not certify every fact in all28readings.
- All28 source hashes current; site and book manifest sequence agree.
- No duplicate IDs, missing existing fragments or missing local destinations in checked28entries; missing new H3 anchors are a separate functionality gap.
- All13numeric image-credit markers match notes and returns; attribution remains intact.
- No repeated original image identities across different article entries in staged manifest.
- Current download page counts and hashes agree; examined table panels and Odia titles render without clipping.

## Scope and limitations

Updated overview, broader series structure, generated site semantics, and current book navigation/changed sections. Not an exhaustive filmography or every-page accessibility certification.

- No public content, site code or PDFs edited by this audit.
- Prior regressionPASS did not certify narrative completeness or accessibility of every newly introduced element.
- Unique reusable portrait gaps remain for standalone profile pages.
- No publication, contact or human approval claimed.

The current digital edition is176pages and print edition196pages. Source and artifact hashes, worker scopes and the ordered action queue are preserved in the corresponding KB audit record. No public files or book artifacts were changed.

