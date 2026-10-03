import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Sprout,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Layers,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

const AVAILABLE_CROPS = [
  { slug: 'cucumber', name: 'Cucumber (काँक्रो)', emoji: '🥒' },
  { slug: 'tomato', name: 'Tomato (गोलभेँडा)', emoji: '🍅' },
  { slug: 'capsicum', name: 'Capsicum (भेडे खुर्सानी)', emoji: '🫑' },
  { slug: 'french_beans', name: 'French Beans (सिमी)', emoji: '🫘' },
  { slug: 'cauliflower', name: 'Cauliflower (काउली)', emoji: '🥦' },
  { slug: 'spinach', name: 'Spinach (पालुङ्गो)', emoji: '🥗' },
  { slug: 'chilli', name: 'Hot Chilli (खुर्सानी)', emoji: '🌶️' }
];

export default function CropCycleTrackingView() {
  const { language } = useApp();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newCropSlug, setNewCropSlug] = useState('cucumber');
  const [tunnelName, setTunnelName] = useState('Walk-in Poly-Tunnel #2');
  const [areaSqm, setAreaSqm] = useState(250);
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetMonth, setTargetMonth] = useState(12);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await api.getActiveCropCycles();
      setCycles(res || []);
    } catch (err) {
      console.error('Failed to load crop cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createCropCycle({
        crop_slug: newCropSlug,
        tunnel_name: tunnelName,
        area_sqm: parseFloat(areaSqm) || 250,
        planting_date: plantingDate,
        target_harvest_month: parseInt(targetMonth)
      });
      setCycles([created, ...cycles]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add crop cycle:', err);
    }
  };

  const handleDelete = async (cycleId) => {
    if (!window.confirm('Delete this active crop cycle tracking record?')) return;
    try {
      await api.deleteCropCycle(cycleId);
      setCycles(cycles.filter((c) => c.id !== cycleId));
    } catch (err) {
      console.error('Failed to delete cycle:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Sprout className="w-3.5 h-3.5" />
              <span>Section 32: Software-Based Crop Cycle Tracking</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'ne' ? 'सक्रिय बाली चक्र ट्र्याकर (Software Tracker)' : 'Active Crop Cycle Tracker'}
            </h1>
            <p className="text-emerald-200/80 text-sm mt-1 max-w-2xl">
              {language === 'ne'
                ? 'भौतिक सेन्सर बिना पूर्ण सफ्टवेयरमा आधारित बाली वृद्धि, चरण प्रगति र लक्षित बजार विन्डो अनुगमन।'
                : 'Monitor active plantings, stage progression, and harvest timing purely in software without requiring physical IoT sensors.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-emerald-500/25 transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ne' ? 'नयाँ बाली चक्र थप्नुहोस्' : 'Track New Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Active Cycles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cycles.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    {c.icon_emoji}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {language === 'ne' ? c.crop_name_ne : c.crop_name_en}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium">
                      {c.tunnel_name} • {c.area_sqm} m²
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Remove Tracker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress & Stage */}
              <div className="mt-5">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {c.current_stage}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Day {c.days_elapsed} of {c.total_growing_days} ({c.progress_pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.progress_pct}%` }}
                  />
                </div>
              </div>

              {/* Dates & Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400">Planted:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {c.planting_date}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Expected Harvest:</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {c.expected_harvest_start}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Estimated Yield:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {c.expected_yield_kg?.toLocaleString()} kg
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Projected Revenue:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    NPR {c.projected_revenue_npr?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Market Window Alert */}
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{c.market_window_alert}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Active Cycle Tracking
              </span>
              <span className="font-mono">{c.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Cycle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {language === 'ne' ? 'नयाँ बाली चक्र दर्ता गर्नुहोस्' : 'Track New Tunnel Cycle'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Crop
                </label>
                <select
                  value={newCropSlug}
                  onChange={(e) => setNewCropSlug(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  {AVAILABLE_CROPS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tunnel / Polyhouse Name
                </label>
                <input
                  type="text"
                  value={tunnelName}
                  onChange={(e) => setTunnelName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Area (m²)
                  </label>
                  <input
                    type="number"
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(e.target.value)}
                    min="20"
                    step="10"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Harvest Month
                  </label>
                  <select
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="12">December (Poush)</option>
                    <option value="1">January (Magh)</option>
                    <option value="2">February (Falgun)</option>
                    <option value="3">March (Chaitra)</option>
                    <option value="7">July (Shrawan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Planting Date
                </label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
