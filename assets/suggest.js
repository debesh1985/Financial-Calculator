// Dynamic JavaScript suggestions for city and province/state.
(function(){
  const data = [
    // Canada (cities)
    'Toronto, ON', 'Ottawa, ON', 'Mississauga, ON', 'Vancouver, BC', 'Victoria, BC', 'Kelowna, BC',
    'Montreal, QC', 'Quebec City, QC', 'Laval, QC', 'Calgary, AB', 'Edmonton, AB', 'Winnipeg, MB',
    'Saskatoon, SK', 'Regina, SK', 'Halifax, NS', 'St. John\'s, NL', 'Charlottetown, PE',
    // Provinces/Territories
    'Ontario (ON)', 'Quebec (QC)', 'British Columbia (BC)', 'Alberta (AB)', 'Manitoba (MB)',
    'Saskatchewan (SK)', 'Nova Scotia (NS)', 'New Brunswick (NB)', 'Prince Edward Island (PE)',
    'Newfoundland and Labrador (NL)', 'Yukon (YT)', 'Northwest Territories (NT)', 'Nunavut (NU)',
    // USA (cities)
    'San Francisco, CA', 'Sun Francisco, CA', 'Los Angeles, CA', 'San Diego, CA', 'San Jose, CA',
    'New York, NY', 'Chicago, IL', 'Houston, TX', 'Austin, TX', 'Dallas, TX', 'Phoenix, AZ',
    'Miami, FL', 'Orlando, FL', 'Seattle, WA', 'Boston, MA', 'Washington, DC', 'Atlanta, GA',
    'Denver, CO', 'Las Vegas, NV', 'Philadelphia, PA', 'Portland, OR'
  ];

  function attachSuggest(inputId, listId){
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if(!input || !list) return;

    let activeIndex = -1;
    let current = [];

    function close(){ list.style.display='none'; list.innerHTML=''; activeIndex=-1; }
    function render(items){
      current = items;
      list.innerHTML = '';
      items.forEach((label, idx)=>{
        const div = document.createElement('div');
        div.className = 'ac-item';
        div.textContent = label;

        const choose = (e)=>{
          e.preventDefault();
          input.value = label;
          close();
          // If label hints at province/state, tweak country defaults
          const isUS = /,\\s[A-Z]{2}$/.test(label) && !/\\(\\w\\w\\)/.test(label) && /,(\\s)?(AL|AK|AZ|AR|CA|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV)$/.test(label);
          if(isUS){ document.querySelector('#countryToggle [data-country=\"usa\"]').click(); }
        };
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
      if(!qq) return [];
      const starts = [], contains = [];
      for(const label of data){
        const lab = label.toLowerCase();
        if(lab.startsWith(qq) || lab.split(/[\\s,\\(\\)]+/).some(tok=> tok.startsWith(qq))) starts.push(label);
        else if(lab.includes(qq)) contains.push(label);
      }
      return [...starts, ...contains].slice(0, 15);
    }

    function showInitial(){
      render(data.slice(0, 12));
    }

    input.addEventListener('input', ()=>{
      const q = input.value;
      if(q.length >= 2) render(search(q));
      else close();
    });

    input.addEventListener('focus', ()=>{
      if(input.value.length >= 2) render(search(input.value));
      else showInitial();
    });

    input.addEventListener('keydown', (e)=>{
      const items = Array.from(list.querySelectorAll('.ac-item'));
      if(!items.length) return;
      if(e.key==='ArrowDown'){ activeIndex = Math.min(items.length-1, activeIndex+1); e.preventDefault(); }
      else if(e.key==='ArrowUp'){ activeIndex = Math.max(0, activeIndex-1); e.preventDefault(); }
      else if(e.key==='Enter' && activeIndex>=0){ e.preventDefault(); items[activeIndex].dispatchEvent(new Event('click')); }
      else if(e.key==='Escape'){ close(); }
      items.forEach((it,i)=> it.classList.toggle('active', i===activeIndex));
    });

    input.addEventListener('blur', ()=> setTimeout(close, 200));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    attachSuggest('region','region-list');
  });
})();