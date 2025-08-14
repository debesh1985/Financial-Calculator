// --- Utilities ---
const $ = (id)=>document.getElementById(id);
const fmt = (v, country)=> new Intl.NumberFormat(undefined,{style:'currency',currency:(country==='canada'?'CAD':'USD')}).format(isFinite(v)?v:0);

// Country + state
let state = { country:'canada', flow:'purchase', usIns:'fha' };

const FREQUENCIES = {
  'monthly':              {ppy:12,  accel:false, label:'Monthly'},
  'semi-monthly':         {ppy:24,  accel:false, label:'Semi-Monthly'},
  'biweekly':             {ppy:26,  accel:false, label:'Bi-Weekly'},
  'accelerated-biweekly': {ppy:26,  accel:true,  label:'Accelerated Bi-Weekly'},
  'weekly':               {ppy:52,  accel:false, label:'Weekly'},
  'accelerated-weekly':   {ppy:52,  accel:true,  label:'Accelerated Weekly'},
};

// Insurance tables (simplified/typical)
const TABLES = {
  canada: {
    cmhc: [
      {min:0.8001, max:0.85, rate:0.028},
      {min:0.8501, max:0.90, rate:0.031},
      {min:0.9001, max:0.95, rate:0.040},
      {min:0.9501, max:1.00, rate:0.040}
    ]
  },
  usa: {
    fha: {
      ufmip: 0.0175,
      mip: [
        {term:30, min:0.9501, max:1.00, rate:0.0055},
        {term:30, min:0.9001, max:0.95, rate:0.0050},
        {term:30, min:0.00,   max:0.90, rate:0.0045},
        {term:15, min:0.9001, max:1.00, rate:0.0040},
        {term:15, min:0.00,   max:0.90, rate:0.0025}
      ]
    },
    pmi: [
      {min:0.9001, max:0.95, rate:0.0090},
      {min:0.8501, max:0.90, rate:0.0060},
      {min:0.8001, max:0.85, rate:0.0035}
    ]
  }
};

// Compounding rules
function monthlyRate(annualPct){
  const r = Math.max(0, Number(annualPct)/100);
  return state.country==='canada'
    ? Math.pow(1 + r/2, 2/12) - 1
    : r/12;
}

// PMT
function pmt(principal, i, n){
  if(i<=0) return principal/Math.max(1,n);
  const f = Math.pow(1+i,n);
  return principal * (i*f)/(f-1);
}

function bucketRate(buckets, ltv){
  for(const b of buckets){ if(ltv>=b.min && ltv<=b.max) return b.rate; }
  return 0;
}

// Build schedule per period, aggregate by year
function buildSchedule(principal, i_month, years, freqKey, accelMonthly=null){
  const f = FREQUENCIES[freqKey] || FREQUENCIES['monthly'];
  const n_months = years*12;
  const n_periods = years * f.ppy;
  const i_period = Math.pow(1+i_month, 12/f.ppy) - 1;

  const monthlyBase = pmt(principal, i_month, n_months);
  let payPerPeriod = pmt(principal, i_period, n_periods);
  if(f.accel){
    const base = (accelMonthly!=null ? accelMonthly : monthlyBase);
    payPerPeriod = (base * 13) / f.ppy;
  }

  let bal = principal;
  const yearly = [];
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
  while(yearly.length < years){
    yearly.push({year:yearly.length+1, principal:0, interest:0, balance:0});
  }
  return {payPerPeriod, monthlyEquivalent: payPerPeriod * (f.ppy/12), yearly};
}

