// Lightweight autocomplete for Canadian & US cities + provinces/states.
// Also maps selected location to a province/state code, so GST/HST page can set the correct rate.

(function(){
  const locations = [
    // Canada cities
    {label:'Toronto, ON', prov:'ON'}, {label:'Ottawa, ON', prov:'ON'}, {label:'Mississauga, ON', prov:'ON'},
    {label:'Vancouver, BC', prov:'BC'}, {label:'Victoria, BC', prov:'BC'}, {label:'Kelowna, BC', prov:'BC'},
    {label:'Montreal, QC', prov:'QC'}, {label:'Quebec City, QC', prov:'QC'}, {label:'Laval, QC', prov:'QC'},
    {label:'Calgary, AB', prov:'AB'}, {label:'Edmonton, AB', prov:'AB'},
    {label:'Winnipeg, MB', prov:'MB'}, {label:'Saskatoon, SK', prov:'SK'}, {label:'Regina, SK', prov:'SK'},
    {label:'Halifax, NS', prov:'NS'}, {label:'St. John\'s, NL', prov:'NL'}, {label:'Charlottetown, PE', prov:'PE'},
    // USA cities (include an alias for the user's example)
    {label:'San Francisco, CA', prov:'CA'}, {label:'Sun Francisco, CA', prov:'CA'},
    {label:'Los Angeles, CA', prov:'CA'}, {label:'San Diego, CA', prov:'CA'}, {label:'San Jose, CA', prov:'CA'},
    {label:'New York, NY', prov:'NY'}, {label:'Chicago, IL', prov:'IL'}, {label:'Houston, TX', prov:'TX'},
    {label:'Phoenix, AZ', prov:'AZ'}, {label:'Miami, FL', prov:'FL'}, {label:'Orlando, FL', prov:'FL'},
    {label:'Seattle, WA', prov:'WA'}, {label:'Boston, MA', prov:'MA'}, {label:'Austin, TX', prov:'TX'},
    {label:'Dallas, TX', prov:'TX'}, {label:'Washington, DC', prov:'DC'}, {label:'Atlanta, GA', prov:'GA'},
    {label:'Denver, CO', prov:'CO'}, {label:'Las Vegas, NV', prov:'NV'}, {label:'Philadelphia, PA', prov:'PA'}, {label:'Portland, OR', prov:'OR'},
    // Provinces/Territories (as standalone)
    {label:'Ontario (ON)', prov:'ON'}, {label:'Quebec (QC)', prov:'QC'}, {label:'British Columbia (BC)', prov:'BC'},
    {label:'Alberta (AB)', prov:'AB'}, {label:'Manitoba (MB)', prov:'MB'}, {label:'Saskatchewan (SK)', prov:'SK'},
    {label:'Nova Scotia (NS)', prov:'NS'}, {label:'New Brunswick (NB)', prov:'NB'}, {label:'Prince Edward Island (PE)', prov:'PE'},
    {label:'Newfoundland and Labrador (NL)', prov:'NL'}, {label:'Yukon (YT)', prov:'YT'}, {label:'Northwest Territories (NT)', prov:'NT'}, {label:'Nunavut (NU)', prov:'NU'},
    // US states (subset)
    {label:'California (CA)', prov:'CA'}, {label:'New York (NY)', prov:'NY'}, {label:'Texas (TX)', prov:'TX'},
    {label:'Florida (FL)', prov:'FL'}, {label:'Washington (WA)', prov:'WA'}, {label:'Massachusetts (MA)', prov:'MA'},
    {label:'Arizona (AZ)', prov:'AZ'}, {label:'Colorado (CO)', prov:'CO'}, {label:'Georgia (GA)', prov:'GA'},
    {label:'Illinois (IL)', prov:'IL'}, {label:'Nevada (NV)', prov:'NV'}, {label:'Oregon (OR)', prov:'OR'}, {label:'Pennsylvania (PA)', prov:'PA'}
  ];

  function attachAutocomplete(inputId, listId, onPick){
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if(!input || !list) return;

    let activeIndex = -1;

    function close(){ list.style.display='none'; list.innerHTML=''; activeIndex=-1; }
    function open(items){
      list.innerHTML='';
      items.forEach((it, idx)=>{
        const div = document.createElement('div');
        div.className = 'ac-item';
        div.textContent = it.label;
        div.addEventListener('mousedown', (e)=>{ // mousedown to fire before input blur
          e.preventDefault();
          input.value = it.label;
          close();
          if(onPick) onPick(it);
        });
        list.appendChild(div);
      });
      list.style.display = items.length ? 'block' : 'none';
    }

    input.addEventListener('input', ()=>{
      const q = input.value.trim().toLowerCase();
      if(q.length < 2){ close(); return; }
      const items = locations.filter(x=> x.label.toLowerCase().includes(q)).slice(0, 15);
      open(items);
    });

    input.addEventListener('keydown', (e)=>{
      const items = Array.from(list.querySelectorAll('.ac-item'));
      if(!items.length) return;
      if(e.key === 'ArrowDown'){ activeIndex = Math.min(items.length-1, activeIndex+1); }
      else if(e.key === 'ArrowUp'){ activeIndex = Math.max(0, activeIndex-1); }
      else if(e.key === 'Enter' && activeIndex>=0){
        e.preventDefault();
        items[activeIndex].dispatchEvent(new Event('mousedown'));
        return;
      } else if(e.key === 'Escape'){ close(); return; }
      items.forEach((it,i)=> it.classList.toggle('active', i===activeIndex));
    });

    input.addEventListener('blur', ()=> setTimeout(close, 120));
  }

  // Mortgage page
  if(document.getElementById('region')){
    attachAutocomplete('region','region-list');
  }

  // GST/HST page — set province code for tax logic when a location is picked
  if(document.getElementById('gsRegion')){
    attachAutocomplete('gsRegion','gsRegion-list', (picked)=>{
      // Extract province/state code from the end of the label if present like ", ON" or "(ON)"
      const m = picked.label.match(/[,\\s\\(]([A-Z]{2})\\)?$/);
      const code = m ? m[1] : 'ON';
      window.__provinceCode = code;
      // Force province-backed mode
      const mode = document.getElementById('taxMode');
      if(mode){ mode.value = 'province'; }
      // Trigger recompute if tax.js loaded
      if(typeof compute === 'function'){ compute(); }
    });
  }
})();