import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CROPS_LIST = [
  { slug: 'cucumber', name_en: 'Cucumber (काँक्रो)', emoji: '🥒' },
  { slug: 'tomato', name_en: 'Tomato (गोलभेँडा)', emoji: '🍅' },
  { slug: 'capsicum', name_en: 'Capsicum (भेडे खुर्सानी)', emoji: '🫑' },
  { slug: 'cauliflower', name_en: 'Cauliflower (काउली)', emoji: '🥦' },
  { slug: 'cabbage', name_en: 'Cabbage (बन्दा)', emoji: '🥬' },
  { slug: 'spinach', name_en: 'Spinach (पालुङ्गो)', emoji: '🥗' },
  { slug: 'coriander', name_en: 'Coriander (धनिया)', emoji: '🌿' },
  { slug: 'bitter_gourd', name_en: 'Bitter Gourd (तितो करेला)', emoji: '🥒' },
  { slug: 'bottle_gourd', name_en: 'Bottle Gourd (लौका)', emoji: '🥒' },
  { slug: 'french_beans', name_en: 'French Beans (सिमी)', emoji: '🫘' },
  { slug: 'chilli', name_en: 'Hot Chilli (खुर्सानी)', emoji: '🌶️' },
  { slug: 'strawberry', name_en: 'Strawberry (स्ट्रबेरी)', emoji: '🍓' }
];

const MONTHS = [
  { id: 1, name: 'Jan (पुष/माघ)' },
  { id: 2, name: 'Feb (माघ/फागुन)' },
  { id: 3, name: 'Mar (फागुन/चैत)' },
  { id: 4, name: 'Apr (चैत/बैशाख)' },
  { id: 5, name: 'May (बैशाख/जेठ)' },
  { id: 6, name: 'Jun (जेठ/असार)' },
  { id: 7, name: 'Jul (असार/साउन)' },
  { id: 8, name: 'Aug (साउन/भदौ)' },
  { id: 9, name: 'Sep (भदौ/असोज)' },
  { id: 10, name: 'Oct (असोज/कार्तिक)' },
  { id: 11, name: 'Nov (कार्तिक/मंसिर)' },
  { id: 12, name: 'Dec (मंसिर/पुष)' }
];

