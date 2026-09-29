import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Sparkles,
  Plus,
  Minus,
  X,
  Flame,
  Check,
  Heart,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, CartItemOption } from '../../types';

export const RestaurantMenu: React.FC = () => {
  const {
    selectedRestaurant,
    setActiveTab,
    addToCart,
    savedFavorites,
    toggleFavorite,
    cartItemCount,
    cartSubtotal,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Customization modal local state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSpice, setSelectedSpice] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [specialNote, setSpecialNote] = useState<string>('');
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!selectedRestaurant) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">No restaurant selected.</p>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-semibold"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isFav = savedFavorites.includes(selectedRestaurant.id);

  // Open customization modal
  const openCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedSize(item.customization?.sizes?.[0]?.name || '');
    setSelectedSpice(item.customization?.spiceLevels?.[0] || '');
    setSelectedAddOns([]);
    setSpecialNote('');
    setModalQuantity(1);
  };

  // Add-on toggle
  const toggleAddOn = (addOnName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnName) ? prev.filter((a) => a !== addOnName) : [...prev, addOnName]
    );
  };

  // Calculate modal total
  const computeModalTotal = () => {
    if (!customizingItem) return 0;
    const base = customizingItem.studentSpecial && customizingItem.studentDiscountPrice !== undefined
      ? customizingItem.studentDiscountPrice
      : customizingItem.price;

    let extra = 0;
    if (selectedSize && customizingItem.customization?.sizes) {
      const sizeObj = customizingItem.customization.sizes.find((s) => s.name === selectedSize);
      if (sizeObj) extra += sizeObj.extraPrice;
    }
    if (customizingItem.customization?.addOns) {
      selectedAddOns.forEach((addOnName) => {
        const addOnObj = customizingItem.customization?.addOns?.find((a) => a.name === addOnName);
        if (addOnObj) extra += addOnObj.price;
      });
    }

    return (base + extra) * modalQuantity;
  };

  const handleConfirmAddToCart = () => {
    if (!customizingItem || !selectedRestaurant) return;

    const options: CartItemOption = {
      size: selectedSize || undefined,
      spiceLevel: selectedSpice || undefined,
      addOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      specialInstructions: specialNote.trim() || undefined,
    };

    addToCart(customizingItem, options, modalQuantity, selectedRestaurant);
    setToastMessage(`Added ${customizingItem.name} to cart!`);
    setTimeout(() => setToastMessage(null), 2000);
    setCustomizingItem(null);
  };

  // Filter menu items
  const filteredMenu = activeCategory === 'All'
    ? selectedRestaurant.menu
    : selectedRestaurant.menu.filter((m) => m.category === activeCategory);

  const categories = ['All', 'Popular', 'Combos', 'Sides', 'Drinks'];

  return (
    <div className="pb-28 max-w-2xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Navigation */}
      <div className="relative h-60 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <img
          src={selectedRestaurant.coverImage}
          alt={selectedRestaurant.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

        {/* Back and Action Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            aria-label="Back to dashboard"
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(selectedRestaurant.id)}
              aria-label="Favorite restaurant"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(window.location.href);
                  setToastMessage('Restaurant link copied to clipboard!');
                  setTimeout(() => setToastMessage(null), 2000);
                } catch {
                  // ignore
                }
              }}
              aria-label="Share restaurant"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Restaurant Header Details */}
        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white">
              Campus Partner Spot
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{selectedRestaurant.rating}</span>
              <span className="text-neutral-300 text-[11px]">({selectedRestaurant.reviewCount})</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {selectedRestaurant.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span>{selectedRestaurant.cuisine}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-400" />
              <span>{selectedRestaurant.prepTime}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{selectedRestaurant.distance}</span>
          </div>
        </div>
      </div>

      {/* Student Discount Announcement */}
      {selectedRestaurant.studentDiscountNotice && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 flex items-center gap-2.5 text-xs text-orange-800 dark:text-orange-300">
          <Flame className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="font-medium">{selectedRestaurant.studentDiscountNotice}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="sticky top-14 z-20 bg-neutral-100/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Dish Items Grid */}
      <div className="px-4 mt-4 space-y-3">
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            onClick={() => openCustomizer(item)}
            className="group cursor-pointer p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 shadow-sm flex items-start justify-between gap-4 transition-all"
          >
            {/* Dish description & metadata */}
            <div className="space-y-1.5 flex-1 min-w-0">
              {item.studentSpecial && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Student Saver Special</span>
                </div>
              )}

              <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">
                {item.name}
              </h3>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {/* Zero-Pill Dietary and Calories */}
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                {item.calories && <span>{item.calories} kcal</span>}
                {item.dietary && item.dietary.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{item.dietary.join(', ')}</span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 pt-1">
                {item.studentSpecial && item.studentDiscountPrice !== undefined ? (
                  <>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 tabular-nums">
                      ${item.studentDiscountPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400 line-through tabular-nums">
                      ${item.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail + Add Button */}
            <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openCustomizer(item);
                }}
                aria-label={`Customize ${item.name}`}
                className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating View Cart Sticky Button (If cart has items) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className="w-full h-13 px-5 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-between font-bold text-sm shadow-xl active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
              <span>View Order Cart</span>
            </div>
            <span className="tabular-nums font-mono text-orange-400 dark:text-orange-600">
              ${cartSubtotal.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Customization Bottom Sheet / Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-950 rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Customize Item
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {customizingItem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1">
              {/* Size Selection */}
              {customizingItem.customization?.sizes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Choose Size
                  </h4>
                  <div className="space-y-1.5">
                    {customizingItem.customization.sizes.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setSelectedSize(s.name)}
                        className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                          selectedSize === s.name
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 font-semibold text-neutral-900 dark:text-white'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className="font-mono text-neutral-500">
                          {s.extraPrice > 0 ? `+$${s.extraPrice.toFixed(2)}` : 'Standard'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spice Level Selection */}
              {customizingItem.customization?.spiceLevels && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Spice / Heat Level
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.customization.spiceLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedSpice(lvl)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors ${
                          selectedSpice === lvl
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Checklist */}
              {customizingItem.customization?.addOns && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Add-ons & Extras
                  </h4>
                  <div className="space-y-1.5">
                    {customizingItem.customization.addOns.map((add) => {
                      const isChecked = selectedAddOns.includes(add.name);
                      return (
                        <button
                          key={add.name}
                          type="button"
                          onClick={() => toggleAddOn(add.name)}
                          className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 text-neutral-900 dark:text-white font-medium'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-neutral-300 dark:border-neutral-700'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{add.name}</span>
                          </div>
                          <span className="font-mono text-neutral-500">
                            +${add.price.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Special Kitchen Note
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="e.g., Extra napkins, sauce on the side, please"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Quantity
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                    disabled={modalQuantity <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                    {modalQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-between px-5 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-transform"
              >
                <span>Add to My Order</span>
                <span className="font-mono tabular-nums">
                  ${computeModalTotal().toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
