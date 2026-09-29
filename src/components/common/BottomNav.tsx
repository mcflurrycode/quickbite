import React from 'react';
import { Compass, UtensilsCrossed, ShoppingBag, Bike, ReceiptText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartItemCount, activeOrder } = useApp();

  const isOrderTrackingActive = activeOrder && activeOrder.status !== 'delivered';

  const navItems: { tab: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Explore', icon: Compass },
    { tab: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { tab: 'cart', label: 'Cart', icon: ShoppingBag },
    { tab: 'tracking', label: 'Live Track', icon: Bike },
    { tab: 'history', label: 'Orders', icon: ReceiptText },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-800/80 shadow-lg"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          const isCart = tab === 'cart';
          const isTracking = tab === 'tracking';

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all duration-150 ${
                isActive
                  ? 'text-orange-500 font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 text-orange-500' : 'scale-100'
                  }`}
                />

                {/* Cart Item Badge */}
                {isCart && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-orange-500/50 animate-pulse">
                    {cartItemCount}
                  </span>
                )}

                {/* Live Tracking Active Pulsing Beacon */}
                {isTracking && isOrderTrackingActive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 transition-colors ${
                isActive ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''
              }`}>
                {label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
