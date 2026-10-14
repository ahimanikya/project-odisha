---
type: "Product Requirements"
title: "Utkal · Odisha product requirements"
description: "Detailed versioned product baseline with scope, audiences, stable requirements, acceptance and historical references."
tags: ["utkal", "product", "requirements", "history"]
status: "draft"
generated: {"by": "codex/gpt-6", "at": "2026-09-30T19:25:24-07:00"}
instruction_basis: "User direction, 30 September 2026: expand pages with facts, relate and classify content beyond tourism. Prior architecture retained; exact navigation and acceptance details are implementation proposals."
document_version: "0.3.0"
approval_status: "draft_not_formally_approved"
implementation_status: "not_deployed"
sources: [{"id": "architecture", "title": "Agreed technical stack", "resource": "../../technology/technical-stack.md"}, {"id": "decisions", "title": "Architecture decision register", "resource": "../../technology/decisions.md"}, {"id": "editorial", "title": "Community encyclopedia direction", "resource": "../../about/community-encyclopedia.md"}]
---

# Product requirements: Utkal · Odisha

## 1. Document control

| Field | Value |
| --- | --- |
| PRD version | 0.3.0 |
| Recorded | 30 September 2026 |
| State | Draft scope expansion; not a claim of formal approval or implemented functionality |
| Product owner | Ahimanikya, as project owner; additional editorial and programme roles unassigned |
| Working identity | Utkal · Odisha — a community encyclopedia |
| Canonical record | This OKF concept, `product/prd` |
| Historical reference | [Frozen v0.1.0](../versions/prd-0.1.0.md) and its versioned requirements data |
| Requirement source | [Machine-readable requirements register](../../references/data/product-requirements.json) |
| Related design | [Technical stack](../../technology/technical-stack.md), [diagrams](../../technology/architecture.md), [growth roadmap](../../technology/growth-roadmap.md), [decisions](../../technology/decisions.md) |

This PRD describes what the product must achieve and how completion will be evaluated. Technical design records how it may be built. Earlier suggestions remain historical context; the latest user-agreed scope governs launch. Criteria marked `implementation_proposal` are design proposals, not separately approved user instructions. All feature acceptance tests remain unexecuted.

## 2. Problem and product vision

Knowledge about Odisha is spread across official sources, research, local accounts, photographs and diaspora memories. Our own work already spans a KB, brand concepts, a photo archive and multiple planning conversations. The product must turn this into a coherent, citable and maintainable public resource while allowing people without technical skills to improve it.

Help people **discover Odisha, understand it with context, and contribute to a trustworthy shared record**. Places, history, people, living arts, food and farming, nature, everyday life, the economy and governance each offer a way into the encyclopedia. Tourism is a featured collection connecting several of these subjects. Pride and modern opportunity should grow from supported knowledge, with difficult history, uncertainty and corrections retained.

The desired progression is curiosity → understanding → useful action → contribution. Readers may enter at any point. We do not need to prove a visitor journey to serve a student seeking a source.

## 3. Goals, outcomes and boundaries

Goals: make knowledge discoverable; preserve evidence and creator credit; accept public and Git contributions; improve representation over time; and support credible learning, research and cultural connection. Tourism demand, livelihoods and economic opportunity are longer-term ambitions, not outcomes that page views alone establish.

Launch does not include a booking marketplace, payment processing, a breaking-news operation, a complete statewide census, open public editing of canonical records, automatically accepted contributions, a definitive genealogy service, a podcast or AI chat. No partnership or internship is operational merely because it appears in this plan. Paid infrastructure upgrades and private backup services remain deferred under the agreed scope.

## 4. Audiences and jobs

| Audience | Job to be done | Product response | Priority |
| --- | --- | --- | --- |
| Odisha residents and knowledge holders | Find accurate representation and contribute what is missing | Place/topic context, local credit, accessible corrections | Launch |
| Diaspora and families | Reconnect, explain Odisha and preserve memories | Cultural explanations, dated archives, contribution paths | Launch |
| Indian and international curious readers/visitors | Discover places and understand unfamiliar terms | Illustrated stories, plain language, reviewed practical context | Launch |
| Students and teachers | Learn and cite | Clear summaries, source panels, definitions and reuse terms | Supported at launch |
| Researchers, journalists and public-sector readers | Inspect evidence and compare change | Dated sources, revision identity and approved data | Supported at launch |
| Makers, artists and community organisations | Explain work and correct descriptions | Consented profiles, process accounts and attribution | Contribution audience |
| Development researchers and entrepreneurs | Investigate skills, sectors and opportunities | Comparable indicators and qualified project-stage records | Supported at launch; later depth |

