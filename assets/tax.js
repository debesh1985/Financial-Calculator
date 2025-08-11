const $ = (id)=>document.getElementById(id);
const provinces = [
  {code:'AB', name:'Alberta',        type:'GST', rate:0.05},
  {code:'BC', name:'British Columbia', type:'GST', rate:0.05}, // PST separate; not included
  {code:'MB', name:'Manitoba',       type:'GST', rate:0.05}, // RST separate
  {code:'NB', name:'New Brunswick',  type:'HST', rate:0.15},
  {code:'NL', name:'Newfoundland and Labrador', type:'HST', rate:0.15},
  {code:'NS', name:'Nova Scotia',    type:'HST', rate:0.15},
  {code:'NT', name:'Northwest Territories', type:'GST', rate:0.05},
  {code:'NU', name:'Nunavut',        type:'GST', rate:0.05},
  {code:'ON', name:'Ontario',        type:'HST', rate:0.13},
  {code:'PE', name:'Prince Edward Island', type:'HST', rate:0.15},
  {code:'QC', name:'Quebec',         type:'GST', rate:0.05}, // QST separate; not included
  {code:'SK', name:'Saskatchewan',   type:'GST', rate:0.05},
  {code:'YT', name:'Yukon',          type:'GST', rate:0.05},
];

function fmt(n){
  return new Intl.NumberFormat(undefined,{style:'currency',currency:'CAD'}).format(isFinite(n)?n:0);
}

function populateProvince(){
  const sel = $("province");
  provinces.forEach(p=>{
    const o = document.createElement('option');
    o.value = p.code;
    o.textContent = `${p.name} (${p.type === 'HST' ? 'HST' : 'GST'} ${Math.round(p.rate*100)}%)`;
    sel.appendChild(o);
  });
  sel.value = 'ON';
}

function getRate(){
  const mode = $("taxMode").value;
  if(mode === 'gst'){
    return 0.05;
  } else if(mode === 'custom'){
    const r = Number($("customRate").value)||0;
    return Math.max(0, r)/100;
  } else {
    const p = provinces.find(x=> x.code === $("province").value);
    return p ? p.rate : 0.05;
  }
}

function compute(){
  const rate = getRate();
  const price = Number($("price").value);
  const total = Number($("total").value);

  let base = NaN, tax = NaN, gross = NaN;

  if(isFinite(total) && total > 0){
    // Breakout from total
    gross = total;
    base = gross / (1 + rate);
    tax = gross - base;
  } else if(isFinite(price) && price > 0){
    base = price;
    tax = base * rate;
    gross = base + tax;
  } else {
    $("breakdown").innerHTML = '<div class=\"item\"><span class=\"muted\">Waiting for input…</span><strong>—</strong></div>';
    return;
  }

  $("breakdown").innerHTML = `
    <div class="item"><span class="muted">Tax rate</span><strong>${(rate*100).toFixed(2)}%</strong></div>
    <div class="item"><span class="muted">Price before tax</span><strong>${fmt(base)}</strong></div>
    <div class="item"><span class="muted">GST/HST amount</span><strong>${fmt(tax)}</strong></div>
    <div class="item"><span class="muted">Total after tax</span><strong>${fmt(gross)}</strong></div>
  `;
}

function bind(){
  $("province").addEventListener('change', compute);
  $("taxMode").addEventListener('change', ()=>{
    $("customWrap").style.display = $("taxMode").value==='custom' ? 'grid':'none';
    compute();
  });
  ["customRate","price","total"].forEach(id=>{
    $(id).addEventListener('input', compute);
    $(id).addEventListener('change', compute);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  populateProvince();
  bind();
  compute();
});
