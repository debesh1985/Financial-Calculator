# Prompt: Fix the Hamburger Menu Across All Pages

You are a **senior front‑end engineer**. The repository is:
- `https://github.com/debesh1985/Financial-Calculator`

The mobile hamburger menu (navbar toggle) is **not working** on these pages:
- `index.html`
- `youtube-calculator.html`
- `facebook-calculator.html`
- `instagram-calculator.html`
- `term-insurance-calculator.html`
- `universal-life-calculator.html`

## Objective
Make the hamburger button reliably **open and close** the navigation menu on mobile and small screens across all listed pages. Use a **single, consistent implementation**.

---

## Required Solution (Bootstrap 5.3.x, no jQuery)
1. **Standardize dependencies** on all six HTML files (head or just before `</body>`):
   - Keep **one** Bootstrap CSS include and **one** Bootstrap **bundle** JS include (bundle includes Popper).
   - **Remove** any Bootstrap 4 or jQuery references if present.
   - Example (no SRI hashes to avoid mismatch errors):
     ```html
     <!-- Head -->
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

     <!-- Before </body> -->
     <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
     ```

2. **Use one canonical navbar markup** on every page (IDs and attributes must match exactly):
   ```html
   <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
     <div class="container">
       <a class="navbar-brand fw-semibold" href="index.html">Financial Calculators</a>

       <button class="navbar-toggler" type="button"
               data-bs-toggle="collapse"
               data-bs-target="#mainNav"
               aria-controls="mainNav"
               aria-expanded="false"
               aria-label="Toggle navigation">
         <span class="navbar-toggler-icon"></span>
       </button>

       <div class="collapse navbar-collapse" id="mainNav">
         <ul class="navbar-nav ms-auto">
           <li class="nav-item"><a class="nav-link" href="index.html">Mortgage</a></li>
           <li class="nav-item"><a class="nav-link" href="gst-hst.html">GST/HST</a></li>
           <li class="nav-item"><a class="nav-link" href="youtube-calculator.html">YouTube</a></li>
           <li class="nav-item"><a class="nav-link" href="facebook-calculator.html">Facebook</a></li>
           <li class="nav-item"><a class="nav-link" href="instagram-calculator.html">Instagram</a></li>
           <li class="nav-item"><a class="nav-link" href="term-insurance-calculator.html">Term Insurance</a></li>
           <li class="nav-item"><a class="nav-link" href="universal-life-calculator.html">Universal Life</a></li>
         </ul>
       </div>
     </div>
   </nav>
   ```
   - **Important:** The toggler's `data-bs-target="#mainNav"` **must match** the collapse `<div id="mainNav">`.
   - Use **Bootstrap 5 attributes** (`data-bs-toggle`, `data-bs-target`). Do **not** use the Bootstrap 4 forms (`data-toggle`, `data-target`).

3. **Clean up conflicting code**:
   - Remove duplicate or mismatched IDs (only a single `#mainNav` per page).
   - Remove any custom click handlers that manually toggle classes on the navbar; let Bootstrap manage the collapse behavior.
   - Ensure the navbar icon is visible by keeping either `navbar-light` on light background or `navbar-dark` on dark background.

4. **Accessibility**:
   - Keep `aria-controls`, `aria-expanded`, and `aria-label` on the button.
   - The collapse container must have a unique `id` and be referenced only by the matching toggler.

5. **Optional vanilla fallback** (only if Bootstrap must not be used on a page):
   ```html
   <script>
   document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(function(btn){
     btn.addEventListener('click', function() {
       var sel = btn.getAttribute('data-bs-target');
       var target = document.querySelector(sel);
       if (target) target.classList.toggle('show');
     });
   });
   </script>
   ```

---

## Exact Tasks to Perform
1. In each of the 6 listed HTML files:
   - Add/verify the **viewport** meta tag.
   - Replace any `data-toggle`/`data-target` with `data-bs-toggle`/`data-bs-target`.
   - Ensure the collapse container **ID** equals `mainNav` and the toggler points to `#mainNav`.
   - Include **only** Bootstrap 5.3.3 CSS and **bootstrap.bundle.min.js** (no jQuery, no bootstrap.min.js without Popper).
   - Replace the whole navbar block with the **canonical navbar** above for consistency.
2. Test the hamburger in:
   - iPhone SE/mobile width (≤ 375px),
   - iPad width (~768px), and
   - a desktop browser window resized to small width.
3. Verify:
   - The menu opens/closes with animation.
   - Focus trapping and keyboard toggle (Enter/Space) work via Bootstrap 5 behavior.
   - No console errors (remove duplicates of Bootstrap/Popper).

---

## Deliverables
- Updated versions of all six HTML files with a working hamburger menu.
- A short changelog describing:
  - CSS/JS includes normalized to Bootstrap 5.3.3,
  - Navbar markup unified and IDs fixed,
  - Any legacy attributes (`data-toggle`, `data-target`) removed.

## Acceptance Criteria
- On all six pages, the hamburger toggles the menu reliably on Chrome, Safari, and Firefox.
- No duplicate Bootstrap or jQuery includes.
- Lighthouse mobile checks show the toggle accessible and interactive without console errors.

---

## Notes (if you discover a different root cause)
If the repo mixes Bootstrap versions (e.g., Bootstrap 4 markup with Bootstrap 5 files), **standardize to Bootstrap 5.3.x** as above. If the project intentionally avoids Bootstrap, implement the **vanilla fallback** and ensure the `.collapse` element toggles the `show` class and is styled to expand/collapse properly.
