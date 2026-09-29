import React, { useState } from 'react';
import {
  ReceiptText,
  RotateCcw,
  Star,
  FileText,
  CheckCircle2,
  Calendar,
  X,
  Copy,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const OrderHistoryView: React.FC = () => {
  const { orders, reorderPastOrder, updateOrderRating, setActiveTab } = useApp();

  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [selectedRatingStars, setSelectedRatingStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [receiptCopied, setReceiptCopied] = useState(false);

  const reviewTagOptions = [
    'Super fast delivery',
    'Still steaming hot',
    'Followed dorm note',
    'Polite courier',
    'Eco packaging',
    'Generous portion',
  ];

  const handleOpenRating = (order: Order) => {
    setRatingOrder(order);
    setSelectedRatingStars(order.rating || 5);
    setSelectedTags(order.reviewFeedback || []);
  };

  const handleSaveRating = () => {
    if (!ratingOrder) return;
    updateOrderRating(ratingOrder.id, selectedRatingStars, selectedTags);
    setRatingOrder(null);
  };

  const toggleReviewTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCopyReceipt = (order: Order) => {
    const lines = [
      `QuickBite Digital Receipt - Order ${order.id}`,
      `Date: ${order.createdAt}`,
      `Spot: ${order.restaurantName}`,
      `Address: ${order.deliveryAddress}`,
      `---------------------------------`,
      ...order.items.map((i) => `${i.quantity}x ${i.item.name} - $${(i.itemTotal * i.quantity).toFixed(2)}`),
      `Subtotal: $${order.subtotal.toFixed(2)}`,
      `Discount: -$${order.studentDiscount.toFixed(2)}`,
      `Delivery: $${order.deliveryFee.toFixed(2)}`,
      `Courier Tip: $${order.tip.toFixed(2)}`,
      `TOTAL: $${order.total.toFixed(2)}`,
      `Payment: ${order.paymentDetails.method.toUpperCase()}`,
    ].join('\n');

    try {
      navigator.clipboard.writeText(lines);
      setReceiptCopied(true);
      setTimeout(() => setReceiptCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (orders.length === 0) {
    return (
      <div className="pb-28 pt-10 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <ReceiptText className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            No past orders yet
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Your receipts, re-order shortcuts, and student meal history will appear here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md"
        >
          Discover Food
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Order Receipts & History
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {orders.length} campus meals logged · Instant tax invoices & re-orders
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-3.5">
        {orders.map((order) => {
          const isDelivered = order.status === 'delivered';

          return (
            <div
              key={order.id}
              className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {order.restaurantName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 animate-pulse'
                      }`}
                    >
                      {isDelivered ? 'Delivered' : 'Live Tracking'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{order.createdAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-neutral-500">#{order.id}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                    ${order.total.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-2xl space-y-1">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">
                      {i.quantity}x {i.item.name}
                    </span>
                    <span className="font-mono text-neutral-400 shrink-0 tabular-nums">
                      ${(i.itemTotal * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptOrder(order)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-500" />
                    <span>Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRating(order)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        order.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                      }`}
                    />
                    <span>{order.rating ? `${order.rating}★ Rated` : 'Rate'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => reorderPastOrder(order)}
                  className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <ReceiptText className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Digital Tax Receipt
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Invoice #{selectedReceiptOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Merchant</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {selectedReceiptOrder.restaurantName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {selectedReceiptOrder.createdAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Destination</span>
                  <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">
                    {selectedReceiptOrder.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment</span>
                  <span className="font-mono uppercase text-neutral-900 dark:text-white font-semibold">
                    {selectedReceiptOrder.paymentDetails.method.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1.5 pt-1">
                {selectedReceiptOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span>{i.quantity}x {i.item.name}</span>
                    <span className="font-mono tabular-nums">${(i.itemTotal * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Calculation */}
              <div className="pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-1">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">${selectedReceiptOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedReceiptOrder.studentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Student Discount</span>
                    <span className="font-mono tabular-nums">-${selectedReceiptOrder.studentDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery & Campus Fee</span>
                  <span className="font-mono tabular-nums">
                    ${(selectedReceiptOrder.deliveryFee + selectedReceiptOrder.platformFee).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Courier Tip</span>
                  <span className="font-mono tabular-nums">${selectedReceiptOrder.tip.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between font-bold text-sm text-neutral-900 dark:text-white">
                  <span>Total Paid</span>
                  <span className="font-mono text-orange-600 dark:text-orange-400 tabular-nums">
                    ${selectedReceiptOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Modal Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyReceipt(selectedReceiptOrder)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-orange-500" />
                <span>{receiptCopied ? 'Copied Receipt!' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate & Review Modal */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Rate Your Experience
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {ratingOrder.restaurantName} · Courier: {ratingOrder.courier.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Stars */}
            <div className="py-2 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRatingStars(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= selectedRatingStars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Feedback Tags */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                What went great?
              </span>
              <div className="flex flex-wrap gap-1.5">
                {reviewTagOptions.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleReviewTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveRating}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md active:scale-98"
              >
                Submit Rating & Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
