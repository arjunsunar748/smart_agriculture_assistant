import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  DollarSign,
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CROP_OPTIONS = [
  { slug: 'tomato', name_en: 'Tomato', name_ne: 'गोलभेडा', icon: '🍅' },
  { slug: 'cucumber', name_en: 'Cucumber', name_ne: 'काँक्रो', icon: '🥒' },
  { slug: 'capsicum', name_en: 'Capsicum (Sweet Pepper)', name_ne: 'भेडे खुर्सानी', icon: '🫑' },
  { slug: 'chilli', name_en: 'Chilli', name_ne: 'खुर्सानी', icon: '🌶️' },
  { slug: 'cauliflower', name_en: 'Cauliflower', name_ne: 'काउली', icon: '🥦' },
  { slug: 'cabbage', name_en: 'Cabbage', name_ne: 'बन्दा', icon: '🥬' },
  { slug: 'brinjal', name_en: 'Brinjal (Eggplant)', name_ne: 'भन्टा', icon: '🍆' },
  { slug: 'beans', name_en: 'French Beans', name_ne: 'सिमी', icon: '🫘' },
  { slug: 'peas', name_en: 'Green Peas', name_ne: 'केराउ', icon: '🟢' },
  { slug: 'spinach', name_en: 'Spinach', name_ne: 'पालुङ्गो', icon: '🥗' },
  { slug: 'bitter_gourd', name_en: 'Bitter Gourd', name_ne: 'तितो करेला', icon: '🥒' },
  { slug: 'okra', name_en: 'Okra (Ladyfinger)', name_ne: 'भिन्डी', icon: '🌱' }
];

