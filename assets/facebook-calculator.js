
// ===== Utilities =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const fmtUSD = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n || 0);
const fmtPct = n => `${(n||0).toFixed(0)}%`;
const debounce = (fn, ms=150) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

// ===== Input Getters =====
const inputs = {
  scenario: () => $('input[name="scenario"]:checked').value,
  
  // Eligibility
  eligibility1: () => $('#eligibility1').checked,
  eligibility2: () => $('#eligibility2').checked,
  eligibility3: () => $('#eligibility3').checked,
  eligibility4: () => $('#eligibility4').checked,
  eligibility5: () => $('#eligibility5').checked,
  
  // Stars
  starsReceived: () => Math.max(0, Number($('#starsReceived').value||0)),
  
  // Subscriptions
  activeSubscribers: () => Math.max(0, Number($('#activeSubscribers').value||0)),
  monthlyPrice: () => Math.max(0, Number($('#monthlyPrice').value||0)),
  appStorePurchases: () => clamp(Number($('#appStorePurchases').value||70), 0, 100),
  appStoreFee: () => clamp(Number($('#appStoreFee').value||30), 0, 50),
  webPurchases: () => clamp(Number($('#webPurchases').value||30), 0, 100),
  platformFee: () => clamp(Number($('#platformFee').value||0), 0, 50),
  
  // Reels
  reelsPlays: () => Math.max(0, Number($('#reelsPlays').value||0)),
  reelsRPM: () => Math.max(0, Number($('#reelsRPM').value||0)),
  
  // Long-form
  longformViews: () => Math.max(0, Number($('#longformViews').value||0)),
  monetizableRate: () => clamp(Number($('#monetizableRate').value||85), 0, 100),
  fillRate: () => clamp(Number($('#fillRate').value||90), 0, 100),
  adImpressions: () => Math.max(0, Number($('#adImpressions').value||1.5)),
  eCPM: () => Math.max(0, Number($('#eCPM').value||6)),
  creatorShare: () => clamp(Number($('#creatorShare').value||55), 0, 100),
  additionalReductions: () => clamp(Number($('#additionalReductions').value||0), 0, 50),
  
  // Branded Content
  guaranteedImpressions: () => Math.max(0, Number($('#guaranteedImpressions').value||0)),
  brandedCPM: () => Math.max(0, Number($('#brandedCPM').value||15)),
  usageRightsFee: () => Math.max(0, Number($('#usageRightsFee').value||0)),
  deliverablesFee: () => Math.max(0, Number($('#deliverablesFee').value||0))
};

// ===== Eligibility Check =====
const checkEligibility = () => {
  const allEligible = inputs.eligibility1() && inputs.eligibility2() && 
                     inputs.eligibility3() && inputs.eligibility4() && inputs.eligibility5();
  
  $('#eligibilityWarning').classList.toggle('hidden', allEligible);
  
  // Disable calculator if not eligible
  $$('input[type="number"], input[type="range"]').forEach(input => {
    input.disabled = !allEligible;
  });
  
  $$('.btn').forEach(btn => {
    if (btn.id !== 'resetBtn' && btn.id !== 'resetBtnMobile') {
      btn.disabled = !allEligible;
    }
  });
  
  return allEligible;
};

// ===== Calculations =====
const calc = () => {
  if (!checkEligibility()) {
    return { starsUSD: 0, subscriptionsUSD: 0, reelsUSD: 0, longformUSD: 0, brandedUSD: 0, total: 0, overallRPM: 0 };
  }
  
  // Stars Revenue = Stars_received × 0.01
  const starsUSD = inputs.starsReceived() * 0.01;
  
  // Subscriptions Revenue
  const gross = inputs.activeSubscribers() * inputs.monthlyPrice();
  const appPercent = inputs.appStorePurchases() / 100;
  const webPercent = (100 - inputs.appStorePurchases()) / 100;
  const netApp = (appPercent * gross) * (1 - inputs.appStoreFee() / 100);
  const netWeb = (webPercent * gross) * (1 - inputs.platformFee() / 100);
  const subscriptionsUSD = netApp + netWeb;
  
  // Reels Revenue = Plays × (Effective_RPM / 1000)
  const reelsUSD = inputs.reelsPlays() * (inputs.reelsRPM() / 1000);
  
  // Long-form Revenue
  const eligibleViews = inputs.longformViews() * (inputs.monetizableRate() / 100);
  const impressions = eligibleViews * (inputs.fillRate() / 100) * inputs.adImpressions();
  const adRevenue = impressions * (inputs.eCPM() / 1000);
  const longformUSD = adRevenue * (inputs.creatorShare() / 100) * (1 - inputs.additionalReductions() / 100);
  
  // Branded Content Revenue
  const brandedUSD = (inputs.guaranteedImpressions() / 1000) * inputs.brandedCPM() + 
                     inputs.usageRightsFee() + inputs.deliverablesFee();
  
  const total = starsUSD + subscriptionsUSD + reelsUSD + longformUSD + brandedUSD;
  
  // Overall RPM calculation
  const totalViews = inputs.reelsPlays() + inputs.longformViews();
  const overallRPM = totalViews > 0 ? (total / totalViews) * 1000 : 0;
  
  return { starsUSD, subscriptionsUSD, reelsUSD, longformUSD, brandedUSD, total, overallRPM };
};

