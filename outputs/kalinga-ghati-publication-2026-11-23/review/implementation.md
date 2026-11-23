# Kalinga Ghati: manuscript handoff

Current stage: website integration completed under Disha's later explicit assignment; see the final section for actual file scope, checks and remaining root-owned dependencies. Earlier sections preserve the manuscript-only handoff history.

Samanta, 23 November 2026. Input head `0d91aa8a9d18128bcbfc93ea787b621350fe0b6e`. Manuscript-only delegated assignment, not independent source/content approval or publication readiness.

## Written scope

Only `kb/research/places/kalinga-ghati-article.md` and this report written. No website, image, edition, shared-record, prior article, Kaincha preparation or original capture modifications. No Git mutation, server or build. Source originals and original media remain root/researcher-owned. The returned preparation's public-export exclusion remains root-owned and must be verified during integration; it is not claimed as implemented here.

Final manuscript SHA256: `14ca467b285fc68fde76afc16a01678a7c87a791189d7fbffb0bb5f3e58bb83a`.

Title: **Kalinga Ghati: Through the Forested Pass** (6words).

Description: **A forest pass between Ganjam and Kandhamal, with a gecko named after it and a dated road-access update.** (18words,103characters).

Proposed card summary: **A forested road between Ganjam and Kandhamal.** (7words; recommendation only, no card file written).

Body, two headings and four notes:214words under whitespace counting after replacing Markdown links with displayed labels and removing citation identifiers/formatting. Founder author field retained. Paragraph counts in order:31,4,39,30,4,26,25,16,15,16,8. This count is not a length target or independent source acceptance.

## Source use and conservative budgets

Read the complete Anvesha findings, natural-history addendum and source-review.json. Source-specific boundaries are retained: dated Ganjam-side forest account; paper's local stream-side habitat; dated IIT report; reopening reported by secondary sources rather than a directly recovered traffic order. No original-source retrieval, personal visit, interview or independent media inspection claimed in this manuscript task.

Each family below receives all31words of proposed title/description/summary, all31opening words (including original framing), its associated heading and complete note. This overallocates common geography and editorial phrasing to preserve margin:

| Family | Allocation | Total | Remaining before200 |
| --- | --- | ---: | ---: |
| Odisha Forest Department | opening31 + forest heading4 + forest paragraph39 + note15 + metadata31 |120|80|
| Mohapatra et al., Herpetozoa2025, including future figure | opening31 + forest heading4 + gecko paragraph30 + note16 + metadata31 |112|88|
| IIT Bhubaneswar | opening31 + travel heading4 + road paragraph26 + note8 + metadata31 |100|100|
| Combined reopening-news lineage | opening31 + travel heading4 + update paragraph25 + note16 + metadata31 |107|93|

The India Investment Grid source was unnecessary in this compact draft: NH157 occurs in the gecko paragraph supported by the paper, and no engineering project claim was added. No separate allowance is claimed for mirrored papers or the two news reports.

Native source IDs: `ghumsur-north-working-plan-2015-2025`, `mohapatra-2025-hemidactylus-kalinga`, `iitbbs-kalinga-warning-system-20251217`. The combined native note `kalinga-reopening-20261122` links both existing news IDs `sambad-kalinga-reopening-20261122` and `odishabytes-kalinga-reopening-20261122`; both belong to one family. Bibliographic titles and section labels are compact; no narrative quotation added.

Image caption/alt/creator/changes and actual guide title/regions/aliases/eyebrow remain unassigned. Their final words must be added to the relevant family, especially the paper's88word remaining allowance; its openly licensed status does not relax this task's editorial200word ceiling. No photographer, caption, credit or crop representation invented.

## Editorial choices and checks

The article identifies a forest pass, without inventing a resort/town identity. Forest detail is limited to the source's Ganjam portion. The2025gecko paragraph names the principal author and conveys the name/habitat connection without exclusive-range claims, wildlife-viewing directions or sightings. Road bends/fog and the two-unit project receive only26words; the dated22November2026update is followed by one short direction to check latest district information. No safety guarantee, timetable, named stopping place, trail, service, elevation, precise journey length or season window appears. Recheck the access update if publication materially slips.

PASS: actual installed Satteri Markdown rendering; all10native citation/return fragment links resolve; four note definitions cover every cited identifier; description103characters within50–250; scoped diff whitespace check. The destination's visible source-heading plugin allowance is deliberately pending website integration. No full-site, coast, package, disclosure, browser, media, capacity or live check performed.

Manuscript and report scopes released to Disha for separate source/content review. Website integration awaits explicit follow-up and finalized media metadata.

## Read-only Kaincha export-boundary diagnosis

At Disha's request, inspected only current source/configuration and the prior preparation receipt. No dedicated whole-KB public exporter or publication-status filter was found in root tools, site tools/source or the two GitHub workflows. `tools/research/reindex.py` is an internal convenience index using `tools/research/kb_io.py` and `imported-research-scope.json`; `tools/catalog.py` is a KB catalogue. Neither is a site publication selector. `projects/site/README.md` explicitly distinguishes the full KB from public site output.

Actual public content mechanisms:

- `projects/site/src/lib/reading-room.mjs` reads only `kb/records/pending-reading-room.json` entries; no recursive manuscript export.
- `projects/site/tools/select-content.mjs` selects five named legacy notes only.
- Astro pages explicitly import manuscripts/JSON; source status alone does not create a route.
- `projects/site/editions/coast.json` selects route/download scope; `tools/finalize-edition.py` retains referenced assets and removes unused staged files.
- `projects/site/tools/build-publication.mjs` copies validated `dist-coast`, then applies publication metadata/delivery transforms; it does not copy `kb/`.

