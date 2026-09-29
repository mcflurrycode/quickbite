import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Users,
  Check,
  Utensils,
  Share2,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SplitMember } from '../../types';
import { SplitBillModal } from './SplitBillModal';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';

export const CartView: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    appliedPromo,
    promoDiscountAmount,
    applyPromoCode,
    removePromoCode,
    setActiveTab,
    exportCartShareUrl,
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [includeUtensils, setIncludeUtensils] = useState(true);
  const [selectedTip, setSelectedTip] = useState<number>(2.0);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [splitMembers, setSplitMembers] = useState<SplitMember[] | undefined>(undefined);
  const [copiedShare, setCopiedShare] = useState(false);

  // Delivery and platform fees
  const deliveryFee = cart[0]?.restaurantId === 'taco-fiesta-california' ? 1.49 : 0.0;
  const platformFee = 0.99;
  const finalTotal = Math.max(0, cartSubtotal - promoDiscountAmount + deliveryFee + platformFee + selectedTip);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleShareCart = () => {
    exportCartShareUrl();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="pb-28 pt-10 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Your tray is currently empty
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Ready for a study break or late night cravings? Explore student spots with $0 campus delivery.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
        >
          Explore Campus Food
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-4 px-4 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Your Meal Tray
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Ordering from <strong className="text-neutral-900 dark:text-white">{cart[0]?.restaurantName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareCart}
            title="Share cart with friends"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">{copiedShare ? 'Copied!' : 'Share Cart'}</span>
          </button>
          <button
            type="button"
            onClick={clearCart}
            title="Clear entire cart"
            className="p-2 rounded-xl text-neutral-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((cartItem) => (
          <div
            key={cartItem.cartItemId}
            className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between gap-3"
          >
            <div className="space-y-1 flex-1">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                {cartItem.item.name}
              </h3>

              {/* Selected Options */}
              <div className="text-[11px] text-neutral-500 space-y-0.5">
                {cartItem.selectedOptions.size && (
                  <div>Size: {cartItem.selectedOptions.size}</div>
                )}
                {cartItem.selectedOptions.spiceLevel && (
                  <div>Spice: {cartItem.selectedOptions.spiceLevel}</div>
                )}
                {cartItem.selectedOptions.addOns && cartItem.selectedOptions.addOns.length > 0 && (
                  <div>Add-ons: {cartItem.selectedOptions.addOns.join(', ')}</div>
                )}
                {cartItem.selectedOptions.specialInstructions && (
                  <div className="italic text-neutral-400">
                    "{cartItem.selectedOptions.specialInstructions}"
                  </div>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 pt-1">
                ${(cartItem.itemTotal * cartItem.quantity).toFixed(2)}
                <span className="text-[10px] text-neutral-400 font-normal ml-1">
                  (${cartItem.itemTotal.toFixed(2)} each)
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/80 px-2 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 shrink-0">
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white w-4 text-center">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roommate Split Bill Feature Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              {splitMembers ? `Split Active (${splitMembers.length} People)` : 'Split Bill with Roommates'}
            </div>
            <p className="text-[11px] text-neutral-500">
              {splitMembers
                ? `$${(finalTotal / splitMembers.length).toFixed(2)} / each · Venmo link ready`
                : 'Calculate per-person cost & share request'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSplitModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white shadow-sm hover:border-orange-500/50"
        >
          {splitMembers ? 'Edit Split' : 'Split Now'}
        </button>
      </div>

      {/* Promo Code Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            <span>Campus Discounts & Promo Codes</span>
          </div>
          {appliedPromo && (
            <button
              type="button"
              onClick={removePromoCode}
              className="text-[11px] text-red-500 hover:underline font-medium"
            >
              Remove
            </button>
          )}
        </div>

        {appliedPromo ? (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>
                Code <strong>{appliedPromo}</strong> applied: -${promoDiscountAmount.toFixed(2)}
              </span>
            </div>
            <span className="font-bold text-[11px] bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
              Active
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo (e.g. CAMPUS50)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-bold hover:opacity-90"
              >
                Apply
              </button>
            </div>

            {promoMessage && (
              <p
                className={`text-[11px] ${
                  promoMessage.isError ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {promoMessage.text}
              </p>
            )}

            {/* Quick Promo Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-400">Try:</span>
              <button
                type="button"
                onClick={() => applyPromoCode('CAMPUS50')}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-500"
              >
                CAMPUS50
              </button>
              <button
                type="button"
                onClick={() => applyPromoCode('LATESTUDY')}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-500"
              >
                LATESTUDY
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Utensils & Eco Options */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-medium text-neutral-900 dark:text-white">
            Include bamboo cutlery & paper napkins
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIncludeUtensils((prev) => !prev)}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            includeUtensils ? 'bg-orange-500' : 'bg-neutral-300 dark:bg-neutral-700'
          }`}
        >
          <span
            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
              includeUtensils ? 'left-5' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Courier Tip Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            Support Campus Student Rider
          </span>
          <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
            ${selectedTip.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 5].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSelectedTip(amt)}
              className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedTip === amt
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {amt === 0 ? 'None' : `$${amt}`}
            </button>
          ))}
        </div>
      </div>

      {/* Itemized Price Summary */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Meal Subtotal</span>
          <span className="font-mono tabular-nums">${cartSubtotal.toFixed(2)}</span>
        </div>

        {promoDiscountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Student Promo Savings</span>
            <span className="font-mono tabular-nums">-${promoDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Campus Courier Delivery</span>
          <span className="font-mono tabular-nums">
            {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Platform & Campus Security Fee</span>
          <span className="font-mono tabular-nums">${platformFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Rider Tip</span>
          <span className="font-mono tabular-nums">${selectedTip.toFixed(2)}</span>
        </div>

        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
          <span>Total Authorized</span>
          <span className="font-mono text-base text-orange-600 dark:text-orange-400 tabular-nums">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Sticky Bottom Checkout CTA */}
      <div className="fixed bottom-18 left-4 right-4 max-w-md mx-auto z-30">
        <button
          type="button"
          onClick={() => setIsPaymentGatewayOpen(true)}
          className="w-full h-13 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-between px-5 shadow-xl shadow-orange-500/25 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <span>Proceed to Secure Payment</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>${finalTotal.toFixed(2)}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Roommate Split Modal */}
      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalAmount={finalTotal}
        onConfirmSplit={(members) => setSplitMembers(members)}
      />

      {/* Secure Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        subtotal={cartSubtotal}
        discount={promoDiscountAmount}
        deliveryFee={deliveryFee}
        platformFee={platformFee}
        tip={selectedTip}
        splitMembers={splitMembers}
      />
    </div>
  );
};
