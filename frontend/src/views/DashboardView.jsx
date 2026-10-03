import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function DashboardView() {
  const {
    district,
    setDistrict,
    farmingMethod,
    setFarmingMethod,
    setActiveTab,
    setSelectedWhatIfCrop,
    setSelectedCropForDetail,
    language
  } = useApp();

  // Recommendations and data state
  const [topRecs, setTopRecs] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketWindows, setMarketWindows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);

  // Form State for "What Should I Plant Now?"
  const [province, setProvince] = useState('Bagmati');
  const [formDistrict, setFormDistrict] = useState(district || 'Kathmandu');
  const [municipality, setMunicipality] = useState('Kathmandu Metropolitan City');
  const [ward, setWard] = useState('Ward 4');
  const [method, setMethod] = useState(farmingMethod || 'tunnel');
  const [tunnelSize, setTunnelSize] = useState(250);
  const [areaUnit, setAreaUnit] = useState('sqm'); // ropani, kattha, sqm
  const [budget, setBudget] = useState(50000);
  const [plantingDate, setPlantingDate] = useState('2026-09-26');
  const [targetMarket, setTargetMarket] = useState('wholesale_kalimati');

  const provinces = [
    { id: 'Koshi', name_en: 'Koshi Province', name_ne: 'कोशी प्रदेश' },
    { id: 'Madhesh', name_en: 'Madhesh Province', name_ne: 'मधेश प्रदेश' },
    { id: 'Bagmati', name_en: 'Bagmati Province', name_ne: 'बागमती प्रदेश' },
    { id: 'Gandaki', name_en: 'Gandaki Province', name_ne: 'गण्डकी प्रदेश' },
    { id: 'Lumbini', name_en: 'Lumbini Province', name_ne: 'लुम्बिनी प्रदेश' },
    { id: 'Karnali', name_en: 'Karnali Province', name_ne: 'कर्णाली प्रदेश' },
    { id: 'Sudurpashchim', name_en: 'Sudurpashchim Province', name_ne: 'सुदूरपश्चिम प्रदेश' }
  ];

  const districtsByProvince = {
    Bagmati: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Nuwakot', 'Chitwan', 'Makwanpur'],
    Gandaki: ['Kaski', 'Tanahun', 'Gorkha', 'Syangja', 'Nawalpur', 'Palpa'],
    Koshi: ['Morang', 'Sunsari', 'Jhapa', 'Ilam'],
    Lumbini: ['Rupandehi', 'Kapilvastu', 'Dang', 'Banke'],
    Madhesh: ['Parsa', 'Bara', 'Dhanusha'],
    Karnali: ['Surkhet', 'Dailekh', 'Jumla'],
    Sudurpashchim: ['Kailali', 'Kanchanpur', 'Dadeldhura']
  };

  const marketOptions = [
    { id: 'wholesale_kalimati', label: 'Kalimati Wholesale Market, Kathmandu' },
    { id: 'pokhara_mandi', label: 'Pokhara Wholesale Market, Kaski' },
    { id: 'narayangarh_mandi', label: 'Narayangarh Wholesale Market, Chitwan' },
    { id: 'birtamode_hub', label: 'Birtamode Agriculture Hub, Jhapa' },
    { id: 'local_haat', label: 'Local Haat Bazaar / Regional Mandi' }
  ];

  const getAreaInSqm = () => {
    const val = parseFloat(tunnelSize) || 250;
    if (areaUnit === 'ropani') return Math.round(val * 508.72);
    if (areaUnit === 'kattha') return Math.round(val * 338.63);
    return Math.round(val);
  };

  // Fetch initial summary data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const areaSqm = getAreaInSqm();
        const [planRes, priceRes, windowsRes, alertsRes] = await Promise.all([
          api.getForwardPlan({
            planting_date: plantingDate,
            province,
            district: formDistrict,
            municipality,
            ward,
            farming_method: method,
            tunnel_area_sqm: areaSqm,
            area_unit: areaUnit,
            budget_npr: parseFloat(budget) || 50000,
            target_market: targetMarket,
            language
          }),
          api.getMarketPrices(),
          api.getFutureMarketWindows(),
          api.getSystemAlerts()
        ]);

        setTopRecs(planRes.recommendations?.slice(0, 3) || []);
        setMarketPrices(priceRes?.slice(0, 5) || []);
        setMarketWindows(windowsRes.months?.slice(8, 12) || []);
        setAlerts(alertsRes.alerts?.slice(0, 3) || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [formDistrict, method, areaUnit, language]);

  // Handle recommendation form submission
  const handleGetRecommendation = async (e) => {
    if (e) e.preventDefault();
    setRecsLoading(true);
    try {
      const areaSqm = getAreaInSqm();
      const planRes = await api.getForwardPlan({
        planting_date: plantingDate,
        province,
        district: formDistrict,
        municipality,
        ward,
        farming_method: method,
        tunnel_area_sqm: areaSqm,
        area_unit: areaUnit,
        budget_npr: parseFloat(budget) || 50000,
        target_market: targetMarket,
        language
      });
      setTopRecs(planRes.recommendations?.slice(0, 3) || []);
      setDistrict(formDistrict);
      setFarmingMethod(method);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setRecsLoading(false);
    }
  };

  // Sample historical price chart data for Kalimati Mandi
  const priceTrendChartData = [
    { month: 'Jun', Tomato: 45, Cucumber: 40, Capsicum: 65 },
    { month: 'Jul', Tomato: 55, Cucumber: 48, Capsicum: 75 },
    { month: 'Aug', Tomato: 68, Cucumber: 62, Capsicum: 85 },
    { month: 'Sep', Tomato: 80, Cucumber: 75, Capsicum: 95 },
    { month: 'Oct', Tomato: 95, Cucumber: 90, Capsicum: 110 },
    { month: 'Nov', Tomato: 110, Cucumber: 105, Capsicum: 130 },
    { month: 'Dec', Tomato: 125, Cucumber: 115, Capsicum: 145 },
    { month: 'Jan', Tomato: 115, Cucumber: 98, Capsicum: 135 }
  ];

  return (
    <div className="fade-in pb-5">
      {/* 1. HERO SECTION */}
      <section className="agri-hero">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-12 col-lg-7">
              <div className="agri-hero-badge">
                <span>🌱</span>
                <span>
                  {language === 'ne'
                    ? 'कृषि गुप्तचर तथा अफ-सिजन निर्णय प्रणाली'
                    : 'AI-Powered Smart Agriculture'}
                </span>
              </div>
              <h1 className="agri-hero-title">Smart Agriculture Assistant</h1>
              <p className="agri-hero-subtitle">
                {language === 'ne'
                  ? 'अहिले के लगाउने ताकि भोलिको उच्च बजार विन्डोमा उत्कृष्ट नाफा र फसल पाउन सकियोस्।'
                  : 'Know what to plant today for a better harvest and market opportunity tomorrow.'}
              </p>
              <div className="d-flex flex-wrap gap-2 pt-1">
                <a
                  href="#recommendation-form"
                  className="btn btn-agri btn-lg px-4 py-2.5 d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-sprout"></i>
                  <span>{language === 'ne' ? 'अहिले के लगाउने?' : 'What Should I Plant?'}</span>
                </a>
                <button
                  onClick={() => setActiveTab('market_prices')}
                  className="btn btn-outline-agri btn-lg px-4 py-2.5 d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-graph-up"></i>
                  <span>{language === 'ne' ? 'बजार भाउ हेर्नुहोस्' : 'Explore Market'}</span>
                </button>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="col-12 col-lg-5">
              <div className="agri-hero-card">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5">📍</span>
                    <div>
                      <span className="fw-bold d-block text-dark small">{formDistrict}, Nepal</span>
                      <span className="text-muted text-xs">
                        {farmingMethod === 'tunnel' ? '🛡️ Polyhouse Tunnel' : '🌾 Open Field'}
                      </span>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                    ● Telemetry Live
                  </span>
                </div>

                <div className="row g-2 text-center">
                  <div className="col-4">
                    <div className="p-2 bg-light rounded">
                      <span className="text-muted d-block small">Top Window</span>
                      <span className="fw-bold text-success">Mangsir/Poush</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded">
                      <span className="text-muted d-block small">Historical Spike</span>
                      <span className="fw-bold text-primary">+45% Premium</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded">
                      <span className="text-muted d-block small">Mandi Arrivals</span>
                      <span className="fw-bold text-danger">-38% Scarcity</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-success-subtle rounded border border-success-subtle d-flex align-items-center gap-2 small text-success">
                  <i className="bi bi-shield-check fs-5"></i>
                  <span>100% online telemetry. No sensors or IoT hardware required.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN DASHBOARD: 4 SIMPLE SUMMARY CARDS */}
      <section className="py-4">
        <div className="container">
          <div className="row g-3">
            {/* Card 1: Recommended Crops */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="agri-card p-3 h-100">
                <div className="metric-card-inner">
                  <div className="metric-icon-box green">
                    <i className="bi bi-sprout"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-title">
                      {language === 'ne' ? 'सिफारिस बालीहरू' : 'Recommended Crops'}
                    </div>
                    <div className="metric-value">3 High-Value</div>
                    <div className="metric-desc">Tomato, Cucumber, Capsicum</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Market Opportunity */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="agri-card p-3 h-100">
                <div className="metric-card-inner">
                  <div className="metric-icon-box blue">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-title">
                      {language === 'ne' ? 'बजार अवसर' : 'Market Opportunity'}
                    </div>
                    <div className="metric-value">+42% Premium</div>
                    <div className="metric-desc">Dec-Jan Winter Gap Window</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Expected Profit */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="agri-card p-3 h-100">
                <div className="metric-card-inner">
                  <div className="metric-icon-box amber">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-title">
                      {language === 'ne' ? 'अनुमानित नाफा' : 'Expected Profit'}
                    </div>
                    <div className="metric-value">NPR 85k – 115k</div>
                    <div className="metric-desc">Based on 250 m² walk-in tunnel</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Current Risk */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="agri-card p-3 h-100">
                <div className="metric-card-inner">
                  <div className="metric-icon-box rose">
                    <i className="bi bi-shield-exclamation"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-title">
                      {language === 'ne' ? 'वर्तमान जोखिम' : 'Current Risk'}
                    </div>
                    <div className="metric-value">Low – Medium</div>
                    <div className="metric-desc">No frost alert for 10 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "WHAT SHOULD I PLANT NOW?" (CORE FEATURE SECTION) */}
      <section id="recommendation-form" className="py-4">
        <div className="container">
          <div className="card agri-card border-0 shadow-sm p-4 mb-4">
            <div className="row align-items-center mb-3">
              <div className="col-12 col-md-8">
                <h2 className="fs-4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <span className="text-success">🌱</span>
                  <span>{language === 'ne' ? 'अहिले के लगाउने? (बाली सिफारिस)' : 'What Should I Plant Now?'}</span>
                </h2>
                <p className="text-muted small mb-0">
                  {language === 'ne'
                    ? 'आफ्नो फार्म विवरण प्रविष्ट गर्नुहोस् र भविष्यको बजार अन्तर तथा नाफा अनुसार उपयुक्त बाली पाउनुहोस्।'
                    : 'Enter your farm parameters to find crops maturing during peak wholesale market shortage.'}
                </p>
              </div>
              <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                <span className="badge bg-light text-dark border px-2.5 py-1.5 small">
                  Kalimati Mandi Telemetry Active
                </span>
              </div>
            </div>

            {/* Clean Recommendation Form */}
            <form onSubmit={handleGetRecommendation}>
              {/* Planning Date Banner */}
              <div className="p-3 bg-light rounded mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                <div>
                  <span className="text-muted text-xs text-uppercase fw-semibold d-block">
                    {language === 'ne' ? 'योजना मिति (Planning Reference Date):' : 'Planning Reference Date:'}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-success">
                      {plantingDate === '2026-09-26' ? 'September 26, 2026' : plantingDate}
                    </span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 small">
                      {plantingDate === '2026-09-26' ? 'असोज १०, २०८३' : 'नेपाली मिति'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted">
                  <i className="bi bi-info-circle me-1 text-primary"></i>
                  <span>Calculates backward from future off-season market scarcity windows.</span>
                </div>
              </div>

              <div className="row g-3">
                {/* 1. Province */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? '१. प्रदेश (Province)' : '1. Province'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      const firstDistrict = districtsByProvince[e.target.value]?.[0] || 'Kathmandu';
                      setFormDistrict(firstDistrict);
                      setDistrict(firstDistrict);
                    }}
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {language === 'ne' ? p.name_ne : p.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. District */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? '२. जिल्ला (District)' : '2. District'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formDistrict}
                    onChange={(e) => {
                      setFormDistrict(e.target.value);
                      setDistrict(e.target.value);
                    }}
                  >
                    {(districtsByProvince[province] || [formDistrict]).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Municipality */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? '३. नगरपालिका / गाउँपालिका' : '3. Municipality'}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="e.g. Kathmandu Metro"
                  />
                </div>

                {/* 4. Ward */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? 'वडा (ऐच्छिक)' : 'Ward (Optional)'}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. Ward 4"
                  />
                </div>

                {/* 5. Farming Method */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? '४. खेती विधि' : '4. Farming Method'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={method}
                    onChange={(e) => {
                      setMethod(e.target.value);
                      setFarmingMethod(e.target.value);
                    }}
                  >
                    <option value="tunnel">🛡️ Walk-in Polyhouse Tunnel (टनेल)</option>
                    <option value="open_field">🌾 Open Field (खुला खेत)</option>
                  </select>
                </div>

                {/* 6. Available Area */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted d-flex justify-content-between">
                    <span>{language === 'ne' ? '५. उपलब्ध क्षेत्रफल' : '5. Available Area'}</span>
                    <span className="text-success text-xs">≈ {getAreaInSqm()} m²</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className="form-control"
                      value={tunnelSize}
                      onChange={(e) => setTunnelSize(e.target.value)}
                      min="1"
                      step="0.5"
                    />
                    <select
                      className="form-select"
                      style={{ maxWidth: '95px' }}
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value)}
                    >
                      <option value="ropani">Ropani</option>
                      <option value="kattha">Kattha</option>
                      <option value="sqm">m²</option>
                    </select>
                  </div>
                </div>

                {/* 7. Budget */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? '६. उपलब्ध बजेट (NPR)' : '6. Budget (NPR)'}
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50000"
                    step="5000"
                  />
                </div>

                {/* 8. Target Market */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold text-muted">
                    {language === 'ne' ? '७. लक्षित बजार (मण्डी)' : '7. Target Market'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                  >
                    {marketOptions.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Large Green Button */}
              <div className="mt-4 text-center">
                <button
                  type="submit"
                  disabled={recsLoading}
                  className="btn btn-agri btn-lg px-5 py-2.5 fw-bold shadow-sm"
                >
                  {recsLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {language === 'ne' ? 'विश्लेषण हुँदैछ...' : 'Analyzing Opportunities...'}
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-stars me-1.5"></i>
                      {language === 'ne' ? 'उत्कृष्ट बाली सिफारिस हेर्नुहोस्' : 'Calculate Best Crops to Plant Now'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CROP RECOMMENDATION RESULTS: 2-4 Clean Cards */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-5 fw-bold text-dark mb-0">
                {language === 'ne' ? 'शीर्ष सिफारिस गरिएका बालीहरू' : 'Top Recommended Crops to Plant Today'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('what_to_plant')}
                className="btn btn-sm btn-link text-success text-decoration-none fw-semibold"
              >
                <span>{language === 'ne' ? 'पूर्ण सिफारिस पृष्ठ हेर्नुहोस्' : 'Open Full Plant Now Engine'}</span>
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>

            {loading ? (
              <div className="row g-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="col-12 col-md-4">
                    <div className="agri-card p-4 placeholder-glow" style={{ height: '320px' }}>
                      <div className="placeholder col-6 mb-3"></div>
                      <div className="placeholder col-10 mb-2"></div>
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-4 mb-4"></div>
                      <div className="placeholder col-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                {topRecs.map((crop, idx) => (
                  <div key={crop.crop_slug} className="col-12 col-md-4 slide-up">
                    <div className="rec-crop-card">
                      <div>
                        {/* Header */}
                        <div className="rec-crop-header">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-2">{crop.icon_emoji}</span>
                            <div>
                              <div className="d-flex align-items-center gap-1.5">
                                <span className="badge bg-dark text-white rounded-pill px-1.5 py-0.5 text-xs">
                                  #{idx + 1}
                                </span>
                                <h4 className="fs-6 fw-bold mb-0 text-dark">
                                  {language === 'ne' ? crop.name_ne : crop.name_en}
                                </h4>
                              </div>
                              <span className="text-muted text-xs fst-italic">
                                {crop.scientific_name}
                              </span>
                            </div>
                          </div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            {crop.opportunity_label || 'High Value'}
                          </span>
                        </div>

                        {/* Metric Rows */}
                        <div className="py-2">
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'रोप्ने समय:' : 'Planting Window:'}</span>
                            <span className="rec-data-val">Today ({crop.planting_date})</span>
                          </div>
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'फसल समय:' : 'Expected Harvest:'}</span>
                            <span className="rec-data-val text-success fw-bold">{crop.harvest_window_months} ({crop.days_to_first_harvest}–{crop.days_to_first_harvest + 25} days)</span>
                          </div>
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'अनुमानित उत्पादन:' : 'Expected Yield:'}</span>
                            <span className="rec-data-val">{crop.yield_range_str || `${crop.expected_yield_kg.toLocaleString()} kg`}</span>
                          </div>
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'थोक मूल्य दायरा:' : 'Expected Price:'}</span>
                            <span className="rec-data-val text-dark fw-bold">{crop.estimated_price_range}</span>
                          </div>
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'अनुमानित नाफा:' : 'Estimated Net Profit:'}</span>
                            <span className="rec-data-val text-success fw-bold">
                              {crop.net_profit_range_str || `NPR ${crop.scenarios[1]?.estimated_profit_npr.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'ढुवानी तथा मण्डी:' : 'Transport:'}</span>
                            <span className="rec-data-val text-muted">{crop.transport_details?.distance_km || 25} km to {crop.transport_details?.destination_market?.split(',')[0] || 'Kalimati'}</span>
                          </div>
                          <div className="rec-data-row">
                            <span className="rec-data-label">{language === 'ne' ? 'अवसर स्कोर:' : 'Opportunity Score:'}</span>
                            <span className="fw-bold text-success">{crop.overall_opportunity_score.toFixed(0)}/100</span>
                          </div>
                        </div>

                        {/* Why This Crop? */}
                        <div className="p-2.5 bg-light rounded small mt-2 mb-3">
                          <span className="fw-bold text-dark d-block mb-1">
                            {language === 'ne' ? 'किन यो बाली?' : 'Why this crop?'}
                          </span>
                          <p className="text-muted small mb-0">
                            {crop.why_this_crop?.positive_drivers?.[0] ||
                              (language === 'ne'
                                ? `पुष/मंसिरमा खुला खेतको उत्पादन रोकिँदा बजारमा +${crop.market_gap_delta_pct.toFixed(0)}% मूल्य वृद्धि रहने ऐतिहासिक ट्रेन्ड छ।`
                                : `Harvest lands during peak off-season shortage with historical prices +${crop.market_gap_delta_pct.toFixed(0)}% above glut levels.`)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedWhatIfCrop(crop.crop_slug);
                            setActiveTab('what_to_plant');
                          }}
                          className="btn btn-agri w-50 py-2 small fw-bold"
                        >
                          <i className="bi bi-sliders me-1"></i>
                          <span>Simulate</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCropForDetail(crop.crop_slug);
                            setActiveTab('crop_details');
                          }}
                          className="btn btn-outline-agri w-50 py-2 small fw-bold"
                        >
                          <span>{language === 'ne' ? 'विवरण' : 'Details'}</span>
                          <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. MARKET TREND & PRICE CHART SECTION */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="row align-items-center mb-3">
            <div className="col-12 col-md-8">
              <h3 className="fs-5 fw-bold text-dark mb-1">
                {language === 'ne' ? '📈 प्रत्यक्ष बजार दर र ट्रेन्ड' : '📈 Current Market Prices & Trends'}
              </h3>
              <p className="text-muted small mb-0">
                {language === 'ne'
                  ? 'कालीमाटी थोक बजार विकास समितिको प्रत्यक्ष दैनिक दर र मौसमी मूल्य प्रक्षेपण।'
                  : 'Live Kalimati Mandi wholesale spreads and 8-month historical price trajectories.'}
              </p>
            </div>
            <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
              <button
                onClick={() => setActiveTab('market_prices')}
                className="btn btn-sm btn-outline-agri"
              >
                <span>{language === 'ne' ? 'सबै बजार भाउ हेर्नुहोस्' : 'View Full Market'}</span>
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

          <div className="row g-4">
            {/* Market Prices Table */}
            <div className="col-12 col-lg-6">
              <div className="agri-card p-3 h-100">
                <h4 className="fs-6 fw-bold text-dark mb-3">Current Mandi Prices</h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Crop</th>
                        <th>Market</th>
                        <th className="text-end">Avg Price</th>
                        <th className="text-center">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketPrices.map((m) => (
                        <tr key={m.crop_slug}>
                          <td className="fw-bold text-dark">
                            {language === 'ne' ? m.crop_name_ne : m.crop_name}
                          </td>
                          <td className="text-muted small">Kalimati, KTM</td>
                          <td className="text-end fw-bold text-success">
                            NPR {m.avg_price.toFixed(0)}/kg
                          </td>
                          <td className="text-center">
                            {m.trend_7d_pct > 0 ? (
                              <span className="badge-trend-up">↑ +{m.trend_7d_pct.toFixed(0)}%</span>
                            ) : m.trend_7d_pct < 0 ? (
                              <span className="badge-trend-down">↓ {m.trend_7d_pct.toFixed(0)}%</span>
                            ) : (
                              <span className="badge-trend-stable">→ Stable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Price Trend Chart (Recharts) */}
            <div className="col-12 col-lg-6">
              <div className="agri-card p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="fs-6 fw-bold text-dark mb-0">Seasonal Price Trend (NPR/kg)</h4>
                  <span className="text-muted text-xs">Jun - Jan Window</span>
                </div>
                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer>
                    <LineChart data={priceTrendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe4" />
                      <XAxis dataKey="month" stroke="#5c6b60" fontSize={11} />
                      <YAxis stroke="#5c6b60" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #e2ebe4' }} />
                      <Line type="monotone" dataKey="Tomato" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Cucumber" stroke="#52b788" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Capsicum" stroke="#e76f51" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="d-flex justify-content-center gap-3 pt-2 small text-muted">
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: 10, height: 10, backgroundColor: '#2d6a4f', display: 'inline-block', borderRadius: 2 }}></span>
                    Tomato
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: 10, height: 10, backgroundColor: '#52b788', display: 'inline-block', borderRadius: 2 }}></span>
                    Cucumber
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span style={{ width: 10, height: 10, backgroundColor: '#e76f51', display: 'inline-block', borderRadius: 2 }}></span>
                    Capsicum
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FUTURE MARKET OPPORTUNITY PREVIEW */}
      <section className="py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="fs-5 fw-bold text-dark mb-1">
                {language === 'ne' ? '🔎 भविष्यको बजार अवसर (Market Windows)' : '🔎 Future Market Opportunities'}
              </h3>
              <p className="text-muted small mb-0">
                {language === 'ne'
                  ? 'कुन महिनामा कुन तरकारीको अभाव र उच्च मूल्य रहने ऐतिहासिक प्रमाण छ?'
                  : 'Historical periods of lower open-field supply and premium wholesale pricing.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('future_market_windows')}
              className="btn btn-sm btn-outline-agri"
            >
              <span>{language === 'ne' ? '१२ महिने क्यालेन्डर' : '12-Month Calendar'}</span>
              <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>

          <div className="row g-3">
            {marketWindows.map((mw) => (
              <div key={mw.month_index} className="col-12 col-sm-6 col-lg-3">
                <div className="agri-card p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                    <span className="fw-bold text-dark small">{mw.month_name_en}</span>
                    <span className="badge bg-light text-muted small">{mw.bs_month_name}</span>
                  </div>
                  <div className="small space-y-2">
                    {mw.opportunities?.slice(0, 2).map((opp) => (
                      <div key={opp.crop_slug} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold text-dark">
                            {opp.icon_emoji} {opp.name_en}
                          </span>
                          <span className="badge-agri-low">NPR {opp.historical_avg_price.toFixed(0)}</span>
                        </div>
                        <span className="text-muted text-xs d-block">
                          Plant: {opp.required_planting_window}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 SIMPLE STEPS) */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fs-4 fw-bold text-dark mb-1">
              {language === 'ne' ? 'यसले कसरी काम गर्छ?' : 'How It Works'}
            </h3>
            <p className="text-muted small">
              {language === 'ne'
                ? 'चार सरल चरणमा उत्कृष्ट बाली र नाफा योजना बनाउनुहोस्'
                : 'Simple 4-step workflow to maximize your off-season harvest margin.'}
            </p>
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="step-card">
                <div className="step-num-badge">1</div>
                <h5 className="fs-6 fw-bold text-dark mb-1">Enter Farm Info</h5>
                <p className="text-muted small mb-0">
                  Provide your location district, tunnel size in m², and working budget.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="step-card">
                <div className="step-num-badge">2</div>
                <h5 className="fs-6 fw-bold text-dark mb-1">Select Market Date</h5>
                <p className="text-muted small mb-0">
                  Target when you want to sell (e.g. December festive or winter window).
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="step-card">
                <div className="step-num-badge">3</div>
                <h5 className="fs-6 fw-bold text-dark mb-1">AI Analyzes Data</h5>
                <p className="text-muted small mb-0">
                  Cross-references 5-yr Kalimati Mandi trends, GDD duration, and weather risks.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="step-card">
                <div className="step-num-badge">4</div>
                <h5 className="fs-6 fw-bold text-dark mb-1">Get Recommendation</h5>
                <p className="text-muted small mb-0">
                  Receive clear planting dates, expected yield, costs, and profit projections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AGRICULTURAL UPDATES / ALERTS BANNER */}
      <section className="py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fs-5 fw-bold text-dark mb-0">
              <i className="bi bi-bell me-1.5 text-success"></i>
              <span>{language === 'ne' ? 'कृषि सूचना तथा अलर्टहरू' : 'Agricultural Notices & Updates'}</span>
            </h3>
            <button
              onClick={() => setActiveTab('alerts')}
              className="btn btn-sm btn-outline-agri"
            >
              <span>{language === 'ne' ? 'सबै अलर्टहरू' : 'View All Notices'}</span>
              <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>

          <div className="row g-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="col-12 col-md-4">
                <div
                  className={`alert ${
                    alert.severity === 'critical'
                      ? 'alert-danger'
                      : alert.severity === 'warning'
                      ? 'alert-warning'
                      : 'alert-success'
                  } mb-0 p-3 h-100 d-flex flex-column justify-content-between border-0 shadow-sm`}
                >
                  <div>
                    <span className="fw-bold small d-block mb-1">
                      {language === 'ne' ? alert.title_ne : alert.title}
                    </span>
                    <p className="small mb-0 text-muted">
                      {language === 'ne' ? alert.message_ne : alert.message}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-center text-xs">
                    <span>{alert.created_at?.split(' ')[0]}</span>
                    <button
                      onClick={() => {
                        if (alert.action_tab) setActiveTab(alert.action_tab);
                        else setActiveTab('alerts');
                      }}
                      className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
