
// ===== Utilities =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const fmtUSD = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n || 0);
const fmtPct = n => `${(n||0).toFixed(0)}%`;
const debounce = (fn, ms=150) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

// Track programmatic eligibility
let profileEligible = false;

// ===== Input Getters =====
const inputs = {
  scenario: () => $('input[name="scenario"]:checked').value,

  // Stars
  starsReceived: () => Math.max(0, Number($('#starsReceived').value||0)),
  starsFee: () => clamp(Number($('#starsFee').value||5), 0, 50),

  // Subscriptions
  subscribersYear1: () => Math.max(0, Number($('#subscribersYear1').value||0)),
  subscribersYear2Plus: () => Math.max(0, Number($('#subscribersYear2Plus').value||0)),
  monthlyPrice: () => Math.max(0, Number($('#monthlyPrice').value||0)),
  appStorePurchases: () => clamp(Number($('#appStorePurchases').value||70), 0, 100),
  webPurchases: () => clamp(Number($('#webPurchases').value||30), 0, 100),
  platformFee: () => clamp(Number($('#platformFee').value||0), 0, 50),
  metaPlatformFee: () => clamp(Number($('#metaPlatformFee').value||0), 0, 50),
  
  // Reels
  reelsPlays: () => Math.max(0, Number($('#reelsPlays').value||0)),
  reelsRPM: () => Math.max(0, Number($('#reelsRPM').value||0)),
  qualifiedPlayRate: () => clamp(Number($('#qualifiedPlayRate').value||100), 0, 100),
  reelsCreatorShare: () => clamp(Number($('#reelsCreatorShare').value||45), 0, 100),

  // Long-form
  longformViews: () => Math.max(0, Number($('#longformViews').value||0)),
  monetizableRate: () => clamp(Number($('#monetizableRate').value||85), 0, 100),
  fillRate: () => clamp(Number($('#fillRate').value||90), 0, 100),
  avgWatchSeconds: () => Math.max(0, Number($('#avgWatchSeconds').value||0)),
  adsPerMinute: () => Math.max(0, Number($('#adsPerMinute').value||0)),
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
  $('#eligibilityWarning').classList.toggle('hidden', profileEligible);

  // Disable calculator if not eligible
  $$('input[type="number"], input[type="range"]').forEach(input => {
    input.disabled = !profileEligible;
  });

  $$('.btn').forEach(btn => {
    if (btn.id !== 'resetBtn' && btn.id !== 'resetBtnMobile' && btn.id !== 'estimateBtn') {
      btn.disabled = !profileEligible;
    }
  });

  return profileEligible;
};

