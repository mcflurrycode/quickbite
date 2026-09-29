import React, { useState } from 'react';
import { Users, X, Check, Copy, Share2, Sparkles } from 'lucide-react';
import { SplitMember } from '../../types';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmSplit: (members: SplitMember[]) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirmSplit,
}) => {
  const [splitCount, setSplitCount] = useState<number>(3);
  const [members, setMembers] = useState<string[]>([
    'Me (Organizer)',
    'Liam (Roommate A)',
    'Sarah (Study Buddy)',
  ]);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const perPerson = totalAmount / splitCount;

  const handleCountChange = (count: number) => {
    setSplitCount(count);
    const defaultNames = ['Me (Organizer)', 'Roommate 1', 'Roommate 2', 'Roommate 3', 'Roommate 4'];
    setMembers(defaultNames.slice(0, count));
  };

  const handleNameChange = (index: number, newName: string) => {
    const next = [...members];
    next[index] = newName;
    setMembers(next);
  };

  const handleCopyRequest = () => {
    const text = `QuickBite Roommate Split: Hey guys! Total order is $${totalAmount.toFixed(
      2
    )}. Your share is $${perPerson.toFixed(2)} each. Send via Venmo/Apple Cash: @student-eats`;
    try {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveAndApply = () => {
    const splitMemberList: SplitMember[] = members.map((name, idx) => ({
      id: `member-${idx}`,
      name,
      share: perPerson,
      hasPaid: idx === 0, // Organizer marks as paid
    }));
    onConfirmSplit(splitMemberList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Split Order with Roommates
              </h3>
              <p className="text-[11px] text-neutral-500">
                Divide subtotal, tip & fees equally
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Per-Person Card */}
        <div className="p-4 rounded-2xl bg-neutral-950 text-white dark:bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
              Each Person Pays
            </span>
            <div className="text-2xl font-black text-orange-400 font-mono tabular-nums">
              ${perPerson.toFixed(2)}
            </div>
          </div>
          <div className="text-right text-xs text-neutral-400">
            <div>Order Total</div>
            <div className="font-mono text-white font-bold tabular-nums">
              ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Member Count Selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Number of Friends / Roommates
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleCountChange(cnt)}
                className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                  splitCount === cnt
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {cnt} People
              </button>
            ))}
          </div>
        </div>

        {/* Member Name List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {members.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-400 w-5">
                0{i + 1}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                ${perPerson.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleCopyRequest}
            className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-2"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Venmo Split Request Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-orange-500" />
                <span>Copy Split Payment Request to Group Chat</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="w-full py-3 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Apply Split to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};
