---
type: "Product specification"
title: "Tourism opportunities website section"
status: "specified"
version: "0.1"
work_id: "POD-WORK-174"
---

# Tourism opportunities website section

Help people turn an interest in Odisha tourism into a well-informed next step: understand official support, explore the cultural knowledge behind a visit, or contribute practical evidence. The first section will explain and connect existing resources. Applications, bookings and provider promises require different evidence and remain outside this first release.

**Creator and accountable human:** Ahimanikya Satapathy, Founder & Editor-in-Chief. Prepared with AI assistance under the next-500 authorization. This specification completes the requirements task; it does not establish a government service, commercial offering or appointed delivery team.

## Readers and useful outcomes

| Reader | Question to answer | Useful next step |
| --- | --- | --- |
| Local entrepreneur or tourism enterprise | Which official support category might relate to my project? | Read the relevant official guidance and identify questions for its administering body. |
| Conference organiser or accompanying visitor | What cultural stories could enrich time in Odisha? | Open an existing story or flexible visit plan and save ideas independently. |
| Maker, researcher or community organisation | What information could help visitors and local livelihoods? | Suggest a sourced correction or public knowledge contribution. |
| Policymaker or volunteer researcher | Which recurring practical barriers deserve further investigation? | Read a dated evidence brief, with proposals separated from observed results. |

The section succeeds when readers reach a useful source or story and understand its limits. A click is not an application, booking, partnership or local income.

## First release and navigation

Use `/opportunities/` with the public title **Tourism opportunities in Odisha**. Introduce it through Explore and a contextual link from Our purpose. Keep the main navigation compact. Global Connections can link to it as related work after publication; neither page implies an official partnership.

| Page or section | First release content | Later extension |
| --- | --- | --- |
| `/opportunities/` | Short introduction, three reader paths, official guidance cards, selected cultural reading and a contribution link | Filters when the collection is large enough to need them |
| `#official-guidance` | Separate cards for event-related guidance and capital-project guidance | Dedicated scheme explanations after the applicable documents and amendments are reviewed |
| `#cultural-reading` | Existing Bhubaneswar, Cuttack and Puri stories and flexible plans | Locally confirmed group experiences when operating evidence permits |
| `#contribute` | Existing public GitHub Issues contribution route, prefilled with page and topic | Private intake only after approved storage and handling are established |

Do not create empty scheme detail pages, new accounts, an application wizard, subsidies calculator, booking buttons or a member directory. No new paid service or platform is needed. Existing story pages remain their own canonical records.

## Page sequence and visual treatment

Open with a short human reason to care: a visitor staying longer, a maker explaining their work, or an organiser discovering another side of a city. Use an existing licensed photograph whose caption identifies what it depicts. The image must not imply that the depicted person has joined this initiative or received a grant. A new image would follow the established Human Natural guidance and retain provenance.

Follow with three clearly named paths: **Understand official support**, **Find cultural ideas**, and **Contribute local knowledge**. Put the official guidance cards before selected reading, followed by the contribution invitation and compact source notes. Keep Nila Sagara headings and buttons, Mankada Pathara emphasis and the existing warm surfaces. Reuse shared components and generous responsive spacing.

Each guidance card answers what category it covers, who should read the official rules, which dated document supports the explanation and what action is available. Explain MICE as meetings, incentives, conferences and exhibitions on first use. Avoid numerical benefit headlines until conditions, limits, effective dates and relevant annexures have been reviewed together.

Sources can sit in an end-of-page disclosure, as elsewhere on the site. A limitation that changes the reader's next step stays beside the action. “Application route not yet verified” belongs on the card, not only in its footnotes.

## Content and evidence model

Keep canonical content in the KB, with website presentation and validation in the site project. Reuse existing source IDs, captures, entity IDs and the [experience record model](../models/tourism-experience-record.md). Do not copy private correspondence or consent documents into Git.

| Field group | Required contents |
| --- | --- |
| Identity | Stable ID, title, topic, intended reader, canonical route or anchor, linked work record |
| Explanation | Plain-language purpose, scope, conditions, explicit exclusions and next useful step |
| Documentary evidence | Source IDs, issuing body, document title, notification/version and date, exact page or clause, source URL, retrieval date and review extent |
| Application route | URL or null, provenance source, observation date, observed state and evidence for any claim that applications are accepted |
| Editorial state | Draft, ready for review, published, correction pending or withdrawn; accountable human and actual authorization reference |
| Experience state | Existing story link; separate desk, locally confirmed or trial-assessed status; dated public operating evidence where relevant |
| Media | Asset ID, subject, creator, licence, changes and appropriate caption |
| Maintenance | Last substantive review, next review trigger, unresolved questions and correction history |

Keep retrieval and review separate. A successful HTTP response establishes reachability; it does not establish eligibility, current scheme status or application acceptance. Unknown values remain null, with a useful explanation where the reader needs it. Never turn an unverified state into zero funding, closed applications or an unavailable provider.

## Rules for actions and claims

