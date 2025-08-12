// Utilities
const $ = (id)=>document.getElementById(id);
const fmt = (v, country)=>{
  const currency = country==='canada'?'CAD':'USD';
  return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(isFinite(v)?v:0);
};

// Config
const CONFIG = {
  canada:{
    compounding:'semi-annual',
    cmhc:[
      {min:0.8001,max:0.85,rate:0.028},
      {min:0.8501,max:0.90,rate:0.031},
      {min:0.9001,max:0.95,rate:0.040},
      {min:0.9501,max:1.00,rate:0.040}
    ],
    pst:{ON:0.08, QC:0.09975, MB:0.07},
    defaults:{taxPct:1.0, water:40, elec:120, heat:100, condo:400}
  },
  usa:{
    compounding:'monthly',
    fha:{
      ufmip:0.0175,
      mip:[
        {term:30, min:0.9501, max:1.00, rate:0.0055},
        {term:30, min:0.9001, max:0.95, rate:0.0050},
        {term:30, min:0.00,   max:0.90, rate:0.0045},
        {term:15, min:0.9001, max:1.00, rate:0.0040},
        {term:15, min:0.00,   max:0.90, rate:0.0025}
      ]
    },
    pmi:[
      {min:0.9001,max:0.95,rate:0.0090},
      {min:0.8501,max:0.90,rate:0.0060},
      {min:0.8001,max:0.85,rate:0.0035}
    ],
    defaults:{taxPct:1.2, water:40, elec:120, heat:90, condo:300}
  }
};

let state = {country:'canada', flow:'purchase', usIns:'fha'};

const FREQUENCIES = {
  'monthly':            {ppy:12,  accel:false, label:'Monthly'},
  'semi-monthly':       {ppy:24,  accel:false, label:'Semi-Monthly'},
  'biweekly':           {ppy:26,  accel:false, label:'Bi-Weekly'},
  'accelerated-biweekly':{ppy:26, accel:true,  label:'Accelerated Bi-Weekly'},
  'weekly':             {ppy:52,  accel:false, label:'Weekly'},
  'accelerated-weekly': {ppy:52,  accel:true,  label:'Accelerated Weekly'}
};

// Math helpers
function monthlyRate(annualPct){
  const r = Math.max(0, Number(annualPct)/100);
  if(state.country==='canada'){
    return Math.pow(1 + r/2, 2/12) - 1; // semi-annual compounding converted to monthly effective
  } else {
    return r/12; // monthly
  }
}

function pmt(principal, i, n){
  if(i<=0) return principal/Math.max(1,n);
  const f = Math.pow(1+i,n);
  return principal * (i*f)/(f-1);
}

function findRateFromBuckets(buckets, ltv){
  for(const b of buckets){ if(ltv>=b.min && ltv<=b.max) return b.rate; }
  return 0;
}

