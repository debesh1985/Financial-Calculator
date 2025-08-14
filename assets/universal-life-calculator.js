
// Universal Life Insurance Premium Calculator
class UniversalLifeCalculator {
  constructor() {
    this.country = 'usa';
    this.currency = '$';
    this.config = this.getConfig();
    this.initializeEventListeners();
    this.calculate();
  }

  getConfig() {
    return {
      // UL Base COI Rates (monthly $ per $1,000 of Net Amount at Risk)
      UL_BASE: {
        USA: {
          YRT: {
            female: { 
              nonsmoker: { "20-29": 0.06, "30-39": 0.09, "40-49": 0.18, "50-59": 0.42, "60-70": 1.05 },
              smoker: { "20-29": 0.10, "30-39": 0.16, "40-49": 0.32, "50-59": 0.78, "60-70": 1.95 }
            },
            male: { 
              nonsmoker: { "20-29": 0.07, "30-39": 0.11, "40-49": 0.22, "50-59": 0.52, "60-70": 1.25 },
              smoker: { "20-29": 0.12, "30-39": 0.19, "40-49": 0.38, "50-59": 0.92, "60-70": 2.25 }
            },
            other: { 
              nonsmoker: { "20-29": 0.065, "30-39": 0.10, "40-49": 0.20, "50-59": 0.47, "60-70": 1.15 },
              smoker: { "20-29": 0.11, "30-39": 0.175, "40-49": 0.35, "50-59": 0.85, "60-70": 2.10 }
            }
          },
          LEVEL: {
            female: { 
              nonsmoker: { "20-29": 0.09, "30-39": 0.13, "40-49": 0.24, "50-59": 0.55, "60-70": 1.30 },
              smoker: { "20-29": 0.15, "30-39": 0.22, "40-49": 0.42, "50-59": 1.00, "60-70": 2.35 }
            },
            male: { 
              nonsmoker: { "20-29": 0.10, "30-39": 0.15, "40-49": 0.28, "50-59": 0.68, "60-70": 1.55 },
              smoker: { "20-29": 0.18, "30-39": 0.27, "40-49": 0.50, "50-59": 1.20, "60-70": 2.75 }
            },
            other: { 
              nonsmoker: { "20-29": 0.095, "30-39": 0.14, "40-49": 0.26, "50-59": 0.615, "60-70": 1.425 },
              smoker: { "20-29": 0.165, "30-39": 0.245, "40-49": 0.46, "50-59": 1.10, "60-70": 2.55 }
            }
          }
        },
        CAN: {
          YRT: {
            female: { 
              nonsmoker: { "20-29": 0.065, "30-39": 0.095, "40-49": 0.19, "50-59": 0.44, "60-70": 1.10 },
              smoker: { "20-29": 0.105, "30-39": 0.17, "40-49": 0.34, "50-59": 0.82, "60-70": 2.05 }
            },
            male: { 
              nonsmoker: { "20-29": 0.075, "30-39": 0.115, "40-49": 0.23, "50-59": 0.54, "60-70": 1.30 },
              smoker: { "20-29": 0.125, "30-39": 0.20, "40-49": 0.40, "50-59": 0.96, "60-70": 2.35 }
            },
            other: { 
              nonsmoker: { "20-29": 0.07, "30-39": 0.105, "40-49": 0.21, "50-59": 0.49, "60-70": 1.20 },
              smoker: { "20-29": 0.115, "30-39": 0.185, "40-49": 0.37, "50-59": 0.89, "60-70": 2.20 }
            }
          },
          LEVEL: {
            female: { 
              nonsmoker: { "20-29": 0.095, "30-39": 0.135, "40-49": 0.25, "50-59": 0.57, "60-70": 1.35 },
              smoker: { "20-29": 0.155, "30-39": 0.23, "40-49": 0.44, "50-59": 1.05, "60-70": 2.45 }
            },
            male: { 
              nonsmoker: { "20-29": 0.105, "30-39": 0.155, "40-49": 0.29, "50-59": 0.70, "60-70": 1.60 },
              smoker: { "20-29": 0.185, "30-39": 0.28, "40-49": 0.52, "50-59": 1.25, "60-70": 2.85 }
            },
            other: { 
              nonsmoker: { "20-29": 0.10, "30-39": 0.145, "40-49": 0.27, "50-59": 0.635, "60-70": 1.475 },
              smoker: { "20-29": 0.17, "30-39": 0.255, "40-49": 0.48, "50-59": 1.15, "60-70": 2.65 }
            }
          }
        }
      },

      // Risk multipliers
      RISK: {
        gender: { female: 1.00, male: 1.08, other: 1.04 },
        smoking: { never: 1.00, former: 1.20, current: 2.00 },
        alcohol: { none: 1.00, moderate: 1.05, heavy: 1.20 },
        job: { low: 1.00, medium: 1.10, high: 1.25, very_high: 1.60 },
        medical: { 
          hypertension: 1.10, 
          diabetes2: 1.20, 
          asthma: 1.05, 
          high_chol: 1.10,
          depression: 1.05, 
          heart_disease: 1.75, 
          cancer_history: 1.40 
        }
      },

      // Policy loads & fees
      LOADS: {
        percent_of_premium: 0.08, // 8% default
        monthly_policy_fee: { USA: 8.00, CAN: 10.00 },
        rider_monthly: 0.00
      },

      // Final expenses by country
      FINAL_EXPENSES: {
        USA: 15000,
        CAN: 18000
      },

      // Insurer factors
      INSURERS: [
        { name: "Insurer A", factor: 0.95 },
        { name: "Insurer B", factor: 0.98 },
        { name: "Insurer C", factor: 1.00 },
        { name: "Insurer D", factor: 1.03 },
        { name: "Insurer E", factor: 1.07 }
      ]
    };
  }

