# Prompt: Remove the GST/HST Calculator from `index.html`

You are a **front-end engineer** working on this repo:
- `https://github.com/debesh1985/Financial-Calculator`

## Goal
On the **home page only** (`index.html`), remove every visible reference to the **GST/HST calculator** (links, tiles/cards, buttons, and copy). Do **not** touch other pages or files.

---

## Exact Tasks (only in `index.html`)
1. **Navbar/Top Menu (if present in `index.html`)**
   - Remove the GST/HST list item/link, e.g.:
     ```html
     <!-- Remove this item from the nav in index.html -->
     <li class="nav-item"><a class="nav-link" href="gst-hst.html">GST/HST</a></li>
     ```
   - Ensure menu layout still aligns (no double separators, no extra commas, no trailing dividers).

2. **Homepage Tiles/Sections/Buttons**
   - Remove any **card/tile/section/button** that points to the GST/HST calculator page. Typical patterns to search for:
     - Anchor `href` values: `href="gst-hst.html"`, `href="./gst-hst.html"`
     - Text labels: `GST/HST`, `GST`, `HST`, `Sales Tax`
   - Delete the **entire card/section** wrapper to avoid empty grid columns. For example:
     ```html
     <!-- Example card to delete entirely -->
     <div class="col">  <!-- or col-*, card, etc. -->
       <a class="text-decoration-none" href="gst-hst.html">
         <div class="card h-100">
           <div class="card-body">
             <h5 class="card-title">GST/HST Calculator</h5>
             <p class="card-text">...</p>
           </div>
         </div>
       </a>
     </div>
     ```
   - After removal, if a Bootstrap grid row becomes uneven, adjust the remaining column classes to maintain a clean layout (e.g., `row row-cols-1 row-cols-md-2 row-cols-lg-3`).

3. **Footer or Secondary Links**
   - Remove any GST/HST reference in the footer **within index.html** only, e.g.:
     ```html
     <a href="gst-hst.html">GST/HST Calculator</a>
     ```

4. **Inline Scripts or Event Handlers (if any)**
   - If `index.html` contains inline JS that binds events to GST/HST tiles/links, remove the related code blocks.
   - If there are **page-specific** script tags like `gst-hst.js` included **only** for the home card behavior, remove those includes from `index.html`. Do **not** delete shared/global bundles.

5. **SEO/Microdata (optional, only if present in index.html)**
   - Remove schema or meta items that explicitly reference GST/HST **on the homepage**. Keep all other calculators intact.

---

## Safety Guardrails
- **Do not delete** the standalone `gst-hst.html` file or its code.
- Do not touch other HTML files (`youtube-calculator.html`, etc.).
- Keep all global CSS/JS includes as-is unless they are **exclusively** for the GST/HST card on the homepage.

---

## Find/Replace Hints
Search in `index.html` for any of the following:
- `gst-hst.html`
- `GST/HST`
- `>GST<`, `>HST<` (rare)
- `Sales Tax`
- Regex (case-insensitive): `href=["']?\.\/??gst-hst(\.html)?["']?`

---

## Acceptance Criteria
- The **GST/HST calculator is not visible or linked** anywhere on the homepage (`index.html`).
- Navbar, grid, and footer still render cleanly with no empty gaps or broken alignment.
- No JavaScript errors in the console related to removed elements.
- All other calculators on the homepage function normally.

---

## Deliverable
- A single updated `index.html` with the GST/HST references removed and layout preserved.
