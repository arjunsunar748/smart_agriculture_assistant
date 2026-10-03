import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Scale,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const AVAILABLE_CROPS = [
  { slug: 'tomato', name_en: 'Tomato', name_ne: 'गोलभेडा', icon: '🍅' },
  { slug: 'cucumber', name_en: 'Cucumber', name_ne: 'काँक्रो', icon: '🥒' },
  { slug: 'capsicum', name_en: 'Capsicum (Sweet Pepper)', name_ne: 'भेडे खुर्सानी', icon: '🫑' },
  { slug: 'chilli', name_en: 'Chilli', name_ne: 'खुर्सानी', icon: '🌶️' },
  { slug: 'cauliflower', name_en: 'Cauliflower', name_ne: 'काउली', icon: '🥦' },
  { slug: 'cabbage', name_en: 'Cabbage', name_ne: 'बन्दा', icon: '🥬' },
  { slug: 'brinjal', name_en: 'Brinjal', name_ne: 'भन्टा', icon: '🍆' },
  { slug: 'beans', name_en: 'French Beans', name_ne: 'सिमी', icon: '🫘' },
  { slug: 'peas', name_en: 'Green Peas', name_ne: 'केराउ', icon: '🟢' },
  { slug: 'bitter_gourd', name_en: 'Bitter Gourd', name_ne: 'तितो करेला', icon: '🥒' }
];