// Core compute
function compute(){
  try{
  // Read inputs
  const price = Number($("price").value)||0;
  const downPct = Math.max(0, Math.min(100, Number($("downPct").value)||0));
  const termYears = Number($("term").value)||25;
  const ratePct = Number($("rate").value)||0;
  const freq = $("frequency").value;
  const condo = Number($("condo").value)||0;
  const homeIns = Number($("homeIns").value)||0;
  const taxMode = $("taxMode").value;
  const taxVal = Number($("taxValue").value)||0;
  const water = Number($("water").value)||0;
  const elec = Number($("electricity").value)||0;
  const heat = Number($("heating").value)||0;
  const closingPct = Number($("closingPct").value)||0;
  const financeClosing = $("financeClosing").checked;
  const financePremium = $("financePremium")?.checked;
  const currBalance = Number($("currBalance").value)||0;
  const cashOut = Number($("cashOut").value)||0;

  const n = termYears*12;
  const i = monthlyRate(ratePct);

  // Base loan logic
  const dpAmount = price * (downPct/100);
  let baseLoan = 0, usedPrice = price;
  if(state.flow==='purchase'){
    baseLoan = Math.max(0, price - dpAmount);
    if(financeClosing){ baseLoan += price * (closingPct/100); }
  } else {
    baseLoan = Math.max(0, currBalance + cashOut);
  }

  // LTV for insurance decision (as fraction)
  const ltvVal = price>0 ? baseLoan/price : 0;

  let miMonthly = 0; // mortgage insurance monthly
  let upfrontAdd = 0; // financed upfront (UFMIP/CMHC premium) added to principal
  let miApplied = false;

  if(state.country==='canada'){
    document.getElementById("usInsToggle").style.display='none';
    document.getElementById("canadaToggles").style.display='grid';
    if(ltvVal>0.80){
      miApplied = true;
      const rate = findRateFromBuckets(CONFIG.canada.cmhc, ltvVal) || 0;
      const premium = baseLoan * rate;
      if(financePremium){ upfrontAdd += premium; }
    }
  } else {
    document.getElementById("canadaToggles").style.display='none';
    document.getElementById("usInsToggle").style.display='inline-flex';
    if(ltvVal>0.80){
      miApplied = true;
      if(state.usIns==='fha'){
        const uf = CONFIG.usa.fha.ufmip;
        const ufAmt = baseLoan * uf;
        upfrontAdd += ufAmt;
        const match = CONFIG.usa.fha.mip.find(r=> termYears===r.term && ltvVal>=r.min && ltvVal<=r.max );
        const mipRate = (match?.rate) || 0.0055;
        miMonthly = (mipRate * baseLoan)/12;
      } else {
        const pmiRate = findRateFromBuckets(CONFIG.usa.pmi, ltvVal) || 0.0075;
        miMonthly = (pmiRate * baseLoan)/12;
      }
    }
  }

  const principal = baseLoan + upfrontAdd;

  // Payment by frequency
const sel = FREQUENCIES[freq] || FREQUENCIES['monthly'];
// convert monthly effective rate to per-period rate
const i_period = Math.pow(1 + i, 12/sel.ppy) - 1;
const n_periods = termYears * sel.ppy;
// base monthly payment for comparison/accelerated formula
const baseMonthly = pmt(principal, i, n);
let paymentPerPeriod = pmt(principal, i_period, n_periods);
if(sel.accel){
  // accelerated: target 13x monthly per year spread across periods
  paymentPerPeriod = (baseMonthly * 13) / sel.ppy;
}

// Property tax
  let monthlyTax = 0;
  if(taxMode==='percent'){
    monthlyTax = (taxVal/100 * usedPrice)/12;
  } else {
    monthlyTax = taxVal;
  }

  const totalMonthly = (paymentPerPeriod * (sel.ppy/12)) + miMonthly + monthlyTax + condo + water + elec + heat + (homeIns||0);

  // UI
  $("totalOut").textContent = fmt(totalMonthly, state.country);
  $("miChip").style.display = miApplied? 'inline-block':'none';
  $("noMiChip").style.display = (!miApplied && price>0)? 'inline-block':'none';

  const bd = [
    ['Mortgage P&I', paymentPerPeriod * (sel.ppy/12)],
    ['Mortgage insurance', miMonthly],
    ['Property tax', monthlyTax],
    ['Condo fee', condo],
    ['Water', water],
    ['Electricity', elec],
    ['Heating', heat],
  ];
  if(homeIns>0) bd.push(['Home insurance', homeIns]);

  const list = $("breakdown");
  list.innerHTML = '';
  bd.forEach(([k,v])=>{
    const div = document.createElement('div');
    div.className='item';
    div.innerHTML = `<span class="muted">${k}</span><strong>${fmt(v, state.country)}</strong>`;
    list.appendChild(div);
  });

  drawSpark(principal, i, n, baseMonthly);
  } catch(err){ console && console.error && console.error('Compute error:', err); }
}

