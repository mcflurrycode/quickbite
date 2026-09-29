import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    deliveryAddress,
    setDeliveryAddress,
    campusLocations,
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    deviceFrame,
    setDeviceFrame,
  } = useApp();

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
            <span className="font-extrabold text-base tracking-tighter">Q</span>
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
            QuickBite
          </span>
        </div>

        {/* Zone 2: Interactive Campus Location Selector */}
        <div className="relative flex-1 max-w-xs mx-auto hidden sm:block">
          <button
            type="button"
            onClick={() => setIsLocationDropdownOpen((prev) => !prev)}
            className="w-full h-9 px-3 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-200 hover:border-orange-500/50 transition-colors"
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate font-medium">{deliveryAddress}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
          </button>

          {isLocationDropdownOpen && (
            <div className="absolute top-11 left-0 right-0 z-50 p-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800">
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Campus Drop-off Spots</span>
                <Sparkles className="w-3 h-3 text-orange-500" />
              </div>
              <div className="mt-1 space-y-0.5 max-h-56 overflow-y-auto">
                {campusLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setDeliveryAddress(loc);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors flex items-center justify-between ${
                      deliveryAddress === loc
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="truncate">{loc}</span>
                    {deliveryAddress === loc && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone 3: Functional Actions (Dark Mode, Haptics/Audio, Frame View Toggle) */}
        <div className="flex items-center gap-1.5">
          {/* Sound / Haptics Audio Feedback Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute tactile audio' : 'Enable tactile audio'}
            title={soundEnabled ? 'Tactile sound ON' : 'Tactile sound MUTED'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
          </button>

          {/* High-Contrast Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to high-contrast dark mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to High-Contrast OLED Dark Mode'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Viewport Frame Mode Toggle (iPhone 16 Pro mockup vs Responsive view) */}
          <button
            type="button"
            onClick={() => setDeviceFrame(deviceFrame === 'mobile' ? 'responsive' : 'mobile')}
            aria-label="Toggle frame mode"
            title={deviceFrame === 'mobile' ? 'Expand to Full Responsive View' : 'Switch to iPhone 16 Frame View'}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-orange-500/50 transition-colors"
          >
            {deviceFrame === 'mobile' ? (
              <>
                <Maximize2 className="w-3 h-3 text-orange-500" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-orange-500" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
