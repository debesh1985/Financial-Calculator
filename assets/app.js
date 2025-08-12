// ------- Utilities -------
const $ = (id)=>document.getElementById(id);
const fmt = (v, country)=>{
  const currency = country==='canada'?'CAD':'USD';
  return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(isFinite(v)?v:0);
};

// ------- Config -------
const CONFIG = {
  canada:{
    compounding:'semi-annual',
    cmhc:[
      {min:0.8001,max:0.85,rate:0.028},
      {min:0.8501,max:0.90,rate:0.031},
      {min:0.9001,max:0.95,rate:0.040},
      {min:0.9501,max:1.00,rate:0.040}
    ],
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

// ------- Math helpers -------
function monthlyRate(annualPct){
  const r = Math.max(0, Number(annualPct)/100);
  if(state.country==='canada'){
    return Math.pow(1 + r/2, 2/12) - 1; // semi-annual -> effective monthly
  } else {
    return r/12; // monthly
  }
}

function pmt(principal, i, n){
  if(i<=0) return principal/Math.max(1,n);
  const f = Math.pow(1+i,n);
  return principal * (i*f)/(f-1);
}

function findRate(buckets, ltv){
  for(const b of buckets){ if(ltv>=b.min && ltv<=b.max) return b.rate; }
  return 0;
}

// ------- Core compute -------
function compute(){
  try{
    const price = Number($('price').value)||0;
    const downPct = Math.max(0, Math.min(100, Number($('downPct').value)||0));
    const termYears = Number($('term').value)||25;
    const ratePct = Number($('rate').value)||0;
    const freq = $('frequency').value;
    const condo = Number($('condo').value)||0;
    const homeIns = Number($('homeIns').value)||0;
    const taxMode = $('taxMode').value;
    const taxVal = Number($('taxValue').value)||0;
    const water = Number($('water').value)||0;
    const elec = Number($('electricity').value)||0;
    const heat = Number($('heating').value)||0;
    const closingPct = Number($('closingPct').value)||0;
    const financeClosing = $('financeClosing').checked;
    const financePremium = $('financePremium')?.checked;
    const currBalance = Number($('currBalance').value)||0;
    const cashOut = Number($('cashOut').value)||0;

    const n_months = termYears*12;
    const i_month = monthlyRate(ratePct);

    // Base loan
    const dpAmount = price * (downPct/100);
    let baseLoan = 0;
    if(state.flow==='purchase'){
      baseLoan = Math.max(0, price - dpAmount);
      if(financeClosing){ baseLoan += price * (closingPct/100); }
    } else {
      baseLoan = Math.max(0, currBalance + cashOut);
    }

    const ltv = price>0 ? baseLoan/price : 0;

    // Mortgage insurance
    let miMonthly = 0;
    let upfrontAdd = 0;
    let miApplied = false;

    if(state.country==='canada'){
      $('usInsToggle').style.display='none';
      $('canadaToggles').style.display='grid';
      if(ltv>0.80){
        miApplied = true;
        const rate = findRate(CONFIG.canada.cmhc, ltv) || 0;
        const premium = baseLoan * rate;
        if(financePremium){ upfrontAdd += premium; }
      }
    } else {
      $('canadaToggles').style.display='none';
      $('usInsToggle').style.display='inline-flex';
      if(ltv>0.80){
        miApplied = true;
        if(state.usIns==='fha'){
          const uf = CONFIG.usa.fha.ufmip;
          upfrontAdd += baseLoan * uf;
          const match = CONFIG.usa.fha.mip.find(r=> termYears===r.term && ltv>=r.min && ltv<=r.max );
          const mip = (match?.rate) || 0.0055;
          miMonthly = (mip * baseLoan)/12;
        } else {
          const pmiRate = findRate(CONFIG.usa.pmi, ltv) || 0.0075;
          miMonthly = (pmiRate * baseLoan)/12;
        }
      }
    }

    const principal = baseLoan + upfrontAdd;

    // Payments by frequency
    const sel = FREQUENCIES[freq] || FREQUENCIES['monthly'];
    const i_p = Math.pow(1 + i_month, 12/sel.ppy) - 1;
    const n_p = termYears * sel.ppy;
    const baseMonthly = pmt(principal, i_month, n_months);
    let payPerPeriod = pmt(principal, i_p, n_p);
    if(sel.accel){ payPerPeriod = (baseMonthly * 13) / sel.ppy; }
    const monthlyEquivalent = payPerPeriod * (sel.ppy/12);

    // Property tax
    let monthlyTax = 0;
    if(taxMode==='percent'){
      monthlyTax = (taxVal/100 * price)/12;
    } else {
      monthlyTax = taxVal;
    }

    const totalMonthly = monthlyEquivalent + miMonthly + monthlyTax + condo + water + elec + heat + (homeIns||0);

    // UI
    $('totalOut').textContent = fmt(totalMonthly, state.country);
    $('miChip').style.display = miApplied? 'inline-block':'none';
    $('noMiChip').style.display = (!miApplied && price>0)? 'inline-block':'none';

    const bd = [
      ['Mortgage P&I', monthlyEquivalent],
      ['Mortgage insurance', miMonthly],
      ['Property tax', monthlyTax],
      ['Condo fee', condo],
      ['Water', water],
      ['Electricity', elec],
      ['Heating', heat],
    ];
    if(homeIns>0) bd.push(['Home insurance', homeIns]);

    const list = $('breakdown'); list.innerHTML='';
    bd.forEach(([k,v])=>{
      const div = document.createElement('div');
      div.className='item';
      div.innerHTML = `<span class="muted">${k}</span><strong>${fmt(v, state.country)}</strong>`;
      list.appendChild(div);
    });

    drawChart(principal, i_p, n_p, payPerPeriod);
  } catch (e){
    console.error('compute error', e);
  }
}

// ------- Chart -------
function drawChart(principal, i_p, n_p, pay){
  const c = $('spark'); const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0,0,W,H);
  // axis baseline
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8,H-8); ctx.lineTo(W-8,H-8); ctx.stroke();

  // Simulate per period
  const steps = Math.min(400, Math.floor(n_p));
  const stepN = Math.max(1, Math.floor(n_p/steps));
  let bal = principal;
  const balS=[], princS=[], intS=[];
  for(let k=0; k<n_p; k++){
    const interest = bal * i_p;
    const princ = Math.max(0, pay - interest);
    bal = Math.max(0, bal - princ);
    if(k % stepN === 0){ balS.push(bal); princS.push(Math.max(0,princ)); intS.push(Math.max(0,interest)); }
    if(bal<=0) break;
  }
  const xStep = (W-16)/Math.max(1, balS.length-1);
  const maxB = principal;
  const maxComp = Math.max(...princS, ...intS, 1);

  // balance line (blue)
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth=2; ctx.beginPath();
  balS.forEach((b,idx)=>{
    const x = 8 + idx*xStep;
    const yInv = H - (8 + (H-16) * (b/(maxB+1e-6)));
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();

  // principal (green)
  ctx.strokeStyle = '#10b981'; ctx.lineWidth=1.5; ctx.beginPath();
  princS.forEach((p,idx)=>{
    const x = 8 + idx*xStep;
    const yInv = H - (8 + (H-16) * (p/maxComp));
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();

  // interest (amber)
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth=1.5; ctx.beginPath();
  intS.forEach((p,idx)=>{
    const x = 8 + idx*xStep;
    const yInv = H - (8 + (H-16) * (p/maxComp));
    if(idx===0) ctx.moveTo(x,yInv); else ctx.lineTo(x,yInv);
  });
  ctx.stroke();
}

// ------- Bindings -------
function bind(){
  // Country toggle
  document.querySelectorAll('#countryToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#countryToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.country = btn.dataset.country;
      if(state.country==='canada'){
        $('rate').value=5.29; $('term').value=25; $('taxValue').value=CONFIG.canada.defaults.taxPct; $('heating').value=100; $('condo').value=CONFIG.canada.defaults.condo;
      } else {
        $('rate').value=6.25; $('term').value=30; $('taxValue').value=CONFIG.usa.defaults.taxPct; $('heating').value=90; $('condo').value=CONFIG.usa.defaults.condo;
      }
      compute();
    });
  });

  // Flow toggle
  document.querySelectorAll('#flowToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#flowToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.flow = btn.dataset.flow==='refi'?'refi':'purchase';
      $('purchaseOnly').style.display = state.flow==='purchase'? 'grid':'none';
      $('refiOnly').style.display = state.flow==='refi'? 'grid':'none';
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

  // Tax mode change
  $('taxMode').addEventListener('change',()=>{
    if($('taxMode').value==='percent'){
      $('taxValueWrap').querySelector('.label').textContent = 'Property tax (% per year)';
    } else {
      $('taxValueWrap').querySelector('.label').textContent = 'Property tax (fixed monthly)';
      $('taxValue').value = 400;
    }
    compute();
  });

  // Frequency change
  $('frequency').addEventListener('change', compute);

  // Inputs recalc
  document.querySelectorAll('input, select').forEach(el=>{
    el.addEventListener('input', compute);
    el.addEventListener('change', compute);
  });

  // Prefills
  $('prefillCanada').addEventListener('click',()=>{
    document.querySelector('#countryToggle [data-country=\"canada\"]').click();
    $('region').value='Toronto, ON';
    $('term').value='25'; $('price').value='700000'; $('downPct').value='10'; $('rate').value='5.29';
    $('condo').value='400'; $('taxMode').value='percent'; $('taxValue').value='1.0';
    $('water').value='40'; $('electricity').value='120'; $('heating').value='100';
    compute();
  });
  $('prefillUSA').addEventListener('click',()=>{
    document.querySelector('#countryToggle [data-country=\"usa\"]').click();
    $('region').value='San Francisco, CA';
    $('term').value='30'; $('price').value='550000'; $('downPct').value='5'; $('rate').value='6.25';
    $('condo').value='250'; $('taxMode').value='percent'; $('taxValue').value='1.8';
    $('water').value='40'; $('electricity').value='120'; $('heating').value='90';
    state.usIns='fha';
    document.querySelector('#usInsToggle [data-ins=\"fha\"]').classList.add('active');
    document.querySelector('#usInsToggle [data-ins=\"pmi\"]').classList.remove('active');
    compute();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ bind(); compute(); });
