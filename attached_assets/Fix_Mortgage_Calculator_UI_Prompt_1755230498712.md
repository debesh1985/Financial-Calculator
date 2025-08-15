
# Prompt: Fix Look & Feel of `index.html` (Mortgage Calculator)

You’re an expert front-end developer. Rewrite and lightly refactor the existing `index.html` in this repo so the page looks clean, reads well on mobile, and follows the exact section order below—without breaking any current functionality.

**Repo file to modify**
- `index.html` in `Financial-Calculator/`

## Goals
1. Keep the existing font, colors, icons, and overall visual style. Do not introduce new frameworks.
2. Preserve all links and the full menu exactly as-is (same text, same URLs, same behavior).
3. Reorder and restyle the layout for clarity and mobile-first UX.
4. Keep all existing JS function names, element `id`s, and `data-*` attributes so current logic continues to work.
5. Keep the page fast and accessible.

## Final Section Order (top to bottom)
1. **Header + Subtitle**
   - Keep the current title and subtitle styling.
   - Place the **USA/Canada toggle** at the **top-right of the header** (desktop) and just under the title (mobile), aligned right.
   - Make the header sticky on scroll only if it already is; otherwise keep it static.
2. **Input Form**
   - Comes immediately after the header/subtitle.
   - Group inputs with clear labels, inline units (%, $, years), and helpful placeholders.
   - Use the existing IDs and names. Do not rename fields.
   - On desktop/tablet, show inputs in a tidy two-column grid. On small screens, stack in one column.
3. **Mortgage Breakdown (Results Summary) — middle of page**
   - A compact summary card/area showing: monthly payment, principal vs. interest split, insurance (CMHC/FHA as applicable), taxes, condo fees, utilities (water/electric/heating), and total monthly cost of ownership.
   - Show each line item and a bold “Total monthly cost” at the bottom.
   - Ensure live updates when inputs change or when the USA/Canada toggle changes.
4. **Amortization Graph**
   - Keep the current chart library and IDs. Do not change the data wiring.
   - X-axis shows **Year**. Principal and Interest are clearly distinguishable in the legend.
   - When payment frequency changes, update the schedule and series accordingly (existing logic should keep working).
   - Maintain the current font family and sizes; adjust only spacing and layout if needed.
5. **SEO + FAQ**
   - Add a short SEO block (one paragraph) that uses existing keywords from the page content—no keyword stuffing.
   - Add a collapsible FAQ (accordion). Keep styling consistent with the page; no new libs.
   - Embed **JSON-LD FAQPage** schema that mirrors the on-page FAQs.

## USA/Canada Toggle (top-right)
- Use the current toggle implementation if it exists. If not, create a minimal switch (checkbox-based) that:
  - Has an accessible label, ARIA attributes, and keyboard support.
  - Triggers the existing country-specific logic (CMHC for Canada; FHA/PMI for the USA) without renaming functions.
- On mobile, the toggle sits below the title, right-aligned; on desktop it sits at the top-right.

## Layout & Responsiveness
- **Mobile-first**. Target breakpoints roughly at 480px, 768px, 1024px.
- Use CSS grid/flex to lay out the form and the results summary:
  - Mobile: single column, full-width cards, generous spacing.
  - Tablet: two-column form; results summary full-width beneath it.
  - Desktop: two-column form; results summary to the right if space permits, otherwise beneath.
- Respect the current color palette and typography. Do not import new fonts or reset CSS.
- Keep touch targets at least 40px tall/wide on mobile.

## Styling Rules
- Do not introduce Bootstrap/Tailwind/etc. Keep vanilla CSS scoped to this page. Add or adjust small utility classes if necessary.
- Reuse existing variables/custom properties if present.
- Adjust only spacing, card borders, and alignment to improve readability. No drastic visual changes.
- Keep the header/nav visual exactly the same; only reflow the layout.

## Accessibility
- Every input needs a `<label for>` or `aria-label`. Group related inputs with `<fieldset><legend>` if appropriate.
- Ensure visible focus states for keyboard users.
- Provide `aria-live="polite"` on dynamic result areas so screen readers notice updates.
- Buttons and toggles must be reachable and operable via keyboard.

## Performance
- No large new dependencies. No blocking render paths.
- Defer any non-critical scripts. Use `loading="lazy"` for non-critical images/iframes if present.
- Keep DOM changes minimal; prefer CSS for reflow.

## SEO details
- Keep existing meta tags. Add or update only if missing: informative meta description (≤160 chars) that genuinely describes the page.
- Add structured data:
  - `FAQPage` JSON-LD that matches the visible FAQ.
- Use semantic HTML: `<main>`, `<section>`, `<header>`, `<nav>`, `<footer>`, `<h1>…<h3>`, `<p>`, `<ul>`.

## FAQ (example structure to render on-page)
- What costs are included in total monthly ownership?
- How does payment frequency affect amortization?
- When does CMHC (Canada) or FHA/PMI (USA) apply?
- Can I use this for purchase or refinance scenarios?
*(Use brief, user-first answers. Mirror these in JSON-LD.)*

## Acceptance Criteria
- Header and subtitle remain visually identical; USA/Canada toggle is at the top-right (or below the title on mobile).
- After the header: the **form**, then **mortgage breakdown**, then **amortization graph**, then **SEO paragraph + FAQ**.
- All existing links and the menu are preserved exactly (text, destination, and order).
- Fonts, colors, and general style remain consistent with the current page.
- Page is fully usable on a 360–400px-wide screen with no horizontal scrolling.
- No JavaScript errors in the console. Existing calculation logic and chart updates still work.
- JSON-LD validates for `FAQPage` on Google’s Rich Results test.

## What to Output
- Overwrite `index.html` with the improved structure and minimal CSS adjustments (inline `<style>` or existing stylesheet edits).
- If you must add CSS, keep it inline within `index.html` under a comment: `/* UI tidy-up (2025-08-14) */`.
- Do not remove or rename IDs, classes, or function names used by scripts.
- Provide the final, ready-to-ship HTML in your output.
