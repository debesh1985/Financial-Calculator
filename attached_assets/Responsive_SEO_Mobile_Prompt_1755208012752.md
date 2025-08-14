# Prompt: Make the site fully responsive & SEO‑optimized (Canada + USA)

You are a **senior front‑end + technical SEO engineer**. Work on the repo:
- `https://github.com/debesh1985/Financial-Calculator`

Target pages:
- `index.html` (Mortgage)
- `youtube-calculator.html`
- `facebook-calculator.html`
- `instagram-calculator.html`
- `term-insurance-calculator.html`
- `universal-life-calculator.html`

## Goals
1. Make every page **responsive and mobile‑friendly** (iPhone + Android) with clean, consistent UI.
2. Achieve **Lighthouse Mobile** scores: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
3. Implement **on‑page SEO** to **target top‑5 rankings** (cannot be guaranteed; optimize to best practice) for:
   - “free mortgage calculator” (Canada & USA)
   - “free YouTube monetization calculator”
   - “free Facebook monetization calculator”
   - “term insurance calculator Canada USA”
   - “universal life insurance calculator Canada USA”

> **Note:** Ranking depends on competition and backlinks; your job is to maximize technical + content signals to give the site the best chance to reach top results.

---

## Tech & Design Requirements (apply to all pages)
1. **Viewport & Layout**
   - Add once in `<head>`:  
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
     ```
   - Use a single responsive system (Bootstrap 5.3.x). Remove Bootstrap v4/jQuery remnants.
   - Ensure **mobile‑first CSS** with grid and utility classes; avoid fixed widths; use `%`, `vw`, `flex`, and `grid`.

2. **Navigation (Hamburger)**
   - Standardize one navbar across pages with a working **Bootstrap 5** toggler (`data-bs-toggle`, `data-bs-target`). ID must match (`#mainNav`).

3. **Spacing & Tap Targets**
   - Minimum touch target: **48×48px**. Line-height ≥ **1.5**. Adequate padding on buttons, inputs, nav items.

4. **Images & Media**
   - Provide **responsive images** with modern formats: WebP/AVIF + PNG/JPG fallback.
   - Add explicit `width`/`height` (or `aspect-ratio`) to prevent CLS.
   - Lazy-load non-critical images: `loading="lazy"`; defer offscreen iframes: `loading="lazy"` + `decoding="async"`.

5. **Fonts & CSS/JS**
   - Use `font-display: swap`; preload critical fonts if self-hosted.
   - Defer non-critical JS: `defer`.
   - Keep one Bootstrap **bundle** include (Popper included). Remove duplicates.
   - Inline a **small critical CSS** (above-the-fold for header/nav) if layout shifts are observed.

6. **Accessibility**
   - Unique, single **H1** per page, descriptive headings (H2/H3), semantic HTML.
   - Labels for inputs, `aria-label` where appropriate, keyboard navigable controls.
   - High contrast for text on backgrounds; focus outlines preserved.

7. **Performance Targets**
   - Total JS per page ≤ **200KB** minified (excluding Bootstrap CDN).
   - Image bytes on first load ≤ **300KB** on mobile where possible.
   - Avoid layout thrashing: no JS measurement loops on scroll/resize.

---

## On‑Page SEO (all pages)
1. **Titles & Meta Descriptions** (character-friendly)
   - Keep `<title>` ≈ **55–60 chars**; `<meta name="description">` ≈ **150–160 chars** with target keywords once each, natural language.
2. **Canonical & Indexing**
   - Add canonical tag using **absolute URL**. Replace `https://<BASE_URL>` with the real domain:  
     ```html
     <link rel="canonical" href="https://<BASE_URL>/<PAGE>" />
     ```
   - Ensure `robots` default is indexable (no unwanted `noindex`).
3. **Open Graph & Twitter Cards**
   ```html
   <meta property="og:type" content="website">
   <meta property="og:title" content="...">
   <meta property="og:description" content="...">
   <meta property="og:url" content="https://<BASE_URL>/<PAGE>">
   <meta property="og:image" content="https://<BASE_URL>/assets/og/<PAGE>.png">
   <meta name="twitter:card" content="summary_large_image">
   ```
