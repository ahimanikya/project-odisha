---
type: "Release candidate"
title: "Project Odisha — expanded public preview"
status: "awaiting_founder_review"
---

> Historical review notes. The [30 September consolidated release review](release-review-2026-09-30.md) is the current 72-page candidate; earlier counts and manifests below are preserved history.

# Expanded public preview — review pack

**Decision requested:** approve this concrete candidate for an expanded public **preview** at utkalproject.org, retaining editorial labels and noindex. It is not a declaration that every article is final or that the site is ready for a promotional launch. Preparation was authorized by the Founder's “Sounds good”; publication has not been authorized by that preparation instruction.

## What visitors will receive

- A 50-page collection with Chilika and Konark, connected places and stay-area research, Balasore and Mayurbhanj, food stories, language introductions, literary lives and the existing Fresco gallery.
- Search combined with subject and area filters, related illustrated discoveries, and the established sea/stone/straw identity.
- Several personal journeys stored in the visitor's browser, optional dates, days and notes, JSON backups, and offline text or photo books.
- Public GitHub contribution paths for corrections, new subjects and photographs, with explicit visibility information and human editorial review.

The Store stays outside the public site. No paid service, AI chat, server account database, booking system, new analytics integration or new commercial arrangement is introduced.

## Suggested Founder walkthrough

1. [Home](http://127.0.0.1:4324/) → **Begin exploring**; search for Chilika.
2. [Chilika](http://127.0.0.1:4324/knowledge/chilika/): inspect the story, subplaces, practical notes and credits, then save it.
3. [My journey](http://127.0.0.1:4324/journey/): name a trip, arrange days and download a photo book.
4. [Contribute](http://127.0.0.1:4324/contribute/): review the new-subject, photograph and correction paths. You need not submit a test issue.
5. Review [Chhena Poda](http://127.0.0.1:4324/food/chhena-poda/), [Bhima Bhoi](http://127.0.0.1:4324/people/bhima-bhoi/) and [Gopinath Mohanty](http://127.0.0.1:4324/people/gopinath-mohanty/) as representative food and literary entries.

## Findings and fixes

The end-to-end walkthrough found a real omission: saving Chilika gave a photo-book download with zero photographs. Chilika and Konark now have curated export photographs; both were confirmed in the download feedback. Konark's original remains intact; a smaller real-image derivative retains creator, licence and change notes. New subject and photo proposals now have direct paths rather than forcing a visitor to select an existing article. Food links use food wording, page titles avoid duplicated branding, and unavailable printing has a readable fallback.

**Checks:** final 50-page build; 46 tests passing; seven sampled pages measured at 390 CSS pixels without horizontal overflow; eager images loaded; Odia font selection checked. This is implementation self-review, not independent editorial or accessibility certification. [Detailed evidence](../../records/release-readiness-review.json) · [Candidate hashes](../../records/release-candidate-manifest.json).

## Remaining limits to accept or resolve

- **Native PDF/A4 pagination is unverified.** The embedded browser reports “Printing is not available”. The downloadable HTML books remain usable; print from a supporting browser. This limitation must remain visible until a real PDF is inspected.
- Odia wording and historical interpretation need Founder/native-language review. Rendering a font is not validating language or history.
- GitHub Issues are public; no real issue was submitted in testing. Templates remain local until the approved merge to the default branch.
- Physical devices, screen readers, field access and individual accommodation facilities were not inspected. Stay pages remain research starting points.

## Release procedure after explicit approval

1. Record the Founder's decision, exact approved scope and any accepted limits. If content changes materially, rebuild and compare with the manifest before using approval.
2. Review the complete pending repository changes against the existing PR; include the canonical KB, new assets, source code and issue templates. Preserve earlier local work. Commit and update the reviewed PR, then merge the approved candidate to main.
3. Use the existing manual **Publish Project Odisha** workflow on main, under ahimanikya, with the Founder approval input. Only `projects/site/dist` is the website artifact; private/operating material is not automatically exported as website content. Public repository contents remain publicly readable separately.
4. Check the actual deployment result and live homepage, collection search, place page, journey saving/export, images and contribution handoffs. Verify the actual issue templates on the default branch. Record real commit and run IDs.
5. If deployment fails, leave the last successful website in place while fixing it. For a bad live release, prepare a revert to the last verified website version and follow the same human release gate; do not delete reader browser data. A static rollback does not automatically migrate saved journeys.

No push, merge, issue submission, workflow dispatch, payment or public deployment was performed by this readiness pass.

## Updated candidate after design system adoption

The current local output now uses Utkal Design System 0.1.0-rc.2 on all 50 pages. Use the [adoption review](../../records/design-system-adoption-review.json) and [new manifest](../../records/design-system-adoption-manifest.json) for the next release decision. Earlier counts and the previous manifest above describe the earlier candidate. No new public deployment has occurred.


## Current batch update · 30 September 2026 UTC

The local candidate now contains 62 pages and passes 53 website tests plus six design-system tests. The [twenty-item review](../../records/next-twenty-review.json) and [next-twenty manifest](../../records/next-twenty-manifest.json) describe this output. Earlier candidates remain historical. Founder accepted the working visual baseline; this additional batch is prepared for review, not public deployment.

## Current local output after discovery connections

The subsequent [connection pass](discovery-connections.md) now builds 64 pages. Its [manifest](../../records/discovery-connections-manifest.json) supersedes earlier manifests only for the current local output; previous review snapshots remain historical evidence. Publication approval is still separate.

## Current local output after visitor planning

The [visitor-planning batch](visitor-planning-batch.md) now builds 67 pages, with 63 passing website tests and six design-system tests. Its [manifest](../../records/visitor-planning-manifest.json) identifies the current local output. Broader inner-page refinement remains open as POD-WORK-075; publication still requires the separate Founder gate.
