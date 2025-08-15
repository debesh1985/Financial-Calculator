
// Geographic data for city suggestions
const geoData = [
  // Canada
  { city: "Toronto", region: "ON", country: "CA" },
  { city: "Vancouver", region: "BC", country: "CA" },
  { city: "Montreal", region: "QC", country: "CA" },
  { city: "Calgary", region: "AB", country: "CA" },
  { city: "Ottawa", region: "ON", country: "CA" },
  { city: "Edmonton", region: "AB", country: "CA" },
  { city: "Mississauga", region: "ON", country: "CA" },
  { city: "Winnipeg", region: "MB", country: "CA" },
  { city: "Quebec City", region: "QC", country: "CA" },
  { city: "Hamilton", region: "ON", country: "CA" },
  { city: "Brampton", region: "ON", country: "CA" },
  { city: "Surrey", region: "BC", country: "CA" },
  { city: "Laval", region: "QC", country: "CA" },
  { city: "Halifax", region: "NS", country: "CA" },
  { city: "London", region: "ON", country: "CA" },
  { city: "Markham", region: "ON", country: "CA" },
  { city: "Vaughan", region: "ON", country: "CA" },
  { city: "Gatineau", region: "QC", country: "CA" },
  { city: "Saskatoon", region: "SK", country: "CA" },
  { city: "Longueuil", region: "QC", country: "CA" },
  
  // USA
  { city: "New York", region: "NY", country: "US" },
  { city: "Los Angeles", region: "CA", country: "US" },
  { city: "Chicago", region: "IL", country: "US" },
  { city: "Houston", region: "TX", country: "US" },
  { city: "Phoenix", region: "AZ", country: "US" },
  { city: "Philadelphia", region: "PA", country: "US" },
  { city: "San Antonio", region: "TX", country: "US" },
  { city: "San Diego", region: "CA", country: "US" },
  { city: "Dallas", region: "TX", country: "US" },
  { city: "San Jose", region: "CA", country: "US" },
  { city: "Austin", region: "TX", country: "US" },
  { city: "Jacksonville", region: "FL", country: "US" },
  { city: "San Francisco", region: "CA", country: "US" },
  { city: "Indianapolis", region: "IN", country: "US" },
  { city: "Columbus", region: "OH", country: "US" },
  { city: "Fort Worth", region: "TX", country: "US" },
  { city: "Charlotte", region: "NC", country: "US" },
  { city: "Detroit", region: "MI", country: "US" },
  { city: "El Paso", region: "TX", country: "US" },
  { city: "Seattle", region: "WA", country: "US" },
  { city: "Denver", region: "CO", country: "US" },
  { city: "Washington", region: "DC", country: "US" },
  { city: "Boston", region: "MA", country: "US" },
  { city: "Nashville", region: "TN", country: "US" },
  { city: "Baltimore", region: "MD", country: "US" },
  { city: "Oklahoma City", region: "OK", country: "US" },
  { city: "Louisville", region: "KY", country: "US" },
  { city: "Portland", region: "OR", country: "US" },
  { city: "Las Vegas", region: "NV", country: "US" },
  { city: "Milwaukee", region: "WI", country: "US" },
  { city: "Albuquerque", region: "NM", country: "US" },
  { city: "Tucson", region: "AZ", country: "US" },
  { city: "Fresno", region: "CA", country: "US" },
  { city: "Sacramento", region: "CA", country: "US" },
  { city: "Mesa", region: "AZ", country: "US" },
  { city: "Kansas City", region: "MO", country: "US" },
  { city: "Atlanta", region: "GA", country: "US" },
  { city: "Colorado Springs", region: "CO", country: "US" },
  { city: "Miami", region: "FL", country: "US" },
  { city: "Raleigh", region: "NC", country: "US" },
  { city: "Omaha", region: "NE", country: "US" },
  { city: "Long Beach", region: "CA", country: "US" },
  { city: "Virginia Beach", region: "VA", country: "US" },
  { city: "Oakland", region: "CA", country: "US" },
  { city: "Minneapolis", region: "MN", country: "US" },
  { city: "Tulsa", region: "OK", country: "US" },
  { city: "Tampa", region: "FL", country: "US" },
  { city: "Arlington", region: "TX", country: "US" },
  { city: "New Orleans", region: "LA", country: "US" }
];

let amortChart = null;

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  setupCityAutocomplete();
  updateCurrencySymbols();
  calculateAndUpdate();
});

function setupEventListeners() {
  // Country toggle
  document.querySelectorAll('input[name="country"]').forEach(radio => {
    radio.addEventListener('change', function() {
      updateCurrencySymbols();
      updateUSAInsuranceVisibility();
      calculateAndUpdate();
    });
  });

  // Scenario toggle
  document.querySelectorAll('input[name="scenario"]').forEach(radio => {
    radio.addEventListener('change', calculateAndUpdate);
  });

  // All input fields
  const inputs = ['homePrice', 'downPayment', 'rate', 'years', 'frequency', 'usaMI', 'tax', 'condo', 'water', 'electric', 'heating'];
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', function() {
        if (id === 'homePrice' || id === 'downPayment') {
          updateDownPaymentPercent();
          updateUSAInsuranceVisibility();
        }
        calculateAndUpdate();
      });
    }
  });

  // City input
  document.getElementById('cityInput').addEventListener('input', updateCityList);
}

