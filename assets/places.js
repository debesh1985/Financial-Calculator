
(function(){
  const locations = [
    // CANADA - Major Cities (Tier 1)
    {label:'Toronto, ON', code:'ON'},{label:'Montreal, QC', code:'QC'},{label:'Vancouver, BC', code:'BC'},
    {label:'Calgary, AB', code:'AB'},{label:'Edmonton, AB', code:'AB'},{label:'Ottawa, ON', code:'ON'},
    {label:'Mississauga, ON', code:'ON'},{label:'Winnipeg, MB', code:'MB'},{label:'Quebec City, QC', code:'QC'},
    {label:'Hamilton, ON', code:'ON'},{label:'Brampton, ON', code:'ON'},{label:'Surrey, BC', code:'BC'},
    
    // CANADA - Tier 2 Cities
    {label:'Laval, QC', code:'QC'},{label:'Halifax, NS', code:'NS'},{label:'London, ON', code:'ON'},
    {label:'Markham, ON', code:'ON'},{label:'Vaughan, ON', code:'ON'},{label:'Gatineau, QC', code:'QC'},
    {label:'Saskatoon, SK', code:'SK'},{label:'Longueuil, QC', code:'QC'},{label:'Burnaby, BC', code:'BC'},
    {label:'Regina, SK', code:'SK'},{label:'Richmond, BC', code:'BC'},{label:'Richmond Hill, ON', code:'ON'},
    {label:'Oakville, ON', code:'ON'},{label:'Burlington, ON', code:'ON'},{label:'Greater Sudbury, ON', code:'ON'},
    {label:'Sherbrooke, QC', code:'QC'},{label:'Oshawa, ON', code:'ON'},{label:'Saguenay, QC', code:'QC'},
    {label:'Lévis, QC', code:'QC'},{label:'Barrie, ON', code:'ON'},{label:'Abbotsford, BC', code:'BC'},
    {label:'St. Catharines, ON', code:'ON'},{label:'Trois-Rivières, QC', code:'QC'},{label:'Cambridge, ON', code:'ON'},
    {label:'Coquitlam, BC', code:'BC'},{label:'Kingston, ON', code:'ON'},{label:'Whitby, ON', code:'ON'},
    {label:'Guelph, ON', code:'ON'},{label:'Kelowna, BC', code:'BC'},{label:'Saanich, BC', code:'BC'},
    {label:'Ajax, ON', code:'ON'},{label:'Thunder Bay, ON', code:'ON'},{label:'Terrebonne, QC', code:'QC'},
    {label:'St. John\'s, NL', code:'NL'},{label:'Waterloo, ON', code:'ON'},{label:'Delta, BC', code:'BC'},
    {label:'Chatham-Kent, ON', code:'ON'},{label:'Red Deer, AB', code:'AB'},{label:'Kamloops, BC', code:'BC'},
    {label:'Brantford, ON', code:'ON'},{label:'Cape Breton, NS', code:'NS'},{label:'Lethbridge, AB', code:'AB'},
    {label:'Saint-Jean-sur-Richelieu, QC', code:'QC'},{label:'Clarington, ON', code:'ON'},{label:'Pickering, ON', code:'ON'},
    {label:'Nanaimo, BC', code:'BC'},{label:'Sudbury, ON', code:'ON'},{label:'North Vancouver, BC', code:'BC'},
    {label:'Brossard, QC', code:'QC'},{label:'Repentigny, QC', code:'QC'},{label:'Newmarket, ON', code:'ON'},
    {label:'Chilliwack, BC', code:'BC'},{label:'White Rock, BC', code:'BC'},{label:'Maple Ridge, BC', code:'BC'},
    {label:'Peterborough, ON', code:'ON'},{label:'Kawartha Lakes, ON', code:'ON'},{label:'Prince George, BC', code:'BC'},
    {label:'Moncton, NB', code:'NB'},{label:'Granby, QC', code:'QC'},{label:'Saint-Hyacinthe, QC', code:'QC'},
    {label:'Fredericton, NB', code:'NB'},{label:'Sarnia, ON', code:'ON'},{label:'Wood Buffalo, AB', code:'AB'},
    {label:'New Westminster, BC', code:'BC'},{label:'Saint John, NB', code:'NB'},{label:'Caledon, ON', code:'ON'},
    {label:'Charlottetown, PE', code:'PE'},{label:'Rimouski, QC', code:'QC'},{label:'Drummondville, QC', code:'QC'},
    {label:'Saint-Jérôme, QC', code:'QC'},{label:'Fort McMurray, AB', code:'AB'},{label:'Brandon, MB', code:'MB'},
    {label:'Victoria, BC', code:'BC'},{label:'Whitehorse, YT', code:'YT'},{label:'Yellowknife, NT', code:'NT'},
    {label:'Iqaluit, NU', code:'NU'},

    // CANADA - All Provinces and Territories
    {label:'Ontario (ON)', code:'ON'},{label:'Quebec (QC)', code:'QC'},{label:'British Columbia (BC)', code:'BC'},
    {label:'Alberta (AB)', code:'AB'},{label:'Manitoba (MB)', code:'MB'},{label:'Saskatchewan (SK)', code:'SK'},
    {label:'Nova Scotia (NS)', code:'NS'},{label:'New Brunswick (NB)', code:'NB'},
    {label:'Prince Edward Island (PE)', code:'PE'},{label:'Newfoundland and Labrador (NL)', code:'NL'},
    {label:'Yukon (YT)', code:'YT'},{label:'Northwest Territories (NT)', code:'NT'},{label:'Nunavut (NU)', code:'NU'},

    // USA - Major Cities (Tier 1)
    {label:'New York, NY', code:'NY'},{label:'Los Angeles, CA', code:'CA'},{label:'Chicago, IL', code:'IL'},
    {label:'Houston, TX', code:'TX'},{label:'Phoenix, AZ', code:'AZ'},{label:'Philadelphia, PA', code:'PA'},
    {label:'San Antonio, TX', code:'TX'},{label:'San Diego, CA', code:'CA'},{label:'Dallas, TX', code:'TX'},
    {label:'San Jose, CA', code:'CA'},{label:'Austin, TX', code:'TX'},{label:'Jacksonville, FL', code:'FL'},
    {label:'Fort Worth, TX', code:'TX'},{label:'Columbus, OH', code:'OH'},{label:'Charlotte, NC', code:'NC'},
    {label:'San Francisco, CA', code:'CA'},{label:'Indianapolis, IN', code:'IN'},{label:'Seattle, WA', code:'WA'},
    {label:'Denver, CO', code:'CO'},{label:'Washington, DC', code:'DC'},{label:'Boston, MA', code:'MA'},

    // USA - Tier 2 Cities
    {label:'Nashville, TN', code:'TN'},{label:'El Paso, TX', code:'TX'},{label:'Detroit, MI', code:'MI'},
    {label:'Oklahoma City, OK', code:'OK'},{label:'Portland, OR', code:'OR'},{label:'Las Vegas, NV', code:'NV'},
    {label:'Memphis, TN', code:'TN'},{label:'Louisville, KY', code:'KY'},{label:'Baltimore, MD', code:'MD'},
    {label:'Milwaukee, WI', code:'WI'},{label:'Albuquerque, NM', code:'NM'},{label:'Tucson, AZ', code:'AZ'},
    {label:'Fresno, CA', code:'CA'},{label:'Mesa, AZ', code:'AZ'},{label:'Sacramento, CA', code:'CA'},
    {label:'Atlanta, GA', code:'GA'},{label:'Kansas City, MO', code:'MO'},{label:'Colorado Springs, CO', code:'CO'},
    {label:'Miami, FL', code:'FL'},{label:'Raleigh, NC', code:'NC'},{label:'Omaha, NE', code:'NE'},
    {label:'Long Beach, CA', code:'CA'},{label:'Virginia Beach, VA', code:'VA'},{label:'Oakland, CA', code:'CA'},
    {label:'Minneapolis, MN', code:'MN'},{label:'Tulsa, OK', code:'OK'},{label:'Arlington, TX', code:'TX'},
    {label:'Tampa, FL', code:'FL'},{label:'New Orleans, LA', code:'LA'},{label:'Wichita, KS', code:'KS'},
    {label:'Cleveland, OH', code:'OH'},{label:'Bakersfield, CA', code:'CA'},{label:'Aurora, CO', code:'CO'},
    {label:'Anaheim, CA', code:'CA'},{label:'Honolulu, HI', code:'HI'},{label:'Santa Ana, CA', code:'CA'},
    {label:'Riverside, CA', code:'CA'},{label:'Corpus Christi, TX', code:'TX'},{label:'Lexington, KY', code:'KY'},
    {label:'Stockton, CA', code:'CA'},{label:'Henderson, NV', code:'NV'},{label:'Saint Paul, MN', code:'MN'},
    {label:'St. Louis, MO', code:'MO'},{label:'Cincinnati, OH', code:'OH'},{label:'Pittsburgh, PA', code:'PA'},
    {label:'Greensboro, NC', code:'NC'},{label:'Anchorage, AK', code:'AK'},{label:'Plano, TX', code:'TX'},
    {label:'Lincoln, NE', code:'NE'},{label:'Orlando, FL', code:'FL'},{label:'Irvine, CA', code:'CA'},
    {label:'Newark, NJ', code:'NJ'},{label:'Durham, NC', code:'NC'},{label:'Chula Vista, CA', code:'CA'},
    {label:'Toledo, OH', code:'OH'},{label:'Fort Wayne, IN', code:'IN'},{label:'St. Petersburg, FL', code:'FL'},
    {label:'Laredo, TX', code:'TX'},{label:'Jersey City, NJ', code:'NJ'},{label:'Chandler, AZ', code:'AZ'},
    {label:'Madison, WI', code:'WI'},{label:'Lubbock, TX', code:'TX'},{label:'Scottsdale, AZ', code:'AZ'},
    {label:'Reno, NV', code:'NV'},{label:'Buffalo, NY', code:'NY'},{label:'Gilbert, AZ', code:'AZ'},
    {label:'Glendale, AZ', code:'AZ'},{label:'North Las Vegas, NV', code:'NV'},{label:'Winston-Salem, NC', code:'NC'},
    {label:'Chesapeake, VA', code:'VA'},{label:'Norfolk, VA', code:'VA'},{label:'Fremont, CA', code:'CA'},
    {label:'Garland, TX', code:'TX'},{label:'Irving, TX', code:'TX'},{label:'Hialeah, FL', code:'FL'},
    {label:'Richmond, VA', code:'VA'},{label:'Boise, ID', code:'ID'},{label:'Spokane, WA', code:'WA'},
    {label:'San Bernardino, CA', code:'CA'},{label:'Baton Rouge, LA', code:'LA'},{label:'Tacoma, WA', code:'WA'},
    {label:'Mobile, AL', code:'AL'},{label:'Des Moines, IA', code:'IA'},{label:'Modesto, CA', code:'CA'},
    {label:'Fayetteville, NC', code:'NC'},{label:'Rochester, NY', code:'NY'},{label:'Oxnard, CA', code:'CA'},
    {label:'Fontana, CA', code:'CA'},{label:'Columbus, GA', code:'GA'},{label:'Montgomery, AL', code:'AL'},
    {label:'Moreno Valley, CA', code:'CA'},{label:'Shreveport, LA', code:'LA'},{label:'Aurora, IL', code:'IL'},
    {label:'Yonkers, NY', code:'NY'},{label:'Akron, OH', code:'OH'},{label:'Huntington Beach, CA', code:'CA'},
    {label:'Little Rock, AR', code:'AR'},{label:'Augusta, GA', code:'GA'},{label:'Amarillo, TX', code:'TX'},
    {label:'Glendale, CA', code:'CA'},{label:'Grand Rapids, MI', code:'MI'},{label:'Salt Lake City, UT', code:'UT'},
    {label:'Tallahassee, FL', code:'FL'},{label:'Huntsville, AL', code:'AL'},{label:'Grand Prairie, TX', code:'TX'},
    {label:'Overland Park, KS', code:'KS'},{label:'Knoxville, TN', code:'TN'},{label:'Worcester, MA', code:'MA'},
    {label:'Newport News, VA', code:'VA'},{label:'Brownsville, TX', code:'TX'},{label:'Santa Clarita, CA', code:'CA'},
    {label:'Providence, RI', code:'RI'},{label:'Fort Lauderdale, FL', code:'FL'},{label:'Chattanooga, TN', code:'TN'},
    {label:'Tempe, AZ', code:'AZ'},{label:'Oceanside, CA', code:'CA'},{label:'Garden Grove, CA', code:'CA'},
    {label:'Rancho Cucamonga, CA', code:'CA'},{label:'Cape Coral, FL', code:'FL'},{label:'Santa Rosa, CA', code:'CA'},
    {label:'Vancouver, WA', code:'WA'},{label:'Sioux Falls, SD', code:'SD'},{label:'Ontario, CA', code:'CA'},
    {label:'McKinney, TX', code:'TX'},{label:'Elk Grove, CA', code:'CA'},{label:'Jackson, MS', code:'MS'},
    {label:'Pembroke Pines, FL', code:'FL'},{label:'Salem, OR', code:'OR'},{label:'Springfield, MO', code:'MO'},
    {label:'Eugene, OR', code:'OR'},{label:'Fort Collins, CO', code:'CO'},{label:'Corona, CA', code:'CA'},
    {label:'Fargo, ND', code:'ND'},{label:'Alexandria, VA', code:'VA'},{label:'Cary, NC', code:'NC'},
    {label:'Surprise, AZ', code:'AZ'},{label:'Hayward, CA', code:'CA'},{label:'Murfreesboro, TN', code:'TN'},
    {label:'Lakewood, CO', code:'CO'},{label:'Hampton, VA', code:'VA'},{label:'Columbia, SC', code:'SC'},
    {label:'Salinas, CA', code:'CA'},{label:'Sterling Heights, MI', code:'MI'},{label:'Concord, CA', code:'CA'},
    {label:'Hartford, CT', code:'CT'},{label:'Kent, WA', code:'WA'},{label:'Lafayette, LA', code:'LA'},
    {label:'Midland, TX', code:'TX'},{label:'Thousand Oaks, CA', code:'CA'},{label:'Roseville, CA', code:'CA'},
    {label:'Thornton, CO', code:'CO'},{label:'Allentown, PA', code:'PA'},{label:'Waco, TX', code:'TX'},
    {label:'Charleston, SC', code:'SC'},{label:'Visalia, CA', code:'CA'},{label:'Dayton, OH', code:'OH'},
    
    // USA - All States
    {label:'Alabama (AL)', code:'AL'},{label:'Alaska (AK)', code:'AK'},{label:'Arizona (AZ)', code:'AZ'},
    {label:'Arkansas (AR)', code:'AR'},{label:'California (CA)', code:'CA'},{label:'Colorado (CO)', code:'CO'},
    {label:'Connecticut (CT)', code:'CT'},{label:'Delaware (DE)', code:'DE'},{label:'Florida (FL)', code:'FL'},
    {label:'Georgia (GA)', code:'GA'},{label:'Hawaii (HI)', code:'HI'},{label:'Idaho (ID)', code:'ID'},
    {label:'Illinois (IL)', code:'IL'},{label:'Indiana (IN)', code:'IN'},{label:'Iowa (IA)', code:'IA'},
    {label:'Kansas (KS)', code:'KS'},{label:'Kentucky (KY)', code:'KY'},{label:'Louisiana (LA)', code:'LA'},
    {label:'Maine (ME)', code:'ME'},{label:'Maryland (MD)', code:'MD'},{label:'Massachusetts (MA)', code:'MA'},
    {label:'Michigan (MI)', code:'MI'},{label:'Minnesota (MN)', code:'MN'},{label:'Mississippi (MS)', code:'MS'},
    {label:'Missouri (MO)', code:'MO'},{label:'Montana (MT)', code:'MT'},{label:'Nebraska (NE)', code:'NE'},
    {label:'Nevada (NV)', code:'NV'},{label:'New Hampshire (NH)', code:'NH'},{label:'New Jersey (NJ)', code:'NJ'},
    {label:'New Mexico (NM)', code:'NM'},{label:'New York (NY)', code:'NY'},{label:'North Carolina (NC)', code:'NC'},
    {label:'North Dakota (ND)', code:'ND'},{label:'Ohio (OH)', code:'OH'},{label:'Oklahoma (OK)', code:'OK'},
    {label:'Oregon (OR)', code:'OR'},{label:'Pennsylvania (PA)', code:'PA'},{label:'Rhode Island (RI)', code:'RI'},
    {label:'South Carolina (SC)', code:'SC'},{label:'South Dakota (SD)', code:'SD'},{label:'Tennessee (TN)', code:'TN'},
    {label:'Texas (TX)', code:'TX'},{label:'Utah (UT)', code:'UT'},{label:'Vermont (VT)', code:'VT'},
    {label:'Virginia (VA)', code:'VA'},{label:'Washington (WA)', code:'WA'},{label:'West Virginia (WV)', code:'WV'},
    {label:'Wisconsin (WI)', code:'WI'},{label:'Wyoming (WY)', code:'WY'},{label:'Washington D.C. (DC)', code:'DC'}
  ];

  function attachAutocomplete(inputId, listId, onPick){
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if(!input || !list) return;

    let activeIndex = -1;
    let currentItems = [];

    function close(){ 
      list.style.display='none'; 
      list.innerHTML=''; 
      activeIndex=-1; 
      currentItems = [];
    }
    
    function render(items){
      currentItems = items;
      list.innerHTML='';
      items.forEach((it, idx)=>{
        const div = document.createElement('div');
        div.className = 'ac-item';
        div.textContent = it.label;
        
        const choose = (e)=>{ 
          e.preventDefault(); 
          input.value = it.label; 
          close(); 
          if(onPick) onPick(it);
          
          // Auto-detect country based on location format
          const isUS = /,\s[A-Z]{2}$/.test(it.label) && !/\([A-Z]{2}\)/.test(it.label);
          const isCanada = /,\s[A-Z]{2}$/.test(it.label) && /\([A-Z]{2}\)/.test(it.label) || 
                          ['ON','QC','BC','AB','MB','SK','NS','NB','PE','NL','YT','NT','NU'].some(prov => it.label.includes(prov));
          
          if(isUS && document.querySelector('#countryToggle [data-country="usa"]')){
            document.querySelector('#countryToggle [data-country="usa"]').click();
          } else if(isCanada && document.querySelector('#countryToggle [data-country="canada"]')){
            document.querySelector('#countryToggle [data-country="canada"]').click();
          }
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
      if(qq.length < 1) return [];
      
      const starts = [], contains = [];
      for(const x of locations){
        const lab = x.label.toLowerCase();
        if(lab.startsWith(qq) || lab.split(/[,\s()]+/).some(tok=>tok.startsWith(qq))) {
          starts.push(x);
        } else if(lab.includes(qq)) {
          contains.push(x);
        }
      }
      return [...starts, ...contains].slice(0, 20);
    }

    input.addEventListener('input', ()=>{ 
      const searchResults = search(input.value);
      render(searchResults);
    });
    
    input.addEventListener('focus', ()=>{ 
      if(input.value.trim().length >= 1) {
        render(search(input.value)); 
      } else {
        render(locations.slice(0,12)); 
      }
    });
    
    input.addEventListener('keydown', (e)=>{
      const items = Array.from(list.querySelectorAll('.ac-item'));
      if(!items.length) return;
      
      if(e.key==='ArrowDown'){ 
        activeIndex = Math.min(items.length-1, activeIndex+1); 
        e.preventDefault(); 
      } else if(e.key==='ArrowUp'){ 
        activeIndex = Math.max(0, activeIndex-1); 
        e.preventDefault(); 
      } else if(e.key==='Enter' && activeIndex>=0){ 
        e.preventDefault(); 
        items[activeIndex].dispatchEvent(new Event('click')); 
      } else if(e.key==='Escape'){
        close();
      }
      
      items.forEach((el,i) => el.classList.toggle('active', i===activeIndex));
    });
    
    input.addEventListener('blur', ()=> setTimeout(close, 200));
  }

  // Initialize autocomplete when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    attachAutocomplete('region','region-list');
    
    // Also handle GST page if it exists
    if(document.getElementById('gsRegion')) {
      attachAutocomplete('gsRegion','gsRegion-list');
    }
  });
})();