These are design hypotheses based on project direction, not completed audience research. Participation should not depend on academic credentials, polished English or knowledge of Git. Launch language support must describe what has actually been reviewed; it does not promise a complete bilingual encyclopedia.

## 5. Information architecture and coverage

Proposed top-level navigation: **Subjects · Places · Odisha in Numbers · Stories · Contribute**. Food, handlooms and tourism remain featured collections within the shared subject structure. Keep search, language status, About, sources/editorial standards, credits, corrections, reuse terms and contact readily available. Global Connections can be reached through history, people and trade as it becomes ready. Programme information belongs under Contribute, with truthful availability and relationship status.

The [subject directory](../../subjects/index.md) and [classification method](../../methods/content-classification.md) define nine subject families underpinning these gateways: places/geography; history/heritage; people/languages/communities; arts/living traditions; food/farming; nature/environment; everyday life/human development; economy/livelihoods/infrastructure; governance/public life. These are coverage categories, not nine mandatory menu items or an obligation to publish empty sections.

Formats include encyclopedia entries, place profiles, person/practitioner profiles, stories/photo essays, oral histories, data explainers, recipes/process accounts, timelines, collections/journeys and individual archive items. Each should allow a quick understanding, deeper exploration and evidence inspection. Qualifications that change a claim remain beside the claim.

Geography, period, language, subject and evidence state are shared dimensions. Current boundaries must not be projected onto historical Odisha/Utkal/Kalinga automatically. One canonical item can appear in multiple gateways without duplicate content masters.

## 6. Launch scope and first complete slice

Launch with Bhubaneswar's Painted Streets as the end-to-end pilot, complemented by selected complete food and craft/place entries, plus proposed health/education and economy explainers with sources and contextual links. Those two non-tourism reading cases demonstrate breadth; they do not claim statewide coverage. A fixed page count is not the release gate. The pilot must prove reading, search, sources/credits, a guest contribution, editorial review, a Git change and publication.

The photo story preserves what the dated collection shows without inventing mural artists, exact locations or authoritative artwork titles. Invite evidence-backed identifications, clearly labelled memories and permitted photos. Existing assets and research are inputs; no blanket public-release permission is inferred from their presence in a local folder.

The launch architecture is Astro/TypeScript on GitHub Pages, a user-owned domain, public knowledge in Git and Firebase Spark for appropriate identity/private text features. Photos arrive through email or an activated/tested free relay; editors publish approved display copies manually through Git. Search replaces deferred chat. Target incremental service fees of $0 within free allowances; domain renewal, existing tools and labour are separate. This PRD does not authorise enabling billing.

## 7. Core journeys and operational states

**Discover and cite:** a reader searches or browses, opens an entry, understands its context, follows evidence, and shares/cites a stable identity. No account or analytics consent is required to read.

**Correct without Git:** a guest opens a correction form, supplies the claim/evidence and submits. The private record is created with a stable submission ID; failed saves remain visible. An editor requests detail, rejects with a private reason, or prepares a public-safe Git change. The outcome references the published revision when publication succeeds.

**Contribute photos:** a visitor selects files through the tested relay or emails them directly, including caption, credit and permission. The relay forwards to an inbox. The editor checks actual receipt and rights, prepares display copies and adds accepted material to Git. A relay confirmation, an email draft, receipt and publication are different states.

**Contribute through Git:** a contributor proposes public-safe files, automated checks run, an authorised editor reviews the content/media and the approved release is built. Public forks can propose changes; approved collaborators receive permissions, not exemption from review.

**Return as an editor:** an authenticated reviewer sees only permitted private records. Role assignment occurs through a maintainer-controlled process. Public site code or a hidden URL does not confer reviewer authority.

Editorial state model: received → triaged → needs information or accepted/rejected/withdrawn → published after a reviewed release. Preserve revision history when a published item is corrected or withdrawn; do not promise removal of previously downloaded or publicly versioned copies. Exact response-time promises remain unset until operating capacity is known.

## 8. Requirements and acceptance criteria

