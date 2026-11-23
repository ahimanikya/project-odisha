# Independent article review

Reviewer: Drishti, separate task-scoped AI reviewer, 23 November 2026. This is not human or specialist archaeological approval.

Scope: `article.md` and `handoff.json`; original photograph and selected cited sources. No site build, integrated navigation, rendered implementation or publication was reviewed in this pass.

## Result

The article is suitable as an editorial review candidate. No blocking substantive error found in the cautious dating argument. Two small editorial refinements are recommended before final delivery: identify Sambit Das by name as the contemporary research lead, and shorten inventory-derived wording to retain a comfortable source-budget margin. These are recommendations, not fabricated archaeological findings.

## Checks performed

- Reopened the IGNCA four-page inventory and confirmed OR/DKL-08, its architectural fourteenth-century attribution under Ganga rule, blank precise-date field, construction description and sole bibliographic entry. The article does not treat that attribution as a dated foundation record or count the inventory and book as wholly independent corroboration.
- Reopened the OrissaPOST report dated 26 July 2020 and verified that the twelfth-century claim is attributed to Tapan Kumar Satpathy with explicit belief wording. The article accurately avoids upgrading this to proof.
- Reopened the NMA list and verified Hatuari in entry 2107 on PDF page 41. It is distinct from adjacent Kapilas entry 2106 and same-name temples elsewhere.
- Visually inspected ASI report pages 219 and 220 from the original downloaded report. Entry 111 is correctly continued in the first paragraph on page 220. The article does not absorb the opposite-column Jajpur pathway text or claim the works were completed.
- Viewed the independently sourced original Anup525 photograph. The revised opening describing the stone-faced embankment is supported; the earlier paved-courtyard wording has been removed. No current-condition inference or imagined site visit is introduced.
- Compared the article with the user-supplied Facebook text. The English narrative, structure, source comparison and conservation finding are original; the post’s speculative diagnoses, restoration prescriptions and substantial wording are not copied.
- The Post-Ganga/fourteenth-century contradiction is explicitly marked apparent, and the article does not silently substitute late Ganga or fifteenth century. Full chapter, authorship and references remain unverified.
- The traditional elder/younger relationship is attributed to contemporary discussion rather than asserted as independently established oral history. Naming the source of that research lead would improve provenance.
- Public text does not claim human review or publication. The handoff preserves the foreign publication claim.

## Source limits and recommendations

The central historical interpretation agrees with the parent’s previously verified book-page and chronology evidence. This reviewer did not independently retrieve the book page. Fresh fetches of the Ganjam gazetteer and Sircar volume failed due timeout and file-size limits respectively; their prior inspected passages remain the evidence basis for those statements.

The inventory-cited text blocks total about 237 words if every word in their mixed-source paragraphs is charged to IGNCA. Excluding the independently observed photo description, NMA statement and editorial inference brings the actual source-derived count below that conservative total and near the 200-word allowance. To remove ambiguity, shorten the technical description or inventory footnote by approximately 25–35 words; retain title, serial, compiler/reviewer, page locators and the key blank-date observation in a concise form. Direct quotation is limited to short terms; no long passage has been reproduced.

Suggested provenance sentence: “Sambit Das’s Facebook discussion, which prompted this inquiry, describes an elder-brother/younger-brother relationship between the shrines.” Do not invent a post permalink or present a profile URL as the specific post.

The independently selected photo still needs visible creator, original source, CC BY-SA 4.0 licence and alteration credit in the final page, plus a truthful date/context. Its digital derivative has not yet been reviewed here.

## Remaining delivery checks

Review the final article after edits, inspect the actual preview at desktop/mobile sizes, verify footnotes and proposed incoming links, check image provenance and dimensions, and run the required integration/build/publication gates only after ownership coordination. This review does not authorize a merge or release.

## Follow-up: prose findings resolved

