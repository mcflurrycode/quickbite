import React from 'react';
import { Bike, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DynamicIsland: React.FC = () => {
  const { activeOrder, setActiveTab } = useApp();

  const isLive = activeOrder && activeOrder.status !== 'delivered';

  return (
    <div className="w-full flex justify-center py-2 px-6 select-none">
      <button
        type="button"
        onClick={() => {
          if (isLive) setActiveTab('tracking');
        }}
        className={`h-7 transition-all duration-300 ease-out rounded-full bg-black border border-neutral-800 text-white flex items-center justify-between px-3 cursor-pointer ${
          isLive ? 'w-56 shadow-md shadow-orange-500/10' : 'w-24'
        }`}
      >
        {isLive ? (
          <>
            <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
              <Bike className="w-3.5 h-3.5 animate-bounce" />
              <span className="text-[11px] truncate">{activeOrder.restaurantName.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-neutral-300 font-mono">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{activeOrder.estimatedDeliveryMinutes}m</span>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
            <div className="w-2 h-2 rounded-full bg-blue-950/60" />
          </div>
        )}
      </button>
    </div>
  );
};
