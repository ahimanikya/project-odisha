
--- Guide for html ---
# HTML

## Table of Contents

1. Fundamental Semantics and Validation
2. Content Grouping and Attribution
3. Resource Prioritization and Performance
4. Native Overlays: Dialogs and Popovers
5. Disclosures: Details and Summary
6. Focus Boundaries and Visibility
7. HTML APIs and Forms Grouping
8. Native Media Elements
9. Dynamic Styles and Interactivity

## 1. Fundamental Semantics and Validation

### Guidelines

- **DO** use the standard HTML5 doctype `<!DOCTYPE html>` to prevent quirky rendering modes.
- **DO** set the `lang` attribute on the `<html>` element set to the primary document language and on any element that uses a language that differs from the primary language, for screen reader pronunciation and translation tools, and any locale-sensitive features (e.g. CSS `hyphens`).
- **DO** use the `<meta name="viewport">` element with the `content` attribute set to `"width=device-width, initial-scale=1.0"` to ensure page responsiveness.
- **DO** use a single `<h1>` per page/view representing the main topic. Exceptions can be made for modal dialogs, which can also use a single `<h1>`.
- **DO** maintain a sequential, non-skipping heading hierarchy (`<h2>` to `<h3>`, but not `<h2>` to `<h4>`).
- **DO** use semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) to create regional navigation for assistive technologies.
- **DO** use `<search>` to enclose search and filtering mechanisms (eliminates the need for `role="search"`).
- **DO** use `<button>` for triggered actions (JS, Modals, Forms) and `<a>` strictly for URL navigation. Set `type="button"` for non-submit buttons in forms to prevent unintended submission.
- **DO** use `<ul>`, `<ol>`, and `<dl>` elements for list content.
- **DO** ensure that all interactive elements like links and buttons have accessible names.
- Ensure that all interactive elements have a role that matches the interaction that they facilitate, whether that is their implicit role, or via the `role` attribute. Controls that trigger an interaction on the same page/in the same view should have a role of `button`, controls that redirect people should have a role of `link`.
- **DO** hide purely decorative SVG images from assistive technology using `aria-hidden="true"`. If using a decorative `<img>`, always include an empty `alt` attribute (e.g. `alt=""`).
- **DO** ensure that informative SVGs like logos, data visualizations, or icon buttons have a proper accessible name, and for more complex visuals, an accompanying text alternative, providing the same information as that conveyed visually.

- **DON'T** use generic `<div>` or `<span>` when semantic elements exist, for instance for interactive elements, headings, or independently reusable self-contained content.
- **DON'T** use boolean attributes with redundant values (e.g., use `disabled`, not `disabled="disabled"`).
- **DON'T** use generic elements with added ARIA roles or states when native elements with built-in semantics and behavior exist.
- **DON'T** change the native semantics of elements with ARIA unless it is a critical requirement. 
- **DON'T** use `role="presentation"` or `aria-hidden="true"` on focusable elements or their parents and ancestors.
- **DON'T** disable page zooming capabilities.
- **DON'T** use more than one `banner`, `main`, or `contentinfo` landmark per page

### Code Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | Platform</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
     <h1>Analytics</h1>
    <search>
      <form action="/filter" method="GET">
        <label for="search-input">Scan items:</label>
        <input type="search" id="search-input" name="q">
        <button type="submit">Search</button>
      </form>
    </search>
    <article>
      <h2>First post</h2>
    </article>
  </main>
  <footer>
    Platform - Policies and legal information
  </footer>