4. **Structured Data (JSON‑LD)**
   - Add **Organization** + **WebSite** on all pages.
   - Add **BreadcrumbList**.
   - For calculators, add **WebApplication** (or SoftwareApplication) with `applicationCategory: "FinanceApplication"`.
   - Add **FAQPage** with 3–6 high‑quality Q&As per page.
5. **Content & Internal Links**
   - Each page should have: Intro paragraph (what/why), H2 with **How to use the calculator**, H2 with **Examples**, H2 with **FAQ**.
   - Cross‑link related calculators (YouTube ↔ Facebook ↔ Instagram; Mortgage ↔ Insurance). Use descriptive anchor text.
6. **Images & Alt Text**
   - Each illustrative chart/hero image must have descriptive `alt` that includes page topic naturally (no keyword stuffing).

---

## Page‑Specific SEO templates

> Replace `<BASE_URL>` with your production domain and `<YEAR>` with the current year.

### 1) `index.html` — Mortgage
**Title (example):** `Free Mortgage Calculator (Canada & USA) – Payments & Amortization`  
**Description (example):** `Instant mortgage payments and amortization for Canada and the USA. Enter price, down payment, rate and term to see monthly, bi‑weekly or weekly payments.`

**JSON‑LD blocks:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Mortgage Calculator (Canada & USA)",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "url": "https://<BASE_URL>/",
  "offers": {"@type":"Offer","price":"0","priceCurrency":"USD"}
}
</script>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"FAQPage",
  "mainEntity":[
    {"@type":"Question","name":"How do I calculate my mortgage payment?",
     "acceptedAnswer":{"@type":"Answer","text":"Enter home price, down payment, interest rate and amortization period; the calculator shows principal and interest by frequency."}},
    {"@type":"Question","name":"Do you support Canadian payment frequencies?",
     "acceptedAnswer":{"@type":"Answer","text":"Yes. Choose monthly, bi‑weekly, accelerated bi‑weekly, weekly, and accelerated weekly."}},
    {"@type":"Question","name":"Are property taxes and condo fees included?",
     "acceptedAnswer":{"@type":"Answer","text":"You can add property tax, utilities and condo fees to estimate total monthly cost of ownership."}}
  ]
}
</script>
```

### 2) `youtube-calculator.html`
**Title:** `Free YouTube Monetization Calculator <YEAR> – RPM, CPM & Earnings`  
**Description:** `Estimate YouTube earnings from views, RPM and CPM. Supports Shorts, Reels‑style content and long‑form videos. Free calculator.`

Add `WebApplication` + `FAQPage` with questions like *How is RPM calculated?*, *Do Shorts monetize?*, *What affects CPM?*

### 3) `facebook-calculator.html`
**Title:** `Free Facebook Monetization Calculator – Reels & Video Earnings`  
**Description:** `Project Facebook earnings from Reels and videos using RPM/CPM and views. Quick estimates for creators. Free, no login.`

### 4) `instagram-calculator.html`
**Title:** `Free Instagram Earnings Calculator – Reels, Posts & Stories`  
**Description:** `Estimate Instagram earnings from Reels, posts and stories. Supports RPM/CPM inputs and engagement rates.`

### 5) `term-insurance-calculator.html`
**Title:** `Free Term Life Insurance Calculator (Canada & USA)`  
**Description:** `Estimate term life insurance needs in minutes. Inputs for income, liabilities and dependents help determine coverage.`

### 6) `universal-life-calculator.html`
**Title:** `Free Universal Life Insurance Calculator – Canada & USA`  
**Description:** `Model universal life coverage needs and premiums with adjustable assumptions. Educational tool, not financial advice.`

---

## Global JSON‑LD (every page)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Financial Calculators",
  "url": "https://<BASE_URL>/",
  "logo": "https://<BASE_URL>/assets/logo.png",
  "sameAs": [
    "https://www.youtube.com/@<yourchannel>",
    "https://www.facebook.com/<yourpage>"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"WebSite",
  "name":"Financial Calculators",
  "url":"https://<BASE_URL>/",
  "potentialAction":{
    "@type":"SearchAction",
    "target":"https://<BASE_URL>/?q={search_term_string}",
    "query-input":"required name=search_term_string"
  }
}
</script>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"BreadcrumbList",
  "itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":"https://<BASE_URL>/"},
    {"@type":"ListItem","position":2,"name":"<Page>","item":"https://<BASE_URL>/<PAGE>"}
  ]
}
</script>
```

