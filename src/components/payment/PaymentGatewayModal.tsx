import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  X,
  Smartphone,
  ChevronRight,
  Fingerprint,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethodType, PaymentDetails, SplitMember } from '../../types';
import { useApp } from '../../context/AppContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  tip: number;
  splitMembers?: SplitMember[];
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  discount,
  deliveryFee,
  platformFee,
  tip,
  splitMembers,
}) => {
  const { placeOrder, campusCardBalance } = useApp();

  const totalAmount = Math.max(0, subtotal - discount + deliveryFee + platformFee + tip);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('apple_pay');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');
  const [cardholderName, setCardholderName] = useState('Alex Rivers');

  // Security processing state (simulating 3D Secure bank validation)
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'biometric' | '3ds' | 'success'>('idle');

  if (!isOpen) return null;

  const handleAuthorizePayment = () => {
    setIsAuthorizing(true);
    setAuthStep('biometric');

    // Simulate 3D Secure Bank authentication steps
    setTimeout(() => {
      setAuthStep('3ds');
      setTimeout(() => {
        setAuthStep('success');

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF5722', '#10B981', '#3B82F6', '#F59E0B'],
          });
        } catch {
          // ignore
        }

        setTimeout(() => {
          const paymentDetails: PaymentDetails = {
            method: selectedMethod,
            cardLast4: selectedMethod === 'credit_card' ? '8821' : undefined,
            campusCardId: selectedMethod === 'campus_card' ? 'CAMPUS-99410' : undefined,
            campusBalanceRemaining:
              selectedMethod === 'campus_card'
                ? Math.max(0, campusCardBalance - totalAmount)
                : campusCardBalance,
          };

          placeOrder(paymentDetails, tip, splitMembers);
          setIsAuthorizing(false);
          setAuthStep('idle');
          onClose();
        }, 1200);
      }, 1000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-950 rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        {/* Header with PCI-DSS & 256-Bit SSL Security Badge */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                <span>Secure Checkout Gateway</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                End-to-end tokenized & PCI-DSS Level 1 Encrypted
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAuthorizing}
            className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Order Total Display */}
          <div className="p-4 rounded-2xl bg-neutral-950 text-white dark:bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Payment Authorized
              </span>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                ${totalAmount.toFixed(2)}
              </div>
              {splitMembers && splitMembers.length > 0 && (
                <div className="text-[11px] text-orange-400 mt-0.5">
                  Split between {splitMembers.length} roommates (${(totalAmount / splitMembers.length).toFixed(2)} each)
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Liability Protection</span>
              </div>
              <span className="text-[10px] text-neutral-400">Instant Digital Receipt</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Select Payment Method
            </span>

            <div className="space-y-2">
              {/* Option 1: Apple Pay / Google Pay */}
              <button
                type="button"
                onClick={() => setSelectedMethod('apple_pay')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedMethod === 'apple_pay'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Apple Pay / Google Pay</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                        1-Tap Touch ID
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Default card ending in ••8821
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'apple_pay' ? 'border-orange-500 bg-orange-500' : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  {selectedMethod === 'apple_pay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              {/* Option 2: Campus Student Meal Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('campus_card')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedMethod === 'campus_card'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Campus Dining Flex Card</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                        Student ID
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Available Flex Balance: <strong className="font-mono text-neutral-800 dark:text-neutral-200">${campusCardBalance.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'campus_card' ? 'border-orange-500 bg-orange-500' : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  {selectedMethod === 'campus_card' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              {/* Option 3: Credit / Debit Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('credit_card')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedMethod === 'credit_card'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      Credit or Debit Card
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Visa, Mastercard, Amex, Discover
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'credit_card' ? 'border-orange-500 bg-orange-500' : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  {selectedMethod === 'credit_card' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              {/* Option 4: Klarna Pay in 4 */}
              <button
                type="button"
                onClick={() => setSelectedMethod('klarna')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  selectedMethod === 'klarna'
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-extrabold text-xs">
                    Klarna
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      Klarna: 4 interest-free payments
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      ${(totalAmount / 4).toFixed(2)} every 2 weeks · 0% APR
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'klarna' ? 'border-orange-500 bg-orange-500' : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  {selectedMethod === 'klarna' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>

          {/* If Credit Card is selected, display interactive card details input */}
          {selectedMethod === 'credit_card' && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase">Cardholder Name</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase">Card Number</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold text-neutral-400">
                    VISA
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase">CVV / CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900/60 p-3 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              Your transaction is secured with bank-grade AES 256 encryption. Card details are never stored on device.
            </span>
          </div>
        </div>

        {/* Footer CTA & 3DS Biometric Authorizer Modal */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <button
            type="button"
            onClick={handleAuthorizePayment}
            disabled={isAuthorizing}
            className="w-full h-13 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isAuthorizing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  {authStep === 'biometric' && 'Scanning Face ID / Biometrics...'}
                  {authStep === '3ds' && 'Validating with 3D Secure 2.0...'}
                  {authStep === 'success' && 'Payment Verified!'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Authorize & Pay ${totalAmount.toFixed(2)}</span>
              </div>
            )}
          </button>
        </div>

        {/* Real-time 3D Secure Overlay Modal */}
        {isAuthorizing && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white text-center space-y-4 animate-in fade-in duration-200">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center text-orange-400">
                {authStep === 'biometric' ? (
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold">
                {authStep === 'biometric' && 'Authenticating Biometrics'}
                {authStep === '3ds' && '3D Secure Token Verification'}
                {authStep === 'success' && 'Payment Authorized!'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs">
                {authStep === 'biometric' && 'Connecting to secure hardware enclave...'}
                {authStep === '3ds' && 'Issuing bank confirmed zero fraud risk.'}
                {authStep === 'success' && 'Dispatching your order to the kitchen!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
