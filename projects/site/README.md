# Project Odisha website

**Discover Odisha. Imagine the possibilities.**

An Astro static website and brand review studio. This is a local review edition; its articles, refined logo and new artwork await Founder review. A manual GitHub Pages deployment workflow is prepared; there is no public submission endpoint.

## Run locally

Use Node 24 LTS (`.nvmrc`; dependency minimum 22.12) and npm 9.6.5 or later. From this directory:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4322/`. The brand choices are at `/brand-review/`. The development server binds to loopback only. With this version of Astro, `npx astro dev status`, `npx astro dev logs` and `npx astro dev stop` manage its local background server.

```sh
npm run build
npm test
npm run preview
```

Build before running the tests. The full 72-page working draft builds into `dist/`.

The focused coastal edition uses a separate validated output:

```sh
npm run build:coast
npm run test:coast
python3 -m http.server 4345 --bind 127.0.0.1 --directory dist-coast
```

It contains sixteen pages, seven searchable guides, ten saveable ideas and one starter. `editions/coast.json` defines its boundary. Build staging is validated before promotion into `dist-coast/`; failed validation preserves the last good candidate. The full draft and source assets remain available. See the [edition review](../../kb/research/product/coastal-launch-preview.md).

 Generated content, dependencies and build output are ignored by Git. `ASTRO_TELEMETRY_DISABLED=1` can be set for local commands.

## What is included

The full working draft contains destination, food, stay-area, language, literature and cultural-story collections, personal journeys and portable books, plus brand review and the preserved fresco gallery. Content clearance varies; inclusion in the full draft is not publication approval.

The coastal edition contains the five connected place stories, meal and stay-area guides, and the site pages needed to explore, plan and contribute. Browser data and correction subjects follow that same boundary. Earlier saved IDs and notes survive as unavailable items when a choice is outside the current edition.

Utkal Store stays excluded from both editions. Its separate development app remains in `projects/store/`. Research and editorial copy live in the project KB; site code, configuration and public assets live here. Local font licences and selected image credits accompany the output. The full KB, governance records and private contributor information are not published by this site build.

## Review and publication

See the [website brief](../../kb/specs/website-brand-foundation.md), [brand proposal](../../kb/reference/brand-foundation.md), [asset provenance and prompts](../../kb/records/brand-foundation-assets.json) and [verification record](../../kb/records/website-brand-checks.json).

`noindex` and `robots.txt` describe a review edition; they are not access controls. Keep deployment private until its content and publication are approved. GitHub project-path hosting will require an explicit base-path configuration or a domain-root deployment; current links assume the domain root.

Deferred: Firebase accounts/intake, photo uploads, Google Analytics, AI chat, final approval of the vector logo candidates, share-card exports and public launch. No API keys or paid services are needed to review this version locally. The domain and GitHub Pages connection are configured; the first website preview is published.

The earlier standalone preview is preserved locally. This site brings its article, pinned dependencies and useful colour/font assets into the canonical repository, then adds the collection and branding work.

## Fresco build and preservation

`tools/build-gallery.mjs` prepares gallery HTML from the explicit KB collection and maintained gallery template. The Astro route serves `/stories/bhubaneswar-fresco/` in development and builds the same static route. Originals and thumbnails are copied unchanged; checksums are in the KB import manifest. The original `Browse_Photos.html` and all 172 source images remain in the original archive. No source submission service or private inbox is imported.

[Direction 02](../../kb/reference/brand-direction-02.md) supersedes the earlier branding proposal.

## Vector candidates

Separate English/Odia, colour/one-ink/reverse SVG signatures and a simplified icon are in `public/assets/brand-v3/`. Lettering is outlined from the bundled Noto font. `python3 design/build-masters.py` regenerates these and Store artwork from checked-in path data; `design/outline-wordmarks.swift` records the macOS CoreText shaping step. See [refinement 03](../../kb/reference/brand-vector-03.md).

## GitHub Pages connection

The Founder authorized making `ahimanikya/utkal-project` public to enable Pages. GitHub Pages now uses GitHub Actions and the custom domain `utkalproject.org`. GoDaddy retains DNS management: four GitHub Pages A records and `www` pointing to `ahimanikya.github.io`. Other DNS records were preserved.

The locally updated repository-root `.github/workflows/publish-site.yml` builds and tests both website editions, then uploads only `projects/site/dist-coast`. These workflow changes are prepared locally and have not been pushed or run. The Store is not deployed by this workflow. No push-triggered publication is enabled. After the reviewed website and workflow reach `main`, the Founder can run **Publish Project Odisha** with the explicit release confirmation. The workflow checks the initiating account and main branch; the `github-pages` environment can provide additional repository-managed approval controls.

The first run succeeded on 28 September 2026: [live preview](https://utkalproject.org/) · [release evidence](../../kb/records/website-first-release.json). Editorial draft labels and `noindex` remain in this review edition; they are not access controls. DNS/certificate readiness is distinct from an actual website deployment.

## Saved journeys, sharing and final edition checks

Saved ideas can be searched locally by title, area or note. Text and photo books and the print view can omit personal notes without removing them from the saved plan or JSON backup. Portable books have day navigation; photo preparation has progress and cancellation. A plain-text itinerary is also available.

Storage saves compare the previous snapshot and react to changes from another tab. This reduces stale overwrites but is not an atomic multi-tab database. Recoverable exports stay available on a conflict or storage failure. Contribution drafts remain local until the visitor deliberately opens and submits a public GitHub issue.

Run `npm test`, `npm run build:coast`, `npm run test:coast` from this directory. From the repository root, `python3 projects/site/tools/audit-coast.py` checks all sixteen delivered pages. The scoped build validates config, relative links and fragments, resource closure, IDs and symlink boundaries before promotion. `python3 projects/site/tools/serve-review.py` serves the coastal output and local viewport harness on loopback port 4348.

[Overnight batch scope and limitations](../../kb/research/product/overnight-200.md). Native PDF pagination and editorial acceptance remain separate from successful HTML generation.

## Day planning and visit notebooks

Optional `dayNotes` are validated with the journey, included in current backups and omitted from shared books when the reader excludes personal notes. Earlier client versions may discard this new optional metadata. Notes-only days are valid; bounded day shifts and moves provide guarded undo. Copy idea preserves the source trip.

Seven original editorial visit notebooks are rendered from the KB before their guides’ onward sections and travel into the linked saved idea’s portable output. The food notebook explicitly links to Understand Mahaprasad; dish IDs remain distinct.

The route audit now defaults to `.astro/page-acceptance.json`, not historical evidence. Use `python3 projects/site/tools/audit-coast.py --output <new-evidence-file>` from the repository root to archive a specific run. `python3 projects/site/tools/serve-next-review.py` serves this batch’s local comparison on port 4349. [Scope, model and evidence](../../kb/research/product/next-210.md).

## Preparation and portable days

Optional `reminders` retain up to 40 private, editable prompts per journey. Guide questions remain canonical in the KB and are only copied into personal reminders on request. Book scope selects a validated day copy; it does not alter full backups. Sharing choices omit the private reminder list along with other personal notes.

Single-trip and collection imports offer independent import or an ideas-only merge that preserves destination data. Collection replacement requires a separate acknowledgement. Preview fingerprints detect intervening destination changes; existing storage conflict handling remains.

`python3 projects/site/tools/serve-ready-review.py` from the repository root serves the current comparison on loopback port 4350. Its dedicated `/__import-test/` route adds synthetic File controls for exercising the normal import handler; this toolbar is never part of the built website. The optional `--port` argument selects another loopback port. [Model, verification and limits](../../kb/research/product/ready-216.md).

## Frozen coastal launch review

The combined review is at `http://127.0.0.1:4353/__review/` while the local server runs. Start it with `python3 projects/site/tools/serve-launch-review.py` from the repository root. `--check` verifies the frozen candidate without serving it. The server refuses missing, changed or extra candidate files. The generated snapshot in `.release-candidates/coast-2026-09-30-rc1` is ignored by Git; its checked-in manifest and report live in `kb/records/evidence/launch-readiness-2026-09-30/`. Do not recreate it from a changed build and present it as the same review.

Review-only routes and synthetic downloaded books are outside `dist-coast`. The canonical review and release sequence are in `kb/research/product/launch-readiness-2026-09-30.md`. Native PDF pagination remains open; this does not authorise deployment.
