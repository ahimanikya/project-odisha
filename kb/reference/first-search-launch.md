---
type: Search launch review
title: First search launch
status: published
---

# First search launch

Eleven existing pages are now eligible for search. The website has 122 public pages; publishing a page and approving it for search are separate decisions. The Founder approved this exact scope in POD-DEC-150. Publication mode is **limited**; deployment and live verification passed under [POD-REL-044](../records/first-search-launch-publication.json). No search service has been contacted or configured.

## Approved pages

The shortlist preserves the existing proposal. This is an editorial scope assessment using the current pages and recorded sources, not fresh verification of every historical or practical claim.

| Page | Why include it | Limits carried forward |
| --- | --- | --- |
| [Home](https://projectodisha.org/) | Introduces the project and connects the collection. | The sharing image is a labelled brand illustration. The visible tagline stays unchanged. |
| [Our purpose](https://projectodisha.org/about/) | Explains audience, contribution and editorial independence. | Describes ambitions without promising services that do not exist. |
| [Founder](https://projectodisha.org/founder/) | Identifies the human responsible for the project. | Founder-provided framing; the sharing image is not a portrait. |
| [How to use Utkal](https://projectodisha.org/how-to-use/) | Explains saving, backup, portable books and privacy. | Plans remain in the reader’s browser; this is not a booking service. |
| [Bhubaneswar](https://projectodisha.org/destinations/bhubaneswar/) | Opens the connected city and coast collection. | Current individual visits and facilities still need local confirmation. |
| [Dhauli](https://projectodisha.org/visit/places/dhauli/) | Distinguishes inscriptions, the elephant and the modern stupa. | Belief and history remain distinct; evening programmes are a separate arrangement. |
| [Konark](https://projectodisha.org/knowledge/konark/) | Provides sourced temple context and related reading. | Legends and archived festival context stay labelled. |
| [Puri](https://projectodisha.org/destinations/puri/) | Connects the shore, sacred traditions and craft villages. | Temple access and individual arrangements are not guaranteed. |
| [Raghurajpur](https://projectodisha.org/visit/places/raghurajpur/) | Helps readers approach a working craft village respectfully. | No named workshop appointment or performance has been confirmed. |
| [Chilika](https://projectodisha.org/knowledge/chilika/) | Introduces the lagoon and several ways to explore it. | Wildlife, crossings and weather are variable; stay leads are not inspected properties. |
| [Bhubaneswar Fresco archive](https://projectodisha.org/stories/bhubaneswar-fresco/) | Preserves the Founder’s dated February 2009 photographs. | Current mural survival, artist identities and exact locations remain unverified. The separate essay route is outside this edition. |

The [Bhubaneswar publication record](../records/bhubaneswar-publication.json) already includes the archive. Its presence on this list does not release the separate photographic essay or certify current street conditions.

## Metadata and navigation

The homepage description now reflects the wider collection. Chilika’s description names the lake and its actual story themes. Four search titles make the subject clear: home, Chilika, Dhauli and Raghurajpur. Visible headings and the Founder’s tagline remain unchanged.

The shortlist audit checks canonical URLs, one main heading, unique titles and descriptions, matching social metadata, local sharing images, image dimensions, internal links and fragments. All eleven pages are reachable from the homepage through the shortlisted pages. Existing photographs, creator credits and clearly described brand-image fallbacks are retained. This does not verify how Google or a social service will crop or rewrite a preview.

## Publication behaviour

The normal coastal build remains an unindexed input. A new assembly step copies that tested input to the publication artifact and applies the recorded search mode. The workflow uploads that artifact only after the existing Founder-approved publication gate.

| Mode | Page directives | Crawler file and sitemap |
| --- | --- | --- |
| preview | Every page stays noindex, nofollow. | Crawling blocked; no sitemap. This was the preparation setting. |
| limited | The eleven selected pages use index, follow; the other 111 use noindex, follow. | Crawling allowed so excluded pages’ noindex tags can be read; sitemap contains only the eleven URLs. |
| withdrawn | Every page uses noindex, follow. | Crawling stays allowed so removal instructions remain readable; sitemap removed. |

The selected routes are pinned in `projects/site/editions/search-publication.json`. Limited or withdrawn mode requires an actual approved Founder decision in the project register whose `search_routes` exactly match that list. A new page, changed shortlist, machine-generated approval label or passing test cannot silently enlarge the scope. This is a repository consistency check; the Founder’s real instruction is the authority.

Google explains why [crawlers must be able to read noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing). A [sitemap is a discovery hint](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), not a promise of indexing or ranking. These are public-page search controls, not privacy controls for public content or media.

## Activation after approval

Record the Founder’s explicit approval of these eleven routes as a decision with `search_routes`. Set publication mode to `limited` and `approval` to that decision ID; retain the exact route list. Regenerate registers and build the publication artifact. Confirm eleven indexable pages, 111 excluded pages, the same eleven canonical sitemap URLs and preserved stories, links and saved-journey data. Commit the approval and activation, then use the existing approved publication workflow.

After deployment, check the served HTML, robots.txt and sitemap.xml against the approved artifact. Search Console ownership, submission and actual indexing reports remain a separate follow-up; no account access or submission is claimed by this batch.

For a later approved withdrawal, use `withdrawn` with the original approval reference and redeploy. This removes the sitemap and restores page-level noindex while allowing crawlers to see it. Removal is not immediate. Do not restore a blocking robots file as a substitute for a readable withdrawal instruction.

## Review still open

Founder approval of this search scope is recorded in POD-DEC-150. Browser review remains blocked by the previously recorded admin-policy verification failure. No new rendered, keyboard, physical-device, screen-reader or social-platform preview check is claimed. Existing language, historical and local-condition limitations remain visible with their stories. Store, Pala and unpublished routes stay absent; personal journey and contribution pages stay excluded from search.

[Candidate evidence](../records/first-search-launch-review.json) · [Current visitor review queue](../records/visitor-review-queue.json)
