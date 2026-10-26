---
type: "Research evidence"
title: "Separate analytics delivery configuration review"
---

# Analytics delivery review

Reviewer: Drishti (independent bounded code review)
Date: 26 October 2026
Verdict: PASS — no publication-blocking findings in the three-file change reviewed.

The component now serializes only the current build-time pathname, and only when `editionRoutes.has(Astro.url.pathname)` succeeds; otherwise it supplies an empty allowlist. This removes repeated route-catalog payload without broadening eligibility. The client still requires the production origin, membership of the current runtime pathname, an exact canonical origin/path match, and a canonical URL without query or fragment. Explicit `/404.html` rejection remains in the unchanged runtime validator. Astro's `/404/` build path is outside the route allowlist, yielding an empty configuration for the error page; fallback responses at unknown paths also cannot pass membership/canonical validation.

Consent, delayed tag loading, withdrawal/cookie clearing, cross-tab denial handling, measurement-ID checks, coastal-edition gating, referrer suppression, one-page-view behavior, and JSON less-than escaping are unchanged. The narrowed allowlist is appropriate for these static pages; no client-side router was found in the inspected layouts. The new negative unit cases cover empty allowlists, other valid routes, mismatched canonical metadata, explicit 404 and unknown-route error fallbacks. The coast test now checks the actual per-page singleton (empty for 404), rather than merely accepting a shortened payload.

Independent validation: bundled Node `--test tests/analytics.test.mjs` passed all 4 tests, with no skips or failures. Read the entire component and analytics library, the three-file diff, route-set definition and Shell 404 normalization. No shared repository files were modified by this review. Samanta separately reports a valid-measurement-ID coast build and 515 coast tests passing, including generated empty 404 configuration; that full build/test result was not independently rerun here to avoid concurrent output mutation. Final publication-size and hosted-CI gates remain parent/integrator responsibilities.

SHA-256 of reviewed files:

- `projects/site/src/components/Analytics.astro`: `0c2974ec3f7bb8293708ca37118b14f0dc556170bdf24962dae67b8f3dd2c4b2`
- `projects/site/tests/analytics.test.mjs`: `f6479f8009088af870bba8d6e222582f55b6a2b917aa3d09f1b1c268a22770a3`
- `projects/site/tests-coast/analytics.test.mjs`: `3075f5488ad32008c2774c73467b6bfdc9ec7c9e3003fcdaf3451aa1fd11f66e`
