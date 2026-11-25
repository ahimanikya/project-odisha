# Malayagiri integrated source review

Anvesha, 25 November 2026. **PASS for the corrected static manuscript and inspected public fields.** This is a separate source review of Samanta’s implementation, not human approval, field verification, specialist botanical endorsement, a build or publication verification.

Final manuscript SHA256: `138954b7d9cbf7589995927880bf04f10306c32064854aa539f44339b47b8020`.

## Correction resolved

The earlier frozen draft `4ac214bae3f058fba5eb1ea9e3eca07d209e979ce2b2573078b06eac9619e945` used “highest ecological importance”. I recommended the narrower “identified as the dominant species” because the paper explicitly describes sal as dominant using its importance-value index. Root returned edit scope to Samanta, who applied the correction. I reread and hashed the corrected file. The sentence remains limited to the sample. No further correction required.

## Actual source support

- **Mountain identity and height:** Angul district About Us identifies Malayagiri as the district’s highest point at1,187m. The article keeps district scope and never claims a state rank. Places of Interest places Khuludi waterfall near Khuludi village in the Malyagiri range/Pallahara subdivision. The article does not conflate waterfall and summit.
- **Terrain:** S.C.Sahu,N.K.Dhal&R.C.Mohanty,2012,*Tropical Ecology*53(2):163–168, printed164, describes undulating hills/valleys and lateritic hilltops versus red clay/clay-loam valley soils. The manuscript attributes this description to the study rather than inventing a personal visit. It does not claim uniform soil cover everywhere.
- **Sampling and dates:** Printed164 methods gives March2007–December2009,60tree quadrats of20×20m, totaling2.4ha. Printed163 abstract gives57tree species and sal (*Shorea robusta*) as dominant, with importance-value index44.67. The article’s dates, area and richness are correct and clearly sample-specific. No whole-range inventory, current count or visitor sighting guarantee is implied.
- **Planning:** The district visitor passage identifies Angul as reachable by bus/train and places Khuludi relative to Pallahara. The article uses broad orientation and explicitly asks readers to check final access. No current regular-bus service, trail, permit, fee, opening hour, timing, accessibility, safe swimming or preferred season is invented.
- **Photo observation:** I personally viewed the actual public1280×853 WebP. Water dividing around dark rocks and overhanging leafy branches match the manuscript observation; alt and caption fit the content. The photograph is treated as a historical contextual waterfall image, not a summit, current condition or field visit.

## Original access and citation limits

Exact adopted sources, all checked25November2026:

1. https://angul.odisha.gov.in/en/about-district/about-us — district-profile paragraph.
2. https://angul.odisha.gov.in/en/tourism/places-of-interest — Khuludi,Pallahara section.
3. https://www.researchgate.net/publication/275350100_Tree_Species_diversity_distribution_and_population_structure_in_a_tropical_dry_deciduous_forest_of_Malyagiri_Hill_Ranges_Eastern_Ghats_India — author-deposited full original text of the2012paper, printed163–164. The page attributes upload to SUDAM C.Sahu on17October2017.

Government text was retrieved from the original publishers through focused web-search indexing. Direct page opens returned502; district direct fetches failedDNS. Root independently reported the same indexed passage. I do not claim direct HTML/rendered inspection of those government pages. The paper’s original author-deposited full text was directly read; publisher/author PDF recovery failed, so no visual PDF inspection is claimed. The public paper note correctly says author-deposited text. No DOI was invented. These methods, bounded original excerpts and unadopted DSR/CGWB leads remain in `source-manifest.json`.

The district’s About Us/visitor pages and any shared DSR/CGWB physiography remain one conservative government family. No additional allowance is created for copied paragraphs or mirrors. No source-derived prose was copied from a tourism blog or Antaranga Kalinga.

## Independent word allocation

Counted whitespace-delimited visible text after removing Markdown URLs/reference markers; initials and hyphenated words are single tokens. Body, headings and all three notes total185words. Title6 +description14 +card9 +guide title1 +eyebrow1 +region1 +alias1 =33. All33 metadata words are charged to each textual family. Repeated imported card/discovery/share placements reuse the same authored fields and do not create new allowances.

