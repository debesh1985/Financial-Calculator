# Prompt: Fix Mortgage Calculator Desktop Layout (v2) — Keep Mobile Good & No GST/HST

You are a **senior front‑end engineer** working on the repo:
- `https://github.com/debesh1985/Financial-Calculator`

**Issue:** On **desktop**, the Mortgage calculator homepage (`index.html`) shows a narrow left inputs panel and a **large empty white area** on the right; the **Results panel does not render/align** (see screenshot). On mobile it looks OK. Also, **do not include or link `gst-hst.html`** anywhere in the site.

---

## Root‑Cause Hypotheses (check & fix)
1. **Hidden results column** due to Bootstrap display utility (e.g., `d-xl-none`, `d-lg-none`, or `visibility: hidden`).  
2. **Broken grid** from mixing custom flex styles with `.row`/`.col-*` or from **fixed widths** on columns/cards/inputs.  
3. **Zero‑width/flex-basis** of the results column (e.g., `flex: 0 0 0;` or `max-width: 0`).  
4. **Absolute/sticky positioning** applied to input card that forces other columns to wrap out of the flow.  
5. **Min-width on body/container** causing overflow and pushing columns off-screen.

---

## Mandatory Standards (apply once, sitewide)
- Bootstrap **5.3.x** only (no v4 and no jQuery). One CSS + one **bundle** JS include.  
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`  

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

---

## Replace the Main Calculator Layout in `index.html`
**Goal:** A robust, 3‑area grid that never collapses or hides content on desktop;

```html
<!-- Container -->
<div class="container-xxl py-4">

  <!-- Intro header stays above -->

  <div class="row g-4 align-items-start" id="mortgage-grid">

    <!-- Inputs -->
    <aside class="col-12 col-lg-5 col-xl-4" id="inputs-col">
      <!-- MOVE existing inputs panel markup here -->
    </aside>

    <!-- Results -->
    <section class="col-12 col-lg-7 col-xl-5" id="results-col">
      <!-- MOVE the main results card(s), totals, amortization, etc. -->
    </section>

    <!-- KPIs / Side panel (optional) -->
    <aside class="col-12 col-xl-3 d-none d-xl-block" id="kpis-col">
      <!-- Small KPI cards like “Monthly equivalent (P&I)” -->
    </aside>
  </div>
</div>
```

### Remove / Fix Problematic Classes & Inline Styles
- **Delete** any of the following from the **results** column or its parents:
  - `d-none`, `d-sm-none`, `d-md-none`, `d-lg-none`, `d-xl-none`
  - `position-absolute`, `position-fixed`, custom `position: absolute;`
  - `float-*` classes; any custom `float` styles
  - inline `style="width: XYZpx"`, `style="max-width: XYZpx"`, `style="flex: 0 0 0"`
- **Delete** any custom flex on `.row` (e.g., `.row{display:flex}` in your CSS). Bootstrap already sets the grid.
- **Do not** apply sticky positioning to entire columns. If you must keep the inputs sticky, only make the **inner card** sticky with a **bounded** top offset and **no fixed width**.

### Safe CSS (add to a global stylesheet or a `<style>` in `index.html`)
```css
/* Ensure columns/cards stretch correctly */
#inputs-col .card,
#results-col .card,
#kpis-col .card { width: 100%; }

/* Undo accidental zero-width layouts */
#results-col,
#inputs-col,
#kpis-col { flex: 1 1 auto; max-width: 100%; }

/* Inputs fill their container without fixed widths */
#inputs-col .form-control,
#inputs-col .form-select { width: 100%; max-width: 100%; }

/* Prevent horizontal scroll from long figures */
.result-number, .calc-amount { overflow-wrap: anywhere; }

/* Keep media responsive */
canvas, img, svg, iframe, table { max-width: 100%; height: auto; }

/* Optional, if a sticky inner card is used */
#inputs-col .card.sticky { position: sticky; top: 1rem; }
```

### If You Previously Used `row row-cols-*`
Replace with explicit column sizes as above (`col-12 col-lg-5/7 col-xl-4/5/3`). This avoids uneven spans at desktop.

---

## JS: Resize/Reflow for Charts (if any)
If you render charts/tables that depend on container width, reflow them on **`DOMContentLoaded`** and **`resize`**:

```html
<script>
(function () {
  function reflowCharts() {
    const charts = window.__charts || [];
    charts.forEach(ch => ch.resize && ch.resize());
  }
  window.addEventListener('DOMContentLoaded', reflowCharts);
  window.addEventListener('resize', reflowCharts);
})();
</script>
```

---

## Remove All GST/HST References (sitewide)
- Delete any `<a>` or nav item linking to **`gst-hst.html`**.
- Delete tiles/cards/CTAs pointing to GST/HST.
- Ensure meta/canonical/OG/JSON‑LD have **no** gst-hst URLs.
- **Search & remove (case-insensitive):** `gst-hst`, `GST/HST`, `Sales Tax`, and links matching regex:  
  `href=[\"']\.?/?gst-hst(\.html)?[\"']`

> Keep the file if it exists; just don’t link to it anywhere.

---

## Testing Checklist (must pass)
- **Viewports:** 320, 360, 390, 414, 768, 992, 1200, 1366, 1440, 1920.
- On **≥992px (lg)**: inputs and results appear **side by side**.
- On **≥1200px (xl)**: optional right KPI column appears; nothing overlaps or disappears.
- No horizontal scrolling; no overlapping cards; console is clean (no duplicate Bootstrap).
- Tab/keyboard navigation flows in document order (inputs → results → KPIs).

---

## Acceptance Criteria
- Mortgage calculator **renders correctly on desktop** with inputs + results visible and aligned; mobile remains good.
- No `gst-hst.html` links anywhere in the site.
- Cards fill their column width; there are **no fixed pixel widths** on columns or form controls.
- CLS < **0.1**; no layout shift from images or sticky elements.
- Bootstrap 5 grid only; no custom absolute positioning for layout.

---

## Deliverables
- Updated `index.html` with the layout above and fixed classes.
- Updated CSS (global or page-level) including the “Safe CSS” block.
- A brief changelog describing removed classes/inline styles and grid normalization.
