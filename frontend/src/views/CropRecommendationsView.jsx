import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Layers, ShieldCheck, Sun, CloudRain, Search, ArrowRight } from 'lucide-react';

export default function CropRecommendationsView() {
  const { district, farmingMethod, language, t, setSelectedCropForDetail, setActiveTab } = useApp();
  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getRecommendations({
          district,
          farmingMethod: 'both',
          landAreaSqm: 500,
          tunnelAreaSqm: 250,
          budgetNpr: 50000,
          language
        });
        setCrops(res.recommended_crops);
      } catch (err) {
        console.error('Failed to load crop recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [district, language]);

  const filtered = crops.filter(
    (c) =>
      c.name_en.toLowerCase().includes(search.toLowerCase()) ||
      c.name_ne.includes(search) ||
      c.scientific_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="view-content-wrapper space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Layers className="text-emerald-600" />
            {language === 'ne' ? '🛡️ टनेल बनाम खुला खेत विश्लेषण (Tunnel vs Open Field)' : '🛡️ Tunnel vs Open Field Intelligence'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'कुन तरकारी टनेल भित्र कति सफल हुन्छ र खुला खेतमा के जोखिम छ? विस्तृत तुलना।'
              : 'Empirical suitability scores comparing passive plastic structures against open-field vulnerabilities.'}
          </p>
        </div>
        <div className="search-bar-wrapper">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder={language === 'ne' ? 'बाली खोज्नुहोस्...' : 'Search crop...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((crop) => (
            <div key={crop.slug} className="tunnel-compare-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{crop.icon_emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900">
                        {language === 'ne' ? crop.name_ne : crop.name_en}
                      </h3>
                      <span className="text-xs text-gray-500 italic">({crop.scientific_name})</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {crop.category} • {crop.growing_duration_days} {language === 'ne' ? 'दिन' : 'days'}
                    </span>
                  </div>
                </div>

                {/* Score comparison pill */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ne' ? 'टनेल उपयुक्तता' : 'Tunnel Suitability'}
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {crop.tunnel_suitability_pct}%
                    </span>
                  </div>
                  <div className="text-gray-300 font-light text-xl">vs</div>
                  <div className="text-center">
                    <span className="text-[11px] text-gray-500 block">
                      {language === 'ne' ? 'खुला खेत' : 'Open Field'}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        crop.open_field_suitability_pct < 65 ? 'text-amber-600' : 'text-gray-700'
                      }`}
                    >
                      {crop.open_field_suitability_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale and why */}
              <div className="mt-3">
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  <strong>{language === 'ne' ? 'मुख्य कारण:' : 'Agronomic Rationale:'}</strong>{' '}
                  {crop.tunnel_vs_open_reason}
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center text-xs pt-2 border-t border-gray-50">
                <span className="text-emerald-800 font-semibold">
                  {language === 'ne' ? 'थोक मूल्य:' : 'Wholesale Mandi:'} {t('currency')} {crop.expected_wholesale_price_npr.toFixed(0)}/kg
                </span>
                <button
                  onClick={() => {
                    setSelectedCropForDetail(crop.slug);
                    setActiveTab('crop_details');
                  }}
                  className="btn-outline-sm flex items-center gap-1"
                >
                  <span>{language === 'ne' ? 'विस्तृत गाइड' : 'Handbook'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