  initializeEventListeners() {
    // Country toggle
    document.querySelectorAll('#countryToggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#countryToggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.country = btn.dataset.country;
        this.currency = this.country === 'usa' ? '$' : 'CA$';
        this.calculate();
      });
    });

    // Age input method toggle
    document.querySelectorAll('#ageInputToggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#ageInputToggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const method = btn.dataset.method;
        
        if (method === 'slider') {
          document.getElementById('ageSliderGroup').classList.remove('hidden');
          document.getElementById('dobGroup').classList.add('hidden');
        } else {
          document.getElementById('ageSliderGroup').classList.add('hidden');
          document.getElementById('dobGroup').classList.remove('hidden');
        }
        this.calculate();
      });
    });

    // Age slider
    const ageSlider = document.getElementById('ageSlider');
    const ageValue = document.getElementById('ageValue');
    ageSlider.addEventListener('input', () => {
      ageValue.textContent = ageSlider.value;
      this.calculate();
    });

    // Income replacement years slider
    const incomeYearsSlider = document.getElementById('incomeReplacementYears');
    const incomeYearsValue = document.getElementById('incomeYearsValue');
    incomeYearsSlider.addEventListener('input', () => {
      incomeYearsValue.textContent = incomeYearsSlider.value;
      this.calculate();
    });

    // Date of birth
    document.getElementById('dobInput').addEventListener('change', () => {
      this.calculate();
    });

    // All other inputs
    const inputs = [
      'gender', 'coverageDuration', 'faceAmount', 'smoking', 'alcohol', 'jobCategory',
      'monthlyIncome', 'mortgage', 'autoLoan', 'personalLoan', 'creditCard', 
      'lineOfCredit', 'existingInsurance', 'coiType', 'creditedRate', 
      'premiumLoad', 'monthlyPolicyFee', 'riderCharges'
    ];
    
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.calculate());
        element.addEventListener('change', () => this.calculate());
      }
    });

    // Medical condition checkboxes
    const medicalCheckboxes = [
      'hypertension', 'diabetes2', 'asthma', 'high_chol', 
      'depression', 'heart_disease', 'cancer_history'
    ];
    
    medicalCheckboxes.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.calculate());
      }
    });

    // Control buttons
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('resetBtnMobile').addEventListener('click', () => this.reset());
    document.getElementById('copyLinkBtn').addEventListener('click', () => this.copyLink());
  }

  getCurrentAge() {
    const ageSliderGroup = document.getElementById('ageSliderGroup');
    
    if (!ageSliderGroup.classList.contains('hidden')) {
      // Use age slider
      return parseInt(document.getElementById('ageSlider').value);
    } else {
      // Calculate from date of birth
      const dobInput = document.getElementById('dobInput');
      if (dobInput.value) {
        const dob = new Date(dobInput.value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        
        return Math.max(0, Math.min(70, age));
      }
      return 35; // Default
    }
  }

  getAgeBand(age) {
    if (age >= 20 && age <= 29) return "20-29";
    if (age >= 30 && age <= 39) return "30-39";
    if (age >= 40 && age <= 49) return "40-49";
    if (age >= 50 && age <= 59) return "50-59";
    if (age >= 60 && age <= 70) return "60-70";
    // For ages under 20, use 20-29 band but at lower end
    return "20-29";
  }

  getDurationMultiplier(duration) {
    // Coverage duration multipliers - longer periods require higher premiums
    // due to increased risk and guaranteed coverage periods
    if (duration <= 15) return 1.0;      // 10-15 years: base rate
    if (duration <= 20) return 1.05;     // 16-20 years: 5% increase
    if (duration <= 25) return 1.12;     // 21-25 years: 12% increase
    if (duration <= 30) return 1.20;     // 26-30 years: 20% increase
    if (duration <= 35) return 1.30;     // 31-35 years: 30% increase
    return 1.42;                          // 36-40 years: 42% increase
  }

  getInputValues() {
    const age = this.getCurrentAge();
    const gender = document.getElementById('gender').value;
    const coverageDuration = parseInt(document.getElementById('coverageDuration').value) || 20;
    const faceAmountOverride = parseFloat(document.getElementById('faceAmount').value) || 0;
    const smoking = document.getElementById('smoking').value;
    const alcohol = document.getElementById('alcohol').value;
    const jobCategory = document.getElementById('jobCategory').value;
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const mortgage = parseFloat(document.getElementById('mortgage').value) || 0;
    const autoLoan = parseFloat(document.getElementById('autoLoan').value) || 0;
    const personalLoan = parseFloat(document.getElementById('personalLoan').value) || 0;
    const creditCard = parseFloat(document.getElementById('creditCard').value) || 0;
    const lineOfCredit = parseFloat(document.getElementById('lineOfCredit').value) || 0;
    const existingInsurance = parseFloat(document.getElementById('existingInsurance').value) || 0;
    const incomeReplacementYears = parseInt(document.getElementById('incomeReplacementYears').value) || 10;
    const coiType = document.getElementById('coiType').value;
    const creditedRate = parseFloat(document.getElementById('creditedRate').value) || 4.0;
    const premiumLoad = parseFloat(document.getElementById('premiumLoad').value) || 8.0;
    const monthlyPolicyFee = parseFloat(document.getElementById('monthlyPolicyFee').value) || 8.0;
    const riderCharges = parseFloat(document.getElementById('riderCharges').value) || 0;

    // Medical conditions
    const medicalConditions = [];
    const medicalIds = ['hypertension', 'diabetes2', 'asthma', 'high_chol', 'depression', 'heart_disease', 'cancer_history'];
    medicalIds.forEach(id => {
      if (document.getElementById(id).checked) {
        medicalConditions.push(id);
      }
    });

    return {
      age,
      gender,
      coverageDuration,
      faceAmountOverride,
      smoking,
      alcohol,
      jobCategory,
      monthlyIncome,
      mortgage,
      autoLoan,
      personalLoan,
      creditCard,
      lineOfCredit,
      existingInsurance,
      incomeReplacementYears,
      coiType,
      creditedRate,
      premiumLoad,
      monthlyPolicyFee,
      riderCharges,
      medicalConditions
    };
  }

  calculateCoverageNeed(inputs) {
    const liabilitiesTotal = inputs.mortgage + inputs.autoLoan + inputs.personalLoan + 
                            inputs.creditCard + inputs.lineOfCredit;
    const incomeReplacement = inputs.monthlyIncome * 12 * inputs.incomeReplacementYears;
    const finalExpenses = this.config.FINAL_EXPENSES[this.country.toUpperCase()];
    
    const recommendedCoverage = Math.max(0, 
      liabilitiesTotal + incomeReplacement + finalExpenses - inputs.existingInsurance
    );

    return Math.round(recommendedCoverage);
  }

  calculatePremium(inputs, faceAmount) {
    const countryKey = this.country.toUpperCase();
    const ageBand = this.getAgeBand(inputs.age);
    
    // Get base COI rate
    const smokerClass = inputs.smoking === 'never' ? 'nonsmoker' : 'smoker';
    const baseRate = this.config.UL_BASE[countryKey][inputs.coiType][inputs.gender][smokerClass][ageBand] || 0.5;
    
    // Calculate risk multipliers
    let totalRiskMultiplier = 1.0;
    totalRiskMultiplier *= this.config.RISK.gender[inputs.gender] || 1.0;
    totalRiskMultiplier *= this.config.RISK.smoking[inputs.smoking] || 1.0;
    totalRiskMultiplier *= this.config.RISK.alcohol[inputs.alcohol] || 1.0;
    totalRiskMultiplier *= this.config.RISK.job[inputs.jobCategory] || 1.0;
    
    // Medical conditions
    inputs.medicalConditions.forEach(condition => {
      totalRiskMultiplier *= this.config.RISK.medical[condition] || 1.0;
    });
    
    // Coverage duration multiplier - longer coverage periods cost more
    const durationMultiplier = this.getDurationMultiplier(inputs.coverageDuration);
    totalRiskMultiplier *= durationMultiplier;
    
    // Calculate monthly COI
    const units = Math.ceil(faceAmount / 1000);
    const riskedRate = baseRate * totalRiskMultiplier;
    const monthlyCOI = riskedRate * units;
    
    // Calculate monthly premium before interest
    const policyFee = this.config.LOADS.monthly_policy_fee[countryKey] || inputs.monthlyPolicyFee;
    const grossMonthly = monthlyCOI + policyFee + inputs.riderCharges;
    const monthlyPremiumPreInterest = grossMonthly / (1 - (inputs.premiumLoad / 100));
    
    // Interest crediting effect
    const creditAdjFactor = Math.max(0.85, 1 - (inputs.creditedRate / 100) * 0.5);
    const monthlyPremium = monthlyPremiumPreInterest * creditAdjFactor;
    
    return Math.max(0, monthlyPremium);
  }

  calculate() {
    try {
      const inputs = this.getInputValues();
      
      // Calculate recommended coverage
      const recommendedCoverage = this.calculateCoverageNeed(inputs);
      const faceAmount = inputs.faceAmountOverride > 0 ? inputs.faceAmountOverride : recommendedCoverage;
      
      // Calculate base premium
      const basePremium = this.calculatePremium(inputs, faceAmount);
      
      // Calculate per-insurer premiums
      const insurerPremiums = this.config.INSURERS.map(insurer => ({
        name: insurer.name,
        premium: basePremium * insurer.factor
      }));
      
      // Calculate stats
      const premiums = insurerPremiums.map(i => i.premium);
      const avgPremium = premiums.reduce((a, b) => a + b, 0) / premiums.length;
      const minPremium = Math.min(...premiums);
      const maxPremium = Math.max(...premiums);
      
      // Update UI
      this.updateResults({
        recommendedCoverage,
        avgPremium,
        minPremium,
        maxPremium,
        insurerPremiums,
        inputs
      });
      
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }

  updateResults(results) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.country === 'usa' ? 'USD' : 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    const premiumFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.country === 'usa' ? 'USD' : 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Update main results
    document.getElementById('recommendedCoverage').textContent = formatter.format(results.recommendedCoverage);
    document.getElementById('averagePremium').textContent = premiumFormatter.format(results.avgPremium);
    document.getElementById('premiumRange').textContent = 
      `${premiumFormatter.format(results.minPremium)} – ${premiumFormatter.format(results.maxPremium)}`;

    // Update insurer breakdown
    results.insurerPremiums.forEach((insurer, index) => {
      const elementId = ['insurerA', 'insurerB', 'insurerC', 'insurerD', 'insurerE'][index];
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = premiumFormatter.format(insurer.premium);
      }
    });

    // Update assumptions
    const assumptionsText = `Age: ${results.inputs.age}, COI: ${results.inputs.coiType}, Rate: ${results.inputs.creditedRate}%, Duration: ${results.inputs.coverageDuration} years`;
    document.getElementById('assumptionsText').textContent = assumptionsText;

    // Update mobile sticky bar
    document.getElementById('stickyPremium').textContent = premiumFormatter.format(results.avgPremium);
  }

  reset() {
    // Reset country to USA
    document.querySelector('#countryToggle [data-country="usa"]').click();
    
    // Reset age input method to slider
    document.querySelector('#ageInputToggle [data-method="slider"]').click();
    
    // Reset all form elements to defaults
    document.getElementById('ageSlider').value = 35;
    document.getElementById('ageValue').textContent = '35';
    document.getElementById('dobInput').value = '';
    document.getElementById('gender').value = 'female';
    document.getElementById('coverageDuration').value = 20;
    document.getElementById('faceAmount').value = '';
    document.getElementById('smoking').value = 'never';
    document.getElementById('alcohol').value = 'none';
    document.getElementById('jobCategory').value = 'low';
    document.getElementById('monthlyIncome').value = 5000;
    document.getElementById('mortgage').value = 200000;
    document.getElementById('autoLoan').value = 0;
    document.getElementById('personalLoan').value = 0;
    document.getElementById('creditCard').value = 0;
    document.getElementById('lineOfCredit').value = 0;
    document.getElementById('existingInsurance').value = 0;
    document.getElementById('incomeReplacementYears').value = 10;
    document.getElementById('incomeYearsValue').textContent = '10';
    document.getElementById('coiType').value = 'YRT';
    document.getElementById('creditedRate').value = 4.0;
    document.getElementById('premiumLoad').value = 8;
    document.getElementById('monthlyPolicyFee').value = 8;
    document.getElementById('riderCharges').value = 0;
    
    // Uncheck all medical conditions
    const medicalIds = ['hypertension', 'diabetes2', 'asthma', 'high_chol', 'depression', 'heart_disease', 'cancer_history'];
    medicalIds.forEach(id => {
      document.getElementById(id).checked = false;
    });
    
    this.calculate();
  }

  copyLink() {
    const inputs = this.getInputValues();
    const params = new URLSearchParams();
    
    // Add all inputs to URL
    Object.entries(inputs).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, value.toString());
      }
    });
    
    params.set('country', this.country);
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(url).then(() => {
      // Show success feedback
      const btn = document.getElementById('copyLinkBtn');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.background = '#28a745';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert('Link copied to clipboard!');
    });
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('country')) {
      const country = params.get('country');
      const countryBtn = document.querySelector(`#countryToggle [data-country="${country}"]`);
      if (countryBtn) countryBtn.click();
    }
    
    // Load other parameters
    const inputs = this.getInputValues();
    Object.keys(inputs).forEach(key => {
      if (params.has(key)) {
        const value = params.get(key);
        const element = document.getElementById(key === 'ageSlider' ? 'ageSlider' : key);
        
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value === 'true';
          } else if (key === 'medicalConditions') {
            const conditions = value.split(',').filter(Boolean);
            conditions.forEach(condition => {
              const checkbox = document.getElementById(condition);
              if (checkbox) checkbox.checked = true;
            });
          } else {
            element.value = value;
            if (key === 'ageSlider') {
              document.getElementById('ageValue').textContent = value;
            }
          }
        }
      }
    });
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const calculator = new UniversalLifeCalculator();
  calculator.loadFromURL();
  
  // Update last modified date if element exists
  const lastUpdatedElement = document.getElementById('lastUpdated');
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = new Date().toLocaleDateString();
  }
});