export default function WhatIfSimulatorView() {
  const { language, t, selectedWhatIfCrop, setSelectedWhatIfCrop, setActiveTab } = useApp();

  const [cropSlug, setCropSlug] = useState(selectedWhatIfCrop || 'tomato');
  const [tunnelArea, setTunnelArea] = useState(250);
  const [areaUnit, setAreaUnit] = useState('sqm'); // 'sqm' or 'sqft'
  const [plantingDate, setPlantingDate] = useState('2026-09-20');
  
  // What-If Sliders
  const [priceChangePct, setPriceChangePct] = useState(-20); // Default to prompt example: -20%
  const [yieldChangePct, setYieldChangePct] = useState(0);
  const [costChangePct, setCostChangePct] = useState(0);

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Convert area to m2 for API
  const areaInSqm = areaUnit === 'sqft' ? (parseFloat(tunnelArea) || 1000) * 0.092903 : (parseFloat(tunnelArea) || 250);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateWhatIf({
        crop_slug: cropSlug,
        tunnel_area_sqm: areaInSqm,
        planting_date: plantingDate,
        price_change_pct: parseFloat(priceChangePct) || 0,
        yield_change_pct: parseFloat(yieldChangePct) || 0,
        cost_change_pct: parseFloat(costChangePct) || 0,
        language
      });
      setSimulation(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWhatIfCrop) {
      setCropSlug(selectedWhatIfCrop);
    }
  }, [selectedWhatIfCrop]);

  useEffect(() => {
    runSimulation();
  }, [cropSlug, tunnelArea, areaUnit, plantingDate, priceChangePct, yieldChangePct, costChangePct, language]);

  const resetSliders = () => {
    setPriceChangePct(0);
    setYieldChangePct(0);
    setCostChangePct(0);
  };

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <DollarSign className="text-emerald-600" />
            {language === 'ne' ? '💰 के होला? संवेदनशीलता सिमुलेटर (What-If Simulator)' : '💰 "What If?" Sensitivity Simulator'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'बजार मूल्य २०% घट्यो भने? उत्पादन १५% बढ्यो भने? लागत १०% बढ्यो भने नाफा र ब्रेक-इभनमा के असर पर्ला?'
              : 'Interactive financial stress testing: What happens if harvest wholesale prices fall by 20%? Instant recalculation.'}
          </p>
        </div>
        <div className="badge-no-iot">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>ZERO IoT • REAL-TIME SENSITIVITY CALCULATION</span>
        </div>
      </div>

      {/* Preset Example Quick Buttons */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles size={16} className="text-amber-600" />
          <span>{language === 'ne' ? 'परीक्षण परिदृश्यहरू (Test Scenarios):' : 'Instant Stress Tests:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setPriceChangePct(-20);
              setYieldChangePct(0);
              setCostChangePct(0);
            }}
            className="px-3 py-1 bg-white border border-amber-300 rounded hover:bg-amber-100 font-medium"
          >
            📉 {language === 'ne' ? 'मूल्य २०% घटेमा (Price -20%)' : 'Price Falls 20%'}
          </button>
          <button
            onClick={() => {
              setPriceChangePct(-30);
              setYieldChangePct(0);
              setCostChangePct(0);
            }}
            className="px-3 py-1 bg-white border border-amber-300 rounded hover:bg-amber-100 font-medium"
          >
            🚨 {language === 'ne' ? 'मूल्य ३०% घटेमा (Price -30%)' : 'Price Falls 30%'}
          </button>
          <button
            onClick={() => {
              setPriceChangePct(0);
              setYieldChangePct(-25);
              setCostChangePct(0);
            }}
            className="px-3 py-1 bg-white border border-amber-300 rounded hover:bg-amber-100 font-medium"
          >
            🍂 {language === 'ne' ? 'उत्पादन २५% घटेमा (Yield -25%)' : 'Yield Drops 25%'}
          </button>
          <button
            onClick={() => {
              setPriceChangePct(0);
              setYieldChangePct(0);
              setCostChangePct(20);
            }}
            className="px-3 py-1 bg-white border border-amber-300 rounded hover:bg-amber-100 font-medium"
          >
            📈 {language === 'ne' ? 'लागत २०% बढेमा (Cost +20%)' : 'Cost Rises 20%'}
          </button>
          <button
            onClick={resetSliders}
            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700 font-semibold"
          >
            <RotateCcw size={12} className="inline mr-1" />
            {language === 'ne' ? 'रिसेट' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Real-Time Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="filter-card space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <Sliders size={16} className="text-emerald-600" />
              <span>{language === 'ne' ? 'सिमुलेशन इनपुटहरू' : 'Simulation Parameters'}</span>
            </h3>

            {/* Crop Selector */}
            <div>
              <label className="filter-label">{language === 'ne' ? 'बाली छान्नुहोस्' : 'Select Crop'}</label>
              <select
                value={cropSlug}
                onChange={(e) => setCropSlug(e.target.value)}
                className="filter-input"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon} {language === 'ne' ? c.name_ne : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Tunnel Area & Unit */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="filter-label">
                  {language === 'ne' ? 'टनेल क्षेत्रफल' : 'Tunnel Size'}
                </label>
                <input
                  type="number"
                  value={tunnelArea}
                  onChange={(e) => setTunnelArea(e.target.value)}
                  className="filter-input"
                  min="10"
                />
              </div>
              <div>
                <label className="filter-label">{language === 'ne' ? 'एकाइ' : 'Unit'}</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="filter-input"
                >
                  <option value="sqm">m²</option>
                  <option value="sqft">sq.ft</option>
                </select>
              </div>
            </div>

            {/* Planting Date */}
            <div>
              <label className="filter-label">
                {language === 'ne' ? 'रोप्ने मिति (Planting Date)' : 'Planting Date'}
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <hr className="my-2 border-gray-100" />

            {/* SLIDER 1: Selling Price Change % */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-gray-700">
                  {language === 'ne' ? '१. बजार मूल्य फेरबदल' : '1. Selling Price Change'}
                </span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                  priceChangePct < 0 ? 'bg-rose-100 text-rose-800' : priceChangePct > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {priceChangePct > 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="5"
                value={priceChangePct}
                onChange={(e) => setPriceChangePct(e.target.value)}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>-40% (Severe Drop)</span>
                <span>0% (Historical)</span>
                <span>+40% (Festive Spike)</span>
              </div>
            </div>

            {/* SLIDER 2: Expected Yield Change % */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-gray-700">
                  {language === 'ne' ? '२. उत्पादन फेरबदल' : '2. Expected Yield Change'}
                </span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                  yieldChangePct < 0 ? 'bg-amber-100 text-amber-800' : yieldChangePct > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {yieldChangePct > 0 ? `+${yieldChangePct}%` : `${yieldChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={yieldChangePct}
                onChange={(e) => setYieldChangePct(e.target.value)}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>-50% (Pest damage)</span>
                <span>0% (Standard)</span>
                <span>+50% (Optimal GDD)</span>
              </div>
            </div>

            {/* SLIDER 3: Production Cost Change % */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-gray-700">
                  {language === 'ne' ? '३. उत्पादन लागत फेरबदल' : '3. Production Cost Change'}
                </span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                  costChangePct > 0 ? 'bg-rose-100 text-rose-800' : costChangePct < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {costChangePct > 0 ? `+${costChangePct}%` : `${costChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={costChangePct}
                onChange={(e) => setCostChangePct(e.target.value)}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>-30% (Low Labor)</span>
                <span>0% (Standard)</span>
                <span>+50% (High Inputs)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Simulation Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {simulation && (
            <>
              {/* Verdict Banner */}
              <div className={`p-4 rounded-xl border shadow-sm ${
                simulation.risk_level === 'Low'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : simulation.risk_level === 'Medium'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                  <ShieldCheck size={18} className={
                    simulation.risk_level === 'Low' ? 'text-emerald-700' : simulation.risk_level === 'Medium' ? 'text-amber-700' : 'text-rose-700'
                  } />
                  <span>
                    {language === 'ne' ? 'संवेदनशीलता विश्लेषण निष्कर्ष' : 'Sensitivity Resilience Verdict'}
                  </span>
                  <span className={`text-xs ml-auto px-2 py-0.5 rounded-full font-bold uppercase ${
                    simulation.risk_level === 'Low' ? 'bg-emerald-200 text-emerald-900' : simulation.risk_level === 'Medium' ? 'bg-amber-200 text-amber-900' : 'bg-rose-200 text-rose-900'
                  }`}>
                    {simulation.risk_level} Risk
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {language === 'ne' ? simulation.sensitivity_verdict_ne : simulation.sensitivity_verdict_en}
                </p>
              </div>

              {/* Timing & Harvest Date Banner */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Crop</span>
                  <span className="font-bold text-gray-900">{simulation.icon_emoji} {simulation.crop_name_en}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Plant Date</span>
                  <span className="font-bold text-gray-900">{simulation.planting_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Expected Harvest</span>
                  <span className="font-bold text-emerald-700">{simulation.expected_harvest_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Target Month</span>
                  <span className="font-bold text-emerald-700">{simulation.harvest_month_name}</span>
                </div>
              </div>

              {/* Financial Comparison: Base vs Stressed Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>FINANCIAL METRICS</span>
                  <span>BASE HISTORICAL ➔ SIMULATED OUTCOME</span>
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  {/* Price */}
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800">Wholesale Price (NPR/kg)</span>
                      <span className="text-[11px] text-gray-400 block">Kalimati Mandi Harvest Price</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 line-through mr-2">NPR {simulation.base_price_per_kg?.toFixed(0)}</span>
                      <span className="font-bold text-gray-900 text-sm">NPR {simulation.simulated_price_per_kg?.toFixed(0)}/kg</span>
                    </div>
                  </div>

                  {/* Yield */}
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800">Total Yield (kg)</span>
                      <span className="text-[11px] text-gray-400 block">On {simulation.tunnel_area_sqm.toFixed(0)} m² Tunnel</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 mr-2">{simulation.base_yield_kg.toLocaleString()} kg</span>
                      <span className="font-bold text-gray-900 text-sm">➔ {simulation.simulated_yield_kg.toLocaleString()} kg</span>
                    </div>
                  </div>

                  {/* Production Cost */}
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800">Production Cost (NPR)</span>
                      <span className="text-[11px] text-gray-400 block">Seeds, Mulch, Labor, Fertigation</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-gray-400 mr-2">NPR {simulation.base_cost_npr.toLocaleString()}</span>
                      <span className="font-bold text-slate-800">➔ NPR {simulation.simulated_cost_npr.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Gross Revenue */}
                  <div className="p-3 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <span className="font-medium text-gray-800">Gross Revenue (NPR)</span>
                      <span className="text-[11px] text-gray-400 block">Yield × Realized Price</span>
                    </div>
                    <div className="text-right font-mono font-bold text-gray-900">
                      NPR {simulation.simulated_revenue_npr.toLocaleString()}
                    </div>
                  </div>

                  {/* Net Profit & Profit Delta */}
                  <div className="p-3.5 flex justify-between items-center bg-emerald-50/60">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">Net Profit (NPR)</span>
                      <span className="text-[11px] text-emerald-800 block font-medium">
                        Profit Delta: {simulation.profit_delta_npr >= 0 ? `+NPR ${simulation.profit_delta_npr.toLocaleString()}` : `-NPR ${Math.abs(simulation.profit_delta_npr).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-extrabold ${simulation.simulated_profit_npr >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                        NPR {simulation.simulated_profit_npr.toLocaleString()}
                      </span>
                      <span className="text-[11px] block text-emerald-700 font-semibold">
                        ROI: {simulation.simulated_roi_pct.toFixed(1)}% (Base: {simulation.base_roi_pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Break-Even Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm text-xs">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Break-Even Selling Price
                  </span>
                  <span className="text-lg font-black text-slate-900 mt-1 block">
                    NPR {simulation.break_even_price_per_kg.toFixed(1)}/kg
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Price needed just to recover total operating costs.
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm text-xs">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Break-Even Total Yield
                  </span>
                  <span className="text-lg font-black text-slate-900 mt-1 block">
                    {simulation.break_even_yield_kg.toFixed(0)} kg
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Minimum harvest volume needed at simulated price.
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-gray-400 italic">
                * {simulation.disclaimer}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