IDs remain stable across PRD versions. `launch` means required for the agreed initial scope; `later` means planned expansion; `deferred` means explicitly held pending readiness, a suitable free option or a new decision. Owner roles are responsibilities to assign, not named commitments. All requirements currently have implementation status **not implemented** and verification status **not tested**.

### Discovery

#### DISC-001 — Navigation and orientation

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Product/editorial

Offer a broad subject entrance alongside Places, Odisha in Numbers, Stories and Contribute; retain food, handlooms and tourism as featured collections.

Acceptance:

- A reader can reach a populated health or education page and an economy page through subjects without entering a tourism journey.
- Search, editorial standards and contribution routes remain accessible.
- Empty future collections are not presented as working destinations.

#### DISC-002 — Useful site search

**Phase:** launch · **Basis:** recorded product direction · **Responsible role:** Engineering

Search only approved public entries, with type/place/language context and a helpful no-results state.

Acceptance:

- A known pilot article and a photo caption can be found.
- A no-result query invites a contribution and does not imply the subject does not exist.
- Pending and private records never appear.

#### DISC-003 — Names and language status

**Phase:** launch · **Basis:** recorded product direction · **Responsible role:** Language/editorial

Support reviewed Odia names, aliases and historic spellings without silently equating distinct places or regions.

Acceptance:

- Pilot searches cover reviewed English and Odia names and one recorded alias.
- A missing translation is explicitly unavailable, not silently substituted as a reviewed translation.

#### DISC-004 — Connected reading

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Editorial

Connect entries across subjects using stable concept IDs and explain why each related page is useful.

Acceptance:

- The Painted Streets story links to its place and individual photos.
- A fisheries page can lead to food, exports and coastal nature with the relationship explained; association is not presented as a proved supply chain or cause.
- A health or education explainer connects to another relevant subject without implying causal evidence.
- The same canonical entry is reused across gateways without conflicting copies.

#### DISC-005 — Subject classification and dimensions

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Editorial/engineering

Classify canonical knowledge with one primary subject and optional secondary subjects, keeping format, geography, period and evidence state as separate dimensions.

Acceptance:

- All public subject IDs resolve to stable subject hubs; a record can appear in more than one collection without duplication.
- All atlas topics map to a subject, and related-reading links resolve with an explanation.
- Classification never grants publication approval or changes a source-check date.

### Content

#### CONT-001 — Entry structure

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Editorial

Provide an accessible summary, factual context, subject classification, meaningful dates, sources, explained related knowledge and a correction action.

Acceptance:

- Each pilot entry has the required public fields and no unresolved placeholder presented as a fact.
- Non-tourism pilot pages explain what their facts measure and what they cannot establish.

#### CONT-002 — Evidence and uncertainty

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Editorial

Distinguish documented facts, measured data, testimony, folklore, interpretation and announcements.

Acceptance:

- Material qualifications sit next to the claim.
- A planned project is not labelled operational and an oral account is not labelled independently verified.

#### CONT-003 — Citations and credit

**Phase:** launch · **Basis:** user direction · **Responsible role:** Editorial

Preserve Utkal collection credit and original source, photographer, translator and contributor attribution.

Acceptance:

- Readers can locate a source and the chosen public photo credit.
- Citation text includes entry identity and revision/date context.
- No human reviewer or institutional endorsement is claimed without evidence.

#### CONT-004 — Photographic archive

**Phase:** launch · **Basis:** user direction · **Responsible role:** Media/editorial

Publish a credited Painted Streets collection and approved individual display images from the existing archive.

Acceptance:

- A photo has a stable ID, contextual caption, date/location precision, credit and rights state.
- Unknown artist/location remains unknown; unrelated event photos do not appear as mural evidence.
- Private metadata and email details are excluded from display copies and public Git.

#### CONT-005 — Readable data stories

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Research/editorial

Explain public numbers across the encyclopedia with the measure, unit, period, geography, comparison basis and source.

Acceptance:

- A pilot data story makes one main takeaway readable and exposes its evidence.
- Health/education and economy reading cases provide concise interpretation and contextual links, with detailed tables available as evidence.
- Downloadable values preserve estimate/provisional labels and do not mix incomparable periods.

#### CONT-006 — Content freshness

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Editorial

Track source-check, editorial-review and publication dates separately; specify a review trigger for changing information.

Acceptance:

- Time-sensitive pilot notes carry a dated check or an explicit not-reconfirmed label.
- A machine check does not populate a human-review badge.

### Contribution

#### CONTR-001 — Guest text proposals

