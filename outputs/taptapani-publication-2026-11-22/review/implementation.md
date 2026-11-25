# Taptapani implementation handoff

Samanta, 22 November 2026. Input head `b4c75736d2299e3e6e46aa27e2e77fbf53f7b3db`; task POD-EDIT-TAPTAPANI-20261122. Implementation evidence only; independent source/quality review and publication remain with the coordinator.

## Article and image

**Taptapani: A Spring in the Wooded Hills** is344 words including section headings and four visible native source notes. SHA256 of `kb/research/places/taptapani-article.md`: `8028212c7eee78c91e5c66106769e7f5147390181228e31111c6e6e1ac6e23bc`.

The article connects the perennial spring, named worship association, a clearly preliminary geological interpretation and broad visitor orientation. Regional October–March guidance is explicitly for a Brahmapur-based trip. No healing efficacy, bathing safety, chemical concentration, spring elevation, volcanic origin, temple chronology, current accommodation or service guarantee is asserted. No invented visit or testimony.

Reused the Mahendragiri/Putsil wrapper and existing components. Founder byline, one h1, full-frame eager image, intrinsic dimensions from metadata, visible Footnotes & Sources, Continue reading, Further reading and article-specific update link are retained. Continue reading connects Mahendragiri and Daringbadi. The same photograph supplies article, destination/hills/Explore preview and sharing metadata. No shared component changed.

Root resolved the initially pending photograph. I inspected the complete original `outputs/taptapani-publication-2026-11-22/media/commons-worship.jpg`: a person in orange cloth with offerings beside water and a stone-lined pool. No specific person, deity or temple is inferred from the image. The final metadata import is `kb/research/destinations/taptapani-image.json`; asset `/images/destinations/taptapani-worship.jpg`,2304×1728. The wrapper visibly credits Ilya Mauter, Commons source and CC BY3.0, with full-frame/responsive/preview changes. Root confirmed existing wrapper credit pattern is appropriate; no redundant fifth photo footnote.

## Conservative source-family allocations

Counts strip Markdown syntax and URL destinations. All52 words of title, description, destination summary, eyebrow and aliases are charged to each research family. Repeated rendering of the same field reuses that editorial copy. Mixed paragraphs are charged conservatively in full.

| Family | Allocation | Included material |
| --- | ---: | --- |
| Ganjam district |195/200| Entire opening, planning heading, gateway paragraph, district note, entire final regional-season/advice paragraph, metadata allowance and12 words for hub/discovery mentions |
| BeMC and CMO cultural identity |122/200| Shrine heading, entire shrine paragraph, combined source note and metadata allowance |
| Mukherjee–Mandal geology |183/200| Geology heading, introductory question, study paragraph, interpretation paragraph, full paper note and metadata allowance |
| Odisha Tourism |121/200| Planning heading, entire regional-season/advice paragraph, Tourism note and metadata allowance |
| Photograph provenance/visual description |60/200 allowance| All current caption, alt, creator/licence and modification text, including wrapper attribution words; no botanical or deity identification |

No direct research-source quotation. Four source IDs appear as native footnote identifiers. CMO corroboration remains within the single cultural-identity note and allocation.

## Exact changed files

1. `kb/research/places/taptapani-article.md`
2. `projects/site/src/pages/destinations/taptapani.astro`
3. `projects/site/src/data/hill-destinations.ts`
4. `projects/site/src/pages/destinations/hills.astro`
5. `projects/site/src/data/discovery.ts`
6. `projects/site/tools/nimuhi-footnote-heading.mjs`
7. `projects/site/tests/build.test.mjs` — existing addend171→172.
8. `projects/site/tests-coast/edition.test.mjs` — existing discovery addend157→158.
9. `projects/site/tests-coast/discovery-flow.test.mjs` — both existing addends157→158; illustration regression unchanged.
10. This report.

Root owns images, metadata, editions, source aliases, route/search inventory and shared records. Expected edition route count1351→1352. No optimizer changes.

## Checks performed

- Installed Astro compiler-rs successfully parsed new destination wrapper and modified hills hub.
- Installed esbuild successfully transformed both changed TypeScript data files.
- Installed Satteri rendered the manuscript with the real configured native-footnote plugin. Visible source heading present; all10 citation/return links resolve.
- Final image metadata fields and referenced public file existence checked.
- Scoped `git diff --check` passed.
- Saved HTML/responsive/card guidance reused; no rejected unpinned network command retried. Existing native figure/figcaption, image sizing and responsive components retained.
- No full/coastal/publication build, Git mutation or publication performed.

## Binchana boundary

The inherited prepared draft is preserved. `reading-room.mjs` takes only169 manifest entries; neither Binchana nor `culture/index.md` is selected, and neither appears in native_routes. `select-content.mjs` exports five fixed notes. No site route/import references the new Binchana article or media. Its3374337-byte image remains under `kb/media`, outside public assets and responsive-image inputs. Finalization retains explicit route HTML, reachable assets and declared downloads/documents, pruning everything else; publication consumes that validated artifact and retains the strict1billion-byte gate.

Read-only comparison with input head confirmed exact source preservation:

- `kb/research/culture/binchana-and-the-handmade-breeze.md`: `a1cf92097fab09c4eae2e29136bc1c22ad896aa4467ed1db8464541dc7b018f1`.
- `kb/media/binchana/binchana-from-odisha.jpg`: `12d5949655c798f7034d256b475bc282c17bb23c2401e73e35835814e651fd01`.

After rebuilding, save a targeted release check that the Binchana title/opening prose/image filename is absent from dist, dist-coast and dist-publish reader-facing HTML/JSON/MD/TXT, and no emitted asset matches the original image hash/path. Recheck retained source hashes. Current generic route checks alone cannot establish prose exclusion; no selector change or permanent future-publication prohibition is needed.

Prior Linux payload997913048 bytes leaves2086952 bytes before the new photo, responsive variants and page/index changes. Actual local and Linux package checks remain required; no capacity conclusion follows from source image size alone.

Scope released to root for source and separate integrated review. No further edits pending.
