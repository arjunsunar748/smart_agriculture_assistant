import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Cpu,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function MarketTrendsView() {
  const { selectedCropForDetail, setSelectedCropForDetail, setSelectedWhatIfCrop, setActiveTab, language, t } = useApp();
  const [cropsList, setCropsList] = useState([]);
  const [seasonalityData, setSeasonalityData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadAllMarketData() {
      if (!selectedCropForDetail) return;
      setLoading(true);
      try {
        const [seas, trends] = await Promise.all([
          api.getCropSeasonality(selectedCropForDetail).catch(() => null),
          api.getMarketTrends(selectedCropForDetail).catch(() => null)
        ]);
        setSeasonalityData(seas);
        setTrendData(trends);
      } catch (err) {
        console.error('Failed to load market intelligence:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllMarketData();
  }, [selectedCropForDetail]);

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <LineChartIcon className="text-emerald-600" />
            {language === 'ne' ? '📈 मौसमी मूल्य र बजार अन्तर विश्लेषण (Price Seasonality)' : '📈 Historical Price Seasonality & Market Gap Intelligence'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'कालीमाटी बजारको ५ वर्षे ऐतिहासिक थोक मूल्य र तरकारी आगमन सूचकांकको विश्लेषण।'
              : '12-Month Kalimati Wholesale Price Curves & Mandi Arrival Scarcity Indices.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-semibold">{language === 'ne' ? 'बाली छान्नुहोस्:' : 'Select Crop:'}</label>
          <select
            value={selectedCropForDetail}
            onChange={(e) => setSelectedCropForDetail(e.target.value)}
            className="filter-input w-52 font-semibold text-emerald-950"
          >
            {cropsList.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon_emoji} {language === 'ne' ? c.name_ne : c.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !seasonalityData ? (
        <div className="h-96 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="kpi-metric-card">
              <span className="kpi-label">{language === 'ne' ? 'हालको थोक मूल्य' : 'Current Mandi Price'}</span>
              <span className="kpi-value text-xl">
                {t('currency')} {trendData?.current_avg_price ? trendData.current_avg_price.toFixed(0) : '---'}/kg
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">Live Kalimati Mandi</span>
            </div>

            <div className="kpi-metric-card">
              <span className="kpi-label">{language === 'ne' ? '७ दिने परिवर्तन' : '7-Day Price Velocity'}</span>
              <span
                className={`kpi-value text-xl ${
                  trendData?.trend_7d_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trendData?.trend_7d_pct >= 0 ? '↑' : '↓'} {Math.abs(trendData?.trend_7d_pct || 0).toFixed(1)}%
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">Short-term Momentum</span>
            </div>

            <div className="kpi-metric-card">
              <span className="kpi-label">{language === 'ne' ? 'बजार अन्तर सम्भावना' : 'Market Gap Opportunity'}</span>
              <span className="kpi-value text-xl text-emerald-700">
                HIGH
              </span>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                Off-season price spike
              </span>
            </div>

            <div className="kpi-metric-card">
              <span className="kpi-label">{language === 'ne' ? 'टनेल सुरक्षा स्तर' : 'Tunnel Advantage'}</span>
              <span className="kpi-value text-xl text-emerald-700">
                92%
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Thermal & rain exclusion
              </span>
            </div>
          </div>

          {/* Core Dual-Axis Chart: 12-Month Price Curve vs Arrival Scarcity Index */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>
                    {language === 'ne'
                      ? `${seasonalityData.name_ne} - १२ महिनाको औसत थोक मूल्य र बजार आपूर्ति वक्र`
                      : `${seasonalityData.name_en} - 12-Month Wholesale Price Curve & Mandi Arrival Index`}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Dual-Axis Analysis: Green line = Historical wholesale price (NPR/kg); Slate bars = Mandi arrival volume index (100 = base average).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span>
                  <span className="font-medium text-gray-700">Price (NPR/kg)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-slate-300 rounded-sm"></span>
                  <span className="font-medium text-gray-700">Arrivals Index</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={seasonalityData.monthly_curves} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey={language === 'ne' ? 'month_name_ne' : 'month_name'}
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#059669"
                    tick={{ fontSize: 11 }}
                    unit=" NPR"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    unit=" idx"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white p-3 rounded-lg text-xs space-y-1 shadow-lg">
                            <div className="font-bold border-b border-gray-700 pb-1">
                              {d.month_name} ({d.month_name_ne})
                            </div>
                            <div className="text-emerald-300">
                              Wholesale Price: <strong>NPR {d.price_npr.toFixed(0)}/kg</strong>
                            </div>
                            <div className="text-slate-300">
                              Arrival Volume Index: <strong>{d.arrival_index}/100</strong>
                            </div>
                            <div className="text-[10px] text-gray-400 italic">
                              {d.arrival_index < 60 ? '⚡ Severe Scarcity (Off-Season Premium)' : d.arrival_index > 140 ? '🌊 Heavy Glut (Open Field Supply)' : 'Normal Flow'}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="arrival_index"
                    name="Arrival Index"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="price_npr"
                    name="Avg Price (NPR)"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Gap Thesis & Gluts vs Scarcity (Section 4 & 12) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <h4 className="font-bold text-emerald-950 uppercase text-[11px] flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-700" />
                <span>{language === 'ne' ? 'उच्च मूल्य र अभावको समय (Peak Scarcity Window)' : 'Peak Scarcity Window'}</span>
              </h4>
              <p className="font-semibold text-emerald-900 text-sm">
                {seasonalityData.peak_scarcity_window}
              </p>
              <p className="text-gray-700 leading-relaxed pt-1">
                {seasonalityData.market_gap_thesis}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Info size={14} className="text-slate-600" />
                <span>{language === 'ne' ? 'मुख्य सिजनको बाढी (Glut Window)' : 'Open-Field Glut Window'}</span>
              </h4>
              <p className="font-semibold text-slate-800 text-sm">
                {seasonalityData.glut_window}
              </p>
              <p className="text-gray-600 leading-relaxed pt-1">
                During this period, open-field harvest floods the wholesale mandis from hill and terai flatlands. Prices collapse to production cost floors. Growing in tunnels during this window produces poor economic returns.
              </p>
            </div>
          </div>

          {/* Monthly Numerical Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs font-bold text-gray-700">
              <span>12-MONTH KALIMATI WHOLESALE DATASET</span>
              <span>CALENDAR BENCHMARKS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50/50 text-[10px] text-gray-500 uppercase border-b border-gray-100">
                  <tr>
                    <th className="p-3">Month</th>
                    <th className="p-3">BS Month</th>
                    <th className="p-3">Avg Wholesale Price</th>
                    <th className="p-3">Arrival Index</th>
                    <th className="p-3">Market Condition</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {seasonalityData.monthly_curves.map((row) => (
                    <tr key={row.month_num} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">{row.month_name}</td>
                      <td className="p-3 text-gray-600">{row.month_name_ne}</td>
                      <td className="p-3 font-bold text-emerald-800">NPR {row.price_npr.toFixed(0)}/kg</td>
                      <td className="p-3 font-mono text-gray-700">{row.arrival_index}/100</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.arrival_index < 60
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.arrival_index > 140
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {row.arrival_index < 60 ? '🟢 Scarcity' : row.arrival_index > 140 ? '🔴 Glut' : '⚪ Normal'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedWhatIfCrop(seasonalityData.crop_slug);
                            setActiveTab('what_if');
                          }}
                          className="text-xs text-emerald-700 font-semibold hover:underline"
                        >
                          Simulate →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
