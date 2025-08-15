
// ===== Utility Functions =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const formatUSD = (val) => `$${val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const formatPercent = (val) => `${val.toFixed(1)}%`;

// ===== Input Management =====
const inputs = {
  // Eligibility
  eligibility1: () => $('#eligibility1').checked,
  eligibility2: () => $('#eligibility2').checked,
  eligibility3: () => $('#eligibility3').checked,
  eligibility4: () => $('#eligibility4').checked,
  eligibility5: () => $('#eligibility5').checked,

  // Gifts
  starsReceived: () => parseFloat($('#starsReceived').value) || 0,

  // Subscriptions
  activeSubscribers: () => parseFloat($('#activeSubscribers').value) || 0,
  monthlyPrice: () => parseFloat($('#monthlyPrice').value) || 0,
  appStorePurchases: () => parseFloat($('#appStorePurchases').value) || 0,
  appStoreFee: () => parseFloat($('#appStoreFee').value) || 0,
  webPurchases: () => parseFloat($('#webPurchases').value) || 0,
  platformFee: () => parseFloat($('#platformFee').value) || 0,

  // Reels
  reelsPlays: () => parseFloat($('#reelsPlays').value) || 0,
  reelsRPM: () => parseFloat($('#reelsRPM').value) || 0,
  qualifiedPlayRate: () => parseFloat($('#qualifiedPlayRate').value) || 0,
  reelsCreatorShare: () => {
    const val = parseFloat($('#reelsCreatorShare').value);
    return isNaN(val) ? 45 : val;
  },
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

// Gifts_Revenue = Stars_received × 0.01
const calculateGifts = () => {
  return inputs.starsReceived() * 0.01;
};

// Subscriptions calculation
const calculateSubscriptions = () => {
  const subscribers = inputs.activeSubscribers();
  const price = inputs.monthlyPrice();
  const appStorePct = inputs.appStorePurchases() / 100;
  const appStoreFee = inputs.appStoreFee() / 100;
  const webPct = inputs.webPurchases() / 100;
  const platformFee = inputs.platformFee() / 100;

  const gross = subscribers * price;
  const netApp = (appStorePct * gross) * (1 - appStoreFee);
  const netWeb = (webPct * gross) * (1 - platformFee);

  return netApp + netWeb;
};

// Reels_Revenue = Plays × (Effective_RPM / 1000)
const calculateReels = () => {
  const qualifiedPlays = inputs.reelsPlays() * inputs.qualifiedPlayRate() / 100;
  return qualifiedPlays * (inputs.reelsRPM() / 1000) * (inputs.reelsCreatorShare() / 100);
};

// ===== Main Calculation Function =====
const calculate = () => {
  if (!checkEligibility()) {
    updateResults(0, 0, 0, 0);
    return;
  }

  const giftsRevenue = calculateGifts();
  const subscriptionsRevenue = calculateSubscriptions();
  const reelsRevenue = calculateReels();
  const totalRevenue = giftsRevenue + subscriptionsRevenue + reelsRevenue;

  updateResults(giftsRevenue, subscriptionsRevenue, reelsRevenue, totalRevenue);
};

// ===== Update Results Display =====
const updateResults = (gifts, subscriptions, reels, total) => {
  // Update total
  $('#estTotal').textContent = formatUSD(total);
  $('#stickyTotal').textContent = formatUSD(total);

  // Calculate percentages
  const giftsPct = total > 0 ? (gifts / total) * 100 : 0;
  const subscriptionsPct = total > 0 ? (subscriptions / total) * 100 : 0;
  const reelsPct = total > 0 ? (reels / total) * 100 : 0;

  // Update breakdown
  $('#estGifts').textContent = `${formatUSD(gifts)} (${formatPercent(giftsPct)})`;
  $('#estSubscriptions').textContent = `${formatUSD(subscriptions)} (${formatPercent(subscriptionsPct)})`;
  $('#estReels').textContent = `${formatUSD(reels)} (${formatPercent(reelsPct)})`;

  // Calculate Overall RPM (based on Reels plays only)
  const reelsPlays = inputs.reelsPlays();
  const overallRPM = reelsPlays > 0 ? total / (reelsPlays / 1000) : 0;
  $('#overallRPM').textContent = overallRPM > 0 ? formatUSD(overallRPM) : '—';

  // Show mobile sticky bar if total > 0
  const stickyBar = $('#mobileStickyBar');
  if (total > 0 && window.innerWidth <= 900) {
    stickyBar.classList.add('visible');
  } else {
    stickyBar.classList.remove('visible');
  }
};

// ===== Scenario Management =====
const updateScenarioVisibility = () => {
  const selectedScenario = $('input[name="scenario"]:checked').value;
  document.body.className = `scenario-${selectedScenario}`;
};

// ===== URL State Management =====
const getURLState = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    scenario: params.get('scenario') || 'all',
    starsReceived: params.get('starsReceived') || '10000',
    activeSubscribers: params.get('activeSubscribers') || '500',
    monthlyPrice: params.get('monthlyPrice') || '4.99',
    appStorePurchases: params.get('appStorePurchases') || '70',
    appStoreFee: params.get('appStoreFee') || '30',
    platformFee: params.get('platformFee') || '0',
    reelsPlays: params.get('reelsPlays') || '1000000',
    reelsRPM: params.get('reelsRPM') || '0.90',
    qualifiedPlayRate: params.get('qualifiedPlayRate') || '100',
    reelsCreatorShare: params.get('reelsCreatorShare') || '45',
    eligibility1: params.get('eligibility1') !== 'false',
    eligibility2: params.get('eligibility2') !== 'false',
    eligibility3: params.get('eligibility3') !== 'false',
    eligibility4: params.get('eligibility4') !== 'false',
    eligibility5: params.get('eligibility5') !== 'false',
  };
};