</body>
</html>
```

## 2. Content Grouping and Attribution

### Guidelines

- **DO** use `<blockquote>` for extended quotations from another source, and use the `cite` attribute to provide a machine-readable URL for that source.
- **DO** use `<figure>` to group self-contained content (images, code snippets, or quotes) that is referenced from the main flow but could be moved to an appendix or sidebar without affecting the document's meaning.
- **DO** use `<figcaption>` as the first or last child of a `<figure>` to provide a human-readable caption or attribution.
- **DO** use the `<cite>` element inside a caption or attribution to identify the **title** of a work (e.g., a book or website name), not the author's name.
- **DO** use the `<code>` element for short fragments of computer code (e.g., variable names, file paths, or inline snippets).
- **DO** wrap `<code>` inside a `<pre>` element when displaying blocks of code to preserve whitespace and line breaks.
- **DO** ensure that code blocks are accessible by adding `tabindex="0"` to the `<pre>` element if it becomes scrollable, allowing keyboard users to reach the content.
- **DO** ensure that scrollable code blocks are accessible by adding `role="region"` to the `<pre>`, along with an accessible name using either `aria-labelledby` (referencing the ID of the element that titles the block) or `aria-label`.

- **DON'T** use `<blockquote>` for purely visual indentation of non-quoted text.
- **DON'T** use `<figure>` for every single image; use it only when a caption is required or when the content is a distinct, referenced unit.
- **DON'T** use `<pre>` without `<code>` for code blocks; `<pre>` alone only preserves formatting but doesn't convey that the content is a computer language.

### Code Example

```html
<!-- Quote with attribution using Figure -->
<figure>
  <blockquote cite="https://html.spec.whatwg.org/">
    <p>The figure element represents some flow content, optionally with a caption, that is self-contained and is typically referenced as a single unit from the main flow of the document.</p>
  </blockquote>
  <figcaption>
    Definition of the &lt;figure&gt; element from the <cite>HTML Living Standard</cite>
  </figcaption>
</figure>

<!-- Image with caption -->
<figure>
  <img 
    src="architecture-diagram.webp" 
    alt="Diagram showing the flow between Client, API Gateway, and Microservices"
    width="800"
    height="450"
    loading="lazy"
  >
  <figcaption>Figure 1: High-level system architecture overview.</figcaption>
</figure>

<!-- Code block with accessibility and language hint -->
<figure>
  <figcaption id="code-block-caption">Example configuration:</figcaption>
  <pre role="region" aria-labelledby="code-block-caption" tabindex="0"><code class="language-json">
{
  "name": "gemini-cli",
  "version": "1.0.0",
  "private": true
}
  </code></pre>
</figure>

<!-- Inline code -->
<p>To initialize the project, run the <code>npm install</code> command.</p>
```

## 3. Resource Prioritization and Performance

### Guidelines

- **DO** use `fetchpriority="high"` for the Largest Contentful Paint (LCP) element (e.g., hero image) to elevate network priority.
- **DO** use `<link rel="preload" as="image">` with `fetchpriority="high"` for LCP background images defined in CSS.
- **DO** apply `loading="lazy"` to off-screen images and iframes to defer bandwidth.
- **DO** specify `width` and `height` on all `<img>` tags to preserve aspect ratio and prevent Layout Shifts (CLS).
- **DO** use the `srcset` attribute on `<img>`s for adding multiple versions of the same image at different sizes.
- **DO** use the `<picture>` element with a fallback `<img>` for more fine-grained image control like switching between image formats, image sizes, and cropping images at different device sizes. 

- **DON'T** apply `loading="lazy"` to above-the-fold or hero images. This delays LCP.
- **DON'T** overuse `fetchpriority="high"`; prioritization is a zero-sum mechanism. Use `fetchpriority="low"` to demote non-critical trackers or later carousel items.

### Code Example

```html
<!-- High-priority hero image with responsive sizes -->
<img 
  src="hero-large.webp" 
  srcset="hero-small.webp 480w, hero-medium.webp 800w, hero-large.webp 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 70vw"
  alt="Main product view" 
  fetchpriority="high" 
  width="1200" 
  height="600"
>

<!-- Art direction and format switching with <picture> -->
<picture>
  <!-- Mobile Art Direction: Different aspect ratio (square) and format (AVIF) -->
  <source 
    media="(max-width: 600px)" 
    srcset="hero-mobile.avif 1x, hero-mobile-2x.avif 2x" 
    type="image/avif"
    width="600" 
    height="600"
  >
  <source 
    media="(max-width: 600px)" 
    srcset="hero-mobile.webp 1x, hero-mobile-2x.webp 2x"
    width="600" 
    height="600"
  >
  
  <!-- Desktop: Modern format for primary layout -->
  <source srcset="hero-desktop.avif" type="image/avif">

  <!-- Fallback img defines the default aspect ratio (2:1) -->
  <img 
    src="hero-desktop.webp" 
    alt="Platform dashboard overview" 
    width="1200" 
    height="600"
    loading="lazy"
  >
