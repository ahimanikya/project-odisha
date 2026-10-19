---
type: "Product implementation note"
title: "Visitor polish, illustrated books and public contributions"
status: "local_candidate_for_review"
version: "0.1"
---

# Visitor polish, illustrated books and public contributions

The Founder approved the proposed next batch with “go ahead” and selected public GitHub Issues for contributions. This records local implementation and self-review, not approval of the resulting editorial content or a public release.

| Work | Item | Preview path | Result |
|---|---|---|---|
| POD-WORK-031 | Mobile layouts | `/explore/` | Responsive navigation, grids and controls; measured 320px and 390px layouts checked. |
| POD-WORK-032 | Keyboard and accessibility polish | `/contribute/` | Visible focus, touch sizing, form error focus and import focus transitions. |
| POD-WORK-033 | Print layout and long-note review | `/journey/` | Print CSS and long-note retention checked; native PDF/A4 pagination remains unverified. |
| POD-WORK-034 | Illustrated offline tour book | `/journey/` | Optional self-contained HTML with selected real photographs, notes and end credits; bounded image sizes and graceful omissions. |
| POD-WORK-035 | Combined Explore filters | `/explore/` | Area, subject and search work together with shareable filter URLs and empty-state recovery. |
| POD-WORK-036 | Related discoveries | `/knowledge/chilika/` | Curated illustrated reading connections between places, language, literature and food. |
| POD-WORK-037 | Bhima Bhoi introduction | `/people/bhima-bhoi/` | Compassion, Mahima and literary works, with a real memorial photograph and explicit biographical uncertainty. |
| POD-WORK-038 | Gopinath Mohanty introduction | `/people/gopinath-mohanty/` | Place, language and fiction, with a credited photograph, Paraja reading trail and external listening references. |
| POD-WORK-039 | Chhena Poda and Mudhi Mansa pages | `/food/chhena-poda/` | Two illustrated, source-backed food introductions and stable existing journey identities. |
| POD-WORK-040 | Public GitHub contribution workflow | `/contribute/` | Local draft preparation, explicit public handoff, long-link fallback and knowledge/photo issue templates. No automatic submission. |

## Information and image model

Food introductions live in [food/collection.json](../food/collection.json); author profiles extend [voices/collection.json](../voices/collection.json). Both retain sources, inspection notes, image provenance and explicit editorial uncertainty. Related reading edges live in [related-discoveries.json](../related-discoveries.json), separate from routing or travel-time claims. Discovery filters describe editorial connections, not complete linguistic territories.

Three new real photographs depict the Bhima Bhoi memorial, Gopinath Mohanty with his wife, and a home-made chicken variation of Mudhi Mansa. Chhena Poda reuses an existing credited photograph. No new AI imagery, quotations, poems or recordings were created or reproduced. Quiet credit disclosures remain at page ends.

## Visitor tools

The optional photo book embeds only curated local catalogue images, with source and licence information in its appendix. Limits: 12 images, 2 MB per image and 8 MB total binary image data. Missing or rejected images leave the entry text intact. Fetches remain same-origin with a timeout and size limits; imported plans cannot select arbitrary image URLs. The resulting HTML needs no connection to read its text and included pictures. External source links still require internet access. JSON remains the editable journey backup.

The [public contribution workflow](public-contributions.md) documents visitor disclosure and human editorial review. No issue was posted, and neither site changes nor issue templates have been deployed.

## Review and remaining work

[Self-review and evidence](../../records/visitor-polish-review.json) includes browser geometry, keyboard interactions, synthetic illustrated output and automated tests. Native PDF generation is unavailable in the embedded browser, so **A4 pagination and physical printing remain open**. Physical-device, screen-reader, Founder editorial and community-language review also remain open. This does not redefine the original PRD as fully implemented.

Next review: Explore filters, the two food pages and two author introductions, an illustrated personal book, and the public contribution handoff. Publication remains a separate Founder decision.
