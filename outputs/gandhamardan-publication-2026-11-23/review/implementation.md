# Gandhamardan implementation

Samanta, 23 November 2026. Input head `af57ee13b805874a8afa32e55936fefbcd4091c3`. Bounded delegated implementation; no independent, human or specialist approval claimed. Implementation scopes released to Disha after the checks below.

## Manuscript and scope

Title: **Gandhamardan: Two Shrines and a Living Forest**. Main narrative, headings and three visible source notes total 295 whitespace-delimited words after removing Markdown link destinations and citation labels. Founder byline retained. Manuscript SHA256: `a428c192482dd725d83f2d310d06290f1ffe3054e9ff0a288d104c55c1361e58`.

Changed only these ten implementation files:

- `kb/research/places/gandhamardan-article.md`
- `projects/site/src/pages/destinations/gandhamardan.astro`
- `projects/site/src/data/hill-destinations.ts`
- `projects/site/src/pages/destinations/hills.astro`
- `projects/site/src/data/discovery.ts`
- `projects/site/tools/nimuhi-footnote-heading.mjs`
- `projects/site/tests/build.test.mjs`
- `projects/site/tests-coast/edition.test.mjs`
- `projects/site/tests-coast/discovery-flow.test.mjs`
- This report.

Earlier separately released `capacity-findings.json` remains unchanged. No optimizer, shared component, source chapter, Sola, edition, media or canonical-record edits. No Git mutation, build, server or publication performed. Source Sola draft/photo and its eleven-file preservation boundary remain root-owned; actual generated export exclusion must be checked after root builds.

## Source allocations

Read Anvesha's complete findings. No new external facts or independent source retrieval claimed. Stable manuscript IDs are `gandhamardan-bhs-notification-2023`, combined `gandhamardan-tourism` (both original Tourism pages), and existing `forest-vasundhara2001`. Root can map the combined Tourism note to `gandhamardan-tourism-harishankar` and `gandhamardan-tourism-nrusinghanath` without creating a new source lineage. Five prose references produce three notes and five return links.

Conservative public-word allocation, counting each distinct field once even where reused in page metadata/cards: declaration family **175 or fewer**; combined Tourism family **195 or fewer**; Vasundhara family **175 or fewer**; Commons photograph/credit family **75 or fewer**. No prose quotations added. The same shared metadata allowance is charged to each relevant textual family, rather than treating mirrored sources as extra budgets.

Detailed basis for independent review:

- Declaration: opening 32 words, forest heading 7, notification paragraph 34, source note 19 = 92 before shared fields. Covers Bargarh/Balangir, foothill pilgrimage, medicinal-plant significance, notification date, rounded area and BHS designation. No national-park/biosphere claim, annexure boundaries, species totals or medical effects.
- Tourism: shrine paragraph 38, planning heading 3, entire practical paragraph 59 (including original editorial advice), source note 13 = 113. Also charge the opening geography sentence (12 words) and shared fields below. No foundation date, builder, elevation, journey duration, guaranteed flow or current operating promise. The final practical recommendation does not assert a through-hill route.
- Vasundhara: dated attributed paragraph 73, forest heading 7 and note 17 = 97 before shared fields. Authors, 2001 date, Harishankar/Nandupalla, mining resistance, kendu/mahua dependence and fires remain historical. No current committee assertion or transplanted district statistics.
- Shared field allowance: title 8; description 19; wrapper eyebrow 5 excluding separator; card title/summary 11; regions 2; aliases 6; new hub lead phrase 8; new name in hub description and discovery description 2; subject terms 3. Total 64; charged conservatively to each family even where a term is editorial or only one family supports it. Thus calculated text-family upper bounds are 156, 189 and 161 respectively, rounded up above.
- Exact new metadata: description “A pilgrimage hill range across Bargarh and Balangir, with two shrine approaches and a history of forest protection.”; eyebrow “Bargarh and Balangir · Hill pilgrimage”; card summary “Two pilgrimage approaches and a history of forest protection.”; regions Bargarh/Balangir; aliases Gandhamardan Hills, Gandhamardhan, Harishankar, Harisankar, Nrusinghanath; Odia label blank. Hill lead adds “Gandhamardan across Bargarh and Balangir”; collection/discovery descriptions add its name. Root-owned search aliases require their own final budget reconciliation if expanded.
- Root-owned media fields are rendered unchanged: caption identifies western end from Paikmal side, July 2010; alt describes forested hills and reflection; Amitabh Patra, linked Commons source, CC BY-SA 3.0 and linked licence; resizing/full-frame/preview-crop terms. Photo date/location use its separate creator source, not a tourism chronology.

## Integration and validation

Reused Jirang landscape wrapper: semantic figure/figcaption, declared 960×720 dimensions, existing ResponsiveImage with eager/high priority hero, full-frame image, Shell sharing image, native expanded notes and contribution link. Existing destination mapping supplies hills, destinations and Explore previews; no duplicate asset. Mandasaru and Mahendragiri continue-reading cards use their own existing images; Mandasaru has visible `Illustration` note. The historical forest-livelihood reading-room route exists but no own-image mapping was established in this bounded inspection, so it was not given an invented card image. Prior narratives remain untouched.

Inspected selected local WebP visually: forested ridge and shore reflection, moderate source softness, preserved 2010 date stamp. This is implementation inspection, not independent media approval. Cached HTML/responsive/card guidance reused; prior rejected unpinned network CLI was not rerun or bypassed. Existing semantic baseline components unchanged.

Checks passed using installed Node 25 and existing packages:

- Astro compiler-rs parse of new article wrapper and edited hills hub.
- Esbuild TypeScript parse of hill data and discovery data.
- Actual Satteri Markdown rendering with existing footnote-heading plugin: visible Footnotes & Sources; all ten citation/return fragment targets exist.
- Sharp verifies actual selected source dimensions match 960×720 metadata; all required credit fields present.
- All four outgoing destination/hills routes occur in current coast inventory; both reading-card image files exist. Current coast route count is 1358.
- Existing count changes only: full-build constant 177→178; coast discovery constant 161→162 in three assertions across two files. No unrelated regression removed.
- Scoped `git diff --check` passed.

Not run: full/coast/publication builds, built-site test suites, browser/keyboard review, final source review, disclosure gates, Linux capacity and live verification. These remain Disha/independent-review release gates. Earlier PNG diagnosis measured potential savings only; this implementation does not claim final package capacity.
