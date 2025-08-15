// Geotagging script to set default country toggles based on user location
// Uses IP-based geolocation to determine country.
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      const code = (data && data.country || '').toUpperCase();
      const useCanada = code === 'CA';
      // Mortgage calculator (index.html)
      const cad = document.getElementById('countryCADMain');
      const usd = document.getElementById('countryUSDMain');
      if (cad && usd) {
        const target = useCanada ? cad : usd;
        target.checked = true;
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // Universal life calculator
      const countryToggle = document.getElementById('countryToggle');
      if (countryToggle) {
        const btn = useCanada
          ? countryToggle.querySelector('[data-country="canada"]')
          : countryToggle.querySelector('[data-country="usa"]');
        if (btn) btn.click();
      }
      // Term insurance calculator
      const regionToggle = document.getElementById('regionToggle');
      if (regionToggle) {
        const btn = useCanada
          ? regionToggle.querySelector('[data-region="canada"]')
          : regionToggle.querySelector('[data-region="usa"]');
        if (btn) btn.click();
      }
    })
    .catch(() => {
      // On failure, default to USA on mortgage calculator
      const cad = document.getElementById('countryCADMain');
      const usd = document.getElementById('countryUSDMain');
      if (cad && usd) {
        usd.checked = true;
        usd.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
});
