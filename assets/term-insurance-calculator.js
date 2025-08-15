// Term Insurance Premium Calculator Logic with US/Canada toggle

const REGION_DATA = {
  usa: {
    locale: 'en-US',
    currency: 'USD',
    baseRates: {
      male: { 18: 0.45, 20: 0.48, 25: 0.52, 30: 0.68, 35: 0.88, 40: 1.25, 45: 1.85, 50: 2.95, 55: 4.85, 60: 7.95, 65: 13.25, 70: 22.50, 75: 38.95 },
      female: { 18: 0.38, 20: 0.41, 25: 0.44, 30: 0.56, 35: 0.72, 40: 1.02, 45: 1.48, 50: 2.28, 55: 3.68, 60: 5.95, 65: 9.85, 70: 16.75, 75: 28.95 }
    },
    healthMultipliers: { excellent: 1.0, good: 1.25, average: 1.65, poor: 2.85 },
    smokingMultipliers: { never: 1.0, former: 1.45, recent: 2.15, current: 3.25 },
    occupationMultipliers: { low: 1.0, medium: 1.25, high: 1.75, extreme: 2.45 }
  },
  canada: {
    locale: 'en-CA',
    currency: 'CAD',
    baseRates: {
      male: { 18: 0.38, 20: 0.41, 25: 0.44, 30: 0.58, 35: 0.75, 40: 1.06, 45: 1.57, 50: 2.51, 55: 4.12, 60: 6.76, 65: 11.26, 70: 19.13, 75: 33.11 },
      female: { 18: 0.32, 20: 0.35, 25: 0.37, 30: 0.48, 35: 0.61, 40: 0.87, 45: 1.26, 50: 1.94, 55: 3.13, 60: 5.06, 65: 8.37, 70: 14.24, 75: 24.61 }
    },
    healthMultipliers: { excellent: 1.0, good: 1.22, average: 1.58, poor: 2.68 },
    smokingMultipliers: { never: 1.0, former: 1.38, recent: 2.05, current: 3.05 },
    occupationMultipliers: { low: 1.0, medium: 1.22, high: 1.68, extreme: 2.28 }
  }
};

const TERM_MULTIPLIERS = { 10: 0.85, 15: 0.92, 20: 1.0, 25: 1.08, 30: 1.15 };
const VARIATION_PERCENT = 0.15; // range +/-15%

class TermInsuranceCalculator {
  constructor() {
    this.region = 'usa';
    this.initializeEventListeners();
    this.handleCustomCoverage();
    this.setupRegionToggle();
    this.updateCurrencyLabels();
  }

  initializeEventListeners() {
    const calculateBtn = document.getElementById('calculateBtn');
    const coverageSelect = document.getElementById('coverage');
    const ageSlider = document.getElementById('age');
    const ageDisplay = document.getElementById('ageValue');

    calculateBtn.addEventListener('click', () => this.calculatePremium());
    coverageSelect.addEventListener('change', () => this.handleCustomCoverage());

    if (ageSlider && ageDisplay) {
      ageSlider.addEventListener('input', () => {
        ageDisplay.textContent = ageSlider.value;
      });
    }
  }

