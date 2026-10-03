// API client for Off-Season Smart Agriculture Assistant Backend

const BASE_URL = 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Weather (Open-Meteo online telemetry)
  getWeather: (district, lat, lon) => {
    let q = `?district=${encodeURIComponent(district || 'Kathmandu')}`;
    if (lat && lon) q += `&lat=${lat}&lon=${lon}`;
    return request(`/weather${q}`);
  },

  // Crops Encyclopedia
  getCrops: (category, search) => {
    let q = '';
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length) q = `?${params.join('&')}`;
    return request(`/crops${q}`);
  },
  getCropDetail: (slug) => request(`/crops/${slug}`),

  // Market (Official AMPIS & Kalimati Mandi Telemetry)
  getMarketPrices: (marketId, cropSlug) => {
    const params = [];
    if (marketId && marketId !== 'all') params.push(`market_id=${encodeURIComponent(marketId)}`);
    if (cropSlug && cropSlug !== 'all') params.push(`crop_slug=${encodeURIComponent(cropSlug)}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return request(`/market/prices${q}`);
  },
  getMarketTrends: (cropSlug) => request(`/market/trends/${encodeURIComponent(cropSlug)}`),
  getMarketArrivals: () => request('/market/arrivals'),
  getMarketSources: () => request('/market/sources'),
  refreshMarketPrices: () => request('/market/refresh', { method: 'POST' }),
  runMarketBacktest: (cropSlug = 'tomato', evalMonth = 9, targetMonth = 12) =>
    request(`/market/backtest?crop_slug=${encodeURIComponent(cropSlug)}&eval_month=${evalMonth}&target_month=${targetMonth}`, { method: 'POST' }),

  // Off-Season Core Engines
  getForwardPlan: (payload) =>
    request('/offseason/forward-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getBackwardPlan: (payload) =>
    request('/offseason/backward-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  simulateWhatIf: (payload) =>
    request('/offseason/what-if-simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getFutureMarketWindows: () => request('/offseason/future-market-windows'),

  getCropSeasonality: (cropSlug) => request(`/offseason/seasonality/${encodeURIComponent(cropSlug)}`),

  compareOffseasonCrops: (payload) =>
    request('/offseason/compare', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Recommendation (Legacy / Standard)
  getRecommendations: (payload) =>
    request('/recommendation/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Profit Calculator (Legacy)
  calculateProfit: (payload) =>
    request('/profit/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Crop Comparison
  compareCrops: (payload) =>
    request('/compare/crops', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Disease Risk
  getDiseaseRisk: (cropSlug, district) =>
    request(`/disease/risk/${cropSlug}?district=${encodeURIComponent(district || 'Kathmandu')}`),

  // Crop Calendar
  getCropCalendar: (cropSlug) => request(`/calendar/${cropSlug}`),

  // Geography
  getProvinces: () => request('/geo/provinces'),
  getDistricts: (provinceId) =>
    request(`/geo/districts${provinceId ? `?province_id=${provinceId}` : ''}`),
  getDistrictDetail: (name) => request(`/geo/district/${encodeURIComponent(name)}`),

  // AI Chat (Context-Grounded Decision Assistant)
  sendAIChat: (payload) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Farms
  getFarms: () => request('/farms'),
  createFarm: (payload) =>
    request('/farms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAlerts: () => request('/farms/alerts'),

  // Section 25: Strategy Backtesting
  runBacktest: (payload) =>
    request('/offseason/backtest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Sections 18, 21, 22: Risk Analysis & Price Crash Risk
  getRiskAnalysis: (district, profile) =>
    request(`/offseason/risk-analysis?district=${encodeURIComponent(district || 'Kathmandu')}${profile ? `&profile=${encodeURIComponent(profile)}` : ''}`),

  // Section 19: Market Destination Selection
  compareMarketDestinations: (payload) =>
    request('/offseason/market-selection', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Section 20: Supply Gap Intelligence
  getSupplyGapAnalysis: () => request('/offseason/supply-demand'),

  // Section 32: Software Crop Cycle Tracking
  getActiveCropCycles: () => request('/offseason/crop-cycles'),
  createCropCycle: (payload) =>
    request('/offseason/crop-cycles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteCropCycle: (cycleId) =>
    request(`/offseason/crop-cycles/${encodeURIComponent(cycleId)}`, {
      method: 'DELETE',
    }),

  // Section 13: Staggered Planting Planner (Multiple Harvest Planning)
  getStaggeredPlan: (payload) =>
    request('/offseason/staggered-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Section 14: 12-Month Year-Round Tunnel Planner
  getYearRoundPlan: (payload) =>
    request('/offseason/year-round-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Section 15: Crop Rotation Intelligence
  getCropRotationAdvice: (cropSlug) =>
    request(`/offseason/crop-rotation/${encodeURIComponent(cropSlug)}`),

  // Section 12: Post-Harvest Loss Calculator
  calculatePostHarvestLoss: (payload) =>
    request('/offseason/post-harvest-loss', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Section 31: Real-Time Alerts
  getSystemAlerts: () => request('/alerts'),

  // Sections 34-39: Future IoT Readiness Module
  getFutureIoTStatus: () => request('/iot/status'),
  getFutureIoTSensors: () => request('/iot/sensors'),
  getFutureIoTDevices: () => request('/iot/devices'),
};