const setURLState = () => {
  const params = new URLSearchParams();
  
  params.set('scenario', $('input[name="scenario"]:checked').value);
  params.set('starsReceived', $('#starsReceived').value);
  params.set('activeSubscribers', $('#activeSubscribers').value);
  params.set('monthlyPrice', $('#monthlyPrice').value);
  params.set('appStorePurchases', $('#appStorePurchases').value);
  params.set('appStoreFee', $('#appStoreFee').value);
  params.set('platformFee', $('#platformFee').value);
  params.set('reelsPlays', $('#reelsPlays').value);
  params.set('reelsRPM', $('#reelsRPM').value);
  params.set('qualifiedPlayRate', $('#qualifiedPlayRate').value);
  params.set('reelsCreatorShare', $('#reelsCreatorShare').value);
  params.set('eligibility1', $('#eligibility1').checked);
  params.set('eligibility2', $('#eligibility2').checked);
  params.set('eligibility3', $('#eligibility3').checked);
  params.set('eligibility4', $('#eligibility4').checked);
  params.set('eligibility5', $('#eligibility5').checked);

  const url = new URL(window.location);
  url.search = params.toString();
  window.history.replaceState({}, '', url);
};

const loadFromURL = () => {
  const state = getURLState();
  
  // Set scenario
  $(`input[name="scenario"][value="${state.scenario}"]`).checked = true;
  updateScenarioVisibility();
  
  // Set form values
  $('#starsReceived').value = state.starsReceived;
  $('#activeSubscribers').value = state.activeSubscribers;
  $('#monthlyPrice').value = state.monthlyPrice;
  $('#appStorePurchases').value = state.appStorePurchases;
  $('#appStoreFee').value = state.appStoreFee;
  $('#platformFee').value = state.platformFee;
  $('#reelsPlays').value = state.reelsPlays;
  $('#reelsRPM').value = state.reelsRPM;
  $('#qualifiedPlayRate').value = state.qualifiedPlayRate;
  $('#reelsCreatorShare').value = state.reelsCreatorShare;
  
  // Set eligibility checkboxes
  $('#eligibility1').checked = state.eligibility1;
  $('#eligibility2').checked = state.eligibility2;
  $('#eligibility3').checked = state.eligibility3;
  $('#eligibility4').checked = state.eligibility4;
  $('#eligibility5').checked = state.eligibility5;

  // Sync sliders
  syncSliders();
  calculate();
};

// ===== Slider Synchronization =====
const syncSliders = () => {
  // App store purchases
  const appStorePurchases = parseFloat($('#appStorePurchases').value);
  $('#appStorePurchasesNum').value = appStorePurchases;
  $('#webPurchases').value = 100 - appStorePurchases;
};

// ===== Reset Function =====
const resetToDefaults = () => {
  // Reset eligibility (all checked)
  $$('[id^="eligibility"]').forEach(el => el.checked = true);
  
  // Reset scenario to 'all'
  $('#scenario-all').checked = true;
  updateScenarioVisibility();
  
  // Reset form values to defaults
  $('#starsReceived').value = '10000';
  $('#activeSubscribers').value = '500';
  $('#monthlyPrice').value = '4.99';
  $('#appStorePurchases').value = '70';
  $('#appStoreFee').value = '30';
  $('#platformFee').value = '0';
  $('#reelsPlays').value = '1000000';
  $('#reelsRPM').value = '0.90';
  $('#qualifiedPlayRate').value = '100';
  $('#reelsCreatorShare').value = '45';
  
  syncSliders();
  setURLState();
  calculate();
};

// ===== Copy Link Function =====
const copyInputsAsLink = () => {
  setURLState();
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = $('#copyLinkBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = window.location.href;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    const btn = $('#copyLinkBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
  });
};

// ===== Instagram ID Estimator =====
const strToSeed = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
};