  setupRegionToggle() {
    const toggle = document.getElementById('regionToggle');
    if (toggle) {
      toggle.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.region = btn.dataset.region;
          this.updateCurrencyLabels();
        });
      });
    }
  }

  updateCurrencyLabels() {
    const prefix = this.region === 'canada' ? 'CA$' : '$';
    const coverageSelect = document.getElementById('coverage');
    if (coverageSelect) {
      [...coverageSelect.options].forEach(opt => {
        if (opt.value !== 'custom') {
          const val = parseInt(opt.value, 10).toLocaleString();
          opt.textContent = `${prefix}${val}`;
        } else {
          opt.textContent = 'Custom Amount';
        }
      });
    }
    const customLabel = document.querySelector('label[for="customCoverage"]');
    if (customLabel) {
      customLabel.textContent = `Custom Coverage Amount (${prefix})`;
    }
  }

  handleCustomCoverage() {
    const coverageSelect = document.getElementById('coverage');
    const customGroup = document.getElementById('customCoverageGroup');

    if (coverageSelect.value === 'custom') {
      customGroup.style.display = 'block';
    } else {
      customGroup.style.display = 'none';
    }
  }

  getInputValues() {
    const ageInput = document.getElementById('age');
    const ageValue = ageInput ? ageInput.value.toString().trim() : '';
    const age = ageValue ? parseInt(ageValue, 10) : NaN;

    const genderInput = document.getElementById('gender');
    const gender = genderInput ? genderInput.value : 'male';

    const coverageSelect = document.getElementById('coverage');
    const coverageValue = coverageSelect ? coverageSelect.value : '250000';

    let coverage;
    if (coverageValue === 'custom') {
      const customInput = document.getElementById('customCoverage');
      const customValue = customInput ? customInput.value.toString().trim() : '';
      coverage = customValue ? parseInt(customValue, 10) : NaN;
    } else {
      coverage = parseInt(coverageValue, 10);
    }

    const termInput = document.getElementById('term');
    const termValue = termInput ? termInput.value.toString().trim() : '';
    const term = termValue ? parseInt(termValue, 10) : NaN;

    const healthInput = document.getElementById('health');
    const health = healthInput ? healthInput.value : 'excellent';

    const smokingInput = document.getElementById('smoking');
    const smoking = smokingInput ? smokingInput.value : 'never';

    const occupationInput = document.getElementById('occupation');
    const occupation = occupationInput ? occupationInput.value : 'low';

    const country = this.region;

    return { age, gender, coverage, term, health, smoking, occupation, country };
  }

  getBaseRateForAge(age, gender, baseRates) {
    const rates = baseRates[gender] || baseRates.male;
    const ageKeys = Object.keys(rates).map(Number).sort((a, b) => a - b);

    let closestAge = ageKeys[0];
    for (let ageKey of ageKeys) {
      if (age >= ageKey) {
        closestAge = ageKey;
      } else {
        break;
      }
    }

    return rates[closestAge] || rates[ageKeys[ageKeys.length - 1]];
  }

  calculatePremium() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.style.display = 'none';
    }

    const { age, gender, coverage, term, health, smoking, occupation, country } = this.getInputValues();

    if (isNaN(age)) {
      this.showError('Please enter a valid age');
      return;
    }
    if (age < 18 || age > 70) {
      this.showError(`Age must be between 18 and 70 years for insurance coverage (you entered: ${age})`);
      return;
    }

    if (isNaN(coverage)) {
      this.showError('Please enter a valid coverage amount');
      return;
    }
    if (coverage < 50000 || coverage > 10000000) {
      this.showError('Coverage amount must be between $50,000 and $10,000,000');
      return;
    }

    if (isNaN(term)) {
      this.showError('Please select a valid policy term');
      return;
    }
    if (term < 10 || term > 30) {
      this.showError('Policy term must be between 10 and 30 years');
      return;
    }

    const region = REGION_DATA[country];
    const baseRate = this.getBaseRateForAge(age, gender, region.baseRates);
    const basePremiumAnnual = (coverage / 1000) * baseRate;

    const healthMultiplier = region.healthMultipliers[health] || 1.0;
    const smokingMultiplier = region.smokingMultipliers[smoking] || 1.0;
    const occupationMultiplier = region.occupationMultipliers[occupation] || 1.0;
    const termMultiplier = TERM_MULTIPLIERS[term] || 1.0;

    const totalMultiplier = healthMultiplier * smokingMultiplier * occupationMultiplier * termMultiplier;
    const finalAnnualPremium = basePremiumAnnual * totalMultiplier;
    const finalMonthlyPremium = finalAnnualPremium / 12;

    const annualLow = finalAnnualPremium * (1 - VARIATION_PERCENT);
    const annualHigh = finalAnnualPremium * (1 + VARIATION_PERCENT);
    const monthlyLow = annualLow / 12;
    const monthlyHigh = annualHigh / 12;
    const totalLow = annualLow * term;
    const totalHigh = annualHigh * term;

    const healthAdjustment = basePremiumAnnual * (healthMultiplier - 1) / 12;
    const smokingAdjustment = basePremiumAnnual * healthMultiplier * (smokingMultiplier - 1) / 12;
    const occupationAdjustment = basePremiumAnnual * healthMultiplier * smokingMultiplier * (occupationMultiplier - 1) / 12;

    this.displayResults({
      region: country,
      monthlyLow,
      monthlyHigh,
      annualLow,
      annualHigh,
      totalLow,
      totalHigh,
      coverageRatio: coverage / finalMonthlyPremium,
      basePremium: basePremiumAnnual / 12,
      healthAdjustment,
      smokingAdjustment,
      occupationAdjustment,
      finalLow: monthlyLow,
      finalHigh: monthlyHigh
    });
  }

  displayResults(results) {
    const region = REGION_DATA[results.region];
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    const fmt = amount => new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: region.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount));

    const fmtDecimal = amount => new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: region.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    document.getElementById('monthlyPremium').textContent = `${fmtDecimal(results.monthlyLow)} - ${fmtDecimal(results.monthlyHigh)}`;
    document.getElementById('annualPremium').textContent = `${fmt(results.annualLow)} - ${fmt(results.annualHigh)}`;
    document.getElementById('totalPremium').textContent = `${fmt(results.totalLow)} - ${fmt(results.totalHigh)}`;
    document.getElementById('coverageRatio').textContent = fmt(results.coverageRatio);

    document.getElementById('basePremium').textContent = fmtDecimal(results.basePremium);
    document.getElementById('healthAdjustment').textContent = results.healthAdjustment >= 0 ? `+${fmtDecimal(results.healthAdjustment)}` : fmtDecimal(results.healthAdjustment);
    document.getElementById('smokingAdjustment').textContent = results.smokingAdjustment >= 0 ? `+${fmtDecimal(results.smokingAdjustment)}` : fmtDecimal(results.smokingAdjustment);
    document.getElementById('occupationAdjustment').textContent = results.occupationAdjustment >= 0 ? `+${fmtDecimal(results.occupationAdjustment)}` : fmtDecimal(results.occupationAdjustment);
    document.getElementById('finalPremium').textContent = `${fmtDecimal(results.finalLow)} - ${fmtDecimal(results.finalHigh)}`;

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showError(message) {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.style.display = 'block';
      resultsSection.innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; color: #dc2626;">
          <h3>⚠️ Input Error</h3>
          <p>${message}</p>
        </div>
      `;
    } else {
      console.error('Results section not found:', message);
      alert(`Error: ${message}`);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TermInsuranceCalculator();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TermInsuranceCalculator;
}