**Phase:** launch · **Basis:** user direction · **Responsible role:** Engineering

Accept corrections or knowledge proposals without requiring a GitHub account.

Acceptance:

- A guest can submit permitted text fields through the site and receive success only after the save is confirmed.
- Failed or denied saves are visible; retries do not silently create duplicate records.

#### CONTR-002 — Photo contribution path

**Phase:** launch · **Basis:** user direction · **Responsible role:** Engineering/editorial

Receive photographs in the editorial inbox; offer a free relay only after it is activated and tested.

Acceptance:

- A permitted sample reaches the inbox with caption and credit; otherwise expose direct email as the launch path.
- The form discloses forwarding and publication review; relay acceptance is not described as publication or guaranteed inbox delivery.
- Oversize/failure states offer an email fallback; opening an email draft never produces a sent confirmation.

#### CONTR-003 — Git contribution route

**Phase:** launch · **Basis:** user direction · **Responsible role:** Maintainer

Provide contribution guidance and a reviewed Git change route, with maintainer permissions reserved for approved collaborators.

Acceptance:

- A sample public-safe change passes through checks and review before publication.
- The guide explains that public forks may propose changes without collaborator status.
- Untrusted checks cannot access deployment credentials.

#### CONTR-004 — Editorial queue

**Phase:** launch · **Basis:** recorded product direction · **Responsible role:** Editorial

Track received, triaged, needs-information, accepted, published, rejected and withdrawn outcomes through an appropriate private record.

Acceptance:

- A test correction can be traced from its intake record to the published concept/revision.
- The inbox is the photo queue; the UI never claims automatic inbox/Firestore synchronisation.
- Accepted does not mean published; rejected material is not sent to public Git.

#### CONTR-005 — Publication permission

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Editorial

Record contributor-selected credit and permission before publishing submitted material.

Acceptance:

- An editor can locate permission and credit for each accepted submission.
- A missing right/permission blocks publication without requiring contact/consent text to be public.

#### CONTR-006 — Corrections and withdrawal requests

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Editorial

Provide a contact route for corrections, credit changes and withdrawal requests, with documented handling.

Acceptance:

- A correction is recorded against the stable entry ID and material changes have a public revision note.
- Withdrawal handling explains that previously public Git history and third-party copies may persist; do not promise complete erasure.

### Publication

#### PUB-001 — Explicit publication approval

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Editorial/engineering

Approve the exact public content and media revision; research lifecycle status is insufficient.

Acceptance:

- A content change invalidates its earlier approval.
- A source or media dependency change identifies affected publication approvals.
- Unapproved or blocked items cannot enter a release.

#### PUB-002 — One canonical knowledge collection

**Phase:** launch · **Basis:** user direction · **Responsible role:** Maintainer

Keep the existing OKF concept paths and source records authoritative; generate pages and public tables from them.

Acceptance:

- One source update yields consistent public outputs.
- Generated JSON/SQLite is reproducible from the reviewed source and is not separately hand-maintained.

#### PUB-003 — Private-data exclusion

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Engineering

Exclude private contacts, raw proposals, consent and credentials from public Git history and every public export.

Acceptance:

- Fixtures representing private/draft data are absent from pages, search, downloads, previews and build logs.
- Publication checks inspect the selected repository scope as well as the final website artifact.

#### PUB-004 — Release identity and rollback

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Maintainer

Publish a complete build with source revision and schema identity; retain a known-good public release.

Acceptance:

- A failed build leaves the prior release available.
- Rollback restores a known public release and its matching data/search assets.
- Renamed entry IDs resolve through explicit redirects or retirement records.

### Privacy and access

#### SEC-001 — Enforced roles

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Engineering

Use Firebase Authentication and Security Rules to restrict user and reviewer data access.

Acceptance:

- A guest cannot self-approve, grant roles, read another private record or overwrite an approved public record.
- Rules tests cover unauthenticated, contributor and reviewer cases.
- Public client code holds no privileged write or model credential.

#### SEC-002 — Data minimisation

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Product/editorial

Collect only fields needed for review and explain access, use and retention.

Acceptance:

- Contact/permission fields have a defined private destination.
- Review interfaces avoid raw submission content in telemetry or URLs.
- No living-family/DNA collection is implied by a generic photo or correction form.

#### SEC-003 — Honest failure states

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Engineering

Preserve public reading during private service failure and state clearly when a save or send failed.

