# Prompt: Recreate the Mortgage Calculator Page (Minimalistic, Mobile‑First, Desktop‑Solid, SEO‑Ready)

You are a **senior front‑end engineer + technical SEO**. Rebuild the **Mortgage Calculator** page **from scratch** while keeping the current top navigation and links intact (Mortgage, YouTube, Facebook, Instagram, Term Insurance, Universal Life). **Do not add or link** to `gst-hst.html`. You may add **future tabs** inside this page as placeholders (disabled) for GST/HST/PST and child‑planning calculators, but **no links** should navigate to a `gst-hst.html` file.

**Repo context:** `https://github.com/debesh1985/Financial-Calculator`

---

## Objectives
1. **Minimalistic, mobile‑first** UI that also renders cleanly on **desktop** (no distortion, no horizontal scroll).
2. Mortgage calculator must support **Canada (CAD)** and **USA (USD)** with respective mortgage insurance rules:
   - **Canada:** CMHC premium auto‑applies when **LTV > 80%** (Purchase only; not for Refinance). Premium is **financed into the mortgage principal**.
   - **USA:** If **down payment < 20%**, show mortgage insurance:
     - Option A (default): **Conventional PMI** estimate (annual rate applied to outstanding principal).
     - Option B: **FHA** with **UFMIP 1.75%** financed + **Annual MIP** (0.55% when LTV ≥ 95%, 0.50% otherwise for a 30‑yr loan). Allow user to choose PMI vs FHA.
3. User can choose **Scenario**: `Purchase` or `Refinance` (affects CMHC and some copy).
4. Show **Monthly Cost of Ownership** = Mortgage P&I (per selected payment frequency) **+** mortgage insurance (if applicable) **+** **Property tax, Condo fee, Water, Electricity, Heating** (user inputs).
5. Provide **dynamic suggestions** for **City + Province/State** (Canada + USA) using a JavaScript dataset (no external API).
6. Support **payment frequencies**: `Monthly`, `Semi‑Monthly`, `Bi‑Weekly`, `Accelerated Bi‑Weekly`, `Weekly`, `Accelerated Weekly`. Amortization schedule recalculates accordingly.
7. Show an **Amortization graph** with **Principal vs Interest** components by period; **X‑axis labeled by Year** (0..N). Use **Chart.js**.
8. Keep the **existing site nav links**. Also add **inside‑page tabs** (non‑navigating placeholders) for future calculators: `GST/HST/PST (Coming Soon)`, `Child Planning (Coming Soon)`.
9. Add **SEO** (titles, meta description, OG/Twitter cards, canonical) and **JSON‑LD** (Organization, Website, WebApplication, BreadcrumbList, FAQPage).

---

## Tech Stack
- **Bootstrap 5.3.x** (no jQuery), vanilla **JavaScript**, and **Chart.js** (latest).
- One Bootstrap CSS include + one **bundle** JS include (Popper included). No duplicated libraries.
- Files to produce:
  - `index.html` (mortgage page, self‑contained).
  - `assets/app.css`
  - `assets/app.js`

---

## Page Structure (wireframe)
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Free Mortgage Calculator (Canada & USA) – Payments & Amortization</title>
  <meta name="description" content="Instant mortgage payments and total monthly cost of ownership for Canada and the USA. Supports CMHC, PMI/FHA, multiple payment frequencies, and a clear amortization graph.">
  <link rel="canonical" href="https://<BASE_URL>/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Free Mortgage Calculator (Canada & USA)">
  <meta property="og:description" content="Calculate payments, CMHC/PMI, and full monthly cost with taxes, utilities and condo fees.">
  <meta property="og:url" content="https://<BASE_URL>/">
  <meta property="og:image" content="https://<BASE_URL>/assets/og/mortgage.png">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/app.css">