</picture>

<!-- Low-priority decorative footer image -->
<img 
  src="footer-art.png" 
  alt="" 
  loading="lazy" 
  width="200" 
  height="100"
>
```

## 4. Native Overlays: Dialogs and Popovers

### Guidelines

See `declarative-dialog-popover-control` (via `npx -y modern-web-guidance@latest retrieve "declarative-dialog-popover-control"`) for more info on fallback strategies for using the Popover API in a cross-browser way.
- **DO** use `<dialog>` for modal overlays (requires JS `.showModal()`) to automatically trap focus, dim backgrounds, and support dismissing via `Esc`. Use the `closedby="any"` attribute to enable native "light-dismiss" (closing on backdrop click) without custom JavaScript.
- **DO** provide a visible control for closing modal overlays, so that people using voice control software can easily determine how to dismiss the modal dialog.
- **DO** utilize the Popover API (`popover` attribute) for non-modal UI (menus, tooltips) that do not require focus traps.
- **DO** use `::backdrop` to style modal backgrounds.
- **DO** use `<form method="dialog">` to dismiss dialogs without manual JS handlers. Combined button `formmethod="dialog"` yields the button's value to the dialog `.returnValue`.

- **DON'T** use `show()` for modals where keyboard traps are expected (use `showModal()`).
- **DON'T** call `showModal()` on elements possessing a `popover` attribute (they are mutually exclusive programmatic states). However, `<dialog popover="auto">` is a valid declarative architecture to combine dialog semantics with light-dismiss mechanics.

### Code Example

```html
<!-- Popover (No JS required for toggle) -->
<button popovertarget="help-menu">Info</button>
<div id="help-menu" popover="auto">
  <p>Standard help text.</p>
</div>

<!-- Modal Dialog with Form-based closing -->
<button id="show-dialog">Open dialog</button>
<dialog id="fav-modal">
  <!-- method="dialog" closes the dialog natively and sets the returnValue -->
  <form method="dialog">
    <p>Confirm action?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>

<script>
  const dialog = document.getElementById("fav-modal");
  const openModal = document.getElementById("show-dialog");
  
  // Show modal dialog
  openModal.addEventListener('click', () => dialog.showModal());
  
  // Listen for the 'close' event to retrieve the user's choice (returnValue)
  dialog.addEventListener('close', () => {
    console.log(dialog.returnValue); // "confirm" or "cancel"
  });
</script>
```

### Native UI Overlay & Disclosure Matrix

| Feature | Modality | Focus | Dismiss Mechanism | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`<dialog>`** | Modal / Non-modal | Automatic trap (Modal) | Esc / Form / `closedby` | Critical Actions, Settings |
| **`[popover]`** | Non-modal | Standard Tab flow | Light-dismiss (Click outside) | Menus, Tooltips, Toasts |
| **`<details>`** | Inline Disclosure | Standard Tab flow | Toggle summary | Accordions, FAQs |

**Heuristic Rule**: Use `<dialog>` for interruptions requiring user action, `popover` for transient info, and `<details>` for inline content expansion.

## 5. Disclosures: Details and Summary

### Guidelines

- **DO** use `<details>` and `<summary>` for a native disclosure pattern without JS.
- **DO** use `<details>` and `<summary>` for native accordion patterns without JS. For exclusive accordions, use the `name` attribute on the `<details>` elements. Wrap the entire accordion in a `<section>` element with an accessible name provided using either `aria-labelledby` (referencing the `id` attribute of the element that names this accordion) or `aria-label`
- **DO** place `<summary>` as the *first* child of `<details>`.
- If headings must be used within a `<summary>`, consider if the heading is essential for understanding or navigating the document structure. If it is, use a more robust disclosure approach that allows wrapping the disclosure trigger with the heading (e.g. `<h2><button type="button" aria-expanded="false" aria-controls="significant-section-content">Significant section</button></h2>`). This ensures the heading semantics aren’t lost, and the button and its state are announced.
- **DO** use `details[open]` attribute for styling expanded states.
- **DO** use `details::details-content` for styling the contents of the `<details>` element.

- **DON'T** nest other interactive elements (links, buttons) directly inside `<summary>` text as it may break expected focus behavior and screen reader announcements.
- **DON'T** hide visible triangles via `list-style: none` without providing explicit directional cues (via `::before`/`::after` pseudo-elements).
- **DON'T** use the `title` attribute to create tooltip effects, as these cannot be accessed using a keyboard. Instead, use accessible tooltip patterns that can be triggered using a keyboard, and are consistently announced by screen readers.
- **DON'T** provide text alternatives for custom state indicator icons (implemented using `<img>` or `<svg>` elements), as state should be communicated by the `<summary>` element, and a text alternative would duplicate this information

### Code Example

```html
<!-- Exclusive Accordion Set -->
<section aria-label="Frequently asked questions">
  <details name="faq">
    <summary>Item 1</summary>
    <p>Contents...</p>
  </details>
  <details name="faq">
    <summary>Item 2</summary>
    <p>Contents...</p>
  </details>