| Family | Reproduced implementation allocation | Extra conservative inclusion | Final reviewed allocation |
| --- | ---: | --- | ---: |
| Angul government combined | 134 | Other heading3 +entire alt14 +preview credit11 +image title4 | **166** |
| Sahu2012 paper and mirrors | 160 | Four-word waterfall heading | **164** |
| Commons photograph and observation | 62 | Image title4 +preview credit11 +all metadata33 | **110** |

Government134 =opening33 +waterfall heading4 +planning24 +two district notes13 +metadata33 +caption10 +photo observation17. Study160 =entire mixed opening33 +hill heading3 +terrain paragraph36 +survey paragraph34 +paper note21 +metadata33. Photo62 =caption10 +alt14 +creator1 +licence3 +changes11 +wrapper attribution2 +observation17 +waterfall heading4. Extra counts deliberately include whole fields where only their location words are source-derived. All final allocations are below175 and the hard200word ceiling.

No extended quotation or copied expressive passage appears. Names, units, dates and technical soil/forest classifications are necessary factual wording. The government labels and compact bibliographic naming do not approach25words of expressive quotation per family. Generic navigation, contribution instructions and existing separate-destination reading cards contribute no new Malayagiri claim. Internal provenance/dimensions/hashes are not public prose. The guide’s alias Malyagiri is supported by both the district and paper spelling.

## Image evidence and static integration

Read `malayagiri-image.json` and root-retained Commons API response for **File:Water fall at Khuludi.JPG**. It records Rajani3737, own work,27February2014 and CC BY-SA3.0. The retained creator description identifies Khuludi; district evidence provides the range connection. No independent geolocation is asserted. The wrapper displays the creator/source link, licence link and resizing/cropping disclosure; photo metadata is attached to the guide and sharing image. The public observation and caption use February2014, not upload date. Separate Drishti media verification remains attributable to that reviewer; I verified only the stated retained evidence and actual derivative appearance in this pass.

The wrapper’s existing Saptasajya and Gandhamardan reading links use those destinations’ own images and create no implied route itinerary. Hills/discovery mappings consume the guide. No actual rendered page, responsive variants, capacity or hosted release was tested here. A later substantive edition blurb or changed public field needs its own source-budget check.

## Frozen hashes

| File | SHA256 |
| --- | --- |
| `kb/research/places/malayagiri-article.md` | `138954b7d9cbf7589995927880bf04f10306c32064854aa539f44339b47b8020` |
| `kb/research/destinations/malayagiri-image.json` | `dc90102fcc94787d87c6b14aa8b42c02f718a41e64bd97da2f899526e551e093` |
| `projects/site/src/pages/destinations/malayagiri.astro` | `c532856f37fabb710ba4839686255a56311e6f2bc84512b7fcff5f68e4f103d9` |
| `projects/site/src/data/hill-destinations.ts` | `ad78539b95a7488cf185ecddb44faf4ea23c3643083b127a5b14014da1061e68` |
| `projects/site/src/data/discovery.ts` | `ae450e880d589fd7c14d1e09989e2f08e6033ead8f7126c9eac163e77c8e7c26` |
| `projects/site/src/pages/destinations/hills.astro` | `959c2567da4caa442910d5fc1bf20280002dc04e47ccd77c543a73430939d85b` |
| `projects/site/public/images/destinations/malayagiri-khuludi-rajani3737.webp` | `802d46f8f57ba698ae2caff261c8e8628c5dd8060f01ed7e514659798aa3d4fb` |
| `outputs/malayagiri-publication-2026-11-25/media/commons-imageinfo.json` | `8b9cf6815d31e1c687acce5ae3b0181077b9393cad5d08e0a6b6e08ab63e4df7` |
| `outputs/malayagiri-publication-2026-11-25/research/source-manifest.json` | `4240b70fa2d18e375b4b56ff81d7da0eea77409a2b6478b3c631405fbf0e4014` |

Source-review scope released to Disha. Only this reserved review file written; no manuscript, shared records, site, media, preserved preparation or Git changes made.
