
// Term Insurance Premium Calculator Logic

// Base premium rates per $1000 of coverage per year by age and gender
const BASE_RATES = {
  male: {
    18: 0.15, 20: 0.16, 25: 0.18, 30: 0.22, 35: 0.28, 40: 0.38, 45: 0.55, 
    50: 0.85, 55: 1.35, 60: 2.15, 65: 3.45, 70: 5.85, 75: 9.85
  },
  female: {
    18: 0.12, 20: 0.13, 25: 0.14, 30: 0.17, 35: 0.22, 40: 0.30, 45: 0.42, 
    50: 0.65, 55: 1.05, 60: 1.65, 65: 2.75, 70: 4.65, 75: 7.85
  }
};

// Risk multipliers
const HEALTH_MULTIPLIERS = {
  excellent: 1.0,
  good: 1.2,
  average: 1.5,
  poor: 2.2
};

const SMOKING_MULTIPLIERS = {
  never: 1.0,
  former: 1.3,
  recent: 1.8,
  current: 2.5
};

const OCCUPATION_MULTIPLIERS = {
  low: 1.0,
  medium: 1.15,
  high: 1.4,
  extreme: 1.8
};

const COUNTRY_MULTIPLIERS = {
  usa: 1.0,
  canada: 0.85,
  uk: 0.90,
  australia: 0.88,
  germany: 0.82,
  france: 0.86,
  other: 1.1
};

// Term length multipliers (longer terms cost more due to level premiums)
const TERM_MULTIPLIERS = {
  10: 0.85,
  15: 0.92,
  20: 1.0,
  25: 1.08,
  30: 1.15
};

class TermInsuranceCalculator {
  constructor() {
    this.initializeEventListeners();
    this.handleCustomCoverage();
  }