// ===== UI Updates =====
const updateUI = () => {
  // Update scenario visibility
  const scenario = inputs.scenario();
  const inputsCard = $('#inputs');
  inputsCard.className = `card scenario-${scenario}`;
  
  // Update web purchases (auto-calculated)
  $('#webPurchases').value = 100 - inputs.appStorePurchases();
  
  // Sync sliders with number inputs
  $('#appStorePurchasesNum').value = $('#appStorePurchases').value;
  $('#monetizableRateNum').value = $('#monetizableRate').value;
  $('#fillRateNum').value = $('#fillRate').value;
  $('#additionalReductionsNum').value = $('#additionalReductions').value;
  
  // Calculate results
  const { starsUSD, subscriptionsUSD, reelsUSD, longformUSD, brandedUSD, total, overallRPM } = calc();
  
  // Update results display
  $('#estTotal').textContent = fmtUSD(total);
  $('#stickyTotal').textContent = fmtUSD(total);
  
  const sum = total || 1; // avoid NaN for percentages
  const pct = (x) => `${Math.round((x/sum)*100)}%`;
  
  $('#estStars').textContent = `${fmtUSD(starsUSD)} (${pct(starsUSD)})`;
  $('#estSubscriptions').textContent = `${fmtUSD(subscriptionsUSD)} (${pct(subscriptionsUSD)})`;
  $('#estReels').textContent = `${fmtUSD(reelsUSD)} (${pct(reelsUSD)})`;
  $('#estLongform').textContent = `${fmtUSD(longformUSD)} (${pct(longformUSD)})`;
  $('#estBranded').textContent = `${fmtUSD(brandedUSD)} (${pct(brandedUSD)})`;
  $('#overallRPM').textContent = fmtUSD(overallRPM);
};

const recalc = debounce(() => { updateUI(); syncQuery(); }, 120);

// ===== URL State Management =====
const syncQuery = () => {
  const params = new URLSearchParams();
  
  // Add all input values to URL
  Object.keys(inputs).forEach(key => {
    if (typeof inputs[key] === 'function') {
      const val = inputs[key]();
      if (val !== undefined && val !== null) {
        params.set(key, val);
      }
    }
  });
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, '', newUrl);
};

const loadFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  
  params.forEach((value, key) => {
    const element = $(`#${key}`);
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = value === 'true';
      } else if (element.type === 'radio') {
        if (element.value === value) element.checked = true;
      } else {
        element.value = value;
      }
    }
    
    // Handle slider pairs
    if (key.endsWith('Num')) {
      const sliderKey = key.replace('Num', '');
      const slider = $(`#${sliderKey}`);
      if (slider) slider.value = value;
    }
  });
};