</head>
<body class="d-flex flex-column min-vh-100">
  <!-- Site Navbar: keep the existing links (do NOT add gst-hst.html) -->
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand fw-semibold" href="index.html">Financial Calculators</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link active" href="index.html">Mortgage</a></li>
          <li class="nav-item"><a class="nav-link" href="youtube-calculator.html">YouTube</a></li>
          <li class="nav-item"><a class="nav-link" href="facebook-calculator.html">Facebook</a></li>
          <li class="nav-item"><a class="nav-link" href="instagram-calculator.html">Instagram</a></li>
          <li class="nav-item"><a class="nav-link" href="term-insurance-calculator.html">Term Insurance</a></li>
          <li class="nav-item"><a class="nav-link" href="universal-life-calculator.html">Universal Life</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="flex-grow-1">
    <header class="container py-4">
      <h1 class="h3 mb-2">Free Mortgage Calculator — Canada & USA</h1>
      <p class="text-muted mb-0">Calculate monthly payments and total monthly cost of ownership. Includes CMHC (Canada) and PMI/FHA (USA), with purchase or refinance scenarios.</p>
    </header>

    <!-- Country toggle -->
    <div class="container mb-3">
      <div class="btn-group" role="group" aria-label="Country">
        <input type="radio" class="btn-check" name="country" id="countryCAD" autocomplete="off" checked>
        <label class="btn btn-outline-primary" for="countryCAD">Canada (CAD)</label>
        <input type="radio" class="btn-check" name="country" id="countryUSD" autocomplete="off">
        <label class="btn btn-outline-primary" for="countryUSD">USA (USD)</label>
      </div>
    </div>

    <!-- Inside‑page tabs for future calculators (disabled placeholders) -->
    <div class="container mb-4">
      <ul class="nav nav-pills flex-wrap gap-2">
        <li class="nav-item"><button class="btn btn-sm btn-light border" disabled>GST/HST/PST (Coming Soon)</button></li>
        <li class="nav-item"><button class="btn btn-sm btn-light border" disabled>Child Planning (Coming Soon)</button></li>
      </ul>
    </div>

    <!-- Responsive grid: Inputs | Results | KPIs -->
    <div class="container-xxl pb-5">
      <div class="row g-4 align-items-start" id="grid">
        <!-- Inputs -->
        <aside class="col-12 col-lg-5 col-xl-4" id="inputs-col">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="btn-group mb-3" role="group" aria-label="Scenario">
                <input type="radio" class="btn-check" name="scenario" id="scenarioPurchase" autocomplete="off" checked>
                <label class="btn btn-outline-secondary" for="scenarioPurchase">Purchase</label>
                <input type="radio" class="btn-check" name="scenario" id="scenarioRefinance" autocomplete="off">
                <label class="btn btn-outline-secondary" for="scenarioRefinance">Refinance</label>
              </div>

              <!-- City + Province/State with dynamic suggestions -->
              <div class="mb-3">
                <label class="form-label">City & Province/State</label>
                <input id="cityInput" class="form-control" list="cityList" placeholder="e.g., Toronto, ON or San Francisco, CA">
                <datalist id="cityList"></datalist>
                <small class="text-muted">Start typing (try "Tor", "San", "Van", "Mon").</small>
              </div>

              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Home price / appraised value</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol">$</span>
                    <input id="homePrice" type="number" min="0" step="1000" class="form-control" value="700000" inputmode="numeric">
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Down payment</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol2">$</span>
                    <input id="downPayment" type="number" min="0" step="1000" class="form-control" value="140000" inputmode="numeric">
                  </div>
                  <small class="text-muted" id="downPctHelp"></small>
                </div>

                <div class="col-12">
                  <label class="form-label">Interest rate (annual %)</label>
                  <input id="rate" type="number" min="0" step="0.01" class="form-control" value="5.29" inputmode="decimal">
                </div>

                <div class="col-12">
                  <label class="form-label">Amortization (years)</label>
                  <select id="years" class="form-select">
                    <option>25</option><option>30</option><option>20</option><option>15</option><option>10</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">Payment frequency</label>
                  <select id="frequency" class="form-select">
                    <option value="monthly" selected>Monthly (12/yr)</option>
                    <option value="semi-monthly">Semi‑Monthly (24/yr)</option>
                    <option value="bi-weekly">Bi‑Weekly (26/yr)</option>
                    <option value="acc-bi-weekly">Accelerated Bi‑Weekly (26/yr, accelerated)</option>
                    <option value="weekly">Weekly (52/yr)</option>
                    <option value="acc-weekly">Accelerated Weekly (52/yr, accelerated)</option>
                  </select>
                </div>

                <!-- USA insurance choice appears only if USA selected and DP < 20% -->
                <div class="col-12 d-none" id="usaMIChoice">
                  <label class="form-label">Mortgage insurance (USA)</label>
                  <select id="usaMI" class="form-select">
                    <option value="pmi" selected>Conventional PMI (estimate)</option>
                    <option value="fha">FHA (UFMIP + Annual MIP)</option>
                  </select>
                </div>

                <!-- Monthly cost add‑ons -->
                <div class="col-12">
                  <label class="form-label">Property tax (monthly)</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol3">$</span>
                    <input id="tax" type="number" min="0" step="10" class="form-control" value="400">
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Condo fee (monthly)</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol4">$</span>
                    <input id="condo" type="number" min="0" step="10" class="form-control" value="300">
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Water (monthly)</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol5">$</span>
                    <input id="water" type="number" min="0" step="5" class="form-control" value="40">
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Electricity (monthly)</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol6">$</span>
                    <input id="electric" type="number" min="0" step="5" class="form-control" value="120">
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Heating (monthly)</label>
                  <div class="input-group">
                    <span class="input-group-text" id="currencySymbol7">$</span>
                    <input id="heating" type="number" min="0" step="5" class="form-control" value="100">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <section class="col-12 col-lg-7 col-xl-5" id="results-col">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h5 mb-3">Results</h2>
              <div class="d-flex flex-wrap gap-3 mb-3">
                <div>
                  <div class="text-muted small">Per‑period mortgage payment (P&I)</div>
                  <div class="fs-4 fw-semibold" id="paymentDisplay">$0.00</div>
                  <div class="small text-muted" id="frequencyLabel">Monthly • 12 payments/yr</div>
                </div>
                <div>
                  <div class="text-muted small">Monthly equivalent (P&I)</div>
                  <div class="fs-4 fw-semibold" id="monthlyEquiv">$0.00</div>
                </div>
              </div>

              <h3 class="h6 mt-4">Estimated Monthly Cost of Ownership</h3>
              <ul class="list-group mb-4" id="ownershipList"></ul>

              <h3 class="h6">Amortization by Year</h3>
              <canvas id="amortChart" height="260" aria-label="Amortization chart showing principal and interest by year"></canvas>
            </div>
          </div>
        </section>

        <!-- KPIs (optional on xl+) -->
        <aside class="col-12 col-xl-3 d-none d-xl-block" id="kpis-col">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Loan‑to‑Value (LTV)</div>
              <div class="fs-5 fw-semibold" id="ltvDisplay">0%</div>
              <hr>
              <div class="text-muted small">Insurance</div>
              <div class="small" id="miSummary">—</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>

  <footer class="border-top mt-auto">
    <div class="container py-4 small">
      © <span id="year"></span> Financial Calculators · <a href="privacy.html">Privacy</a>
    </div>
  </footer>

  <!-- JSON-LD: Organization, WebSite, WebApplication, BreadcrumbList, FAQPage -->
  <script type="application/ld+json" id="ld-org"></script>
  <script type="application/ld+json" id="ld-site"></script>
  <script type="application/ld+json" id="ld-app"></script>
  <script type="application/ld+json" id="ld-breadcrumb"></script>
  <script type="application/ld+json" id="ld-faq"></script>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/app.js"></script>