// ===== Calculations =====
const calc = (rangeMonths = 1) => {
  if (!checkEligibility()) {
    return { starsUSD: 0, subscriptionsUSD: 0, reelsUSD: 0, longformUSD: 0, brandedUSD: 0, total: 0, overallRPM: 0 };
  }
  
  // Stars Revenue = Stars_received × 0.01 × (1 - Stars_fee)
  const starsUSD = inputs.starsReceived() * 0.01 * (1 - inputs.starsFee() / 100);
  
  // Subscriptions Revenue
  const grossYear1 = inputs.subscribersYear1() * inputs.monthlyPrice();
  const grossYear2Plus = inputs.subscribersYear2Plus() * inputs.monthlyPrice();
  const appPercent = inputs.appStorePurchases() / 100;
  const webPercent = (100 - inputs.appStorePurchases()) / 100;

  const netAppYear1 = grossYear1 * appPercent * (1 - 0.30);
  const netAppYear2Plus = grossYear2Plus * appPercent * (1 - 0.15);
  const netApp = (netAppYear1 + netAppYear2Plus) * (1 - inputs.metaPlatformFee() / 100);

  const netWebYear1 = grossYear1 * webPercent * (1 - inputs.platformFee() / 100);
  const netWebYear2Plus = grossYear2Plus * webPercent * (1 - inputs.platformFee() / 100);
  const netWeb = (netWebYear1 + netWebYear2Plus) * (1 - inputs.metaPlatformFee() / 100);

  const subscriptionsUSD = (netApp + netWeb) * rangeMonths;
  
  // Reels Revenue = Qualified_Plays × (Effective_RPM / 1000) × Creator_Share
  const qualifiedPlays = inputs.reelsPlays() * (inputs.qualifiedPlayRate() / 100);
  const reelsUSD = qualifiedPlays * (inputs.reelsRPM() / 1000) * (inputs.reelsCreatorShare() / 100);

  // Long-form Revenue
  const eligibleViews = inputs.longformViews() * (inputs.monetizableRate() / 100);
  const eligibleSeconds = eligibleViews * inputs.avgWatchSeconds();
  const impressions = (eligibleSeconds / 60) * inputs.adsPerMinute() * (inputs.fillRate() / 100);
  const adRevenue = impressions * (inputs.eCPM() / 1000);
  const longformUSD = adRevenue * (inputs.creatorShare() / 100) * (1 - inputs.additionalReductions() / 100);
  
  // Branded Content Revenue
  const brandedUSD = (inputs.guaranteedImpressions() / 1000) * inputs.brandedCPM() + 
                     inputs.usageRightsFee() + inputs.deliverablesFee();
  
  const total = starsUSD + subscriptionsUSD + reelsUSD + longformUSD + brandedUSD;

  // Overall RPM should only reflect revenue tied directly to plays or views
  const viewRevenue = reelsUSD + longformUSD;
  const totalEligible = qualifiedPlays + eligibleViews;
  const overallRPM = totalEligible > 0 ? (viewRevenue / totalEligible) * 1000 : 0;

  return { starsUSD, subscriptionsUSD, reelsUSD, longformUSD, brandedUSD, total, overallRPM, qualifiedPlays, eligibleViews };
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
  $('#starsFeeNum').value = $('#starsFee').value;
  $('#appStorePurchasesNum').value = $('#appStorePurchases').value;
  $('#monetizableRateNum').value = $('#monetizableRate').value;
  $('#fillRateNum').value = $('#fillRate').value;
  $('#additionalReductionsNum').value = $('#additionalReductions').value;

  // Calculate results
  const dateRange = getSelectedDateRange();
  const daysDiff = Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24));
  const rangeMonths = daysDiff / 30;
  const { starsUSD, subscriptionsUSD, reelsUSD, longformUSD, brandedUSD, total, overallRPM } = calc(rangeMonths);
  
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
  
  // Stars
  $('#starsReceived').value = 5000;
  $('#starsFee').value = 5;
  $('#starsFeeNum').value = 5;
  
  // Subscriptions
  $('#subscribersYear1').value = 100;
  $('#subscribersYear2Plus').value = 100;
  $('#monthlyPrice').value = 4.99;
  $('#appStorePurchases').value = 70;
  $('#appStorePurchasesNum').value = 70;
  $('#webPurchases').value = 30;
  $('#platformFee').value = 0;
  $('#metaPlatformFee').value = 0;
  
  // Reels
  $('#reelsPlays').value = 100000;
  $('#reelsRPM').value = 0.90;
  $('#qualifiedPlayRate').value = 100;
  $('#reelsCreatorShare').value = 45;
  
    // Long-form
    $('#longformViews').value = 50000;
    $('#monetizableRate').value = 85;
    $('#monetizableRateNum').value = 85;
    $('#fillRate').value = 90;
    $('#fillRateNum').value = 90;
    $('#avgWatchSeconds').value = 90;
    $('#adsPerMinute').value = 1;
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

