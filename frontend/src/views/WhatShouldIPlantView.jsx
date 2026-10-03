import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function WhatShouldIPlantView() {
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

  // Core Form State
  const [province, setProvince] = useState('Bagmati');
  const [formDistrict, setFormDistrict] = useState(district || 'Kathmandu');
  const [municipality, setMunicipality] = useState('Kathmandu Metropolitan City');
  const [ward, setWard] = useState('Ward 4');
  const [method, setMethod] = useState(farmingMethod || 'tunnel');
  const [areaValue, setAreaValue] = useState(250);
  const [areaUnit, setAreaUnit] = useState('sqm'); // 'ropani', 'kattha', 'sqm'
  const [budget, setBudget] = useState(50000);
  const [targetMarket, setTargetMarket] = useState('wholesale_kalimati');
  const [plantingDate, setPlantingDate] = useState('2026-09-26');
  const [isSimulatingDate, setIsSimulatingDate] = useState(false);
  const [preferredCategory, setPreferredCategory] = useState('');

  // Results & UI State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedWhyCrop, setExpandedWhyCrop] = useState({});
  const [activeAnalysisModal, setActiveAnalysisModal] = useState(null);

  // What-If Simulator Quick Drawer State
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simCrop, setSimCrop] = useState(null);
  const [simPriceChange, setSimPriceChange] = useState(0);
  const [simYieldChange, setSimYieldChange] = useState(0);
  const [simCostChange, setSimCostChange] = useState(0);
  const [simLossPct, setSimLossPct] = useState(6);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

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
    Bagmati: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Nuwakot', 'Chitwan', 'Makwanpur', 'Sindhupalchok'],
    Gandaki: ['Kaski', 'Tanahun', 'Gorkha', 'Syangja', 'Nawalpur', 'Lamjung', 'Palpa'],
    Koshi: ['Morang', 'Sunsari', 'Jhapa', 'Ilam', 'Dhankuta'],
    Lumbini: ['Rupandehi', 'Kapilvastu', 'Dang', 'Banke', 'Bardiya'],
    Madhesh: ['Parsa', 'Bara', 'Dhanusha', 'Sarlahi', 'Siraha'],
    Karnali: ['Surkhet', 'Dailekh', 'Jumla', 'Salyan'],
    Sudurpashchim: ['Kailali', 'Kanchanpur', 'Dadeldhura', 'Doti']
  };

  const marketsList = [
    { id: 'wholesale_kalimati', name_en: 'Kalimati Wholesale Market, Kathmandu', name_ne: 'कालीमाटी फलफूल तथा तरकारी बजार, काठमाडौं' },
    { id: 'pokhara_mandi', name_en: 'Pokhara Agriculture Wholesale Mandi, Kaski', name_ne: 'पोखरा कृषि थोक बजार, कास्की' },
    { id: 'narayangarh_mandi', name_en: 'Narayangarh Wholesale Market, Chitwan', name_ne: 'नारायणगढ थोक मण्डी, चितवन' },
    { id: 'birtamode_hub', name_en: 'Birtamode Agriculture Hub, Jhapa', name_ne: 'बिर्तामोड कृषि केन्द्र, झापा' },
    { id: 'local_haat', name_en: 'Local Haat Bazaar / Nearby Regional Mandi', name_ne: 'स्थानीय हाट बजार / नजिकको क्षेत्रीय मण्डी' }
  ];

  // Convert area to square meters
  const getAreaInSqm = () => {
    const val = parseFloat(areaValue) || 250;
    if (areaUnit === 'ropani') return Math.round(val * 508.72);
    if (areaUnit === 'kattha') return Math.round(val * 338.63);
    return Math.round(val);
  };

  const formatNepaliDate = (isoStr) => {
    // September 26, 2026 -> असोज १०, २०८३
    if (!isoStr) return 'असोज १०, २०८३';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const bsYear = 2083;
      const nepaliMonths = [
        'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
        'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
      ];
      // Approx BS offset mapping for 2026
      const bsMonthIndex = (month + 2) % 12; // Sept is Ashoj (index 5)
      const bsDay = Math.min(30, (day + 14) % 31 + 1);
      return `${nepaliMonths[bsMonthIndex]} ${bsDay}, ${bsYear}`;
    }
    return 'असोज १०, २०८३';
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const areaSqm = getAreaInSqm();
      const res = await api.getForwardPlan({
        planting_date: plantingDate,
        province,
        district: formDistrict,
        municipality,
        ward,
        farming_method: method,
        tunnel_area_sqm: areaSqm,
        area_unit: areaUnit,
        budget_npr: parseFloat(budget) || 50000,
        preferred_category: preferredCategory || null,
        target_market: targetMarket,
        language
      });
      setResult(res);
      setDistrict(formDistrict);
      setFarmingMethod(method);
    } catch (err) {
      console.error('Failed to get plant recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyze();
  }, [formDistrict, method, areaUnit, preferredCategory, language]);

  // Open simulator drawer for a specific crop
  const openSimulator = (crop) => {
    setSimCrop(crop);
    setSimPriceChange(0);
    setSimYieldChange(0);
    setSimCostChange(0);
    setSimLossPct(crop.post_harvest_loss_pct || 6);
    setSimulatorOpen(true);
    triggerSim(crop, 0, 0, 0, crop.post_harvest_loss_pct || 6);
  };

  const triggerSim = async (crop, pChg, yChg, cChg, lPct) => {
    setSimLoading(true);
    try {
      const res = await api.simulateWhatIf({
        crop_slug: crop.crop_slug,
        tunnel_area_sqm: getAreaInSqm(),
        planting_date: plantingDate,
        price_change_pct: pChg,
        yield_change_pct: yChg,
        cost_change_pct: cChg,
        post_harvest_loss_pct: lPct,
        language
      });
      setSimResult(res);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimLoading(false);
    }
  };

  const toggleWhyCrop = (slug) => {
    setExpandedWhyCrop((prev) => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  return (
    <div className="container py-4 fade-in">
      {/* 1. Header with Automatic Today Date */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fs-3">🌱</span>
              <h1 className="fs-4 fw-bold text-dark mb-0">
                {language === 'ne' ? 'आज के रोप्ने? (भविष्यको बजारमा आधारित योजना)' : 'What Should I Plant Today?'}
              </h1>
            </div>
            <p className="text-muted small mb-0">
              {language === 'ne'
                ? 'आजको मिति, स्थान, प्रविधि र बजेटका आधारमा भविष्यको उच्च बजार अवसर छोप्न उपयुक्त तरकारी बाली पत्ता लगाउनुहोस्।'
                : 'Determine what to plant today so you can harvest during high-value future market windows with optimal risk-adjusted profit.'}
            </p>
          </div>

          {/* Today's Date Banner */}
          <div className="bg-light border rounded px-3 py-2 text-md-end">
            <span className="text-muted text-xs text-uppercase fw-semibold d-block">
              {language === 'ne' ? 'योजना मिति (Planning Date)' : 'Planning Reference Date'}
            </span>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-success">
                {plantingDate === '2026-09-26' ? 'September 26, 2026' : plantingDate}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 small">
                {formatNepaliDate(plantingDate)}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none p-0 text-xs text-muted mt-1"
              onClick={() => setIsSimulatingDate(!isSimulatingDate)}
            >
              <i className="bi bi-calendar-event me-1"></i>
              {isSimulatingDate
                ? (language === 'ne' ? 'आजको मितिमा फर्कनुहोस्' : 'Reset to Today')
                : (language === 'ne' ? 'अर्को मिति सिमुलेट गर्नुहोस्' : 'Simulate different date')}
            </button>
          </div>
        </div>

        {/* Optional Date Simulation Picker */}
        {isSimulatingDate && (
          <div className="mt-3 pt-3 border-top d-flex align-items-center gap-3">
            <span className="small text-muted fw-semibold">
              {language === 'ne' ? 'रोप्ने मिति छान्नुहोस्:' : 'Select Planting Date:'}
            </span>
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ maxWidth: '200px' }}
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />
            <span className="small text-success">
              Nepali: {formatNepaliDate(plantingDate)}
            </span>
          </div>
        )}
      </div>

      {/* 2. Simple "Plan Your Crop" Form */}
      <div className="card agri-card p-4 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
          <h2 className="fs-5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-sliders text-success"></i>
            <span>{language === 'ne' ? 'बाली योजना फारम' : 'Plan Your Crop'}</span>
          </h2>
          <span className="text-muted text-xs">
            {language === 'ne' ? 'कुनै जटिल फारम छैन • सिधा सिफारिस' : 'No complex setup • Instant market matching'}
          </span>
        </div>

        <form onSubmit={handleAnalyze}>
          <div className="row g-3">
            {/* Location: Province */}
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

            {/* Location: District */}
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

            {/* Location: Municipality & Ward */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-muted">
                {language === 'ne' ? '३. नगरपालिका / गाउँपालिका' : '3. Municipality'}
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="e.g. Kathmandu Metro / Banepa"
              />
            </div>

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

            {/* Farming Method */}
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

            {/* Available Area */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-muted d-flex justify-content-between">
                <span>{language === 'ne' ? '५. उपलब्ध क्षेत्रफल' : '5. Available Area'}</span>
                <span className="text-success text-xs">≈ {getAreaInSqm()} m²</span>
              </label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  value={areaValue}
                  onChange={(e) => setAreaValue(e.target.value)}
                  min="1"
                  step="0.5"
                />
                <select
                  className="form-select"
                  style={{ maxWidth: '100px' }}
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                >
                  <option value="ropani">Ropani</option>
                  <option value="kattha">Kattha</option>
                  <option value="sqm">m²</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-muted">
                {language === 'ne' ? '६. उपलब्ध बजेट (NPR)' : '6. Budget (NPR)'}
              </label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                step="5000"
                min="5000"
              />
            </div>

            {/* Optional Target Market */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-muted">
                {language === 'ne' ? '७. लक्षित बजार (मण्डी)' : '7. Target Market'}
              </label>
              <select
                className="form-select form-select-sm"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
              >
                {marketsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {language === 'ne' ? m.name_ne : m.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick budget pills and Action Button */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3 pt-3 border-top">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted text-xs">Quick Budget:</span>
              {[25000, 50000, 100000, 200000].map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`btn btn-xs ${budget === b ? 'btn-agri' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  onClick={() => setBudget(b)}
                >
                  NPR {b / 1000}k
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-agri px-4 py-2 fw-bold d-flex align-items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>{language === 'ne' ? 'विश्लेषण हुँदैछ...' : 'Analyzing Future Windows...'}</span>
                </>
              ) : (
                <>
                  <i className="bi bi-stars"></i>
                  <span>{language === 'ne' ? 'उत्कृष्ट बाली सिफारिस हेर्नुहोस्' : 'Calculate Best Crops to Plant Now'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Rationale Box */}
      {result && (
        <div className="alert alert-success d-flex align-items-center justify-content-between py-2.5 px-3 mb-4 small rounded shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill text-success fs-5"></i>
            <span>{language === 'ne' ? result.summary_ne : result.summary_en}</span>
          </div>
          <span className="badge bg-success text-white px-2 py-1 text-xs">
            {result.recommendations?.length || 0} Crops Evaluated
          </span>
        </div>
      )}

      {/* 3. CORE RECOMMENDATION CARDS: Side-by-side or stacked top crops */}
      <div className="row g-4 mb-4">
        {result?.recommendations?.slice(0, 4).map((crop, idx) => (
          <div key={crop.crop_slug} className="col-12 col-xl-6 slide-up">
            <div className="card agri-card h-100 shadow-sm border-0 p-4 position-relative">
              {/* Top Badge: Rank & Opportunity */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-dark text-white rounded-pill px-2.5 py-1 text-xs fw-bold">
                    #{idx + 1} {language === 'ne' ? 'सिफारिस' : 'Recommended'}
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 text-xs fw-semibold">
                    {crop.opportunity_label} ({crop.overall_opportunity_score.toFixed(0)}/100)
                  </span>
                </div>
                <span className="badge bg-light text-muted border text-xs">
                  {crop.category}
                </span>
              </div>

              {/* Crop Header */}
              <div className="d-flex align-items-center gap-3 mb-3 pb-2 border-bottom">
                <span className="fs-1">{crop.icon_emoji}</span>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-baseline gap-2">
                    <h3 className="fs-5 fw-bold text-dark mb-0">
                      {crop.name_en}
                    </h3>
                    <span className="fs-6 text-success fw-bold">
                      ({crop.name_ne})
                    </span>
                  </div>
                  <span className="text-muted text-xs fst-italic">
                    {crop.scientific_name} • Duration: {crop.days_to_first_harvest}–{crop.days_to_first_harvest + 25} days
                  </span>
                </div>
              </div>

              {/* Core Output Metrics Grid (Sections 5, 10, 11, 12) */}
              <div className="row g-2 mb-3">
                {/* Harvest Window */}
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded text-center h-100">
                    <span className="text-muted text-xs d-block mb-1">
                      {language === 'ne' ? 'फसल समय' : 'Harvest Window'}
                    </span>
                    <span className="fw-bold text-dark small d-block">
                      {crop.harvest_window_months}
                    </span>
                    <span className="text-muted text-xs">
                      {crop.expected_harvest_start.split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Expected Yield */}
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded text-center h-100">
                    <span className="text-muted text-xs d-block mb-1">
                      {language === 'ne' ? 'अनुमानित उत्पादन' : 'Expected Yield'}
                    </span>
                    <span className="fw-bold text-success small d-block">
                      {crop.yield_range_str || `${crop.expected_yield_kg.toLocaleString()} kg`}
                    </span>
                    <span className="text-muted text-xs">
                      -{crop.post_harvest_loss_pct}% loss
                    </span>
                  </div>
                </div>

                {/* Expected Price Range */}
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded text-center h-100">
                    <span className="text-muted text-xs d-block mb-1">
                      {language === 'ne' ? 'थोक मूल्य दायरा' : 'Expected Price'}
                    </span>
                    <span className="fw-bold text-dark small d-block">
                      {crop.estimated_price_range}
                    </span>
                    <span className="text-success text-xs fw-semibold">
                      +{crop.market_gap_delta_pct.toFixed(0)}% Scarcity
                    </span>
                  </div>
                </div>

                {/* Net Profit Range */}
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-success-subtle rounded text-center h-100 border border-success-subtle">
                    <span className="text-success-emphasis text-xs d-block mb-1 fw-semibold">
                      {language === 'ne' ? 'खुद नाफा' : 'Net Profit'}
                    </span>
                    <span className="fw-bold text-success small d-block">
                      {crop.net_profit_range_str || `NPR ${crop.net_profit_npr.toLocaleString()}`}
                    </span>
                    <span className="text-success text-xs">
                      ROI: ~{crop.net_roi_pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Year Historical Harvest Price Trajectory Chart (Section 7) */}
              <div className="p-3 bg-light rounded mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-xs fw-bold text-dark">
                    <i className="bi bi-clock-history me-1 text-success"></i>
                    {language === 'ne'
                      ? `५-वर्षे ऐतिहासिक फसल मूल्य प्रवृत्ति (${crop.harvest_window_months})`
                      : `5-Year Historical Wholesale Price During ${crop.harvest_window_months}`}
                  </span>
                  <span className="text-muted text-xs">
                    5-Yr Avg: NPR {crop.historical_price_stats?.five_year_avg || crop.historical_harvest_price_avg}/kg
                  </span>
                </div>
                <div style={{ height: 130, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={crop.historical_harvest_prices || [
                        { year: '2021', avg_price: crop.historical_harvest_price_avg * 0.82 },
                        { year: '2022', avg_price: crop.historical_harvest_price_avg * 0.88 },
                        { year: '2023', avg_price: crop.historical_harvest_price_avg * 0.95 },
                        { year: '2024', avg_price: crop.historical_harvest_price_avg * 1.03 },
                        { year: '2025', avg_price: crop.historical_harvest_price_avg * 1.08 }
                      ]}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip
                        formatter={(val) => [`NPR ${val}/kg`, 'Mandi Price']}
                        labelFormatter={(lbl) => `Year: ${lbl}`}
                        contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avg_price"
                        stroke="#2d6a4f"
                        fill="#d8f3dc"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1 text-xs text-muted">
                  <span>
                    Current Mandi: <strong>NPR {crop.current_mandi_price}/kg</strong> ({crop.current_market_trend_details?.trend_arrow || '↑'} {crop.current_market_trend_details?.trend_direction || 'Increasing'})
                  </span>
                  <span>
                    Scarcity Index: <strong>{crop.supply_arrival_status?.split('(')[0] || 'High'}</strong>
                  </span>
                </div>
              </div>

              {/* Opportunity Score Breakdown (Section 17) */}
              <div className="mb-3">
                <span className="text-xs fw-bold text-dark d-block mb-1.5">
                  <i className="bi bi-pie-chart me-1 text-primary"></i>
                  {language === 'ne' ? 'अवसर स्कोर विश्लेषण (Opportunity Score Breakdown)' : 'Opportunity Score Breakdown'}
                </span>
                <div className="row g-1 text-xs">
                  {crop.score_breakdown ? (
                    Object.entries(crop.score_breakdown).map(([key, val]) => (
                      <div key={key} className="col-6 col-md-4">
                        <div className="d-flex justify-content-between text-muted mb-0.5">
                          <span>{val.label}:</span>
                          <span className="fw-semibold text-dark">{val.score.toFixed(0)}</span>
                        </div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className={`progress-bar ${val.score >= 80 ? 'bg-success' : 'bg-warning'}`}
                            role="progressbar"
                            style={{ width: `${Math.min(100, val.score)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-muted">Scoring: Market (30%), Timing (20%), Method (15%), Profit (15%), Weather (10%), Risk (10%)</div>
                  )}
                </div>
              </div>

              {/* Transportation & Logistics Summary (Section 12) */}
              <div className="p-2.5 bg-light rounded text-xs text-muted mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <i className="bi bi-truck me-1 text-secondary"></i>
                  <span>Transport: </span>
                  <strong className="text-dark">
                    {crop.transport_details?.distance_km || 25} km
                  </strong>
                  <span> to {crop.transport_details?.destination_market?.split(',')[0] || 'Kalimati Mandi'}</span>
                </div>
                <div>
                  <span>Freight: </span>
                  <strong className="text-dark">NPR {crop.transport_details?.total_transport_cost_npr?.toLocaleString() || crop.transportation_cost_npr?.toLocaleString()}</strong>
                  <span> (NPR {crop.transport_details?.transport_cost_per_kg || 3.5}/kg)</span>
                </div>
              </div>

              {/* "Why This Crop?" Accordion / Expandable Box (Section 15) */}
              <div className="border rounded p-2.5 mb-3 bg-white">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleWhyCrop(crop.crop_slug)}
                >
                  <span className="fw-bold text-dark text-xs d-flex align-items-center gap-1">
                    <i className="bi bi-lightbulb text-warning"></i>
                    <span>{language === 'ne' ? 'किन यो बाली रोज्ने? (Why This Crop?)' : 'Why This Crop? Full Explanation'}</span>
                  </span>
                  <i className={`bi ${expandedWhyCrop[crop.crop_slug] ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted small`}></i>
                </div>

                {expandedWhyCrop[crop.crop_slug] && (
                  <div className="mt-2 pt-2 border-top text-xs space-y-2">
                    <div>
                      <strong className="text-success d-block mb-1">
                        <i className="bi bi-check-circle me-1"></i>
                        {language === 'ne' ? 'सकारात्मक पक्षहरू (Positive Drivers):' : 'Positive Market Drivers:'}
                      </strong>
                      <ul className="ps-3 mb-1 text-muted">
                        {(crop.why_this_crop?.positive_drivers || crop.why_recommended)?.map((w, i) => (
                          <li key={i} className="mb-0.5">{w}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong className="text-danger d-block mb-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {language === 'ne' ? 'मुख्य जोखिम र सावधानी (Key Risks & Cautions):' : 'Key Risks & Precautions:'}
                      </strong>
                      <ul className="ps-3 mb-1 text-muted">
                        {(crop.why_this_crop?.risks || crop.risks)?.map((r, i) => (
                          <li key={i} className="mb-0.5">{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1 text-muted fst-italic">
                      <span>Data Sources: Kalimati Mandi 5-Yr Records • Open-Meteo Telemetry • NARC Phenology</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="d-flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => openSimulator(crop)}
                  className="btn btn-agri w-50 py-2 text-xs fw-bold d-flex align-items-center justify-content-center gap-1"
                >
                  <i className="bi bi-sliders"></i>
                  <span>{language === 'ne' ? 'सिमुलेटर चलाउनुहोस्' : 'Simulate What-If'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisModal(crop)}
                  className="btn btn-outline-agri w-50 py-2 text-xs fw-bold d-flex align-items-center justify-content-center gap-1"
                >
                  <i className="bi bi-bar-chart"></i>
                  <span>{language === 'ne' ? 'पूर्ण विवरण हेर्नुहोस्' : 'View Full Details'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. WHAT-IF INTERACTIVE SENSITIVITY MODAL (Section 18) */}
      {simulatorOpen && simCrop && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content agri-card border-0 shadow">
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">{simCrop.icon_emoji}</span>
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-dark">
                      What-If Sensitivity Simulator: {simCrop.name_en} ({simCrop.name_ne})
                    </h5>
                    <span className="text-muted text-xs">
                      Area: {getAreaInSqm()} m² • Method: {method.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSimulatorOpen(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-muted text-xs mb-3">
                  Adjust market price drops, yield fluctuations, or transport losses to inspect how resilient your profits will be under adverse conditions.
                </p>

                <div className="row g-4">
                  {/* Sliders Column */}
                  <div className="col-12 col-md-6 border-end-md">
                    {/* Price Slider */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">Price Change (%):</span>
                        <span className={`fw-bold ${simPriceChange < 0 ? 'text-danger' : 'text-success'}`}>
                          {simPriceChange > 0 ? `+${simPriceChange}` : simPriceChange}%
                        </span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="-30"
                        max="30"
                        step="5"
                        value={simPriceChange}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSimPriceChange(val);
                          triggerSim(simCrop, val, simYieldChange, simCostChange, simLossPct);
                        }}
                      />
                      <div className="d-flex justify-content-between text-xs text-muted">
                        <span>-30% (Glut Crash)</span>
                        <span>0% (Avg)</span>
                        <span>+30% (Scarcity)</span>
                      </div>
                    </div>

                    {/* Yield Slider */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">Yield Change (%):</span>
                        <span className={`fw-bold ${simYieldChange < 0 ? 'text-danger' : 'text-success'}`}>
                          {simYieldChange > 0 ? `+${simYieldChange}` : simYieldChange}%
                        </span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="-30"
                        max="30"
                        step="5"
                        value={simYieldChange}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSimYieldChange(val);
                          triggerSim(simCrop, simPriceChange, val, simCostChange, simLossPct);
                        }}
                      />
                      <div className="d-flex justify-content-between text-xs text-muted">
                        <span>-30% (Disease/Frost)</span>
                        <span>0% (Normal)</span>
                        <span>+30% (Optimum)</span>
                      </div>
                    </div>

                    {/* Cost Slider */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">Cost Variation (%):</span>
                        <span className={`fw-bold ${simCostChange > 0 ? 'text-danger' : 'text-success'}`}>
                          {simCostChange > 0 ? `+${simCostChange}` : simCostChange}%
                        </span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="-20"
                        max="30"
                        step="5"
                        value={simCostChange}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSimCostChange(val);
                          triggerSim(simCrop, simPriceChange, simYieldChange, val, simLossPct);
                        }}
                      />
                    </div>

                    {/* Transit Loss Slider */}
                    <div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">Post-Harvest Transit Loss:</span>
                        <span className="fw-bold text-dark">{simLossPct}%</span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="2"
                        max="20"
                        step="1"
                        value={simLossPct}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSimLossPct(val);
                          triggerSim(simCrop, simPriceChange, simYieldChange, simCostChange, val);
                        }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Simulation Result Column */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                      Simulated Outcomes
                    </h6>
                    {simLoading ? (
                      <div className="text-center py-4">
                        <span className="spinner-border spinner-border-sm text-success" role="status"></span>
                        <p className="text-muted text-xs mt-2">Recalculating cash flows...</p>
                      </div>
                    ) : simResult ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-light rounded">
                          <span className="text-muted text-xs d-block mb-1">Simulated Net Profit:</span>
                          <span className={`fs-4 fw-bold ${(simResult.simulated_profit_npr ?? simResult.simulated_net_profit_npr ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                            NPR {(simResult.simulated_profit_npr ?? simResult.simulated_net_profit_npr ?? 0).toLocaleString()}
                          </span>
                          <span className="text-muted text-xs d-block mt-0.5">
                            Simulated ROI: {(simResult.simulated_roi_pct ?? 0).toFixed(1)}%
                          </span>
                        </div>

                        <div className="row g-2 text-xs">
                          <div className="col-6">
                            <div className="p-2 border rounded">
                              <span className="text-muted d-block">Break-Even Price:</span>
                              <strong className="text-dark">NPR {simResult.break_even_price_per_kg?.toFixed(1)}/kg</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 border rounded">
                              <span className="text-muted d-block">Break-Even Yield:</span>
                              <strong className="text-dark">{simResult.break_even_yield_kg?.toFixed(0)} kg</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 border rounded">
                              <span className="text-muted d-block">Simulated Revenue:</span>
                              <strong className="text-dark">NPR {(simResult.simulated_revenue_npr ?? 0).toLocaleString()}</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 border rounded">
                              <span className="text-muted d-block">Total Expenditure:</span>
                              <strong className="text-dark">NPR {(simResult.simulated_cost_npr ?? simResult.total_expenditure_npr ?? 0).toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-success-subtle rounded text-xs text-success-emphasis border border-success-subtle">
                          <strong>Stress Test Status: </strong>
                          {(simResult.simulated_profit_npr ?? simResult.simulated_net_profit_npr ?? 0) > 0
                            ? 'Profitable even with specified stress adjustments!'
                            : 'Caution: Project falls into loss at these severe price/yield levels.'}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSimulatorOpen(false)}
                >
                  Close Simulator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FULL DETAIL MODAL */}
      {activeAnalysisModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content agri-card border-0 shadow">
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">{activeAnalysisModal.icon_emoji}</span>
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-dark">
                      {activeAnalysisModal.name_en} ({activeAnalysisModal.name_ne})
                    </h5>
                    <span className="text-muted text-xs fst-italic">
                      {activeAnalysisModal.scientific_name} • {activeAnalysisModal.category}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveAnalysisModal(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-dark border-bottom pb-1 small">Agronomic Lifecycle & Microclimate</h6>
                    <ul className="list-unstyled small text-muted space-y-1 mb-3">
                      <li><strong>Planting Date:</strong> {activeAnalysisModal.planting_date}</li>
                      <li><strong>Expected Harvest:</strong> {activeAnalysisModal.expected_harvest_start} to {activeAnalysisModal.expected_harvest_end}</li>
                      <li><strong>Tunnel Suitability:</strong> {activeAnalysisModal.tunnel_suitability_pct}% ({activeAnalysisModal.tunnel_suitability_reason})</li>
                      <li><strong>Weather Summary:</strong> {activeAnalysisModal.harvest_time_weather_summary}</li>
                    </ul>

                    <h6 className="fw-bold text-dark border-bottom pb-1 small">Logistics & Post-Harvest</h6>
                    <ul className="list-unstyled small text-muted space-y-1 mb-0">
                      <li><strong>Market Destination:</strong> {activeAnalysisModal.transport_details?.destination_market}</li>
                      <li><strong>Distance:</strong> {activeAnalysisModal.transport_details?.distance_km} km</li>
                      <li><strong>Freight Cost:</strong> NPR {activeAnalysisModal.transport_details?.total_transport_cost_npr?.toLocaleString()}</li>
                      <li><strong>Transit Loss Allowance:</strong> {activeAnalysisModal.post_harvest_loss_pct}%</li>
                    </ul>
                  </div>

                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-dark border-bottom pb-1 small">3 Economics Scenarios</h6>
                    <div className="table-responsive small">
                      <table className="table table-sm table-bordered mb-0">
                        <thead className="table-light text-xs">
                          <tr>
                            <th>Scenario</th>
                            <th>Price</th>
                            <th>Net Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeAnalysisModal.scenarios?.map((s, idx) => (
                            <tr key={idx}>
                              <td>{s.scenario_name.split('(')[0]}</td>
                              <td>NPR {s.expected_price_per_kg}/kg</td>
                              <td className="fw-bold text-success">NPR {s.estimated_profit_npr.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-light rounded mt-3 text-xs">
                      <strong>Break-Even Benchmark:</strong>
                      <div className="text-muted mt-1">
                        Break-even Price: NPR {activeAnalysisModal.break_even_price_per_kg}/kg
                        <br />
                        Break-even Yield: {activeAnalysisModal.break_even_yield_kg} kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveAnalysisModal(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-agri btn-sm"
                  onClick={() => {
                    setSelectedCropForDetail(activeAnalysisModal.crop_slug);
                    setActiveAnalysisModal(null);
                    setActiveTab('crop_details');
                  }}
                >
                  Go to Full Crop Encyclopedia →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