export default function BacktestingView() {
  const { district, language, setSelectedWhatIfCrop, setActiveTab } = useApp();
  
  const [selectedCrop, setSelectedCrop] = useState('cucumber');
  const [targetMonth, setTargetMonth] = useState(12);
  const [tunnelArea, setTunnelArea] = useState(250);
  const [loading, setLoading] = useState(false);
  const [backtestData, setBacktestData] = useState(null);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runBacktest({
        crop_slug: selectedCrop,
        target_harvest_month: parseInt(targetMonth),
        tunnel_area_sqm: parseFloat(tunnelArea) || 250,
        language
      });
      setBacktestData(res);
    } catch (err) {
      console.error('Backtest failed:', err);
      setError('Failed to compute historical simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, [selectedCrop, targetMonth]);

  const handleLaunchSimulator = () => {
    setSelectedWhatIfCrop({
      slug: selectedCrop,
      name_en: backtestData?.crop_name_en || selectedCrop,
      expected_harvest_date: `Month ${targetMonth}`,
      estimated_price_range: `NPR ${(backtestData?.yearly_breakdown?.[4]?.historical_mandi_price || 80) * 0.9} - ${(backtestData?.yearly_breakdown?.[4]?.historical_mandi_price || 80) * 1.15}`,
      expected_yield_kg: backtestData?.yearly_breakdown?.[4]?.estimated_yield_kg || 2500,
      total_cost_npr: backtestData?.yearly_breakdown?.[4]?.production_cost_npr || 30000,
      net_profit_npr: backtestData?.avg_annual_profit_npr || 120000,
      roi_pct: backtestData?.avg_roi_pct || 150
    });
    setActiveTab('what-if');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <History className="w-3.5 h-3.5" />
              <span>Section 25: 5-Year Strategy Backtesting (2022 – 2026)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'ne' ? '५-वर्षे ऐतिहासिक रणनीति परीक्षण (Backtest)' : 'Historical Strategy Backtester'}
            </h1>
            <p className="text-emerald-200/80 text-sm mt-1 max-w-2xl">
              {language === 'ne'
                ? 'यदि विगत ५ वर्ष यही महिनामा उत्पादन गरिएको भए कति नाफा हुन्थ्यो? कालिमाटी मन्डीको वास्तविक अभिलेखबाट प्रमाणित।'
                : 'Evaluate how this specific off-season crop plan would have performed over the last 5 real agricultural years (2022–2026) in Nepal.'}
            </p>
          </div>

          <button
            onClick={runTest}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-emerald-500/25 transition disabled:opacity-50 self-start md:self-auto"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ne' ? 'पुन: परीक्षण गर्नुहोस्' : 'Re-run Backtest'}</span>
          </button>
        </div>

        {/* Configuration Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-emerald-500/20">
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
              {language === 'ne' ? 'बाली चयन गर्नुहोस्' : 'Select Crop'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-800/80 border border-emerald-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {CROPS_LIST.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
              {language === 'ne' ? 'लक्षित फसल महिना' : 'Target Harvest Month'}
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full bg-slate-800/80 border border-emerald-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {MONTHS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
              {language === 'ne' ? 'टनेल क्षेत्रफल (वर्ग मिटर)' : 'Tunnel Area (m²)'}
            </label>
            <input
              type="number"
              value={tunnelArea}
              onChange={(e) => setTunnelArea(e.target.value)}
              min="50"
              max="5000"
              step="50"
              className="w-full bg-slate-800/80 border border-emerald-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {backtestData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'सफलता दर (Win Rate)' : 'Strategy Win Rate'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                backtestData.win_rate_pct >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'
              }`}>
                {backtestData.win_rate_pct}%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
              {backtestData.profitable_seasons} / {backtestData.total_seasons} Seasons
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {backtestData.profitable_seasons} profitable, {backtestData.loss_seasons} net loss
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'औसत वार्षिक खुद नाफा' : 'Avg Annual Net Profit'}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              NPR {backtestData.avg_annual_profit_npr?.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across {backtestData.tunnel_area_sqm} m² tunnel cultivation
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'औसत प्रतिफल (Avg ROI)' : 'Average ROI'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
              +{backtestData.avg_roi_pct}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Net return over all input & logistics expenses
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'बाली र लक्षित विन्डो' : 'Target Window'}
              </span>
              <div className="text-lg font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-2">
                <span>{backtestData.icon_emoji}</span>
                <span>{backtestData.crop_name_en}</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {backtestData.target_harvest_month_name}
              </p>
            </div>
            <button
              onClick={handleLaunchSimulator}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <span>Test in What-If Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5-Year Breakdown Table */}
      {backtestData && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ne' ? 'वर्ष अनुसार ऐतिहासिक नतिजा (२०२२ – २०२६)' : 'Year-by-Year Historical Breakdown'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulated with verified Kalimati Mandi wholesale arrivals, real transport friction (5%), and NARC input costs.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated: {backtestData.evaluated_at}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'वर्ष' : 'Year'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'रोपण/फसल तालिका' : 'Plant / Harvest'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'कालिमाटी मूल्य' : 'Kalimati Mandi'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'उत्पादन (के.जी.)' : 'Yield'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'कुल लागत' : 'Cost (Prod + Transport)'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'कुल आम्दानी' : 'Gross Revenue'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'खुद नाफा' : 'Net Profit'}</th>
                  <th className="px-4 py-3.5">{language === 'ne' ? 'प्रतिफल' : 'ROI'}</th>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'बजार अवस्था' : 'Market Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {backtestData.yearly_breakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {row.is_profitable ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span>{row.year}</span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{row.harvest_period}</div>
                      <div className="text-slate-400">{row.planting_period}</div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                      NPR {row.historical_mandi_price}/kg
                    </td>
                    <td className="px-4 py-4">
                      {row.estimated_yield_kg.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div>NPR {(row.production_cost_npr + row.transport_loss_cost_npr).toLocaleString()}</div>
                      <div className="text-slate-400">Trans: NPR {row.transport_loss_cost_npr.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-200">
                      NPR {row.gross_revenue_npr.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold ${
                        row.net_profit_npr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {row.net_profit_npr >= 0 ? '+' : ''}NPR {row.net_profit_npr.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        row.roi_pct >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {row.roi_pct >= 0 ? '+' : ''}{row.roi_pct}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      {row.market_notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mandatory Historical Disclaimer */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{language === 'ne' ? 'ऐतिहासिक डेटा अस्वीकरण (Disclaimer)' : 'Historical Simulation Transparency Notice'}:</p>
              <p className="mt-0.5">{backtestData.disclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