| Evidence state | Allowed presentation | Action to withhold |
| --- | --- | --- |
| Official document reviewed, current status not reconfirmed | Explain the dated version and link to the official guidance landing page | “Apply now”, current deadline and guaranteed-benefit claims |
| Application URL linked by government, workflow not inspected | Identify it as a government-linked portal in source notes, with the observed limitation | An application CTA or claim that the scheme is open |
| Public application instructions identify the scheme and current acceptance | Link to the official application route with its checked date, subject to editorial review | Claims that Utkal determines eligibility or submits on the reader's behalf |
| Cultural story with documentary sources | “Read the story” or “Save ideas”; show the existing planning limits | “Book this experience”, confirmed capacity or live prices |
| Host-confirmed experience | Describe only the dated arrangements approved for public use | A group package or future availability inferred from one confirmation |
| Trial-assessed experience with publication authorization | Publish the assessed scope and remaining conditions | A general quality certification or claim that all future visits will match the trial |
| New contradictory evidence or materially stale operating information | Flag the affected claim, remove a misleading action and link to the official source where useful | Silent continuation of a previously positive badge |

Scheme facts, experience readiness, editorial publication and search eligibility remain separate. Paying a future Collective fee cannot change any of these evidence states.

## Existing evidence and open dependencies

The starting material is the [policy opportunity brief](../research/collections/tourism-policy-opportunity.md), [5 October evidence record](../records/tourism-research-2026-10-05.json), [application-route follow-up](tourism-fieldwork/mice-follow-up.md) and [pilot desk review](../research/collections/tourism-pilot-desk-review.md). These are dated inputs, not fresh verification by this specification.

The saved record reports a complete review of the 11-page MICE notification and only selected pages of the 30-page capital-subsidy document. It traces a government link to OTIIMS but does not establish a working MICE application flow. Preserve those differences when planning the content; do not present the capital annexures as fully reviewed.

Before implementing public guidance, inspect the current official landing pages and governing documents for changes. If the application route is still unresolved, a reviewed explanation may ship with **Read official guidance** and a nearby limitation; it must not grow an “Apply” action merely because the website is ready.

WORK-166 therefore remains open for the application route and current official guidance. WORK-171 remains dependent on actual operating confirmations for timed, costed group itineraries. Neither dependency prevents completing this specification. They control which claims and actions a later website release may include. The [Founder TODO](founder-todo.md) continues to hold introductions, coordinator appointment, cash ceiling and local arrangements; this task does not reopen those requests.

## Contribution and privacy

Use the existing public contribution flow. Suggested fields are topic, page, proposed correction, public source and observation date. Show that submissions become public before sending the reader to GitHub. Do not request identity documents, banking details, guest lists, subsidy applications, personal phone numbers or private host correspondence. Readers can contribute a public reference without disclosing their relationship to its author.

A contribution is a suggestion awaiting review. It cannot create a provider listing, government endorsement, appointment or accepted policy recommendation. Reuse the existing corrections workflow rather than creating a parallel inbox.

## Accessibility and measurement

Retain semantic headings, one page title, descriptive links, visible keyboard focus and image alternatives. Render key content without JavaScript; disclosures must work by keyboard. Verify at phone, tablet and wide desktop sizes, including long scheme names and source URLs. Statuses use words, not colour alone. Empty or held categories should explain the next available reading path without showing a disabled maze.

Use the existing consent-controlled analytics setup. Measure section views and bounded interactions such as opening official guidance, opening a story or beginning a contribution. If additional events are needed, use fixed event names and approved category values; never include contribution text, query strings containing personal data, private notes or document identifiers. Report these as engagement signals, not demonstrated economic outcomes. Apply the existing cookie choice to every optional measurement.

## Acceptance and handoff

The implementation task is ready to begin with the scope above. Completion of the future website release requires the following evidence:

1. Every displayed factual claim resolves to the correct source and locator; current claims have a fresh review date and partial reviews remain explicit.
2. Event and capital support stay separate. An unknown application route produces a guidance link and a visible limitation, never an enabled application CTA.
3. Existing cultural stories and plans keep their stable IDs. Saving ideas preserves previous journeys; no unconfirmed itinerary becomes a bookable product.
4. Public contributions show the public-submission notice and omit sensitive intake. Corrections preserve previous evidence and resolve to the existing work process.
5. Desktop, tablet, phone and keyboard reviews confirm clear sequence, readable cards, working disclosures and no horizontal overflow. No-JavaScript reading remains useful.
6. Optional measurement remains off until the existing consent permits it; event payloads contain only the approved fixed fields.
7. Edition filtering, internal links and source notes pass. A new route remains outside the search shortlist until the established editorial criteria are met.
8. The implementation PR records its actual review, limitations, deployment and live verification under the applicable Founder authorization.

For the present requirements task, acceptance is the versioned specification, verified links to existing evidence, explicit dependency boundaries, a recorded self-review and a merged Git handoff. No website deployment is required for this document-only change.

## Version history

Version 0.1, 8 October 2026: initial requirements derived from the tourism pilot and existing research. The next revision should record implementation findings or new source evidence, preserving the distinction between specification, published information and operational service.

## Implementation findings · 8 October 2026

WORK191 implements the first information page using [canonical page content](../research/collections/tourism-opportunities.json). The official PDFs match the earlier inspected versions; the partial capital-document review and unverified application route remain visible. Existing photographs, reading plans and public correction flow are reused. The first release uses existing consent-controlled page views only; section and interaction events are deferred rather than widening telemetry. Search eligibility is unchanged. Publication evidence is recorded separately after deployment.
