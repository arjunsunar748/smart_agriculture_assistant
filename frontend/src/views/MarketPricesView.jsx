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

export default function MarketPricesView() {
  const { setSelectedCropForDetail, setActiveTab, language } = useApp();
  const [prices, setPrices] = useState([]);
  const [marketWindows, setMarketWindows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [priceData, windowsData] = await Promise.all([
        api.getMarketPrices(),
        api.getFutureMarketWindows()
      ]);
      setPrices(priceData || []);
      setMarketWindows(windowsData.months || []);
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered prices
  const filteredPrices = prices.filter((p) => {
    const matchesSearch =
      p.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.crop_name_ne && p.crop_name_ne.includes(search));
    const matchesCrop = selectedCrop === 'all' || p.crop_slug === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  // Recharts sample data based on active or filtered crop
  const chartData = [
    { day: 'Day 1', price: 75, avg: 72 },
    { day: 'Day 5', price: 80, avg: 74 },
    { day: 'Day 10', price: 85, avg: 78 },
    { day: 'Day 15', price: 92, avg: 82 },
    { day: 'Day 20', price: 98, avg: 85 },
    { day: 'Day 25', price: 105, avg: 90 },
    { day: 'Today', price: 110, avg: 95 }
  ];

  return (
    <div className="container py-4 fade-in">
      {/* Page Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fs-3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span className="text-success">📈</span>
            <span>{language === 'ne' ? 'कालीमाटी बजार भाउ र ट्रेन्ड' : 'Market Prices & Trends'}</span>
          </h1>
          <p className="text-muted small mb-0">
            {language === 'ne'
              ? 'कालीमाटी थोक बजार विकास समितिको प्रत्यक्ष दैनिक दर, मूल्य परिवर्तन र बजार अवसर।'
              : 'Live wholesale mandi arrivals, price velocity badges, and future shortage opportunities.'}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-sm btn-outline-agri d-flex align-items-center gap-1.5"
        >
          <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
          <span>{language === 'ne' ? 'ताजा बनाउनुहोस्' : 'Refresh Prices'}</span>
        </button>
      </div>

      {/* TOP: Search Market, Select Location, Select Crop */}
      <div className="card agri-card p-3 mb-4 shadow-sm">
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={language === 'ne' ? 'तरकारीको नाम खोज्नुहोस्...' : 'Search vegetable crop...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Select Location */}
          <div className="col-12 col-sm-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Markets (सबै बजारहरू)</option>
              <option value="kalimati">Kalimati Mandi, Kathmandu</option>
              <option value="pokhara">Pokhara Wholesale Market</option>
              <option value="narayangarh">Narayangarh Mandi, Chitwan</option>
            </select>
          </div>

          {/* Select Crop */}
          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select form-select-sm"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="all">All Crops (सबै बालीहरू)</option>
              {prices.map((p) => (
                <option key={p.crop_slug} value={p.crop_slug}>
                  {p.crop_name} ({language === 'ne' ? p.crop_name_ne : p.crop_slug})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CURRENT MARKET PRICES: Bootstrap Responsive Table */}
      <div className="card agri-card mb-4 shadow-sm overflow-hidden">
        <div className="card-header-clean d-flex justify-content-between align-items-center">
          <h2 className="fs-6 fw-bold text-dark mb-0">Current Wholesale Market Prices</h2>
          <span className="text-muted text-xs">Kalimati Fruit & Vegetable Market Development Board</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th style={{ width: '25%' }}>Crop</th>
                <th style={{ width: '25%' }}>Market</th>
                <th className="text-end" style={{ width: '20%' }}>Price</th>
                <th className="text-center" style={{ width: '15%' }}>Change</th>
                <th className="text-end" style={{ width: '15%' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((item) => (
                <tr
                  key={item.crop_slug}
                  onClick={() => {
                    setSelectedCropForDetail(item.crop_slug);
                    setActiveTab('crop_details');
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full crop analysis"
                >
                  <td>
                    <div className="fw-bold text-dark">
                      {language === 'ne' ? item.crop_name_ne || item.crop_name : item.crop_name}
                    </div>
                    <span className="text-muted text-xs capitalize">{item.crop_slug}</span>
                  </td>
                  <td className="text-muted">
                    {item.market_name || 'Kalimati Mandi, Kathmandu'}
                  </td>
                  <td className="text-end fw-bold text-success fs-6">
                    NPR {item.avg_price.toFixed(0)}/{item.unit || 'kg'}
                  </td>
                  <td className="text-center">
                    {item.trend_7d_pct > 0 ? (
                      <span className="badge-trend-up">↑ Increasing (+{item.trend_7d_pct.toFixed(0)}%)</span>
                    ) : item.trend_7d_pct < 0 ? (
                      <span className="badge-trend-down">↓ Decreasing ({item.trend_7d_pct.toFixed(0)}%)</span>
                    ) : (
                      <span className="badge-trend-stable">→ Stable</span>
                    )}
                  </td>
                  <td className="text-end text-muted small">
                    {item.last_updated || 'Today'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLEAN CHART: "Price Trend" (Recharts) */}
      <div className="card agri-card p-4 mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fs-6 fw-bold text-dark mb-0">Price Trend Velocity (Last 30 Days)</h3>
            <span className="text-muted text-xs">Wholesale price movement (NPR/kg) compared to seasonal average</span>
          </div>
          <span className="badge bg-light text-dark border small">Recharts 30D Window</span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2ee" />
              <XAxis dataKey="day" stroke="#5c6b60" fontSize={12} />
              <YAxis stroke="#5c6b60" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2ebe4' }} />
              <Line
                type="monotone"
                dataKey="price"
                name="Market Realized Price"
                stroke="#2d6a4f"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="5-Yr Historical Average"
                stroke="#a7c957"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BELOW: "Future Market Opportunity" (Show only important opportunities) */}
      <div className="mb-4">
        <h3 className="fs-5 fw-bold text-dark mb-3">
          {language === 'ne' ? 'भविष्यको उच्च बजार अवसरहरू' : 'Future Market Opportunities'}
        </h3>

        <div className="row g-3">
          {marketWindows.slice(8, 12).map((m) => (
            <div key={m.month_index} className="col-12 col-sm-6 col-lg-3">
              <div className="agri-card p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                  <h4 className="fs-6 fw-bold text-dark mb-0">{m.month_name_en}</h4>
                  <span className="badge bg-success-subtle text-success small">{m.bs_month_name}</span>
                </div>
                <div className="small space-y-2">
                  {m.opportunities?.slice(0, 2).map((opp) => (
                    <div key={opp.crop_slug} className="mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold text-dark">
                          {opp.icon_emoji} {opp.name_en}
                        </span>
                        <span className="badge-agri-low">NPR {opp.historical_avg_price.toFixed(0)}/kg</span>
                      </div>
                      <span className="text-muted text-xs d-block">
                        Seeding: {opp.required_planting_window}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