function setupCityAutocomplete() {
  const cityInput = document.getElementById('cityInput');
  const cityList = document.getElementById('cityList');
  
  cityInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    cityList.innerHTML = '';
    
    if (query.length < 2) return;
    
    const filtered = geoData.filter(item => 
      item.city.toLowerCase().includes(query) || 
      item.region.toLowerCase().includes(query)
    ).slice(0, 10);
    
    filtered.forEach(item => {
      const option = document.createElement('option');
      option.value = `${item.city}, ${item.region}`;
      cityList.appendChild(option);
    });
  });
}

function updateCurrencySymbols() {
  const isCAD = document.getElementById('countryCAD').checked;
  const symbol = '$'; // Both CAD and USD use $
  
  // Update all currency symbols
  document.querySelectorAll('[id^="currencySymbol"]').forEach(elem => {
    elem.textContent = symbol;
  });
}

function updateDownPaymentPercent() {
  const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
  const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
  
  const percentage = homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : 0;
  document.getElementById('downPctHelp').textContent = `${percentage}% of home price`;
}

function updateUSAInsuranceVisibility() {
  const isUSA = document.getElementById('countryUSD').checked;
  const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
  const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
  const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 100;
  
  const usaMIChoice = document.getElementById('usaMIChoice');
  if (isUSA && downPaymentPercent < 20) {
    usaMIChoice.classList.remove('d-none');
  } else {
    usaMIChoice.classList.add('d-none');
  }
}

function getCMHCPremiumRate(ltvPercent) {
  if (ltvPercent <= 65) return 0.006;
  if (ltvPercent <= 75) return 0.017;
  if (ltvPercent <= 80) return 0.024;
  if (ltvPercent <= 85) return 0.028;
  if (ltvPercent <= 90) return 0.031;
  if (ltvPercent <= 95) return 0.04;
  return 0.04;
}

function calculateMortgage() {
  const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
  const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
  const rate = parseFloat(document.getElementById('rate').value) || 0;
  const years = parseInt(document.getElementById('years').value) || 25;
  const frequency = document.getElementById('frequency').value;
  
  const isCAD = document.getElementById('countryCAD').checked;
  const isPurchase = document.getElementById('scenarioPurchase').checked;
  
  if (homePrice <= 0 || downPayment < 0 || rate < 0) {
    return null;
  }

  let loanAmount = homePrice - downPayment;
  const ltvPercent = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;
  
  let mortgageInsurance = 0;
  let insuranceInfo = '—';
  
  // Calculate mortgage insurance
  if (isCAD && isPurchase && ltvPercent > 80) {
    // CMHC insurance for Canada
    const cmhcRate = getCMHCPremiumRate(ltvPercent);
    const cmhcPremium = loanAmount * cmhcRate;
    loanAmount += cmhcPremium; // Finance the premium
    insuranceInfo = `CMHC: ${(cmhcRate * 100).toFixed(2)}% financed`;
  } else if (!isCAD && ltvPercent > 80) {
    // USA mortgage insurance
    const usaMI = document.getElementById('usaMI').value;
    if (usaMI === 'fha') {
      // FHA: UFMIP + MIP
      const ufmip = loanAmount * 0.0175;
      loanAmount += ufmip;
      const mipRate = ltvPercent >= 95 ? 0.0055 : 0.005;
      mortgageInsurance = (loanAmount * mipRate) / 12;
      insuranceInfo = `FHA: UFMIP 1.75% + MIP ${(mipRate * 100).toFixed(2)}%`;
    } else {
      // Conventional PMI
      const pmiRate = 0.005; // 0.5% annually
      mortgageInsurance = (loanAmount * pmiRate) / 12;
      insuranceInfo = `PMI: ${(pmiRate * 100).toFixed(2)}%`;
    }
  }

  // Payment frequency calculations
  let paymentsPerYear, payment, monthlyEquivalent;
  
  switch (frequency) {
    case 'monthly':
      paymentsPerYear = 12;
      break;
    case 'semi-monthly':
      paymentsPerYear = 24;
      break;
    case 'bi-weekly':
      paymentsPerYear = 26;
      break;
    case 'weekly':
      paymentsPerYear = 52;
      break;
    case 'acc-bi-weekly':
      paymentsPerYear = 26;
      break;
    case 'acc-weekly':
      paymentsPerYear = 52;
      break;
    default:
      paymentsPerYear = 12;
  }

  const totalPayments = years * paymentsPerYear;
  const periodicRate = rate / 100 / paymentsPerYear;

  if (rate === 0) {
    payment = loanAmount / totalPayments;
  } else {
    payment = loanAmount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / 
              (Math.pow(1 + periodicRate, totalPayments) - 1);
  }

  // Handle accelerated payments
  if (frequency === 'acc-bi-weekly' || frequency === 'acc-weekly') {
    // Calculate monthly payment first
    const monthlyRate = rate / 100 / 12;
    const monthlyPayments = years * 12;
    let monthlyPayment;
    
    if (rate === 0) {
      monthlyPayment = loanAmount / monthlyPayments;
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, monthlyPayments)) / 
                      (Math.pow(1 + monthlyRate, monthlyPayments) - 1);
    }
    
    if (frequency === 'acc-bi-weekly') {
      payment = monthlyPayment / 2;
    } else {
      payment = monthlyPayment / 4;
    }
  }

  // Calculate monthly equivalent
  monthlyEquivalent = payment * paymentsPerYear / 12;

  return {
    loanAmount,
    payment,
    monthlyEquivalent,
    paymentsPerYear,
    totalPayments,
    periodicRate,
    mortgageInsurance,
    ltvPercent,
    insuranceInfo,
    frequency
  };
}

