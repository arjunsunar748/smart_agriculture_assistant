import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Core Primary Views
import DashboardView from './views/DashboardView';
import WhatShouldIPlantView from './views/WhatShouldIPlantView';
import MarketPricesView from './views/MarketPricesView';
import CropDetailView from './views/CropDetailView';
import ProfitCalculatorView from './views/ProfitCalculatorView';
import FarmManagementView from './views/FarmManagementView';
import AIAssistantView from './views/AIAssistantView';

// Specialized / More Views
import BackwardPlanningView from './views/BackwardPlanningView';
import FutureMarketWindowsView from './views/FutureMarketWindowsView';
import CropCalendarView from './views/CropCalendarView';
import WhatIfSimulatorView from './views/WhatIfSimulatorView';
import RiskAnalysisView from './views/RiskAnalysisView';
import CropComparisonView from './views/CropComparisonView';
import BacktestingView from './views/BacktestingView';
import AlertsView from './views/AlertsView';
import SettingsView from './views/SettingsView';
import IoTFutureModuleView from './views/IoTFutureModuleView';
import MarketTrendsView from './views/MarketTrendsView';
import SupplyDemandView from './views/SupplyDemandView';
import MarketSelectionView from './views/MarketSelectionView';
import CropCycleTrackingView from './views/CropCycleTrackingView';
import DiseaseRiskView from './views/DiseaseRiskView';

import './App.css';

function MainLayout() {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'what_to_plant':
        return <WhatShouldIPlantView />;
      case 'market_prices':
        return <MarketPricesView />;
      case 'crop_details':
        return <CropDetailView />;
      case 'profit_calculator':
        return <ProfitCalculatorView />;
      case 'farm_mgmt':
        return <FarmManagementView />;
      case 'ai_assistant':
        return <AIAssistantView />;
      case 'alerts':
        return <AlertsView />;
      case 'what_if':
        return <WhatIfSimulatorView />;
      case 'backward_plan':
        return <BackwardPlanningView />;
      case 'crop_calendar':
        return <CropCalendarView />;
      case 'future_market_windows':
        return <FutureMarketWindowsView />;
      case 'risk_analysis':
        return <RiskAnalysisView />;
      case 'compare_crops':
        return <CropComparisonView />;
      case 'backtest':
        return <BacktestingView />;
      case 'crop_cycles':
        return <CropCycleTrackingView />;
      case 'market_trends':
        return <MarketTrendsView />;
      case 'supply_demand':
        return <SupplyDemandView />;
      case 'market_selection':
        return <MarketSelectionView />;
      case 'disease_risk':
        return <DiseaseRiskView />;
      case 'future_iot':
        return <IoTFutureModuleView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        {renderActiveView()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