const seededRng = (seed) => {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const generateMetrics = (id, start, end) => {
  const rand = seededRng(strToSeed(id + start + end));
  return {
    starsReceived: Math.floor(rand() * 5000),
    activeSubscribers: Math.floor(rand() * 2000),
    monthlyPrice: 4.99,
    appStorePurchases: 70,
    appStoreFee: 30,
    webPurchases: 30,
    platformFee: 0,
    reelsPlays: Math.floor(rand() * 2000000),
    reelsRPM: (0.5 + rand() * 1.5).toFixed(2),
    qualifiedPlayRate: (85 + rand() * 15).toFixed(1),
    reelsCreatorShare: 45
  };
};

const getDateRange = () => {
  const val = $('input[name="instaTimeWindow"]:checked').value;
  const today = new Date();
  if (val === 'custom') {
    return {
      start: $('#instaStartDate').value,
      end: $('#instaEndDate').value,
      label: `${$('#instaStartDate').value} to ${$('#instaEndDate').value}`
    };
  }
  const days = parseInt(val, 10);
  const startDate = new Date();
  startDate.setDate(today.getDate() - days);
  return {
    start: startDate.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
    label: `Last ${val} days`
  };
};

const fetchInstagram = () => {
  const id = $('#instaInput').value.trim().replace(/^@/, '');
  if (!id) {
    $('#instaStatus').textContent = 'Please enter an Instagram ID.';
    return;
  }

  const { start, end, label } = getDateRange();
  const metrics = generateMetrics(id, start, end);

  $('#starsReceived').value = metrics.starsReceived;
  $('#activeSubscribers').value = metrics.activeSubscribers;
  $('#monthlyPrice').value = metrics.monthlyPrice;
  $('#appStorePurchases').value = metrics.appStorePurchases;
  $('#appStoreFee').value = metrics.appStoreFee;
  $('#webPurchases').value = metrics.webPurchases;
  $('#platformFee').value = metrics.platformFee;
  $('#reelsPlays').value = metrics.reelsPlays;
  $('#reelsRPM').value = metrics.reelsRPM;
  $('#qualifiedPlayRate').value = metrics.qualifiedPlayRate;
  $('#reelsCreatorShare').value = metrics.reelsCreatorShare;

  syncSliders();
  calculate();

  const total = calculateGifts() + calculateSubscriptions() + calculateReels();
  const rpm = inputs.reelsPlays() > 0 ? total / (inputs.reelsPlays() / 1000) : 0;

  $('#instaTitle').textContent = `@${id}`;
  $('#instaRevenue').textContent = formatUSD(total);
  $('#instaRPM').textContent = rpm > 0 ? formatUSD(rpm) : '—';
  $('#instaDateRange').textContent = label;
  $('#instaSummary').classList.remove('hidden');
  $('#instaStatus').textContent = '';
};

// ===== Debounced Calculate =====
let calculateTimeout;
const debouncedCalculate = () => {
  clearTimeout(calculateTimeout);
  calculateTimeout = setTimeout(() => {
    syncSliders();
    setURLState();
    calculate();
  }, 150);
};

// ===== Event Listeners =====
const setupEventListeners = () => {
  // Time window radios for Instagram estimator
  $$('input[name="instaTimeWindow"]').forEach(radio => {
    radio.addEventListener('change', () => {
      $('#instaCustomRange').classList.toggle('hidden', radio.value !== 'custom');
    });
  });

  // Set default dates
  const today = new Date();
  const thirty = new Date();
  thirty.setDate(today.getDate() - 30);
  $('#instaEndDate').value = today.toISOString().split('T')[0];
  $('#instaStartDate').value = thirty.toISOString().split('T')[0];

  // Fetch button
  $('#fetchInstaBtn').addEventListener('click', fetchInstagram);

  // Eligibility checkboxes
  $$('[id^="eligibility"]').forEach(el => {
    el.addEventListener('change', debouncedCalculate);
  });

  // Scenario selector
  $$('input[name="scenario"]').forEach(el => {
    el.addEventListener('change', () => {
      updateScenarioVisibility();
      debouncedCalculate();
    });
  });

  // Form inputs
  $$('input[type="number"], input[type="range"]').forEach(el => {
    el.addEventListener('input', debouncedCalculate);
  });

  // Slider synchronization
  $('#appStorePurchases').addEventListener('input', () => {
    const value = parseFloat($('#appStorePurchases').value);
    $('#appStorePurchasesNum').value = value;
    $('#webPurchases').value = 100 - value;
    debouncedCalculate();
  });

  $('#appStorePurchasesNum').addEventListener('input', () => {
    const value = Math.min(100, Math.max(0, parseFloat($('#appStorePurchasesNum').value) || 0));
    $('#appStorePurchasesNum').value = value;
    $('#appStorePurchases').value = value;
    $('#webPurchases').value = 100 - value;
    debouncedCalculate();
  });

  // Reset buttons
  $('#resetBtn').addEventListener('click', resetToDefaults);
  $('#resetBtnMobile').addEventListener('click', resetToDefaults);

  // Copy link button
  $('#copyLinkBtn').addEventListener('click', copyInputsAsLink);

  // Mobile sticky bar visibility
  window.addEventListener('resize', () => {
    const stickyBar = $('#mobileStickyBar');
    if (window.innerWidth > 900) {
      stickyBar.classList.remove('visible');
    } else {
      const total = parseFloat($('#estTotal').textContent.replace(/[$,]/g, '')) || 0;
      if (total > 0) {
        stickyBar.classList.add('visible');
      }
    }
  });
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadFromURL();
  
  // Initial calculation
  calculate();
});
