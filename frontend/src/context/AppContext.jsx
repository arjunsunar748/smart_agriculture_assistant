import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { api } from '../api/client';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('ne'); // 'ne' or 'en'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [district, setDistrict] = useState('Kathmandu');
  const [farmingMethod, setFarmingMethod] = useState('tunnel');
  const [landUnit, setLandUnit] = useState('sqm'); // 'sqm', 'sqft', 'ropani', 'bigha'
  
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);
  
  const [alerts, setAlerts] = useState([]);
  const [selectedCropForDetail, setSelectedCropForDetail] = useState('tomato');
  const [selectedWhatIfCrop, setSelectedWhatIfCrop] = useState('tomato');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  // Translation helper
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  // Unit conversion helpers to/from square meters
  const convertToSqm = (val, unit) => {
    const num = parseFloat(val) || 0;
    switch (unit) {
      case 'sqft':
        return num * 0.092903;
      case 'ropani':
        return num * 508.72;
      case 'bigha':
        return num * 6772.63;
      case 'aana':
        return num * 31.8;
      case 'sqm':
      default:
        return num;
    }
  };

  const convertFromSqm = (sqmVal, targetUnit) => {
    const num = parseFloat(sqmVal) || 0;
    switch (targetUnit) {
      case 'sqft':
        return num / 0.092903;
      case 'ropani':
        return num / 508.72;
      case 'bigha':
        return num / 6772.63;
      case 'aana':
        return num / 31.8;
      case 'sqm':
      default:
        return num;
    }
  };

  // Fetch real-time weather whenever district changes
  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const data = await api.getWeather(district);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch market prices
  const fetchMarket = async () => {
    setMarketLoading(true);
    try {
      const prices = await api.getMarketPrices();
      setMarketPrices(prices);
    } catch (err) {
      console.error('Failed to load market prices:', err);
    } finally {
      setMarketLoading(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const alertList = await api.getAlerts();
      setAlerts(alertList);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [district]);

  useEffect(() => {
    fetchMarket();
    fetchAlerts();
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        district,
        setDistrict,
        farmingMethod,
        setFarmingMethod,
        landUnit,
        setLandUnit,
        convertToSqm,
        convertFromSqm,
        weatherData,
        weatherLoading,
        refreshWeather: fetchWeather,
        marketPrices,
        marketLoading,
        refreshMarket: fetchMarket,
        alerts,
        selectedCropForDetail,
        setSelectedCropForDetail,
        selectedWhatIfCrop,
        setSelectedWhatIfCrop,
        mobileMenuOpen,
        setMobileMenuOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
