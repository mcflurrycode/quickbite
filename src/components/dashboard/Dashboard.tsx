import React, { useState, useMemo } from 'react';
import {
  Search,
  Zap,
  GraduationCap,
  Clock,
  Star,
  Heart,
  Flame,
  ArrowRight,
  Sparkles,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, Order } from '../../types';

export const Dashboard: React.FC = () => {
  const {
    restaurants,
    setSelectedRestaurant,
    orders,
    reorderPastOrder,
    savedFavorites,
    toggleFavorite,
    applyPromoCode,
    appliedPromo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [budgetUnder10Only, setBudgetUnder10Only] = useState(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);
  const [freeCampusDeliveryOnly, setFreeCampusDeliveryOnly] = useState(false);
  const [promoCopied, setPromoCopied] = useState(false);

  const categories = [
    { id: 'All', label: 'All Cravings' },
    { id: 'Burgers', label: 'Burgers & Fries' },
    { id: 'Ramen', label: 'Ramen & Noodles' },
    { id: 'Mexican', label: 'Tacos & Birria' },
    { id: 'Healthy', label: 'Power Bowls' },
  ];

  // Filtering logic
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.menu.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'All' ||
        r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());

      // Budget filter: has items under $10
      const matchesBudget = !budgetUnder10Only || r.menu.some((item) => (item.studentDiscountPrice || item.price) <= 10);

      // Fast delivery: prep time contains 10-15 or 12-18
      const matchesFast = !fastDeliveryOnly || r.prepTime.includes('10') || r.prepTime.includes('12') || r.prepTime.includes('15');

      // Free delivery
      const matchesFreeDelivery = !freeCampusDeliveryOnly || r.deliveryFee === 0;

      return matchesSearch && matchesCategory && matchesBudget && matchesFast && matchesFreeDelivery;
    });
  }, [restaurants, searchQuery, selectedCategory, budgetUnder10Only, fastDeliveryOnly, freeCampusDeliveryOnly]);

  const handleApplyHeroPromo = () => {
    applyPromoCode('CAMPUS50');
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  // Recent delivered orders for quick re-order
  const recentOrders = useMemo(() => {
    return orders.slice(0, 2);
  }, [orders]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Student Context Intro & Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <GraduationCap className="w-4 h-4" />
            <span>Campus Live Deliveries</span>
            <span aria-hidden="true" className="text-neutral-400">·</span>
            <span className="text-neutral-500 dark:text-neutral-400 font-normal">Semester Pass Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Fuel your session, fast.
          </h1>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search smash burgers, spicy ramen, street tacos..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Featured Student Flash Promo Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 dark:from-neutral-900 dark:via-neutral-950 dark:to-black text-white p-5 border border-neutral-800 shadow-md">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Exclusive Flash Deal</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              50% Off First Campus Order
            </h2>
            <p className="text-xs text-neutral-300 max-w-sm">
              Use code <span className="font-mono font-bold text-orange-300">CAMPUS50</span> at checkout for half-off your study squad meal.
            </p>
          </div>
          <button
            type="button"
            onClick={handleApplyHeroPromo}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/30 whitespace-nowrap active:scale-95"
          >
            {promoCopied || appliedPromo === 'CAMPUS50' ? '✓ Promo Applied' : 'Claim 50% Off'}
          </button>
        </div>
      </div>

      {/* Quick Re-order Card (If past orders exist) */}
      {recentOrders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3 text-orange-500" />
              <span>Quick Re-order Favorites</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentOrders.map((pastOrder) => (
              <div
                key={pastOrder.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-sm hover:border-orange-500/40 transition-colors"
              >
                <div className="truncate">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {pastOrder.restaurantName}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {pastOrder.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                  </p>
                  <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1 tabular-nums">
                    ${pastOrder.total.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => reorderPastOrder(pastOrder)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors shrink-0"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Category Segmented Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Categories
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ergonomic Quick Filter Toggles */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setBudgetUnder10Only((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            budgetUnder10Only
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Tag className="w-3 h-3" />
          <span>Under $10 Student Saver</span>
        </button>

        <button
          type="button"
          onClick={() => setFastDeliveryOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            fastDeliveryOnly
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Under 20 Mins</span>
        </button>

        <button
          type="button"
          onClick={() => setFreeCampusDeliveryOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            freeCampusDeliveryOnly
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <GraduationCap className="w-3 h-3" />
          <span>$0 Campus Pass</span>
        </button>
      </div>

      {/* Restaurant List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Trending Campus Spots
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {filteredRestaurants.length} spots delivering to your dorm right now
            </p>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No spots match your exact filters
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Try resetting the price or speed toggles above.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setBudgetUnder10Only(false);
                setFastDeliveryOnly(false);
                setFreeCampusDeliveryOnly(false);
              }}
              className="mt-3 px-4 py-2 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredRestaurants.map((restaurant) => {
              const isFav = savedFavorites.includes(restaurant.id);

              return (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="group relative cursor-pointer bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Image Container with measured contrast overlay */}
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(restaurant.id);
                      }}
                      aria-label="Save to favorites"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Delivery & Distance Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <span>{restaurant.prepTime}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md font-medium">
                          <span>{restaurant.distance}</span>
                        </span>
                      </div>
                      <span className="font-bold bg-orange-500 px-2 py-0.5 rounded-md text-[11px]">
                        {restaurant.deliveryFee === 0 ? 'FREE Campus Delivery' : `$${restaurant.deliveryFee.toFixed(2)} delivery`}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">
                          {restaurant.name}
                        </h3>
                        {/* Zero-Pill Metadata Line */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          <span>{restaurant.cuisine}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{restaurant.priceRange}</span>
                        </div>
                      </div>

                      {/* Rating Score */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="tabular-nums">{restaurant.rating}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">({restaurant.reviewCount})</span>
                      </div>
                    </div>

                    {/* Student Discount Notice */}
                    {restaurant.studentDiscountNotice && (
                      <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 flex items-center justify-between text-xs text-orange-800 dark:text-orange-300">
                        <div className="flex items-center gap-1.5 truncate">
                          <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate font-medium">{restaurant.studentDiscountNotice}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
