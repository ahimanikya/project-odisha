# Saptasajya integrated source review

Anvesha, 24 November 2026. **PASS for the inspected static manuscript and public wording.** No factual or source-budget correction required. This is a source review separate from Samanta’s drafting, not human approval, a field visit, a build, rendered-browser verification or publication approval.

Manuscript SHA256: `c3e46b85973db3ab035b35ae5ca3eb6f812d2da293d77ceee5432f5ff1b3a935`.

## Scope and counting

Read the frozen manuscript, image JSON, article wrapper, guide data, hills page and discovery mapping. The article contains 202 words including headings and both notes after Markdown URLs and reference markers are removed. Its title (6), description (14), card summary (9), guide title (1), eyebrow (1) and region (1) total 32. All 32 are charged to each textual source family. Empty Odia and alias fields add no words. Identical imported strings reused in discovery/cards/sharing are counted once per authored field, without treating another route as a fresh source budget.

| Family | Reproduced implementation allocation | Additional conservative charge | Final allocation |
| --- | ---: | --- | ---: |
| Dhenkanal district, both language pages combined | 143 | Entire four-word tree heading | **147** |
| Sahu et al., Taiwania 2019, article/abstract combined | 149 | Other two three-word headings | **155** |
| Commons photograph and visible attribution | 48 | All 32 title/description/card/guide/region words | **80** |

District subtotal: opening 26 + pilgrimage heading 3 + pilgrimage paragraph 33 + planning heading 3 + planning paragraph 29 + district note 17 + metadata 32 = 143. Study subtotal: entire mixed opening 26 + tree heading 4 + study paragraph 66 + note 21 + metadata 32 = 149. Photograph subtotal: alt 17 + caption 9 + creator 1 + licence 3 + changes 16 + wrapper “Photograph by” 2 = 48. Every final allocation is below the 175-word working target and 200-word ceiling. Neither copied expressive prose nor an extended quotation was found; necessary names, numbers and technical classifications are retained. No long quotation approaches the 25-word limit.

Generic navigation, contributor instructions and existing reading cards for separate destinations introduce no new source-derived Saptasajya claims. Hills and discovery reuse the guide; the hills lead has no new Saptasajya prose. Internal provenance, paths, dimensions and file hashes are not publicly rendered prose. This check does not certify a later edition blurb or a changed manuscript.

## Claim checks against originals

- **District identity, shrine and tradition:** English and Odia originals directly inspected during research; Odia directly reopened for this review. The south-of-Dhenkanal location, Raghunath shrine, Rama/Lakshmana/Sita, nearby spring and Rama Navami association are supported. The builder is explicitly attributed to the district account, without inventing a construction date. The Pandava association remains a legend, not an archaeological or historical finding. Ratnaprava in English and Ratnaprabha in Odia are transliteration variants in the original pages.
- **Approach and season:** The district identifies Dhenkanal bus stand/railway station and Bhubaneswar airport. The Odia body specifically recommends October–March. The text attributes that recommendation and makes no opening-hours, timetable, transport-availability, accessibility or safe-year-round-access guarantee. The instruction to check access is editorial planning advice.
- **Study period and scope:** Original Taiwania PDF printed p. 28 (PDF page 1) confirms 2019 publication, three sampled elevation sites, 48 species and 0.3 hectares. Printed p. 29 (PDF page 2), Study area, specifies December–March 2016–17; the article’s December 2016 to March 2017 is the correct expansion. Printed pp. 29–30 support tropical moist deciduous forest and the field design. The article correctly limits the count to plots and does not present it as a complete forest inventory or a present-day survey.
- **Sal and mango:** Printed p. 32 (PDF page 5), Table 1, and printed p. 31 results give highest importance-value index for mango in lower and middle sites (75.48 and 112.764) and sal in the upper site (102.114 in the table). “Especially prominent in the upper sample” and “prominent in the lower two” are defensible plain-language summaries of the sample-specific ecological prominence. They do not claim numerical dominance throughout the whole hill range. Table 1 and pages 28–29 were visually inspected during the bounded original research; the original PDF text was reopened for this review. Public note locators 28–29 and 32 directly cover the adopted facts.