  initializeEventListeners() {
    const calculateBtn = document.getElementById('calculateBtn');
    const coverageSelect = document.getElementById('coverage');
    
    calculateBtn.addEventListener('click', () => this.calculatePremium());
    coverageSelect.addEventListener('change', () => this.handleCustomCoverage());
    
    // Real-time calculation on input change
    const inputs = ['age', 'gender', 'coverage', 'customCoverage', 'term', 'health', 'smoking', 'occupation', 'country'];
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.calculatePremium());
        element.addEventListener('change', () => this.calculatePremium());
      }
    });
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
    const age = ageInput ? parseInt(ageInput.value) : NaN;
    
    const genderInput = document.getElementById('gender');
    const gender = genderInput ? genderInput.value : 'male';
    
    const coverageSelect = document.getElementById('coverage');
    const coverageValue = coverageSelect ? coverageSelect.value : '250000';
    
    let coverage;
    if (coverageValue === 'custom') {
      const customInput = document.getElementById('customCoverage');
      coverage = customInput ? parseInt(customInput.value) : NaN;
    } else {
      coverage = parseInt(coverageValue);
    }
    
    const termInput = document.getElementById('term');
    const term = termInput ? parseInt(termInput.value) : NaN;
    
    const healthInput = document.getElementById('health');
    const health = healthInput ? healthInput.value : 'excellent';
    
    const smokingInput = document.getElementById('smoking');
    const smoking = smokingInput ? smokingInput.value : 'never';
    
    const occupationInput = document.getElementById('occupation');
    const occupation = occupationInput ? occupationInput.value : 'low';
    
    const countryInput = document.getElementById('country');
    const country = countryInput ? countryInput.value : 'usa';

    return { age, gender, coverage, term, health, smoking, occupation, country };
  }

  getBaseRateForAge(age, gender) {
    const rates = BASE_RATES[gender] || BASE_RATES.male;
    const ageKeys = Object.keys(rates).map(Number).sort((a, b) => a - b);
    
    // Find the closest age bracket
    let closestAge = ageKeys[0];
    for (let ageKey of ageKeys) {
      if (age >= ageKey) {
        closestAge = ageKey;
      } else {
        break;
      }
    }
    
    return rates[closestAge] || rates[75]; // Default to highest rate if over 75
  }

  calculatePremium() {
    const { age, gender, coverage, term, health, smoking, occupation, country } = this.getInputValues();
    
    // Validate inputs
    if (isNaN(age) || age < 18 || age > 75) {
      this.showError('Age must be between 18 and 75 years');
      return;
    }
    
    if (isNaN(coverage) || coverage < 50000 || coverage > 10000000) {
      this.showError('Coverage amount must be between $50,000 and $10,000,000');
      return;
    }

    if (isNaN(term) || term < 10 || term > 30) {
      this.showError('Policy term must be between 10 and 30 years');
      return;
    }

    // Calculate base premium
    const baseRate = this.getBaseRateForAge(age, gender);
    const basePremiumAnnual = (coverage / 1000) * baseRate;
    
    // Apply multipliers
    const healthMultiplier = HEALTH_MULTIPLIERS[health] || 1.0;
    const smokingMultiplier = SMOKING_MULTIPLIERS[smoking] || 1.0;
    const occupationMultiplier = OCCUPATION_MULTIPLIERS[occupation] || 1.0;
    const countryMultiplier = COUNTRY_MULTIPLIERS[country] || 1.0;
    const termMultiplier = TERM_MULTIPLIERS[term] || 1.0;
    
    // Calculate final premium
    const totalMultiplier = healthMultiplier * smokingMultiplier * occupationMultiplier * countryMultiplier * termMultiplier;
    const finalAnnualPremium = basePremiumAnnual * totalMultiplier;
    const finalMonthlyPremium = finalAnnualPremium / 12;
    
    // Calculate breakdown amounts
    const healthAdjustment = basePremiumAnnual * (healthMultiplier - 1) / 12;
    const smokingAdjustment = basePremiumAnnual * healthMultiplier * (smokingMultiplier - 1) / 12;
    const occupationAdjustment = basePremiumAnnual * healthMultiplier * smokingMultiplier * (occupationMultiplier - 1) / 12;
    const regionalAdjustment = basePremiumAnnual * healthMultiplier * smokingMultiplier * occupationMultiplier * (countryMultiplier - 1) / 12;
    
    // Display results
    this.displayResults({
      monthlyPremium: finalMonthlyPremium,
      annualPremium: finalAnnualPremium,
      totalPremium: finalAnnualPremium * term,
      coverageRatio: coverage / finalMonthlyPremium,
      basePremium: basePremiumAnnual / 12,
      healthAdjustment,
      smokingAdjustment,
      occupationAdjustment,
      regionalAdjustment,
      finalPremium: finalMonthlyPremium
    });
  }

  displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Format currency
    const fmt = (amount) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount));

    const fmtDecimal = (amount) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    // Update main results
    document.getElementById('monthlyPremium').textContent = fmtDecimal(results.monthlyPremium);
    document.getElementById('annualPremium').textContent = fmt(results.annualPremium);
    document.getElementById('totalPremium').textContent = fmt(results.totalPremium);
    document.getElementById('coverageRatio').textContent = fmt(results.coverageRatio);

    // Update breakdown
    document.getElementById('basePremium').textContent = fmtDecimal(results.basePremium);
    document.getElementById('healthAdjustment').textContent = results.healthAdjustment >= 0 ? 
      `+${fmtDecimal(results.healthAdjustment)}` : fmtDecimal(results.healthAdjustment);
    document.getElementById('smokingAdjustment').textContent = results.smokingAdjustment >= 0 ? 
      `+${fmtDecimal(results.smokingAdjustment)}` : fmtDecimal(results.smokingAdjustment);
    document.getElementById('occupationAdjustment').textContent = results.occupationAdjustment >= 0 ? 
      `+${fmtDecimal(results.occupationAdjustment)}` : fmtDecimal(results.occupationAdjustment);
    document.getElementById('regionalAdjustment').textContent = results.regionalAdjustment >= 0 ? 
      `+${fmtDecimal(results.regionalAdjustment)}` : fmtDecimal(results.regionalAdjustment);
    document.getElementById('finalPremium').textContent = fmtDecimal(results.finalPremium);

    // Scroll to results
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

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TermInsuranceCalculator();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TermInsuranceCalculator;
}
