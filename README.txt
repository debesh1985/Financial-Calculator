Mortgage Calculator — Canada & USA (static site) + GST/HST Calculator

Structure:
- index.html                 (Mortgage calculator)
- gst-hst.html               (GST/HST calculator)
- assets/
  - style.css               (shared styles)
  - app.js                  (mortgage logic)
  - tax.js                  (GST/HST logic)

How to host on Hostinger (hPanel / File Manager):
1) Upload and extract the ZIP to your domain's public directory (usually `public_html/`).
2) Ensure `index.html`, `gst-hst.html`, and `assets/` sit directly under `public_html/` (or in the same folder).
3) Open your domain:
   - `/` → Mortgage Calculator
   - `/gst-hst.html` → GST/HST Calculator

Notes:
- Canada payments use semi-annual compounding converted to a monthly effective rate.
- USA payments use monthly compounding.
- CMHC premium (Canada) can be financed into the mortgage if selected.
- USA: choose FHA (UFMIP + MIP) or Conventional PMI when LTV > 80%.
- All rates and buckets are configurable inside assets/app.js (CONFIG object).
- Tax rates in assets/tax.js include province HST or GST only (PST/QST not included).
- This is for estimates only; confirm with lenders and official tax sources.
- Mortgage rates shown in the header ticker are retrieved from external APIs (Ratehub for Canada and Financial Modeling Prep for the USA) and refresh every 15 minutes.
