import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  RotateCcw,
  Calendar,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';

const MONTHS = [
  { id: 1, en: 'January', ne: 'पुष/माघ', bs: 'Magh' },
  { id: 2, en: 'February', ne: 'माघ/फागुन', bs: 'Falgun' },
  { id: 3, en: 'March', ne: 'फागुन/चैत', bs: 'Chaitra' },
  { id: 4, en: 'April', ne: 'चैत/बैशाख', bs: 'Baishakh' },
  { id: 5, en: 'May', ne: 'बैशाख/जेठ', bs: 'Jestha' },
  { id: 6, en: 'June', ne: 'जेठ/असार', bs: 'Ashadh' },
  { id: 7, en: 'July', ne: 'असार/साउन', bs: 'Shrawan' },
  { id: 8, en: 'August', ne: 'साउन/भदौ', bs: 'Bhadra' },
  { id: 9, en: 'September', ne: 'भदौ/असोज', bs: 'Ashoj' },
  { id: 10, en: 'October', ne: 'असोज/कार्तिक', bs: 'Kartik' },
  { id: 11, en: 'November', ne: 'कार्तिक/मंसिर', bs: 'Mangsir' },
  { id: 12, en: 'December', ne: 'मंसिर/पुष', bs: 'Poush' }
];

export default function BackwardPlanningView() {
  const { district, farmingMethod, language, t, setSelectedWhatIfCrop, setActiveTab } = useApp();
  
  // Default to December (peak off-season wedding/winter window)
  const [targetMonth, setTargetMonth] = useState(12);
  const [tunnelArea, setTunnelArea] = useState(250);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'window_active', 'upcoming', 'missed'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchBackwardPlan = async () => {
    setLoading(true);
    try {
      const res = await api.getBackwardPlan({
        target_harvest_month: parseInt(targetMonth),
        target_harvest_year: 2026,
        district,
        farming_method: farmingMethod,
        tunnel_area_sqm: parseFloat(tunnelArea) || 250,
        language
      });
      setResult(res);
    } catch (err) {
      console.error('Failed to load backward plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackwardPlan();
  }, [targetMonth, district, farmingMethod, language]);

  const activeMonthInfo = MONTHS.find((m) => m.id === parseInt(targetMonth)) || MONTHS[11];

  const filteredCrops = (result?.crops || []).filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const activeCount = (result?.crops || []).filter((c) => c.status === 'window_active').length;
  const upcomingCount = (result?.crops || []).filter((c) => c.status === 'upcoming').length;

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <RotateCcw className="text-emerald-600" />
            {language === 'ne' ? '🔄 उल्टो बाली योजना (Reverse Crop Planning)' : '🔄 Reverse Crop Planning'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'भविष्यको महँगो बजार महिना छान्नुहोस् → फसल तयार हुने समयबाट वृद्धि अवधि घटाई आज कहिले रोप्ने हिसाब गर्नुहोस्।'
              : 'Target Future High-Value Period → Expected Harvest Date → Subtract Growth Duration → Recommended Seeding Date.'}
          </p>
        </div>
        <div className="badge-no-iot">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>ZERO IoT • 100% ALGORITHMIC MODELING</span>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 shadow-sm border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block mb-1">
              BACKWARD CROP PLANNING ALGORITHM
            </span>
            <h3 className="text-lg font-bold">
              {language === 'ne'
                ? '“पहिले भविष्यको बजार खोज्नुहोस्, अनि मात्र आज के रोप्ने तय गर्नुहोस्”'
                : '“Identify the Future High-Value Window First, Then Calculate Planting Date”'}
            </h3>
            <p className="text-sm text-emerald-100 mt-1">
              {language === 'ne'
                ? `लक्षित महिना: ${activeMonthInfo.ne} (${activeMonthInfo.en} / ${activeMonthInfo.bs}) मा बजार मूल्य बढी हुने सम्भावना भएका बालीहरूको रोप्ने तालिका।`
                : `Targeting ${activeMonthInfo.en} (${activeMonthInfo.bs}) peak mandi prices via controlled microclimate buffering.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-800/80 px-4 py-2 rounded-lg text-center border border-emerald-700">
              <span className="text-2xl font-black text-amber-300">{activeCount}</span>
              <span className="text-[11px] text-emerald-200 block font-medium">
                {language === 'ne' ? 'अहिले सक्रिय' : 'Active Windows'}
              </span>
            </div>
            <div className="bg-emerald-800/80 px-4 py-2 rounded-lg text-center border border-emerald-700">
              <span className="text-2xl font-black text-sky-300">{upcomingCount}</span>
              <span className="text-[11px] text-emerald-200 block font-medium">
                {language === 'ne' ? 'आगामी' : 'Upcoming'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Month Selector Ribbon */}
      <div className="filter-card">
        <label className="filter-label mb-2 flex items-center gap-1">
          <Calendar size={14} className="text-emerald-600" />
          <span>{language === 'ne' ? '१. लक्षित फसल महिना छान्नुहोस् (Target Harvest Month):' : '1. Select Target Harvest Month:'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {MONTHS.map((m) => {
            const isSelected = parseInt(targetMonth) === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTargetMonth(m.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-mono">M{m.id}</span>
                  {isSelected && <span className="text-xs text-emerald-600 font-bold">✓</span>}
                </div>
                <div className="text-sm font-semibold">{m.en}</div>
                <div className="text-xs text-gray-500">{m.ne}</div>
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              {language === 'ne' ? 'अवस्था अनुसार छान्नुहोस्:' : 'Filter Status:'}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {language === 'ne' ? 'सबै' : 'All'} ({result?.crops?.length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('window_active')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  statusFilter === 'window_active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                🟢 {language === 'ne' ? 'अहिले सक्रिय' : 'Active (Plant Now)'} ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  statusFilter === 'upcoming'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                🟡 {language === 'ne' ? 'आगामी' : 'Upcoming'} ({upcomingCount})
              </button>
              <button
                onClick={() => setStatusFilter('missed')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  statusFilter === 'missed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                🔴 {language === 'ne' ? 'समय घर्किसक्यो' : 'Window Passed'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{language === 'ne' ? 'टनेल क्षेत्रफल:' : 'Tunnel Area:'}</span>
            <input
              type="number"
              value={tunnelArea}
              onChange={(e) => setTunnelArea(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
            />
            <span>m²</span>
          </div>
        </div>
      </div>

      {/* Summary Message */}
      {result && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2">
          <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'ne' ? result.summary_ne : result.summary_en}
          </p>
        </div>
      )}

      {/* Crops Plan Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCrops.map((crop) => (
            <div
              key={crop.crop_slug}
              className={`p-5 rounded-xl border transition-all ${
                crop.status === 'window_active'
                  ? 'bg-white border-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
                  : crop.status === 'upcoming'
                  ? 'bg-white border-amber-300'
                  : 'bg-gray-50 border-gray-200 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Left: Avatar + Title + Status */}
                <div className="flex items-start gap-3">
                  <div className="text-3xl p-2 bg-gray-50 rounded-xl border border-gray-100">
                    {crop.icon_emoji}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-gray-900">
                        {language === 'ne' ? crop.name_ne : crop.name_en}
                      </h4>
                      <span className="text-xs text-gray-500">
                        ({language === 'ne' ? crop.name_en : crop.name_ne})
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                          crop.status === 'window_active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : crop.status === 'upcoming'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        <span>{crop.verdict_badge}</span>
                        <span>{language === 'ne' ? crop.status_label_ne : crop.status_label_en}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1">
                      {crop.market_opportunity_summary}
                    </p>
                  </div>
                </div>

                {/* Right: Quick Economics */}
                <div className="flex flex-wrap items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">
                      {language === 'ne' ? 'लक्षित महिना मूल्य' : 'Target Price'}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">
                      {crop.estimated_price_range}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">
                      {language === 'ne' ? 'अनुमानित नाफा' : 'Est. Profit'}
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      NPR {crop.expected_profit_normal_npr?.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">
                      {language === 'ne' ? 'प्रतिफल' : 'ROI'}
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {crop.roi_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Backward Timing Formula Strip */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                      {language === 'ne' ? '१. लक्षित फसल मिति' : '1. Target Harvest'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {activeMonthInfo.en} 15 ({activeMonthInfo.ne})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                      {language === 'ne' ? '२. वृद्धि अवधि' : '2. Growth Duration'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {crop.growing_duration_days_range}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-emerald-700 uppercase block font-bold">
                      {language === 'ne' ? '३. सिफारिस गरिएको रोप्ने समय (Planting Window)' : '3. Required Seeding Window'}
                    </span>
                    <span className="font-extrabold text-emerald-800 text-sm">
                      {crop.required_planting_start} – {crop.required_planting_end}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tunnel Feasibility Rationale & Action */}
              <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck size={16} className={crop.can_tunnel_make_it_possible ? 'text-emerald-600' : 'text-amber-500'} />
                  <span>{crop.tunnel_feasibility_rationale}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedWhatIfCrop(crop.crop_slug);
                      setActiveTab('what_if');
                    }}
                    className="btn-outline-sm flex items-center gap-1"
                  >
                    <DollarSign size={13} />
                    <span>{language === 'ne' ? 'सिमुलेटरमा जाँच्नुहोस्' : 'Test Sensitivity'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('what_to_plant')}
                    className="btn-primary-sm flex items-center gap-1"
                  >
                    <span>{language === 'ne' ? 'विस्तृत योजना' : 'Forward Plan'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
