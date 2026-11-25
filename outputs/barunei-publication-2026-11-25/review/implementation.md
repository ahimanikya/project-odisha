# Barunei implementation handoff — 25 November 2026

Source/site/capacity edits frozen and released for independent review. Samanta did not build, serve, commit, publish or modify canonical shared records. Disha owns edition inventories, image metadata/assets, research map and release gates.

## Article integration

- `kb/research/places/barunei-article.md`: adopts Anvesha's original bounded proposal with normal date spacing and stable native source IDs.198words including headings and three notes. Founder byline. Historical essay and commemorative events retain their dates;2019 remains a foundation-laying event. Travel guidance remains district-scoped.
- `projects/site/src/pages/destinations/barunei.astro`: existing Gonasika native Markdown/Shell/byline/ResponsiveImage/reading-path pattern. Full-frame1200×900 hero is eager/high priority; visible creator/source/licence/modification credit and matching sharing image. Related readings Kapilash and Saptasajya use each article's own photo. Further reading and article-specific Suggest an update remain visible.
- `projects/site/src/data/hill-destinations.ts`: one guide appended without reordering existing guides. Same selected image supplies existing hills/destinations/Explore consumers. No invented Odia spelling or new aliases.
- `projects/site/tools/nimuhi-footnote-heading.mjs`: one article-path addition for the visible native source heading.
- Existing full/coast/discovery assertions minimally updated: full addend193→194; discovery173→174 in edition test and both discovery-flow assertions. Prior Nilagiri/festival route assertions retained. No test cases added or removed.

## Exact public wording and conservative budgets

Title: Barunei: Two Goddesses and Khordha’s Past.

Description: Barunei’s shrine connects a hill landscape with Khordha’s royal history and the memory of the Paika uprising.109characters.

Card: Paired goddesses, a former royal centre and the memory of1817. (Actual card retains normal spacing before1817.) Guide title Barunei; region/eyebrow Khordha. Title6+description17+summary11+guide/region2=36metadata words.

Conservatively charge the full29word opening, all9heading words, all36metadata words and10words for the dated photo caption to every source family, in addition to its body group and note:

- Barik/Orissa Review:133words (34word body,15word note).
- President’s Secretariat/PIB:147words (48word body,15word combined note). The two releases are one family.
- Odisha Tourism:132words (36word body,12word note).

All remain within175working targets and200absolute ceilings. Selected image caption/alt/creator/licence/changes plus Photograph by total41words; even adding allmetadata36 and source title remains under100. No copied source passage introduced. These are implementation counts; separate source review is independent.

Selected root metadata: `kb/research/places/barunei-image.json`. Photo is a view FROM the hill datedAugust2009; no current scene, temple identity, crop species or visitor-access inference added. Personally inspected actual1200×900 derivative before use. Portrait/shrine alternatives not integrated.

## Approved capacity adjustment

Root and Drishti approved q90 before implementation. Only existing `assets/bhubaneswar-week/conversations.jpg` entry gains settings maximum_dimension3072/quality90. No global algorithm, ten-image allowlist or other entry changed. Same1728×3072 delivery geometry, full source frame and URL; current compression caption already accurate and unchanged. Separate sharing illustration and Mentis photograph unchanged.

Measured local current1682404B→1150046B, saving532358B. Source original4296333B remains exact; candidate SHA2568acf94aeca470d945afb8a857d67fa4c7fbda5aa4e6713dcea03da14f1715981. ICC/XMP exact, IPTC absent, orientation/density retained. EXIF matches prior delivery byte-exact; source EXIF differs due to pre-existing resizing. No lossless or whole-source-metadata claim.

New selected Barunei image package projection387018B plus prior Linux4412B headroom and saving532358B leaves149752B before HTML/other actual package changes. This is a projection, not a final gate result.

Existing Bhubaneswar regression now asserts the exact q90 override, >500000B incremental saving, unchanged EXIF against prior transform, and byte-exact unchanged q95 Mentis transform, alongside prior source/credit/caption/geometry/sharing checks. Its two new-source fixture copies use the existing APFS clone helper onmacOS and existing explicit independent-file policy elsewhere. No source copies were made for measurements; comparison images are derived artifacts. No historical snapshot was rewritten to retrofit storage policy.

## Executed checks and remaining gates

- Installed Astro parser and esbuild TypeScript parse: PASS.
- Actual Markdown renderer and source-heading plugin:4references→3notes+4returns; unique IDs and alltargets resolve; visible Footnotes & Sources: PASS.
- Selected actual image dimensions1200×900 match metadata: PASS.
- Description50–250 character bound:109, PASS.
- `node --test tests/publication-jpeg.test.mjs`:10passed,0failed (15.36seconds). Test count unchanged.
- `git diff --check`: PASS.

Full/coast/publication builds, generated three-hub previews, exact article continuity, final payload, preservation and desktop/mobile/live review remain coordinator gates. No results for those are claimed here.

## Guidance

Read installed modern-web skill and Disha's actual newly retrieved `outputs/barunei-publication-2026-11-25/web-guidance.md`: HTML semantics/figure attribution/resource priorities, responsive typography/media and cards. Existing native links and shared card behavior retained; no new components, overlays or globalCSS. Intrinsic dimensions reserve image space, full frame remains natural ratio, and off-screen cards reuse existing behavior. Storage-sharing skill read; no ordinary snapshot copies used.

## Frozen SHA256

```
27896635b7ea9b63efa3cbefee92c872028be09cbd5a6235090293f997ab02ec  kb/research/places/barunei-article.md
35fd7996a6f92d6830949b1a5faaf18c12ad02a65dcf33beb198b60ad8ff6fae  projects/site/src/pages/destinations/barunei.astro
cc3cfb45a7af945abdce229190379f2aeecd5118c41188877bec0abc34b3d870  projects/site/src/data/hill-destinations.ts
d325c1ac2de3c00d515e3b30e3d786f03887741f575362ff67b6f32237967c62  projects/site/tools/nimuhi-footnote-heading.mjs
1cd4b01181e84f5fb14bb5f4d0192098eaa9c4fb9296b3bffcef79679f9a6227  projects/site/tests/build.test.mjs
7bffab8c9db9babf893ded9377d890428a15381f7d59f57f5114632af62886cf  projects/site/tests-coast/edition.test.mjs
883bbb0238a3dff32019f4731551d684083cba1803fc7be9982288213f010f63  projects/site/tests-coast/discovery-flow.test.mjs
3e1bbf29401247146c7cfbd9d33f1e5b3ea5a23eaafadc46c5b5f12c60302109  projects/site/tools/optimize-publication-jpeg.mjs
7e2f884975aa88f4dce24cd3eeaaf5978641fbca5cab3588b5db5bbe58a4a9fb  projects/site/tests/publication-jpeg.test.mjs
```

No further edits pending; all reserved implementation files released.