</body>
</html>
```

---

## CSS (`assets/app.css`)
- Minimal, utility‑driven styles.
- Ensure **no fixed widths** on columns or inputs; all controls are `width:100%` inside their column.
- Prevent horizontal scroll: `body{overflow-x:clip}`.
- Provide comfortable spacing: `.card{border-radius:1rem}`; `.card-body{padding:1rem 1.25rem}`.
- Respect reduced motion preferences.

---

## JavaScript (`assets/app.js`) — Required Behaviors

### 1) City/Province/State Suggestions
- Build a small **dataset** with **Canadian provinces/territories** and **US states**, plus **example cities** for each (enough to demo; easy to extend). Example:
```js
const geoData = [
  { city: "Toronto", region: "ON", country: "CA" },
  { city: "Vancouver", region: "BC", country: "CA" },
  { city: "Montreal", region: "QC", country: "CA" },
  { city: "Calgary", region: "AB", country: "CA" },
  { city: "San Francisco", region: "CA", country: "US" },
  { city: "New York", region: "NY", country: "US" },
  { city: "Seattle", region: "WA", country: "US" },
  { city: "Miami", region: "FL", country: "US" },
];
```
- On input typing, filter by prefix across `city`, `region`, and provide `<option>` values like `"Toronto, ON"` in the `<datalist>`.

### 2) Currency + Symbols
- Toggle **CAD/USD** symbols (`$` is fine; update copy and defaults as needed).
- Update displayed symbols in all input groups when toggling country.

### 3) Core Calculations
Let:
- `P` = loan principal (purchase: `price - downPayment` plus any financed insurance like CMHC premium or FHA UFMIP),
- `r` = nominal annual interest rate,
- `npy` = payments per year,
- `N` = total number of payments (`years * npy`),
- `i` = periodic rate (`r / 100 / npy`).

**Base payment (per period):**
```
payment = P * i * (1 + i)^N / ((1 + i)^N - 1)
```
If `i == 0`, then `payment = P / N`.

**Payment frequencies & npy values:**
- Monthly: **12**
- Semi‑Monthly: **24**
- Bi‑Weekly: **26**
- Weekly: **52**
- **Accelerated Bi‑Weekly:** compute regular **monthly** payment, divide by **2** -> per‑period; npy=26.
- **Accelerated Weekly:** compute regular **monthly** payment, divide by **4** -> per‑period; npy=52.

**Canada (CMHC) — Purchase only:**
- Compute **LTV** = `(loan before insurance / price) * 100`.
- If **LTV > 80%**, add **CMHC premium** to principal:
  - Use this table (approx, current typical):
    - ≤65%: 0.60%
    - 65.01–75%: 1.70%
    - 75.01–80%: 2.40%
    - 80.01–85%: 2.80%
    - 85.01–90%: 3.10%
    - 90.01–95%: 4.00%
- Premium is **financed**: `P += premiumAmount`.

**USA — Mortgage Insurance:**
- If **downPayment < 20%**:
  - **PMI (default):** estimate **annual PMI rate** (e.g., 0.5%) × current principal; divide by 12 for **monthly**. Show a selector to adjust (0.2%–1.5%).
  - **FHA option:** add **UFMIP = 1.75%** of base loan to P; monthly **MIP** = (`0.55%` if LTV ≥95% else `0.50%`) × current principal / 12.

> For Refinance in Canada: do **not** apply CMHC premium (set to 0), but keep LTV display.

### 4) Ownership Cost Breakdown
Create a list with:
- Mortgage P&I (monthly equivalent),
- Mortgage insurance (monthly, if any),
- Property tax (user input),
- Condo fee,
- Water,
- Electricity,
- Heating.
Sum to **Total Monthly Cost** and display prominently.

### 5) Amortization Schedule & Chart
- Generate a full schedule by period, tracking **interest** = `balance * i` and **principal** = `payment - interest`.
- Aggregate by **year** for the chart (sum of principal & interest per year).
- Use **Chart.js** with **year numbers on the X‑axis** (0..`years`). Two datasets: `Principal` and `Interest` (stacked bars or two lines).
- Recalculate and update on any input change, country toggle, scenario change, or frequency change.

### 6) UI/UX & Accessibility
- All inputs labeled; keyboard focus order logical.
- Touch targets ≥ 44×44px; line-height ≥ 1.5.
- Avoid CLS: set intrinsic sizes for any images/canvas.
- No console errors; no duplicated libraries.

### 7) JSON‑LD
Populate the script tags with:
- **Organization** and **WebSite** (sitewide info).
- **WebApplication** describing the calculator (name, url, offers price 0).
- **BreadcrumbList**: Home → Mortgage.
- **FAQPage**: include Q&As like:
  - *How do I calculate my mortgage payment?*
  - *What’s the difference between PMI and FHA?*
  - *How does CMHC work in Canada?*
  - *What are accelerated bi‑weekly payments?*

### 8) Misc
- `document.getElementById('year').textContent = new Date().getFullYear();`
- Provide small helper text for Purchase vs Refinance and for CMHC/FHA logic.

---

## Acceptance Criteria
- Page renders cleanly from **320px → 1920px** (no distortion on desktop).
- Country toggle updates currency + insurance rules; **Purchase vs Refinance** behaves correctly.
- Payment changes correctly across all six **payment frequencies**; **accelerated** modes reflect the monthly‑derived logic.
- Chart shows **years** on X‑axis with principal vs interest components.
- Monthly Cost of Ownership displays correct totals and breakdown.
- City/Province/State suggestions filter as user types.
- No references or links to `gst-hst.html` (placeholders only).
- Lighthouse mobile: **Performance ≥ 90**, **SEO = 100**, **Accessibility ≥ 95**, **Best Practices ≥ 95**.
- No console errors; HTML validates; single Bootstrap bundle.

---

## Deliverables
- `index.html`, `assets/app.css`, `assets/app.js` implemented per above.
- Brief README note explaining calculation assumptions (CMHC, PMI/FHA tables, accelerated payment logic) and how to extend the city dataset.
