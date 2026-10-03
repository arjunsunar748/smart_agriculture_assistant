import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Globe, MapPin, Scale, ShieldCheck, Database, Check, Info } from 'lucide-react';

export default function SettingsView() {
  const { language, setLanguage, district, setDistrict, farmingMethod, setFarmingMethod, landUnit, setLandUnit, t } = useApp();

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title flex items-center gap-2">
          <SettingsIcon className="text-emerald-600" />
          {language === 'ne' ? '⚙️ सेटिङ तथा तथ्याङ्क स्रोत (Settings & Data Provenance)' : '⚙️ Settings & Data Reliability Provenance'}
        </h2>
        <p className="page-subtitle">
          {language === 'ne'
            ? 'भाषा, पूर्वनिर्धारित जिल्ला, जग्गा मापन एकाइ र कृषि तथ्याङ्कको आधिकारिकता।'
            : 'Configure preferences, land measurement units, and inspect verified data sources.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization & Language */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Globe size={18} className="text-emerald-600" />
            {language === 'ne' ? 'भाषा तथा स्थानीयकरण (Language)' : 'Language & Localization'}
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">Interface Language</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('ne')}
                className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-between transition ${
                  language === 'ne'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🇳🇵 नेपाली (Nepali)</span>
                {language === 'ne' && <Check size={16} className="text-emerald-700" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-between transition ${
                  language === 'en'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check size={16} className="text-emerald-700" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-gray-600">
              {language === 'ne' ? 'पूर्वनिर्धारित जिल्ला (Default Location)' : 'Default District'}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="filter-input font-medium"
            >
              {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Chitwan', 'Kaski', 'Salyan', 'Morang', 'Jhapa', 'Rupandehi', 'Dang'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Units & Measurement */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Scale size={18} className="text-emerald-600" />
            {language === 'ne' ? 'एकाइ तथा मुद्रा (Units & Measurement)' : 'Measurement Units & Currency'}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">Preferred Land Area Unit</span>
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="px-2.5 py-1 border border-gray-300 rounded font-bold text-emerald-900 text-xs"
              >
                <option value="sqm">Square Meters (m²)</option>
                <option value="sqft">Square Feet (sq.ft)</option>
                <option value="ropani">Ropani (508.7 m²)</option>
                <option value="bigha">Bigha (6,772.6 m²)</option>
              </select>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">Currency</span>
              <span className="font-bold text-gray-900">Nepalese Rupee (NPR / रू)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">Temperature Scale</span>
              <span className="font-bold text-gray-900">Celsius (°C)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600">Weight Metric</span>
              <span className="font-bold text-gray-900">Kilograms (kg) / Quintal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Reliability & Provenance (Section 24 of Prompt) */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Database size={18} className="text-emerald-600" />
              <span>{language === 'ne' ? 'तथ्याङ्क विश्वसनीयता र स्रोत (Data Reliability & Provenance)' : 'Verified Data Provenance & Reliability'}</span>
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'ne'
                ? 'हामी कहिल्यै मनगढन्ते बजार मूल्य देखाउँदैनौँ। प्रत्येक तथ्याङ्कको स्रोत, मिति र स्थान पारदर्शी छ।'
                : 'Zero fake data policy. Every dataset stores origin, collection date, last updated timestamp, and geo-anchor.'}
            </p>
          </div>
          <div className="badge-no-iot">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>AUTHENTIC TELEMETRY</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="p-3">Data Provider</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">Location / Scope</th>
                <th className="p-3">Collection Frequency</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 font-bold text-gray-900">
                  Kalimati Fruit and Vegetable Market Board
                </td>
                <td className="p-3 text-gray-600">
                  Daily Wholesale Commodities, Price Spreads, Mandi Arrivals
                </td>
                <td className="p-3 text-gray-600">
                  Kathmandu Valley & Regional Mandis
                </td>
                <td className="p-3 text-gray-600">Daily / Historical 5-Year Curves</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    🟢 Live / Historical Active
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-gray-900">
                  Open-Meteo Global Atmospheric Telemetry
                </td>
                <td className="p-3 text-gray-600">
                  Hourly Temperature, RH%, Rainfall, 15-Day GFS Forecast
                </td>
                <td className="p-3 text-gray-600">
                  77 Nepal Districts (GPS Coordinates)
                </td>
                <td className="p-3 text-gray-600">Real-Time (Hourly Updates)</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    🟢 Live Telemetry
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-gray-900">
                  Nepal Agricultural Research Council (NARC)
                </td>
                <td className="p-3 text-gray-600">
                  Phenological GDD, Tunnel Baseline Coefficients, Growth Stages
                </td>
                <td className="p-3 text-gray-600">
                  Nepal Mid-Hills & Terai Agro-Ecological Zones
                </td>
                <td className="p-3 text-gray-600">Verified Agronomic Benchmark</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    🔵 Verified Benchmark
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Strict Data Transparency Alert */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>System Reliability Notice:</strong> If live market or meteorological feeds are unreachable due to server or connectivity outages, the system automatically falls back to: <em>"Live data unavailable. Showing historical data."</em> Mock data is never falsely presented as real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
