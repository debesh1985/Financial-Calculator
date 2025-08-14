
// ===== Utilities =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const fmtUSD = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n || 0);
const fmtPct = n => `${(n||0).toFixed(0)}%`;
const debounce = (fn, ms=150) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

// ===== Inputs =====
const inputs = {
  format: () => $('input[name="format"]:checked').value,
  modWatch: () => $('#mod-watch').checked,
  modShorts: () => $('#mod-shorts').checked,
  modPremium: () => $('#mod-premium').checked,
  videoLength: () => Math.max(0, Number($('#videoLength').value||0)),
  midrolls: () => Math.max(0, Number($('#midrolls').value||0)),
  preRoll: () => $('#preRoll').checked,
  midRoll: () => $('#midRoll').checked,
  postRoll: () => $('#postRoll').checked,
  viewsLF: () => Math.max(0, Number($('#viewsLF').value||0)),
  viewsShorts: () => Math.max(0, Number($('#viewsShorts').value||0)),
  monetizableRate: () => clamp(Number($('#monetizableRate').value||85), 0, 100),
  adFillRate: () => clamp(Number($('#adFillRate').value||90), 0, 100),
  premiumViews: () => clamp(Number($('#premiumViews').value||5), 0, 100),
  premiumRPM: () => Math.max(0, Number($('#premiumRPM').value||3)),
  avgCPM: () => Math.max(0, Number($('#avgCPM').value||8)),
  seasonality: () => clamp(Number($('#seasonality').value||100), 50, 150),
  inventoryAvail: () => clamp(Number($('#inventoryAvail').value||100), 50, 100),
  creatorShareLF: () => clamp(Number($('#creatorShareLF').value||55), 0, 100),
  creatorShareShorts: () => clamp(Number($('#creatorShareShorts').value||45), 0, 100),
  additionalSharing: () => clamp(Number($('#additionalSharing').value||0), 0, 50),
  manualImp: () => $('#manualImp').checked,
  adImpressionsManual: () => Math.max(0, Number($('#adImpressionsManual').value||2.5)),
  shortsRPM: () => Math.max(0, Number($('#shortsRPM').value||0.8))
};

// ===== Calculations =====
const calc = () => {
  const fmt = inputs.format();
  let lfAdsUSD = 0, shortsUSD = 0, premiumUSD = 0;

  // Long-form ads revenue
  if ((fmt === 'long' || fmt === 'both') && inputs.modWatch()) {
    const views = inputs.viewsLF();
    const monetizableViews = views * (inputs.monetizableRate() / 100);
    
    // Calculate ad impressions per view
    let adImpressions = 0;
    if (inputs.manualImp()) {
      adImpressions = inputs.adImpressionsManual();
    } else {
      if (inputs.preRoll()) adImpressions += 1;
      if (inputs.midRoll() && inputs.videoLength() >= 8) adImpressions += inputs.midrolls();
      if (inputs.postRoll()) adImpressions += 0.5; // Post-roll has lower fill
    }
    
    const totalImpressions = monetizableViews * adImpressions * (inputs.adFillRate() / 100);
    const grossRevenue = (totalImpressions / 1000) * inputs.avgCPM();
    const seasonalRevenue = grossRevenue * (inputs.seasonality() / 100);
    const inventoryRevenue = seasonalRevenue * (inputs.inventoryAvail() / 100);
    const creatorRevenue = inventoryRevenue * (inputs.creatorShareLF() / 100);
    lfAdsUSD = creatorRevenue * (1 - inputs.additionalSharing() / 100);
  }

  // Shorts revenue
  if ((fmt === 'shorts' || fmt === 'both') && inputs.modShorts()) {
    const views = inputs.viewsShorts();
    const baseRevenue = (views / 1000) * inputs.shortsRPM();
    const creatorRevenue = baseRevenue * (inputs.creatorShareShorts() / 100);
    shortsUSD = creatorRevenue * (1 - inputs.additionalSharing() / 100);
  }

  // Premium revenue
  if (inputs.modPremium()) {
    const totalViews = (fmt === 'long' ? inputs.viewsLF() : 0) + 
                      (fmt === 'shorts' ? inputs.viewsShorts() : 0) +
                      (fmt === 'both' ? inputs.viewsLF() + inputs.viewsShorts() : 0);
    const premiumViews = totalViews * (inputs.premiumViews() / 100);
    premiumUSD = (premiumViews / 1000) * inputs.premiumRPM();
  }

  const total = lfAdsUSD + shortsUSD + premiumUSD;
  const totalViews = (fmt === 'long' ? inputs.viewsLF() : 0) + 
                     (fmt === 'shorts' ? inputs.viewsShorts() : 0) +
                     (fmt === 'both' ? inputs.viewsLF() + inputs.viewsShorts() : 0);
  const overallRPM = totalViews > 0 ? (total / totalViews) * 1000 : 0;

  return { lfAdsUSD, shortsUSD, premiumUSD, total, overallRPM };
};

