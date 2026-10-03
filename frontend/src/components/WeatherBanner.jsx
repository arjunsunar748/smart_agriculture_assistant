import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CloudSun,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  RefreshCw,
  Mountain,
  Compass
} from 'lucide-react';

export default function WeatherBanner() {
  const { weatherData, weatherLoading, refreshWeather, district, language } = useApp();

  if (weatherLoading && !weatherData) {
    return (
      <div className="weather-card animate-pulse">
        <div className="h-6 bg-emerald-100 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-16 bg-emerald-50 rounded"></div>
          <div className="h-16 bg-emerald-50 rounded"></div>
          <div className="h-16 bg-emerald-50 rounded"></div>
          <div className="h-16 bg-emerald-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!weatherData?.current) {
    return (
      <div className="weather-card bg-amber-50 border-amber-200">
        <p className="text-amber-800 text-sm">
          {language === 'ne'
            ? 'मौसम तथ्याङ्क हाल उपलब्ध छैन। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।'
            : 'Weather telemetry temporarily unavailable. Retrying...'}
        </p>
      </div>
    );
  }

  const curr = weatherData.current;
  const forecast = weatherData.forecast_7d || [];

  return (
    <div className="weather-banner-wrapper">
      <div className="weather-main-grid">
        {/* Left: Current Conditions */}
        <div className="weather-current-panel">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="location-tag">
                  <Compass size={14} className="text-emerald-700" />
                  {district}, Nepal
                </span>
                <span className="elevation-tag">
                  <Mountain size={12} />
                  {curr.elevation ? `${curr.elevation}m` : '1,300m'}
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="temp-big">{curr.temperature.toFixed(1)}°C</span>
                <span className="text-sm font-medium text-gray-500">
                  {curr.temp_min.toFixed(1)}°C / {curr.temp_max.toFixed(1)}°C
                </span>
              </div>
              <p className="weather-desc">
                {language === 'ne' ? curr.weather_description_ne : curr.weather_description}
              </p>
            </div>
            <button
              onClick={refreshWeather}
              className="refresh-btn"
              title="Refresh Telemetry"
              disabled={weatherLoading}
            >
              <RefreshCw size={14} className={weatherLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="weather-metrics-grid">
            <div className="metric-pill">
              <Droplets size={16} className="text-blue-500" />
              <div>
                <div className="metric-label">{language === 'ne' ? 'आद्रता' : 'Humidity'}</div>
                <div className="metric-val">{curr.humidity.toFixed(0)}%</div>
              </div>
            </div>
            <div className="metric-pill">
              <CloudRain size={16} className="text-indigo-500" />
              <div>
                <div className="metric-label">{language === 'ne' ? 'वर्षा सम्भावना' : 'Rain Prob'}</div>
                <div className="metric-val">{curr.rain_probability.toFixed(0)}%</div>
              </div>
            </div>
            <div className="metric-pill">
              <Wind size={16} className="text-teal-500" />
              <div>
                <div className="metric-label">{language === 'ne' ? 'हावा' : 'Wind'}</div>
                <div className="metric-val">{curr.wind_speed.toFixed(1)} km/h</div>
              </div>
            </div>
            <div className="metric-pill">
              <Sun size={16} className="text-amber-500" />
              <div>
                <div className="metric-label">{language === 'ne' ? 'यूभी सूचकांक' : 'UV Index'}</div>
                <div className="metric-val">{curr.uv_index.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <div className="weather-footer-meta">
            <span className="text-xs text-gray-500">
              {weatherData.data_source} • {weatherData.last_updated}
            </span>
          </div>
        </div>

        {/* Right: 7-Day Forecast Ribbon */}
        <div className="weather-forecast-panel">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {language === 'ne' ? '७ दिने मौसमी पूर्वानुमान' : '7-Day Atmospheric Forecast'}
          </h4>
          <div className="forecast-ribbon">
            {forecast.map((day, idx) => (
              <div key={idx} className="forecast-day-card">
                <span className="forecast-day-date">
                  {idx === 0 ? (language === 'ne' ? 'आज' : 'Today') : day.date.slice(5)}
                </span>
                <CloudSun size={20} className="text-amber-500 my-1" />
                <span className="forecast-temp-max">{day.temp_max.toFixed(0)}°</span>
                <span className="forecast-temp-min">{day.temp_min.toFixed(0)}°</span>
                {day.precipitation_probability_max > 20 && (
                  <span className="text-[10px] text-blue-600 font-semibold">
                    {day.precipitation_probability_max.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
