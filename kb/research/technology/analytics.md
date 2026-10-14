---
type: "Technical operating record"
title: "Utkal Analytics: consent and deployment"
status: "published_and_verified"
---

# Project Odisha analytics

Current website: https://projectodisha.org/. The account and stream labels below preserve the verified 1 October setup; their external admin labels have not yet been reverified or renamed. The brand changed to Project Odisha on 14 October 2026.

The Founder requested creation if no property existed and authorised terms acceptance for India. A dedicated Utkal Project account and website stream now exist. [Setup evidence](../../records/evidence/visitor-readiness-2026-10-01/analytics-setup.json) records the actual IDs and the limits of the terms observation.

| Setting | Value |
| --- | --- |
| Account | Utkal Project · 410338115 |
| Property | Utkal Project — utkalproject.org · 556925065 |
| Website stream | Utkal Project website · 15900246803 |
| Measurement ID | G-9WJHZGN1EM |
| Website | https://utkalproject.org |
| Build setting | GitHub repository variable PUBLIC_GA_MEASUREMENT_ID |
| State | Published with Founder approval; production consent flow and initial GA Realtime receipt verified on 1 October 2026 UTC. |

The measurement ID is public configuration, not a secret. No Firebase, paid upgrade, advertising account link, API secret or BigQuery export was created. Optional account data-sharing choices were left unchecked. Enhanced measurement is off, confirmed by reopening the saved stream. Other administrative retention settings were not separately inspected.

## Collection contract

Only a coastal build with a valid measurement ID includes the consent configuration. Runtime additionally requires the exact production origin and an approved page route; 404 is excluded. Full review builds, localhost and downloaded books cannot start collection.

The tag does not load before the visitor chooses Accept cookies. The page sends its fixed title and canonical URL with no query string, fragment or incoming referrer. It does not send search terms, journey contents, draft contributions, user IDs or form values. Google can still process normal browser/device/network information and standard session activity after consent; this is not an anonymity claim. Advertising consent stays denied and client settings disable Google signals and ad personalization. Enhanced measurement must remain off in the Google stream to prevent automatic interaction events.

Visitors can decline or change their choice through Cookie preferences at the page foot. Declining sets Google's disable flag and clears matching first-party analytics cookies. Withdrawal from an accepted state reloads the page when the saved choice is available, removing the loaded tag. If storage fails, the choice lasts only on this page. Withdrawal does not erase previously received data. The public explanation lives under How to use Utkal → Privacy and your choices.

## Verification and release

Local tests cover the origin/route guard, clean metadata, no pre-consent events/tag load, one explicit page view, immediate disable on withdrawal and invalid configuration. Coastal build tests inspect configuration and absence of an eager remote script. Native Google collection cannot be proven by localhost unit tests.

After Founder approval of the reviewed PR, deploy the coastal edition, then check in a fresh production browser visit: no Google tag request before consent; one explicit page_view after allowing; clean dl/dt/dr parameters without private query or fragment content; no form/search events; withdrawal removes the loaded tag and prevents subsequent collection. Confirm the visit in GA Realtime. Keep this as an explicit release check until performed.

To disable future collection, remove the repository variable and rebuild the approved coastal edition. A variable change alone cannot alter already deployed static pages. Revert this integration for an immediate code rollback through the normal release process.

Implementation follows Google's [basic consent-mode description](https://developers.google.com/tag-platform/security/concepts/consent-mode) and [privacy controls](https://developers.google.com/tag-platform/security/guides/privacy). This record describes implementation choices, not a legal-compliance certification.

## Production verification · 1 October 2026 UTC

The Founder explicitly approved deployment. [Live evidence](../../records/visitor-readiness-publication.json) confirms no Google requests before consent, clean canonical page_view parameters and a 204 collection response after allowing. GA Realtime showed the homepage and one active user. Withdrawal removed the loaded tag; no Google request was observed on reload or the next page. Synthetic search/URL markers did not appear in the observed requests. The test browser was left declined. Earlier pending-release wording above is historical. These synthetic visits are included in the initial analytics totals.