Acceptance:

- With Firebase or the relay unavailable, static pages/search still work.
- The contributor receives a retry or alternate-route instruction rather than a false success.

### Usability

#### UX-001 — Mobile and keyboard access

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Design/engineering

Make primary reading, search and contribution journeys usable on small screens and by keyboard.

Acceptance:

- Representative pages at a 360px viewport and enlarged text keep essential controls usable without clipped content.
- Forms have labels, visible focus and accessible error messages; informative photos have meaningful alternative text.
- A keyboard-only tester completes search and a correction journey.

#### UX-002 — Lightweight public reading

**Phase:** launch · **Basis:** implementation proposal · **Responsible role:** Engineering

Deliver static pages and load optimised images and interactive code only as needed.

Acceptance:

- Ordinary reading/search does not require a Firestore read for each entry.
- Measure pilot page transfer and mobile performance; document image/code reductions before release.
- Avoid automatic loading of full photo originals across the gallery.

### Measurement

#### MEAS-001 — Consent-aware GA4

**Phase:** launch · **Basis:** user direction · **Responsible role:** Engineering/product

Measure approved public interactions only after affirmative analytics consent.

Acceptance:

- Declining analytics permits reading and contributions and sends no GA requests.
- Accepted-consent tests show one intended event per action with safe parameters.
- Raw searches, emails, family narratives, submission text and private record IDs do not enter GA4.

#### MEAS-002 — Outcome and editorial measures

**Phase:** launch · **Basis:** recorded product direction · **Responsible role:** Product/editorial

Measure useful discovery, source use, corrections, coverage and contribution outcomes without equating traffic to impact.

Acceptance:

- The measurement register defines each metric and its evidence source.
- Relay acceptance, inbox receipt, editorial acceptance and publication are separate counts.
- Targets remain proposed until a real baseline is measured.

### Operations

#### OPS-001 — Domain and static hosting

**Phase:** launch · **Basis:** user direction · **Responsible role:** Maintainer

Use GitHub Pages with the user-owned domain and HTTPS.

Acceptance:

- Both chosen domain variants resolve as intended, canonical redirect and HTTPS work, and key deep links survive reload.
- Domain ownership and renewal responsibility are recorded privately.

#### OPS-002 — Free launch services

**Phase:** launch · **Basis:** user direction · **Responsible role:** Maintainer

Stay on Spark and free public hosting/relay allowances; do not enable Blaze or paid AI/backup services for launch.

Acceptance:

- A launch checklist records active products and confirms no paid feature is required by the delivered flows.
- Quota exhaustion behaviour is documented and tested where practical.
- The budget explicitly excludes domain renewal and existing tools/labour; $0 is conditional on free allowances.

#### OPS-003 — Knowledge maintenance

**Phase:** launch · **Basis:** existing project policy · **Responsible role:** Research/maintainer

Reuse the existing KB validators and weekly data-editor process when its remote integration is ready.

Acceptance:

- A representative update passes structure/source checks and follows publication approval rules.
- No duplicate scheduled editor is created.
- A source refresh does not overwrite historical observations without a documented revision.

### Product governance

#### HIST-001 — Versioned PRD history

**Phase:** launch · **Basis:** user direction · **Responsible role:** Product/maintainer

Maintain a current PRD, stable requirement IDs, frozen baselines and an append-only revision register.

Acceptance:

- The initial snapshot and its requirements snapshot match stored checksums.
- A later change records IDs, rationale, decision basis, scope and approval status without overwriting older baselines.
- Every release can identify the PRD baseline it implements.

### Future

#### GROW-001 — Heritage and global connections atlas

**Phase:** later · **Basis:** user direction · **Responsible role:** Research/editorial

Publish source-qualified historical migration, language, trade, religion, material-culture and diaspora connections.

Acceptance:

- Each connection exposes subject, relationship, place/period, source and evidence assessment.
- Similarity is not labelled descent or influence; historical boundaries are dated.
- Maps draw routes only when evidence supports routes.

#### GROW-002 — Consented family histories

**Phase:** deferred · **Basis:** user direction · **Responsible role:** Research/editorial

Offer opt-in family/migration intake only after consent, private handling and review are ready.

Acceptance:

- Participants control permitted public credit and publication scope.
- No ancestry, caste, ethnicity or religion is inferred from surnames; no DNA intake is introduced.
- Private evidence stays outside public exports and AI retrieval.

