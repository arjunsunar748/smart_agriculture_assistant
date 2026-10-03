import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function CropDetailView() {
  const { selectedCropForDetail, setSelectedCropForDetail, setActiveTab, language } = useApp();
  const [cropsList, setCropsList] = useState([]);
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTabState] = useState('overview'); // overview, growing, market, profit, risk

  useEffect(() => {
    async function loadCrops() {
      try {
        const list = await api.getCrops();
        setCropsList(list);
        if (!selectedCropForDetail && list.length > 0) {
          setSelectedCropForDetail(list[0].slug);
        }
      } catch (err) {
        console.error('Failed to load crops list:', err);
      }
    }
    loadCrops();
  }, []);

  useEffect(() => {
    async function loadDetail() {
      if (!selectedCropForDetail) return;
      setLoading(true);
      try {
        const detail = await api.getCropDetail(selectedCropForDetail);
        setCrop(detail);
      } catch (err) {
        console.error('Failed to load crop detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [selectedCropForDetail]);

  const seasonalPriceData = [
    { month: 'Bhadra', price: 65 },
    { month: 'Ashoj', price: 80 },
    { month: 'Kartik', price: 95 },
    { month: 'Mangsir', price: 110 },
    { month: 'Poush', price: 125 },
    { month: 'Magh', price: 115 },
    { month: 'Falgun', price: 90 },
    { month: 'Chaitra', price: 75 }
  ];

  return (
    <div className="container py-4 fade-in">
      {/* Top Header & Crop Selector */}
      <div className="card agri-card p-3 mb-4 shadow-sm">
        <div className="row align-items-center g-3">
          <div className="col-12 col-md-7">
            <div className="d-flex align-items-center gap-3">
              <span className="fs-1">{crop?.icon_emoji || '🌱'}</span>
              <div>
                <h1 className="fs-4 fw-bold text-dark mb-0">
                  {crop ? (language === 'ne' ? crop.name_ne : crop.name_en) : 'Crop Analysis'}
                </h1>
                <span className="text-muted small fst-italic">
                  {crop?.scientific_name} • {crop?.category}
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-5 text-md-end">
            <label className="form-label d-block text-muted text-xs mb-1">
              Select Crop to Analyze:
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedCropForDetail || ''}
              onChange={(e) => setSelectedCropForDetail(e.target.value)}
            >
              {cropsList.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon_emoji} {c.name_en} ({c.name_ne})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading || !crop ? (
        <div className="card agri-card p-5 text-center text-muted">
          <div className="spinner-border text-success mx-auto mb-2" role="status"></div>
          <p className="small mb-0">Loading crop agronomic analysis...</p>
        </div>
      ) : (
        <div className="card agri-card shadow-sm overflow-hidden">
          {/* BOOTSTRAP NAV-TABS (Section 9: Overview, Growing Period, Market, Profit, Risk) */}
          <div className="card-header bg-white border-bottom p-0">
            <ul className="nav nav-tabs border-0 px-3 pt-2" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${activeTab === 'overview' ? 'active text-success border-bottom border-success border-2' : ''}`}
                  onClick={() => setActiveTabState('overview')}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${activeTab === 'growing' ? 'active text-success border-bottom border-success border-2' : ''}`}
                  onClick={() => setActiveTabState('growing')}
                >
                  <i className="bi bi-calendar-range me-1"></i>
                  Growing Period
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${activeTab === 'market' ? 'active text-success border-bottom border-success border-2' : ''}`}
                  onClick={() => setActiveTabState('market')}
                >
                  <i className="bi bi-graph-up me-1"></i>
                  Market
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${activeTab === 'profit' ? 'active text-success border-bottom border-success border-2' : ''}`}
                  onClick={() => setActiveTabState('profit')}
                >
                  <i className="bi bi-cash-stack me-1"></i>
                  Profit
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${activeTab === 'risk' ? 'active text-success border-bottom border-success border-2' : ''}`}
                  onClick={() => setActiveTabState('risk')}
                >
                  <i className="bi bi-shield-exclamation me-1"></i>
                  Risk
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="fade-in">
                <div className="row g-4">
                  <div className="col-12 col-md-7">
                    <h5 className="fs-6 fw-bold text-dark mb-2">Agronomic Description</h5>
                    <p className="text-muted small leading-relaxed mb-3">
                      {language === 'ne' ? crop.description_ne : crop.description}
                    </p>

                    <h5 className="fs-6 fw-bold text-dark mb-2">Recommended Varieties (नेपालका लागि जातहरू)</h5>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {crop.varieties?.map((v, i) => (
                        <span key={i} className="badge bg-light text-dark border px-2.5 py-1.5 small">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 col-md-5">
                    <div className="p-3 bg-light rounded">
                      <h6 className="fw-bold text-dark small mb-2 border-bottom pb-1">Quick Suitability Metrics</h6>
                      <div className="d-flex justify-content-between py-1 small">
                        <span className="text-muted">Tunnel Suitability:</span>
                        <span className="fw-bold text-success">{crop.tunnel_suitability}% High</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 small">
                        <span className="text-muted">Expected Yield (m²):</span>
                        <span className="fw-bold">{crop.expected_yield_kg_per_m2} kg/m²</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 small">
                        <span className="text-muted">Base Temperature:</span>
                        <span className="fw-bold">{crop.base_temp_c}°C</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 small">
                        <span className="text-muted">Optimal Temperature:</span>
                        <span className="fw-bold">{crop.optimal_temp_min_c} – {crop.optimal_temp_max_c}°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GROWING PERIOD */}
            {activeTab === 'growing' && (
              <div className="fade-in">
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="p-3 bg-light rounded text-center">
                      <span className="text-muted text-xs d-block">Growing Duration</span>
                      <span className="fs-5 fw-bold text-dark">{crop.growing_days} Days</span>
                      <span className="text-muted text-xs d-block">Nursery to Harvest</span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="p-3 bg-light rounded text-center">
                      <span className="text-muted text-xs d-block">Off-Season Seeding</span>
                      <span className="fs-5 fw-bold text-success">{crop.offseason_planting_months}</span>
                      <span className="text-muted text-xs d-block">Optimal sowing month</span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="p-3 bg-light rounded text-center">
                      <span className="text-muted text-xs d-block">Peak Harvest Window</span>
                      <span className="fs-5 fw-bold text-primary">{crop.offseason_harvest_months}</span>
                      <span className="text-muted text-xs d-block">Target market arrival</span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="p-3 bg-light rounded text-center">
                      <span className="text-muted text-xs d-block">Harvest Duration</span>
                      <span className="fs-5 fw-bold text-dark">{crop.harvest_duration_days} Days</span>
                      <span className="text-muted text-xs d-block">Continuous picking</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-success-subtle rounded border border-success-subtle small">
                  <h6 className="fw-bold text-success mb-1">Tunnel Thermal Advantage</h6>
                  <p className="mb-0 text-success">
                    Passive walk-in polyhouse tunnel adds +4°C to +8°C during winter nocturnal freeze,
                    allowing continuous photosynthesis and preventing flower drop.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: MARKET */}
            {activeTab === 'market' && (
              <div className="fade-in">
                <div className="row g-4 align-items-center">
                  <div className="col-12 col-md-7">
                    <h5 className="fs-6 fw-bold text-dark mb-2">Historical Seasonal Wholesale Price (Kalimati Mandi)</h5>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <BarChart data={seasonalPriceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#edf2ee" />
                          <XAxis dataKey="month" stroke="#5c6b60" fontSize={11} />
                          <YAxis stroke="#5c6b60" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #e2ebe4' }} />
                          <Bar dataKey="price" name="Avg Price (NPR/kg)" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="col-12 col-md-5">
                    <div className="p-3 bg-light rounded small">
                      <h6 className="fw-bold text-dark mb-2">Market Scarcity Dynamics</h6>
                      <ul className="list-unstyled space-y-2 mb-0">
                        <li className="d-flex justify-content-between pb-1 border-bottom">
                          <span className="text-muted">Glut Season Price:</span>
                          <span className="fw-bold text-muted">NPR 40 – 55/kg</span>
                        </li>
                        <li className="d-flex justify-content-between pb-1 border-bottom">
                          <span className="text-muted">Off-Season Window Price:</span>
                          <span className="fw-bold text-success">NPR 95 – 125/kg</span>
                        </li>
                        <li className="d-flex justify-content-between pb-1 border-bottom">
                          <span className="text-muted">Wholesale Scarcity Delta:</span>
                          <span className="fw-bold text-success">+65% Price Advantage</span>
                        </li>
                        <li className="d-flex justify-content-between pt-1">
                          <span className="text-muted">Primary Destination:</span>
                          <span className="fw-bold text-dark">Kalimati Wholesale, KTM</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROFIT */}
            {activeTab === 'profit' && (
              <div className="fade-in">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded">
                      <span className="text-muted text-xs d-block">Production Cost</span>
                      <span className="fs-5 fw-bold text-dark">NPR {crop.cost_per_m2_npr} / m²</span>
                      <span className="text-muted text-xs d-block">Seeds, Mulch, Labor, Fertilizer</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded">
                      <span className="text-muted text-xs d-block">Estimated Net Revenue (250m²)</span>
                      <span className="fs-5 fw-bold text-success">NPR 145,000</span>
                      <span className="text-muted text-xs d-block">At conservative NPR 85/kg</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded">
                      <span className="text-muted text-xs d-block">Estimated Net Profit</span>
                      <span className="fs-5 fw-bold text-success">NPR 85,000 – 110,000</span>
                      <span className="text-muted text-xs d-block">ROI: ~140%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-end">
                  <button
                    onClick={() => setActiveTab('profit_calculator')}
                    className="btn btn-sm btn-agri"
                  >
                    Open Interactive Profit Calculator →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: RISK */}
            {activeTab === 'risk' && (
              <div className="fade-in">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded">
                      <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-1.5">
                        <i className="bi bi-snow text-primary"></i>
                        <span>Cold / Frost Tolerance</span>
                      </h6>
                      <p className="text-muted small mb-0">
                        {crop.base_temp_c < 10
                          ? 'Moderate cold tolerance. Requires polyhouse closure during cold waves in Poush and Magh.'
                          : 'Sensitive to nocturnal frost. Strict polyhouse thermal trapping required.'}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded">
                      <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-1.5">
                        <i className="bi bi-bug text-danger"></i>
                        <span>Common Disease & Pest Threat</span>
                      </h6>
                      <p className="text-muted small mb-0">
                        Early/Late blight during humidity &gt; 85%. Whitefly and red spider mites during sunny tunnel intervals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
