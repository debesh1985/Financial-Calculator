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
  postRoll: () => $('#postRoll').checked,
  manualImp: () => $('#manualImpToggle').checked,
  impressionsPerView: () => Math.max(0, Number($('#impressionsPerView').value||0)),
  lfViews: () => Math.max(0, Number($('#lfViews').value||0)),
  shViews: () => Math.max(0, Number($('#shViews').value||0)),
  monetizableRate: () => clamp(Number($('#monetizableRate').value||0),0,100),
  fillRate: () => clamp(Number($('#fillRate').value||0),0,100),
  premiumPct: () => clamp(Number($('#premiumPct').value||0),0,100),
  premiumRPM: () => Math.max(0, Number($('#premiumRPM').value||0)),
  cpm: () => Math.max(0, Number($('#cpm').value||0)),
  seasonality: () => clamp(Number($('#seasonality').value||100),50,150),
  inventoryAvail: () => clamp(Number($('#inventoryAvail').value||100),50,100),
  creatorShareLF: () => clamp(Number($('#creatorShareLF').value||55),0,100),
  creatorShareSH: () => clamp(Number($('#creatorShareSH').value||45),0,100),
  additionalShare: () => clamp(Number($('#additionalShare').value||0),0,50),
  capImp: () => clamp(Number($('#capImp').value||4),0,6),
  shortsRPM: () => Math.max(0, Number($('#shortsRPM').value||0)),
};

function autoImpressionsPerView(){
  const len = inputs.videoLength();
  const pre = inputs.preRoll()?1:0;
  const mid = (len >= 8) ? inputs.midrolls() : 0;
  const post = inputs.postRoll()?1:0;
  let total = pre + mid + post;
  const cap = inputs.capImp(); // 0 => auto cap of 4
  const maxCap = cap === 0 ? 4 : cap;
  return clamp(total, 0, maxCap);
}

function effectiveImpressionsPerView(){
  return inputs.manualImp() ? inputs.impressionsPerView() : autoImpressionsPerView();
}

function calc(){
  const fmt = inputs.format();
  const modWatch = inputs.modWatch();
  const modShorts = inputs.modShorts();
  const modPremium = inputs.modPremium();

  const lfViews = (fmt === 'long' || fmt === 'both') ? inputs.lfViews() : 0;
  const shViews = (fmt === 'shorts' || fmt === 'both') ? inputs.shViews() : 0;

  // Long-form Ads
  let lfAdsUSD = 0;
  if(modWatch && lfViews>0){
    const nonPremiumFactor = 1 - (inputs.premiumPct()/100);
    const monetizable = (inputs.monetizableRate()/100);
    const fill = (inputs.fillRate()/100);
    const cpm = inputs.cpm()/1000;
    const demand = inputs.seasonality()/100;
    const inv = inputs.inventoryAvail()/100;
    const creator = inputs.creatorShareLF()/100;
    const additional = 1 - (inputs.additionalShare()/100);
    const impPerView = effectiveImpressionsPerView();
    const eligibleViews = lfViews * nonPremiumFactor * monetizable;
    lfAdsUSD = eligibleViews * impPerView * fill * cpm * demand * inv * creator * additional;
  }

  // Shorts (RPM already at creator-take by default)
  let shortsUSD = 0;
  if(modShorts && shViews>0){
    const base = shViews * (inputs.shortsRPM()/1000);
    // adjust if user changes revenue share or adds additional reductions
    const adjShare = (inputs.creatorShareSH() / 45) * (1 - inputs.additionalShare()/100);
    shortsUSD = base * adjShare;
  }

  // Premium revenue (applies to both view types)
  let premiumUSD = 0;
  if(modPremium && (lfViews+shViews)>0){
    const premViews = (lfViews + shViews) * (inputs.premiumPct()/100);
    premiumUSD = premViews * (inputs.premiumRPM()/1000);
  }

  const total = lfAdsUSD + shortsUSD + premiumUSD;
  const totalViews = lfViews + shViews;
  const overallRPM = totalViews>0 ? (total / (totalViews/1000)) : 0;

  return { lfAdsUSD, shortsUSD, premiumUSD, total, overallRPM };
}

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

function sanitize(){
  // Clamp numeric ranges
  $('#monetizableRate').value = inputs.monetizableRate();
  $('#fillRate').value = inputs.fillRate();
  $('#premiumPct').value = inputs.premiumPct();
  $('#seasonality').value = inputs.seasonality();
  $('#inventoryAvail').value = inputs.inventoryAvail();
  $('#creatorShareLF').value = inputs.creatorShareLF();
  $('#creatorShareSH').value = inputs.creatorShareSH();
  $('#additionalShare').value = inputs.additionalShare();
  $('#capImp').value = inputs.capImp();
}