#### GROW-003 — Ask Utkal

**Phase:** deferred · **Basis:** user direction · **Responsible role:** Engineering/editorial

Answer from the approved KB with Utkal and original-source credit, only after a viable free option or agreed budget.

Acceptance:

- Answerable evaluation cases cite supporting retrieved passages and carry release identity.
- Missing/disputed evidence produces qualification or abstention.
- No private-data leaks or invented citations; evaluate English and Odia with appropriate review.

#### GROW-004 — Research internships

**Phase:** later · **Basis:** user direction · **Responsible role:** Programme lead

Develop supervised learning opportunities with defined research assignments and credited outputs.

Acceptance:

- A named supervisor, learning outcomes, work arrangement, funding and host/programme eligibility are resolved before recruitment.
- No academic credit, placement, compensation or university affiliation is advertised without actual arrangements.

#### GROW-005 — Institutional relationships

**Phase:** later · **Basis:** user direction · **Responsible role:** Programme lead

Track candidate cultural, academic, archive and diaspora relationships and agreed activities.

Acceptance:

- Candidate, contacted, pilot-agreed and active statuses are distinct.
- Public partnership claims require an agreement; private contacts remain private.
- Outreach is sent only under explicit authorisation.

#### GROW-006 — Managed photo intake and automation

**Phase:** deferred · **Basis:** user direction · **Responsible role:** Maintainer

Consider Blaze uploads/functions when observed manual burden or reliability problems justify it.

Acceptance:

- An acceptable cost decision precedes enabling billing.
- Save receipts, retry handling, access and reviewed Git export pass tests.
- Email migration preserves consent, attribution and submission identity.

#### GROW-007 — Independent private recovery

**Phase:** deferred · **Basis:** user direction · **Responsible role:** Maintainer

Revisit private backups when a suitable free option or a revised budget is established.

Acceptance:

- Recovery scope includes records, identity configuration and files as applicable.
- A protected independent copy is actually restored in a test before a recovery promise is made.
- Current launch materials do not imply Git backs up Firebase or inbox contents.

#### GROW-008 — Broader language and geographic coverage

**Phase:** later · **Basis:** recorded product direction · **Responsible role:** Editorial/language

Expand districts, communities and reviewed language editions using a transparent coverage matrix.

Acceptance:

- Coverage records distinguish missing, researching, reviewing, published and overdue.
- A missing record is described as a collection gap rather than cultural absence.
- Translated material retains its own provenance and review state.

#### GROW-009 — Personal collections

**Phase:** later · **Basis:** implementation proposal · **Responsible role:** Engineering

Offer optional saved entries and preferences when user need justifies accounts.

Acceptance:

- A saved item references a stable concept ID, survives authorised sign-in and resolves renamed/retired entries clearly.
- Public reading never requires registration.


## 9. Data and privacy requirements

The KB owns approved concepts, claims, sources, names, places, media metadata, rights/public credit and relationship records. Private working stores own contacts, raw submissions, consent, user preferences and permissions. Public data is readable in full if downloaded; a hidden UI field is not private storage.

Keep stable IDs, language, timestamps and source relationships. A source-check timestamp differs from editorial approval. A publication decision references the precise content/media revision. A derived data table retains its input definitions, period and calculation basis. Translation review is language-specific. Withdrawal/correction must update affected exports and search assets as well as visible pages.

Use only necessary private fields. Photo intake must not become an accidental family-identity collection. Living-family histories remain a future programme with an explicit purpose, consent and access design. Sensitive contacts and private lineage claims never become public just because their submission is useful to research.

## 10. Measurement and success

Establish a baseline after launch before setting growth targets. Proposed operating review cadence is monthly; this is a planning practice, not a newly scheduled automation.

| Outcome | Measure and definition | Evidence source | Interpretation limit |
| --- | --- | --- | --- |
| Findability | Completion of named-entry, source and photo-credit tasks | Observed usability tasks | Traffic does not prove comprehension |
| Trust | Published entries with complete required sources/credits; correction turnaround | Publication metadata and private editorial queue | Automated checks do not prove historical truth |
| Contribution | Received, accepted and published counts; oldest pending age | Confirmed Firestore saves and editorial inbox records | Relay acceptance is not inbox receipt |
| Coverage | District × subject × language states and overdue reviews | KB coverage register | A missing entry does not imply a community lacks history |
| Usefulness | Source/citation actions and attributed reuse | Consented safe events; verified external citation links | Downloads are not endorsement |
| Sustainability | Manual review effort, failures and quota pressure | Aggregate operations records | Free service today is not guaranteed future capacity |

