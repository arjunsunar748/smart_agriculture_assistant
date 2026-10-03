import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function SupplyDemandView() {
  const { language, setActiveTab } = useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const fetchSupplyGaps = async () => {
    setLoading(true);
    try {
      const res = await api.getSupplyGapAnalysis();
      setData(res);
    } catch (err) {
      console.error('Failed to load supply gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplyGaps();
  }, []);

  const filteredGaps = data?.gaps?.filter((g) => {
    const matchesSearch =
      g.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.name_ne.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filterSeverity === 'all') return true;
    if (filterSeverity === 'severe') return g.supply_condition_badge.includes('Severe');
    if (filterSeverity === 'moderate') return g.supply_condition_badge.includes('Moderate');
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Section 20: Supply Gap Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'ne' ? 'बजार आपूर्ति खाडल विश्लेषण (Supply Gap)' : 'Mandi Supply Gap Intelligence'}
            </h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-2xl">
              {language === 'ne'
                ? 'कालिमाटी थोक बजारमा मौसमी आगमन घट्दा मूल्य कसरी बढ्छ? खुल्ला खेतमा उत्पादन ठप्प हुने अवधिको पहिचान।'
                : 'Identifies deep contractions in wholesale mandi arrivals when open fields are incapacitated by winter freeze or monsoon floods.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/60 px-4 py-2.5 rounded-xl border border-blue-500/30 text-xs text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Verified Kalimati Daily Dispatch Ledger</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-blue-500/20">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'ne' ? 'बाली खोज्नुहोस्...' : 'Search vegetables by name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-blue-500/30 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                filterSeverity === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              All Arrivals
            </button>
            <button
              onClick={() => setFilterSeverity('severe')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                filterSeverity === 'severe'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Severe Shortages (&lt;50% Supply)
            </button>
            <button
              onClick={() => setFilterSeverity('moderate')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                filterSeverity === 'moderate'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Moderate Contraction
            </button>
          </div>
        </div>
      </div>

      {/* Supply Gap Table / Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'ne' ? 'कालिमाटी थोक आगमन संकुचन र मूल्य वृद्धि तालिका' : 'Arrivals Contraction vs Wholesale Price Surge'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated during peak winter off-season (Mangsir – Magh / Dec – Jan)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredGaps.length} commodities monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">{language === 'ne' ? 'तरकारी' : 'Vegetable'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'लक्षित अवधि' : 'Window'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'आपूर्ति संकुचन' : 'Arrivals Contraction'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'ऐतिहासिक मूल्य वृद्धि' : 'Price Premium (+%)'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'अवस्था' : 'Condition Badge'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'विश्वासनीयता' : 'Confidence'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'योजना' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredGaps.map((item) => {
                const isSevere = item.supply_condition_badge.includes('Severe');
                const isMod = item.supply_condition_badge.includes('Moderate');

                return (
                  <tr key={item.crop_slug} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <span className="text-2xl">{item.icon_emoji}</span>
                      <div>
                        <div>{language === 'ne' ? item.name_ne : item.name_en}</div>
                        <div className="text-xs text-slate-400 font-normal">{item.name_en}</div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {item.target_period}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                        <TrendingDown className="w-4 h-4 shrink-0" />
                        <span>{item.historical_arrivals_change_pct}%</span>
                      </div>
                      <span className="text-[11px] text-slate-400">vs peak annual arrivals</span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span>+{item.historical_price_change_pct}%</span>
                      </div>
                      <span className="text-[11px] text-slate-400">over glut price floor</span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          isSevere
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isMod
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {item.supply_condition_badge}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {item.confidence}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setActiveTab('backward-planning')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <span>Reverse Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