Scoped searches found no Kaincha inclusion in reading-room manifest, imported-research-scope, site source, coast or responsive-image config. The original `kb/media/kaincha/golden-grass-square-box.jpg` is outside site `public/`. No selector removal or generic filter implementation is presently necessary. Preserve all source files/records, and do not reinstate obsolete exclusions for already published Sola/Binchana/brass-fish articles.

Recommended precise release checks: after the next builds, assert no Kaincha article/reading-room route, manuscript path, `golden-grass-square-box.jpg` or source-photo SHA256 `f4129296626ece7655531a234bc9783d6066706db7d97aa859fd090b8aa72761` occurs in the delivered file inventory; verify the15prepared source hashes against the returned receipt. A narrow distinctive-prose scan of emitted HTML/JSON can detect accidental inline export. This is a validation recommendation, not a completed generated-output check or permission to edit selectors. If the cross-chat phrase “dedicated public export” names an external tool/repository, its entrypoint was not found in this checkout.

## Website integration handoff

Later scope explicitly authorized by Disha. Manuscript remains byte-identical at `14ca467b285fc68fde76afc16a01678a7c87a791189d7fbffb0bb5f3e58bb83a`. Three code files changed, plus this report:

- `projects/site/src/pages/destinations/kalinga-ghati.astro` — existing landscape article wrapper, Founder byline, full-frame selected panel, native notes, existing reading-path components and article-specific update link. SHA256 `c9fc9d0ac6fd54e8647142c0f2f4df9e79cacc983aa21bd4b4d16403649779b1`.
- `projects/site/src/data/hill-destinations.ts` — image import, guide and existing collection array inclusion. SHA256 `b41aa1f99e493365f23947f7930e0a6b4b7a0d1caf8d4bbe81f475322bcbedae`.
- `projects/site/tools/nimuhi-footnote-heading.mjs` — exact manuscript path in existing visible-heading allowlist. SHA256 `8eabc73a5a3440a799b877459faa0b3b23ff0c56e6a947861a05ba8fcb68d99c`.

`discovery.ts` required no edit: its existing hillDestinationGuides map supplies the new Explore entry automatically. Existing generic collection description and all prior guide fields are preserved. Destination and hills cards also use the existing mapped data. No shared component, global stylesheet, source/photo metadata, edition, test, canonical record, Kaincha or prior article edits. No Git mutation, build, server or publication.

Inspected selected1200×777WebP visually. It is the complete selected upper panelA: woodland, partly concealed building, utility lines/pole and original A marker remain visible. No geolocation, capture-date or photographer inference added. Native figure/figcaption renders root-owned caption, linked copyright credit naming all eight authors, linked CC BY4.0 and the extraction/resizing/preview-crop statement. The neutral © prefix does not assert that all authors operated the camera. The source DOI gives access to the paper/figure. Root-owned originals and independently reviewed rights records remain unchanged.

Existing ResponsiveImage declares intrinsic dimensions, eager/high priority loading, landscape reading-column sizes and Shell sharing image. Continue reading links use Belghar's own illustration with explicit `Illustration` label and Daringbadi's existing photograph. The Kalinga photograph is not labelled an illustration. Further reading uses its own photo and the hills collection. Existing cached actual HTML/media priority, responsive and card guidance reused; no new CLI lookup or platform feature introduced.

### Added text and integrated source budget

Guide title `Kalinga Ghati`2words; eyebrow `Ganjam and Kandhamal`3; regions `Ganjam`, `Kandhamal`2; alias `Kalinga Ghat`2 =9new words. Summary is exactly the previously counted7word proposal. Odia label remains blank.

Root-owned media display fields: alt11words; caption5; full eight-author creator22; licence3; changes9 =50words. Copyright symbol charged as1additional token. This includes all source-derived visible fields, with repeated rendering of the identical strings counted once. No additional destination-specific discovery/hub sentence.

Adding all60integration/media tokens conservatively to **every** previously budgeted family produces: Forest180; paper172; IIT160; combined reopening news167. Paper-specific actual accounting is112previous +50media +9navigation +1copyright =**172**, leaving28words below200. Charging the entire photographic credit to the unrelated families deliberately overstates their derivation but still leaves room. Any further root-owned caption/alias prose needs final integrated review. No text-source quotation added.

### Bounded checks

PASS: Astro compiler-rs parses wrapper; esbuild parses hill data and unchanged discovery; Satteri rendering with current native-heading plugin displays Footnotes & Sources and resolves all10citation/return targets; manuscript hash unchanged; Sharp confirms1200×777matches image metadata; required caption/creator/source/licence/change fields present; wrapper uses neutral copyright credit; related-card image assets exist; existing Belghar/Daringbadi/hills routes are included; scoped whitespace check passes.

The initial new-route assertion reported `/destinations/kalinga-ghati/` absent while root's parallel inventory work was pending. After Disha confirmed those additions, a read-only recheck passed for the new route in both coast and portable public inventories (1361routes each), and the exact photograph path in responsive-image sources. Root owns build-count adjustments and actual suites. No stale built-output tests run.

Source edits complete and implementation scope released. Remaining gates: complete root-owned inventory/capacity work; separate final source/media/content review; sequential full/coast/publication builds/tests/audits and disclosures; generated Kaincha exclusion/hash checks; desktop/mobile/keyboard review; actual Linux capacity and live verification.
