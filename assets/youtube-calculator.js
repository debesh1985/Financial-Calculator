
// Utility functions
const $ = (id) => document.getElementById(id);
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(Math.max(0, amount || 0));

const formatNumber = (num) => new Intl.NumberFormat('en-US').format(Math.max(0, num || 0));

// Calculator state
let calculatorData = {
  monthlyViews: 100000,
  subscribers: 10000,
  videoLength: 8,
  videosPerMonth: 8,
  cpm: 3.50,
  adShare: 55,
  memberships: 0,
  membershipPrice: 4.99,
  superChat: 0,
  sponsorships: 0
};

// Calculate earnings
function calculateEarnings() {
  // Get current values from inputs
  Object.keys(calculatorData).forEach(key => {
    const element = $(key);
    if (element) {
      calculatorData[key] = parseFloat(element.value) || 0;
    }
  });

  const data = calculatorData;
  
  // Calculate ad revenue
  const monetizedViews = Math.min(data.monthlyViews, data.monthlyViews * 0.85); // ~85% of views are monetized
  const grossAdRevenue = (monetizedViews / 1000) * data.cpm;
  const adRevenue = grossAdRevenue * (data.adShare / 100);
  
  // Calculate membership revenue
  const membershipRevenue = data.memberships * data.membershipPrice * 0.7; // YouTube takes 30%
  
  // Super Chat revenue (YouTube takes 30%)
  const superChatRevenue = data.superChat * 0.7;
  
  // Sponsorship revenue (100% to creator)
  const sponsorshipRevenue = data.sponsorships;
  
  // Total monthly revenue
  const totalMonthly = adRevenue + membershipRevenue + superChatRevenue + sponsorshipRevenue;
  
  // Update display
  $('adRevenue').textContent = formatCurrency(adRevenue);
  $('membershipRevenue').textContent = formatCurrency(membershipRevenue);
  $('superChatRevenue').textContent = formatCurrency(superChatRevenue);
  $('sponsorshipRevenue').textContent = formatCurrency(sponsorshipRevenue);
  $('totalRevenue').textContent = formatCurrency(totalMonthly);
  
  // Annual projections
  const yearlyRevenue = totalMonthly * 12;
  $('yearlyRevenue').textContent = formatCurrency(yearlyRevenue);
  
  const revenuePerSub = data.subscribers > 0 ? (yearlyRevenue / data.subscribers) : 0;
  $('revenuePerSub').textContent = formatCurrency(revenuePerSub);
  
  const rpm = data.monthlyViews > 0 ? ((totalMonthly / data.monthlyViews) * 1000) : 0;
  $('rpm').textContent = formatCurrency(rpm);
  
  // Generate insights
  generateInsights(data, totalMonthly, adRevenue);
}

// Generate personalized insights
function generateInsights(data, totalMonthly, adRevenue) {
  const insights = [];
  
  // Channel size insights
  if (data.subscribers < 1000) {
    insights.push({
      icon: '📈',
      text: 'You need 1,000+ subscribers to enable monetization. Focus on growing your audience!'
    });
  } else if (data.subscribers < 10000) {
    insights.push({
      icon: '🎯',
      text: 'Small creator tier! Focus on consistent uploads and audience engagement to grow.'
    });
  } else if (data.subscribers < 100000) {
    insights.push({
      icon: '🚀',
      text: 'Medium creator! Consider diversifying income with memberships and sponsorships.'
    });
  } else {
    insights.push({
      icon: '⭐',
      text: 'Large creator! You have great potential for brand partnerships and premium content.'
    });
  }
  
  // CPM insights
  if (data.cpm < 2) {
    insights.push({
      icon: '💡',
      text: 'Low CPM detected. Consider targeting higher-value niches like finance or tech.'
    });
  } else if (data.cpm > 8) {
    insights.push({
      icon: '💰',
      text: 'Excellent CPM! Your niche has high advertiser demand.'
    });
  }
  
  // Revenue diversification
  const adPercentage = totalMonthly > 0 ? (adRevenue / totalMonthly) * 100 : 0;
  if (adPercentage > 80 && totalMonthly > 0) {
    insights.push({
      icon: '⚠️',
      text: 'Heavy reliance on ad revenue. Consider adding memberships, Super Chat, or sponsorships.'
    });
  }
  
  // View frequency insights
  const viewsPerVideo = data.videosPerMonth > 0 ? (data.monthlyViews / data.videosPerMonth) : 0;
  if (viewsPerVideo > 50000) {
    insights.push({
      icon: '🔥',
      text: `Strong performance! ${formatNumber(viewsPerVideo)} views per video is excellent.`
    });
  }
  
  // Video length optimization
  if (data.videoLength > 8) {
    insights.push({
      icon: '📺',
      text: 'Longer videos can show more ads! Your 8+ minute videos can include mid-roll ads.'
    });
  } else if (data.videoLength < 8) {
    insights.push({
      icon: '⏱️',
      text: 'Consider making videos 8+ minutes to enable mid-roll ads for higher revenue.'
    });
  }
  
  // Render insights
  const insightsContainer = $('insights');
  insightsContainer.innerHTML = '';
  
  insights.slice(0, 3).forEach(insight => {
    const div = document.createElement('div');
    div.className = 'insight-item';
    div.innerHTML = `
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-text">${insight.text}</div>
    `;
    insightsContainer.appendChild(div);
  });
}

// Preset configurations
function setPreset(type) {
  const presets = {
    small: {
      monthlyViews: 25000,
      subscribers: 2500,
      videoLength: 6,
      videosPerMonth: 4,
      cpm: 2.50,
      memberships: 10,
      superChat: 50,
      sponsorships: 0
    },
    medium: {
      monthlyViews: 150000,
      subscribers: 25000,
      videoLength: 10,
      videosPerMonth: 8,
      cpm: 4.00,
      memberships: 100,
      superChat: 300,
      sponsorships: 500
    },
    large: {
      monthlyViews: 800000,
      subscribers: 150000,
      videoLength: 12,
      videosPerMonth: 12,
      cpm: 6.50,
      memberships: 500,
      superChat: 1000,
      sponsorships: 3000
    }
  };
  
  const preset = presets[type];
  if (!preset) return;
  
  // Update form values
  Object.keys(preset).forEach(key => {
    const element = $(key);
    if (element) {
      element.value = preset[key];
    }
  });
  
  calculateEarnings();
}

// Event listeners
function bindEvents() {
  // Input event listeners
  const inputs = ['monthlyViews', 'subscribers', 'videoLength', 'videosPerMonth', 'cpm', 'adShare', 'memberships', 'membershipPrice', 'superChat', 'sponsorships'];
  
  inputs.forEach(inputId => {
    const element = $(inputId);
    if (element) {
      element.addEventListener('input', calculateEarnings);
      element.addEventListener('change', calculateEarnings);
    }
  });
  
  // Preset buttons
  $('presetSmall').addEventListener('click', () => setPreset('small'));
  $('presetMedium').addEventListener('click', () => setPreset('medium'));
  $('presetLarge').addEventListener('click', () => setPreset('large'));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  calculateEarnings(); // Initial calculation
});
