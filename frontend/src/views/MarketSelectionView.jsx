import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Truck,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Store,
  Layers
} from 'lucide-react';

const CROPS = [
  { slug: 'tomato', name: 'Tomato (गोलभेँडा)', emoji: '🍅' },
  { slug: 'cucumber', name: 'Cucumber (काँक्रो)', emoji: '🥒' },
  { slug: 'capsicum', name: 'Capsicum (भेडे खुर्सानी)', emoji: '🫑' },
  { slug: 'cauliflower', name: 'Cauliflower (काउली)', emoji: '🥦' },
  { slug: 'cabbage', name: 'Cabbage (बन्दा)', emoji: '🥬' },
  { slug: 'spinach', name: 'Spinach (पालुङ्गो)', emoji: '🥗' },
  { slug: 'french_beans', name: 'French Beans (सिमी)', emoji: '🫘' }
];

export default function MarketSelectionView() {
  const { district, language } = useApp();

  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [expectedYield, setExpectedYield] = useState(3000);
  const [prodCost, setProdCost] = useState(45000);
  const [targetMonth, setTargetMonth] = useState(12);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await api.compareMarketDestinations({
        crop_slug: selectedCrop,
        district,
        expected_yield_kg: parseFloat(expectedYield) || 3000,
        production_cost_npr: parseFloat(prodCost) || 45000,
        target_month: parseInt(targetMonth)
      });
      setData(res);
    } catch (err) {
      console.error('Failed to compare markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [selectedCrop, expectedYield, prodCost, targetMonth, district]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-amber-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Truck className="w-3.5 h-3.5" />
              <span>Section 19: Market Destination Selection</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'ne' ? 'बजार गन्तव्य छनोट र नाफा तुलना' : 'Market Destination Profit Comparison'}
            </h1>
            <p className="text-amber-200/80 text-sm mt-1 max-w-2xl">
              {language === 'ne'
                ? 'स्थानीय हाटबजार, क्षेत्रीय मन्डी वा कालिमाटी थोक बजार? ढुवानी भाडा र नोक्सानी कटाएर खुद नाफा तुलना गर्नुहोस्।'
                : 'Compare net margins across Local Haat, Regional Mandi, and Central Kalimati Wholesale after freight costs and transit losses.'}
            </p>
          </div>

          <button
            onClick={fetchMarkets}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-amber-500/25 transition disabled:opacity-50 self-start md:self-auto"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ne' ? 'गणना गर्नुहोस्' : 'Recalculate Margins'}</span>
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-amber-500/20">
          <div>
            <label className="block text-xs font-semibold text-amber-200 mb-1.5">
              {language === 'ne' ? 'बाली' : 'Crop'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-800/80 border border-amber-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {CROPS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200 mb-1.5">
              {language === 'ne' ? 'अनुमानित उत्पादन (के.जी.)' : 'Expected Yield (kg)'}
            </label>
            <input
              type="number"
              value={expectedYield}
              onChange={(e) => setExpectedYield(e.target.value)}
              min="100"
              step="100"
              className="w-full bg-slate-800/80 border border-amber-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200 mb-1.5">
              {language === 'ne' ? 'उत्पादन लागत (NPR)' : 'Production Cost (NPR)'}
            </label>
            <input
              type="number"
              value={prodCost}
              onChange={(e) => setProdCost(e.target.value)}
              min="5000"
              step="5000"
              className="w-full bg-slate-800/80 border border-amber-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200 mb-1.5">
              {language === 'ne' ? 'बिक्री महिना' : 'Target Selling Month'}
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full bg-slate-800/80 border border-amber-500/30 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="12">December (Poush / Wedding)</option>
              <option value="1">January (Magh / Freeze)</option>
              <option value="2">February (Falgun / Spring)</option>
              <option value="7">July (Shrawan / Monsoon)</option>
              <option value="8">August (Bhadra / High Rain)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data?.destinations?.map((dest, idx) => (
          <div
            key={dest.market_id}
            className={`rounded-2xl border p-5 flex flex-col justify-between transition shadow-sm ${
              idx === 0
                ? 'bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-800 border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {dest.market_tier}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.distance_km} km</span>
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3">
                {dest.market_name}
              </h3>

              {/* Price & ROI */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <div className="text-xs text-slate-500 dark:text-slate-400">Wholesale Realization</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  NPR {dest.expected_wholesale_price}/kg
                </div>
              </div>

              {/* Cost & Loss Breakdown */}
              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Transit Freight:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    -NPR {dest.transport_cost_total_npr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Post-Harvest Loss:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {dest.post_harvest_loss_pct}% (-NPR {dest.loss_amount_npr.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-medium">
                  <span>Net Revenue:</span>
                  <span className="text-slate-900 dark:text-white">
                    NPR {dest.net_revenue_npr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Net Profit Big Box */}
              <div className="mt-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold uppercase">
                  Projected Net Profit
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  NPR {dest.net_profit_npr.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">
                  Return on Investment: +{dest.roi_pct}%
                </div>
              </div>

              {/* Notes */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic">
                "{dest.notes}"
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 text-right">
              Recommendation rank: #{idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
