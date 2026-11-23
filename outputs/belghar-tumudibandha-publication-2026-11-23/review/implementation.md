# Belghar–Tumudibandha implementation

Samanta, 23 November 2026. Base `a87b78462487a38b08c1294d58dad238654249f6`. Bounded delegated implementation; no independent or human approval claimed. Source edits complete and scopes released to Disha for build and separate review.

## Files and manuscript preservation

Nine reserved paths across manuscript and integration stages:

- `kb/research/places/belghar-tumudibandha-article.md` — drafted in the earlier manuscript-only stage; root's reviewed final text preserved byte-for-byte in this stage.
- `projects/site/src/pages/destinations/belghar-tumudibandha.astro` — new page using existing Mandasaru illustration wrapper.
- `projects/site/src/data/hill-destinations.ts` — image import and guide mapped to existing cards.
- `projects/site/src/data/discovery.ts` — generic hill collection description; guide automatically supplies its own Explore entry.
- `projects/site/tools/nimuhi-footnote-heading.mjs` — exact new manuscript path in existing visible-heading allowlist.
- `projects/site/tests/build.test.mjs` — addend179→180.
- `projects/site/tests-coast/edition.test.mjs` — discovery addend162→163.
- `projects/site/tests-coast/discovery-flow.test.mjs` — both discovery addends162→163; parameterized existing meaningful illustration/credits regression for Mandasaru and Belghar.
- This report.

Final reviewed manuscript SHA256 remains `1cd00aff53698ffbd44e58c8a319bd4e246a9481a5c9d86bb29a7eba752ccb24`. No manuscript revision during integration. Four source notes retain the original working-plan identity `balliguda-working-plan-2021-2031`. Anvesha's preceding independent text count is207words including headings/notes; source evidence and field limits remain in the research findings/review.

No edits to image/metadata files, editions, shared components/styles, hills page, canonical records, Sola or earlier chapter fragments. Root supplies the image and owns route/publication inventories. No Git mutation, server, build or publication performed.

## Public presentation and added wording

The approved1200×800 image was visually inspected locally: painterly forested hills and shaded foreground with ferns/climbers; no documentary bungalow, identifiable people or a claim of an exact viewpoint. Existing semantic figure/figcaption, intrinsic dimensions, responsive image component, eager/high-priority hero, shared reading width and Shell sharing image are reused.

Article caption renders the exact root-owned metadata plus `Illustration: Project Odisha.` and `Not a documented viewpoint.` It invents no third-party source or licence. Article, destinations directory, hills collection and Explore all receive the same image metadata. Existing `kind: illustration` behavior visibly labels both destination-card placements and Explore. Further-reading card explicitly sets `imageNote: Illustration`; Mandasaru's separate continue-reading card also has that label. Daringbadi uses its existing credited photograph. No new shared component behavior.

New subject-derived fields:

- Guide title: `Belghar–Tumudibandha` (1word).
- Wrapper eyebrow: `Kandhamal` (1).
- Guide region: `Kandhamal` (1; charged separately despite repetition).
- Guide summary: `A forest destination within Tumudibandha block.` (6; already in reviewed metadata allowance).
- Odia label blank; aliases empty. Search still receives the full guide title. No speculative spelling variants added.
- Root-owned image alt: `Landscape illustration of wooded hills and a shaded valley.` (9).
- Root-owned caption: `An interpretive landscape illustration for Belghar–Tumudibandha.` (6).
- Root-owned changes: `Not a documented viewpoint.` (4; conservatively charged although editorial qualification).

The discovery collection description is now generic: `Explore Odisha’s hill destinations through their landscapes, local histories and practical visiting information.` It makes no new Belghar claim. The hills Shell's validated generic143-character description remains untouched. No growing destination-name list was added to metadata.

## Conservative integrated source allocation

Starting from Anvesha's reviewed family bounds177forestry/OFDC,101atlas and66district, charge all22new subject/image words above to every family: **199forestry/OFDC,123atlas,88district**. This deliberately overallocates the image's interpretive and disclaimer words and repeated Kandhamal labels. Existing summary/title/description are already counted in the starting bounds. Generic credit `Illustration: Project Odisha`, navigation labels and pre-existing related-article wording are not derived from these destination sources.

Forestry has only1word remaining under this conservative accounting. Any additional root-owned discovery aliases, caption/alt changes or destination-specific hub text need integrated recount before release. No content was padded or new source claims introduced. Final independent source review remains required.

## Actual checks and remaining gates

PASS with installed Node25/packages: Astro compiler-rs parse of new wrapper; esbuild TypeScript parse of hill/discovery data; Satteri Markdown rendering with the existing footnote plugin; visible Footnotes & Sources heading and all12citation/return targets; exact manuscript SHA256; Sharp image dimensions1200×800 matching metadata; illustration kind/creator; current coast inventory contains Belghar, Daringbadi, Mandasaru and hills routes (1360total); both related-card image assets exist; updated discovery-flow test syntax check; scoped diff whitespace check.

The existing illustration regression now also tests Belghar's article caption/alt/sharing image, three incoming cards' visible labels/images, absence of empty credit links and preservation of Deomali/Daringbadi/Putsil photo credits. It is ready for root's new coast build; it was not run against stale output. This adds one test case while retaining Mandasaru coverage.

Still required: root's sequential full/coast/publication builds and suites; coast/discovery audits including metadata bounds; disclosure checks; separate source and visual/mobile/keyboard review; actual final Linux capacity below1,000,000,000bytes; deployed article/image/link verification. Baseline headroom997899bytes is not a final-package prediction. No optimization or weakened gate introduced.