</section>
```

## 6. Focus Boundaries and Visibility

### Guidelines

- **DO** use the global `inert` attribute for entire hidden sections (off-screen menus, background while custom modal is open) to remove them from tab flows and accessibility trees.
- **DO** pair `[inert]` with CSS (`opacity: 0.5`) to visually signify inactivity.
- **DO** rely on natural DOM order for sequential navigation.
- **DO** ensure that focusable elements aren't obscured by anything when they receive focus (for example, focus should move to modal dialogs and be constrained in them, rather than being able to access obscured content behind the modal).
- **DO** maintain focus—moving it to a logical adjacent element or returning it to the trigger control—when the currently focused element is hidden or removed.
- **DO** move focus to the start of newly injected content when it is added in direct response to a user action that shifts the workflow into that content (e.g., opening a dialog or navigating to a new view), rather than for background or live-region updates.

- **DON'T** use positive `tabindex` values (e.g., `1`, `2`). Use `0` to add element to tab flow, or `-1` for JS program focus.
- **DON'T** alter focus flow using CSS properties (`flex-flow: row-reverse`, `order`) without aligning the DOM structure.
- **DON'T** use `node.focus({ preventScroll: true })` without usability validation; it can hide the focused element off-screen.

### Code Example

```html
<!-- De-tabbing a background app shell while custom drawer is open -->
<main id="app-shell" inert>
  <a href="/">Dashboard</a>
</main>
<aside id="drawer">
  <button>Close</button>
</aside>
```

```css
[inert], [inert] * {
  opacity: 0.5;
  cursor: default;
  user-select: none;
}
```

## 7. HTML APIs and Forms Grouping

### Guidelines

See `forms` (via `npx -y modern-web-guidance@latest retrieve "forms"`) for more details on creating modern web forms.

- **DO** utilize the `form="form-id"` attribute to decouple inputs from the physical `<form>` tree.
- **DO** use `<datalist>` coupled with `<input list="id">` for lightweight auto-suggestions (note: visually unstylable and has screen-reader quirks).
- **DO** use the `autocomplete` attribute and appropriate value on input fields that request personal information (for combined name fields use `autocomplete="name"`, for a given name use `autocomplete="given-name"`, for a family name use `autocomplete="family-name"`.)
- **DO** distinguish `autocomplete="current-password"` (sign-in) from `autocomplete="new-password"` (registration / password change) so password managers offer the right action.
- **DO** match `autocomplete` tokens with appropriate `inputmode` and `type` (`type="email"` + `inputmode="email"` + `autocomplete="email"`). They control different things — keyboard, validation, and autofill respectively — and reinforce each other.

- **DON'T** use `autocomplete="off"` on credential, address, payment, or contact fields. Browsers and password managers ignore it there by design. Use a specific token instead (`autocomplete="email"`, `"street-address"`, `"cc-number"`, etc.).
- **DON'T** use `autocomplete="off"` unless handling highly sensitive tracking tokens (violates standard password manager overrides). Use standard inputs `type="email"`, `type="tel"`.

### Code Example

```html
<form>
  <fieldset>
    <legend>Address Information</legend>
    <label for="city">City:</label>
    <input type="text" id="city" list="cities" autocomplete="address-level2">
    <datalist id="cities">
      <option value="New York">
      <option value="London">
    </datalist>
  </fieldset>