// ===== Reset & Copy Functions =====
const resetToDefaults = () => {
  // Scenario
  $('#scenario-all').checked = true;
  
  // Eligibility (all checked)
  $$('#eligibilitySection input[type="checkbox"]').forEach(cb => cb.checked = true);
  
  // Stars
  $('#starsReceived').value = 5000;
  
  // Subscriptions
  $('#activeSubscribers').value = 200;
  $('#monthlyPrice').value = 4.99;
  $('#appStorePurchases').value = 70;
  $('#appStorePurchasesNum').value = 70;
  $('#appStoreFee').value = 30;
  $('#webPurchases').value = 30;
  $('#platformFee').value = 0;
  
  // Reels
  $('#reelsPlays').value = 100000;
  $('#reelsRPM').value = 0.90;
  
  // Long-form
  $('#longformViews').value = 50000;
  $('#monetizableRate').value = 85;
  $('#monetizableRateNum').value = 85;
  $('#fillRate').value = 90;
  $('#fillRateNum').value = 90;
  $('#adImpressions').value = 1.5;
  $('#eCPM').value = 6.00;
  $('#creatorShare').value = 55;
  $('#additionalReductions').value = 0;
  $('#additionalReductionsNum').value = 0;
  
  // Branded Content
  $('#guaranteedImpressions').value = 50000;
  $('#brandedCPM').value = 15.00;
  $('#usageRightsFee').value = 0;
  $('#deliverablesFee').value = 0;
  
  recalc();
};

const copyInputsAsLink = async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    const btn = $('#copyLinkBtn');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  } catch (err) {
    console.warn('Copy failed:', err);
    // Fallback: select the URL
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
};

// ===== Event Bindings =====
const bindEvents = () => {
  // All inputs trigger recalc
  $$('input, select').forEach(el => {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  });
  
  // Slider-number sync
  const sliderPairs = [
    ['appStorePurchases', 'appStorePurchasesNum'],
    ['monetizableRate', 'monetizableRateNum'],
    ['fillRate', 'fillRateNum'],
    ['additionalReductions', 'additionalReductionsNum']
  ];
  
  sliderPairs.forEach(([sliderId, numberId]) => {
    const slider = $(`#${sliderId}`);
    const number = $(`#${numberId}`);
    
    if (slider && number) {
      slider.addEventListener('input', () => {
        number.value = slider.value;
        // Auto-calculate web purchases
        if (sliderId === 'appStorePurchases') {
          $('#webPurchases').value = 100 - slider.value;
        }
        recalc();
      });
      
      number.addEventListener('input', () => {
        slider.value = number.value;
        // Auto-calculate web purchases
        if (sliderId === 'appStorePurchases') {
          $('#webPurchases').value = 100 - number.value;
        }
        recalc();
      });
    }
  });
  
  // Scenario toggle updates
  $$('input[name="scenario"]').forEach(el => {
    el.addEventListener('change', () => {
      $$('label[role="tab"]').forEach(label => label.setAttribute('aria-selected', 'false'));
      $(`label[for="${el.id}"]`).setAttribute('aria-selected', 'true');
      recalc();
    });
  });
  
  // Button events
  $('#resetBtn').addEventListener('click', resetToDefaults);
  $('#resetBtnMobile').addEventListener('click', resetToDefaults);
  $('#copyLinkBtn').addEventListener('click', copyInputsAsLink);
  
  // Mobile sticky bar visibility
  const handleScroll = () => {
    const results = $('#results');
    const sticky = $('#mobileStickyBar');
    if (results && sticky) {
      const rect = results.getBoundingClientRect();
      sticky.classList.toggle('visible', rect.bottom < 0);
    }
  };
  
  window.addEventListener('scroll', debounce(handleScroll, 50));
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromQuery();
  bindEvents();
  recalc();
  
  // Handle mobile sticky bar initially
  setTimeout(() => {
    const handleScroll = () => {
      const results = $('#results');
      const sticky = $('#mobileStickyBar');
      if (results && sticky) {
        const rect = results.getBoundingClientRect();
        sticky.classList.toggle('visible', rect.bottom < 0);
      }
    };
    handleScroll();
  }, 100);
});

// ===== Unit Test Examples =====
/*
Test Case 1: Stars only
- Stars received: 1000
- Expected: $10 (1000 × 0.01)

Test Case 2: Subscriptions
- Subscribers: 100, Price: $5, App: 70%, App fee: 30%, Web: 30%, Platform fee: 0%
- Expected: ~$385 (100×$5×0.7×0.7 + 100×$5×0.3×1.0)

Test Case 3: Reels
- Plays: 100,000, RPM: $1.00
- Expected: $100 (100,000 × $1.00/1000)

Test Case 4: Long-form
- Views: 10,000, Monetizable: 85%, Fill: 90%, Impressions: 1.5, eCPM: $6, Share: 55%
- Expected: ~$37.74

Test Case 5: Branded Content
- Impressions: 50,000, CPM: $15, Usage: $100, Deliverables: $200
- Expected: $1,050 (50×$15 + $100 + $200)
*/
