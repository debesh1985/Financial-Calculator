
# Term Life Insurance Calculator - SEO Implementation Guide

## Overview
This implementation creates two SEO-optimized routes for the term life insurance premium calculator, targeting USA and Canada markets specifically.

## Routes Created
- `/us/term-life-insurance-premium-calculator/` - US version with USD currency
- `/ca/term-life-insurance-premium-calculator/` - Canada version with CAD currency

## Technical SEO Features

### 1. URL Structure & Hreflang
- Clean, descriptive URLs with geo-targeting
- Proper hreflang implementation for en-US and en-CA
- Canonical URLs pointing to themselves
- Country-specific navigation between versions

### 2. On-Page SEO
- Optimized titles (≤60 characters)
- Meta descriptions (140-160 characters)
- Proper heading hierarchy (H1 > H2 > H3)
- Schema.org structured data (WebSite, WebPage, BreadcrumbList, WebApplication, FAQPage)

### 3. Performance Optimization
- Critical CSS inlined (<10KB)
- Non-critical CSS loaded with media="print" onload pattern
- JavaScript deferred
- System font stack (no external fonts)
- Optimized for Core Web Vitals

### 4. Mobile-First Design
- Responsive grid layouts
- Touch-friendly interface
- Accessible form controls
- Proper viewport settings

## Keyword Map

### Primary Keywords
**US Version:**
- term life insurance calculator (Title, H1, intro)
- term insurance premium calculator (meta description, content)
- life insurance estimate (intro, content)
- term life cost (meta keywords, content)

**Canada Version:**
- term life insurance calculator Canada (Title, H1, intro)
- Canadian term insurance premium calculator (meta description, content)
- Canadian life insurance estimate (intro, content)
- term life cost Canada (meta keywords, content)

### Secondary Keywords
- monthly premium calculator
- life insurance quotes calculator
- coverage amount calculator
- premium estimator
- insurance cost calculator

### Long-Tail Keywords (in FAQ and content)
- how much life insurance do I need
- term vs whole life insurance
- what affects life insurance premiums
- life insurance medical exam requirements
- convert term to permanent insurance

### Geo Modifiers
**US:** USA, United States, American
**Canada:** Canadian, Canada

## Content Sections

### 1. Introduction (150-220 words)
Natural keyword integration explaining term life insurance, coverage calculation methods, and risk factors.

### 2. How-To Sections
- How we calculate coverage
- How premiums are estimated  
- Risk multipliers explanation
- US vs Canada differences (geo-specific)

### 3. FAQ Section (10 Q&As)
Each FAQ targets specific long-tail keywords and provides 2-5 sentence answers with structured data markup.

## Structured Data Implementation

### WebSite Schema
```json
{
  "@type": "WebSite",
  "potentialAction": {
    "@type": "SearchAction"
  }
}
```

### WebApplication Schema
```json
{
  "@type": "WebApplication",
  "applicationCategory": "FinanceApplication",
  "offers": {
    "price": "0",
    "priceCurrency": "USD/CAD"
  }
}
```

### FAQPage Schema
Complete Q&A markup for all 10 FAQ items.

## Analytics & Tracking
Event tracking hooks added for:
- Premium calculations
- Form interactions
- Country switching
- FAQ expansions

## File Structure
```
/us/term-life-insurance-premium-calculator/
  - index.html (US-specific content)
/ca/term-life-insurance-premium-calculator/  
  - index.html (Canada-specific content)
/assets/
  - term-insurance-calculator-us.js
  - term-insurance-calculator-ca.js
  - term-insurance-styles.css (shared)
og-image.png (1200x630, <300KB)
favicon.ico
apple-touch-icon.png
sitemap.xml (updated)
robots.txt (updated)
```

## Content Localization

### US Version
- Currency: USD
- Rates: US mortality tables
- Content: References to US healthcare system, tax implications
- Regulatory: US insurance regulations

### Canada Version  
- Currency: CAD
- Rates: Canadian mortality tables (typically 15% lower)
- Content: References to Canadian healthcare system, tax implications
- Regulatory: Canadian insurance regulations

## Maintenance Notes

### Update FAQ Content
FAQ content is embedded in both HTML and JSON-LD schema. Update both locations when making changes.

### Rate Updates
Base premium rates are in the respective JavaScript files:
- `/assets/term-insurance-calculator-us.js` - US rates
- `/assets/term-insurance-calculator-ca.js` - Canadian rates

### Adding New Countries
1. Create new route folder structure
2. Copy and localize HTML template
3. Create country-specific JavaScript file
4. Update sitemap.xml and robots.txt
5. Add hreflang tags to all versions

## Performance Targets
- LCP ≤ 2.0s
- CLS ≤ 0.05  
- INP ≤ 200ms
- Mobile PageSpeed Score ≥ 90

## Competitive Advantage
- Dual-country optimization with proper geo-targeting
- Comprehensive FAQ section with schema markup
- Mobile-first responsive design
- Fast loading with optimized Core Web Vitals
- Industry-standard actuarial calculations
- No external dependencies for maximum performance