</form>
```

## 8. Native Media Elements

### Guidelines

- **DO** set `width` and `height` to prevent layout shifts (CLS) on `<video>` elements.
- **DO** provide a `poster` image fallback for videos.
- **DO** include subtitles and captions with `<track>`.
- **DO** ensure background videos are `muted`, provide users with full control over playback, and use `role="none"` or `aria-hidden="true"`. The `controls` attribute must also be omitted to make sure the video is not focusable.  

- **DON'T** rely on JS for basic video controls if native `controls` attribute is sufficient.
- **DON'T** apply `role="none"` or `aria-hidden="true"` to focusable elements (such as embedded interactive `<iframe>` components). Hiding elements from the assistive technology tree while leaving them accessible to sequential keyboard navigation violates core accessibility heuristics. The background video exception holds solely because omitting the `controls` attribute renders the `<video>` element fully non-focusable.
- **DON'T** automatically play audio when a page is opened, unless there is an accessible stop or pause control, or a way to change the volume of the audio, independent from the operating system's volume level, as to adhere to WCAG 1.4.2 Audio Control, Level A.

### Code Example

```html
<video 
  controls 
  width="800" 
  height="450" 
  poster="poster.webp"
>
  <source src="intro.webm" type="video/webm">
  <source src="intro.mp4" type="video/mp4">
  <track src="caps.vtt" kind="captions" srclang="en" label="English">
</video>
```

## 9. Dynamic Styles and Interactivity

### Guidelines

- **DO** use the `style` attribute to pass state to CSS via **Custom Properties**. This keeps visual logic in your stylesheet while JavaScript provides the raw data.
- **DO** ensure that information is available for people using screen readers, using text alternatives, appropriate accessible names, roles, and programmatic state information

- **DON'T** use inline styles for static design (colors, padding, margins) that belong in a stylesheet.
- **DON'T** use inline event handlers (e.g., `onclick`). Trigger actions using `addEventListener()`.
- **DON'T** convey state, interaction, or information using color alone.

### Code Example

```html
<body>
  <!-- Progress with style-driven color data -->
  <label for="upload-progress">Upload status:</label>
  <progress id="upload-progress" class="loading-bar" value="0" max="100" style="--brand-hue: 200;"></progress>

  <script>
    const updateProgress = (percent, hue) => {
      const bar = document.querySelector('.loading-bar');
      bar.value = percent;
      
      // Update dynamic style variable 
      if (hue) bar.style.setProperty('--brand-hue', hue);
    };

    // Example: Move to 85% and shift color to green (120)
    setTimeout(() => updateProgress(85, 120), 1000);
  </script>