Sources inspected, all accessed 24 November 2026:

- https://dhenkanal.odisha.gov.in/en/tourism/tourist-places/saptasajya — main description and transport sections.
- https://dhenkanal.odisha.gov.in/or/tourism/tourist-places/saptasajya — main description, final season sentence and transport sections.
- https://taiwania.ntu.edu.tw/pdf/tai.2019.64.28.pdf — bounded pages and locators above; DOI https://doi.org/10.6165/tai.2019.64.28. Local original `/private/tmp/saptasajya-sahu2019.pdf`, SHA256 `fd32df37e174638da13004c9d45b384bb55d75944789d8a3996e6104463644be`.

## Image wording and evidence

Personally viewed the actual public 1280×960 WebP: green rounded hills, low vegetation, reddish earth and pale cloudy sky match the alt. No temple, summit viewpoint, species identification or current-condition claim has been invented. The historical July 2015 caption separates the photo from present conditions.

The live Commons page open returned a cache miss in this review. I instead inspected the root-retained original Commons API response, specifically page 41418110 (not the separate staircase entry), revision 1199105449. Its creator-supplied description identifies Saptasajya Hills (North view), date 5 July 2015, Devopam, own work and CC BY-SA 4.0. These support the metadata’s narrow source-based identity/date/direction and licence; they are not independent field geolocation. Root’s acquisition and Drishti’s separate media review remain separately attributable. The wrapper renders source-linked creator credit, licence link and transformation disclosure; metadata is reused for preview imagery. Original resolution is 3264×2448; the full-frame derivative retains the observed landscape.

Photo source: https://commons.wikimedia.org/wiki/File:Saptsajya_Hills.JPG . API evidence: `outputs/saptasajya-publication-2026-11-24/media/commons-imageinfo.json`.

## Frozen evidence hashes

| File | SHA256 |
| --- | --- |
| `kb/research/places/saptasajya-article.md` | `c3e46b85973db3ab035b35ae5ca3eb6f812d2da293d77ceee5432f5ff1b3a935` |
| `kb/research/destinations/saptasajya-image.json` | `1f3a76150627c390b6d61b0a712913438ff993371fd1299733be9048e87197f7` |
| `projects/site/src/pages/destinations/saptasajya.astro` | `f0f03cb81d72b45acac2f7e91606232070fafdaf2489ec7fa1c40591123324ec` |
| `projects/site/src/data/hill-destinations.ts` | `ffae876677cfc7aa7bf6a9c92016c0ccd4ebd65afbf95e65ba59d7ed031ec6f9` |
| `projects/site/src/pages/destinations/hills.astro` | `959c2567da4caa442910d5fc1bf20280002dc04e47ccd77c543a73430939d85b` |
| `projects/site/src/data/discovery.ts` | `ae450e880d589fd7c14d1e09989e2f08e6033ead8f7126c9eac163e77c8e7c26` |
| `projects/site/src/pages/destinations/index.astro` | `ad694b40cf402acd7c19d583d43b805578b3776a034448769c14669740222988` |
| `projects/site/public/images/destinations/saptasajya-hills-devopam.webp` | `7ec87dc4bc579349d3264c7891b6f17356016c588a131147d720766442e75fa1` |
| `outputs/saptasajya-publication-2026-11-24/media/commons-imageinfo.json` | `4abb9730832ed034b7e40280c5f01519cd3ff01d9237810f5e02c76ea5786915` |

Review scope released to Disha. No canonical article, site, shared record, foreign preparation, Git state or media asset edited. Final rendered, capacity, disclosure, delivery and publication checks remain with the coordinator and separate delivery reviewer.
