import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Calendar as CalendarIcon,
  Shield,
  Sun,
  Info,
  Layers,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Leaf
} from 'lucide-react';

export default function CropCalendarView() {
  const { selectedCropForDetail, setSelectedCropForDetail, language, t } = useApp();
  const [cropsList, setCropsList] = useState([]);
  const [activeTab, setActiveTab] = useState('seasonal_matrix'); // 'seasonal_matrix', 'staggered', 'year_round', 'rotation', 'loss'

  // Tab 1: Seasonal Calendar State
  const [calendarData, setCalendarData] = useState(null);
  const [viewMode, setViewMode] = useState('both'); // 'both', 'tunnel', 'open_field'
  const [calLoading, setCalLoading] = useState(true);

  // Tab 2: Staggered Planting Planner State
  const [staggerCrop, setStaggerCrop] = useState(selectedCropForDetail || 'cucumber');
  const [staggerArea, setStaggerArea] = useState(1000);
  const [staggerAreaUnit, setStaggerAreaUnit] = useState('sqft');
  const [staggerBatches, setStaggerBatches] = useState(4);
  const [staggerStartDate, setStaggerStartDate] = useState('2026-09-01');
  const [staggerInterval, setStaggerInterval] = useState(14);
  const [staggerResult, setStaggerResult] = useState(null);
  const [staggerLoading, setStaggerLoading] = useState(false);

  // Tab 3: Year-Round 12-Month Planner State
  const [yearRoundArea, setYearRoundArea] = useState(250);
  const [yearRoundStartMonth, setYearRoundStartMonth] = useState(8);
  const [yearRoundStrategy, setYearRoundStrategy] = useState('max_profit');
  const [yearRoundResult, setYearRoundResult] = useState(null);
  const [yearRoundLoading, setYearRoundLoading] = useState(false);

  // Tab 4: Crop Rotation State
  const [rotationCrop, setRotationCrop] = useState(selectedCropForDetail || 'tomato');
  const [rotationResult, setRotationResult] = useState(null);
  const [rotationLoading, setRotationLoading] = useState(false);

  // Tab 5: Post-Harvest Loss State
  const [lossCrop, setLossCrop] = useState(selectedCropForDetail || 'tomato');
  const [lossYield, setLossYield] = useState(1000);
  const [lossDistance, setLossDistance] = useState(45);
  const [lossPackaging, setLossPackaging] = useState('plastic_crates');
  const [lossStorageDays, setLossStorageDays] = useState(2);
  const [lossPrice, setLossPrice] = useState(85);
  const [lossResult, setLossResult] = useState(null);
  const [lossLoading, setLossLoading] = useState(false);

  useEffect(() => {
    async function loadCrops() {
      try {
        const list = await api.getCrops();
        setCropsList(list);
      } catch (err) {
        console.error('Failed to load crop catalog:', err);
      }
    }
    loadCrops();
  }, []);

  // Fetch seasonal calendar
  useEffect(() => {
    async function loadCal() {
      if (!selectedCropForDetail) return;
      setCalLoading(true);
      try {
        const data = await api.getCropCalendar(selectedCropForDetail);
        setCalendarData(data);
      } catch (err) {
        console.error('Failed to load calendar:', err);
      } finally {
        setCalLoading(false);
      }
    }
    loadCal();
  }, [selectedCropForDetail]);

  // Fetch Staggered Plan
  const fetchStaggeredPlan = async () => {
    setStaggerLoading(true);
    try {
      const res = await api.getStaggeredPlan({
        crop_slug: staggerCrop,
        total_tunnel_area_sqm: parseFloat(staggerArea) || 1000,
        area_unit: staggerAreaUnit,
        batches_count: parseInt(staggerBatches) || 4,
        first_planting_date: staggerStartDate,
        stagger_interval_days: parseInt(staggerInterval) || 14
      });
      setStaggerResult(res);
    } catch (err) {
      console.error('Failed to load staggered plan:', err);
    } finally {
      setStaggerLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'staggered') {
      fetchStaggeredPlan();
    }
  }, [activeTab, staggerCrop, staggerArea, staggerAreaUnit, staggerBatches, staggerStartDate, staggerInterval]);

  // Fetch Year-Round Plan
  const fetchYearRoundPlan = async () => {
    setYearRoundLoading(true);
    try {
      const res = await api.getYearRoundPlan({
        tunnel_area_sqm: parseFloat(yearRoundArea) || 250,
        starting_month: parseInt(yearRoundStartMonth) || 8,
        primary_target: yearRoundStrategy
      });
      setYearRoundResult(res);
    } catch (err) {
      console.error('Failed to load year round plan:', err);
    } finally {
      setYearRoundLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'year_round') {
      fetchYearRoundPlan();
    }
  }, [activeTab, yearRoundArea, yearRoundStartMonth, yearRoundStrategy]);

  // Fetch Rotation Advice
  const fetchRotationAdvice = async () => {
    setRotationLoading(true);
    try {
      const res = await api.getCropRotationAdvice(rotationCrop);
      setRotationResult(res);
    } catch (err) {
      console.error('Failed to load rotation advice:', err);
    } finally {
      setRotationLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rotation') {
      fetchRotationAdvice();
    }
  }, [activeTab, rotationCrop]);

  // Fetch Post-Harvest Loss
  const fetchPostHarvestLoss = async () => {
    setLossLoading(true);
    try {
      const res = await api.calculatePostHarvestLoss({
        crop_slug: lossCrop,
        expected_yield_kg: parseFloat(lossYield) || 1000,
        transport_distance_km: parseFloat(lossDistance) || 45,
        packaging_type: lossPackaging,
        storage_duration_days: parseInt(lossStorageDays) || 2,
        selling_price_per_kg: parseFloat(lossPrice) || 85
      });
      setLossResult(res);
    } catch (err) {
      console.error('Failed to load post harvest loss:', err);
    } finally {
      setLossLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'loss') {
      fetchPostHarvestLoss();
    }
  }, [activeTab, lossCrop, lossYield, lossDistance, lossPackaging, lossStorageDays, lossPrice]);

  const getStatusBadge = (status) => {
    if (status === 'best') {
      return (
        <span className="cal-badge-best text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
          {language === 'ne' ? '🟢 उत्कृष्ट' : '🟢 Best'}
        </span>
      );
    }
    if (status === 'acceptable') {
      return (
        <span className="cal-badge-acceptable text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
          {language === 'ne' ? '🟡 मध्यम' : '🟡 Acceptable'}
        </span>
      );
    }
    return (
      <span className="cal-badge-poor text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
        {language === 'ne' ? '🔴 प्रतिकूल' : '🔴 Poor'}
      </span>
    );
  };

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <CalendarIcon className="text-emerald-600" />
            {language === 'ne' ? '📅 स्मार्ट बाली तथा टनेल क्यालेन्डर' : '📅 Smart Crop & Tunnel Calendar'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'टनेल र खुला खेत तुलना, बहु-चरण रोपण (Staggered Planting) र १२-महिने टनेल चक्र व्यवस्थापन।'
              : 'Seasonal windows, multiple-batch staggered harvesting, year-round tunnel scheduling, and crop rotation.'}
          </p>
        </div>
      </div>

      {/* Main Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/90 rounded-xl border border-gray-200">
        <button
          onClick={() => setActiveTab('seasonal_matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'seasonal_matrix'
              ? 'bg-white text-emerald-800 shadow-sm border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CalendarIcon size={14} />
          <span>{language === 'ne' ? '१. मौसमी क्यालेन्डर' : '1. Seasonal Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveTab('staggered')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'staggered'
              ? 'bg-white text-emerald-800 shadow-sm border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers size={14} />
          <span>{language === 'ne' ? '२. बहु-चरण रोपण (Staggered)' : '2. Staggered Harvest Plan'}</span>
        </button>

        <button
          onClick={() => setActiveTab('year_round')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'year_round'
              ? 'bg-white text-emerald-800 shadow-sm border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <RotateCcw size={14} />
          <span>{language === 'ne' ? '३. १२-महिने टनेल योजना' : '3. 12-Month Year-Round Plan'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rotation')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'rotation'
              ? 'bg-white text-emerald-800 shadow-sm border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Leaf size={14} />
          <span>{language === 'ne' ? '४. बाली चक्र (Crop Rotation)' : '4. Crop Rotation'}</span>
        </button>

        <button
          onClick={() => setActiveTab('loss')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'loss'
              ? 'bg-white text-emerald-800 shadow-sm border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package size={14} />
          <span>{language === 'ne' ? '५. फसल नोक्सानी (Loss Calc)' : '5. Post-Harvest Loss'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SEASONAL CALENDAR MATRIX */}
      {/* ============================================================== */}
      {activeTab === 'seasonal_matrix' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">Select Crop:</span>
              <select
                value={selectedCropForDetail}
                onChange={(e) => setSelectedCropForDetail(e.target.value)}
                className="filter-input w-48 font-semibold text-emerald-950"
              >
                {cropsList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon_emoji} {language === 'ne' ? c.name_ne : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('both')}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${viewMode === 'both' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
              >
                {language === 'ne' ? 'दुवै तुलना' : 'Both'}
              </button>
              <button
                onClick={() => setViewMode('tunnel')}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${viewMode === 'tunnel' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
              >
                {language === 'ne' ? 'टनेल मात्र' : 'Tunnel Only'}
              </button>
              <button
                onClick={() => setViewMode('open_field')}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${viewMode === 'open_field' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
              >
                {language === 'ne' ? 'खुला खेत मात्र' : 'Open Field Only'}
              </button>
            </div>
          </div>

          {calLoading ? (
            <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ) : calendarData ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-emerald-50/60 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">
                    {language === 'ne' ? calendarData.crop_name_ne : calendarData.crop_name_en}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Growing Period: <strong className="text-gray-800">{calendarData.growing_duration_days} days</strong> • First Harvest in{' '}
                    <strong className="text-emerald-700">{calendarData.first_harvest_days} days</strong>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3 w-36">महिना (Month)</th>
                      {(viewMode === 'both' || viewMode === 'tunnel') && (
                        <th className="p-3 text-emerald-800">
                          <div className="flex items-center gap-1.5">
                            <Shield size={14} className="text-emerald-600" />
                            <span>टनेल रोपण (Tunnel Polyhouse)</span>
                          </div>
                        </th>
                      )}
                      {(viewMode === 'both' || viewMode === 'open_field') && (
                        <th className="p-3 text-amber-800">
                          <div className="flex items-center gap-1.5">
                            <Sun size={14} className="text-amber-600" />
                            <span>खुला खेत (Open Field)</span>
                          </div>
                        </th>
                      )}
                      <th className="p-3">फसल महिना (Harvest)</th>
                      <th className="p-3">बजार तथा कृषि विवरण (Remarks)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {calendarData.months?.map((m) => (
                      <tr key={m.month_index} className="hover:bg-gray-50/60">
                        <td className="p-3 font-bold text-gray-900">
                          {m.month_name_en}
                          <span className="block text-[11px] font-medium text-gray-500">
                            {m.month_name_ne}
                          </span>
                        </td>
                        {(viewMode === 'both' || viewMode === 'tunnel') && (
                          <td className="p-3">
                            <div className="space-y-1">
                              {getStatusBadge(m.tunnel_status)}
                              <span className="block text-[10px] text-gray-500 leading-tight">
                                {m.tunnel_notes}
                              </span>
                            </div>
                          </td>
                        )}
                        {(viewMode === 'both' || viewMode === 'open_field') && (
                          <td className="p-3">
                            <div className="space-y-1">
                              {getStatusBadge(m.open_field_status)}
                              <span className="block text-[10px] text-gray-500 leading-tight">
                                {m.open_field_notes}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="p-3 font-semibold text-gray-800">
                          {m.is_harvest_month ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
                              🌾 Active Harvest
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 text-[11px]">
                          {m.market_advice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: STAGGERED PLANTING PLANNER (Section 13) */}
      {/* ============================================================== */}
      {activeTab === 'staggered' && (
        <div className="space-y-6">
          {/* Config Bar */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="text-emerald-600" />
                  <span>{language === 'ne' ? '🔄 बहु-चरण रोपण योजना (Staggered Planting Planner)' : '🔄 Staggered Planting & Multiple Harvest Windows'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'ne'
                    ? 'टनेललाई विभिन्न खण्डमा बाँडेर १५-१५ दिनको फरकमा रोप्दा फसल एकैपटक नआई लामो समयसम्म उच्च बजार भाउमा बिक्री हुन्छ।'
                    : 'Prevent harvest gluts: Divide tunnel into sub-batches planted on staggered dates for continuous cash flow.'}
                </p>
              </div>
              <div className="badge-no-iot text-xs">
                <span>SECTION 13 ENGINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="filter-label">Crop</label>
                <select
                  value={staggerCrop}
                  onChange={(e) => setStaggerCrop(e.target.value)}
                  className="filter-input font-bold"
                >
                  {cropsList.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon_emoji} {c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label">Total Tunnel Area</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={staggerArea}
                    onChange={(e) => setStaggerArea(e.target.value)}
                    className="filter-input w-2/3 font-bold"
                  />
                  <select
                    value={staggerAreaUnit}
                    onChange={(e) => setStaggerAreaUnit(e.target.value)}
                    className="filter-input w-1/3"
                  >
                    <option value="sqft">sq.ft</option>
                    <option value="sqm">m²</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="filter-label">Number of Batches</label>
                <select
                  value={staggerBatches}
                  onChange={(e) => setStaggerBatches(e.target.value)}
                  className="filter-input font-bold"
                >
                  <option value={2}>2 Batches (50% each)</option>
                  <option value={3}>3 Batches (33% each)</option>
                  <option value={4}>4 Batches (25% each)</option>
                  <option value={5}>5 Batches (20% each)</option>
                </select>
              </div>

              <div>
                <label className="filter-label">Batch 1 Planting Date</label>
                <input
                  type="date"
                  value={staggerStartDate}
                  onChange={(e) => setStaggerStartDate(e.target.value)}
                  className="filter-input font-medium"
                />
              </div>

              <div>
                <label className="filter-label">Stagger Interval</label>
                <select
                  value={staggerInterval}
                  onChange={(e) => setStaggerInterval(e.target.value)}
                  className="filter-input font-bold"
                >
                  <option value={10}>Every 10 Days</option>
                  <option value={14}>Every 14 Days (2 Weeks)</option>
                  <option value={21}>Every 21 Days (3 Weeks)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Staggered Results Display */}
          {staggerLoading ? (
            <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ) : staggerResult ? (
            <div className="space-y-6">
              {/* Summary Metrics Banner */}
              <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-xl shadow-sm border border-emerald-800">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block">Continuous Harvest</span>
                    <span className="text-xl font-black text-white">{staggerResult.continuous_harvest_span_days} Days</span>
                    <span className="text-[10px] text-emerald-200 block">{staggerResult.harvest_start_earliest} to {staggerResult.harvest_end_latest}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block">Total Marketable Yield</span>
                    <span className="text-xl font-black text-white">{staggerResult.total_yield_kg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block">Projected Gross Revenue</span>
                    <span className="text-xl font-black text-amber-300">NPR {staggerResult.total_revenue_npr.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block">Total Production Cost</span>
                    <span className="text-xl font-black text-emerald-100">NPR {staggerResult.total_cost_npr.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block">Net Farm Profit & ROI</span>
                    <span className="text-xl font-black text-emerald-400">NPR {staggerResult.total_profit_npr.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-300 block">{staggerResult.overall_roi_pct}% ROI</span>
                  </div>
                </div>
              </div>

              {/* Batches Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-gray-100 font-bold text-xs text-gray-800 uppercase tracking-wider">
                  {language === 'ne' ? 'खण्ड अनुसार रोप्ने र फसल विवरण' : 'Batch-by-Batch Planting & Harvest Timeline'}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Batch #</th>
                        <th className="p-3">Tunnel Area</th>
                        <th className="p-3">Planting Date</th>
                        <th className="p-3">Expected Harvest</th>
                        <th className="p-3">Est. Yield</th>
                        <th className="p-3">Market Mandi Price</th>
                        <th className="p-3">Net Profit</th>
                        <th className="p-3">Market Opportunity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {staggerResult.batches?.map((b) => (
                        <tr key={b.batch_number} className="hover:bg-gray-50/60">
                          <td className="p-3 font-bold text-gray-900">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">
                              Batch {b.batch_number}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-gray-700">
                            {b.area_sqft} sq.ft ({b.area_sqm} m²)
                          </td>
                          <td className="p-3 font-bold text-emerald-700">
                            {b.planting_date}
                          </td>
                          <td className="p-3 font-bold text-amber-800">
                            {b.expected_harvest_start} ➔ {b.expected_harvest_end}
                            <span className="block text-[10px] text-gray-500 font-normal">
                              {b.market_harvest_month}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-900">
                            {b.expected_yield_kg} kg
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            NPR {b.target_wholesale_price_npr}/kg
                          </td>
                          <td className="p-3">
                            <span className="font-extrabold text-emerald-700">
                              NPR {b.batch_net_profit_npr.toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-gray-500">
                              {b.batch_roi_pct}% ROI
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-gray-600">
                            {b.market_advantage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Agronomic Risk Smoothing Benefits */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-700" />
                  <span>Why Staggered Planting Protects Tunnel Margins</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  {staggerResult.risk_smoothing_benefits?.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: 12-MONTH YEAR-ROUND TUNNEL PLANNER (Section 14 & 15) */}
      {/* ============================================================== */}
      {activeTab === 'year_round' && (
        <div className="space-y-6">
          {/* Config Bar */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <RotateCcw className="text-emerald-600" />
                  <span>{language === 'ne' ? '📅 १२-महिने टनेल उत्पादन पात्रो (12-Month Year-Round Planner)' : '📅 12-Month Year-Round Tunnel Planner'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'ne'
                    ? 'वर्षभर टनेलको पूर्ण उपयोग, माटोको तयारी/सौर्यकरण (Solarization) र जैविक बाली चक्र (Crop Rotation)।'
                    : 'Year-round sequential cultivation accounting for growing days, tunnel prep buffers, and family rotation.'}
                </p>
              </div>
              <div className="badge-no-iot text-xs">
                <span>SECTION 14 & 15 ENGINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="filter-label">Tunnel Size (m²)</label>
                <input
                  type="number"
                  value={yearRoundArea}
                  onChange={(e) => setYearRoundArea(e.target.value)}
                  className="filter-input font-bold"
                />
              </div>

              <div>
                <label className="filter-label">Starting Month</label>
                <select
                  value={yearRoundStartMonth}
                  onChange={(e) => setYearRoundStartMonth(e.target.value)}
                  className="filter-input font-bold"
                >
                  <option value={8}>August (Bhadra - Autumn Prep)</option>
                  <option value={9}>September (Ashoj - Post-Monsoon)</option>
                  <option value={1}>January (Magh - Spring Cycle)</option>
                  <option value={3}>March (Chaitra - Summer Cycle)</option>
                </select>
              </div>

              <div>
                <label className="filter-label">Optimization Strategy</label>
                <select
                  value={yearRoundStrategy}
                  onChange={(e) => setYearRoundStrategy(e.target.value)}
                  className="filter-input font-bold"
                >
                  <option value="max_profit">Maximum Financial Margin</option>
                  <option value="soil_health">Soil Health & Bacterial Wilt Break</option>
                  <option value="balanced">Balanced Cash-Flow & Agronomy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {yearRoundLoading ? (
            <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ) : yearRoundResult ? (
            <div className="space-y-6">
              {/* Annual Financial Summary */}
              <div className="p-5 bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-xl shadow-sm border border-teal-800">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 font-bold block">Annual Total Production</span>
                    <span className="text-xl font-black text-white">{yearRoundResult.annual_total_yield_kg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 font-bold block">Annual Gross Revenue</span>
                    <span className="text-xl font-black text-amber-300">NPR {yearRoundResult.annual_total_revenue_npr.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 font-bold block">Annual Operational Cost</span>
                    <span className="text-xl font-black text-teal-100">NPR {yearRoundResult.annual_total_cost_npr.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-teal-300 font-bold block">Annual Net Profit</span>
                    <span className="text-xl font-black text-emerald-400">NPR {yearRoundResult.annual_net_profit_npr.toLocaleString()}</span>
                    <span className="text-[10px] text-teal-300 block">{yearRoundResult.annual_roi_pct}% Annual ROI</span>
                  </div>
                </div>
              </div>

              {/* Sequence Flowchart Cards */}
              <div className="space-y-4">
                <div className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  {language === 'ne' ? 'वार्षिक बाली चक्र अनुक्रम (Sequential Rotation Flow)' : 'Annual Sequential Crop Cycles'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {yearRoundResult.cycles?.map((c) => (
                    <div
                      key={c.cycle_index}
                      className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-3 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Cycle #{c.cycle_index}
                        </span>
                        <span className="text-[11px] text-gray-500 font-serif">{c.crop_family}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-2 bg-emerald-50 rounded-xl">{c.icon_emoji}</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {language === 'ne' ? c.crop_name_ne : c.crop_name_en}
                          </h4>
                          <span className="text-xs text-emerald-700 font-bold">
                            {c.planting_month_name} ➔ {c.harvest_months_name}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Est. Yield</span>
                          <span className="font-bold text-gray-800">{c.expected_yield_kg} kg</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Target Mandi Price</span>
                          <span className="font-bold text-emerald-700">NPR {c.target_market_price_npr}/kg</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Cycle Profit</span>
                          <span className="font-extrabold text-emerald-800">NPR {c.cycle_profit_npr.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Prep Days After</span>
                          <span className="font-bold text-slate-700">{c.tunnel_prep_days_after} Days</span>
                        </div>
                      </div>

                      <div className="text-[11px] space-y-1 pt-1 text-gray-600">
                        <p><strong>Soil Impact:</strong> {c.soil_impact}</p>
                        <p><strong>Agronomic Role:</strong> {c.rotation_benefit}</p>
                        <p className="text-emerald-700"><strong>Market Thesis:</strong> {c.market_window_rationale}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crop Rotation Evaluation Card */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-teal-950 uppercase">
                  <CheckCircle size={15} className="text-teal-700" />
                  <span>Agronomic Rotation & Soil Sustainability Evaluation</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {yearRoundResult.crop_rotation_evaluation}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 font-semibold text-teal-900">
                  <span>Soil Health: <strong>{yearRoundResult.soil_health_rating}</strong></span>
                  <span>Timeline Utilization: <strong>{yearRoundResult.calendar_coverage_summary}</strong></span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CROP ROTATION INTELLIGENCE (Section 15) */}
      {/* ============================================================== */}
      {activeTab === 'rotation' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Leaf className="text-emerald-600" />
                  <span>{language === 'ne' ? '🌿 बाली चक्र तथा माटो स्वास्थ्य (Crop Rotation Intelligence)' : '🌿 Crop Rotation Intelligence & Pathogen Breaks'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'ne'
                    ? 'लगातार एउटै बाली लगाउँदा माटोमा ब्याक्टेरिया, ढुसी र नेमाटोड बढ्छ। वैज्ञानिक बाली चक्रले रोग घटाउँछ र उत्पादन बढाउँछ।'
                    : 'Prevent soil sickness, Ralstonia wilt, and root-knot nematodes with botanical family alternation.'}
                </p>
              </div>
              <div className="badge-no-iot text-xs">
                <span>SECTION 15 ENGINE</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-gray-700">Currently Cultivated / Previous Crop:</span>
              <select
                value={rotationCrop}
                onChange={(e) => setRotationCrop(e.target.value)}
                className="filter-input w-48 font-bold text-emerald-950"
              >
                {cropsList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon_emoji} {c.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rotationLoading ? (
            <div className="h-48 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ) : rotationResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Successors */}
              <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle size={15} className="text-emerald-700" />
                  <span>Recommended Follow-Up Crops for Next Cycle</span>
                </h4>
                <div className="space-y-2">
                  {rotationResult.recommended_follow_crops?.map((rec, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-emerald-200 text-xs space-y-1">
                      <span className="font-bold text-emerald-900 block">{rec.name}</span>
                      <p className="text-gray-600">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crops to Avoid */}
              <div className="p-5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-rose-600" />
                  <span>Unfavorable Crops to AVOID (Disease Carryover)</span>
                </h4>
                <div className="space-y-2">
                  {rotationResult.unfavorable_crops_to_avoid?.map((unf, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-rose-200 text-xs space-y-1">
                      <span className="font-bold text-rose-900 block">{unf.name}</span>
                      <p className="text-gray-600">{unf.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathogen Break Rationale and Soil Tips */}
              <div className="md:col-span-2 p-5 bg-white rounded-xl border border-gray-200 space-y-3 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800">
                  Agronomic Pathogen Break Thesis & Soil Remediation Protocol
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {rotationResult.pathogen_break_rationale}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  {rotationResult.soil_remediation_tips?.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: POST-HARVEST LOSS CALCULATOR (Section 12) */}
      {/* ============================================================== */}
      {activeTab === 'loss' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-emerald-600" />
                  <span>{language === 'ne' ? '📦 फसल नोक्सानी क्यालकुलेटर (Post-Harvest Loss Calculator)' : '📦 Post-Harvest Loss Calculator'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === 'ne'
                    ? 'टिपाई, ढुवानी, प्याकेजिङ र भण्डारणमा हुने नोक्सानी घटाएर वास्तविक बिक्री योग्य परिमाण र नाफा हिसाब गर्नुहोस्।'
                    : 'Calculate expected handling, transit, and storage losses to determine true sellable quantity.'}
                </p>
              </div>
              <div className="badge-no-iot text-xs">
                <span>SECTION 12 ENGINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="filter-label">Crop</label>
                <select
                  value={lossCrop}
                  onChange={(e) => setLossCrop(e.target.value)}
                  className="filter-input font-bold"
                >
                  {cropsList.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon_emoji} {c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label">Harvested Yield (kg)</label>
                <input
                  type="number"
                  value={lossYield}
                  onChange={(e) => setLossYield(e.target.value)}
                  className="filter-input font-bold"
                />
              </div>

              <div>
                <label className="filter-label">Transport Distance (km)</label>
                <input
                  type="number"
                  value={lossDistance}
                  onChange={(e) => setLossDistance(e.target.value)}
                  className="filter-input font-bold"
                />
              </div>

              <div>
                <label className="filter-label">Packaging Type</label>
                <select
                  value={lossPackaging}
                  onChange={(e) => setLossPackaging(e.target.value)}
                  className="filter-input font-medium"
                >
                  <option value="plastic_crates">Plastic Crates (Ventilated)</option>
                  <option value="bamboo_baskets">Bamboo Doko (Traditional)</option>
                  <option value="jute_sacks">Jute Sacks (Compression Risk)</option>
                </select>
              </div>

              <div>
                <label className="filter-label">Storage Holding (Days)</label>
                <input
                  type="number"
                  value={lossStorageDays}
                  onChange={(e) => setLossStorageDays(e.target.value)}
                  className="filter-input font-bold"
                />
              </div>

              <div>
                <label className="filter-label">Selling Price (NPR/kg)</label>
                <input
                  type="number"
                  value={lossPrice}
                  onChange={(e) => setLossPrice(e.target.value)}
                  className="filter-input font-bold"
                />
              </div>
            </div>
          </div>

          {/* Loss Calculation Display */}
          {lossLoading ? (
            <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ) : lossResult ? (
            <div className="space-y-6">
              {/* Financial Impact Banner */}
              <div className="p-5 bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-xl shadow-sm border border-rose-800">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase text-rose-300 font-bold block">Total Post-Harvest Loss</span>
                    <span className="text-xl font-black text-rose-300">{lossResult.total_loss_pct}%</span>
                    <span className="text-[10px] text-rose-200 block">(-{lossResult.total_loss_kg} kg lost)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 font-bold block">Sellable Market Yield</span>
                    <span className="text-xl font-black text-emerald-400">{lossResult.sellable_yield_kg.toLocaleString()} kg</span>
                    <span className="text-[10px] text-emerald-200 block">Out of {lossResult.initial_yield_kg} kg harvested</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-amber-300 font-bold block">Realized Revenue</span>
                    <span className="text-xl font-black text-white">NPR {lossResult.realized_revenue_after_loss.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-rose-300 font-bold block">Value Lost to Spoilage</span>
                    <span className="text-xl font-black text-rose-400">-NPR {lossResult.monetary_loss_npr.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Losses Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">1. Field Handling Loss</span>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-base text-gray-900">{lossResult.handling_loss_pct}%</span>
                    <span className="text-gray-600">{lossResult.handling_loss_kg} kg</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Harvest snapping, grading bruises, and field heat.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">2. Transit Vibration Loss</span>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-base text-amber-700">{lossResult.transport_loss_pct}%</span>
                    <span className="text-gray-600">{lossResult.transport_loss_kg} kg</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Over {lossDistance} km transit using {lossPackaging}.</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">3. Storage Spoilage Loss</span>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-base text-rose-700">{lossResult.storage_spoilage_pct}%</span>
                    <span className="text-gray-600">{lossResult.storage_spoilage_kg} kg</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Respiration and moisture loss over {lossStorageDays} days.</p>
                </div>
              </div>

              {/* Loss Mitigation Tips */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-700" />
                  <span>Actionable Loss Reduction Recommendations</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  {lossResult.mitigation_recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
