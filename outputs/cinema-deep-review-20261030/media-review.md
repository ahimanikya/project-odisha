# Cinema media audit — 30 October 2026

Read-only audit of the current local 41-reading corpus and the intro-revised PDFs. No source, asset, renderer, PDF or shared record changed.

## Result

- 41 distinct title-image originals and six additional body-image originals: 47 placements, 47 unique SHA-256 hashes. No exact reuse within or between articles.
- All 47 originals match metadata hashes; all 41 article source hashes match current metadata. All declared provenance files resolve (public assets and internal KB records have different roots).
- A 64-bit difference-hash comparison found no pair at distance 15 or less. All 47 originals were also viewed in two audit contact mosaics: no crop/resize family was identified across different articles. This is strong local evidence, not a claim to know every image’s external publication history.
- Repeated book, desk, room and screen motifs are distinct compositions. The three DAMaN-maker illustrations, two finance-related desks and two small-screen/audience scenes do not reuse the same bitmap.
- Preview cards and related-reading cards deliberately reuse their destination article’s image; these are not additional article illustrations. The approved author portrait on the back cover is an explicit retained exception, not a second article.

## Concrete findings

### P2 — avoidable sparse PDF leaves
Visually confirmed in current rendered PNGs and actual PDF text:
- Digital p.24: Basanta ends on a nearly empty page containing only “Read her work” and two links.
- Digital p.48: Akshaya ends with two continuation lines and the short collection-listening section.
- Print p.45: music article leaves only three continuation lines on a page. This is the clearest pagination defect.
- Print p.215: the timeline’s final DAMaN entry occupies a separate almost-empty leaf.
- Print p.39 is another short AIR ending flagged by text extraction (47 words including running header/footer); not independently viewed at full size in this pass.
Recommendation: bounded chapter-local grouping/spacing adjustments, preserving full image framing and all text. Do not shrink the entire book or remove evidence.

### P2 — known source-resolution limitation, not a new regression
Parbati stamp is 344×461 pixels and fills the reading width: approximately71ppi digital/74ppi print. The author-supplied portrait is approximately124/129ppi. The latter’s full-size presentation is explicitly approved. Preserve originals; the stamp could be smaller in a future individually approved layout, or replaced only with a verified higher-resolution source. No artificial detail or blanket300ppi claim.

### P3 — appendix citation typography
Print p.215 renders “Source: Chapter 33” immediately followed by superscript2. It is technically a chapter number plus a note marker, but the extraction reads332 and the visual relationship is easy to misread. A clearer source-label separator would improve interpretation. This does not indicate a broken destination.

## Credits and presentation

- All19 documentary/object caption markers are digits and resolve to ordinary source-note targets. There are no duplicate DOM IDs in any of the41 inspected article pages.
- Documentary hero metadata retains named creator/source/licence. The six body objects/photos retain their corresponding source-note credits. Author selfportrait has the approved name-only caption and internal supplied/watercolor provenance.
- Alterations are explicit for the Trupti crop, Sabyasachi’s existing MKar crop and derivative resizing. The1989 group-photo record distinguishes the credited source/uploader from an unknown actual photographer.
- Article natural sizing is scoped in `projects/site/src/components/CinemaReading.astro:64`–69; renderer supplies native dimension variables in `projects/site/src/lib/cinema-article.mjs:34`. Captions align to the figure width.
- Preview crops are separate: `ArticleReadingPath.astro:45` uses cover plus per-image focal position. They do not alter the original or the full article image.
- Both PDFs contain47 distinct original-image bindings and41 current chapter source bindings. Digital241pages SHA `c723798744e7461445266fa2a2f89df71394d189f39448de625c8a4c6a94f085`; print266pages SHA `581237c7587c0ea7e38cf3cb10dd40ce0616e92f57e8ab309d5c0b00747aad5e`. Receipt hashes match actual files.

## Full article inventory

| Article | Title source dimensions (oriented) | Kind | Content figures |
|---|---:|---|---:|
| the-question-that-brought-me-here | 600×600 | author-portrait | 1 |
| odia-cinema | 1536×1024 | illustration | 2 |
| literature-and-screen | 1536×1024 | illustration | 1 |
| basanta-kumari-patnaik | 1536×1024 | illustration | 1 |
| kalindi-charan-panigrahi | 1536×1024 | illustration | 1 |
| gopal-chhotray | 1536×1024 | illustration | 1 |
| air-cuttack | 1536×1024 | illustration | 2 |
| cinema-music | 1096×1154 | documentary | 1 |
| akshaya-mohanty | 809×1196 | documentary | 1 |
| prafulla-kar | 3264×4928 | documentary | 1 |
| pranab-patnaik | 2220×2734 | documentary | 1 |
| tapu-mishra | 3456×4608 | documentary | 1 |
| gour-prasad-ghose | 1536×1024 | illustration | 1 |
| parbati-ghose | 1536×1024 | illustration | 3 |
| sadhu-meher | 1856×1748 | documentary | 1 |
| manmohan-mahapatra | 1672×941 | illustration | 2 |
| maya-miriga | 1536×1024 | illustration | 1 |
| nirad-mohapatra | 1728×2574 | documentary | 1 |
| bhukha | 1536×1024 | illustration | 1 |
| sabyasachi-mohapatra | 1374×1697 | documentary | 1 |
| aadim-vichar | 1536×1024 | illustration | 1 |
| lavanya-preeti | 1536×1024 | illustration | 1 |
| ak-bir | 2200×1041 | documentary | 1 |
| nandita-das | 2592×3888 | documentary | 1 |
| learning-cinema-together | 1536×1024 | illustration | 1 |
| surya-deo | 6000×4000 | documentary | 1 |
| searching-for-sita-bibaha | 1536×1024 | illustration | 1 |
| who-keeps-a-film-alive | 1536×1024 | illustration | 1 |
| reading-odia-cinema | 1536×1024 | illustration | 1 |
| gourahari-das | 1128×748 | documentary | 1 |
| pratikshya | 1536×1024 | illustration | 1 |
| anupam-patnaik | 1086×1110 | documentary | 1 |
| daman | 1536×1024 | illustration | 2 |
| vishal-mourya | 1536×1024 | illustration | 1 |
| debi-prasad-lenka | 1536×1024 | illustration | 1 |
| deependra-samal | 1536×1024 | illustration | 1 |
| odia-television | 1672×941 | illustration | 1 |
| odia-ott | 1536×1024 | illustration | 1 |
| commercial-successes | 1536×1024 | illustration | 1 |
| cinema-economics | 1536×1024 | illustration | 1 |
| cinema-futures | 1536×1024 | illustration | 1 |

## Scope and verification limits

The JSON inventory contains each original path/hash, delivery path/dimensions/hash, provenance record content, route, rendered figure/caption and note target. This audit inspected original image identity at contact-sheet scale and the listed PDF risk pages. It did not perform fresh browser geometry measurements, reverify all external licences online, or visually reread every page of both PDFs. No complete new visual-PASS claim is made. Existing full-portrait preference and covers remain preserved.

Files: `media-inventory.json`, `media-pdf-risks.json`, `media-audit.py`.
