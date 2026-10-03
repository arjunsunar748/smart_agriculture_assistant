import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function ProfitCalculatorView() {
  const { selectedCropForDetail, setSelectedCropForDetail, farmingMethod, language } = useApp();
  const [cropsList, setCropsList] = useState([]);

  // Inputs
  const [tunnelSize, setTunnelSize] = useState(250);
  const [cropSlug, setCropSlug] = useState(selectedCropForDetail || 'tomato');
  const [expectedYield, setExpectedYield] = useState(2200);
  const [sellingPrice, setSellingPrice] = useState(95);
  const [productionCost, setProductionCost] = useState(48000);
  const [transportCost, setTransportCost] = useState(3500);
  const [postHarvestLoss, setPostHarvestLoss] = useState(8); // 8%

  // Scenario Tab: 'conservative', 'normal', 'high_opportunity'
  const [scenarioTab, setScenarioTab] = useState('normal');

  useEffect(() => {
    async function loadCrops() {
      try {
        const list = await api.getCrops();
        setCropsList(list);
      } catch (err) {
        console.error('Failed to load crops list:', err);
      }
    }
    loadCrops();
  }, []);

  // Update defaults when crop changes
  useEffect(() => {
    if (cropSlug === 'tomato') {
      setExpectedYield(2200);
      setSellingPrice(95);
      setProductionCost(48000);
      setTransportCost(3500);
    } else if (cropSlug === 'cucumber') {
      setExpectedYield(2800);
      setSellingPrice(80);
      setProductionCost(42000);
      setTransportCost(3800);
    } else if (cropSlug === 'capsicum') {
      setExpectedYield(1600);
      setSellingPrice(130);
      setProductionCost(52000);
      setTransportCost(3000);
    }
  }, [cropSlug]);

  // Scenario Multipliers
  let priceMultiplier = 1.0;
  let yieldMultiplier = 1.0;
  let lossAdj = parseFloat(postHarvestLoss) || 8;

  if (scenarioTab === 'conservative') {
    priceMultiplier = 0.85; // -15%
    yieldMultiplier = 0.90; // -10%
    lossAdj = lossAdj + 4; // +4% loss
  } else if (scenarioTab === 'high_opportunity') {
    priceMultiplier = 1.25; // +25%
    yieldMultiplier = 1.05; // +5%
    lossAdj = Math.max(3, lossAdj - 2); // lower loss
  }

  const effectivePrice = (parseFloat(sellingPrice) || 95) * priceMultiplier;
  const effectiveGrossYield = (parseFloat(expectedYield) || 2200) * yieldMultiplier;
  const marketableYield = effectiveGrossYield * (1 - lossAdj / 100.0);

  const totalCost = (parseFloat(productionCost) || 48000) + (parseFloat(transportCost) || 3500);
  const expectedRevenue = marketableYield * effectivePrice;
  const netProfit = expectedRevenue - totalCost;

  const breakEvenPrice = marketableYield > 0 ? totalCost / marketableYield : 0;
  const breakEvenYield = effectivePrice > 0 ? totalCost / effectivePrice : 0;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  return (
    <div className="container py-4 fade-in">
      {/* Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fs-3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span className="text-success">💰</span>
            <span>{language === 'ne' ? 'नाफा तथा लागत क्याल्कुलेटर' : 'Crop Profit & Economics Calculator'}</span>
          </h1>
          <p className="text-muted small mb-0">
            {language === 'ne'
              ? 'टनेल क्षेत्रफल, उत्पादन, थोक मूल्य, ढुवानी र फसल नोक्सानी हिसाब गरी शुद्ध नाफा पत्ता लगाउनुहोस्।'
              : 'Interactive farm economics: calculate revenue, total cost, net profit, and break-even thresholds.'}
          </p>
        </div>

        <span className="badge bg-light text-dark border small px-2.5 py-1.5">
          Dynamic Break-Even Engine
        </span>
      </div>

      <div className="row g-4">
        {/* Left Col: Simple Calculator Inputs */}
        <div className="col-12 col-lg-5">
          <div className="card agri-card p-4 shadow-sm h-100">
            <h2 className="fs-6 fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="bi bi-sliders me-1.5 text-success"></i>
              <span>Farm Parameters</span>
            </h2>

            <div className="space-y-3">
              {/* Crop */}
              <div className="mb-2">
                <label className="form-label">Crop (बाली)</label>
                <select
                  className="form-select form-select-sm"
                  value={cropSlug}
                  onChange={(e) => {
                    setCropSlug(e.target.value);
                    setSelectedCropForDetail(e.target.value);
                  }}
                >
                  {cropsList.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon_emoji} {c.name_en} ({c.name_ne})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tunnel Size */}
              <div className="mb-2">
                <label className="form-label">Tunnel Size (m²)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={tunnelSize}
                  onChange={(e) => setTunnelSize(e.target.value)}
                  placeholder="250"
                  min="10"
                />
              </div>

              {/* Expected Yield */}
              <div className="mb-2">
                <label className="form-label">Expected Yield (kg)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={expectedYield}
                  onChange={(e) => setExpectedYield(e.target.value)}
                  placeholder="2200"
                />
              </div>

              {/* Selling Price */}
              <div className="mb-2">
                <label className="form-label">Selling Price (NPR/kg)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="95"
                />
              </div>

              {/* Production Cost */}
              <div className="mb-2">
                <label className="form-label">Production Cost (NPR)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={productionCost}
                  onChange={(e) => setProductionCost(e.target.value)}
                  placeholder="48000"
                />
                <span className="text-muted text-xs">Seeds, Mulch, Labor, Fertilizer, Polyhouse share</span>
              </div>

              {/* Transport Cost */}
              <div className="mb-2">
                <label className="form-label">Transport Cost (NPR)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  placeholder="3500"
                />
              </div>

              {/* Post-Harvest Loss */}
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0">Post-Harvest Loss (%)</label>
                  <span className="fw-bold text-danger small">{postHarvestLoss}%</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="2"
                  max="25"
                  value={postHarvestLoss}
                  onChange={(e) => setPostHarvestLoss(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Clean Results Panel + 3 Bootstrap Tabs */}
        <div className="col-12 col-lg-7">
          <div className="card agri-card shadow-sm overflow-hidden h-100">
            {/* 3 Bootstrap Tabs: Conservative, Normal, High Opportunity */}
            <div className="card-header bg-white border-bottom p-0">
              <ul className="nav nav-tabs border-0 px-3 pt-2" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${scenarioTab === 'conservative' ? 'active text-primary border-bottom border-primary border-2' : ''}`}
                    onClick={() => setScenarioTab('conservative')}
                  >
                    Conservative (-15%)
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${scenarioTab === 'normal' ? 'active text-success border-bottom border-success border-2' : ''}`}
                    onClick={() => setScenarioTab('normal')}
                  >
                    Normal (Historical Base)
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 text-dark fw-bold px-3 py-2.5 ${scenarioTab === 'high_opportunity' ? 'active text-success border-bottom border-success border-2' : ''}`}
                    onClick={() => setScenarioTab('high_opportunity')}
                  >
                    High Opportunity (+25%)
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4">
              {/* Primary Net Profit Banner */}
              <div className={`p-3 rounded mb-4 text-center ${netProfit >= 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`}>
                <span className="text-muted text-xs d-block text-uppercase fw-bold">
                  Estimated Net Profit
                </span>
                <span className="fs-2 fw-black d-block">
                  NPR {Math.round(netProfit).toLocaleString()}
                </span>
                <span className="small fw-semibold">
                  Return on Investment (ROI): {roi.toFixed(1)}%
                </span>
              </div>

              {/* Clean Results Panel */}
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <span className="text-muted text-xs d-block">Expected Revenue</span>
                    <span className="fs-5 fw-bold text-dark">
                      NPR {Math.round(expectedRevenue).toLocaleString()}
                    </span>
                    <span className="text-muted text-xs d-block">
                      {Math.round(marketableYield)} kg @ NPR {effectivePrice.toFixed(0)}/kg
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <span className="text-muted text-xs d-block">Total Cost</span>
                    <span className="fs-5 fw-bold text-dark">
                      NPR {Math.round(totalCost).toLocaleString()}
                    </span>
                    <span className="text-muted text-xs d-block">
                      Production + Transport
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <span className="text-muted text-xs d-block">Break-even Selling Price</span>
                    <span className="fs-5 fw-bold text-dark">
                      NPR {breakEvenPrice.toFixed(1)}/kg
                    </span>
                    <span className="text-muted text-xs d-block">
                      Minimum price to avoid loss
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <span className="text-muted text-xs d-block">Break-even Total Yield</span>
                    <span className="fs-5 fw-bold text-dark">
                      {Math.round(breakEvenYield).toLocaleString()} kg
                    </span>
                    <span className="text-muted text-xs d-block">
                      Minimum required marketable yield
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 border rounded bg-white small text-muted">
                <i className="bi bi-info-circle me-1 text-success"></i>
                <span>
                  Sensitivity assumption: Under <strong>{scenarioTab}</strong> conditions, realized price is NPR {effectivePrice.toFixed(0)}/kg with post-harvest loss at {lossAdj.toFixed(0)}%.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
