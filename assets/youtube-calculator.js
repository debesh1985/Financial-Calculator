
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
  
  // Channel URL events - improved mobile compatibility
  const fetchBtn = $('#fetchChannelBtn');
  if (fetchBtn) {
    // Add multiple event types for better mobile support
    fetchBtn.addEventListener('click', analyzeChannel);
    fetchBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      analyzeChannel();
    });
    fetchBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
    });
  }
  
  const channelInput = $('#channelInput');
  if (channelInput) {
    channelInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        analyzeChannel();
      }
    });
    // Add input event for mobile keyboards
    channelInput.addEventListener('input', () => {
      const btn = $('#fetchChannelBtn');
      if (btn) {
        btn.disabled = !channelInput.value.trim();
      }
    });
  }
  
  // Time window controls
  $$('input[name="timeWindow"]').forEach(radio => {
    radio.addEventListener('change', () => {
      $('#customDateRange').classList.toggle('hidden', radio.value !== 'custom');
    });
  });
  
  // Set default dates
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  $('#endDate').value = today.toISOString().split('T')[0];
  $('#startDate').value = thirtyDaysAgo.toISOString().split('T')[0];
  
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

// ===== YouTube API Integration =====
const YT_API_KEY = window.YT_API_KEY;

const parseChannelInput = (input) => {
  const trimmed = input.trim();
  
  // Direct channel ID (UC...)
  if (trimmed.match(/^UC[a-zA-Z0-9_-]{22}$/)) {
    return { type: 'channelId', value: trimmed };
  }
  
  // Channel URL with ID
  const channelIdMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/);
  if (channelIdMatch) {
    return { type: 'channelId', value: channelIdMatch[1] };
  }
  
  // Handle (@username or youtube.com/@username)
  const handleMatch = trimmed.match(/(?:youtube\.com\/)?@([a-zA-Z0-9_.-]+)/);
  if (handleMatch) {
    return { type: 'handle', value: handleMatch[1] };
  }
  
  // Legacy username
  const userMatch = trimmed.match(/youtube\.com\/user\/([a-zA-Z0-9_.-]+)/);
  if (userMatch) {
    return { type: 'username', value: userMatch[1] };
  }
  
  // Try as handle if it starts with @
  if (trimmed.startsWith('@')) {
    return { type: 'handle', value: trimmed.substring(1) };
  }
  
  return null;
};