export default function CropComparisonView() {
  const { district, farmingMethod, language, t, setSelectedWhatIfCrop, setActiveTab } = useApp();

  const [selectedSlugs, setSelectedSlugs] = useState(['tomato', 'cucumber', 'capsicum']);
  const [tunnelArea, setTunnelArea] = useState(250);
  const [plantingDate, setPlantingDate] = useState('2026-09-20');
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleCropSelection = (slug) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length > 2) {
        setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
      }
    } else {
      if (selectedSlugs.length < 4) {
        setSelectedSlugs([...selectedSlugs, slug]);
      }
    }
  };

  const loadComparison = async () => {
    setLoading(true);
    try {
      const res = await api.compareOffseasonCrops({
        crop_slugs: selectedSlugs,
        district,
        tunnel_area_sqm: parseFloat(tunnelArea) || 250,
        planting_date: plantingDate,
        language
      });
      setComparisonData(res.crops || []);
    } catch (err) {
      console.error('Failed to load comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [selectedSlugs, district, tunnelArea, plantingDate, language]);

  // Chart data formatting
  const chartData = comparisonData.map((c) => ({
    name: language === 'ne' ? c.name_ne : c.name_en,
    icon: c.icon_emoji,
    profit_conservative: c.scenarios[0]?.estimated_profit_npr || 0,
    profit_normal: c.scenarios[1]?.estimated_profit_npr || 0,
    profit_high: c.scenarios[2]?.estimated_profit_npr || 0,
    harvest_price: c.historical_harvest_price_avg,
    roi: c.scenarios[1]?.roi_pct || 0
  }));

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Scale className="text-emerald-600" />
            {language === 'ne' ? '⚖️ अफ-सिजन बाली तुलना (Side-by-Side Comparison)' : '⚖️ Off-Season Crop Opportunity Comparison'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'भविष्यको बजार अवसर, उत्पादन अवधि, नाफा र जोखिमको निष्पक्ष तुलना। कुनै एक बालीलाई उत्कृष्ट घोषणा गरिँदैन।'
              : 'Side-by-side comparison based on future harvest opportunity, price scenarios, and microclimate risk.'}
          </p>
        </div>
        <div className="badge-no-iot">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>ZERO IoT • UNBIASED AGRONOMIC DECISION SUPPORT</span>
        </div>
      </div>

      {/* Crop Selector Chips */}
      <div className="filter-card space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-xs font-bold text-gray-700">
            {language === 'ne' ? 'तुलनाका लागि २ देखि ४ वटा बाली रोज्नुहोस्:' : 'Select 2 to 4 Crops to Compare Side-by-Side:'}
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Tunnel Area:</span>
            <input
              type="number"
              value={tunnelArea}
              onChange={(e) => setTunnelArea(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
            />
            <span>m²</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_CROPS.map((c) => {
            const isSelected = selectedSlugs.includes(c.slug);
            return (
              <button
                key={c.slug}
                onClick={() => toggleCropSelection(c.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{c.icon}</span>
                <span>{language === 'ne' ? c.name_ne : c.name_en}</span>
                {isSelected && <span className="ml-1 text-[10px] bg-white/20 px-1 rounded">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
      ) : (
        <div className="space-y-6">
          {/* Comparative Table (Section 16 Table Layout) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-700 flex justify-between items-center">
              <span className="uppercase tracking-wider">OFF-SEASON COMPARISON MATRIX</span>
              <span className="text-gray-500 font-normal">Area: {tunnelArea} m² Tunnel • Planting: {plantingDate}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                    <th className="p-3.5 font-bold w-1/4">Evaluation Factor</th>
                    {comparisonData.map((c) => (
                      <th key={c.crop_slug} className="p-3.5 text-center font-bold text-gray-900 border-l border-gray-200 bg-white">
                        <div className="text-2xl mb-1">{c.icon_emoji}</div>
                        <div className="text-sm font-bold">{language === 'ne' ? c.name_ne : c.name_en}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Score: {c.overall_opportunity_score.toFixed(0)}/100</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Factor: Planting Date */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Planting Date
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-medium">
                        {c.planting_date}
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Expected Harvest Window */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Expected Harvest Period
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-bold text-emerald-800">
                        {c.harvest_window_months}
                        <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                          First pick: ~{c.days_to_first_harvest} days
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Historical Harvest Price */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Historical Harvest Price
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-bold text-slate-800">
                        NPR {c.historical_harvest_price_avg.toFixed(0)}/kg
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Expected Price Range */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Expected Price Range
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-extrabold text-emerald-700">
                        {c.estimated_price_range}
                        <span className="text-[10px] text-emerald-800 block font-semibold mt-0.5">
                          +{c.market_gap_delta_pct.toFixed(0)}% vs Glut
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Tunnel Suitability */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Tunnel Suitability
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-bold text-emerald-700">
                        {c.tunnel_suitability_pct}%
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Expected Yield */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Expected Total Yield
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-semibold text-gray-800">
                        {c.expected_yield_kg.toLocaleString()} kg
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Production Cost */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Total Production Cost
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-semibold text-slate-800">
                        NPR {c.estimated_production_cost_npr.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Normal Scenario Profit & ROI */}
                  <tr className="bg-emerald-50/40">
                    <td className="p-3.5 font-bold text-emerald-950">
                      Normal Scenario Net Profit
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100">
                        <span className="font-black text-emerald-800 text-sm block">
                          NPR {c.scenarios[1]?.estimated_profit_npr.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          {c.scenarios[1]?.roi_pct.toFixed(0)}% ROI
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Conservative Profit */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Conservative Profit (Low Price)
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 text-gray-700">
                        NPR {c.scenarios[0]?.estimated_profit_npr.toLocaleString()}
                        <span className="text-[10px] text-gray-500 block">
                          ({c.scenarios[0]?.roi_pct.toFixed(0)}% ROI)
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Break-Even Price */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Break-Even Price
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-bold text-slate-900">
                        NPR {c.break_even_price_per_kg.toFixed(1)}/kg
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Market Risk */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Market Risk Classification
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          c.market_risk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.market_risk} Risk
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Factor: Actions */}
                  <tr>
                    <td className="p-3.5 font-semibold text-gray-700 bg-gray-50/50">
                      Test Sensitivity
                    </td>
                    {comparisonData.map((c) => (
                      <td key={c.crop_slug} className="p-3.5 text-center border-l border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedWhatIfCrop(c.crop_slug);
                            setActiveTab('what_if');
                          }}
                          className="btn-outline-sm text-xs px-2.5 py-1"
                        >
                          Simulate →
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Profit Bar Chart */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600" />
              <span>Comparative Profit Scenarios (NPR)</span>
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    formatter={(val) => `NPR ${Number(val).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="profit_conservative" name="Conservative Scenario" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit_normal" name="Normal Scenario" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit_high" name="High Price Scenario" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Impartial Trade-off Analysis Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Agronomic Decision Verdict (Trade-off Transparency):</span>
            </div>
            <p className="leading-relaxed text-gray-600">
              No crop is declared universally best. <strong>Cucumber</strong> provides the fastest cash cycle (55–70 days) to capitalize on early winter festive banquets before frost intensifies. <strong>Tomato</strong> requires higher upfront capital and a longer vegetative phase (90–115 days), but produces a sustained 90-day harvest window capturing peak winter scarcity prices. Choose the crop that aligns with your available working capital and harvest timeline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