// ===== Page URL Estimation (Public Mode Only) =====
const estimateFromPageUrl = async () => {
  const pageUrl = $('#pageUrl').value.trim();
  
  if (!pageUrl) {
    showStatus('Please enter a Facebook Page URL or @handle', 'error');
    return;
  }
  
  // Validate date range
  const dateRange = getSelectedDateRange();
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 1) {
    showStatus('Invalid date range. "To" date must be after "From" date.', 'error');
    return;
  }
  
  if (daysDiff > 365) {
    showStatus('Date range too long. Maximum 365 days allowed for accurate estimation.', 'error');
    return;
  }
  
  showStatus(`Analyzing page metrics for ${daysDiff} days...`, 'loading');
  
  try {
    // Extract page handle from URL
    const pageHandle = extractPageHandle(pageUrl);
    
    // Simulate API call (since we're removing OAuth)
    // In a real implementation, this would call a serverless function
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    
    // For demo purposes, populate with estimated values
    const estimatedData = generateEstimatedData(pageHandle);

    const eligibility = pageMeetsMonetization(estimatedData);
    profileEligible = eligibility.eligible;
    checkEligibility();
    showEligibilityBreakdown(eligibility);

    const summary = `Met: ${eligibility.met.join(', ') || 'none'}; Unmet: ${eligibility.unmet.join(', ') || 'none'}.`;

    if (!eligibility.eligible) {
      showStatus(`Page is not eligible for monetization. ${summary}`, 'error');
      return;
    }

    populateInputsFromEstimate(estimatedData);

    showStatus(`Estimate complete! ${summary} Revenue calculated for ${getSelectedDateRange().from} to ${getSelectedDateRange().to} based on page analysis.`, 'success');

    // Scroll to results
    $('#results').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Estimation error:', error);
    showStatus('Unable to fetch page data. Please check the URL and try again.', 'error');
  }
};

const extractPageHandle = (url) => {
  // Extract @handle or page name from Facebook URL
  if (url.startsWith('@')) {
    return url.substring(1);
  }
  
  const match = url.match(/facebook\.com\/([^\/\?]+)/);
  return match ? match[1] : url;
};

const generateEstimatedData = (pageHandle) => {
  // Get selected date range
  const dateRange = getSelectedDateRange();
  const daysDiff = Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24));

  // Create a deterministic seed from page handle for consistent results
  const seed = createDeterministicSeed(pageHandle);

  // Simulate more realistic page metrics based on handle and date range
  const pageSize = estimatePageSize(pageHandle);
  const engagementRate = estimateEngagementRate(pageSize);

  // Calculate base metrics per day, then scale by date range
  const dailyMetrics = calculateDailyMetrics(pageSize, engagementRate, seed);

  const totalSubs = Math.max(0, Math.floor(dailyMetrics.subscribersBase * (daysDiff / 30))); // Monthly growth
  const watchMinutes = Math.floor(dailyMetrics.followers * 0.25 * 60); // assume 0.25 min per follower per day over 60 days

  // Scale engagement metrics by date range
  const likes = Math.max(0, Math.floor(dailyMetrics.likesPerDay * daysDiff));
  const comments = Math.max(0, Math.floor(dailyMetrics.commentsPerDay * daysDiff));
  const shares = Math.max(0, Math.floor(dailyMetrics.sharesPerDay * daysDiff));
  const totalEngagements = likes + comments + shares;
  const engagementRateActual = dailyMetrics.followers > 0 ? totalEngagements / (dailyMetrics.followers * daysDiff) : 0;

  // Deterministic compliance and demographic data
  const policyCompliant = (seed % 10) !== 0; // 90% chance of compliance
  const age = 18 + (seed % 30); // 18-47 years old
  const countries = ['US', 'CA', 'GB', 'AU', 'IN'];
  const country = countries[seed % countries.length];

  return {
    accountAgeDays: 90 + (seed % 1000),
    followers: dailyMetrics.followers,
    postCount: Math.max(0, Math.floor(dailyMetrics.postsPerDay * daysDiff)),
    watchMinutes,
    professionalMode: true,
    starsReceived: Math.max(0, Math.floor(dailyMetrics.starsPerDay * daysDiff)),
    subscribersYear1: Math.floor(totalSubs * 0.6),
    subscribersYear2Plus: Math.floor(totalSubs * 0.4),
    reelsPlays: Math.max(0, Math.floor(dailyMetrics.reelsPerDay * daysDiff)),
    longformViews: Math.max(0, Math.floor(dailyMetrics.longformPerDay * daysDiff)),
    guaranteedImpressions: Math.max(0, Math.floor(dailyMetrics.brandedPerDay * daysDiff)),
    likes,
    comments,
    shares,
    engagementRate: engagementRateActual,
    policyCompliant,
    age,
    country
  };
};

