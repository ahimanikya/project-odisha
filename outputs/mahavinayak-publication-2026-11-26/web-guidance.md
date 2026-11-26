# Responsive article and preview guidance

Read the adopted Modern Web Guidance skill and project standard before UI implementation. The previous Olasuni attempt in this same chat was rejected by automatic approval review for executing an unverified downloaded CLI; it was not retried or bypassed. This task uses the project standard’s official-platform fallback, not a claimed successful CLI retrieval.

Refreshed official guidance on 26 November 2026:
- MDN, Using responsive images in HTML: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
- web.dev, Browser-level image lazy loading: https://web.dev/articles/browser-level-image-lazy-loading

Keep existing semantic article/footnote components, a full-frame image with intrinsic dimensions and responsive sources, eager loading for the main image, lazy loading below the fold and visible keyboard focus. Reuse the baseline-compatible site layout; no new dependency or client-side interaction is needed. Root must inspect actual desktop/mobile output and native note/card navigation; no unmeasured performance or cross-engine claim.
