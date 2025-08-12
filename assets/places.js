(function(){
  const locations = [
    // Canada (cities)
    {label:'Toronto, ON', code:'ON'},{label:'Ottawa, ON', code:'ON'},{label:'Mississauga, ON', code:'ON'},{label:'Hamilton, ON', code:'ON'},
    {label:'Montreal, QC', code:'QC'},{label:'Quebec City, QC', code:'QC'},{label:'Laval, QC', code:'QC'},
    {label:'Vancouver, BC', code:'BC'},{label:'Victoria, BC', code:'BC'},{label:'Surrey, BC', code:'BC'},{label:'Burnaby, BC', code:'BC'},
    {label:'Calgary, AB', code:'AB'},{label:'Edmonton, AB', code:'AB'},
    {label:'Winnipeg, MB', code:'MB'},{label:'Regina, SK', code:'SK'},{label:'Saskatoon, SK', code:'SK'},
    {label:'Halifax, NS', code:'NS'},{label:'Moncton, NB', code:'NB'},{label:'St. John\'s, NL', code:'NL'},{label:'Charlottetown, PE', code:'PE'},
    {label:'Whitehorse, YT', code:'YT'},{label:'Yellowknife, NT', code:'NT'},{label:'Iqaluit, NU', code:'NU'},
    // Canada (provinces/territories)
    {label:'Ontario (ON)', code:'ON'},{label:'Quebec (QC)', code:'QC'},{label:'British Columbia (BC)', code:'BC'},{label:'Alberta (AB)', code:'AB'},
    {label:'Manitoba (MB)', code:'MB'},{label:'Saskatchewan (SK)', code:'SK'},{label:'Nova Scotia (NS)', code:'NS'},{label:'New Brunswick (NB)', code:'NB'},
    {label:'Prince Edward Island (PE)', code:'PE'},{label:'Newfoundland and Labrador (NL)', code:'NL'},{label:'Yukon (YT)', code:'YT'},
    {label:'Northwest Territories (NT)', code:'NT'},{label:'Nunavut (NU)', code:'NU'},
    // USA (cities)
    {label:'New York, NY', code:'NY'},{label:'Los Angeles, CA', code:'CA'},{label:'San Francisco, CA', code:'CA'},{label:'San Diego, CA', code:'CA'},
    {label:'Seattle, WA', code:'WA'},{label:'Portland, OR', code:'OR'},{label:'Phoenix, AZ', code:'AZ'},{label:'Denver, CO', code:'CO'},
    {label:'Austin, TX', code:'TX'},{label:'Dallas, TX', code:'TX'},{label:'Houston, TX', code:'TX'},
    {label:'Chicago, IL', code:'IL'},{label:'Miami, FL', code:'FL'},{label:'Orlando, FL', code:'FL'},
    {label:'Boston, MA', code:'MA'},{label:'Philadelphia, PA', code:'PA'},{label:'Atlanta, GA', code:'GA'},
    {label:'Las Vegas, NV', code:'NV'},{label:'Washington, DC', code:'DC'}
  ];

  function attachAutocomplete(inputId, listId, onPick){
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if(!input || !list) return;

    let activeIndex = -1;

    function close(){ list.style.display='none'; list.innerHTML=''; activeIndex=-1; }
    function render(items){
      list.innerHTML='';
      items.forEach((it, idx)=>{
        const div = document.createElement('div');
        div.className = 'ac-item';
        div.textContent = it.label;
        const choose = (e)=>{ e.preventDefault(); input.value = it.label; close(); onPick && onPick(it); };
        div.addEventListener('pointerdown', choose, {passive:false});
        div.addEventListener('touchstart', choose, {passive:false});
        div.addEventListener('mousedown', choose);
        div.addEventListener('click', choose);
        list.appendChild(div);
      });
      list.style.display = items.length ? 'block' : 'none';
    }

    function search(q){
      const qq = q.trim().toLowerCase();
      if(qq.length<2) return [];
      const starts = [], contains = [];
      for(const x of locations){
        const lab = x.label.toLowerCase();
        if(lab.startsWith(qq) || lab.split(/[,\s]+/).some(tok=>tok.startsWith(qq))) starts.push(x);
        else if(lab.includes(qq)) contains.push(x);
      }
      return [...starts, ...contains].slice(0, 20);
    }

    input.addEventListener('input', ()=>{ render(search(input.value)); });
    input.addEventListener('focus', ()=>{ if(input.value.trim().length>=2) render(search(input.value)); else render(locations.slice(0,12)); });
    input.addEventListener('keydown', (e)=>{
      const items = Array.from(list.querySelectorAll('.ac-item'));
      if(!items.length) return;
      if(e.key==='ArrowDown'){ activeIndex=Math.min(items.length-1, activeIndex+1); e.preventDefault(); }
      else if(e.key==='ArrowUp'){ activeIndex=Math.max(0, activeIndex-1); e.preventDefault(); }
      else if(e.key==='Enter' && activeIndex>=0){ e.preventDefault(); items[activeIndex].dispatchEvent(new Event('click')); }
      items.forEach((el,i)=>el.classList.toggle('active', i===activeIndex));
    });
    input.addEventListener('blur', ()=> setTimeout(close, 160));
  }

  attachAutocomplete('region','region-list');
})();