// --- Utilities ---
const $ = (id)=>document.getElementById(id);
const fmt = (v, country)=> new Intl.NumberFormat(undefined,{style:'currency',currency:(country==='canada'?'CAD':'USD')}).format(isFinite(v)?v:0);

// Country + frequency
let state = { country:'canada' };
const FREQUENCIES = {
  'monthly':              {ppy:12,  accel:false, label:'Monthly'},
  'semi-monthly':         {ppy:24,  accel:false, label:'Semi-Monthly'},
  'biweekly':             {ppy:26,  accel:false, label:'Bi-Weekly'},
  'accelerated-biweekly': {ppy:26,  accel:true,  label:'Accelerated Bi-Weekly'},
  'weekly':               {ppy:52,  accel:false, label:'Weekly'},
  'accelerated-weekly':   {ppy:52,  accel:true,  label:'Accelerated Weekly'},
};

// Compounding rules
function monthlyRate(annualPct){
  const r = Math.max(0, Number(annualPct)/100);
  return state.country==='canada'
    ? Math.pow(1 + r/2, 2/12) - 1  // Canada: semi-annual comp -> effective monthly
    : r/12;                        // USA: monthly comp
}

// Standard PMT
function pmt(principal, i, n){
  if(i<=0) return principal/Math.max(1,n);
  const f = Math.pow(1+i,n);
  return principal * (i*f)/(f-1);
}

// Build schedule per period, aggregate by year
function buildSchedule(principal, i_month, years, freqKey){
  const f = FREQUENCIES[freqKey] || FREQUENCIES['monthly'];
  const n_months = years*12;
  const n_periods = years * f.ppy;
  const i_period = Math.pow(1+i_month, 12/f.ppy) - 1;

  const monthlyBase = pmt(principal, i_month, n_months); // reference monthly payment
  let payPerPeriod = pmt(principal, i_period, n_periods);
  if(f.accel){
    // accelerated: 13x monthly spread across the selected periods (more principal faster)
    payPerPeriod = (monthlyBase * 13) / f.ppy;
  }

  // simulate
  let bal = principal;
  const yearly = []; // [{principal, interest, balance} per year]
  let y = 0, pSum=0, iSum=0;
  for(let k=1; k<=n_periods; k++){
    const interest = bal * i_period;
    const princ = Math.max(0, payPerPeriod - interest);
    bal = Math.max(0, bal - princ);
    pSum += princ; iSum += interest;
    if(k % f.ppy === 0 || bal <= 1e-6){
      y++;
      yearly.push({year:y, principal:pSum, interest:iSum, balance:bal});
      pSum=0; iSum=0;
    }
    if(bal<=1e-8) break;
  }
  // pad years if rate is 0 and iterations fewer
  while(yearly.length < years){
    yearly.push({year:yearly.length+1, principal:0, interest:0, balance:0});
  }

  return {payPerPeriod, monthlyEquivalent: payPerPeriod * (f.ppy/12), yearly};
}

// Draw chart: yearly stacked bars (principal green, interest amber) + balance line (blue)
// X-axis labeled by year 1..N
function drawChart(yearly, principal0){
  const c = $('chart');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0,0,W,H);

  // margins
  const left = 42, right = 12, top = 12, bottom = 32;
  const innerW = W - left - right;
  const innerH = H - top - bottom;

  // scales
  const maxYearPay = Math.max(1, ...yearly.map(y=>y.principal + y.interest));
  const maxBal = Math.max(principal0, ...yearly.map(y=>y.balance));
  const xStep = innerW / Math.max(1, yearly.length);

  // axes
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, H-bottom); ctx.lineTo(W-right, H-bottom); ctx.stroke();

  // Y axis ticks (payments)
  ctx.fillStyle = '#586070'; ctx.font = '11px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  const ticks = 4;
  for(let t=0;t<=ticks;t++){
    const v = maxYearPay * t / ticks;
    const y = H - bottom - innerH * (t/ticks);
    ctx.fillText(fmt(v, state.country), 4, y+3);
    ctx.strokeStyle = '#f3f4f6'; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(W-right, y); ctx.stroke();
  }

  // Bars
  const barW = Math.max(6, xStep*0.6);
  yearly.forEach((row, idx)=>{
    const x = left + idx*xStep + (xStep-barW)/2;
    // interest (amber) at bottom
    const ih = innerH * (row.interest / maxYearPay);
    const ipx = (H - bottom) - ih;
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(x, ipx, barW, ih);
    // principal (green) stacked on top
    const ph = innerH * (row.principal / maxYearPay);
    const ppx = ipx - ph;
    ctx.fillStyle = '#10b981'; ctx.fillRect(x, ppx, barW, ph);
  });

  // Balance line (blue) — scaled to right axis but sharing the same frame using its own max
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.beginPath();
  yearly.forEach((row, idx)=>{
    const x = left + idx*xStep + xStep/2;
    const y = H - bottom - innerH * (row.balance / (maxBal+1e-6));
    if(idx===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  // X-axis labels (years)
  ctx.fillStyle = '#586070'; ctx.textAlign = 'center';
  yearly.forEach((row, idx)=>{
    const x = left + idx*xStep + xStep/2;
    ctx.fillText(String(row.year), x, H-12);
  });
  ctx.textAlign = 'left';
}

// --- Controller ---
function compute(){
  const price = Number($('price').value)||0;
  const downPct = Math.max(0, Math.min(100, Number($('downPct').value)||0));
  const termYears = Number($('term').value)||25;
  const ratePct = Number($('rate').value)||0;
  const freqKey = $('frequency').value;

  const principal = Math.max(0, price - price*(downPct/100));
  const i_month = monthlyRate(ratePct);

  const out = buildSchedule(principal, i_month, termYears, freqKey);
  $('perPeriod').textContent = fmt(out.payPerPeriod, state.country);
  $('monthlyOut').textContent = fmt(out.monthlyEquivalent, state.country);
  const f = FREQUENCIES[freqKey];
  $('perPeriodNote').textContent = `${f.label} • ${f.ppy} payments/yr${f.accel ? ' • accelerated' : ''}`;

  drawChart(out.yearly, principal);
}

function bind(){
  // Country toggle
  document.querySelectorAll('#countryToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#countryToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.country = btn.dataset.country;
      if(state.country==='canada'){ $('rate').value=5.29; $('term').value=25; }
      else { $('rate').value=6.25; $('term').value=30; }
      compute();
    });
  });

  // Inputs
  ['region','term','price','downPct','rate','frequency'].forEach(id=>{
    const el = $(id);
    if(!el) return;
    el.addEventListener('input', compute);
    el.addEventListener('change', compute);
  });

  // Prefills
  $('prefillCanada').addEventListener('click',()=>{
    document.querySelector('#countryToggle [data-country=\"canada\"]').click();
    $('region').value = 'Toronto, ON';
    $('term').value = '25';
    $('price').value = '700000';
    $('downPct').value = '10';
    $('rate').value = '5.29';
    $('frequency').value = 'accelerated-biweekly';
    compute();
  });
  $('prefillUSA').addEventListener('click',()=>{
    document.querySelector('#countryToggle [data-country=\"usa\"]').click();
    $('region').value = 'San Francisco, CA';
    $('term').value = '30';
    $('price').value = '550000';
    $('downPct').value = '5';
    $('rate').value = '6.25';
    $('frequency').value = 'monthly';
    compute();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  bind();
  compute();
});