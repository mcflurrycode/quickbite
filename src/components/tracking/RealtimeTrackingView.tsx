import React, { useState, useEffect } from 'react';
import {
  Bike,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  FastForward,
  RotateCcw,
  Send,
  X,
  Sparkles,
  PhoneOff,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RealtimeTrackingView: React.FC = () => {
  const {
    activeOrder,
    fastForwardOrderStatus,
    cancelActiveOrder,
    setActiveTab,
    deliveryAddress,
    orders,
  } = useApp();

  // If no active order, check if we have any recently placed order or show prompt
  const displayOrder = activeOrder || orders[0];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'courier'; text: string; time: string }[]>([
    { sender: 'courier', text: "Hey! I just picked up your warm food from the kitchen. On my scooter now!", time: '2 mins ago' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Live courier map coordinate interpolation
  const [courierProgress, setCourierProgress] = useState(0.5); // 0 (restaurant) to 1 (dorm)

  useEffect(() => {
    if (!displayOrder) return;
    switch (displayOrder.status) {
      case 'placed':
        setCourierProgress(0.05);
        break;
      case 'cooking':
        setCourierProgress(0.2);
        break;
      case 'picked_up':
        setCourierProgress(0.55);
        break;
      case 'arriving':
        setCourierProgress(0.9);
        break;
      case 'delivered':
        setCourierProgress(1.0);
        break;
    }
  }, [displayOrder?.status]);

  // Simulated phone call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallOpen) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallOpen]);

  if (!displayOrder) {
    return (
      <div className="pb-28 pt-10 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <Bike className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            No live order in progress
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Place an order from any campus spot to track your courier in real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md"
        >
          Browse Menus
        </button>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Just now' },
    ]);
    setChatInput('');

    // Simulated courier response
    setTimeout(() => {
      let reply = "Got it! Thanks for letting me know. See you in a few minutes!";
      if (userText.toLowerCase().includes('lobby') || userText.toLowerCase().includes('desk')) {
        reply = "Perfect, I will leave it with the front desk reception and message you when dropped!";
      } else if (userText.toLowerCase().includes('code') || userText.toLowerCase().includes('gate')) {
        reply = "Noted the gate code! Entering the campus gate now.";
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: 'courier', text: reply, time: 'Just now' },
      ]);
    }, 1500);
  };

  const milestones = [
    {
      title: 'Order Confirmed',
      desc: 'Kitchen accepted your order',
      done: ['placed', 'cooking', 'picked_up', 'arriving', 'delivered'].includes(displayOrder.status),
      active: displayOrder.status === 'placed',
    },
    {
      title: 'Cooking in Kitchen',
      desc: 'Chef is grilling fresh',
      done: ['cooking', 'picked_up', 'arriving', 'delivered'].includes(displayOrder.status),
      active: displayOrder.status === 'cooking',
    },
    {
      title: 'Courier on the Way',
      desc: 'Marcus picked up your meal',
      done: ['picked_up', 'arriving', 'delivered'].includes(displayOrder.status),
      active: displayOrder.status === 'picked_up',
    },
    {
      title: 'Arrived at Campus Gate',
      desc: 'Meet courier or check lobby',
      done: ['arriving', 'delivered'].includes(displayOrder.status),
      active: displayOrder.status === 'arriving',
    },
  ];

  // SVG route calculation
  // Start: (50, 70), Control 1: (150, 40), Control 2: (250, 160), End: (350, 110)
  // Interpolate courier point:
  const t = courierProgress;
  const startX = 60, startY = 75;
  const endX = 340, endY = 130;
  const courierX = startX + (endX - startX) * t + Math.sin(t * Math.PI) * 20;
  const courierY = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 40;

  return (
    <div className="pb-28 max-w-xl mx-auto space-y-4">
      {/* Simulation Controller Bar (Great for testing the real-time UX!) */}
      <div className="mx-4 mt-2 p-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800/90 border border-neutral-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Status: <strong className="text-orange-400 capitalize">{displayOrder.status.replace('_', ' ')}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          {displayOrder.status !== 'delivered' && (
            <button
              type="button"
              onClick={fastForwardOrderStatus}
              className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <FastForward className="w-3 h-3" />
              <span>Next Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Simulated Map View */}
      <div className="relative mx-4 h-64 rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#E8ECEF] dark:bg-[#131924] shadow-inner select-none">
        {/* Map Grid and Streets (SVG) */}
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Subtle Park/Green Area */}
          <rect x="180" y="20" width="80" height="60" rx="10" className="fill-emerald-100/60 dark:fill-emerald-950/20" />
          <text x="195" y="55" className="fill-emerald-700/40 dark:fill-emerald-500/30 text-[9px] font-semibold">Campus Quad</text>

          {/* Grid Street Lines */}
          <line x1="0" y1="40" x2="400" y2="40" className="stroke-white dark:stroke-neutral-800/80" strokeWidth="8" />
          <line x1="0" y1="110" x2="400" y2="110" className="stroke-white dark:stroke-neutral-800/80" strokeWidth="10" />
          <line x1="0" y1="170" x2="400" y2="170" className="stroke-white dark:stroke-neutral-800/80" strokeWidth="6" />

          <line x1="70" y1="0" x2="70" y2="200" className="stroke-white dark:stroke-neutral-800/80" strokeWidth="8" />
          <line x1="160" y1="0" x2="160" y2="200" className="stroke-white dark:stroke-neutral-800/80" strokeWidth="8" />
          <line x1="280" y1="0" x2="280" y2="200" className="stroke-white dark:stroke-neutral-800/80" strokeWidth="10" />

          {/* Planned Delivery Route Line */}
          <path
            d="M 60 75 Q 160 30, 200 110 T 340 130"
            fill="none"
            className="stroke-orange-500"
            strokeWidth="4"
            strokeDasharray="6,4"
          />

          {/* Restaurant Origin Marker */}
          <g transform="translate(60, 75)">
            <circle r="12" className="fill-orange-500" />
            <text x="0" y="4" textAnchor="middle" className="fill-white text-[9px] font-bold">🍔</text>
          </g>

          {/* Campus Dorm Destination Marker */}
          <g transform="translate(340, 130)">
            <circle r="14" className="fill-neutral-900 dark:fill-white" />
            <circle r="5" className="fill-orange-500" />
          </g>
        </svg>

        {/* Dynamic Animated Courier Scooter Marker */}
        <div
          className="absolute z-10 transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(courierX / 400) * 100}%`,
            top: `${(courierY / 200) * 100}%`,
          }}
        >
          <div className="relative">
            {/* Pulsing Beacon */}
            <div className="absolute -inset-2 rounded-full bg-orange-500/40 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-orange-500 shadow-xl flex items-center justify-center text-orange-500">
              <Bike className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Map Live Floating HUD Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GPS Live Tracking</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-semibold shadow-md">
            {displayOrder.status === 'delivered' ? 'Delivered' : 'Speed: 19 mph'}
          </div>
        </div>

        {/* Destination Chip */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <div className="p-2.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 text-xs flex items-center gap-2 shadow-lg">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
              {displayOrder.deliveryAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery ETA & PIN Card */}
      <div className="mx-4 p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Estimated Delivery
            </span>
            <div className="text-3xl font-black text-neutral-900 dark:text-white font-mono tracking-tight mt-0.5">
              {displayOrder.status === 'delivered' ? (
                <span className="text-emerald-500">Arrived!</span>
              ) : (
                `${displayOrder.estimatedDeliveryMinutes} Mins Away`
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Order {displayOrder.id} · {displayOrder.restaurantName}
            </p>
          </div>

          {/* Secure Handoff PIN */}
          <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Drop-off PIN
            </span>
            <div className="text-lg font-mono font-extrabold text-neutral-900 dark:text-white tracking-widest">
              {displayOrder.orderPin}
            </div>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          {milestones.map((step, idx) => (
            <div key={step.title} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : step.active
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                {idx < milestones.length - 1 && (
                  <div
                    className={`w-0.5 h-6 ${
                      step.done ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                )}
              </div>
              <div className="pt-0.5 flex-1">
                <div className={`text-xs font-bold ${step.active ? 'text-orange-500' : 'text-neutral-900 dark:text-white'}`}>
                  {step.title}
                </div>
                <div className="text-[11px] text-neutral-500">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courier Driver Card with Live Chat & Call Trigger */}
      <div className="mx-4 p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={displayOrder.courier.avatar}
              alt={displayOrder.courier.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{displayOrder.courier.name}</span>
              <span className="text-[11px] text-amber-500 font-semibold">★ {displayOrder.courier.rating}</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {displayOrder.courier.vehicle}
            </p>
            <p className="text-[10px] font-mono text-neutral-400">
              Plate: {displayOrder.courier.plate}
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            aria-label="Message courier"
            className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-orange-500" />
          </button>
          <button
            type="button"
            onClick={() => setIsCallOpen(true)}
            aria-label="Call courier"
            className="w-10 h-10 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Phone className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Order Item Summary Accordion */}
      <div className="mx-4 p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
        <button
          type="button"
          onClick={() => setIsOrderSummaryExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white"
        >
          <span>Order Details ({displayOrder.items.length} items)</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-orange-600 dark:text-orange-400">${displayOrder.total.toFixed(2)}</span>
            {isOrderSummaryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isOrderSummaryExpanded && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-xs">
            {displayOrder.items.map((i) => (
              <div key={i.cartItemId} className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>{i.quantity}x {i.item.name}</span>
                <span className="font-mono tabular-nums">${(i.itemTotal * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between font-bold text-neutral-900 dark:text-white">
              <span>Paid via {displayOrder.paymentDetails.method.replace('_', ' ').toUpperCase()}</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">${displayOrder.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Interactive Driver Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-950 rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={displayOrder.courier.avatar}
                  alt={displayOrder.courier.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Chat with {displayOrder.courier.name}
                  </h3>
                  <p className="text-[10px] text-emerald-500 font-semibold">Active & riding</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setChatInput('Please leave order with front desk lobby');
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 whitespace-nowrap text-neutral-700 dark:text-neutral-300"
              >
                Leave at front desk
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatInput('Gate code is 4921');
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 whitespace-nowrap text-neutral-700 dark:text-neutral-300"
              >
                Gate code is 4921
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatInput("I'm coming down to the gate now!");
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 whitespace-nowrap text-neutral-700 dark:text-neutral-300"
              >
                Coming down now
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-white rounded-br-none'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type instructions for your rider..."
                className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Live Audio Phone Call Screen */}
      {isCallOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-300">
          <div className="text-center pt-10 space-y-3">
            <img
              src={displayOrder.courier.avatar}
              alt={displayOrder.courier.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-neutral-800 shadow-2xl"
            />
            <div>
              <h2 className="text-xl font-bold">{displayOrder.courier.name}</h2>
              <p className="text-xs text-neutral-400">Campus Courier · White Honda Scooter</p>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              {callDuration > 0
                ? `00:${callDuration < 10 ? `0${callDuration}` : callDuration}`
                : 'Connecting via QuickBite Masked Line...'}
            </div>
          </div>

          <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center justify-center gap-6">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
                <Volume2 className="w-5 h-5" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCallOpen(false)}
              className="w-full h-14 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