function calculateAndUpdate() {
  const mortgage = calculateMortgage();
  
  if (!mortgage) {
    // Clear results
    document.getElementById('paymentDisplay').textContent = '$0.00';
    document.getElementById('monthlyEquiv').textContent = '$0.00';
    document.getElementById('ltvDisplay').textContent = '0%';
    document.getElementById('miSummary').textContent = '—';
    return;
  }

  // Update payment display
  document.getElementById('paymentDisplay').textContent = formatCurrency(mortgage.payment);
  document.getElementById('monthlyEquiv').textContent = formatCurrency(mortgage.monthlyEquivalent);

  // Update frequency label
  const frequencyLabels = {
    'monthly': 'Monthly • 12 payments/yr',
    'semi-monthly': 'Semi-Monthly • 24 payments/yr',
    'bi-weekly': 'Bi-Weekly • 26 payments/yr',
    'acc-bi-weekly': 'Accelerated Bi-Weekly • 26 payments/yr',
    'weekly': 'Weekly • 52 payments/yr',
    'acc-weekly': 'Accelerated Weekly • 52 payments/yr'
  };
  document.getElementById('frequencyLabel').textContent = frequencyLabels[mortgage.frequency];

  // Update KPIs
  document.getElementById('ltvDisplay').textContent = `${mortgage.ltvPercent.toFixed(1)}%`;
  document.getElementById('miSummary').textContent = mortgage.insuranceInfo;

  // Calculate ownership costs
  updateOwnershipCosts(mortgage);

  // Update amortization chart
  updateAmortizationChart(mortgage);
}

function updateOwnershipCosts(mortgage) {
  const tax = parseFloat(document.getElementById('tax').value) || 0;
  const condo = parseFloat(document.getElementById('condo').value) || 0;
  const water = parseFloat(document.getElementById('water').value) || 0;
  const electric = parseFloat(document.getElementById('electric').value) || 0;
  const heating = parseFloat(document.getElementById('heating').value) || 0;
  
  const utilities = water + electric + heating;
  const total = mortgage.monthlyEquivalent + mortgage.mortgageInsurance + tax + condo + utilities;

  document.getElementById('ownershipPI').textContent = formatCurrency(mortgage.monthlyEquivalent);
  document.getElementById('ownershipMI').textContent = formatCurrency(mortgage.mortgageInsurance);
  document.getElementById('ownershipTax').textContent = formatCurrency(tax);
  document.getElementById('ownershipCondo').textContent = formatCurrency(condo);
  document.getElementById('ownershipUtilities').textContent = formatCurrency(utilities);
  document.getElementById('ownershipTotal').textContent = formatCurrency(total);
}

function updateAmortizationChart(mortgage) {
  const years = parseInt(document.getElementById('years').value) || 25;
  
  // Generate amortization schedule
  let balance = mortgage.loanAmount;
  const yearlyData = [];
  
  for (let year = 1; year <= years; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    
    for (let payment = 1; payment <= mortgage.paymentsPerYear; payment++) {
      if (balance <= 0) break;
      
      const interestPayment = balance * mortgage.periodicRate;
      const principalPayment = Math.min(mortgage.payment - interestPayment, balance);
      
      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;
      balance -= principalPayment;
    }
    
    yearlyData.push({
      year,
      principal: yearlyPrincipal,
      interest: yearlyInterest
    });
  }

  // Create chart
  const ctx = document.getElementById('amortChart').getContext('2d');
  
  if (amortChart) {
    amortChart.destroy();
  }

  amortChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: yearlyData.map(d => `Year ${d.year}`),
      datasets: [
        {
          label: 'Principal',
          data: yearlyData.map(d => d.principal),
          backgroundColor: '#198754',
          borderColor: '#198754',
          borderWidth: 1
        },
        {
          label: 'Interest',
          data: yearlyData.map(d => d.interest),
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Year'
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Amount ($)'
          },
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        },
        legend: {
          display: true
        }
      }
    }
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function updateCityList() {
  // This function is handled by setupCityAutocomplete
}