const pageMeetsMonetization = data => {
  const supportedCountries = ['US', 'CA', 'GB', 'AU', 'IN'];
  const criteria = [
    { condition: data.accountAgeDays >= 90, label: 'profile 90+ days old' },
    { condition: data.followers >= 500, label: '500 followers' },
    { condition: data.followers >= 10000, label: '10,000 followers' },
    { condition: data.postCount >= 5, label: '5 public posts' },
    { condition: data.watchMinutes >= 600000, label: '600,000 watch minutes (60 days)' },
    { condition: data.likes > 0 && data.comments > 0 && data.shares > 0, label: 'active engagement (likes/comments/shares)' },
    { condition: data.policyCompliant, label: 'policy compliance' },
    { condition: data.age >= 18, label: 'age 18+' },
    { condition: supportedCountries.includes(data.country), label: 'supported country' },
    { condition: data.professionalMode, label: 'Professional Mode enabled' }
  ];

  const met = [];
  const unmet = [];
  criteria.forEach(c => (c.condition ? met.push(c.label) : unmet.push(c.label)));
  const eligible = unmet.length === 0;

  return { eligible, met, unmet };
};

const estimatePageSize = (pageHandle) => {
  // Estimate page size category based on handle characteristics
  const handle = pageHandle.toLowerCase();
  
  // Simple heuristics for page size estimation
  if (handle.length < 6 || /^[a-z]{3,6}$/.test(handle)) {
    return 'large'; // Short, simple handles suggest established pages
  } else if (handle.includes('official') || handle.includes('verified')) {
    return 'large';
  } else if (handle.includes('news') || handle.includes('media')) {
    return 'medium';
  } else if (/\d/.test(handle)) {
    return 'medium'; // Handles with numbers typically belong to mid-sized pages
  } else if (handle.length > 15) {
    return 'small'; // Very long handles suggest smaller pages
  } else if (/^[a-z]+[._-][a-z]+$/.test(handle)) {
    return 'small'; // Personal name style handles
  }

  return 'small'; // Default assumption for ambiguous handles
};

const estimateEngagementRate = (pageSize) => {
  // Typical engagement rates by page size
  const rates = {
    'large': 0.015,   // 1.5% - Large pages have lower engagement rates
    'medium': 0.025,  // 2.5% - Medium pages have moderate engagement
    'small': 0.045    // 4.5% - Small pages often have higher engagement
  };
  
  return rates[pageSize] || rates.medium;
};