function drawSpark(principal, i_month, n_months, monthlyPay){
  const c = document.getElementById('spark');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0,0,W,H);
  // Determine selected frequency
  const freqEl = document.getElementById('frequency');
  const sel = FREQUENCIES[(freqEl && freqEl.value) || 'monthly'] || FREQUENCIES['monthly'];
  const i_p = Math.pow(1 + i_month, 12/sel.ppy) - 1;
  const n_p = (n_months/12) * sel.ppy;
  // Base monthly for accelerated calc
  const baseMonthly = monthlyPay; // already the monthly payment we computed earlier
  let pay = pmt(principal, i_p, n_p);
  if(sel.accel){ pay = (baseMonthly * 13) / sel.ppy; }

  // Simulate per-period to build series
  const maxSteps = Math.min(400, Math.floor(n_p));
  const step = Math.max(1, Math.floor(n_p / maxSteps));
  let bal = principal;
  const balSeries = [];
  const princSeries = [];
  const intSeries = [];
  for(let k=0; k<n_p; k++){
    const interest = bal * i_p;
    const princ = Math.max(0, pay - interest);
    bal = Math.max(0, bal - princ);
    if(k % step === 0){
      balSeries.push(bal);
      princSeries.push(princ);
      intSeries.push(interest);
    }
    if(bal <= 0) break;
  }
  const xStep = (W-16)/Math.max(1, balSeries.length-1);
  const maxB = principal;
  // axes
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8,H-8); ctx.lineTo(W-8,H-8); ctx.stroke();
  // balance line (blue)
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth=2; ctx.beginPath();
  balSeries.forEach((b,idx)=>{
    const x = 8 + idx*xStep;
    const yInv = H - (8 + (H-16) * (b / (maxB + 1e-6)));
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();
  // principal bars/line (green)
  const maxPayComp = Math.max(...princSeries, ...intSeries, 1);
  ctx.strokeStyle = '#10b981'; ctx.lineWidth=1.5; ctx.beginPath();
  princSeries.forEach((p,idx)=>{
    const x = 8 + idx*xStep;
    const yInv = H - (8 + (H-16) * (p / maxPayComp));
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();
  // interest line (amber)
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth=1.5; ctx.beginPath();
  intSeries.forEach((p,idx)=>{
    const x = 8 + idx*xStep;
    const yInv = H - (8 + (H-16) * (p / maxPayComp));
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();
}    pts.push(bal);
  }
  const maxB = principal, minB = 0;
  const xStep = (W-16)/(pts.length-1 || 1);
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth=2; ctx.beginPath();
  pts.forEach((b,idx)=>{
    const x = 8 + idx*xStep;
    const y = 8 + (H-16) * (b - minB) / (maxB - minB + 1e-6);
    const yInv = H - y;
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();
}

function bind(){
  // Country toggle (add to header)
  const countryToggle = document.createElement('div');
  countryToggle.className = 'toggle';
  countryToggle.innerHTML = `
    <button type="button" data-country="canada" class="active">Canada (CAD)</button>
    <button type="button" data-country="usa">USA (USD)</button>
  `;
  document.querySelector('header').appendChild(countryToggle);

  countryToggle.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      countryToggle.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.country = btn.dataset.country;
      if(state.country==='canada'){
        $("rate").value = 5.29; $("term").value = 25; $("taxValue").value = CONFIG.canada.defaults.taxPct; $("heating").value=100; $("condo").value=CONFIG.canada.defaults.condo;
      } else {
        $("rate").value = 6.25; $("term").value = 30; $("taxValue").value = CONFIG.usa.defaults.taxPct; $("heating").value=90; $("condo").value=CONFIG.usa.defaults.condo;
      }
      compute();
    });
  });

  document.querySelectorAll('#flowToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#flowToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.flow = btn.dataset.flow === 'refi' ? 'refi':'purchase';
      $("purchaseOnly").style.display = state.flow==='purchase'? 'grid':'none';
      $("refiOnly").style.display = state.flow==='refi'? 'grid':'none';
      compute();
    });
  });

  document.querySelectorAll('#usInsToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#usInsToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.usIns = btn.dataset.ins;
      compute();
    });
  });

  $("taxMode").addEventListener('change',()=>{
    if($("taxMode").value==='percent'){
      $("taxValueWrap").querySelector('.label').textContent = 'Property tax (% per year)';
      $("taxValue").value = state.country==='canada'? CONFIG.canada.defaults.taxPct : CONFIG.usa.defaults.taxPct;
    } else {
      $("taxValueWrap").querySelector('.label').textContent = 'Property tax (fixed monthly)';
      $("taxValue").value = 400;
    }
    compute();
  });

  // inputs recalc
  const freqEl = document.getElementById('frequency');
  if(freqEl){ freqEl.addEventListener('change', compute); }
  document.querySelectorAll('input, select').forEach(el=>{
    el.addEventListener('input', compute);
    el.addEventListener('change', compute);
  });

  // Prefills
  $("prefillCanada").addEventListener('click',()=>{
    countryToggle.querySelector('[data-country="canada"]').click();
    $("region").value='Toronto, ON';
    $("term").value='25'; $("price").value='700000'; $("downPct").value='10'; $("rate").value='5.29';
    $("condo").value='400'; $("taxMode").value='percent'; $("taxValue").value='1.0';
    $("water").value='40'; $("electricity").value='120'; $("heating").value='100';
    compute();
  });
  $("prefillUSA").addEventListener('click',()=>{
    countryToggle.querySelector('[data-country="usa"]').click();
    $("region").value='San Francisco, CA';
    $("term").value='30'; $("price").value='550000'; $("downPct").value='5'; $("rate").value='6.25';
    $("condo").value='250'; $("taxMode").value='percent'; $("taxValue").value='1.8';
    $("water").value='40'; $("electricity").value='120'; $("heating").value='90';
    state.usIns='fha';
    document.querySelector('#usInsToggle [data-ins="fha"]').classList.add('active');
    document.querySelector('#usInsToggle [data-ins="pmi"]').classList.remove('active');
    compute();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  bind();
  compute();
});