GA4 is a consented supporting signal; editorial outcomes use their own records. Private review and application pages are excluded. Disable automatic raw search/form collection. Do not collect sensitive data through custom event parameters or URLs.

## 11. Release acceptance

Launch acceptance requires all `launch` requirements to be tested or an explicit documented scope exception. A free relay is optional if the direct-email path works; photo contribution itself remains supported. A test case is not passed merely because its design is written here.

A reviewer should demonstrate: find the pilot story; identify a photo's credit/date; locate an original source; understand a statistical period/unit; submit a correction without GitHub; send a permitted photo through the selected path; publish one accepted contribution through Git; reject an unauthorised private read/write; decline analytics without losing functionality; and roll back a public release. Record actual results and responsible reviewers when this occurs.

The UI must state missing translation, unavailable submissions and evidence gaps honestly. No public release may contain confidential records or unapproved media. The domain, inbox, repository rules, Firebase permissions and GA4 property must be configured and verified for the features actually enabled. AI and private-backup restoration are not launch gates while those services are deferred.

## 12. Growth sequencing and upgrade gates

Follow the [technical growth roadmap](../../technology/growth-roadmap.md). Begin with a useful collection and manual editorial flow. Expand editorial capacity and regional/language coverage before adding infrastructure merely for anticipated scale.

Revisit managed uploads and automation when lost attachments, submission limits or manual burden are measured. Revisit cited AI when search leaves recurring questions unanswered and a viable free integration or revised budget exists. Revisit private recovery when a suitable free export is established or operations require a recovery commitment. Preserve Git/OKF as the public knowledge source across upgrades.

The Heritage & Global Connections Atlas is the public umbrella; the Utkal Lineage & Migration Index is a subset. Investigate movement into and out of Odisha, languages, trade, belief/learning, living culture, objects abroad and contemporary diaspora, with evidence-qualified relationships. Do not treat similarity, commemoration, institutional membership or a surname as proof of lineage or continuous influence.

Internships should offer supervised, bounded research and learning, with local contributors and international students able to participate. Partner relationships should begin with concrete mutually useful work. No academic programme, organisation or cultural body is an agreed partner merely because it is a candidate. Outreach and recruitment require actual arrangements and explicit authorisation.

## 13. Dependencies, ownership and open decisions

| Dependency/open decision | Accountable role | Launch effect |
| --- | --- | --- |
| Final repository name/public selection and maintainer access | Project owner/maintainer | Needed before remote contribution and deployment |
| Domain and canonical hostname | Project owner | Needed for custom-domain launch; renewal remains owner responsibility |
| Editorial inbox and relay activation if used | Project owner/editor | Needed for a working photo path |
| Firebase project, authorised origins and role/rules configuration | Maintainer | Needed for enabled private text/account features |
| Licences and submitted-media permissions | Owner/editor | Required before public distribution |
| Named content, language and specialist reviewers | Product/editorial | Determines which entries can be responsibly released |
| GA4 property and event/consent verification | Owner/engineering | Needed before enabling measurement |
| Private record retention and withdrawal handling | Owner/editorial | Must be documented for active intake; backup service is still deferred |
| Internship supervision, funding and programme fit | Future programme lead | Blocks recruitment, not encyclopedia launch |
| Partner agreements | Future programme lead | Blocks public partner claims, not encyclopedia launch |

Ahimanikya is the known project owner. Additional roles remain unassigned. AI can assist implementation, drafting and validation but does not count as a human editor or community witness.

## 14. Risks and product responses

| Risk | Product response |
| --- | --- |
| Historical pride becomes unsupported influence or ancestry claims | Evidence classes, precise relations, uncertainty and specialist/community review |
| Private material reaches public Git or generated data | Publication allowlist, review and tests across all outputs and repository history scope |
| Free intake service loses attachments or changes limits | Confirm receipt, test delivery and retain direct email fallback |
| Manual review cannot keep up | Measure queue age and work, then consider roles/templates and a justified upgrade |
| Firebase quotas interrupt contributions | Public site remains independent; show failures and explain retries/alternatives |
| Private data is lost without independent backups | State the current limitation; define a future tested recovery track without claiming existing protection |
| Translation or accessibility limits exclude contributors | Honest language status, reviewed aliases and task-based usability checks |
| A proposed partnership appears endorsed | Explicit candidate/agreed states and documented permission for public claims |
| Scope grows faster than editorial capacity | Use staged requirements and review gates, not feature count or empty menu sections |

