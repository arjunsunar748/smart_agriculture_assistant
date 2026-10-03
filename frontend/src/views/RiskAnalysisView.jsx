import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CloudRain,
  DollarSign,
  TrendingDown,
  Info,
  Thermometer,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

const RISK_PROFILES = [
  {
    id: 'low_risk',
    label_en: 'Low Risk',
    label_ne: 'न्यून जोखिम',
    icon: ShieldCheck,
    badgeColor: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    desc_en: 'Prioritizes robust cold tolerance, minimal pest vulnerability, low capital investment, and guaranteed domestic kitchen absorption.'
  },
  {
    id: 'balanced',
    label_en: 'Balanced',
    label_ne: 'सन्तुलित दृष्टिकोण',
    icon: Filter,
    badgeColor: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    desc_en: 'Optimizes return-to-risk equilibrium. Leverages poly-tunnels to buffer moderate chilling while capturing solid scarcity premiums.'
  },
  {
    id: 'high_opportunity',
    label_en: 'High Opportunity',
    label_ne: 'उच्च प्रतिफल / जोखिम',
    icon: Flame,
    badgeColor: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    desc_en: 'Targets maximum pricing spikes (+100% to +150% over main-season glut) when open fields completely freeze. Requires proactive microclimate care.'
  }
];

export default function RiskAnalysisView() {
  const { district, language, setSelectedWhatIfCrop, setActiveTab } = useApp();

  const [activeProfile, setActiveProfile] = useState('balanced');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const res = await api.getRiskAnalysis(district, activeProfile);
      setRiskData(res);
    } catch (err) {
      console.error('Failed to load risk analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, [district, activeProfile]);

  const filteredCrops = riskData?.crop_risks?.filter((c) => {
    if (selectedCropFilter === 'all') return true;
    return c.overall_risk_rating.toLowerCase() === selectedCropFilter.toLowerCase();
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-rose-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Sections 18, 21, 22: Risk Analysis & Price Crash Risk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'ne' ? 'जोखिम विश्लेषण र मूल्य गिरावट सम्भावना' : 'Off-Season Risk & Crash Intelligence'}
            </h1>
            <p className="text-rose-200/80 text-sm mt-1 max-w-2xl">
              {language === 'ne'
                ? 'कालिमाटीको मौसमी बाढी, भारतीय आयात, र हिउँदे तुषारो (Frost) जोखिमको वैज्ञानिक मूल्याङ्कन।'
                : 'Comprehensive risk modeling: price crash exposure, nocturnal freeze threats, and disease vulnerabilities across Nepal\'s agro-climatic zones.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300">
            <span>District:</span>
            <span className="font-bold text-white">{district}</span>
          </div>
        </div>

        {/* 3 Interactive Risk Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-rose-500/20">
          {RISK_PROFILES.map((p) => {
            const Icon = p.icon;
            const isSelected = activeProfile === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProfile(p.id)}
                className={`p-4 rounded-xl text-left border transition ${
                  isSelected
                    ? 'bg-white/10 border-rose-400 ring-2 ring-rose-400/30'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm text-white">
                    {language === 'ne' ? p.label_ne : p.label_en}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300/80 mt-1.5 line-clamp-2">
                  {p.desc_en}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {language === 'ne' ? 'जोखिम अनुसार फिल्टर' : 'Filter Risk'}:
          </span>
          {['all', 'low', 'medium', 'high'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedCropFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                selectedCropFilter === lvl
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCrops.length}</span> crop models evaluated
        </div>
      </div>

      {/* Crop Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCrops.map((crop) => {
          const isLow = crop.overall_risk_rating === 'Low';
          const isMed = crop.overall_risk_rating === 'Medium';
          const isHigh = crop.overall_risk_rating === 'High';

          return (
            <div
              key={crop.crop_slug}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      {crop.icon_emoji}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {language === 'ne' ? crop.name_ne : crop.name_en}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {crop.name_en} ({crop.name_ne})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isLow
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : isMed
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {crop.overall_risk_rating} Risk
                  </span>
                </div>

                {/* Crash Risk Verdict Box */}
                <div className="mt-4 p-3.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Price Crash Risk Verdict</span>
                  </div>
                  <p className="text-xs text-rose-900/90 dark:text-rose-200/90 mt-1 font-medium">
                    {crop.price_crash_risk_verdict}
                  </p>
                </div>

                {/* Harvest Atmospheric Risk */}
                <div className="mt-3 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Harvest-Time Weather Outlook</span>
                  </div>
                  <p className="text-xs text-blue-900/90 dark:text-blue-200/90 mt-1">
                    {crop.harvest_weather_outlook}
                  </p>
                </div>

                {/* Multi-Factor Score Bars */}
                <div className="mt-4 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      <span>Profit Potential</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{crop.profit_potential_score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${crop.profit_potential_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      <span>Market Scarcity Window</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{crop.market_opportunity_score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${crop.market_opportunity_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        <span>Weather Risk</span>
                        <span className="font-semibold">{crop.weather_risk_score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${crop.weather_risk_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        <span>Disease Risk</span>
                        <span className="font-semibold">{crop.disease_risk_score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${crop.disease_risk_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Vol: {crop.price_volatility_score}% • Inv: {crop.investment_requirement_score}%
                </span>
                <button
                  onClick={() => {
                    setSelectedWhatIfCrop({
                      slug: crop.crop_slug,
                      name_en: crop.name_en,
                      expected_harvest_date: 'Target Winter Scarcity',
                      estimated_price_range: 'NPR 85 - 120/kg',
                      expected_yield_kg: 2800,
                      total_cost_npr: 32000,
                      net_profit_npr: 140000,
                      roi_pct: 165
                    });
                    setActiveTab('what-if');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <span>Simulate Crop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
