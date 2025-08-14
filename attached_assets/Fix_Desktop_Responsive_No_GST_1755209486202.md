# Prompt: Fix Desktop Layout Distortion (Keep Mobile Good) & Remove All GST/HST References

You are a **senior front‑end engineer** and **technical SEO** working on:
- **Repo:** `https://github.com/debesh1985/Financial-Calculator`

**Bug:** The homepage (`index.html`) looks distorted on **desktop widths** (see attached screenshot in the ticket). Mobile is OK. Also, **do not include `gst-hst.html` anywhere** (remove from nav, footer, cards, and internal links).

---

## Objectives
1. **Desktop layout** must be clean and aligned while preserving existing **mobile** behavior.
2. Use a **single Bootstrap 5.3.x responsive grid** across the homepage content (and apply the same approach to other pages if they show similar issues).
3. **Purge every reference** to GST/HST across the entire site (nav, footer, tiles, CTAs, text links). Do not delete the file if it exists; just don’t link to it.
4. No horizontal scrollbars; no overlapping or truncated text at any width from **320px → 1920px**.

---

## Framework & Dependencies (standardize once)
- Keep **one** Bootstrap CSS and **one** Bootstrap **bundle** JS (Popper included).
- Remove any Bootstrap v4 or jQuery includes.
- In `<head>` ensure:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  ```
- Before `</body>`:
  ```html
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  ```

---

## Desktop Grid Fix for `index.html`
**Problem symptoms** often stem from mixed `col-*` sizes, fixed widths on cards/inputs, or non‑Bootstrap CSS positioning. Implement this **canonical, mobile‑first layout** and migrate existing content into it.

### Canonical Markup (wrap existing sections)
```html
<!-- Main container -->
<div class="container-xxl py-4">

  <!-- Intro / header stays above -->

  <!-- 3-column responsive grid -->
  <div class="row g-4 align-items-start">
    <!-- Left: Calculator Inputs -->
    <aside class="col-12 col-lg-5 col-xl-4" id="calc-inputs-col">
      <!-- Move the entire inputs panel here -->
      <!-- Ensure form controls use w-100 and no fixed widths -->
    </aside>

    <!-- Middle: Results (cards, tables, charts) -->
    <section class="col-12 col-lg-7 col-xl-5" id="calc-results-col">
      <!-- Primary results card -->
      <!-- "Estimated Monthly Cost of Ownership" etc. -->
    </section>

    <!-- Right: Secondary KPIs / comparators (Optional on lg+, hidden on small) -->
    <aside class="col-12 col-xl-3 d-none d-xl-block" id="calc-side-kpis">
      <!-- Small KPI card(s) like "Monthly equivalent" go here -->
    </aside>
  </div>
</div>
```

### Required CSS (place in a global CSS or `<style>`)
```css
/* Prevent layout breaks */
#calc-inputs-col .card,
#calc-results-col .card,
#calc-side-kpis .card { width: 100%; }

/* Never rely on fixed widths for inputs */
#calc-inputs-col .form-control,
#calc-inputs-col .form-select { width: 100%; max-width: 100%; }

/* Kill rogue fixed widths & floats */
.card, .card-body, .form-control { max-width: 100%; }
[class*="col-"] { float: none !important; } /* if any legacy .float is present */

/* Avoid horizontal scrolling from long numbers/labels */
.result-number { overflow-wrap: anywhere; }
body { overflow-x: clip; } /* safer than hidden for accessibility */

/* Charts or large media should scale */
canvas, img, svg, iframe, table { max-width: 100%; height: auto; }

/* Optional: equal spacing */
.section { margin-bottom: 1.5rem; }
```

### Cleanup Tasks
- **Remove** any inline `style="width: XYZpx"` on inputs/cards/containers.
- **Remove** absolute positioning used to place columns; rely on the Bootstrap grid only.
- Replace any `row row-cols-*` that causes odd column spans with explicit `col-12 col-lg-*/col-xl-*` as above.
- Add `g-4` (or `g-3`) on the `.row` for consistent gaps.
- Do **not** set explicit heights on cards (let them auto-size).

### Breakpoint Behavior (must verify)
- **< 992px (mobile/tablet):** columns stack vertically (`col-12`).
- **≥ 992px (lg):** 2-column layout (inputs + results) is acceptable.
- **≥ 1200px (xl):** 3-column layout (inputs + results + KPIs) per markup above.

---

## Remove All GST/HST Links & Mentions
1. **Navigation (all pages):** delete any `<li>` or `<a>` that references `gst-hst.html`.
2. **Homepage tiles/cards/footers:** delete entire card/section that links to `gst-hst.html`.
3. **Cross‑links:** remove any “Related calculators” link to GST/HST.
4. **Meta/OG/Schema:** ensure no `gst-hst` URL appears in canonical/OG/JSON‑LD.
5. **Search & Remove (case‑insensitive):**
   - `gst-hst.html`, `gst-hst`, `GST/HST`, `Sales Tax`
   - Regex for links: `href=[\"']\.?/?gst-hst(\.html)?[\"']`

> Keep the page file if it exists, but it **must not** be linked anywhere.

---

## Navbar Consistency (All Pages)
- Use a single Bootstrap 5 navbar pattern with a **working hamburger** (`data-bs-toggle="collapse"`, `data-bs-target="#mainNav"`; must match `id="mainNav"`).
- Keep top‑level links for **Mortgage, YouTube, Facebook, Instagram, Term Insurance, Universal Life** only.

---

## Performance & CLS
- Add explicit `width`/`height` (or `aspect-ratio`) on images/hero to avoid layout shift.
- Defer non‑critical scripts; ensure only Bootstrap bundle is included once.
- If charts are used, ensure responsive resizing (e.g., container `width:100%` and reflow on `resize`).

---

## Testing Matrix
- **Widths:** 320, 360, 390, 414, 768, 992, 1200, 1366, 1536, 1920.
- **Browsers:** Chrome, Safari, Firefox.
- Verify:
  - No horizontal scrollbars.
  - Input column and results column align without overlap.
  - Right KPI column appears only at **xl** and does not force wrapping.
  - Cards expand to full column width; no fixed pixel widths.
  - Console has **no errors** and **no duplicate** Bootstrap/Popper loads.

---

## Acceptance Criteria
- `index.html` renders cleanly on **desktop** with the 2/3 column layout described, and **mobile** remains unchanged or improved.
- No references to `gst-hst.html` or GST/HST anywhere on the site (nav, footer, body, meta, schema).
- Lighthouse **mobile** CLS < **0.1**; no layout shift on load; no horizontal overflow at any breakpoint.
- Hamburger menu works across all pages.
- The fix uses only Bootstrap 5 utilities and semantic HTML; no brittle custom positioning.

---

## Deliverables
- Updated `index.html` implementing the canonical grid and cleanup.
- Updated shared header/footer partials (or repeat in each page) with GST/HST references removed.
- A short changelog summarizing what changed and why.
