import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Sparkles,
  RotateCcw,
  Calendar,
  LineChart,
  DollarSign,
  Scale,
  BookOpen,
  TrendingUp,
  ShieldAlert,
  Bot,
  Home,
  Settings,
  HelpCircle,
  History,
  AlertTriangle,
  Truck,
  BarChart3,
  Sprout,
  Cpu,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, t, language } = useApp();

  const planningItems = [
    { id: 'dashboard', label_en: 'Dashboard Overview', label_ne: 'मुख्य ड्यासबोर्ड', icon: LayoutDashboard },
    { id: 'what_to_plant', label_en: 'What Should I Plant Now?', label_ne: 'अहिले के लगाउने?', icon: Sparkles, featured: true },
    { id: 'backward_plan', label_en: 'Reverse Planning (Target Date)', label_ne: 'उल्टो बाली योजना', icon: RotateCcw, badge: 'Reverse' },
    { id: 'future_market_windows', label_en: 'Future Market Windows', label_ne: 'भविष्यको बजार अवसर', icon: Calendar },
    { id: 'crop_calendar', label_en: 'Crop Calendar & Staggered', label_ne: 'बाली क्यालेन्डर र चक्र', icon: Layers, badge: 'Planner' },
  ];

  const marketItems = [
    { id: 'market_prices', label_en: 'Live Kalimati Mandi Prices', label_ne: 'कालीमाटी थोक बजार भाउ', icon: TrendingUp },
    { id: 'market_trends', label_en: '5-Year Seasonality & Trends', label_ne: '५-वर्षे मौसमी ट्रेन्ड', icon: LineChart },
    { id: 'supply_demand', label_en: 'Supply Gap Intelligence', label_ne: 'बजार आपूर्ति खाडल', icon: BarChart3 },
    { id: 'market_selection', label_en: 'Market Destination Selection', label_ne: 'बजार गन्तव्य छनोट', icon: Truck },
    { id: 'compare_crops', label_en: 'Side-by-Side Crop Comparison', label_ne: 'बाली तुलना म्याट्रिक्स', icon: Scale },
  ];

  const economicsItems = [
    { id: 'profit_calculator', label_en: 'Profit & Cost Calculator', label_ne: 'नाफा तथा लागत हिसाब', icon: DollarSign },
    { id: 'what_if', label_en: 'What-If Sensitivity Simulator', label_ne: 'के होला? सिमुलेटर', icon: DollarSign, badge: 'Sim' },
    { id: 'backtest', label_en: '5-Year Strategy Backtest', label_ne: '५-वर्षे ब्याकटेस्ट', icon: History, badge: '5-Yr' },
    { id: 'risk_analysis', label_en: 'Risk & Price Crash Assessment', label_ne: 'जोखिम तथा मूल्य क्र्यास', icon: AlertTriangle },
  ];

  const agronomyAndAIItems = [
    { id: 'ai_assistant', label_en: 'AI Advisory Assistant', label_ne: 'एआई कृषि सल्लाहकार', icon: Bot, badge: 'AI' },
    { id: 'crop_details', label_en: 'Crop Encyclopedia', label_ne: 'बाली ज्ञान तथा विवरण', icon: BookOpen },
    { id: 'disease_risk', label_en: 'Disease & Pest Risk', label_ne: 'रोग तथा किरा जोखिम', icon: ShieldAlert },
    { id: 'crop_cycles', label_en: 'Active Crop Cycle Tracker', label_ne: 'बाली चक्र ट्र्याकर', icon: Sprout },
    { id: 'farm_mgmt', label_en: 'Farm Management', label_ne: 'मेरो फार्म व्यवस्थापन', icon: Home },
  ];

  const systemItems = [
    { id: 'alerts', label_en: 'System Alerts & Circulars', label_ne: 'कृषि तथा बजार सूचना', icon: AlertTriangle, badge: 'Live' },
    { id: 'future_iot', label_en: 'IoT — Future Module', label_ne: 'भविष्यको IoT मोड्युल', icon: Cpu, badge: 'Dormant' },
    { id: 'settings', label_en: 'Settings & Land Units', label_ne: 'प्रणाली सेटिङहरू', icon: Settings },
  ];

  const renderNavGroup = (title, items) => (
    <div className="gov-sidebar-group mb-3">
      <div className="gov-sidebar-group-title">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = language === 'ne' ? item.label_ne : item.label_en;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`gov-sidebar-link ${isActive ? 'active' : ''} ${item.featured ? 'featured' : ''}`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon size={15} className={`shrink-0 ${isActive ? 'text-gov-red' : 'text-slate-500'}`} />
                <span className="truncate">{label}</span>
              </div>
              {item.badge && (
                <span className={`gov-sidebar-badge ${item.badge === 'AI' ? 'ai' : item.badge === 'Live' ? 'live' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="gov-sidebar-root">
      <div className="gov-sidebar-header">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          {language === 'ne' ? 'सरकारी कृषि पोर्टल प्रणाली' : 'OFFICIAL PORTAL SECTIONS'}
        </span>
      </div>

      <div className="gov-sidebar-scrollable">
        {renderNavGroup(language === 'ne' ? '१. मुख्य योजना तथा सिफारिस' : '1. PLANNING & FORWARD DECISION', planningItems)}
        {renderNavGroup(language === 'ne' ? '२. बजार तथा मूल्य गुप्तचर' : '2. MARKET & PRICE INTELLIGENCE', marketItems)}
        {renderNavGroup(language === 'ne' ? '३. आर्थिक तथा जोखिम विश्लेषण' : '3. ECONOMICS & RISK ANALYSIS', economicsItems)}
        {renderNavGroup(language === 'ne' ? '४. कृषि विज्ञान, एआई र बाली' : '4. AGRONOMY, AI & CROPS', agronomyAndAIItems)}
        {renderNavGroup(language === 'ne' ? '५. सूचना तथा प्रणाली' : '5. ALERTS & SYSTEM', systemItems)}
      </div>

      <div className="gov-sidebar-footer">
        <div className="gov-sidebar-compliance">
          <HelpCircle size={14} className="text-gov-navy shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-700 leading-snug">
            {language === 'ne'
              ? 'कालीमाटी थोक बजार विकास समिति र ओपन-मेटियो प्रत्यक्ष तथ्याङ्कमा आधारित'
              : 'Grounded in verified Kalimati Mandi & Open-Meteo Telemetry'}
          </p>
        </div>
      </div>
    </aside>
  );
}