const createDeterministicSeed = (pageHandle) => {
  // Create a simple hash from the page handle for consistent randomness
  let hash = 0;
  for (let i = 0; i < pageHandle.length; i++) {
    const char = pageHandle.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const calculateDailyMetrics = (pageSize, engagementRate, seed) => {
  // Base follower estimates by page size
  const followerEstimates = {
    'large': 500000,   // 500K+ followers
    'medium': 50000,   // 50K followers
    'small': 8000      // ~8K followers
  };
  
  // Use seed to create deterministic variations (±20% from base)
  const seedNormalized = (seed % 1000) / 1000; // Normalize to 0-1
  const variation = 0.8 + (seedNormalized * 0.4); // 0.8 to 1.2 multiplier
  
  const followers = Math.floor(followerEstimates[pageSize] * variation);
  const dailyReach = Math.floor(followers * 0.1); // Assume 10% daily reach
  const dailyEngagement = Math.floor(dailyReach * engagementRate);

  // Calculate realistic daily metrics with deterministic variations
  const starsVariation = 0.5 + ((seed % 100) / 100); // 0.5 to 1.5
  const reelsVariation = 0.7 + ((seed % 200) / 333); // 0.7 to 1.3
  const longformVariation = 0.6 + ((seed % 150) / 187.5); // 0.6 to 1.4
  const brandedVariation = 0.4 + ((seed % 300) / 250); // 0.4 to 1.6
  const postsVariation = 0.5 + ((seed % 50) / 50); // 0.5 to 1.5

  const basePosts = pageSize === 'large' ? 3 : pageSize === 'medium' ? 2 : 1;
  const likesPerDay = Math.floor(dailyEngagement * 0.6);
  const commentsPerDay = Math.floor(dailyEngagement * 0.25);
  const sharesPerDay = Math.floor(dailyEngagement * 0.15);

  return {
    followers,
    starsPerDay: Math.floor(dailyEngagement * 0.001 * 10 * starsVariation), // 0.1% of engaged users send ~10 stars
    subscribersBase: Math.floor(followers * 0.005), // 0.5% subscription rate (stable)
    reelsPerDay: Math.floor(dailyReach * 0.3 * reelsVariation), // 30% of reached users watch reels
    longformPerDay: Math.floor(dailyReach * 0.15 * longformVariation), // 15% watch long-form content
    brandedPerDay: Math.floor(dailyReach * (pageSize === 'large' ? 0.2 : pageSize === 'medium' ? 0.1 : 0.05) * brandedVariation), // Branded content impressions
    postsPerDay: Math.max(1, Math.floor(basePosts * postsVariation)),
    likesPerDay,
    commentsPerDay,
    sharesPerDay
  };
};

const getSelectedDateRange = () => {
  const fromDate = $('#dateFrom').value;
  const toDate = $('#dateTo').value;
  
  if (!fromDate || !toDate) {
    // Default to last 30 days if no dates selected
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    return {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  }
  
  return { from: fromDate, to: toDate };
};

const populateInputsFromEstimate = (data) => {
  // Populate input fields with totals for the selected date range
  $('#starsReceived').value = Math.round(data.starsReceived);
  $('#subscribersYear1').value = Math.round(data.subscribersYear1);
  $('#subscribersYear2Plus').value = Math.round(data.subscribersYear2Plus);
  $('#reelsPlays').value = Math.round(data.reelsPlays);
  $('#longformViews').value = Math.round(data.longformViews);
  $('#guaranteedImpressions').value = Math.round(data.guaranteedImpressions);
  
  // Update RPM values to more realistic estimates based on page analysis
  const pageHandle = extractPageHandle($('#pageUrl').value.trim());
  const pageSize = estimatePageSize(pageHandle);
  
  // Adjust RPMs based on estimated page size and quality
  const rpmMultipliers = {
    'large': 1.2,    // Large pages typically get better rates
    'medium': 1.0,   // Medium pages get average rates  
    'small': 0.8     // Small pages get lower rates
  };
  
  const multiplier = rpmMultipliers[pageSize];
  $('#reelsRPM').value = (0.90 * multiplier).toFixed(2);
  $('#eCPM').value = (6.00 * multiplier).toFixed(2);
  $('#brandedCPM').value = (15.00 * multiplier).toFixed(2);
  
  // Trigger recalculation
  recalc();
};

const showStatus = (message, type = 'info') => {
  const statusLine = $('#statusLine');
  const statusText = $('#statusText');

  statusText.textContent = message;
  statusLine.className = `status-line ${type}`;
  statusLine.style.display = 'block';
};

const showEligibilityBreakdown = ({ met, unmet }) => {
  const panel = $('#eligibilityPanel');
  const metList = $('#criteriaMet');
  const unmetList = $('#criteriaUnmet');

  if (!panel || !metList || !unmetList) return;

  metList.innerHTML = met.map(item => `<li>${item}</li>`).join('');
  unmetList.innerHTML = unmet.map(item => `<li>${item}</li>`).join('');
  panel.style.display = 'block';
};

const handleDatePreset = (days) => {
  const buttons = $$('.date-presets .btn-small');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const clickedBtn = $(`.date-presets .btn-small[data-days="${days}"]`);
  clickedBtn.classList.add('active');
  
  if (days === 'custom') {
    $('#customDates').style.display = 'flex';
  } else {
    $('#customDates').style.display = 'none';
    
    // Set date range
    const today = new Date();
    const fromDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
    
    $('#dateFrom').value = fromDate.toISOString().split('T')[0];
    $('#dateTo').value = today.toISOString().split('T')[0];
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
    ['starsFee', 'starsFeeNum'],
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
  
  // Page URL estimation events
  $('#estimateBtn').addEventListener('click', estimateFromPageUrl);
  
  // Date preset buttons
  $$('.date-presets .btn-small').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = btn.getAttribute('data-days');
      handleDatePreset(days);
    });
  });
  
  // Initialize default date range (30 days)
  handleDatePreset('30');
  
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
 - Subscribers Year 1: 60, Subscribers Year 2+: 40, Price: $5, App: 70%, Web: 30%, Platform fee: 0%, Meta fee: 0%
 - Expected: ~$416 (60×$5×0.7×0.7 + 40×$5×0.7×0.85 + 100×$5×0.3)

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
