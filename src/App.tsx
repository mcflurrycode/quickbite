import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { DynamicIsland } from './components/common/DynamicIsland';
import { Dashboard } from './components/dashboard/Dashboard';
import { RestaurantMenu } from './components/menu/RestaurantMenu';
import { CartView } from './components/cart/CartView';
import { RealtimeTrackingView } from './components/tracking/RealtimeTrackingView';
import { OrderHistoryView } from './components/history/OrderHistoryView';
import { Wifi, Battery, Smartphone, Sparkles, Shield, Users, Bike } from 'lucide-react';

const MainScreen: React.FC = () => {
  const { activeTab, deviceFrame, setDeviceFrame } = useApp();
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}`;
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'menu':
        return <RestaurantMenu />;
      case 'cart':
        return <CartView />;
      case 'tracking':
        return <RealtimeTrackingView />;
      case 'history':
        return <OrderHistoryView />;
      default:
        return <Dashboard />;
    }
  };

  // If Mobile Frame view is selected on desktop
  if (deviceFrame === 'mobile') {
    return (
      <div className="min-h-screen bg-neutral-200 dark:bg-black py-4 px-2 sm:px-6 flex flex-col items-center justify-center transition-colors">
        {/* Desktop Quick Bar / Intro */}
        <div className="w-full max-w-4xl mb-4 hidden md:flex items-center justify-between px-4 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>QuickBite Mobile Experience</span>
            </span>
            <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-orange-500" />
                <span>Live GPS Courier</span>
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure 3DS Gateway</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Roommate Bill Split</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeviceFrame('responsive')}
            className="px-3 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
          >
            Switch to Full Responsive Canvas
          </button>
        </div>

        {/* iPhone 16 Pro Mockup Frame */}
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[95vh] bg-white dark:bg-neutral-950 rounded-[48px] border-[10px] border-neutral-850 dark:border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden ring-1 ring-neutral-400/20">
          {/* iOS Status Bar */}
          <div className="relative z-30 pt-3 px-6 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white select-none">
            <span className="font-mono text-xs">{currentTime}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-2">
              <DynamicIsland />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* App Header */}
          <Header />

          {/* Scrollable View Area */}
          <main className="flex-1 overflow-y-auto relative no-scrollbar">
            {renderCurrentView()}
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav />

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 pointer-events-none z-50" />
        </div>
      </div>
    );
  }

  // Full-width Responsive Canvas Mode
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-black text-neutral-900 dark:text-white flex flex-col transition-colors">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto relative">
        {renderCurrentView()}
      </main>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
}