## 15. Historical record and maintenance

Preserve [v0.1.0](../versions/prd-0.1.0.md) as the first written PRD baseline, even though it remains draft. Its requirements snapshot is frozen separately. Subsequent material changes create a new version, record changed/added/retired IDs and rationale, and update the current pointer. Never recycle a requirement ID or silently relabel a deferred feature as launch scope.

The [history](../prd-history.md) records the sequence leading to this baseline; the [maintenance procedure](../prd-maintenance.md) defines future changes. There were no earlier formal PRD versions—earlier architecture proposals are not backdated into invented PRD approvals. Preserve approval state separately from completion and public release.

The [version register](../../references/data/prd-version-register.json) stores snapshot checksums. Checksums detect changes; enforcement remains a repository/workflow responsibility. Once the Git remote exists, use actual commits/tags for stronger historical references rather than inventing commit IDs now. Release notes should cite the PRD version implemented and any explicit exceptions.

## 16. Basis and references

This is a synthesis of the user's conversation and the existing local planning/OKF material, not new independent research or a newly verified pricing quote. The product/audience, information architecture, atlas, internship and analytics proposals were consulted from the Odisha Tourism planning workspace. Current launch decisions supersede earlier alternatives.

Durable reference points: [community encyclopedia](../../about/community-encyclopedia.md), [tourism-first audience strategy](../../about/tourism-first-strategy.md), [research method](../../about/research-method.md), [website readiness](../../about/website-readiness.md), [statistics storytelling](../../about/statistics-storytelling.md), [architecture decisions](../../technology/decisions.md) and [growth roadmap](../../technology/growth-roadmap.md).


## Name correction · 1 October 2026

The user confirmed **Utkal**, correcting earlier Utkala wording. Version 0.2.1 updates the name only; requirement IDs, behaviour and approval states remain unchanged. Earlier snapshots retain their original text.

## 17. District entrepreneurship · version 0.3.0

The user requested district/locality business research and downloadable starter plans on 2 October 2026. The [programme](../district-business-opportunities.md) adds this direction; acceptance details and pilot selection remain proposed. This is a research and future product scope extension, not a declaration that the existing website lacks already released features. Current implementation records remain authoritative. Reuse repository-native destination and tour-book models; no paid service or private backend is introduced.

#### ENT-001 — District opportunity discovery

**Phase:** later · **Basis:** user direction; acceptance details proposed · **Responsible role:** Research/product

Provide place-linked business opportunities across districts and sectors for local and outside entrepreneurs.

Acceptance:

- Each opportunity references canonical place/sector records and distinguishes assets from validated demand.
- District coverage shows unknown and unresearched fields; no unsupported best-district ranking.

#### ENT-002 — Actionable business dossiers

**Phase:** later · **Basis:** user direction; acceptance details proposed · **Responsible role:** Research/product

Connect demand, regulations, premises, people, support and economics for a specified business model.

Acceptance:

- Permissions retain applicability, original rules/amendments, authority and check dates; unresolved rules stay visible.
- Land listings, workforce directories and schemes do not imply availability, consent, title or eligibility.
- Financial scenarios preserve dated quotes, assumptions, working capital and downside results.

#### ENT-003 — Portable personal project books

**Phase:** later · **Basis:** user direction; acceptance details proposed · **Responsible role:** Research/product

Let readers assemble and export a sourced business research book and a clearly labelled personal plan.

Acceptance:

- Export retains edition, citations, check dates, unknowns and user assumptions in readable print/PDF and portable data.
- Private budgets, identities, negotiations and personal notes are excluded from public Git and analytics.
- Long-book pagination and data round-trip are tested before claiming implementation; template is not lender approval.

#### ENT-004 — Opportunity maintenance and outcomes

**Phase:** later · **Basis:** user direction; acceptance details proposed · **Responsible role:** Research/product

Maintain district business research without overstating local economic benefits.

Acceptance:

- Track evidence freshness, research state and public-release state separately.
- Use actual evidence for business launches, jobs and producer returns; plans and downloads are not economic outcomes.
- Commercial relationships are disclosed and do not purchase favourable ratings.
