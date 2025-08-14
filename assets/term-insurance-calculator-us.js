
// Term Insurance Premium Calculator Logic - US Version

// Base premium rates per $1000 of coverage per year by age and gender (US rates)
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

// Risk multipliers for US market
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

// Term length multipliers (longer terms cost more due to level premiums)
const TERM_MULTIPLIERS = {
  10: 0.85,
  15: 0.92,
  20: 1.0,
  25: 1.08,
  30: 1.15
};

class TermInsuranceCalculatorUS {
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
    const inputs = ['age', 'gender', 'coverage', 'customCoverage', 'term', 'health', 'smoking', 'occupation'];
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
    const age = parseInt(document.getElementById('age').value) || 30;
    const gender = document.getElementById('gender').value;
    const coverageSelect = document.getElementById('coverage').value;
    
    let coverage;
    if (coverageSelect === 'custom') {
      coverage = parseInt(document.getElementById('customCoverage').value) || 250000;
    } else {
      coverage = parseInt(coverageSelect);
    }
    
    const term = parseInt(document.getElementById('term').value) || 20;
    const health = document.getElementById('health').value;
    const smoking = document.getElementById('smoking').value;
    const occupation = document.getElementById('occupation').value;

    return { age, gender, coverage, term, health, smoking, occupation };
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
    const { age, gender, coverage, term, health, smoking, occupation } = this.getInputValues();
    
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
    const termMultiplier = TERM_MULTIPLIERS[term] || 1.0;
    
    // Calculate final premium
    const totalMultiplier = healthMultiplier * smokingMultiplier * occupationMultiplier * termMultiplier;
    const finalAnnualPremium = basePremiumAnnual * totalMultiplier;
    const finalMonthlyPremium = finalAnnualPremium / 12;
    
    // Calculate breakdown amounts
    const healthAdjustment = basePremiumAnnual * (healthMultiplier - 1) / 12;
    const smokingAdjustment = basePremiumAnnual * healthMultiplier * (smokingMultiplier - 1) / 12;
    const occupationAdjustment = basePremiumAnnual * healthMultiplier * smokingMultiplier * (occupationMultiplier - 1) / 12;
    
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
      finalPremium: finalMonthlyPremium
    });

    // Track interaction
    this.trackEvent('premium_calculated', {
      age: age,
      gender: gender,
      coverage: coverage,
      term: term,
      monthly_premium: finalMonthlyPremium
    });
  }

  displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Format currency in USD
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

  trackEvent(eventName, properties) {
    // Event tracking hook for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
    // Alternative tracking systems can be added here
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TermInsuranceCalculatorUS();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TermInsuranceCalculatorUS;
}