// ===== UI Updates =====
const updateUI = ()=>{
  // Toggle visibility of LF/Short fields by format
  const fmt = inputs.format();
  $$('.lf-only').forEach(el=> el.classList.toggle('hidden', !(fmt==='long'||fmt==='both')));
  $$('.sh-only').forEach(el=> el.classList.toggle('hidden', !(fmt==='shorts'||fmt==='both')));

  // Midroll enablement
  const len = inputs.videoLength();
  const mid = $('#midrolls');
  if(len < 8){ mid.value = 0; mid.disabled = true; } else { mid.disabled = false; }

  // Manual impressions override row
  $('#manualImpRow').classList.toggle('hidden', !inputs.manualImp());

  // Compute
  const { lfAdsUSD, shortsUSD, premiumUSD, total, overallRPM } = calc();

  // Update Results
  $('#estTotal').textContent = fmtUSD(total);
  $('#stickyTotal').textContent = fmtUSD(total);
  const sum = total || 1; // avoid NaN for percentages
  const pct = (x)=> `${Math.round((x/sum)*100)}%`;
  $('#estLF').textContent = `${fmtUSD(lfAdsUSD)} (${pct(lfAdsUSD)})`;
  $('#estSH').textContent = `${fmtUSD(shortsUSD)} (${pct(shortsUSD)})`;
  $('#estPR').textContent = `${fmtUSD(premiumUSD)} (${pct(premiumUSD)})`;
  $('#overallRPM').textContent = fmtUSD(overallRPM);
};

const recalc = debounce(()=>{ sanitize(); updateUI(); syncQuery(); }, 120);

// ===== Input Sanitization =====
const sanitize = ()=>{
  // Sync sliders with number inputs
  const sliderPairs = [
    ['monetizableRate', 'monetizableRateNum'],
    ['adFillRate', 'adFillRateNum'],
    ['premiumViews', 'premiumViewsNum'],
    ['seasonality', 'seasonalityNum'],
    ['inventoryAvail', 'inventoryAvailNum'],
    ['additionalSharing', 'additionalSharingNum']
  ];
  
  sliderPairs.forEach(([sliderId, numberId]) => {
    const slider = $(`#${sliderId}`);
    const number = $(`#${numberId}`);
    if (slider && number) {
      const val = Number(slider.value);
      if (number.value != val) number.value = val;
    }
  });
};

// ===== URL State Management =====
const syncQuery = ()=>{
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

const loadFromQuery = ()=>{
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
const resetToDefaults = ()=>{
  // Format
  $('#fmt-long').checked = true;
  
  // Channel & Video Settings
  $('#mod-watch').checked = true;
  $('#mod-shorts').checked = true;
  $('#mod-premium').checked = true;
  $('#preRoll').checked = true;
  $('#midRoll').checked = true;
  $('#postRoll').checked = false;
  $('#videoLength').value = 10;
  $('#midrolls').value = 2;
  
  // Viewer & Context
  $('#viewsLF').value = 100000;
  $('#viewsShorts').value = 500000;
  $('#monetizableRate').value = 85;
  $('#monetizableRateNum').value = 85;
  $('#adFillRate').value = 90;
  $('#adFillRateNum').value = 90;
  $('#premiumViews').value = 5;
  $('#premiumViewsNum').value = 5;
  $('#premiumRPM').value = 3.00;
  
  // Auction & Demand
  $('#avgCPM').value = 8.00;
  $('#seasonality').value = 100;
  $('#seasonalityNum').value = 100;
  $('#inventoryAvail').value = 100;
  $('#inventoryAvailNum').value = 100;
  
  // Rights & Revenue
  $('#creatorShareLF').value = 55;
  $('#creatorShareShorts').value = 45;
  $('#additionalSharing').value = 0;
  $('#additionalSharingNum').value = 0;
  
  // Format-specific
  $('#manualImp').checked = false;
  $('#adImpressionsManual').value = 2.5;
  $('#shortsRPM').value = 0.80;
  
  recalc();
};

const copyInputsAsLink = async ()=>{
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
const bindEvents = ()=>{
  // All inputs trigger recalc
  $$('input, select').forEach(el => {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  });
  
  // Slider-number sync
  const sliderPairs = [
    ['monetizableRate', 'monetizableRateNum'],
    ['adFillRate', 'adFillRateNum'],
    ['premiumViews', 'premiumViewsNum'],
    ['seasonality', 'seasonalityNum'],
    ['inventoryAvail', 'inventoryAvailNum'],
    ['additionalSharing', 'additionalSharingNum']
  ];
  
  sliderPairs.forEach(([sliderId, numberId]) => {
    const slider = $(`#${sliderId}`);
    const number = $(`#${numberId}`);
    
    if (slider && number) {
      slider.addEventListener('input', () => {
        number.value = slider.value;
        recalc();
      });
      
      number.addEventListener('input', () => {
        slider.value = number.value;
        recalc();
      });
    }
  });
  
  // Format toggle updates
  $$('input[name="format"]').forEach(el => {
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
document.addEventListener('DOMContentLoaded', ()=>{
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

// ===== Unit Tests (commented examples) =====
/*
Test Case 1: Basic Long-form
- Format: Long-form
- Views: 100,000
- CPM: $5
- Expected: ~$206 (100k * 0.85 * 0.9 * 2.5 * $5/1000 * 0.55)

Test Case 2: Shorts only
- Format: Shorts  
- Views: 500,000
- Shorts RPM: $0.80
- Expected: ~$180 (500k * $0.8/1000 * 0.45)

Test Case 3: Both formats
- Long-form: 50k views
- Shorts: 200k views  
- Expected: Sum of both calculations
*/