// Draw chart
function drawChart(yearly, principal0){
  const c = $('chart');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0,0,W,H);

  const left = 42, right = 12, top = 12, bottom = 32;
  const innerW = W - left - right;
  const innerH = H - top - bottom;

  const maxYearPay = Math.max(1, ...yearly.map(y=>y.principal + y.interest));
  const maxBal = Math.max(principal0, ...yearly.map(y=>y.balance));
  const xStep = innerW / Math.max(1, yearly.length);

  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, H-bottom); ctx.lineTo(W-right, H-bottom); ctx.stroke();

  // Y ticks
  ctx.fillStyle = '#586070'; ctx.font = '11px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  const ticks = 4;
  for(let t=0;t<=ticks;t++){
    const v = maxYearPay * t / ticks;
    const y = H - bottom - innerH * (t/ticks);
    ctx.fillText(fmt(v, state.country), 4, y+3);
    ctx.strokeStyle = '#f3f4f6'; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(W-right, y); ctx.stroke();
  }

  // Bars (interest bottom, principal top)
  const barW = Math.max(6, xStep*0.6);
  yearly.forEach((row, idx)=>{
    const x = left + idx*xStep + (xStep-barW)/2;
    const ih = innerH * (row.interest / maxYearPay);
    const ipx = (H - bottom) - ih;
    const ph = innerH * (row.principal / maxYearPay);
    const ppx = ipx - ph;
    const cappedIpx = Math.max(top, Math.min(H-bottom, ipx));
    const cappedPpx = Math.max(top, Math.min(H-bottom, ppx));
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(x, cappedIpx, barW, Math.max(0, ih));
    ctx.fillStyle = '#10b981'; ctx.fillRect(x, cappedPpx, barW, Math.max(0, ph));
  });

  // Balance line
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.beginPath();
  yearly.forEach((row, idx)=>{
    const x = left + idx*xStep + xStep/2;
    const y = H - bottom - innerH * (row.balance / (maxBal+1e-6));
    if(idx===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Year labels
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
  const taxM = Number($('taxMonthly').value)||0;
  const condo = Number($('condo').value)||0;
  const water = Number($('water').value)||0;
  const elec = Number($('electricity').value)||0;
  const heat = Number($('heating').value)||0;
  const homeIns = Number($('homeIns').value)||0;
  const currBalance = Number($('currBalance').value)||0;
  const cashOut = Number($('cashOut').value)||0;
  const termSel = Number($('term').value)||30;

  // Base loan and LTV
  let baseLoan = 0, value = price;
  if(state.flow==='purchase'){
    const dp = price * (downPct/100);
    baseLoan = Math.max(0, price - dp);
  } else {
    baseLoan = Math.max(0, currBalance + cashOut);
  }
  const ltv = value>0 ? baseLoan/value : 0;

  // Insurance
  let upfrontAdd = 0;
  let miMonthly = 0;
  if(state.country==='canada'){
    // CMHC only for purchase
    if(state.flow==='purchase' && ltv > 0.80){
      const r = bucketRate(TABLES.canada.cmhc, ltv) || 0;
      const premium = baseLoan * r;
      if(($('financePremium') && $('financePremium').checked) || true){
        upfrontAdd += premium;
      }
    }
  } else {
    // USA: FHA or PMI when LTV>80%
    if(ltv>0.80){
      if(state.usIns==='fha'){
        const uf = TABLES.usa.fha.ufmip;
        const ufAmt = baseLoan * uf; upfrontAdd += ufAmt;
        const match = TABLES.usa.fha.mip.find(x=> (termSel>=25?30:15)===x.term && ltv>=x.min && ltv<=x.max);
        const mipRate = (match && match.rate) || 0.0055;
        miMonthly = (mipRate * baseLoan)/12;
      } else {
        const pmiRate = bucketRate(TABLES.usa.pmi, ltv) || 0.0075;
        miMonthly = (pmiRate * baseLoan)/12;
      }
    }
  }

  const principal = baseLoan + upfrontAdd;
  const i_month = monthlyRate(ratePct);
  const monthlyBase = pmt(principal, i_month, termYears*12);
  const schedule = buildSchedule(principal, i_month, termYears, freqKey, monthlyBase);

  // Ownership total (monthly view)
  const monthlyOwnership = schedule.monthlyEquivalent + miMonthly + taxM + condo + water + elec + heat + (homeIns||0);

  // Outputs
  $('perPeriod').textContent = fmt(schedule.payPerPeriod, state.country);
  $('monthlyOut').textContent  = fmt(schedule.monthlyEquivalent, state.country);
  $('perPeriodNote').textContent = `${FREQUENCIES[freqKey].label} • ${FREQUENCIES[freqKey].ppy} payments/yr${FREQUENCIES[freqKey].accel ? ' • accelerated' : ''}`;

  $('ownershipTotal').textContent = fmt(monthlyOwnership, state.country);

  const list = $('breakdown');
  list.innerHTML = '';
  const rows = [
    ['Mortgage P&I (monthly equiv.)', schedule.monthlyEquivalent],
    ['Mortgage insurance', miMonthly],
    ['Property tax', taxM],
    ['Condo fee', condo],
    ['Water', water],
    ['Electricity', elec],
    ['Heating', heat]
  ];
  if(homeIns>0) rows.push(['Home insurance', homeIns]);
  rows.forEach(([k,v])=>{
    const div = document.createElement('div');
    div.className='item';
    div.innerHTML = `<span class="small">${k}</span><strong>${fmt(v, state.country)}</strong>`;
    list.appendChild(div);
  });

  drawChart(schedule.yearly, principal);
}

// Update results
function updateResults() {
  const results = calculate(); // Assuming calculate() returns an object with mortgage details

  if (!results) {
    document.getElementById('results').style.display = 'none';
    document.getElementById('amortizationSection').style.display = 'none';
    return;
  }

  // Show results
  document.getElementById('results').style.display = 'block';
  document.getElementById('amortizationSection').style.display = 'block';

  // Update payment breakdown
  document.getElementById('principalInterest').textContent = formatCurrency(results.principalInterest);
  document.getElementById('propertyTaxResult').textContent = formatCurrency(results.propertyTax);
  document.getElementById('homeInsuranceResult').textContent = formatCurrency(results.homeInsurance);
  document.getElementById('cmhcInsuranceResult').textContent = formatCurrency(results.cmhcInsurance);
  document.getElementById('condoFeesResult').textContent = formatCurrency(results.condoFees);
  document.getElementById('utilitiesResult').textContent = formatCurrency(results.utilities);
  document.getElementById('totalPayment').textContent = formatCurrency(results.totalPayment);

  // Update loan summary
  document.getElementById('loanAmount').textContent = formatCurrency(results.loanAmount);
  document.getElementById('totalInterest').textContent = formatCurrency(results.totalInterest);
  document.getElementById('totalCost').textContent = formatCurrency(results.totalCost);
  document.getElementById('numberOfPayments').textContent = results.numberOfPayments;

  // Update down payment percentage display
  const downPaymentPercent = ((results.downPayment / results.homePrice) * 100).toFixed(1);
  document.getElementById('downPaymentPercent').textContent = downPaymentPercent + '%';

  // Update KPI sidebar if it exists
  const downPaymentPercentKPI = document.getElementById('downPaymentPercentKPI');
  const interestRateKPI = document.getElementById('interestRateKPI');
  const amortizationKPI = document.getElementById('amortizationKPI');

  if (downPaymentPercentKPI) downPaymentPercentKPI.textContent = downPaymentPercent + '%';
  if (interestRateKPI) interestRateKPI.textContent = results.interestRate + '%';
  if (amortizationKPI) amortizationKPI.textContent = results.amortization + ' years';

  // Generate amortization table
  generateAmortizationTable(results);
}


function bind(){
  // Country toggle
  document.querySelectorAll('#countryToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#countryToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.country = btn.dataset.country;
      // Show/hide insurance toggles
      document.getElementById('canadaToggles').style.display = (state.country==='canada') ? 'grid':'none';
      document.getElementById('usInsToggle').style.display   = (state.country==='usa') ? 'inline-flex':'none';
      // Default rates/terms
      if(state.country==='canada'){ $('rate').value=5.29; $('term').value=25; }
      else { $('rate').value=6.25; $('term').value=30; }
      compute();
    });
  });

  // Flow toggle
  document.querySelectorAll('#flowToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#flowToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.flow = btn.dataset.flow === 'refi' ? 'refi' : 'purchase';
      document.getElementById('refiWrap').style.display = state.flow==='refi' ? 'grid' : 'none';
      document.getElementById('downWrap').style.display = state.flow==='purchase' ? 'block' : 'none';
      compute();
    });
  });

  // US insurance toggle
  document.querySelectorAll('#usInsToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#usInsToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.usIns = btn.dataset.ins;
      compute();
    });
  });

  // Inputs
  ['region','term','price','downPct','rate','frequency','taxMonthly','condo','water','electricity','heating','homeIns','currBalance','cashOut','financePremium'].forEach(id=>{
    const el = $(id);
    if(!el) return;
    el.addEventListener('input', compute);
    el.addEventListener('change', compute);
  });

  // Prefills
  $('prefillCanada').addEventListener('click',()=>{
    document.querySelector('#countryToggle [data-country=\"canada\"]').click();
    document.querySelector('#flowToggle [data-flow=\"purchase\"]').click();
    $('region').value = 'Toronto, ON';
    $('term').value = '25';
    $('price').value = '800000';
    $('downPct').value = '10';
    $('rate').value = '5.29';
    $('frequency').value = 'accelerated-biweekly';
    $('taxMonthly').value='400'; $('condo').value='300'; $('water').value='40'; $('electricity').value='120'; $('heating').value='100'; $('homeIns').value='0';
    compute();
  });
  $('prefillUSA').addEventListener('click',()=>{
    document.querySelector('#countryToggle [data-country=\"usa\"]').click();
    document.querySelector('#flowToggle [data-flow=\"purchase\"]').click();
    $('region').value = 'San Francisco, CA';
    $('term').value = '30';
    $('price').value = '950000';
    $('downPct').value = '5';
    $('rate').value = '6.25';
    $('frequency').value = 'monthly';
    $('taxMonthly').value='800'; $('condo').value='250'; $('water').value='40'; $('electricity').value='130'; $('heating').value='90'; $('homeIns').value='0';
    // default US insurance selection stays FHA; toggle visible due to country
    compute();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  bind();
  // default visibility on load
  document.getElementById('canadaToggles').style.display = 'grid';
  compute();
});