// ===== URL State =====
function syncQuery(){
  const params = new URLSearchParams();
  params.set('f', inputs.format());
  params.set('mw', inputs.modWatch()?1:0);
  params.set('ms', inputs.modShorts()?1:0);
  params.set('mp', inputs.modPremium()?1:0);
  params.set('len', inputs.videoLength());
  params.set('mid', inputs.midrolls());
  params.set('pre', inputs.preRoll()?1:0);
  params.set('post', inputs.postRoll()?1:0);
  params.set('mimp', inputs.manualImp()?1:0);
  params.set('ipv', inputs.impressionsPerView());
  params.set('lfv', inputs.lfViews());
  params.set('shv', inputs.shViews());
  params.set('mon', inputs.monetizableRate());
  params.set('fill', inputs.fillRate());
  params.set('pp', inputs.premiumPct());
  params.set('prpm', inputs.premiumRPM());
  params.set('cpm', inputs.cpm());
  params.set('sea', inputs.seasonality());
  params.set('inv', inputs.inventoryAvail());
  params.set('clf', inputs.creatorShareLF());
  params.set('csh', inputs.creatorShareSH());
  params.set('add', inputs.additionalShare());
  params.set('cap', inputs.capImp());
  params.set('srpm', inputs.shortsRPM());

  const newUrl = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, '', newUrl);
}

function loadFromQuery(){
  const q = new URLSearchParams(location.search);
  const setVal = (id, v)=>{ const el = document.getElementById(id); if(el && v!==null){ if(el.type!=='checkbox'){ el.value = v; } } };
  const setChk = (id, v)=>{ const el = document.getElementById(id); if(el){ el.checked = (v==1||v==='1'||v==='true'); }};

  const f = q.get('f'); if(f){ const el = document.querySelector(`input[name="format"][value="${f}"]`); if(el){ el.checked = true; }}
  setChk('mod-watch', q.get('mw'));
  setChk('mod-shorts', q.get('ms'));
  setChk('mod-premium', q.get('mp'));
  setVal('videoLength', q.get('len'));
  setVal('midrolls', q.get('mid'));
  setChk('preRoll', q.get('pre'));
  setChk('postRoll', q.get('post'));
  setChk('manualImpToggle', q.get('mimp'));
  setVal('impressionsPerView', q.get('ipv'));
  setVal('lfViews', q.get('lfv'));
  setVal('shViews', q.get('shv'));
  setVal('monetizableRate', q.get('mon'));
  setVal('fillRate', q.get('fill'));
  setVal('premiumPct', q.get('pp'));
  setVal('premiumRPM', q.get('prpm'));
  setVal('cpm', q.get('cpm'));
  setVal('seasonality', q.get('sea'));
  setVal('inventoryAvail', q.get('inv'));
  setVal('creatorShareLF', q.get('clf'));
  setVal('creatorShareSH', q.get('csh'));
  setVal('additionalShare', q.get('add'));
  setVal('capImp', q.get('cap'));
  setVal('shortsRPM', q.get('srpm'));
}

// ===== Event wiring =====
function wire(){
  // All inputs trigger recalculation
  document.body.addEventListener('input', recalc);
  document.body.addEventListener('change', recalc);

  $('#recalcBtn').addEventListener('click', updateUI);

  $('#resetBtn').addEventListener('click', ()=>{ location.search=''; location.reload(); });
  $('#zeroBtn').addEventListener('click', ()=>{ $('#lfViews').value=0; $('#shViews').value=0; recalc(); });

  $('#copyLinkBtn').addEventListener('click', ()=>{ syncQuery(); navigator.clipboard.writeText(location.href).then(()=>{
    $('#copyLinkBtn').textContent='Copied!'; setTimeout(()=>$('#copyLinkBtn').textContent='Copy inputs as link',1200);
  });});

  $('#stickyReset').addEventListener('click', ()=>$('#resetBtn').click());
  $('#stickyCopy').addEventListener('click', ()=>$('#copyLinkBtn').click());

  // Update aria-selected for format labels
  $$('#formatToggle input').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      $$('#formatToggle label').forEach(l=>l.setAttribute('aria-selected','false'));
      inp.nextElementSibling.setAttribute('aria-selected','true');
    });
  });
}

// ===== Init =====
loadFromQuery();
wire();
updateUI();

// ---- Sanity test examples (manual) ----
// Example: With defaults, changing CPM from 8 to 12 should increase LFAds proportionally.
// Example: Setting Premium% to 100 makes LF ads -> $0 and all earnings from Premium.
