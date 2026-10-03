import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  X,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function FutureMarketWindowsView() {
  const { language, t, setSelectedWhatIfCrop, setActiveTab } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  useEffect(() => {
    async function loadWindows() {
      setLoading(true);
      try {
        const res = await api.getFutureMarketWindows();
        setData(res);
      } catch (err) {
        console.error('Failed to load future market windows:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWindows();
  }, []);

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Calendar className="text-emerald-600" />
            {language === 'ne' ? '📅 १२ महिने भविष्यको बजार अवसर क्यालेन्डर' : '📅 12-Month Future Market Windows'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'प्रत्येक महिना कालीमाटी थोक बजारमा कुन तरकारीको अभाव र उच्च मूल्य रहन्छ? हरियो (🟢 उच्च), पहेँलो (🟡 मध्यम) र खैरो (⚪ मुख्य सिजन)।'
              : 'Interactive 12-Month Mandi Scarcity Calendar. Click any vegetable to inspect required planting window, price spikes, and profit scenarios.'}
          </p>
        </div>
        <div className="badge-no-iot">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>ZERO IoT • 5-YEAR HISTORICAL ARBITRAGE</span>
        </div>
      </div>

      {/* Legend Card */}
      <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span className="font-semibold text-gray-800">
              🟢 {language === 'ne' ? 'उच्च अफ-सिजन अवसर (मूल्य +५०% माथि, आपूर्ति अभाव)' : 'High Opportunity (+50% Price Spike, High Scarcity)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block shadow-sm"></span>
            <span className="font-semibold text-gray-800">
              🟡 {language === 'ne' ? 'मध्यम बजार अवसर (+२५% माथि)' : 'Moderate Window (+25% Premium)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-300 inline-block"></span>
            <span className="font-semibold text-gray-600">
              ⚪ {language === 'ne' ? 'मुख्य सिजनको बाढी (न्यून नाफा)' : 'Main Season Glut / Normal'}
            </span>
          </div>
        </div>
        <span className="text-gray-500 italic">
          {language === 'ne' ? '*बालीमा क्लिक गरी विस्तृत विवरण हेर्नुहोस्' : '*Click any crop for deep dive modal'}
        </span>
      </div>

      {/* 12-Month Calendar Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.months?.map((m) => (
            <div
              key={m.month_index}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {m.month_name_en}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {m.month_name_ne} ({m.bs_month_name})
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                    M{m.month_index}
                  </span>
                </div>

                {/* Crops list inside this month */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {m.opportunities.map((opp) => {
                    const badgeColor =
                      opp.status === 'high'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : opp.status === 'moderate'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';

                    const dot =
                      opp.status === 'high'
                        ? '🟢'
                        : opp.status === 'moderate'
                        ? '🟡'
                        : '⚪';

                    return (
                      <button
                        key={opp.crop_slug}
                        onClick={() => setSelectedCropModal({ ...opp, monthInfo: m })}
                        className={`w-full text-left p-1.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${badgeColor}`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{dot}</span>
                          <span>{opp.icon_emoji}</span>
                          <span className="font-medium truncate">
                            {language === 'ne' ? opp.name_ne : opp.name_en}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold shrink-0 ml-1">
                          NPR {opp.historical_avg_price.toFixed(0)}/kg
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                <span>{m.opportunities.filter((o) => o.status === 'high').length} peak windows</span>
                <span className="text-emerald-700 font-medium">Click to inspect →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deep-Dive Modal for Selected Crop */}
      {selectedCropModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {selectedCropModal.icon_emoji}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'ne' ? selectedCropModal.name_ne : selectedCropModal.name_en}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Target Harvest: {selectedCropModal.monthInfo.month_name_en} ({selectedCropModal.monthInfo.month_name_ne})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCropModal(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Opportunity Status Pill */}
            <div className={`p-3 rounded-xl border text-xs ${
              selectedCropModal.status === 'high'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : selectedCropModal.status === 'moderate'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-gray-50 text-gray-800 border-gray-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Sparkles size={14} />
                <span>{selectedCropModal.market_gap_note}</span>
              </div>
              <p className="text-gray-600">
                Historical Mandi Arrival Scarcity Index: <strong>{selectedCropModal.historical_arrival_index}/100</strong>.
                {selectedCropModal.historical_arrival_index < 60
                  ? ' Severe open-field contraction in hills; high pricing power.'
                  : ' Regular seasonal supply flow.'}
              </p>
            </div>

            {/* Timing & Dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Recommended Planting Window:</span>
                <span className="font-bold text-emerald-700">{selectedCropModal.required_planting_window}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Expected Harvest Period:</span>
                <span className="font-bold text-slate-800">{selectedCropModal.monthInfo.month_name_en}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Days to First Harvest:</span>
                <span className="font-bold text-slate-800">{selectedCropModal.expected_harvest_days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Estimated Price Range:</span>
                <span className="font-bold text-emerald-700">{selectedCropModal.estimated_price_range}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedWhatIfCrop(selectedCropModal.crop_slug);
                  setSelectedCropModal(null);
                  setActiveTab('what_if');
                }}
                className="btn-outline-sm flex items-center gap-1 text-xs"
              >
                <DollarSign size={14} />
                <span>{language === 'ne' ? 'के होला सिमुलेटर' : 'Simulate Scenarios'}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCropModal(null);
                  setActiveTab('what_to_plant');
                }}
                className="btn-primary-sm flex items-center gap-1 text-xs"
              >
                <span>{language === 'ne' ? 'रोप्ने योजना हेर्नुहोस्' : 'Forward Plan'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
