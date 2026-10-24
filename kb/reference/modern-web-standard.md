---
type: "Engineering standard"
title: "Modern Web Guidance adoption and audit"
---

# Modern Web Guidance

Adopted on 24 October 2026 following the Founder's request. Apply to Project Odisha website engineering. The official skill is installed in `.agents/skills/modern-web-guidance/`; it is a development resource, not shipped website content or a runtime dependency.

## Browser support

Our target is **Baseline Widely available**, covering interoperable web features rather than Chrome alone. Check current support before choosing APIs. Use newer features as progressive enhancements with feature detection and tested fallbacks. Essential reading, navigation and references must remain usable when optional JavaScript fails. Avoid adding polyfills or dependencies unless a demonstrated requirement justifies their cost. Baseline does not certify accessibility, performance or every device.

## Working procedure

1. Read the installed skill; search for the specific interaction or capability, then retrieve the applicable guide. Record the guide and any justified departure in the change's review notes. If retrieval fails, state that limitation and consult official platform documentation; do not claim the guide was checked.
2. Prefer semantic HTML and native controls. Verify focus order, keyboard operation, accessible names, form errors, meaningful image alternatives and reduced motion. Preserve Odia text and correct language tags; test zoom and narrow layouts.
3. Retain the static Astro approach where it serves readers. Size images for their actual display, supply responsive variants and dimensions, lazy-load below-fold images, and prioritize only likely LCP candidates. Preserve originals and rights records.
4. Measure representative homepage, article, collection, search and contribution flows on mobile and desktop before declaring a performance result. Record tool/version, route, build, device/network profile and date. Lighthouse lab results and real-user Core Web Vitals are distinct; absence of field data is not a pass. Use LCP <=2.5 seconds, INP <=200 milliseconds and CLS <=0.1 as field goals at the 75th percentile, not as unmeasured assertions.
5. Run existing build/tests and applicable browser checks. Exercise keyboard, mobile overflow, reduced motion and Chromium/Firefox/WebKit where available; document untested engines. Automated accessibility tests need manual review, including assistive technology for major interaction changes.
6. Review external scripts, consent, input handling and deployed security headers for affected changes. Plan and test CSP against actual hosting and dependencies before enforcement; do not deploy an untested policy or assume static hosting removes all risks.
7. Preserve existing review/CI/publication requirements. Skill/tool attribution belongs in internal review records or the assistant's delivery explanation, never repeated production labels in public articles.

## Initial audit: existing implementation

Read-only source review of the shared shell, styles, images and workflows found:

- `projects/site/src/layouts/Shell.astro`: document language, skip link, landmarks, labelled navigation and native mobile disclosure.
- `projects/site/src/styles/global.css`: visible focus, reduced-motion and forced-colour handling.
- `projects/site/tools/build-responsive-images.mjs`: aspect-preserving WebP variants with content hashes; fonts use swap loading.
- Existing Node tests and full/coastal/publication builds provide regression coverage. They do not establish browser compatibility or measured user experience.

## Prioritized follow-up work

| Priority | Gap | Completion evidence |
| --- | --- | --- |
| High | Reading-path cards use full originals; several recent story PNGs are approximately 2.1–2.7 MB. | Add appropriate assets to the existing variant pipeline, use responsive card/hero markup, verify rendered dimensions and compare transferred bytes. Preserve art and credits. |
| High | No representative measured Core Web Vitals baseline established in this audit. | Dated lab measurements for key templates and field data where available; track regressions without inventing scores. |
| High | No browser-driven accessibility/performance suite found in the inspected configuration. | Repeatable keyboard, overflow and interaction checks across representative routes; manual review limitations explicit. |
| Medium | No explicit site-wide CSP found in the shared shell; deployment headers not inspected. | Inspect live headers and external-resource needs, develop and test an appropriate hosting-compatible policy. This is a verification gap, not proof of a vulnerability. |

The adoption is complete as a project workflow. The recent-story image delivery task was published in PR520: three essay heroes, Dalkhai’s illustration and shared reading cards now use responsive variants. Five artworks have25–45KB thumbnail variants; four live routes and12image references were verified. [Delivery evidence](../records/responsive-story-images-2026-10-24.json) records exact byte counts and checks. Wider image coverage, mobile measurement, browser testing and security-header work remain open. No public-site code, browser session, Lighthouse report, screen-reader review or live security-header test is claimed by this audit.

## Sources and maintenance

- [Chrome Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)
- [Installation, Baseline targets and fallbacks](https://developer.chrome.com/docs/modern-web-guidance/get-started)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Official skill repository](https://github.com/GoogleChrome/modern-web-guidance)

Skill snapshot: `65e7edd67e77420eaf02c5df00fdc0521417d809`, installed 24 October 2026 with its upstream licence. The skill's search/retrieve CLI fetches current guidance; this pinned instruction snapshot does not freeze compatibility data. Review upstream changes deliberately before replacing the snapshot; no automatic installer or runtime dependency added to production builds.
