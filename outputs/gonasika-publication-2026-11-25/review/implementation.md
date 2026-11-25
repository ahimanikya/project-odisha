# Gonasika implementation handoff — 25 November 2026

Status: source and site edits frozen; bounded checks PASS. No full build, server, Git operation or publication performed by Samanta. Root owns edition/media/register additions and subsequent build/publication checks.

## Files and resulting behavior

- `kb/research/places/gonasika-article.md`: original destination article, Founder byline, four native source notes. The two independent-review corrections distinguish the sacred account from an event name and restore the exact Environment and Social Due Diligence Report title.
- `projects/site/src/pages/destinations/gonasika.astro`: existing landscape destination wrapper, semantic full-frame figure, eager/high-priority responsive hero, linked creator/licence/modification credit and same-image sharing. Continue reading Saptasajya and Taptapani; further reading hill collection.
- `projects/site/src/data/hill-destinations.ts`: one Gonasika guide with image metadata, Kendujhar region and Guptaganga alias; three existing collection consumers supply hills, destinations and Explore previews.
- `projects/site/tools/nimuhi-footnote-heading.mjs`: one scoped path for the visible native source heading.
- `projects/site/tests/build.test.mjs`: existing full-route addend188→189.
- `projects/site/tests-coast/edition.test.mjs` and `projects/site/tests-coast/discovery-flow.test.mjs`: existing discovery addends169→170 (one and two occurrences respectively). No weakened assertions.

No shared component/global style changes. No previous article fragment intentionally altered. Root-owned media supplies the unchanged1280×960 Guptaganga photograph; it is not described as the separate Brahmeswar main temple. No Odia display spelling invented.

## Public prose and source budgets

Title: Gonasika: A Hill Source and a River’s Journey.

Description: Gonasika’s sacred source, Guptaganga shrine and the Baitarani’s journey beyond Kendujhar’s hills. (97 characters.)

Preview summary: Guptaganga, hill shrines and the Baitarani’s beginnings.

Other new labels: Gonasika; Kendujhar; Guptaganga alias. Combined new title/description/guide fields31words; no new source-dependent text in the reading links (existing guide summaries reused).

Corrected body including headings and four notes:190words. Conservative independent-review allocations, charging every heading and overlapping identity to both relevant families: district172words; DoWR124words. Both within175word working limits. Photo allocation90words when additionally charging all31metadata words, source title6 and preview credit12. Actual caption, alt, creator, licence and changes come unchanged from root's image JSON. Source review owns final independent acceptance. No verbatim passage introduced.

## Executed bounded checks

- Astro wrapper parsed with installed compiler; hill data parsed with installed esbuild: PASS.
- Installed Markdown renderer and actual footnote plugin: seven citation references, four distinct notes, seven return targets, unique IDs and all targets resolved; visible Footnotes & Sources heading: PASS.
- Actual selected image dimensions1280×960 agree with metadata: PASS.
- Description50–250 character constraint:97, PASS.
- `git diff --check`: PASS.
- Related capacity suite: nine JPEG tests PASS (see capacity-implementation.md).

Full/coast/publish fragment equality, generated incoming cards, actual payload, browser/live review and foreign preparation/export preservation remain root's subsequent gates, not claimed here.

## Guidance and limits

Reused actual cached HTML, responsive-image and card guidance at `/private/tmp/deomali-web-guidance.md` and read installed modern-web skill. Fresh official references checked25November: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img and https://web.dev/learn/design/responsive-images . Previously rejected unpinned CLI execution was not retried; no fresh CLI retrieval claimed. Existing native patterns only.

One approval-review call initially failed because workspace credits were exhausted; no edits from that failed call landed. Root resumed execution; subsequent authorized patch and checks succeeded.

## Frozen SHA256

```
bbe65edc68f4c166c95e37adc6723b283165bd1703df2d448cd725305d9af270  kb/research/places/gonasika-article.md
390e596306d5a9002ce6606443daa8e91d0175c42d244494cd65dcbed157b4be  projects/site/src/pages/destinations/gonasika.astro
b79ac7a3e3119dbb951c197ab1f050bcaee7bee67fd1303424906fea9e615cb4  projects/site/src/data/hill-destinations.ts
40e4a1f39f0dc9fdbbfd784814b0f110e218f5b473d2f1d5f767f6ea59b72018  projects/site/tools/nimuhi-footnote-heading.mjs
d912d0c2dfb33e19394504435c5e116f4cc2900e7b9b16e9e7f668b0d3f86b46  projects/site/tests/build.test.mjs
25f6080522856c6762bbf7bde30e32a0cc6accffbc546fc96ce936dd0bc2b67b  projects/site/tests-coast/edition.test.mjs
f5e0a839bf6fd78a550abe35ebc30a1b7ce9e49a29d0c8c9b05c09df3e9786ac  projects/site/tests-coast/discovery-flow.test.mjs
```

All implementation files released for root and independent review; no further edits pending.
