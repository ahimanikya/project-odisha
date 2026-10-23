---
type: "Editorial standard"
title: "Article authorship language and presentation"
status: "active_direction"
---

# Article authorship language and presentation

Approved by Ahimanikya Satapathy on 17 October 2026. This is the current standard for existing and future Project Odisha articles. It supersedes older instructions to hide source notes in collapsed disclosures or repeat AI production credits on each article. Original evidence, historical receipts and contributor provenance remain intact.

## Reference article

Use [Ahimanikya and Sashisena](https://projectodisha.org/stories/nimuhi-temple/) as the gold standard. These are the two characters in one article, not two separate reference pages. Its source is `research/culture/sashisena-and-nimuhi-temple.md`; its website layout is `projects/site/src/pages/stories/nimuhi-temple.astro`.

Preserve a comfortable reading column around 740px, explicit paragraph spacing of about 1.25em, body line height around 1.8–1.85, generous section separation, restrained heading hierarchy and uncropped images where the entire object matters. On small screens use comfortable side padding, readable body type and single-column images. These are reference values, not a reason to flatten a map, chart or photo essay into an unsuitable layout.

## Authorship and process

Use **By Ahimanikya Satapathy** for articles directed and owned editorially by the Founder. Preserve guest authors, coauthors, translators, photographers, quoted speakers and other contributors. Do not assign the Founder authorship of an external book, quoted poem, research paper or documentary photograph.

Explain the use of AI assistance on the shared **Our Editorial Process** page, linked from About and the footer. Do not repeat routine AI-assistant credits, internal review states or production boilerplate in each article. A byline does not assert a personal interview, visit or independent specialist review. Record actual production and review provenance in the KB. Keep a review date honest and distinct from a layout update.

## Footnotes and attribution

Use small linked numbered markers after the relevant factual passage and a visible **Footnotes & Sources** section at the end, with return links. Cite a connected claim group once when its evidence is clear. Do not add a citation to every sentence, rhetorical question or original observation prompt. Check the claim-to-source relationship; a generic bibliography alone is insufficient.

Name an author in the prose when identity is part of the meaning: quotations, distinctive arguments, disputed interpretations, reported testimony or a particular person's work. Put routine bibliographic detail and access limitations in footnotes. Preserve necessary uncertainty beside the claim; remove repetitive narration about researching, writing or not doing fieldwork. Keep exact source IDs and fuller inspection notes in the KB.

## Further reading and reader updates

Additional direction from Ahimanikya Satapathy on 19 October 2026: preserve the existing reading paths and the suggestion to update the article. Updated direction from Ahimanikya Satapathy on 23 October 2026: keep **Further reading**, **Continue reading** and **Continue your reading path** explicitly visible above the footer, with headings and links expanded by default. Do not hide these reading paths in disclosures. This supersedes the earlier collapsed presentation; **Footnotes & Sources** also stays expanded. The three connected Odia essays receive this update together through their shared reading component; other pages retain their individual review status.

Keep **Suggest an update** visible outside disclosures, with the article-specific contribution link. Preserve the notice that GitHub submissions are public and must omit private contact details and consent documents. These rules apply to future articles and to existing articles as each receives its individual editorial review; they do not mark untouched articles complete.

## Downloadable reading

Keep downloads focused on the narrative. A short source list with titles and links is enough; do not copy full website footnotes, inspection logs or research apparatus into the reading. Keep material uncertainty in the prose, photograph credits and reuse terms where needed, and a link to the website article for fuller notes. This follows the Founder’s explicit 17 October clarification.

## Human Natural language

Write about the subject. Use concrete details, familiar words and active verbs, varying sentence and paragraph length to fit the thought. Prefer explanation over adjectives and specific examples over general praise. Retain the Founder's questions, cultural corrections and perspective. Read the whole page for flow, transitions and repetition.

Remove formulaic openings, travel-brochure praise, inflated metaphors, repetitive cautionary paragraphs and mechanical concluding summaries. Do not invent scenes, dialogue, testimony, feelings, visits or sensory observations. Do not turn an uncertain origin story into a settled chronology. Natural writing is not a word-count or citation-count target.

## Human Natural illustrations

First inspect the existing image and its purpose. Preserve strong images rather than generating replacements automatically. Check local clothing, tools, architecture, gestures, materials, scale, light and perspective against evidence. Avoid generic idealised people, repeated textures, implausible symmetry and indiscriminate cinematic effects. Do not add dirt, grain or clutter as a realism filter.

Use the Human Natural Image skill when making or refining illustrations. Preserve documentary photo credits, licences and alterations. Identify realistic reconstructions, imagined folklore scenes and synthetic documentary-looking media beside the relevant material; do not pass them off as field evidence. Keep asset provenance, prompts and rights records in the KB. Captions should explain the image's role, not repeat the paragraph.

## Sequential completion loop

The canonical work list is [article editorial rollout](../records/article-editorial-rollout.json). The [readable work list](../records/article-editorial-work-list.md) is generated from it. Resume one in-progress entry; otherwise select the next queued route. Inspect its actual source, KB, current rendering and any active worker before editing. Classify utility pages and duplicates explicitly; do not add bylines to navigation cards automatically. Shared component changes must identify and test every affected route; they do not make unreviewed routes complete.

For each article: record scope and acceptance, review writing and evidence, apply layout/byline/footnotes, inspect images, update KB and site together, test meaningful behavior, inspect mobile and desktop, create a PR, wait for required checks, merge the reviewed head, publish through approved main workflow and verify the actual live page. Publish each finished article promptly after its checks pass; do not wait for the whole work list to finish. Save a receipt before marking complete. If external evidence or another worker blocks an item, record the reason and continue an independent entry. Never overwrite their work.

Completion means every baseline route is individually revised or has a justified exclusion, additional discovered article routes are reconciled, and every completed article has publication evidence. No audit, formatting correction or attribution update counts toward the separate 500 substantive-item programme. Substantive new research requires its own programme acceptance and evidence.

## New articles

Use the shared ArticleByline, ArticleFootnote and ArticleFootnotes components and article-reading stylesheet when appropriate. Markdown articles may retain native accessible footnotes. New public articles join the rollout register and must pass the same editorial acceptance before publication. Automated checks catch missing credits, broken footnote targets and production boilerplate; they cannot certify prose quality, cultural accuracy or source truth.

## Citation labels · 24 October 2026

Use numbered footnote links beside the relevant article passage. Do not display “Source 1”, “Source 2” or standalone named-source citations beneath passages. Keep bibliographic titles, credited authors and precise page/verse locators in the linked footnotes. Names that belong to the narrative remain in the prose. Accessible link labels may name the source.

## Reading-path presentation · 24 October 2026

Use the shared ArticleReadingPath component for the connected Odia essays and their further-reading links: visible section heading, unbulleted linked titles with a trailing arrow, optional short descriptions, and consistent spacing and dividers. Keep the article reading width and place the sections before the footer. Preserve destination links and meaningful distinctions between the connected sequence and supplementary reading. This component is the reusable pattern for subsequent individual article reviews; unrelated pages are not marked reviewed by this change.

Reading-path images: use the destination article’s own image beside its title and description. The three connected Odia essays have explicit image mappings. Supplementary destinations use existing article images where present. When an image is missing, add an appropriate illustration to the article and reuse it in its reading card; label it as an illustration and preserve internal provenance. Do not substitute branding. Keep the full illustration visible and provide one clearly named link per entry.

## Single public process disclosure · 24 October 2026

The Founder reaffirmed this as a mandatory site-wide rule, including existing pages: explain AI-assisted research, drafting, translation, design and image creation only on `/about/editorial-process/`, linked from About and the shared footer. Do not repeat routine production labels such as “AI-generated”, “AI-created”, “AI-assisted”, or “prepared/drafted with AI assistance” in article prose, captions, credits, alt text, sharing metadata, navigation cards or downloads. This applies to every template and future contribution, not only articles already through the editorial rollout.

Use accurate image descriptions such as “illustration”, “imagined scene”, “adaptation” or “reconstruction” where needed to avoid mistaking artwork for documentary evidence. Preserve genuine creator credits, source links, licences, alteration descriptions, quotations, material uncertainty and internal provenance, prompts and review records. Do not imply a photograph, interview or human review occurred when it did not. Substantive discussion of AI as a topic and contribution-form provenance questions are not production boilerplate. Any exception for an exact quotation or legally required credit must be narrowly documented and reviewed; never add a broad page exemption. The empty-by-default `projects/site/tools/public-disclosure-exceptions.json` accepts only an exact route, a short exact excerpt and its review reason.

Before publishing, run `node tools/check-public-disclosures.mjs dist` and the same check on `dist-coast` and `dist-publish` from `projects/site`. Both validation and publication workflows enforce this gate. It inspects generated HTML/TXT/MD and reader-facing attributes, including metadata, while excluding code and internal records. Review new PDF/EPUB, JSON exports and runtime-generated text separately; the text gate does not parse those formats. A clean scan establishes absence of the checked labels, not authorship or factual accuracy. Keep the central disclosure visible and accessible.
