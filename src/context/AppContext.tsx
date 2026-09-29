import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Restaurant,
  MenuItem,
  CartItem,
  CartItemOption,
  Order,
  AppTab,
  PaymentDetails,
  SplitMember,
} from '../types';
import { MOCK_RESTAURANTS, CAMPUS_LOCATIONS, MOCK_COURIER, SAMPLE_SAVED_ORDERS } from '../data/mockData';
import { playTactileFeedback } from '../utils/haptics';

interface PromoResult {
  success: boolean;
  message: string;
  discountRate?: number; // e.g. 0.5 for 50%
  fixedDiscount?: number;
}

interface AppContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, options: CartItemOption, quantity: number, restaurant: Restaurant) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  orders: Order[];
  placeOrder: (paymentDetails: PaymentDetails, tip: number, splitMembers?: SplitMember[]) => Order;
  cancelActiveOrder: () => void;
  fastForwardOrderStatus: () => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  campusLocations: string[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  deviceFrame: 'mobile' | 'responsive';
  setDeviceFrame: (mode: 'mobile' | 'responsive') => void;
  campusCardBalance: number;
  appliedPromo: string | null;
  promoDiscountAmount: number;
  applyPromoCode: (code: string) => PromoResult;
  removePromoCode: () => void;
  savedFavorites: string[];
  toggleFavorite: (restaurantId: string) => void;
  updateOrderRating: (orderId: string, rating: number, feedback: string[]) => void;
  reorderPastOrder: (order: Order) => void;
  exportCartShareUrl: () => string;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  CART: 'quickbite_cart_v1',
  ORDERS: 'quickbite_orders_v1',
  ACTIVE_ORDER: 'quickbite_active_order_v1',
  DARK_MODE: 'quickbite_dark_mode_v1',
  SOUND: 'quickbite_sound_v1',
  ADDRESS: 'quickbite_address_v1',
  FAVORITES: 'quickbite_favorites_v1',
  CAMPUS_BALANCE: 'quickbite_campus_balance_v1',
  DEVICE_FRAME: 'quickbite_device_frame_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & selection
  const [activeTab, setActiveTabState] = useState<AppTab>('dashboard');
  const [restaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [selectedRestaurant, setSelectedRestaurantState] = useState<Restaurant | null>(MOCK_RESTAURANTS[0]);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sound feedback toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Device frame presentation mode
  const [deviceFrame, setDeviceFrameState] = useState<'mobile' | 'responsive'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICE_FRAME);
      return (saved as 'mobile' | 'responsive') || 'mobile';
    } catch {
      return 'mobile';
    }
  });

  // Campus location address
  const [deliveryAddress, setDeliveryAddressState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADDRESS);
      return saved ? JSON.parse(saved) : CAMPUS_LOCATIONS[0];
    } catch {
      return CAMPUS_LOCATIONS[0];
    }
  });

  // Campus Meal Card balance
  const [campusCardBalance, setCampusCardBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPUS_BALANCE);
      return saved !== null ? JSON.parse(saved) : 142.5;
    } catch {
      return 142.5;
    }
  });

  // Saved favorites
  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : ['smashlab-burgers'];
    } catch {
      return ['smashlab-burgers'];
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
      // Pre-seed an initial delicious item so user immediately sees a lively cart
      const initialItem = MOCK_RESTAURANTS[0].menu[0];
      return [
        {
          cartItemId: 'seed-1',
          item: initialItem,
          quantity: 1,
          restaurantId: MOCK_RESTAURANTS[0].id,
          restaurantName: MOCK_RESTAURANTS[0].name,
          selectedOptions: {
            size: 'Double Patty (Standard)',
            spiceLevel: 'Chili Kick',
            addOns: ['Extra Melted Cheddar'],
          },
          itemTotal: 9.24, // using student price 7.99 + 1.25 addon
        },
      ];
    } catch {
      return [];
    }
  });

  // Promo code state
  const [appliedPromo, setAppliedPromo] = useState<string | null>('CAMPUS50');

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : SAMPLE_SAVED_ORDERS;
    } catch {
      return SAMPLE_SAVED_ORDERS;
    }
  });

  // Active tracking order
  const [activeOrder, setActiveOrderState] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Synchronize Dark Mode to HTML document tag
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
  }, [darkMode]);

  // Synchronize Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Synchronize Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  // Synchronize Active Order to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, JSON.stringify(activeOrder));
    } catch {
      // Ignore
    }
  }, [activeOrder]);

  // Real-time Order progress simulation timer
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    const interval = setInterval(() => {
      setActiveOrderState((prev) => {
        if (!prev || prev.status === 'delivered') return prev;
        let nextStatus: Order['status'] = prev.status;
        let nextMinutes = Math.max(0, prev.estimatedDeliveryMinutes - 1);

        if (prev.status === 'placed') {
          nextStatus = 'cooking';
          nextMinutes = 15;
        } else if (prev.status === 'cooking' && nextMinutes <= 12) {
          nextStatus = 'picked_up';
        } else if (prev.status === 'picked_up' && nextMinutes <= 4) {
          nextStatus = 'arriving';
        } else if (prev.status === 'arriving' && nextMinutes === 0) {
          nextStatus = 'delivered';
          playTactileFeedback('success', soundEnabled);
        }

        const updated: Order = {
          ...prev,
          status: nextStatus,
          estimatedDeliveryMinutes: nextMinutes,
        };

        // Also update in orders history list
        setOrders((currOrders) =>
          currOrders.map((o) => (o.id === updated.id ? updated : o))
        );

        return updated;
      });
    }, 12000); // Progress step updates every 12 seconds in simulated mode

    return () => clearInterval(interval);
  }, [activeOrder, soundEnabled]);

  const toggleDarkMode = useCallback(() => {
    playTactileFeedback('selection', soundEnabled);
    setDarkMode((prev) => !prev);
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(next));
      playTactileFeedback('light', next);
      return next;
    });
  }, []);

  const setDeviceFrame = useCallback((mode: 'mobile' | 'responsive') => {
    playTactileFeedback('light', soundEnabled);
    setDeviceFrameState(mode);
    localStorage.setItem(STORAGE_KEYS.DEVICE_FRAME, mode);
  }, [soundEnabled]);

  const setDeliveryAddress = useCallback((addr: string) => {
    playTactileFeedback('selection', soundEnabled);
    setDeliveryAddressState(addr);
    localStorage.setItem(STORAGE_KEYS.ADDRESS, JSON.stringify(addr));
  }, [soundEnabled]);

  const setActiveTab = useCallback((tab: AppTab) => {
    playTactileFeedback('light', soundEnabled);
    setActiveTabState(tab);
  }, [soundEnabled]);

  const setSelectedRestaurant = useCallback((restaurant: Restaurant | null) => {
    playTactileFeedback('selection', soundEnabled);
    setSelectedRestaurantState(restaurant);
    if (restaurant) {
      setActiveTabState('menu');
    }
  }, [soundEnabled]);

  const toggleFavorite = useCallback((restaurantId: string) => {
    playTactileFeedback('medium', soundEnabled);
    setSavedFavorites((prev) => {
      const exists = prev.includes(restaurantId);
      const next = exists ? prev.filter((id) => id !== restaurantId) : [...prev, restaurantId];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  }, [soundEnabled]);

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.itemTotal * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Promo discount calculation
  let promoDiscountAmount = 0;
  if (appliedPromo === 'CAMPUS50') {
    promoDiscountAmount = Math.min(cartSubtotal * 0.5, 12); // 50% off up to $12
  } else if (appliedPromo === 'LATESTUDY') {
    promoDiscountAmount = 4.0;
  } else if (appliedPromo === 'FREESHIP') {
    promoDiscountAmount = 2.99;
  }

  const applyPromoCode = useCallback((code: string): PromoResult => {
    const clean = code.trim().toUpperCase();
    playTactileFeedback('medium', soundEnabled);
    if (clean === 'CAMPUS50') {
      setAppliedPromo('CAMPUS50');
      return { success: true, message: 'Campus 50% discount applied! Max $12 savings.' };
    }
    if (clean === 'LATESTUDY') {
      setAppliedPromo('LATESTUDY');
      return { success: true, message: 'Night Owl discount: $4.00 deducted from total!' };
    }
    if (clean === 'FREESHIP') {
      setAppliedPromo('FREESHIP');
      return { success: true, message: 'Free delivery voucher applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try "CAMPUS50" or "LATESTUDY".' };
  }, [soundEnabled]);

  const removePromoCode = useCallback(() => {
    playTactileFeedback('light', soundEnabled);
    setAppliedPromo(null);
  }, [soundEnabled]);

  const addToCart = useCallback((
    item: MenuItem,
    options: CartItemOption,
    quantity: number,
    restaurant: Restaurant
  ) => {
    playTactileFeedback('medium', soundEnabled);
    
    // Calculate price including options and student discount
    const basePrice = item.studentSpecial && item.studentDiscountPrice !== undefined
      ? item.studentDiscountPrice
      : item.price;
    
    let extra = 0;
    if (options.size && item.customization?.sizes) {
      const match = item.customization.sizes.find((s) => s.name === options.size);
      if (match) extra += match.extraPrice;
    }
    if (options.addOns && item.customization?.addOns) {
      options.addOns.forEach((addOnName) => {
        const match = item.customization?.addOns?.find((a) => a.name === addOnName);
        if (match) extra += match.price;
      });
    }

    const calculatedUnitPrice = basePrice + extra;
    const cartItemId = `${item.id}-${options.size || ''}-${options.spiceLevel || ''}-${(options.addOns || []).sort().join(',')}`;

    setCart((prev) => {
      // Check if existing
      const existingIndex = prev.findIndex((c) => c.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [
        ...prev,
        {
          cartItemId,
          item,
          quantity,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          selectedOptions: options,
          itemTotal: calculatedUnitPrice,
        },
      ];
    });
  }, [soundEnabled]);

  const removeFromCart = useCallback((cartItemId: string) => {
    playTactileFeedback('light', soundEnabled);
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, [soundEnabled]);

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    playTactileFeedback('selection', soundEnabled);
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.cartItemId === cartItemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  }, [soundEnabled]);

  const clearCart = useCallback(() => {
    playTactileFeedback('selection', soundEnabled);
    setCart([]);
  }, [soundEnabled]);

  // Place Order
  const placeOrder = useCallback(
    (paymentDetails: PaymentDetails, tip: number, splitMembers?: SplitMember[]): Order => {
      playTactileFeedback('success', soundEnabled);

      const restaurantName = cart[0]?.restaurantName || 'QuickBite Partner';
      const restaurantId = cart[0]?.restaurantId || 'smashlab-burgers';
      const sub = cartSubtotal;
      const discount = promoDiscountAmount;
      const delivery = cart[0]?.restaurantId === 'taco-fiesta-california' ? 1.49 : 0;
      const platform = 0.99;
      const totalAmount = Math.max(0, sub - discount + delivery + platform + tip);

      // Deduct campus card balance if that was the payment method
      if (paymentDetails.method === 'campus_card') {
        setCampusCardBalance((prev) => {
          const next = Math.max(0, prev - totalAmount);
          localStorage.setItem(STORAGE_KEYS.CAMPUS_BALANCE, JSON.stringify(next));
          return next;
        });
      }

      const newOrder: Order = {
        id: `QB-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: 'Just now',
        restaurantId,
        restaurantName,
        items: [...cart],
        subtotal: sub,
        studentDiscount: discount,
        deliveryFee: delivery,
        platformFee: platform,
        tip,
        total: totalAmount,
        deliveryAddress,
        status: 'placed',
        estimatedDeliveryMinutes: 18,
        orderPin: `${Math.floor(1000 + Math.random() * 9000)}`,
        courier: { ...MOCK_COURIER },
        paymentDetails,
        splitMembers,
      };

      setActiveOrderState(newOrder);
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]); // Clear cart
      setActiveTabState('tracking'); // Navigate to live tracking

      return newOrder;
    },
    [cart, cartSubtotal, promoDiscountAmount, deliveryAddress, soundEnabled]
  );

  const cancelActiveOrder = useCallback(() => {
    playTactileFeedback('warning', soundEnabled);
    if (!activeOrder) return;
    const cancelledOrder: Order = {
      ...activeOrder,
      status: 'delivered', // mark closed
    };
    setActiveOrderState(null);
    setOrders((prev) => prev.map((o) => (o.id === cancelledOrder.id ? cancelledOrder : o)));
  }, [activeOrder, soundEnabled]);

  const fastForwardOrderStatus = useCallback(() => {
    playTactileFeedback('medium', soundEnabled);
    if (!activeOrder) return;
    const statusOrder: Order['status'][] = ['placed', 'cooking', 'picked_up', 'arriving', 'delivered'];
    const currentIndex = statusOrder.indexOf(activeOrder.status);
    const nextStatus = statusOrder[Math.min(statusOrder.length - 1, currentIndex + 1)];
    const updated: Order = {
      ...activeOrder,
      status: nextStatus,
      estimatedDeliveryMinutes: nextStatus === 'delivered' ? 0 : Math.max(1, activeOrder.estimatedDeliveryMinutes - 5),
    };
    setActiveOrderState(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (nextStatus === 'delivered') {
      playTactileFeedback('success', soundEnabled);
    }
  }, [activeOrder, soundEnabled]);

  const updateOrderRating = useCallback((orderId: string, rating: number, feedback: string[]) => {
    playTactileFeedback('success', soundEnabled);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating, reviewFeedback: feedback } : o))
    );
  }, [soundEnabled]);

  const reorderPastOrder = useCallback((pastOrder: Order) => {
    playTactileFeedback('medium', soundEnabled);
    setCart(pastOrder.items);
    setActiveTabState('cart');
  }, [soundEnabled]);

  const exportCartShareUrl = useCallback(() => {
    playTactileFeedback('success', soundEnabled);
    const summary = cart.map((c) => `${c.quantity}x ${c.item.name}`).join(', ');
    const shareText = `QuickBite Order (${cart.length} items): ${summary}. Total: $${cartSubtotal.toFixed(2)}`;
    try {
      navigator.clipboard.writeText(shareText);
    } catch {
      // fallback
    }
    return shareText;
  }, [cart, cartSubtotal, soundEnabled]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        restaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        activeOrder,
        setActiveOrder: setActiveOrderState,
        orders,
        placeOrder,
        cancelActiveOrder,
        fastForwardOrderStatus,
        deliveryAddress,
        setDeliveryAddress,
        campusLocations: CAMPUS_LOCATIONS,
        darkMode,
        toggleDarkMode,
        soundEnabled,
        toggleSound,
        deviceFrame,
        setDeviceFrame,
        campusCardBalance,
        appliedPromo,
        promoDiscountAmount,
        applyPromoCode,
        removePromoCode,
        savedFavorites,
        toggleFavorite,
        updateOrderRating,
        reorderPastOrder,
        exportCartShareUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