</body>
```
```css
.loading-bar {
  accent-color: hsl(var(--brand-hue, 200) 80% 50%);
  transition: accent-color 0.3s ease;
}
```


--- Guide for responsive-design ---
# Responsive design

## Overall best practices

- Use `@container` queries to create component-driven responsive layouts that adapt to their parent container's size rather than the viewport. See `size-aware-styling` (via `npx -y modern-web-guidance@latest retrieve "size-aware-styling"`) for more details.
- Use dynamic viewport units (`dvh`, `dvw`) instead of `vh`/`vw` to prevent layout breakage when mobile browser UI elements (like address bars) appear or disappear.
- Use `aspect-ratio` for media elements (like `<img>` and `<video>`) to reserve space during loading and prevent Cumulative Layout Shift (CLS).

For the layout mechanics behind responsive UI (flexbox, grid, container query units, viewport units), see `css-layout` (via `npx -y modern-web-guidance@latest retrieve "css-layout"`).

## Responsive typography

- **DO** combine viewport-relative and font-relative units in `clamp()` for font sizes that scale with the viewport size while ensuring they stay within a desired range. For example, `clamp(2rem, 1rem + 5vw, 4rem)`. Adjust the proportion of viewport-relative and font-relative units to control how quickly the font-size changes. Use font-relative minimum and maximum values, and keep the maximum no more than 2.5 times the minimum. Viewport units don't grow when users zoom, so the text only grows once its minimum overtakes the viewport-based value; with a maximum no more than 2.5 times the minimum, browser zoom, which goes up to 500%, can still resize the text to 200% (WCAG 1.4.4 Resize Text requires text to resize up to 200% without loss of content or functionality).
- **DON'T** use `vw` alone for font-size without `clamp()`, as it can scale text too small or too large on extreme screens.

To scale type and spacing with the container instead of the viewport, see `fluid-scaling` (via `npx -y modern-web-guidance@latest retrieve "fluid-scaling"`).


--- Guide for card ---
# Build a Card

## Overview

A card groups one related piece of content or one choice. It is a visual pattern, not a fixed semantic or interaction model, so preserve the content's meaning and use the native interaction that matches its purpose.

## Guidelines

Choose semantics for the content and its interaction separately:

- use `<article>` as the card root, whether or not it links to a destination;
- use a native link for navigation. When the whole card is one destination, a single link may wrap the `<article>` only if the card contains no other interactive elements (`a`, `button`, `input`, `select`, `textarea`);
- keep links and buttons for independent actions as separate native controls;
- use a radio button or checkbox with an associated `<label>`, or an `option` in a native `<select>`, when the card is a choice.

Keep media, title, supporting content, and actions in meaningful source order; don't use CSS `order` to contradict it (see `css-layout` (via `npx -y modern-web-guidance@latest retrieve "css-layout"`)).

## Implementation

Keep the markup minimal and let CSS selectors recognize each region, so simple cards stay simple and richer cards stay possible. A card has up to four regions, in this source order, and any of them can be omitted. Regions are direct children of the card, not grouped in wrapper elements such as `.card__body`, which prevents placing and styling regions by selector. A region with a single element is that element itself, not wrapped: a lone paragraph is the `<p>`. Use a wrapper only when a region holds multiple elements.

- **Media**: an `<img>`, `<picture>`, `<video>`, or `<svg>` as the first child. Add a `.media` class only to arbitrary hero content that is not one of those elements, and never wrap a plain `<img>` in a `.media` element.
- **Header**: a heading on its own. Use `<hgroup>` only when the heading has a subtitle or tagline, and `<header>` when the region carries more than a title, such as a byline or badge. When the card has a primary destination, the link goes inside the heading.
- **Content**: a single `<p>`, `<ul>`, or `<dl>` stands on its own. When the content is several elements, such as multiple paragraphs or a paragraph plus a list, group them in one `<div>` so the region is a single grid item.
- **Footer**: a `<footer>` holding independent actions as native links and buttons. A "read more" link may share the heading link's URL, but give it a descriptive accessible name that starts with the visible text, using visually hidden text (for example, `Read more<span> about poached eggs</span>`), because identical "read more" links are ambiguous in a screen reader's link list. Don't add other footer links that repeat the heading's URL.

The simplest card is an `<article>` containing a heading and a paragraph. Choose the link and action pattern that matches the card's behavior; see [Interaction models](#interaction-models).

For card images or video that should fill a fixed-ratio area, set `aspect-ratio` and `object-fit: cover` on the `<img>` or `<video>` itself, so it fills the area without distortion (cropping may occur). Use a `.media` container's `aspect-ratio` only for other hero content. Otherwise, preserve the media's intrinsic ratio. Give informative images an appropriate text alternative; use `alt=""` for decorative images.

### Adapt to available space

Base the layout on the card's available space, not the viewport. To adapt the card's descendants (media, text, actions), make the card the size container (`container-type: inline-size`) and write `@container` rules against its children. Avoid sizing from the grid or list parent: the card's actual width can depend on column count, gaps and so on, making parent-based breakpoints are noisy.

In a narrow container, stack the regions in source order. In a wide container, place the media in a side column beside the other regions, but only for cards that have media: scope those rules with `:has()` on the media child (for example `.card:has(> img)`) so the column definitions and `grid-column` placements never apply to a card without media. A card without media stays single-column at every width, and must not reserve an empty media column.

### Align cards in a grid

When cards in a row should share the heights of their regions, use `subgrid`: make each card span four shared row tracks (media, header, content, footer) and place regions by element selector, treating everything that is not media, a heading, or a `<footer>` as content. A card that omits a region leaves its track empty, so the remaining regions still line up with neighboring cards. Each track holds one grid item, so wrap the content region in a `<div>` only when it has more than one element and cards share tracks. Cards that are not aligned with siblings need neither wrapper nor subgrid.

## Interaction models

### Content cards

Use an `<article>` as the card root. Keep links and buttons as separate native controls.

### Single-destination cards

When the whole card is one destination and has no independent actions, use one native link. The link can wrap the `<article>`. Do not nest other links, buttons, or form controls inside the link, and keep any "read more" text a plain `<p>` or `<span>`. Because the link's accessible name is all of the card's text, keep the content short; if the card has a lot of text or other actions, use the stretched-link pattern below so only the heading is the link:

```html
<a href="/recipes/poached-eggs">
  <article class="card">
    <h3>Poached eggs</h3>
    <p>Two poached eggs served on toasted sourdough.</p>
  </article>
