import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const {
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    district,
    setDistrict,
    farmingMethod,
    setFarmingMethod
  } = useApp();

  const [navCollapsed, setNavCollapsed] = useState(true);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setNavCollapsed(true);
    setMoreDropdownOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label_en: 'Home', label_ne: 'गृहपृष्ठ', icon: 'bi-house-door' },
    { id: 'what_to_plant', label_en: 'Plant Now', label_ne: 'आज के रोप्ने?', icon: 'bi-sprout' },
    { id: 'market_prices', label_en: 'Market', label_ne: 'बजार भाउ', icon: 'bi-graph-up' },
    { id: 'crop_details', label_en: 'Crop Analysis', label_ne: 'बाली विश्लेषण', icon: 'bi-bar-chart' },
    { id: 'profit_calculator', label_en: 'Profit', label_ne: 'नाफा हिसाब', icon: 'bi-calculator' },
    { id: 'ai_assistant', label_en: 'AI Assistant', label_ne: 'एआई सहायक', icon: 'bi-robot' },
  ];

  const moreItems = [
    { id: 'farm_mgmt', label_en: 'My Farm Plans (Optional)', label_ne: 'मेरो फार्म योजना', icon: 'bi-geo-alt' },
    { id: 'what_if', label_en: 'What-If Sensitivity Simulator', label_ne: 'के होला? सिमुलेटर', icon: 'bi-sliders' },
    { id: 'backward_plan', label_en: 'Find Best Planting Date (Reverse)', label_ne: 'उल्टो बाली योजना', icon: 'bi-calendar-check' },
    { id: 'crop_calendar', label_en: 'Crop Calendar & Staggered Plan', label_ne: 'बाली क्यालेन्डर र चक्र', icon: 'bi-calendar3' },
    { id: 'future_market_windows', label_en: 'Future Market Windows', label_ne: 'भविष्यको बजार अवसर', icon: 'bi-clock-history' },
    { id: 'risk_analysis', label_en: 'Risk & Price Crash Analysis', label_ne: 'जोखिम विश्लेषण', icon: 'bi-shield-exclamation' },
    { id: 'compare_crops', label_en: 'Side-by-Side Crop Comparison', label_ne: 'बाली तुलना', icon: 'bi-arrow-left-right' },
    { id: 'backtest', label_en: '5-Year Strategy Backtest', label_ne: '५-वर्षे ब्याकटेस्ट', icon: 'bi-archive' },
    { id: 'alerts', label_en: 'Agricultural Alerts & Circulars', label_ne: 'सूचना तथा परिपत्र', icon: 'bi-bell' },
    { id: 'future_iot', label_en: 'Future IoT Architecture', label_ne: 'भविष्यको IoT मोड्युल', icon: 'bi-cpu' },
  ];

  return (
    <nav className="navbar navbar-expand-lg agri-navbar">
      <div className="container">
        {/* Brand */}
        <button
          className="navbar-brand border-0 bg-transparent p-0 text-start"
          onClick={() => handleNavClick('dashboard')}
        >
          <span className="fs-4">🌱</span>
          <span>Smart Agriculture Assistant</span>
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setNavCollapsed(!navCollapsed)}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${navCollapsed ? 'bi-list' : 'bi-x-lg'} fs-3 text-success`}></i>
        </button>

        {/* Nav Links Collapse */}
        <div className={`collapse navbar-collapse ${navCollapsed ? '' : 'show'}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            {navItems.map((item) => (
              <li className="nav-item" key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-link border-0 bg-transparent text-start w-100 ${
                    activeTab === item.id ? 'active' : ''
                  }`}
                >
                  <i className={`bi ${item.icon} me-1.5 opacity-75`}></i>
                  {language === 'ne' ? item.label_ne : item.label_en}
                </button>
              </li>
            ))}

            {/* Simple More Dropdown */}
            <li className="nav-item dropdown position-relative">
              <button
                className={`nav-link dropdown-toggle border-0 bg-transparent text-start w-100 ${
                  moreItems.some((m) => m.id === activeTab) ? 'active' : ''
                }`}
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              >
                {language === 'ne' ? 'थप उपकरणहरू' : 'More'}
              </button>

              {moreDropdownOpen && (
                <ul className="dropdown-menu show position-absolute mt-1 shadow-sm border-0">
                  {moreItems.map((m) => (
                    <li key={m.id}>
                      <button
                        className={`dropdown-item py-2 d-flex align-items-center gap-2 ${
                          activeTab === m.id ? 'active' : ''
                        }`}
                        onClick={() => handleNavClick(m.id)}
                      >
                        <i className={`bi ${m.icon} text-muted`}></i>
                        <span>{language === 'ne' ? m.label_ne : m.label_en}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>

          {/* Right Controls: AI Assistant, Language, Settings */}
          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0 border-top border-lg-0">
            {/* AI Assistant Button */}
            <button
              onClick={() => handleNavClick('ai_assistant')}
              className={`btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 ${
                activeTab === 'ai_assistant' ? 'btn-agri' : 'btn-soft-agri'
              }`}
            >
              <span>🤖</span>
              <span className="fw-semibold">
                {language === 'ne' ? 'एआई सहायक' : 'AI Assistant'}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ne' ? 'en' : 'ne')}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1.5 px-2.5"
              title="Toggle English / नेपाली"
            >
              <i className="bi bi-globe2"></i>
              <span className="fw-bold">{language === 'ne' ? 'English' : 'नेपाली'}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`btn btn-sm py-1.5 px-2.5 ${
                activeTab === 'settings' ? 'btn-agri' : 'btn-outline-secondary'
              }`}
              title="Settings & Units"
            >
              <i className="bi bi-gear"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