---

## Structured HTML skeleton (apply pattern to each page)
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>...</title>
  <meta name="description" content="...">
  <link rel="canonical" href="https://<BASE_URL>/<PAGE>">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#ffffff">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <!-- OG/Twitter + JSON-LD here -->
</head>
<body class="d-flex flex-column min-vh-100">
  <!-- Navbar -->
  <!-- Main content -->
  <main class="flex-grow-1">
    <header class="container py-4">
      <h1 class="h2 mb-3">...</h1>
      <p class="lead">Short intro that naturally uses the target keyword once.</p>
    </header>

    <section class="container mb-5">
      <h2 class="h4">How to use this calculator</h2>
      <!-- form / inputs -->
    </section>

    <section class="container mb-5">
      <h2 class="h4">Examples</h2>
      <!-- example walkthrough -->
    </section>

    <section class="container mb-5">
      <h2 class="h4">Frequently asked questions</h2>
      <!-- Expandable FAQ matching the FAQPage JSON-LD -->
    </section>
  </main>

  <footer class="border-top mt-auto">
    <div class="container py-4 small">
      © <span id="year"></span> Financial Calculators · <a href="/privacy.html">Privacy</a>
    </div>
  </footer>

  <script>
    document.getElementById('year').textContent = new Date().getFullYear();
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Sitemap & Robots
1. **`/sitemap.xml`** (example)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://<BASE_URL>/</loc></url>
  <url><loc>https://<BASE_URL>/youtube-calculator.html</loc></url>
  <url><loc>https://<BASE_URL>/facebook-calculator.html</loc></url>
  <url><loc>https://<BASE_URL>/instagram-calculator.html</loc></url>
  <url><loc>https://<BASE_URL>/term-insurance-calculator.html</loc></url>
  <url><loc>https://<BASE_URL>/universal-life-calculator.html</loc></url>
</urlset>
```
2. **`/robots.txt`**
```
User-agent: *
Allow: /
Sitemap: https://<BASE_URL>/sitemap.xml
```

---

## Internal Linking Strategy
- Header and footer include links to all calculators.
- Within each calculator page, add “Related calculators” section with 3–4 contextual links.
- Use descriptive anchors (e.g., “Estimate YouTube revenue” not “click here”).

---

## Testing Matrix (mobile focus)
- **Devices:** iPhone SE/13/14 Pro, Pixel 7, Galaxy S20.
- **Viewports:** 320, 360, 390, 412, 768, 1024, 1280.
- **Browsers:** Chrome, Safari, Firefox.
- **Checks:** Tap targets, no horizontal scroll, CLS < 0.1, TBT < 200 ms.

---

## Acceptance Criteria
- No horizontal scrolling on mobile; layouts remain intact from **320px to ≥1440px**.
- Hamburger works on all pages; keyboard and screen reader friendly.
- Lighthouse **mobile** scores meet targets specified above.
- Titles, descriptions, canonical, OG/Twitter, and JSON‑LD implemented per page.
- Valid HTML (`nu.validator`), no console errors, no 404s.
- `sitemap.xml` and `robots.txt` live and correct; `href` and canonical are absolute.
- All forms/inputs accessible and labeled; contrast ratios AA or better.

---

## Deliverables
- Updated HTML for all six pages with responsive fixes, SEO metadata, and structured data.
- New `/sitemap.xml`, `/robots.txt`, `/assets/og/*.png` OG images.
- Short changelog summarizing: responsive improvements, accessibility fixes, performance upgrades, and SEO additions.