Re-read the final prose after the coordinator’s changes. Sambit Das is now named as the research lead without inventing a permalink; the shortened inventory description and note retain the key evidence and remove the source-budget ambiguity. NMA PDF page 41 is now included. Both recommendations are resolved. No blocking prose findings remain. This is a pass for the reviewed text candidate only; implementation and release remain outside this pass.

Reviewed article SHA-256: `ec640ab2dd67110da519911efef3e9be4526dd4e3a1725a61b7754ac6f823b64`.

## Separate implementation review

Result: **PASS for isolated review candidate**, after resolving the manifest omission below. This is not an integrated-site, CI or publication pass.

Inspected the proposed Astro route, image metadata, shared-file integration patch, candidate manifest, standalone HTML/CSS, implementation handoff and coordinator-captured desktop/mobile screenshots. Viewed the 864px WebP derivative and compared it with the original photograph inspected earlier.

Actual independent checks:

- Candidate Markdown is byte-identical to the reviewed root article.
- Standalone HTML has no duplicate IDs and no missing local fragment targets. The seven numbered source entries and repeated inventory-reference backlinks are present. The source heading is visible through explicit CSS, despite the renderer’s inherited `sr-only` class.
- Photo credit includes Anup525, Commons source, CC BY-SA 4.0, photograph date, resizing/compression and preview-crop disclosure. Both delivered files preserve the full 3:4 image. Article and preview use explicit dimensions, responsive source choices, eager loading and high priority; shared article CSS retains width/height proportions.
- Two public assets total 177,326 bytes. The derivative remains readable at the proposed article size and retains the complete temple, Nandi, tree and embankment; it does not invent visual content.
- The illustrated History and heritage incoming link, Dhenkanal discovery region, aliases, reciprocal Kapilash related link, article contribution link and Coast route inclusion are present. Existing unrelated entries are retained. No nonexistent dedicated Dhenkanal destination route is invented.
- `git apply --check` on the integration patch passed against the inspected reference checkout. This command did not apply the patch or mutate that checkout.
- Viewed the captured 1280px desktop and 390px mobile screenshots. Title, author and full-width mobile photo have readable proportions and no visible clipping. The coordinator separately exercised footnote navigation/backlinks and measured no horizontal overflow. This reviewer did not repeat live browser interaction.
- Implementation handoff accurately distinguishes successful compiler/preview checks from deferred full build, package, CI and release checks; it does not claim deployment.

Finding resolved: the first candidate manifest omitted both WebP assets from `new_files`, risking incomplete integration. Samanta added both paths and byte/hash records for all five new files. Confirmed the corrected manifest and corresponding files.

Deferred: refresh/reconcile the shared publication base and actual ownership, run the full Astro/Coast/publication builds and required regression/disclosure checks, inspect the article in the actual site shell, measure the complete package against the hosting limit, review the final integrated candidate and verify any authorized release. The standalone reader is a faithful article preview, not evidence that the entire site passes these gates.

## Bounded amendment review: explanatory board

Result: PASS for the revised prose. Independently viewed the user-supplied photograph `codex-clipboard-d3a4d9f0-8e21-4776-980c-205061de28d4.png` and read the new paragraph and `hatuari-board` note. The visible Odia text attributes construction to the fourteenth century during Ganga rule on the basis of construction style and expresses this as an inference. The article accurately distinguishes this explanatory board from a dated foundation inscription. It preserves the unknown photographer, capture/installation dates, installing authority and relationship to the inventory, and does not count agreement as independent archaeological confirmation. No claim of ASI authorship or image-reproduction permission is introduced.

The changed `publication_authorized: true` field is consistent with the explicit user publication instruction recorded in the handoff; it is authorization, not a claim that publication has occurred. Earlier review hashes apply to their earlier versions.

Reviewed revised article SHA-256: `bf5ae710ae027fc3588f6e24cfe2c518368bce2a61757d3c0cb3f7ad2174b5af`. Integrated implementation and actual publication still require their separate checks.
