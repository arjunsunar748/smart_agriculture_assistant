import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  ShieldAlert,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Bug,
  Info
} from 'lucide-react';

export default function DiseaseRiskView() {
  const { district, selectedCropForDetail, setSelectedCropForDetail, language, t } = useApp();
  const [cropsList, setCropsList] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrops() {
      try {
        const list = await api.getCrops();
        setCropsList(list);
      } catch (err) {
        console.error('Failed to load crops:', err);
      }
    }
    loadCrops();
  }, []);

  useEffect(() => {
    async function loadRisk() {
      if (!selectedCropForDetail) return;
      setLoading(true);
      try {
        const res = await api.getDiseaseRisk(selectedCropForDetail, district);
        setRiskData(res);
      } catch (err) {
        console.error('Failed to load disease risk:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRisk();
  }, [selectedCropForDetail, district]);

  return (
    <div className="view-content-wrapper space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <ShieldAlert className="text-emerald-600" />
            {language === 'ne' ? '🍃 रोग तथा कीरा जोखिम मूल्याङ्कन (Disease Risk)' : '🍃 Microclimate Disease & Pest Risk Engine'}
          </h2>
          <p className="page-subtitle">
            {language === 'ne'
              ? 'प्रत्यक्ष आद्रता (RH%), तापक्रम र वर्षाका आधारमा ढुसी, ब्याक्टेरिया र कीराको जोखिम विश्लेषण।'
              : 'Epidemiological risk modeling correlating real-time Open-Meteo atmospheric metrics with crop pathogens.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-semibold">{language === 'ne' ? 'बाली छान्नुहोस्:' : 'Select Crop:'}</label>
          <select
            value={selectedCropForDetail}
            onChange={(e) => setSelectedCropForDetail(e.target.value)}
            className="filter-input w-48 font-semibold text-emerald-950"
          >
            {cropsList.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon_emoji} {language === 'ne' ? c.name_ne : c.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !riskData ? (
        <div className="h-96 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
      ) : (
        <div className="space-y-6">
          {/* Active Atmospheric Trigger Strip */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌡️</span>
              <div>
                <span className="text-xs text-gray-500 block">
                  {language === 'ne' ? `${district}को सक्रिय मौसमी ट्रिगर:` : `Active Telemetry Triggers (${district}):`}
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {riskData.current_weather.temperature}°C Temp • {riskData.current_weather.humidity}% RH
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{language === 'ne' ? 'समग्र रोग दबाब:' : 'Overall Pressure:'}</span>
              <span
                className={`font-black text-sm px-3 py-1 rounded-full ${
                  riskData.overall_disease_pressure === 'Critical'
                    ? 'bg-rose-100 text-rose-800'
                    : riskData.overall_disease_pressure === 'Elevated'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {riskData.overall_disease_pressure}
              </span>
            </div>
          </div>

          {/* Risk Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {riskData.risks.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border bg-white space-y-3 ${
                  item.risk_level === 'High' || item.risk_level === 'Critical'
                    ? 'border-rose-300 shadow-sm'
                    : item.risk_level === 'Medium'
                    ? 'border-amber-200'
                    : 'border-emerald-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {item.pathogen_type} Risk
                    </span>
                    <h3 className="font-bold text-base text-gray-900">
                      {language === 'ne' ? item.disease_name_ne : item.disease_name_en}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.risk_level === 'High' || item.risk_level === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : item.risk_level === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.risk_level}
                  </span>
                </div>

                {/* Contributing Conditions */}
                <div className="p-2.5 bg-gray-50 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-gray-700 block">
                    {language === 'ne' ? 'अनुकूल मौसमी कारणहरू:' : 'Contributing Atmospheric Factors:'}
                  </span>
                  <ul className="list-disc pl-4 text-gray-600 space-y-0.5">
                    {item.contributing_conditions.map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="text-xs space-y-1 pt-2 border-t border-gray-100">
                  <span className="font-semibold text-emerald-800 block flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    {language === 'ne' ? 'सिफारिस गरिएका रोकथामका उपायहरू:' : 'Recommended Cultural & Biological Actions:'}
                  </span>
                  <ul className="list-disc pl-4 text-gray-700 space-y-1">
                    {item.recommended_actions.map((act, i) => (
                      <li key={i} className="leading-snug">{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Medical / Behavioral Disclaimer */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong>{language === 'ne' ? 'अस्वीकरण (Disclaimer):' : 'Epidemiological Disclaimer:'}</strong>{' '}
              {language === 'ne'
                ? 'यो मौसमी परिस्थिति (आद्रता र तापक्रम) का आधारमा निकालिएको सम्भावित जोखिम मूल्याङ्कन हो। यसले बालीमा रोग लागिसकेको दाबी गर्दैन। प्रत्यक्ष खेत अनुगमन गर्नुहोस्।'
                : 'This is a microclimate risk forecast correlating atmospheric parameters with pathogen biology, not a physical in-field diagnosis. Continually scout leaves.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