const fetchChannelId = async (input) => {
  const parsed = parseChannelInput(input);
  if (!parsed) throw new Error('Invalid channel URL or handle format');
  
  if (parsed.type === 'channelId') {
    return parsed.value;
  }
  
  if (parsed.type === 'username') {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${parsed.value}&key=${YT_API_KEY}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(`API Error: ${data.error.message}`);
      }
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
    } catch (e) {
      console.warn('Username lookup failed:', e);
      // Fall through to handle search
    }
  }
  
  // Search for handle
  const query = parsed.type === 'handle' ? `@${parsed.value}` : parsed.value;
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${YT_API_KEY}&maxResults=10`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`API Error: ${data.error.message}`);
  }
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }
  
  // Look for exact handle match
  for (const item of data.items) {
    if (item.snippet.customUrl === `@${parsed.value}` || 
        item.snippet.title.toLowerCase() === parsed.value.toLowerCase()) {
      return item.snippet.channelId;
    }
  }
  
  // Return first result if no exact match
  return data.items[0].snippet.channelId;
};

const fetchChannelData = async (channelId) => {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${YT_API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`API Error: ${data.error.message}`);
  }
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Channel data not found');
  }
  
  return data.items[0];
};

const fetchVideos = async (playlistId, maxVideos, publishedAfter, publishedBefore, onProgress) => {
  const videos = [];
  let nextPageToken = '';
  let processed = 0;
  
  while (videos.length < maxVideos) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${playlistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${YT_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API Error: ${data.error.message}`);
    }
    
    if (!data.items) break;
    
    // Filter by date
    const filteredItems = data.items.filter(item => {
      const publishedAt = new Date(item.snippet.publishedAt);
      return publishedAt >= publishedAfter && publishedAt <= publishedBefore;
    });
    
    if (filteredItems.length > 0) {
      // Get video details in batches of 50
      for (let i = 0; i < filteredItems.length; i += 50) {
        const batch = filteredItems.slice(i, i + 50);
        const videoIds = batch.map(item => item.contentDetails.videoId).join(',');
        
        const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${YT_API_KEY}`);
        
        if (!videoResponse.ok) {
          throw new Error(`Video API request failed: ${videoResponse.status} ${videoResponse.statusText}`);
        }
        
        const videoData = await videoResponse.json();
        
        if (videoData.error) {
          throw new Error(`Video API Error: ${videoData.error.message}`);
        }
        
        if (videoData.items) {
          videos.push(...videoData.items);
          processed += videoData.items.length;
          onProgress(`Fetching videos ${Math.min(processed, maxVideos)}/${maxVideos}...`);
          
          if (videos.length >= maxVideos) break;
        }
      }
    }
    
    if (!data.nextPageToken || videos.length >= maxVideos) break;
    nextPageToken = data.nextPageToken;
  }
  
  return videos.slice(0, maxVideos);
};

const parseDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

const analyzeChannel = async () => {
  console.log('Analyze channel triggered'); // Debug log
  
  const input = $('#channelInput').value.trim();
  if (!input) {
    setStatus('Please enter a channel URL or handle', 'error');
    return;
  }
  
  // Check if API key is defined
  if (typeof YT_API_KEY === 'undefined' || !YT_API_KEY) {
    setStatus('YouTube API key not configured. Please add your API key as a secret.', 'error');
    return;
  }
  
  // Disable button during processing to prevent double-clicks
  const btn = $('#fetchChannelBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
  }
  
  try {
    setStatus('Looking up channel...', 'loading');
    const channelId = await fetchChannelId(input);
    
    setStatus('Fetching channel data...', 'loading');
    const channelData = await fetchChannelData(channelId);
    
    const uploadsPlaylistId = channelData.contentDetails.relatedPlaylists.uploads;
    const maxVideos = parseInt($('#maxVideos').value) || 500;
    const shortsRule = parseInt($('#shortsRule').value) || 60;
    
    // Calculate date range
    const timeWindow = $('input[name="timeWindow"]:checked').value;
    let publishedAfter, publishedBefore;
    
    publishedBefore = new Date();
    if (timeWindow === 'custom') {
      publishedAfter = new Date($('#startDate').value);
      publishedBefore = new Date($('#endDate').value);
    } else {
      publishedAfter = new Date();
      publishedAfter.setDate(publishedAfter.getDate() - parseInt(timeWindow));
    }
    
    setStatus('Fetching recent videos...', 'loading');
    const videos = await fetchVideos(uploadsPlaylistId, maxVideos, publishedAfter, publishedBefore, setStatus);
    
    if (videos.length === 0) {
      setStatus('No videos found in the selected time range', 'error');
      return;
    }
    
    // Analyze videos
    let longFormViews = 0;
    let shortsViews = 0;
    let longFormCount = 0;
    let shortsCount = 0;
    
    videos.forEach(video => {
      const duration = parseDuration(video.contentDetails.duration);
      const views = parseInt(video.statistics.viewCount || '0');
      
      if (duration <= shortsRule) {
        shortsViews += views;
        shortsCount++;
      } else {
        longFormViews += views;
        longFormCount++;
      }
    });
    
    // Calculate revenue using current calculator settings
    const { lfAdsUSD, shortsUSD, premiumUSD, total, overallRPM } = calculateChannelRevenue(longFormViews, shortsViews);
    
    // Display results
    displayChannelResults(channelData, {
      longFormViews,
      shortsViews,
      longFormCount,
      shortsCount,
      totalViews: longFormViews + shortsViews,
      revenue: { lfAdsUSD, shortsUSD, premiumUSD, total, overallRPM },
      timeWindow,
      publishedAfter,
      publishedBefore
    });
    
    setStatus(`Analysis complete: ${videos.length} videos analyzed`, 'success');
    
  } catch (error) {
    console.error('Channel analysis error:', error);
    setStatus(`Error: ${error.message}`, 'error');
  } finally {
    // Re-enable button
    const btn = $('#fetchChannelBtn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Fetch Channel Data';
    }
  }
};

const calculateChannelRevenue = (longFormViews, shortsViews) => {
  // Use current calculator settings for revenue calculation
  const oldLF = inputs.viewsLF();
  const oldSH = inputs.viewsShorts();
  
  // Temporarily override views
  $('#viewsLF').value = longFormViews;
  $('#viewsShorts').value = shortsViews;
  
  // Calculate with both formats
  const oldFormat = inputs.format();
  $('input[value="both"]').checked = true;
  
  const result = calc();
  
  // Restore original values
  $('#viewsLF').value = oldLF;
  $('#viewsShorts').value = oldSH;
  $(`input[value="${oldFormat}"]`).checked = true;
  
  return result;
};

const displayChannelResults = (channelData, analysis) => {
  const summary = $('#channelSummary');
  
  // Channel header
  $('#channelAvatar').src = channelData.snippet.thumbnails.default.url;
  $('#channelTitle').textContent = channelData.snippet.title;
  $('#channelTitle').href = `https://youtube.com/channel/${channelData.id}`;
  
  const subs = parseInt(channelData.statistics.subscriberCount || '0');
  const videos = parseInt(channelData.statistics.videoCount || '0');
  $('#channelSubs').textContent = `${subs.toLocaleString()} subscribers`;
  $('#channelVideos').textContent = `${videos.toLocaleString()} total videos`;
  
  const timeDesc = analysis.timeWindow === 'custom' 
    ? `${analysis.publishedAfter.toLocaleDateString()} - ${analysis.publishedBefore.toLocaleDateString()}`
    : `Last ${analysis.timeWindow} days`;
  $('#dateRange').textContent = `${timeDesc} (${analysis.longFormCount + analysis.shortsCount} videos analyzed)`;
  
  // KPIs
  $('#channelRevenue').textContent = fmtUSD(analysis.revenue.total);
  $('#channelRPM').textContent = fmtUSD(analysis.revenue.overallRPM);
  
  // Breakdown
  const total = analysis.revenue.total || 1;
  const pct = (x) => `${Math.round((x/total)*100)}%`;
  $('#channelLF').textContent = `${fmtUSD(analysis.revenue.lfAdsUSD)} (${pct(analysis.revenue.lfAdsUSD)})`;
  $('#channelSH').textContent = `${fmtUSD(analysis.revenue.shortsUSD)} (${pct(analysis.revenue.shortsUSD)})`;
  $('#channelPR').textContent = `${fmtUSD(analysis.revenue.premiumUSD)} (${pct(analysis.revenue.premiumUSD)})`;
  
  summary.classList.remove('hidden');
};

const setStatus = (message, type = '') => {
  const statusLine = $('#statusLine');
  statusLine.textContent = message;
  statusLine.className = `status-line ${type}`;
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', ()=>{
  loadFromQuery();
  
  // Add a small delay to ensure all elements are properly loaded on mobile
  setTimeout(() => {
    bindEvents();
    recalc();
    
    // Additional mobile-specific initialization
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      console.log('Mobile device detected');
      
      // Ensure the fetch button is properly initialized
      const fetchBtn = $('#fetchChannelBtn');
      if (fetchBtn) {
        fetchBtn.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
        fetchBtn.style.touchAction = 'manipulation';
        console.log('Mobile fetch button initialized');
      }
      
      // Disable double-tap zoom on buttons
      $$('button').forEach(btn => {
        btn.style.touchAction = 'manipulation';
      });
    }
  }, 100);
  
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