</a>
```

### Clickable cards with independent actions

If clicking the card triggers an action rather than navigating, use a `<button>` instead of a link.

When a content card links to a primary destination, also contains other interactive elements, and needs to be clickable as a whole:
- Use a single opt-in, on the primary link itself: put `.card-link` on exactly one link per card (the heading link). Footer and other links never get it, or each would stretch its own overlay and the last one would capture the whole card.
- Link its title and stretch the pointer hit area across the card with `::after`

```css
.card:has(a.card-link) {
	position: relative;
}

.card a.card-link::after {
	content: "";
	position: absolute;
	inset: 0;
}
```

- Elevate interactive elements with `position: relative; z-index: 1` so they remain operable. Target types of elements (e.g. `a, button`) rather than requiring opt-in via classes. 
- Do NOT apply `z-index` to entire containers as that would make them capture pointer events that don't produce any action.

```css
.card:has(a.card-link) {
	/* Keep other interactive elements above the overlay */
	a:not(.card-link), button, input, x-button {
	    position: relative;
	    z-index: 1;
	}
}
```

- Style the card itself on hover/focus, rather than the stretched link:

```css
.card {
	a.card-link {
		&:focus-visible {
			outline: none; /* Draw it on the card instead */
		}
	}
	
	&:has(a.card-link:focus-visible) {
		/* Focus ring */
	}

	&:has(a.card-link:hover) {
		/* Hover styles */
	}
}

```

### Choice cards

For cards that represent predefined choices, use `<label class="card">` with a checkbox or radio as a direct child.

Style the selected card with `:has(:checked)`. Never change layout-affecting properties such as `border-width`, `padding`, or `font-weight` on selection, because the card and its neighbors jump; draw the emphasis with `outline`, `box-shadow`, or a transparent border that only changes color:

```css
.card {
  border: 2px solid transparent;

  &:has(> :checked) {
    border-color: var(--accent);
  }
}
```

The visible checkbox or radio is itself a non-color indicator of selection, so the color change alone is sufficient. If the control is visually hidden (keep it focusable and in the accessibility tree, never `display: none`), add a non-color indicator that does not affect layout, such as a check icon or a thicker `outline`.

When choices belong in a dropdown picker whose options are laid out as cards, use a native `<select>` with `appearance: base-select` and style `::picker(select)` and `<option>` elements rather than replacing the select with `<div>` cards; see `custom-select-picker-layouts` (via `npx -y modern-web-guidance@latest retrieve "custom-select-picker-layouts"`) for more details and fallbacks.

