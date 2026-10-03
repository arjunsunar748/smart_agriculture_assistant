import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  Thermometer,
  Droplets,
  Sun,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code
} from 'lucide-react';

export default function IoTFutureModuleView() {
  const { language } = useApp();
  const [statusData, setStatusData] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIoTDetails = async () => {
      setLoading(false);
      try {
        const [sRes, senRes, devRes] = await Promise.all([
          api.getFutureIoTStatus(),
          api.getFutureIoTSensors(),
          api.getFutureIoTDevices()
        ]);
        setStatusData(sRes);
        setSensors(senRes || []);
        setDevices(devRes || []);
      } catch (err) {
        console.error('Failed to load IoT blueprint:', err);
      }
    };
    loadIoTDetails();
  }, []);

  return (
    <div className="space-y-6">
      {/* Flagship Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Sections 34–36, 39: Future IoT Hardware Abstraction Layer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {language === 'ne' ? 'भविष्यको IoT एकीकरण मोड्युल' : 'IoT — Future Module & Architecture'}
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1 max-w-2xl">
              {language === 'ne'
                ? 'IoT एकीकरण भविष्यको कार्यान्वयनका लागि तयार गरिएको छ। हाल प्रणाली भौतिक सेन्सर बिना पूर्ण सफ्टवेयरमा चल्छ।'
                : 'Architectural blueprint and decoupled microclimate gateway designed for future ESP32 sensor integration.'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>ZERO-HARDWARE EXECUTION ACTIVE</span>
          </div>
        </div>

        {/* Clear Highlighted System Statement Box */}
        <div className="mt-6 p-4 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-100 space-y-1">
            <p className="text-sm font-bold text-white">
              {language === 'ne'
                ? 'महत्वपूर्ण सूचना: IoT एकीकरण भविष्यको कार्यान्वयनका लागि पूर्ण रूपमा तयार गरिएको छ।'
                : 'System Architecture Notice: IoT integration is prepared for future implementation.'}
            </p>
            <p className="text-indigo-200/90 leading-relaxed">
              {statusData?.notice ||
                'The application currently operates 100% autonomously without physical sensors or microcontrollers using Open-Meteo online meteorological APIs and verified historical Kalimati datasets.'}
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Flow Diagram (Visualizing Decoupling) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {language === 'ne' ? 'प्रणाली संरचना र भविष्यको हार्डवेयर प्रवाह' : 'Decoupled System Architecture'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          How the recommendation engine operates today versus when optional physical ESP32 nodes are provisioned.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current System */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/40">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800/40">
              <span className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Phase 1 (CURRENT LIVE SYSTEM)</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between">
                <span>1. Open-Meteo Weather APIs</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Online API</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between">
                <span>2. Kalimati Mandi Price Ledger</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Daily Mandi Feed</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between">
                <span>3. NARC Historical Agronomy DB</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Baselines</span>
              </div>
              <div className="text-center text-emerald-600 dark:text-emerald-400 font-sans font-bold text-xs py-1">
                ⬇ Feeds Directly To ⬇
              </div>
              <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-center font-sans font-bold shadow-md shadow-emerald-600/20">
                Off-Season AI Recommendation Engine
              </div>
              <div className="text-center text-emerald-600 dark:text-emerald-400 font-sans font-bold text-xs py-1">
                ⬇ Real-time Insights ⬇
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/30 text-center font-sans font-semibold text-slate-900 dark:text-white">
                Farmer Decision Dashboard
              </div>
            </div>
          </div>

          {/* Future IoT Layer */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-300 dark:border-indigo-800/40">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-200 dark:border-indigo-800/40">
              <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>Phase 2 (FUTURE OPTIONAL IoT LAYER)</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                PREPARED
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800/30 flex items-center justify-between">
                <span>1. ESP32 Physical Microclimate Nodes</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Physical Sensors</span>
              </div>
              <div className="text-center text-indigo-600 dark:text-indigo-400 font-sans font-bold text-xs py-0.5">
                ⬇ MQTT 3.1.1 / TLS Telemetry ⬇
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800/30 flex items-center justify-between">
                <span>2. Decoupled IoT Gateway Service</span>
                <span className="text-[10px] text-indigo-600 font-semibold">`app.iot.gateway`</span>
              </div>
              <div className="text-center text-indigo-600 dark:text-indigo-400 font-sans font-bold text-xs py-0.5">
                ⬇ Verified Telemetry Hook ⬇
              </div>
              <div className="p-3.5 bg-indigo-600 text-white rounded-xl text-center font-sans font-bold shadow-md shadow-indigo-600/20">
                Recommendation Engine (Hybrid Physical + Open-Meteo)
              </div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[11px] font-sans text-slate-500 dark:text-slate-400 text-center">
                Seamless plug-and-play: zero restructuring of core planner needed.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Sensors Catalog */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'ne' ? 'भविष्यमा समर्थित ८ सेन्सर सूची' : 'Supported Future Sensor Catalog'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sensor operational thresholds tailored for high poly-tunnels in Nepal
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {sensors.length} Defined Sensor Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensors.map((s) => (
            <div
              key={s.code}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                    {s.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {s.unit}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {s.name}
                </h4>

                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-300">Hardware:</span> {s.hardware_sample}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-300">Optimal:</span>{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{s.optimal_range}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Prepared Hardware Node Specs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {language === 'ne' ? 'पूर्वतयार हार्डवेयर नोड्स' : 'Prepared Hardware Specifications'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Field-ready microcontroller configurations awaiting deployment
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((dev) => (
            <div
              key={dev.device_uid}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {dev.device_uid}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    {dev.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  DORMANT
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div><span className="font-semibold">Platform:</span> {dev.hardware_platform}</div>
                <div><span className="font-semibold">Firmware:</span> {dev.firmware_spec}</div>
                <div><span className="font-semibold">Connectivity:</span> {dev.connectivity}</div>
                <div><span className="font-semibold">Power:</span> {dev.power_source}</div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400">Supported Sensor Bus:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {dev.sensors.map((sn) => (
                    <span
                      key={sn}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    >
                      {sn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
